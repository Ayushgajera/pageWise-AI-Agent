import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { initAgent, askAgent } from "./agent"; 

dotenv.config();

const app = express();
const port = 3000;


app.use(cors()); 
app.use(express.json());


const _dirname1 = path.resolve();
app.use(express.static(path.join(_dirname1, "../pdf-ai-frontend/dist"))); // or build

// app.get("/*", (req, res) => {
//   res.sendFile(path.join(_dirname1, "../pdf-ai-frontend/dist/index.html"));
// });


const upload = multer({ dest: "uploads/" });


interface MulterRequest extends Request {
  file?: Express.Multer.File;
}


app.post("/upload", upload.single("pdf"), async (req: MulterRequest, res: Response) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ error: "No file uploaded" });

    await initAgent(filePath);
    res.json({ message: "PDF uploaded and agent initialized" });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Failed to process PDF" });
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


app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
