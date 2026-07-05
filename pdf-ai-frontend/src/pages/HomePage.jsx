import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCpu, FiFileText, FiLayers, FiShield, FiZap } from 'react-icons/fi'; /* Import statement remains unchanged */
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card h-full p-6">
    <div className="icon-chip mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
  </div>
);

const statBlocks = [
  { value: '10x', label: 'faster document comprehension' },
  { value: '99%', label: 'structured answer retrieval' },
  { value: '24/7', label: 'AI workspace availability' },
];

const highlights = [
  'One-click PDF upload with validation',
  'Conversational answers grounded in your document',
  'Editable prompts and follow-up question flow',
];


export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-center px-4 py-14 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="section-badge mb-5 inline-flex items-center gap-2">
              <FiShield />
              Enterprise-grade PDF intelligence
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Transform static PDFs into a{' '}
              <span className="text-gradient">living product experience</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 md:text-xl">
              Upload a document, ask anything, and get grounded answers in a sleek workspace built like a modern SaaS app.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/chat" className="button-primary inline-flex items-center gap-2">
                Launch workspace <FiArrowRight />
              </Link>
              <Link to="/about" className="button-secondary inline-flex items-center gap-2">
                Explore product
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {statBlocks.map((stat) => (
                <div key={stat.label} className="glass-card p-4">
                  <div className="text-3xl font-semibold text-white">{stat.value}</div>
                  <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 md:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live workspace</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Document Control Center</h2>
                </div>
                <div className="icon-chip"><FiLayers /></div>
              </div>
              <div className="mt-5 space-y-4">
                {highlights.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FeatureCard
                  icon={<FiFileText />}
                  title="Upload & parse"
                  description="Accept PDFs, validate size, and prepare the document for retrieval in seconds."
                />
                <FeatureCard
                  icon={<FiCpu />}
                  title="Ask with context"
                  description="Use follow-up questions, edits, and suggested prompts to keep the conversation flowing."
                />
                <FeatureCard
                  icon={<FiZap />}
                  title="Fast answers"
                  description="Built for quick document navigation, summaries, and targeted information lookup."
                />
                <FeatureCard
                  icon={<FiShield />}
                  title="Secure by design"
                  description="Clean UX, clear states, and safe file handling around every upload and query."
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}