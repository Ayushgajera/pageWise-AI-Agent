// src/components/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCpu, FiLock, FiFileText, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

// A reusable Feature Card component for the grid
const FeatureCard = ({ icon, title, description, delay }) => {
  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, delay } 
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group"
    >
      <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </motion.div>
  );
};


export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center">
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Main Headline & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Chat with any <span className="text-indigo-600">PDF document</span>, instantly.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-lg mb-8">
              Get answers, summaries, and insights from your files. Just upload your document and start asking questions.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-3 bg-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:scale-105"
            >
              Get Started for Free <FiArrowRight />
            </Link>
          </motion.div>

          {/* Right Column: Feature Grid (Bento Style) */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
          >
            <FeatureCard 
              icon={<FiFileText size={24}/>}
              title="Summarize Docs"
              description="Get a quick summary of long documents."
              delay={0.2}
            />
            <FeatureCard 
              icon={<FiZap size={24}/>}
              title="Instant Answers"
              description="Ask questions and find information fast."
              delay={0.3}
            />
            <FeatureCard 
              icon={<FiCpu size={24}/>}
              title="AI-Powered"
              description="Powered by the latest language models."
              delay={0.4}
            />
            <FeatureCard 
              icon={<FiLock size={24}/>}
              title="Secure & Private"
              description="Your files are never stored or shared."
              delay={0.5}
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
}