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
            ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] font-bold"
            : "text-[#444651] hover:text-[#1e3a8a]"
        }`}
      >
        Solutions
      </Link>
      <Link
        href="/ai-writer"
        className={`transition-colors text-sm tracking-wide pb-1 ${
          isWriterActive
            ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] font-bold"
            : "text-[#444651] hover:text-[#1e3a8a]"
        }`}
      >
        AI Writer
      </Link>
      <Link
        href="/dashboard"
        className={`transition-colors text-sm tracking-wide pb-1 ${
          pathname === "/dashboard"
            ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] font-bold"
            : "text-[#444651] hover:text-[#1e3a8a]"
        }`}
      >
        Dashboard
      </Link>
    </nav>
  );
}
