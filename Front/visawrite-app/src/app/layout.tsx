import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./navbar";
import "./globals.css";
import { Shield, User } from "lucide-react";

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
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-['Inter',sans-serif] bg-[#0B0F19] text-[#F9FAFB] overflow-x-hidden">
        
        {/* Premium Fixed Navbar */}
        <header className="fixed top-0 w-full z-50 bg-[#111827]/85 backdrop-blur-xl border-b border-[#1F2937]">
          <div className="flex justify-between items-center w-full px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6] flex items-center justify-center font-bold text-lg text-white shadow-sm">
                  W
                </div>
                <span className="font-['Outfit',sans-serif] font-bold text-xl tracking-tight text-[#F9FAFB]">
                  WriteAbroad AI
                </span>
              </Link>
            </div>
            <Navbar />
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-bold text-[#9CA3AF] hover:text-[#F9FAFB] transition-all px-3 py-2 rounded-xl bg-[#1F2937] border border-[#374151] hover:border-[#3B82F6] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
              <Link href="/admin" className="hidden md:flex text-xs font-bold text-[#3B82F6] hover:text-white transition-all px-3 py-2 rounded-xl bg-[#1F2937] border border-[#374151] hover:border-[#3B82F6] items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
              <Link href="/ai-writer" className="hidden sm:inline-flex px-5 py-2 bg-[#3B82F6] text-white font-bold rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:brightness-110 transition-all active:scale-95 text-xs">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow pt-[72px] relative">
          {children}
        </main>

        {/* Premium Footer */}
        <footer className="bg-[#111827] border-t border-[#1F2937] mt-[120px]">
          <div className="w-full px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto py-10 flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center font-bold text-sm text-white">W</div>
                <span className="font-bold text-lg text-[#F9FAFB]">WriteAbroad AI</span>
              </div>
              <p className="text-[#9CA3AF] text-sm mb-6">&copy; {new Date().getFullYear()} WriteAbroad AI. Empowering global mobility through intelligent automation.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm text-[#F9FAFB]">Product</span>
                <Link href="/sop-generator" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-all text-sm">SOP Generator</Link>
                <Link href="/gs-statement" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-all text-sm">GS Statement</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm text-[#F9FAFB]">Account & Admin</span>
                <Link href="/login" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-all text-sm">User Login</Link>
                <Link href="/admin" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-all text-sm">Admin Control Panel</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm text-[#F9FAFB]">Legal</span>
                <a href="#" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-all text-sm">Privacy Policy</a>
                <a href="#" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-all text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
