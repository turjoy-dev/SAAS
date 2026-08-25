"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Shield, Award, BookOpen, User, FileCheck, Clock, ArrowRight, Brain } from "lucide-react";

export default function AiWriterDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const documents = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Statement of Purpose (SOP)",
      desc: "Create personalized, university-specific SOPs for admission applications.",
      tag: "📝 Admission",
      href: "/sop-generator",
      color: "from-blue-900/40 to-indigo-900/40",
      borderColor: "border-[#374151]",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Genuine Student (GS) Statement",
      desc: "Generate Australia-compliant GS statements that align with current student visa requirements.",
      tag: "🇦🇺 Australia Visa",
      href: "/gs-statement",
      color: "from-emerald-900/40 to-cyan-900/40",
      borderColor: "border-[#374151]",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Motivation Letter",
      desc: "Write compelling motivation letters for universities, scholarships, and academic programs.",
      tag: "🎯 Scholarship",
      href: "/motivation-letter",
      color: "from-purple-900/40 to-pink-900/40",
      borderColor: "border-[#374151]",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Study Plan",
      desc: "Build structured study plans explaining your academic journey, course choice, and future career goals.",
      tag: "📚 Academic Roadmap",
      href: "/study-plan",
      color: "from-cyan-900/40 to-blue-900/40",
      borderColor: "border-[#374151]",
    },
    {
      icon: <User className="w-8 h-8" />,
      title: "Personal Statement",
      desc: "Create authentic personal statements highlighting your background, experiences, achievements, and aspirations.",
      tag: "👤 Profile",
      href: "/personal-statement",
      color: "from-amber-900/40 to-orange-900/40",
      borderColor: "border-[#374151]",
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Letter of Explanation (LOE)",
      desc: "Generate professional Letters of Explanation for study permits, visa applications, or other supporting documents.",
      tag: "📄 Visa Support",
      href: "/loe",
      color: "from-teal-900/40 to-emerald-900/40",
      borderColor: "border-[#374151]",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Gap Explanation Letter",
      desc: "Professionally explain study or employment gaps with clear timelines, productive activities, and future academic plans.",
      tag: "⏳ Timeline Gap",
      href: "/gap-letter",
      color: "from-rose-900/40 to-pink-900/40",
      borderColor: "border-[#374151]",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 relative min-h-[60vh] flex flex-col justify-center bg-[#0B0F19] text-[#F9FAFB]">
      
      {/* Background Aura */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />

      {loading ? (
        /* Sleek 2-second Loading State */
        <div className="text-center py-20 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-t-[#3B82F6] border-slate-700 animate-spin" />
            <Brain className="w-8 h-8 text-[#3B82F6] animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F9FAFB]">Initializing AI Writing Workspace</h2>
            <p className="text-xs text-[#9CA3AF] mt-1">Loading document generation models...</p>
          </div>
        </div>
      ) : (
        /* Render Document Selection Cards with clean fade-in */
        <div className="transition-all duration-500 opacity-100 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3B82F6]/30 bg-[#1F2937] shadow-sm text-xs font-bold text-[#3B82F6] mb-4">
              <span>✨ AI Writing Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F9FAFB] mb-4">
              Select Document Type
            </h1>
            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto leading-relaxed">
              Choose from our specialized AI models to begin crafting your global mobility documents.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className={`glass-card p-8 rounded-2xl tilt-card group shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col border ${doc.borderColor} hover:border-[#3B82F6] bg-[#1F2937]`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform border border-white/10`}>
                    {doc.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider bg-[#111827] px-3 py-1 rounded-full border border-[#374151]">
                    {doc.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F9FAFB] mb-3 group-hover:text-[#3B82F6] transition-colors">
                  {doc.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6 flex-1">
                  {doc.desc}
                </p>
                <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm mt-auto">
                  <span>Start Document</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
