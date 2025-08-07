import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { initAgent, askAgent } from "./agent";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import util from "util";

// Simple rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];

  // Remove old requests outside the window
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

// Load env before using
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Validate required environment variables
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

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

// Use disk storage for multer
const upload = multer({ dest: uploadsDir });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Upload API
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

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
      console.log("Processing PDF:", fileName);
      console.log("Local file path:", filePath);

      // Validate file type
      if (!req.file.mimetype.includes("pdf")) {
        // Clean up the file immediately if it's the wrong type
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }

      // First, upload to Cloudinary
      console.log("📤 Uploading to Cloudinary...");
      const uploadResponse = await cloudinary.uploader.upload(filePath, {
        folder: "pagewise-pdfs",
        resource_type: "raw", // for PDFs
        public_id: fileName.replace(/\.pdf$/, ""),
      });

      if (!uploadResponse.secure_url) {
        throw new Error("Cloudinary upload failed - no secure URL returned");
      }

      console.log("✅ Cloudinary upload successful:", uploadResponse.secure_url);
      console.log("📊 File size in Cloudinary:", uploadResponse.bytes, "bytes");

      // Now, initialize the agent with the local PDF
      console.log("Initializing agent with local PDF...");
      await initAgent(filePath);
      console.log("Agent initialized successfully");

      console.log("🎉 PDF processing completed successfully!");
      console.log("📋 Summary:");
      console.log("   - Cloudinary upload: ✅");
      console.log("   - Agent initialized: ✅");
      console.log("   - File stored at:", uploadResponse.secure_url);

      res.json({
        message: "PDF uploaded to Cloudinary and agent initialized",
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
    } finally {
      // This block is guaranteed to run, whether an error occurred or not.
      // It ensures the local file is always deleted after processing.
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Local temporary file deleted: ${filePath}`);
        } catch (cleanupErr) {
          console.error(
            `❌ Failed to delete local file ${filePath}:`,
            cleanupErr
          );
        }
      }
    }
  }
);

// Ask API
app.post("/ask", async (req: Request, res: Response) => {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";

  if (!checkRateLimit(clientIp)) {
    return res
      .status(429)
      .json({ error: "Rate limit exceeded. Please try again later." });
  }
  try {
    const { question } = req.body;
    if (!question)
      return res.status(400).json({ error: "Question is required" });

    const answer = await askAgent(question);
    res.json({ answer });
  } catch (err) {
    console.error("Ask error:", err);
    res.status(500).json({ error: "Failed to get answer" });
  }
});

// Serve frontend
const frontendDistPath = path.join(__dirname, "../../pdf-ai-frontend/dist");
app.use(express.static(frontendDistPath));

// Catch-all route
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Cleanup function for old temporary files
const cleanupOldFiles = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return; // Directory doesn't exist, nothing to clean
    }

    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    let cleanedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      try {
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🧹 Cleaned up old file: ${file}`);
          cleanedCount++;
        }
      } catch (fileErr) {
        console.warn(`Error processing file ${file}:`, fileErr);
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Cleanup completed: ${cleanedCount} files removed`);
    }
  } catch (err) {
    console.warn("Error during cleanup:", err);
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupOldFiles, 10 * 60 * 1000);

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
  console.log(`📁 Uploads directory: ${path.resolve(uploadsDir)}`);
});