import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RetrievalQAChain } from "langchain/chains";
import { embedPdf } from "./ingest";
import * as dotenv from "dotenv";

dotenv.config();

let qaChain: RetrievalQAChain;

export const initAgent = async (pdfPath: string) => {
  const vectorstore = await embedPdf(pdfPath);
  const retriever = vectorstore.asRetriever();

  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-1.5-pro-latest",
    temperature: 0,
  });

  qaChain = RetrievalQAChain.fromLLM(model, retriever);
};

export const askAgent = async (question: string): Promise<string> => {
  if (!qaChain) {
    throw new Error("Agent not initialized. Call initAgent first.");
  }

  const response = await qaChain.invoke({ query: question });
  return response.text;
};
