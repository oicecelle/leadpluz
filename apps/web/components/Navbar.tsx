"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full h-[70px] z-50 transition-all duration-300 flex items-center justify-between px-6 md:px-12 ${
        scrolled
          ? "bg-[#050508]/90 border-b border-[rgba(139,69,212,0.2)] backdrop-blur-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center space-x-2 group">
        <Zap className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors fill-purple-400/20" />
        <span className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">
          LEAD<span className="text-purple-400">PLUZ</span>
        </span>
      </Link>

      {/* Center: Links (Desktop) */}
      <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Link href="#como-funciona" className="hover:text-purple-300 transition-colors">
          Como funciona
        </Link>
        <Link href="#funcionalidades" className="hover:text-purple-300 transition-colors">
          Funcionalidades
        </Link>
        <Link href="#planos" className="hover:text-purple-300 transition-colors">
          Planos
        </Link>
        <Link href="#faq" className="hover:text-purple-300 transition-colors">
          FAQ
        </Link>
      </nav>

      {/* Right: CTAs (Desktop) */}
      <div className="hidden md:flex items-center space-x-4">
        <Link
          href="https://go.leadpluz.com/login"
          className="px-5 py-2 border border-purple-800/40 rounded-lg text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all duration-200"
        >
          Login
        </Link>
        <Link
          href="https://go.leadpluz.com/cadastro"
          className="btn-gradient px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white"
        >
          Começar agora
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-gray-400 hover:text-white focus:outline-none"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[70px] left-0 w-full bg-[#050508]/95 border-b border-[rgba(139,69,212,0.2)] backdrop-blur-lg md:hidden flex flex-col px-6 py-8 space-y-6 text-center text-sm font-semibold uppercase tracking-wider text-gray-400 z-40"
          >
            <Link
              href="#como-funciona"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-300 transition-colors py-2"
            >
              Como funciona
            </Link>
            <Link
              href="#funcionalidades"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-300 transition-colors py-2"
            >
              Funcionalidades
            </Link>
            <Link
              href="#planos"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-300 transition-colors py-2"
            >
              Planos
            </Link>
            <Link
              href="#faq"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-300 transition-colors py-2"
            >
              FAQ
            </Link>
            
            <div className="h-px bg-purple-950/40 w-full" />

            <div className="flex flex-col space-y-4 pt-2">
              <Link
                href="https://go.leadpluz.com/login"
                className="w-full py-3 border border-purple-800/40 rounded-lg text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="https://go.leadpluz.com/cadastro"
                className="btn-gradient w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white text-center"
              >
                Começar agora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
