"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
  const isWriterActive = pathname === "/ai-writer" || 
                         pathname === "/sop-generator" || 
                         pathname === "/gs-statement" || 
                         pathname === "/motivation-letter" || 
                         pathname === "/study-plan" || 
                         pathname === "/personal-statement" || 
                         pathname === "/loe" || 
                         pathname === "/gap-letter";

  return (
    <nav className="hidden md:flex gap-8 items-center">
      <Link
        href="/"
        className={`transition-colors text-sm tracking-wide pb-1 ${
          pathname === "/"
            ? "text-[#3B82F6] border-b-2 border-[#3B82F6] font-bold"
            : "text-[#9CA3AF] hover:text-[#F9FAFB]"
        }`}
      >
        Solutions
      </Link>
      <Link
        href="/ai-writer"
        className={`transition-colors text-sm tracking-wide pb-1 ${
          isWriterActive
            ? "text-[#3B82F6] border-b-2 border-[#3B82F6] font-bold"
            : "text-[#9CA3AF] hover:text-[#F9FAFB]"
        }`}
      >
        AI Writer
      </Link>
      <Link
        href="/dashboard"
        className={`transition-colors text-sm tracking-wide pb-1 ${
          pathname === "/dashboard"
            ? "text-[#3B82F6] border-b-2 border-[#3B82F6] font-bold"
            : "text-[#9CA3AF] hover:text-[#F9FAFB]"
        }`}
      >
        Dashboard
      </Link>
    </nav>
  );
}
