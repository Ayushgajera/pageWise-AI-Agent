import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { askAgent, createDocumentJob, getDocumentJob, processDocumentJob } from "./agent";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import crypto from "crypto";

// Simple rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];


  const validRequests = userRequests.filter(
    (time: number) => now - time < RATE_LIMIT_WINDOW
  );

  if (validRequests.length >= MAX_REQUESTS) {
    return false;
  }

  validRequests.push(now);
  rateLimit.set(ip, validRequests);
  return true;
};


dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Missing required Cloudinary environment variables");
  process.exit(1);
}

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());


const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const buildSafePublicId = (fileName: string) => {
  const baseName = fileName.replace(/\.pdf$/i, "").trim();
  return baseName
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const uploadBufferToCloudinary = (buffer: Buffer, fileName: string) =>
  new Promise<{ secure_url?: string; bytes?: number }>((resolve, reject) => {
    const publicId = buildSafePublicId(fileName) || `pdf-${Date.now()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pagewise-pdfs",
        resource_type: "raw",
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({ secure_url: result?.secure_url, bytes: result?.bytes });
      }
    );

    Readable.from(buffer).pipe(stream);
  });


app.post(
  "/upload",
  upload.single("pdf"),
  async (req: MulterRequest, res: Response) => {
    const clientIp = req.ip || req.connection.remoteAddress || "unknown";

    if (!checkRateLimit(clientIp)) {
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No PDF file uploaded or an internal error occurred" });
    }

    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const docId = crypto.randomUUID();

    try {
      console.log("Processing PDF:", fileName);
      createDocumentJob(docId, fileName);


      if (!req.file.mimetype.includes("pdf")) {
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }

      
      console.log("📤 Uploading to Cloudinary...");
      const uploadResponse = await uploadBufferToCloudinary(fileBuffer, fileName);

      void processDocumentJob(docId, fileBuffer, fileName).catch((error) => {
        console.error(`Background indexing failed for ${docId}:`, error);
      });

      if (!uploadResponse.secure_url) {
        throw new Error("Cloudinary upload failed - no secure URL returned");
      }

      console.log("✅ Cloudinary upload successful:", uploadResponse.secure_url);
      console.log("📊 File size in Cloudinary:", uploadResponse.bytes, "bytes");

      console.log("Agent initialized successfully");

      console.log("🎉 PDF processing completed successfully!");
      console.log("📋 Summary:");
      console.log("   - Cloudinary upload: ✅");
      console.log("   - Agent initialized: ✅");
      console.log("   - File stored at:", uploadResponse.secure_url);

      res.json({
        docId,
        status: getDocumentJob(docId)?.status ?? "processing",
        message: "PDF uploaded to Cloudinary and indexing started",
        url: uploadResponse.secure_url,
      });
    } catch (err) {
      console.error("Error during PDF processing or upload:", err);

      let errorMessage = "Failed to process PDF";
      const processingErrorMessage =
        err instanceof Error ? err.message : String(err);

      if (
        processingErrorMessage.includes("corrupted") ||
        processingErrorMessage.includes("invalid structure")
      ) {
        errorMessage =
          "The PDF file appears to be corrupted or has an invalid structure. Please try uploading a different PDF file.";
      } else if (processingErrorMessage.includes("No text could be extracted")) {
        errorMessage =
          "No text could be extracted from the PDF. The file might be empty, corrupted, or contain only images.";
      } else if (processingErrorMessage.includes("GEMINI_API_KEY")) {
        errorMessage = "AI service configuration error. Please contact support.";
      } else if (processingErrorMessage.includes("Cloudinary")) {
        errorMessage =
          "Failed to upload the file to our storage service. Please try again.";
      }

      res.status(500).json({ error: errorMessage });
    }
  }
);


app.post("/ask", async (req: Request, res: Response) => {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";

  if (!checkRateLimit(clientIp)) {
    return res
      .status(429)
      .json({ error: "Rate limit exceeded. Please try again later." });
  }
  try {
    const { question, docId } = req.body;
    if (!question)
      return res.status(400).json({ error: "Question is required" });

    if (!docId) {
      return res.status(400).json({ error: "Document id is required" });
    }

    const answer = await askAgent(docId, question);
    res.json({ answer });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (errorMessage.includes("processing")) {
      return res.status(409).json({ error: errorMessage });
    }

    console.error("Ask error:", err);
    res.status(500).json({ error: errorMessage || "Failed to get answer" });
  }
});

app.get("/status/:docId", (req: Request, res: Response) => {
  const job = getDocumentJob(req.params.docId);

  if (!job) {
    return res.status(404).json({ status: "missing" });
  }

  return res.json({
    status: job.status,
    fileName: job.fileName,
    error: job.error,
  });
});


const frontendDistPath = path.join(__dirname, "../../pdf-ai-frontend/dist");
app.use(express.static(frontendDistPath));


app.use((req: Request, res: Response) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});


app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});