// src/components/Navbar.jsx

import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiArrowUpRight, FiFileText, FiHome, FiInfo, FiMenu, FiMessageSquare, FiShield, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Logo = () => (
  <Link to="/" className="flex items-center gap-3">
    <div className="logo-mark">
      <FiFileText />
    </div>
    <div>
      <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">PageWise</p>
      <p className="text-lg font-semibold text-white">Document Intelligence</p>
    </div>
  </Link>
);


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { text: 'Home', to: '/', icon: <FiHome /> },
    { text: 'About', to: '/about', icon: <FiInfo /> },
  ];

  const activeLinkClass = 'bg-emerald-400/10 text-emerald-100 border-emerald-400/20';
  const inactiveLinkClass = 'text-slate-300 hover:bg-white/5 hover:text-white border-transparent';

  const getLinkClasses = ({ isActive }) =>
    `nav-pill ${isActive ? activeLinkClass : inactiveLinkClass}`;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#06140b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Logo />
          
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getLinkClasses}>
                {link.icon}
                {link.text}
              </NavLink>
            ))}
            <Link
              to="/chat"
              className="button-primary ml-2 inline-flex items-center gap-2"
            >
              <FiMessageSquare /> Open workspace <FiArrowUpRight />
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="rounded-full border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10 focus:outline-none">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden fixed left-0 top-[73px] z-40 flex h-[calc(100vh-73px)] w-full flex-col items-center justify-center gap-3 bg-[#06140b]/96 px-6 backdrop-blur-xl"
          >
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={getLinkClasses} onClick={() => setIsOpen(false)}>
                  {link.icon} {link.text}
                </NavLink>
              ))}
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className="button-primary mt-6 inline-flex items-center gap-2"
              >
                <FiMessageSquare /> Open workspace
              </Link>
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
                <FiShield /> Secure PDF workflows
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}