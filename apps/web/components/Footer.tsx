"use client";

import Link from "next/link";
import { Zap, Instagram, Youtube, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050508] border-t border-purple-950/20 pt-16 pb-8 px-6 md:px-12 font-sans select-none text-left">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-purple-950/15">
        
        {/* Column 1: Brand details */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
            <span className="text-sm font-extrabold tracking-widest text-white uppercase">
              LEAD<span className="text-purple-400">PLUZ</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
            CRM 100% autônomo e integrado ao WhatsApp para clínicas de saúde, beleza e estética.
          </p>
          <div className="flex space-x-4 pt-2">
            <Link href="https://instagram.com/leadpluz" target="_blank" className="text-gray-500 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://youtube.com/leadpluz" target="_blank" className="text-gray-500 hover:text-white transition-colors" aria-label="YouTube">
              <Youtube className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Navegação */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest">Navegação</h4>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>
              <Link href="#recursos" className="hover:text-purple-300 transition-colors">
                Recursos da plataforma
              </Link>
            </li>
            <li>
              <Link href="#planos" className="hover:text-purple-300 transition-colors">
                Planos de assinatura
              </Link>
            </li>
            <li>
              <Link href="#demonstracao" className="hover:text-purple-300 transition-colors">
                Demonstração em vídeo
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:text-purple-300 transition-colors">
                Perguntas Frequentes
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Conta & Acesso */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest">Plataforma</h4>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>
              <Link href="https://app.leadpluz.com/login" className="hover:text-purple-300 transition-colors font-semibold text-gray-400">
                Entrar na Conta (Login)
              </Link>
            </li>
            <li>
              <Link href="https://app.leadpluz.com/signup" className="hover:text-purple-300 transition-colors font-semibold text-purple-400">
                Criar Conta Grátis
              </Link>
            </li>
            <li>
              <Link href="https://wa.me/5521976640033" target="_blank" className="hover:text-purple-300 transition-colors flex items-center space-x-1">
                <MessageSquare className="w-3 h-3 text-purple-400" />
                <span>Suporte via WhatsApp</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest">Legal</h4>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>
              <Link href="/termos" className="hover:text-purple-300 transition-colors">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-purple-300 transition-colors">
                Política de privacidade
              </Link>
            </li>
            <li>
              <span className="text-gray-600 block">LGPD Enterprise Compliance</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom area */}
      <div className="max-w-6xl mx-auto w-full pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 gap-4">
        <span>© {new Date().getFullYear()} LEADPLUZ. Todos os direitos reservados.</span>
        <span>Feito com excelência 🇧🇷</span>
      </div>
    </footer>
  );
}
