import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { initAgent, askAgent } from "./agent";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

dotenv.config();

const app = express();
const port = 3000;

// 1. Middleware
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 2. API Routes
app.post("/upload", upload.single("pdf"), async (req: MulterRequest, res: Response) => {
  try {
    const fileBuffer = req.file?.buffer;
    const fileName = req.file?.originalname;

    if (!fileBuffer || !fileName) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to base64 string
    const base64String = fileBuffer.toString("base64");
    const dataUri = `data:application/pdf;base64,${base64String}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: "pagewise-pdfs", // optional folder in Cloudinary
      resource_type: "raw",    // use "raw" for non-image files like PDFs
      public_id: fileName.replace(/\.pdf$/, ""),
    });

    // Send Cloudinary URL to initAgent
    await initAgent(uploadResponse.secure_url);

    res.json({
      message: "PDF uploaded to Cloudinary and agent initialized",
      url: uploadResponse.secure_url,
    });

  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: "Failed to upload PDF to Cloudinary" });
  }
});



app.post("/ask", async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });
    const answer = await askAgent(question);
    res.json({ answer });
  } catch (err) {
    console.error("Ask Error:", err);
    res.status(500).json({ error: "Failed to get answer" });
  }
});

// 3. Frontend Static Files
const frontendDistPath = path.join(__dirname, "../../pdf-ai-frontend/dist");
app.use(express.static(frontendDistPath));

// 4. THE NEW CATCH-ALL: This middleware sends the index.html for any unhandled request.
// This replaces app.get("*", ...) and MUST BE a THE END, right before app.listen.
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// 5. Start Server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});