import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FiAlertTriangle, FiArrowRight, FiCheckCircle, FiCpu, FiEdit2, FiFileText, FiLoader, FiSend, FiShield, FiTrash2, FiUploadCloud, FiUser, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_SUGGESTED_QUESTIONS = [
  "What is the main summary of this document?",
  "List the key takeaways in bullet points.",
  "What is the overall tone of this document?",
  "Who is the intended audience?",
];

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';


const useChatScroll = (dep) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
    
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [dep]);
  return ref;
};


const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};




const ChatMessage = React.memo(({ message }) => {
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
      <div className={`message-avatar ${isUser ? 'message-avatar-user' : 'message-avatar-ai'}`}>
        {isUser ? <FiUser className="text-white" /> : <FiCpu className="text-white" />}
      </div>
      <div className={`message-bubble max-w-md md:max-w-xl ${isUser ? 'message-bubble-user' : 'message-bubble-ai'}`}>
        <article className="prose prose-invert prose-sm max-w-none prose-headings:scroll-mt-4">
          <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
        </article>
      </div>
    </motion.div>
  );
});

const TypingIndicator = React.memo(() => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
    >
        <div className="message-avatar message-avatar-ai">
            <FiCpu className="text-white" />
        </div>
        <div className="message-bubble message-bubble-ai rounded-bl-none">
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Thinking...</p>
        </div>
    </motion.div>
));

const SuggestedQuestions = ({ questions, onQuestionClick }) => (
  <div className="flex flex-col items-start gap-3 pt-4">
        <p className="text-sm text-slate-400 font-medium">Suggested for you:</p>
        <div className="flex flex-wrap gap-2 justify-start">
            {questions.map((q, i) => (
                <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onQuestionClick(q)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                    {q}
                </motion.button>
            ))}
        </div>
    </div>
);

