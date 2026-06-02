import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LEADPLUZ — Encontre clientes. Conecte. Converta.",
  description: "Plataforma de prospecção B2B com busca de leads, disparos no WhatsApp e CRM completo.",
  openGraph: {
    title: "LEADPLUZ — Encontre clientes. Conecte. Converta.",
    description: "Plataforma de prospecção B2B com busca de leads, disparos no WhatsApp e CRM completo.",
    type: "website",
    locale: "pt_BR",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#050508] text-[#a0a0b8] antialiased`}>
        {children}
      </body>
    </html>
  );
}
