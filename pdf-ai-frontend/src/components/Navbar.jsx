// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMessageSquare, FiHome, FiInfo, FiX, FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// You can create a simple logo component or use an SVG directly
const Logo = () => (
  <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    PageWise
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

  // Using a function for className to handle active state with Tailwind CSS
  const activeLinkClass = "bg-indigo-600 text-white";
  const inactiveLinkClass = "text-slate-300 hover:bg-slate-700 hover:text-white";
  
  const getLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? activeLinkClass : inactiveLinkClass}`;

  return (
    <>
      <nav className="bg-slate-900/80 backdrop-blur-lg p-4 sticky top-0 z-50 border-b border-slate-800">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getLinkClasses}>
                {link.icon} {link.text}
              </NavLink>
            ))}
            <Link
              to="/chat"
              className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <FiMessageSquare /> Go to App
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
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
            className="md:hidden fixed top-[73px] left-0 w-full h-[calc(100vh-73px)] bg-slate-900 z-40 flex flex-col items-center justify-center"
          >
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={getLinkClasses} onClick={() => setIsOpen(false)}>
                  {link.icon} {link.text}
                </NavLink>
              ))}
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className="mt-6 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
              >
                <FiMessageSquare /> Go to App
              </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}