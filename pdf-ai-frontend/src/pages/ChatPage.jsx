import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FiUploadCloud, FiSend, FiLoader, FiUser, FiCpu, FiFileText, FiTrash2, FiAlertTriangle, FiEdit2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// --- Default questions defined on the frontend ---
const DEFAULT_SUGGESTED_QUESTIONS = [
  "What is the main summary of this document?",
  "List the key takeaways in bullet points.",
  "What is the overall tone of this document?",
  "Who is the intended audience?",
];

// --- Custom Hooks ---
const useChatScroll = (dep) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);
  return ref;
};


// --- UI Components ---

const ChatMessage = ({ message }) => {
  const { sender, text } = message;
  const isUser = sender === 'user';
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-indigo-500' : 'bg-slate-600'}`}>
        {isUser ? <FiUser className="text-white" /> : <FiCpu className="text-white" />}
      </div>
      <div className={`p-3 md:p-4 rounded-2xl max-w-md md:max-w-lg ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
        <article className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </article>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
    <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-600">
            <FiCpu className="text-white" />
        </div>
        <div className="p-4 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
            </motion.div>
        </div>
    </div>
);

const SuggestedQuestions = ({ questions, onQuestionClick }) => (
    <div className="flex flex-col items-start gap-2 pt-4">
        <p className="text-sm text-slate-400 font-medium">Suggested for you:</p>
        <div className="flex flex-wrap gap-2 justify-start">
            {questions.map((q, i) => (
                <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onQuestionClick(q)}
                    className="bg-slate-700 text-slate-200 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-600 transition-colors"
                >
                    {q}
                </motion.button>
            ))}
        </div>
    </div>
);


// --- Main Page Component ---

export default function ChatPage() {
  const [uiState, setUiState] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [docId, setDocId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");


  const chatContainerRef = useChatScroll(chatHistory);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    const formData = new FormData();
    formData.append("pdf", fileToUpload);
    
    setFileName(fileToUpload.name);
    setError("");
    setUiState("processing");

    try {
      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setDocId(res.data.docId);
      setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS); 
      
      setChatHistory([{
        sender: "ai",
        text: `Ready! I've analyzed **${fileToUpload.name}**. What would you like to know?`,
      }]);
      setUiState("chat");
    } catch (err) {
      setError("Upload failed. Please check the file and try again.");
      console.error(err);
      setUiState("upload");
    }
  };

  const handleAskQuestion = async (e, customQuestion = "") => {
    if (e) e.preventDefault();
    const currentQuestion = customQuestion || question;
    if (!currentQuestion || loading) return;

    const newHistory = [...chatHistory, { sender: "user", text: currentQuestion }];
    setChatHistory(newHistory);
    setQuestion("");
    setLoading(true);
    setError("");
    setSuggestedQuestions([]);

    try {
      const res = await axios.post("http://localhost:3000/ask", { 
        question: currentQuestion, 
        docId 
      });
      setChatHistory([...newHistory, { sender: "ai", text: res.data.answer }]);
    } catch (err)
     {
      setError("Failed to get an answer. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditingText(chatHistory[index].text);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };
  
  const handleSaveAndSubmit = async () => {
    if (!editingText || loading || editingIndex === null) return;
    
    const originalQuestion = chatHistory[editingIndex].text;
    if (originalQuestion === editingText) {
        handleCancelEdit();
        return;
    }
    
    const truncatedHistory = chatHistory.slice(0, editingIndex);
    const updatedHistoryWithEdit = [...truncatedHistory, { sender: 'user', text: editingText }];
    
    setChatHistory(updatedHistoryWithEdit);
    setLoading(true);
    setError('');
    setEditingIndex(null);
    setEditingText('');

    try {
        const res = await axios.post("http://localhost:3000/ask", {
            question: editingText,
            docId
        });
        setChatHistory([...updatedHistoryWithEdit, { sender: "ai", text: res.data.answer }]);
    } catch (err) {
        setError("Failed to get an answer after editing. Please try again.");
        console.error(err);
        setChatHistory(updatedHistoryWithEdit);
    } finally {
        setLoading(false);
    }
  };


  const handleReset = () => {
    setUiState("upload");
    setFileName("");
    setDocId("");
    setChatHistory([]);
    setError("");
    setSuggestedQuestions([]);
    setEditingIndex(null);
    setEditingText("");
  };

  // --- Render Functions ---

  const renderUploadView = () => (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Chat With Your PDF</h1>
        <p className="text-slate-300 mb-8">Upload a document to get started.</p>
        <div 
          className="w-full max-w-lg mx-auto border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/20 transition-all duration-300"
          onClick={() => fileInputRef.current.click()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <FiUploadCloud className="mx-auto text-5xl text-slate-400 mb-4" />
          <p className="text-slate-300"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop a PDF</p>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
        {error && <p className="text-red-400 mt-4 flex items-center justify-center gap-2"><FiAlertTriangle />{error}</p>}
      </motion.div>
  );
  
  const renderProcessingView = () => (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
        <FiLoader className="mx-auto text-5xl text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-300 text-xl">Analyzing your document...</p>
        <p className="text-slate-400 mt-1 truncate">{fileName}</p>
      </motion.div>
  );

  const renderChatView = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full w-full max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-3"><FiFileText className="text-indigo-400 text-xl"/><p className="font-semibold text-white truncate max-w-xs">{fileName}</p></div>
        <button onClick={handleReset} className="flex items-center gap-2 text-sm bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"><FiTrash2 /> New Chat</button>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        {chatHistory.map((item, index) => {
          // --- EDITING VIEW ---
          if (item.sender === 'user' && editingIndex === index) {
            return (
              <div key={index} className="flex items-start gap-3 flex-row-reverse">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-500">
                  <FiUser className="text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-slate-700 text-white placeholder-slate-400 p-3 rounded-lg border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    rows={Math.max(3, editingText.split('\n').length)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                      <button onClick={handleCancelEdit} className="text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleSaveAndSubmit} className="text-sm bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-500 transition-colors">Save & Submit</button>
                  </div>
                </div>
              </div>
            );
          }
          
          // --- DISPLAY VIEW ---
          return (
            <div key={index} className={`group flex items-center gap-2 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Edit button for user messages, positioned correctly with flexbox */}
              {item.sender === 'user' && !loading && editingIndex === null && (
                  <button 
                      onClick={() => handleStartEdit(index)}
                      className="p-2 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-white transition-all"
                  >
                      <FiEdit2 size={16}/>
                  </button>
              )}
              
              <ChatMessage message={item} />
            </div>
          )
        })}

        {loading && <TypingIndicator />}
        {suggestedQuestions.length > 0 && !loading && (
             <SuggestedQuestions questions={suggestedQuestions} onQuestionClick={(q) => handleAskQuestion(null, q)} />
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <form onSubmit={handleAskQuestion} className="relative">
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." className="w-full bg-slate-700 text-white placeholder-slate-400 p-4 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-14" disabled={loading || editingIndex !== null} />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed transition-colors" disabled={!question || loading || editingIndex !== null}><FiSend className="text-xl"/></button>
        </form>
        {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><FiAlertTriangle />{error}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-900 h-full">
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          {uiState === 'upload' && renderUploadView()}
          {uiState === 'processing' && renderProcessingView()}
          {uiState === 'chat' && renderChatView()}
        </AnimatePresence>
      </div>
    </div>
  );
}
