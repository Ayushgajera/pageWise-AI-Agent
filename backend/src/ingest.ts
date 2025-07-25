import fs from "fs";
import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from "dotenv";

dotenv.config();

export const loadPdf = async (path: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(path);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
};

export const embedPdf = async (pdfPath: string) => {
  const text = await loadPdf(pdfPath);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const chunks = await splitter.createDocuments([text]);

  const vectorStore = await MemoryVectorStore.fromDocuments(
    chunks,
    new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!,
      model: "embedding-001",
    })
  );

  return vectorStore;
};
