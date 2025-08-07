# 🧠 AI PDF Q&A Agent with LangChain + Gemini API

A full-stack AI-powered web application that allows users to upload a PDF, ask questions about its content, and receive real-time answers powered by **Google Gemini Pro** via **LangChain** and **Retrieval-Augmented Generation (RAG)**.

[🌐 Live Demo](https://page-wise-ai-agent-rcle.vercel.app/) | [📦 GitHub Repo](https://lnkd.in/dzx4WZTh)

---

## 🚀 Features

- 📄 Upload any PDF file
- ❓ Ask natural language questions about its content
- 🤖 AI-generated answers using **Gemini Pro API**
- 🔁 Context-aware retrieval with **LangChain + RAG**
- 🧠 Embedding and vector storage via `GoogleGenerativeAIEmbeddings` + `MemoryVectorStore`
- ⚛️ Modern and responsive UI using **React + Tailwind CSS**
- 🛠️ Backend with **Node.js, Express, and TypeScript**
- 🧾 Handles large files, validates input, and cleans up temporary files

---

## 🧱 Tech Stack

### 🖥️ Frontend
- React (Vite)
- Tailwind CSS
- TypeScript

### 🌐 Backend
- Node.js + Express
- TypeScript
- Multer (PDF upload)
- pdf-parse (PDF text extraction)
- LangChain (for RAG pipeline)
- GoogleGenerativeAI (Gemini Pro LLM)

---

## 📦 How It Works

1. **PDF Upload**  
   Users upload a PDF file via the frontend. It's temporarily stored on the server.

2. **Text Extraction**  
   The backend uses `pdf-parse` to extract raw text from the uploaded PDF.

3. **Embedding Generation**  
   The extracted text is split into chunks and passed through `GoogleGenerativeAIEmbeddings` to create embeddings.

4. **Vector Storage**  
   Embeddings are stored in `MemoryVectorStore` (can be replaced with Pinecone or Chroma later).

5. **RAG Pipeline**  
   When a user asks a question, LangChain retrieves relevant chunks from the vector DB and sends them, along with the question, to Gemini Pro.

6. **Answer Generation**  
   Gemini Pro generates an answer using the retrieved context, which is then returned to the user.

7. **Cloudinary Upload (Optional)**  
   PDFs are also uploaded to Cloudinary for long-term storage, and local files are deleted post-upload.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key
- A Cloudinary account (for optional cloud storage)
- pnpm / npm / yarn installed
