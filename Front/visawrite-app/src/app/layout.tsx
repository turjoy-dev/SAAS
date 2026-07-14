import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "WriteAbroad AI | Empowering Global Mobility",
  description: "Craft high-impact Statements of Purpose, Motivation Letters, and Visa Statements with the world's most advanced AI for global mobility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-['Inter',sans-serif] bg-[#f8f9ff] text-[#0b1c30] overflow-x-hidden">
        
        {/* Premium Fixed Navbar (matches Stitch nav exactly) */}
        <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#c5c5d3]/30">
          <div className="flex justify-between items-center w-full px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-[#1e3a8a] flex items-center justify-center font-bold text-lg text-white shadow-sm">
                  W
                </div>
                <span className="font-['Outfit',sans-serif] font-bold text-xl tracking-tight text-[#1e3a8a]">
                  WriteAbroad AI
                </span>
              </Link>
            </div>
            <Navbar />
            <div className="flex gap-4">
              <Link href="/ai-writer" className="hidden sm:inline-flex px-6 py-2 bg-[#1e3a8a] text-white font-bold rounded-full shadow-[0_4px_20px_rgba(30,58,138,0.2)] hover:brightness-110 transition-all active:scale-95 text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area (pushed down for fixed nav) */}
        <main className="flex-grow pt-[72px] relative">
          {children}
        </main>

        {/* Premium Footer (matches Stitch footer) */}
        <footer className="bg-[#eff4ff] border-t border-[#c5c5d3]/10 mt-[120px]">
          <div className="w-full px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto py-10 flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#1e3a8a] flex items-center justify-center font-bold text-sm text-white">W</div>
                <span className="font-bold text-lg text-[#1e3a8a]">WriteAbroad AI</span>
              </div>
              <p className="text-[#444651] text-sm mb-6">&copy; {new Date().getFullYear()} WriteAbroad AI. Empowering global mobility through intelligent automation.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm text-[#0b1c30]">Product</span>
                <Link href="/sop-generator" className="text-[#444651] hover:text-[#1e3a8a] transition-all text-sm">SOP Generator</Link>
                <Link href="/gs-statement" className="text-[#444651] hover:text-[#1e3a8a] transition-all text-sm">GS Statement</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm text-[#0b1c30]">Resources</span>
                <a href="#" className="text-[#444651] hover:text-[#1e3a8a] transition-all text-sm">Visa Guides</a>
                <a href="#" className="text-[#444651] hover:text-[#1e3a8a] transition-all text-sm">Admissions Blog</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm text-[#0b1c30]">Legal</span>
                <a href="#" className="text-[#444651] hover:text-[#1e3a8a] transition-all text-sm">Privacy Policy</a>
                <a href="#" className="text-[#444651] hover:text-[#1e3a8a] transition-all text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
