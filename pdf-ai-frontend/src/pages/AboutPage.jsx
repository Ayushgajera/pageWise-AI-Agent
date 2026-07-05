import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCode, FiCpu, FiDatabase, FiLayers, FiMessageSquare, FiShield, FiUploadCloud } from 'react-icons/fi';
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
        <div className="bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-white text-xl mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
    </motion.div>
);

// A reusable card for the "Technology Stack" section
const TechCard = ({ icon, name }) => (
    <div className="glass-card flex items-center gap-4 p-4 transition hover:-translate-y-1">
        <div className="icon-chip">
            {icon}
        </div>
        <span className="font-medium text-white">{name}</span>
    </div>
);

const pillars = [
    {
        title: 'Document intelligence',
        description: 'The experience is designed like a premium SaaS platform: fast, clear, and centered on the active workflow.',
        icon: <FiCpu />,
    },
    {
        title: 'Trust and clarity',
        description: 'Every major state has a visual hierarchy, from upload to processing to guided conversation.',
        icon: <FiShield />,
    },
    {
        title: 'Scalable foundation',
        description: 'The UI keeps the existing upload and ask flow, while making room for future features like teams and analytics.',
        icon: <FiDatabase />,
    },
];

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
        <div className="relative h-full min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="about-orb about-orb-a" />
            <div className="about-orb about-orb-b" />
            <div className="mx-auto max-w-7xl px-4 py-12 pb-20 md:px-6 md:py-20">
                <motion.section 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto mb-16 max-w-4xl text-center md:mb-24"
                >
                    <div className="section-badge mx-auto mb-5 inline-flex items-center gap-2">
                        <FiLayers /> Product narrative
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                        Making documents feel like a premium product surface.
                    </h1>
                    <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
                        PageWise turns PDF uploads into a clean, high-confidence SaaS workflow where users can upload, ask, edit, and continue the conversation without friction.
                    </p>
                </motion.section>

                <section className="mb-16 md:mb-24">
                    <h2 className="mb-4 text-center text-3xl font-semibold text-white md:text-4xl">How the experience is structured</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-slate-300">The interface is designed around one core loop: upload, analyze, ask, refine, and repeat.</p>
                    <div className="grid gap-6 md:grid-cols-3">
                        <FeatureStepCard 
                            icon={<FiUploadCloud size={28}/>} 
                            title="1. Upload PDF"
                            description="Securely upload a PDF. The app validates the file, uploads it, and prepares a retrieval-ready workspace."
                            delay={0.1}
                        />
                        <FeatureStepCard 
                            icon={<FiMessageSquare size={28}/>}
                            title="2. Ask Questions"
                            description="Start a conversation in a polished chat workspace with suggested prompts, editing, and live response states."
                            delay={0.2}
                        />
                        <FeatureStepCard 
                            icon={<FiCheckCircle size={28}/>}
                            title="3. Get Answers"
                            description="Receive answers that are retrieved from the document context and presented with readable formatting."
                            delay={0.3}
                        />
                    </div>
                </section>

                <section className="mb-16 md:mb-24">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {pillars.map((pillar) => (
                            <div key={pillar.title} className="glass-card p-6">
                                <div className="icon-chip mb-4">{pillar.icon}</div>
                                <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-300">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-center text-3xl font-semibold text-white md:text-4xl">Powered by modern tooling</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-slate-300">A streamlined React, Tailwind, and Node.js stack stays focused on product quality instead of visual noise.</p>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05, duration: 0.5 }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
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
