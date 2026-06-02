"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function HeroMockup() {
  const [leads, setLeads] = useState<any[]>([]);

  const mockLeadsData = [
    { name: "Sorriso Ideal Odontologia", phone: "(11) 98471-2943", city: "São Paulo", status: "Novo" },
    { name: "Bella Estética & Spa", phone: "(11) 97232-4412", city: "São Paulo", status: "Contatado" },
    { name: "Clínica Vet Amigo Fiel", phone: "(11) 98112-9051", city: "São Paulo", status: "Proposta Enviada" },
    { name: "Iron Gym Academias", phone: "(11) 99341-2084", city: "São Paulo", status: "Convertido" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeads([mockLeadsData[0]]);
    }, 800);

    const timer2 = setTimeout(() => {
      setLeads((prev) => [...prev, mockLeadsData[1]]);
    }, 1800);

    const timer3 = setTimeout(() => {
      setLeads((prev) => [...prev, mockLeadsData[2]]);
    }, 2800);

    const timer4 = setTimeout(() => {
      setLeads((prev) => [...prev, mockLeadsData[3]]);
    }, 3800);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-[580px] aspect-[16/11] bg-[#0c0c16] border border-purple-800/25 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_40px_rgba(139,69,212,0.15)] flex flex-col font-sans select-none text-left"
    >
      {/* Top Bar */}
      <div className="h-11 bg-[#09090f] border-b border-purple-950/40 flex items-center px-4 justify-between flex-shrink-0">
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
        </div>
        <span className="text-[10px] text-gray-500 font-mono select-all bg-[#050508] px-3 py-1 rounded border border-purple-950/20 max-w-[280px] truncate">
          app.leadpluz.com/dashboard/leads
        </span>
        <div className="w-14 h-2 bg-purple-900/20 rounded" />
      </div>

      {/* Floating Badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-16 right-4 z-20 px-3.5 py-1.5 bg-green-950/90 border border-green-500/40 rounded-full text-green-400 text-[10px] font-bold tracking-wide flex items-center space-x-1.5 shadow-lg backdrop-blur-sm"
      >
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
        <span>✓ 847 leads encontrados</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-4 z-20 px-3.5 py-1.5 bg-[#0f0f1a]/95 border border-purple-500/40 rounded-full text-purple-300 text-[10px] font-bold tracking-wide flex items-center space-x-1.5 shadow-lg backdrop-blur-sm"
      >
        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
        <span>WhatsApp conectado ●</span>
      </motion.div>

      {/* App Body Simulator */}
      <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
        {/* Search header mock */}
        <div className="flex justify-between items-center pb-4 border-b border-purple-950/20 flex-shrink-0">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1">
              <span>Painel de Busca</span>
            </h4>
            <p className="text-[10px] text-gray-500">Resultados em tempo real de prospecção</p>
          </div>
          <div className="flex space-x-2 text-[10px] font-bold text-purple-300 bg-purple-950/40 border border-purple-900/35 px-2.5 py-1 rounded-md">
            <span>Filtro: WhatsApp Comercial</span>
          </div>
        </div>

        {/* Dynamic Table Header */}
        <div className="flex-grow mt-4 overflow-hidden flex flex-col">
          <div className="grid grid-cols-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest pb-2 border-b border-purple-950/10 mb-2 px-1">
            <span>Nome</span>
            <span>Telefone</span>
            <span>Cidade</span>
            <span className="text-right">Status</span>
          </div>

          {/* Dynamic Table Content */}
          <div className="flex-grow space-y-2 overflow-hidden">
            {leads.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border border-t-purple-400 border-r-purple-950 border-b-purple-950 border-l-purple-950 rounded-full animate-spin"></div>
              </div>
            ) : (
              leads.map((lead, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-4 items-center text-[10px] text-gray-300 bg-purple-950/10 border border-purple-950/20 rounded-lg p-2.5 hover:border-purple-800/30 transition-all px-2.5 animate-pulse-slow"
                >
                  <span className="font-semibold text-white truncate max-w-[120px]">{lead.name}</span>
                  <span className="font-mono text-gray-400">{lead.phone}</span>
                  <span className="text-gray-400">{lead.city}</span>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide inline-block ${
                      lead.status === "Novo" ? "bg-purple-950/30 text-purple-300 border border-purple-800/30" :
                      lead.status === "Contatado" ? "bg-blue-950/30 text-blue-400 border border-blue-900/30" :
                      lead.status === "Proposta Enviada" ? "bg-yellow-950/30 text-yellow-500 border border-yellow-900/30" :
                      "bg-green-950/30 text-green-400 border border-green-900/30"
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions mock */}
        <div className="h-8 border-t border-purple-950/10 flex items-center justify-between text-[9px] text-gray-500 pt-2 flex-shrink-0">
          <span>Sincronizando com Supabase e n8n...</span>
          <span className="text-white hover:text-purple-300 transition-colors cursor-pointer flex items-center space-x-1 font-bold uppercase tracking-wider">
            <span>Visualizar Leads</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
