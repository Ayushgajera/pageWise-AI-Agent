import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { embedPdfBuffer } from "./ingest";
import { PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";

dotenv.config();

let chatModelPromise: Promise<ChatGoogleGenerativeAI> | null = null;

type DocumentStatus = "processing" | "ready" | "error";

type DocumentJob = {
  status: DocumentStatus;
  retriever?: any;
  error?: string;
  fileName?: string;
};

const documentJobs = new Map<string, DocumentJob>();

const CHAT_MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-pro",
];

const buildChatModel = async () => {
  const configuredModel = process.env.GEMINI_CHAT_MODEL;
  const candidateModels = [
    ...(configuredModel ? [configuredModel] : []),
    ...CHAT_MODEL_FALLBACKS.filter((model) => model !== configuredModel),
  ];

  let lastError: unknown;

  for (const modelName of candidateModels) {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
      model: modelName,
      temperature: 0,
    });

    try {
      console.log(`✅ Gemini chat model ready: ${modelName}`);
      return model;
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Gemini chat model failed: ${modelName} -> ${errorMessage}`);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to initialize any Gemini chat model");
};

const getChatModel = async () => {
  if (!chatModelPromise) {
    chatModelPromise = buildChatModel();
  }

  return chatModelPromise;
};

const SALARY_PROMPT = PromptTemplate.fromTemplate(`
You are a resume analysis assistant.

Use ONLY the provided resume context to answer the user's question.
Never apologize or refuse when the user asks about salary, expected salary, compensation, CTC, package, or pay.
Give the most useful best-effort answer based on the resume evidence.

Response format:
1. Start with a short direct answer in 1-2 lines.
2. Add a "Key points" section with bullet points.
3. If salary is asked, include:
  - estimated salary range
  - likely negotiation range
  - one short reason
4. If helpful, add a "Why this estimate" or "Notes" section.
5. End with exactly one engaging follow-up question the user can ask next.
6. Write that final line exactly as: "Next question: ..."

Style rules:
- Keep the response clean, structured, and easy to scan.
- Use markdown headings and bullet points.
- If the answer is uncertain, say so briefly and still provide a practical estimate.
- Keep the tone helpful, confident, and human.

Resume context:
{context}

Question:
{question}

Answer using markdown with clear sections.
`);

export const initAgent = async (pdfBuffer: Buffer) => {
  await getChatModel();

  const vectorstore = await embedPdfBuffer(pdfBuffer);
  return vectorstore.asRetriever({ k: 4 });
};

export const createDocumentJob = (docId: string, fileName?: string) => {
  documentJobs.set(docId, {
    status: "processing",
    fileName,
  });
};

export const getDocumentJob = (docId: string) => documentJobs.get(docId);

export const processDocumentJob = async (
  docId: string,
  pdfBuffer: Buffer,
  fileName?: string
) => {
  createDocumentJob(docId, fileName);

  try {
    const retriever = await initAgent(pdfBuffer);
    documentJobs.set(docId, {
      status: "ready",
      retriever,
      fileName,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    documentJobs.set(docId, {
      status: "error",
      error: errorMessage,
      fileName,
    });
    throw error;
  }
};

export const askAgent = async (docId: string, question: string): Promise<string> => {
  const job = documentJobs.get(docId);

  if (!job) {
    throw new Error("Document session not found. Upload the PDF again.");
  }

  if (job.status === "processing") {
    throw new Error("Document is still processing. Please try again in a moment.");
  }

  if (job.status === "error") {
    throw new Error(job.error ?? "Document processing failed.");
  }

  if (!job.retriever) {
    throw new Error("Retriever not ready for this document.");
  }

  const model = await getChatModel();
  const docs = (await job.retriever.invoke(question)) as Array<{
    pageContent: string;
  }>;
  const context = docs
    .map((doc, index) => `[#${index + 1}] ${doc.pageContent}`)
    .join("\n\n");

  const prompt = await SALARY_PROMPT.format({
    context,
    question,
  });

  const response = await model.invoke(prompt);
  return typeof response.content === "string" ? response.content : String(response.content);
};
