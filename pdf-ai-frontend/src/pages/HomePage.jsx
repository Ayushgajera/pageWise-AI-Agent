import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiFileText,
  FiLayers,
  FiMessageCircle,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUploadCloud,
  FiZap,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const stats = [
  { value: 'Instant', label: 'Document onboarding' },
  { value: 'Grounded', label: 'Answers from your PDF' },
  { value: 'Adaptive', label: 'Follow-up chat flow' },
  { value: 'Pro', label: 'SaaS-grade presentation' },
];

const proofPoints = [
  'Resume screening',
  'Policy lookup',
  'Research notes',
  'Contract review',
  'Financial reports',
];

const capabilities = [
  {
    icon: <FiUploadCloud />,
    title: 'Fast start, zero ceremony',
    description: 'Upload once and move into a polished, guided workspace that feels like a premium product instead of a file drop.'
  },
  {
    icon: <FiMessageCircle />,
    title: 'Conversation with memory',
    description: 'Ask for summaries, comparisons, salary guidance, risks, or follow-ups without losing document context.'
  },
  {
    icon: <FiShield />,
    title: 'Controlled states',
    description: 'Users can see upload, processing, and ready states clearly, reducing confusion and retry behavior.'
  },
  {
    icon: <FiBarChart2 />,
    title: 'Structured outputs',
    description: 'Responses are formatted for scanability with bullets, highlights, and an engaging closing question.'
  },
  {
    icon: <FiRefreshCw />,
    title: 'Edit and refine',
    description: 'Update a prompt and continue the thread, so the experience feels iterative rather than linear.'
  },
  {
    icon: <FiTarget />,
    title: 'Built for decisions',
    description: 'The UI emphasizes the key takeaway, the evidence behind it, and the next best action.'
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload the document',
    body: 'Drop in a PDF and let the app verify, process, and prepare it for question answering.'
  },
  {
    number: '02',
    title: 'Read the overview',
    body: 'Use the landing-page style summary cards to understand what the workspace can do before you dive in.'
  },
  {
    number: '03',
    title: 'Ask with precision',
    body: 'Ask for salary insights, risks, comparisons, summaries, or next steps, and keep refining from there.'
  },
];

const decisionCards = [
  {
    icon: <FiFileText />,
    title: 'Document-first design',
    body: 'The homepage frames the product around the file, the answer, and the decision, not generic AI branding.'
  },
  {
    icon: <FiCompass />,
    title: 'Narrative flow',
    body: 'Each section leads naturally to the next: value, proof, workflow, and call to action.'
  },
  {
    icon: <FiClock />,
    title: 'Speed signals',
    body: 'Visual cues show that the app is built for quick upload, immediate feedback, and low-friction use.'
  },
  {
    icon: <FiLayers />,
    title: 'Workspace depth',
    body: 'The preview panel hints at the full chat workspace so the landing page feels connected to the product.'
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: 'easeOut' },
};

const stagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const SectionLabel = ({ children }) => (
  <div className="section-badge inline-flex items-center gap-2">
    <FiStar />
    {children}
  </div>
);

const MetricCard = ({ value, label }) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
    <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
    <p className="mt-1 text-sm leading-6 text-slate-300">{label}</p>
  </div>
);

const CapabilityCard = ({ icon, title, description }) => (
  <div className="glass-card group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
    <div className="icon-chip mb-4 transition-transform duration-300 group-hover:scale-105">{icon}</div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
  </div>
);

const StepCard = ({ number, title, body }) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-300">{number}</div>
      <div className="h-px flex-1 bg-gradient-to-r from-emerald-400/30 via-white/10 to-transparent" />
    </div>
    <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
  </div>
);

export default function HomePage() {
  return (
    <div className="relative h-full min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />

      <section className="mx-auto min-h-full w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid gap-6 lg:gap-8"
        >
          <motion.div variants={fadeInUp} className="glass-card overflow-hidden p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
              <SectionLabel>Next-generation document intelligence</SectionLabel>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                <FiTrendingUp />
                Production ready
              </div>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                  <FiZap className="text-emerald-300" />
                  Premium homepage redesign with stronger hierarchy and motion
                </div>

                <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  A high-end AI workspace for{' '}
                  <span className="text-gradient">reading, asking, and deciding</span> faster.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                  PageWise turns a PDF into a guided product experience: elegant upload, instant context, structured answers, and a chat flow that feels deliberate from the first interaction.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/chat" className="button-primary inline-flex items-center gap-2">
                    Open workspace <FiArrowRight />
                  </Link>
                  <Link to="/about" className="button-secondary inline-flex items-center gap-2">
                    Explore the product <FiPlay />
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((item) => (
                    <MetricCard key={item.label} value={item.value} label={item.label} />
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[36px] bg-emerald-400/10 blur-3xl" />
                <div className="relative rounded-[34px] border border-white/10 bg-slate-950/70 p-4 shadow-[0_40px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live preview</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Product dashboard storyboard</h2>
                      </div>
                      <div className="icon-chip">
                        <FiLayers />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                            <FiFileText />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Document state</p>
                            <p className="mt-1 text-sm font-medium text-white">Uploaded, processing, ready</p>
                          </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/5">
                          <div className="h-2 w-[76%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">Clear feedback keeps the document flow feeling immediate even on longer PDFs.</p>
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-emerald-300">
                            <FiMessageCircle />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Response style</p>
                            <p className="mt-1 text-sm font-medium text-white">Bullets, summary, follow-up</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-2 w-5/6 rounded-full bg-white/8" />
                          <div className="h-2 w-4/5 rounded-full bg-white/8" />
                          <div className="h-2 w-3/5 rounded-full bg-emerald-400/40" />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">Answers are shaped for readability instead of dumping raw model text.</p>
                      </div>

                      <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/10 p-4 sm:col-span-2">
                        <div className="flex items-center gap-3 text-emerald-200">
                          <FiCheckCircle />
                          <span className="text-xs font-semibold uppercase tracking-[0.3em]">Designed for trust</span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-200">
                          The interface makes the value proposition obvious: upload a document, understand it quickly, and ask better questions without navigating away from the workspace.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid gap-4 rounded-[30px] border border-white/8 bg-white/[0.03] p-5 md:grid-cols-2 lg:grid-cols-5 lg:p-6">
            <div className="flex items-center gap-3 text-sm text-slate-300 lg:col-span-1">
              <FiStar className="text-emerald-300" />
              Built for teams and individuals who need clarity fast
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {proofPoints.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((card) => (
              <CapabilityCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div className="glass-card p-6 md:p-8">
              <SectionLabel>How it feels</SectionLabel>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                The homepage should read like a premium product launch, not a generic AI template.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
                This version adds stronger contrast, sharper storytelling, and a more editorial rhythm so the product feels intentional at every scroll stop.
              </p>

              <div className="mt-8 space-y-4">
                {steps.map((step) => (
                  <StepCard key={step.number} {...step} />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {decisionCards.map((card) => (
                <div key={card.title} className="glass-card p-6">
                  <div className="icon-chip mb-4">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.body}</p>
                </div>
              ))}

              <div className="glass-card sm:col-span-2 p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ready for the workspace</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Move from browsing to asking in one click.</h3>
                  </div>
                  <div className="icon-chip">
                    <FiArrowRight />
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  The landing page now functions like a premium lead-in: it establishes confidence, shows the product value, and funnels users directly into the chat workspace.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/chat" className="button-primary inline-flex items-center gap-2">
                    Launch chat <FiArrowRight />
                  </Link>
                  <Link to="/about" className="button-secondary inline-flex items-center gap-2">
                    Learn more <FiShield />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
