# 🧠 AI PDF Q&A Agent with LangChain + Gemini API

A full-stack AI-powered tool that allows users to upload a PDF, ask questions about its content, and get accurate responses using LangChain and Gemini Pro.

---

## 🚀 Features

- 📄 Upload any PDF file
- ❓ Ask questions about the uploaded content
- 🤖 AI-powered answers using Gemini API
- ⚡ Real-time responses via LangChain
- 🎨 Clean UI built with React + Tailwind
- 🧪 Built with TypeScript, Node.js, Express

---

## 🏗️ Project Structure (Page-wise Breakdown)

### 📁 `frontend` – React + Vite + Tailwind

#### 🏠 Home Page
- Simple and clean landing screen
- PDF upload form
- Input field to ask questions
- Dynamic display of AI answers

#### 📄 PDF Upload Component
- Triggered on file selection
- Sends `POST /upload` request to backend
- Shows upload progress and status

#### ❓ Ask Question Component
- Accepts user queries after upload
- Sends `POST /ask` request with question
- Displays loading indicator and response

---

### 📁 `backend` – Express + TypeScript

#### 🔧 `src/index.ts`
- Main server file
- Configures middleware, routes, CORS, and error handling

#### 🗂️ `src/routes/pdf.ts`
- `POST /upload` – Accepts and processes PDF file using Multer
- `POST /ask` – Receives questions, processes PDF context, and responds via Gemini API

#### 🧠 `src/utils/langchain.ts`
- Uses LangChain for:
  - Loading PDF content
  - Chunking text for efficient retrieval
  - Passing context to Gemini API

#### 🔐 `.env`
