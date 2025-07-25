import React from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiMessageSquare, FiCheckCircle, FiCpu, FiDatabase, FiLayers, FiCode } from 'react-icons/fi';
import { FaReact, FaNodeJs } from 'react-icons/fa';

// A reusable card for the "How it Works" section
const FeatureStepCard = ({ icon, title, description, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true, amount: 0.5 }}
        className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center"
    >
        <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-white text-xl mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
    </motion.div>
);

// A reusable card for the "Technology Stack" section
const TechCard = ({ icon, name }) => (
    <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-4 border border-slate-700 hover:border-indigo-500 hover:bg-slate-700/50 transition-all">
        <div className="text-indigo-400 text-3xl">
            {icon}
        </div>
        <span className="font-medium text-white">{name}</span>
    </div>
);

export default function AboutPage() {
    const techStack = [
        { name: 'React', icon: <FaReact /> },
        { name: 'Tailwind CSS', icon: <FiLayers /> },
        { name: 'Node.js', icon: <FaNodeJs /> },
        { name: 'Express', icon: <FiCode /> },
        { name: 'Google Gemini', icon: <FiCpu /> },
        { name: 'ChromaDB', icon: <FiDatabase /> },
        { name: 'LangChain.js', icon: <FiLayers /> },
        { name: 'Multer', icon: <FiUploadCloud /> },
    ];

    return (
        <div className="bg-slate-900 text-slate-200">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
                {/* --- Hero Section --- */}
                <motion.section 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Making Documents Intelligent
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
                        PageWise is built to help you instantly find answers and insights from your documents. We turn static files into dynamic conversations.
                    </p>
                </motion.section>

                {/* --- How It Works Section --- */}
                <section className="mb-16 md:mb-24">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureStepCard 
                            icon={<FiUploadCloud size={28}/>} 
                            title="1. Upload PDF"
                            description="Securely upload any PDF document. Your files are processed and prepared for analysis."
                            delay={0.1}
                        />
                        <FeatureStepCard 
                            icon={<FiMessageSquare size={28}/>}
                            title="2. Ask Questions"
                            description="Start a conversation. Ask questions in natural language, just like you would with a person."
                            delay={0.2}
                        />
                        <FeatureStepCard 
                            icon={<FiCheckCircle size={28}/>}
                            title="3. Get Answers"
                            description="Receive instant, accurate answers pulled directly from the context of your document."
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* --- Tech Stack Section --- */}
                <section>
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Powered by Modern Technology</h2>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05, duration: 0.5 }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {techStack.map(tech => (
                             <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <TechCard name={tech.name} icon={tech.icon} />
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