const markdownComponents = {
  h1: ({ children }) => <h1 className="mb-3 text-xl font-semibold text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 text-lg font-semibold text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 text-base font-semibold text-emerald-200">{children}</h3>,
  p: ({ children }) => <p className="mb-3 leading-7 text-slate-100 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-2 text-slate-100">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-2 text-slate-100">{children}</ol>,
  li: ({ children }) => <li className="leading-7 marker:text-emerald-300">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 rounded-2xl border-l-4 border-emerald-400/70 bg-emerald-400/10 px-4 py-3 text-slate-100">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4">
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.95em] text-emerald-200">{children}</code>
    ) : (
      <code className="block overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-emerald-100">{children}</code>
    ),
};




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
  
  const debouncedQuestion = useDebounce(question, 300); 

  const chatContainerRef = useChatScroll(chatHistory);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    

    if (!fileToUpload.type.includes('pdf')) {
      setError("Please select a valid PDF file.");
      return;
    }
    

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileToUpload.size > maxSize) {
      setError("File size must be less than 10MB.");
      return;
    }
    
    const formData = new FormData();
    formData.append("pdf", fileToUpload);
    
    setFileName(fileToUpload.name);
    setError("");
    setUiState("processing");

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });
      
      setDocId(res.data.docId || '');
      setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS); 
      
      setChatHistory([{
        sender: "ai",
        text: res.data.status === 'ready'
          ? `Ready! I've analyzed **${fileToUpload.name}**. What would you like to know?`
          : `Your file is uploaded and indexing is running in the background. I'll enable questions as soon as it's ready.`,
      }]);
      setUiState(res.data.status === 'ready' ? "chat" : "processing");
    } catch (err) {
      console.error('Upload error:', err);
      
      
      if (err.response?.status === 400) {
        setError(err.response.data.error || "Invalid file format or size.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Upload timed out. Please try again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Upload failed. Please check your connection and try again.");
      }
      
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
      const res = await axios.post(`${API_URL}/ask`, { 
        question: currentQuestion, 
        docId 
      }, {
        timeout: 0,
      });
      
      if (res.data.answer) {
        setChatHistory([...newHistory, { sender: "ai", text: res.data.answer }]);
      } else {
        throw new Error("No answer received from server");
      }
    } catch (err) {
      console.error('Ask error:', err);
      
      
      if (err.response?.status === 409) {
        setError(err.response.data.error || "Document is still processing. Please wait a moment.");
      } else
      if (err.response?.status === 400) {
        setError("Invalid question format. Please try again.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please try again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to get an answer. Please try again.");
      }
      
      
      setChatHistory(prev => prev.slice(0, -1));
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
        const res = await axios.post(`${API_URL}/ask`, {
            question: editingText,
            docId
        }, {
          timeout: 0,
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

  useEffect(() => {
    if (!docId || uiState !== 'processing') {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/status/${docId}`);
        if (response.data.status === 'ready') {
          setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS);
          setChatHistory((previous) => previous.length > 0 ? previous : [{
            sender: 'ai',
            text: `Ready! I've analyzed **${fileName}**. What would you like to know?`,
          }]);
          setUiState('chat');
          window.clearInterval(intervalId);
        } else if (response.data.status === 'error') {
          setError(response.data.error || 'Document processing failed.');
          setUiState('upload');
          window.clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [docId, fileName, uiState]);



  const renderUploadView = () => (
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="text-center">
        <div className="section-badge mx-auto mb-5 inline-flex items-center gap-2">
          <FiShield /> Secure workspace
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Launch your document AI workspace</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Upload a PDF and instantly turn it into a premium chat experience with summaries, insights, and editable follow-up questions.</p>
        <div 
          className="upload-zone mx-auto mt-10 flex w-full max-w-2xl cursor-pointer flex-col items-center gap-4 rounded-[28px] p-10 text-center transition"
          onClick={() => fileInputRef.current.click()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="upload-icon">
            <FiUploadCloud />
          </div>
          <div>
            <p className="text-lg font-medium text-white"><span className="text-emerald-300">Click to upload</span> or drag and drop a PDF</p>
            <p className="mt-2 text-sm text-slate-400">Files are validated locally before upload. Max size: 10MB.</p>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
        {error && <p className="mt-4 flex items-center justify-center gap-2 text-red-400"><FiAlertTriangle />{error}</p>}
      </motion.div>
  );
  
  const renderProcessingView = () => (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <FiLoader className="animate-spin text-3xl" />
        </div>
        <p className="mt-6 text-2xl font-semibold text-white">Analyzing your document</p>
        <p className="mt-2 text-slate-400">{fileName}</p>
      </motion.div>
  );

  const renderChatView = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="chat-shell flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none md:rounded-none"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="icon-chip"><FiFileText /></div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Current document</p>
            <p className="truncate text-base font-semibold text-white">{fileName}</p>
          </div>
        </div>
        <button onClick={handleReset} className="button-secondary inline-flex items-center gap-2 text-sm">
          <FiTrash2 /> New chat
        </button>
      </div>

      <div className="grid flex-1 min-h-0 gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-white/10 bg-slate-950/50 p-5 lg:block">
          <div className="glass-card p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workflow</p>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-0.5 text-emerald-300" />
                Upload validated and ready for retrieval
              </div>
              <div className="flex items-start gap-3">
                <FiZap className="mt-0.5 text-emerald-300" />
                Ask precise questions or choose suggested prompts
              </div>
              <div className="flex items-start gap-3">
                <FiCpu className="mt-0.5 text-emerald-300" />
                AI responses stay grounded in the document context
              </div>
            </div>
          </div>

          <div className="glass-card mt-5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tips</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Use summary prompts first to map the document.</li>
              <li>Edit a question to refine the answer path.</li>
              <li>Upload another PDF anytime with New chat.</li>
            </ul>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col bg-slate-950/30">
          <div ref={chatContainerRef} className="flex-1 min-h-0 space-y-6 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
            {chatHistory.map((item, index) => {
          
          if (item.sender === 'user' && editingIndex === index) {
            return (
              <div key={index} className="flex items-start gap-3 flex-row-reverse">
                <div className="message-avatar message-avatar-user">
                  <FiUser className="text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-slate-900/80 p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                    rows={Math.max(3, editingText.split('\n').length)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                      <button onClick={handleCancelEdit} className="text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleSaveAndSubmit} className="button-primary inline-flex items-center gap-2 text-sm"><FiArrowRight /> Save & submit</button>
                  </div>
                </div>
              </div>
            );
          }
          
                
          return (
            <div key={index} className={`group flex items-center gap-2 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {item.sender === 'user' && !loading && editingIndex === null && (
                  <button 
                      onClick={() => handleStartEdit(index)}
                        className="rounded-full p-2 text-slate-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
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

          <div className="border-t border-white/10 bg-slate-950/80 p-4 md:p-6">
            <form onSubmit={handleAskQuestion} className="relative">
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about sections, numbers, summaries, or definitions..." className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 pr-16 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all" disabled={loading || editingIndex !== null} />
              <button type="submit" className="button-primary absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-4 py-2" disabled={!question || loading || editingIndex !== null}><FiSend className="text-lg"/></button>
            </form>
            {error && <p className="mt-3 flex items-center gap-2 text-sm text-red-400"><FiAlertTriangle />{error}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden overscroll-contain p-0">
      <div className="chat-backdrop" />
      <div className="relative flex h-full min-h-0 w-full flex-col">
        <AnimatePresence mode="wait">
          {uiState === 'upload' && renderUploadView()}
          {uiState === 'processing' && renderProcessingView()}
          {uiState === 'chat' && renderChatView()}
        </AnimatePresence>
      </div>
    </div>
  );
}
