import fs from "fs";
import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from "dotenv";

dotenv.config();

export const loadPdf = async (path: string): Promise<string> => {
  try {
    // Check if path is a URL or local file
    if (path.startsWith('http://') || path.startsWith('https://')) {
      // Handle URL - download the file first
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Validate PDF header
      if (!isValidPdf(buffer)) {
        throw new Error("Invalid PDF file format");
      }
      
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } else {
      // Handle local file
      if (!fs.existsSync(path)) {
        throw new Error(`PDF file not found: ${path}`);
      }
      
      const dataBuffer = fs.readFileSync(path);
      
      // Validate PDF header
      if (!isValidPdf(dataBuffer)) {
        throw new Error("Invalid PDF file format");
      }
      
      // Try to parse with different options for corrupted PDFs
      try {
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text;
      } catch (parseError) {
        console.warn("First parsing attempt failed, trying with relaxed options...");
        
        // Try with relaxed parsing options
        const pdfData = await pdfParse(dataBuffer, {
          max: 0, // No page limit
          version: 'v2.0.550'
        });
        return pdfData.text;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('bad XRef entry') || errorMessage.includes('FormatError')) {
      throw new Error("PDF file is corrupted or has an invalid structure. Please try uploading a different PDF file.");
    }
    throw error;
  }
};

export const loadPdfFromBuffer = async (buffer: Buffer): Promise<string> => {
  if (!isValidPdf(buffer)) {
    throw new Error("Invalid PDF file format");
  }

  try {
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  } catch (parseError) {
    console.warn("First parsing attempt failed, trying with relaxed options...");

    const pdfData = await pdfParse(buffer, {
      max: 0,
      version: "v2.0.550",
    });
    return pdfData.text;
  }
};

// Helper function to validate PDF format
const isValidPdf = (buffer: Buffer): boolean => {
  try {
    // Check for PDF header signature
    const header = buffer.toString('ascii', 0, 8);
    if (!header.startsWith('%PDF-')) {
      return false;
    }
    
    // Check for PDF trailer
    const trailer = buffer.toString('ascii', buffer.length - 1024);
    if (!trailer.includes('%%EOF')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const embedPdf = async (pdfPath: string) => {
  try {
    const text = await loadPdf(pdfPath);
    
    // Check if text was extracted successfully
    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF. The file might be empty, corrupted, or contain only images.");
    }

    console.log(`📄 Extracted ${text.length} characters from PDF`);

    // Optimize chunking for better retrieval
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ". ", "! ", "? ", " ", ""], // Better text splitting
    });

    const chunks = await splitter.createDocuments([text]);
    console.log(`📝 Created ${chunks.length} text chunks`);

    // Validate embeddings API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    const embeddingModel =
      process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

    const vectorStore = await MemoryVectorStore.fromDocuments(
      chunks,
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: embeddingModel,
        maxConcurrency: 5, // Limit concurrent requests
      })
    );

    console.log("✅ PDF successfully embedded into vector store");
    return vectorStore;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error embedding PDF:", errorMessage);
    throw error;
  }
};

export const embedPdfBuffer = async (pdfBuffer: Buffer) => {
  try {
    const text = await loadPdfFromBuffer(pdfBuffer);

    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF. The file might be empty, corrupted, or contain only images.");
    }

    console.log(`📄 Extracted ${text.length} characters from PDF`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
    });

    const chunks = await splitter.createDocuments([text]);
    console.log(`📝 Created ${chunks.length} text chunks`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    const embeddingModel =
      process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

    const vectorStore = await MemoryVectorStore.fromDocuments(
      chunks,
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: embeddingModel,
        maxConcurrency: 5,
      })
    );

    console.log("✅ PDF successfully embedded into vector store");
    return vectorStore;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error embedding PDF:", errorMessage);
    throw error;
  }
};
