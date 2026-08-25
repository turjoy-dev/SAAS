"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, CheckCircle2, ChevronRight, Activity, Award, Shield, Play, Brain, Zap, Globe2, ArrowRight, Check, X, ChevronDown } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    totalSopsGenerated: 142,
    totalSopsEvaluated: 586,
    avgEvaluationScore: 78
  });

  useEffect(() => {
    fetch("http://localhost:5000/dashboard/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalSopsEvaluated !== undefined) {
          setStats({
            totalSopsGenerated: data.totalSopsGenerated || 0,
            totalSopsEvaluated: data.totalSopsEvaluated || 0,
            avgEvaluationScore: data.avgEvaluationScore || 78
          });
        }
      })
      .catch(() => {});
  }, []);

  // Scroll reveal effect
  useEffect(() => {
    const reveal = () => {
      const reveals = document.querySelectorAll(".reveal");
      reveals.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 150) {
          el.classList.add("active");
        }
      });
    };
    window.addEventListener("scroll", reveal);
    reveal();
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  // Tilt card effect
  useEffect(() => {
    const cards = document.querySelectorAll(".tilt-card");
    cards.forEach((card) => {
      const el = card as HTMLElement;
      const handleMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      };
      const handleLeave = () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      };
      el.addEventListener("mousemove", handleMove as any);
      el.addEventListener("mouseleave", handleLeave);
    });
  }, []);

  return (
    <div className="flex flex-col relative font-sans bg-[#0B0F19] text-[#F9FAFB]">

      {/* ═══════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[#0B0F19]">
        {/* Soft Morphing Background Blobs */}
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-blue-600/15 rounded-full blur-[90px] animate-blob-slow pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[100px] animate-blob-fast pointer-events-none" />
        <div className="absolute top-[10%] right-[30%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] animate-blob-slow pointer-events-none" style={{ animationDelay: "-4s" }} />

        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal active">
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold mb-6 leading-tight tracking-[-0.04em] text-[#F9FAFB]">
              Write Your Way Abroad with{" "}
              <span className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent">
                AI Excellence.
              </span>
            </h1>
            <p className="text-lg text-[#93C5FD] mb-10 max-w-xl leading-relaxed">
              Craft high-impact Statements of Purpose, Motivation Letters, and Visa Statements with the world&apos;s most advanced AI for global mobility.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/ai-writer"
                className="px-8 py-4 bg-[#3B82F6] text-white font-bold rounded-xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-1"
              >
                Start Generating Free
              </Link>
              <Link
                href="/ai-writer"
                className="px-8 py-4 glass-card font-bold rounded-xl flex items-center gap-2 hover:bg-[#273549] transition-all text-[#3B82F6] border-[#3B82F6]/30"
              >
                <Play className="w-5 h-5 text-[#3B82F6]" />
                View Samples
              </Link>
            </div>
          </div>
          <div className="relative reveal delay-200 active">
            <div className="animate-float">
              <img 
                alt="3D illustration of global documents" 
                className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoqkpejkKhAuC1rQHuVoQnFp9QZVTy6eI-T8WuxgU6V64eWGw3-0ZxOoJJpWfc5n3Tg7kgmVdk7nux7sbXdEHucSxLcSj_0CbmzeTdhvBEV3AH2KZ468suGPMUAZpx_rLqjkRLs--ShXC5JCl2dPqfYDh1UXq6WV1Vy7XPVmKFjGXl065XI60KHEQwvUUbFr44rS4RyeJrXN3XQNRlptiY6geqi6L5ABmfJ5rEXLLCLDYvP5b3nUHLLA" 
              />
            </div>
            {/* Floating tag */}
            <div className="absolute -top-4 -left-4 glass-card p-4 rounded-2xl flex items-center gap-3 animate-float z-20 border-[#3B82F6]/30 shadow-xl bg-[#1F2937]/90">
              <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3B82F6]">Context Aware</p>
                <p className="text-xs text-[#93C5FD]">Global nuances detected</p>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3B82F6]/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#3B82F6]/10 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* AI HUMANIZER SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[80vh] flex items-center py-[120px] px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left - Visual */}
          <div className="relative perspective-container order-2 lg:order-1">
            <div className="glass-card p-1 rounded-3xl overflow-hidden shadow-2xl tilt-card border-[#3B82F6]/20 bg-[#1F2937]">
              <img 
                alt="3D Cinematic AI Transformation Engine" 
                className="w-full h-auto rounded-[22px] brightness-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2ij767MUDsgx5aTKJY-glvbznqwuD37hnCcHjth17ci2YErPdvsACod4yR2eo903fprKM86A3G6Ccv3Eu7trSvSfmH_IkOLj5KRFoZG2EfJrfdNj8sGEKdSrp4k9pY3m0V00SlgPaYFte9dSd7P3j9ISYpzxu-84ULpazDXE2eodGz1IRjiqgjh-UQtl9bjVGp4FNLaBPAi6as7b2tIVf0_PwhYwwCste9mPRFGjL5TjLrDJs__jw1A" 
              />
            </div>
          </div>
          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] font-bold text-xs uppercase tracking-widest border border-[#3B82F6]/30">
                Natural Intelligence
              </span>
              <h2 className="text-3xl sm:text-[48px] font-semibold leading-tight tracking-[-0.02em] text-[#F9FAFB]">
                Turn AI Writing Into Authentic Human Stories
              </h2>
              <p className="text-lg text-[#93C5FD] max-w-xl leading-relaxed">
                Generate documents that sound natural and personal. Our AI Humanizer transforms robotic text into authentic narratives that admission officers value.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-2">
              {["Human-like writing", "Admission-friendly tone", "Removes AI patterns", "Stronger connection"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full check-gradient flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[#93C5FD] text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="/ai-writer" className="group inline-flex items-center gap-2 px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all">
                Experience the difference
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* GLOBAL COMPLIANCE SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[80vh] flex items-center py-[120px] px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto bg-[#111827]/60 reveal rounded-3xl my-8 border border-[#1F2937]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-[#1F2937] text-[#3B82F6] font-bold text-xs uppercase tracking-widest border border-[#3B82F6]/30">
                Global Compliance
              </span>
              <h2 className="text-3xl sm:text-[48px] font-bold leading-tight tracking-[-0.02em] text-[#F9FAFB]">
                Follows Every Country&apos;s Requirements
              </h2>
              <p className="text-lg text-[#93C5FD] max-w-xl leading-relaxed">
                Our engine automatically adapts your writing according to official expectations, university guidelines, and document requirements for your target destination.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-[#3B82F6] font-bold">AI Automatically Adjusts:</p>
              <div className="flex flex-wrap gap-3">
                {["Document Structure", "Writing Style", "Required Sections", "Compliance Checks"].map((item) => (
                  <span key={item} className="px-4 py-2 glass-card rounded-xl text-xs font-semibold text-[#93C5FD] border-[#3B82F6]/20 hover:border-[#3B82F6] transition-all shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Right - Flag Design Cards Container */}
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-[500px] glass-card rounded-[40px] p-8 border-[#374151] shadow-2xl relative bg-[#1F2937]/90 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-[#3B82F6] mb-6 tracking-wide uppercase">Supported Destinations</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { code: "gb", country: "United Kingdom", desc: "CAS Ready Documents" },
                  { code: "ie", country: "Ireland", desc: "Visa Support Specialist" },
                  { code: "au", country: "Australia", desc: "GS Visa Compliant" },
                  { code: "kr", country: "South Korea", desc: "GS Compliant" },
                  { code: "ca", country: "Canada", desc: "Study Permit Specialist" },
                  { code: "my", country: "Malaysia", desc: "GS Compliant" },
                  { code: "de", country: "Germany", desc: "Uni-Assist Format" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#111827] border border-[#374151] p-4 rounded-2xl hover:border-[#3B82F6] hover:shadow-md transition-all flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#374151]">
                      <img src={`https://flagcdn.com/${item.code}.svg`} alt={item.country} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#F9FAFB]">{item.country}</p>
                      <p className="text-[10px] text-[#93C5FD] font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating Country Badges */}
            <div className="absolute -top-6 left-6 glass-card px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-float border-[#3B82F6]/30 bg-[#1F2937]">
              <img src="https://flagcdn.com/ca.svg" alt="Canada" className="w-5 h-3.5 object-cover rounded-sm" />
              <span className="text-xs font-bold text-[#3B82F6]">Canada</span>
            </div>
            <div className="absolute bottom-6 -left-6 glass-card px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-float border-[#3B82F6]/30 bg-[#1F2937]" style={{ animationDelay: "-2s" }}>
              <img src="https://flagcdn.com/gb.svg" alt="UK" className="w-5 h-3.5 object-cover rounded-sm" />
              <span className="text-xs font-bold text-[#3B82F6]">UK</span>
            </div>
            <div className="absolute -bottom-6 right-6 glass-card px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-float border-[#3B82F6]/30 bg-[#1F2937]" style={{ animationDelay: "-1s" }}>
              <img src="https://flagcdn.com/au.svg" alt="Australia" className="w-5 h-3.5 object-cover rounded-sm" />
              <span className="text-xs font-bold text-[#3B82F6]">Australia</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* WRITING SUITE – All 7 Document Types */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto">
        <div className="text-center mb-20 reveal">
          <h2 className="text-3xl sm:text-[48px] font-semibold tracking-[-0.02em] mb-4 text-[#F9FAFB]">
            Complete AI Writing Suite
          </h2>
          <p className="text-lg text-[#93C5FD] max-w-2xl mx-auto leading-relaxed">
            Seven specialized AI engines, each trained on thousands of successful documents from top-tier global institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FileText className="w-7 h-7" />,
              title: "Statement of Purpose",
              desc: "Create personalized, university-specific SOPs for admission applications.",
              tag: "📝 SOP",
              href: "/sop-generator",
              color: "from-blue-900/40 to-indigo-900/40",
              borderColor: "border-[#374151]",
            },
            {
              icon: <Shield className="w-7 h-7" />,
              title: "Genuine Student (GS)",
              desc: "Generate Australia-compliant GS statements for student visa requirements.",
              tag: "🇦🇺 Australia",
              href: "/gs-statement",
              color: "from-emerald-900/40 to-cyan-900/40",
              borderColor: "border-[#374151]",
            },
            {
              icon: <Award className="w-7 h-7" />,
              title: "Motivation Letter",
              desc: "Write compelling motivation letters for universities, scholarships, and academic programs.",
              tag: "🎯 Scholarship Ready",
              href: "/motivation-letter",
              color: "from-purple-900/40 to-pink-900/40",
              borderColor: "border-[#374151]",
            },
            {
              icon: <BookOpen className="w-7 h-7" />,
              title: "Study Plan",
              desc: "Build structured study plans explaining your academic journey and career goals.",
              tag: "📚 Visa Roadmap",
              href: "/study-plan",
              color: "from-cyan-900/40 to-blue-900/40",
              borderColor: "border-[#374151]",
            },
            {
              icon: <Activity className="w-7 h-7" />,
              title: "Personal Statement",
              desc: "Create authentic personal statements highlighting your background and aspirations.",
              tag: "👤 Personal",
              href: "/personal-statement",
              color: "from-amber-900/40 to-orange-900/40",
              borderColor: "border-[#374151]",
            },
            {
              icon: <CheckCircle2 className="w-7 h-7" />,
              title: "Letter of Explanation",
              desc: "Generate professional LOEs for study permits, visa applications, or supporting documents.",
              tag: "📄 Visa Support",
              href: "/loe",
              color: "from-teal-900/40 to-emerald-900/40",
              borderColor: "border-[#374151]",
            },
            {
              icon: <Globe2 className="w-7 h-7" />,
              title: "Gap Explanation Letter",
              desc: "Professionally explain study or employment gaps with clear timelines and future plans.",
              tag: "⏳ Gap Justification",
              href: "/gap-letter",
              color: "from-rose-900/40 to-pink-900/40",
              borderColor: "border-[#374151]",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`glass-card p-8 rounded-2xl tilt-card group reveal shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col border ${card.borderColor} hover:border-[#3B82F6]`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform border border-white/10`}>
                  {card.icon}
                </div>
                <span className="text-[10px] font-bold text-[#93C5FD] uppercase tracking-wider bg-[#111827] px-3 py-1 rounded-full border border-[#374151]">
                  {card.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F9FAFB] mb-3 group-hover:text-[#3B82F6] transition-colors">
                {card.title}
              </h3>
              <p className="text-[#93C5FD] text-sm leading-relaxed mb-6 flex-1">
                {card.desc}
              </p>
              <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm mt-auto">
                <span>Start Writing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* HOW IT WORKS – From Dream to Documentation */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] bg-[#111827]/80 overflow-hidden border-y border-[#1F2937]">
        <div className="px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto reveal">
          <h2 className="text-3xl sm:text-[48px] font-semibold tracking-[-0.02em] text-center mb-8 text-[#F9FAFB]">
            From Dream to Documentation
          </h2>
          <div className="relative mt-24">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent -translate-y-1/2 hidden md:block">
              <div className="absolute inset-0 bg-[#3B82F6]/20 blur-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {[
                { step: "1", title: "Build Profile", desc: "Tell us your history & dreams" },
                { step: "2", title: "Smart Q&A", desc: "Our AI asks deep questions" },
                { step: "3", title: "AI Generation", desc: "Magic happens in seconds" },
                { step: "4", title: "Review & Edit", desc: "Fine-tune with human soul" },
                { step: "5", title: "Export Document", desc: "PDF & Word, ready to ship" },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full glass-card border border-[#374151] flex items-center justify-center mb-6 relative transition-all group-hover:scale-110 group-hover:bg-[#3B82F6]/20 group-hover:border-[#3B82F6] shadow-sm bg-[#1F2937]">
                    <span className="font-bold text-[#3B82F6]">{item.step}</span>
                  </div>
                  <div className="glass-card p-6 rounded-xl text-center w-full bg-[#1F2937] shadow-sm border border-[#374151]">
                    <h4 className="font-bold mb-2 text-[#F9FAFB]">{item.title}</h4>
                    <p className="text-xs text-[#93C5FD]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* INTELLIGENCE ENGINE */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] overflow-hidden reveal">
        <div className="px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-[48px] font-semibold tracking-[-0.02em] mb-6 text-[#F9FAFB]">The Intelligence Engine</h2>
            <p className="text-lg text-[#93C5FD] mb-8 leading-relaxed">
              Unlike generic AI, WriteAbroad utilizes a specialized RAG pipeline that references actual university catalogs and visa laws in real-time.
            </p>
            <div className="space-y-6">
              {[
                { icon: <Brain className="w-5 h-5" />, title: "Knowledge Engine", desc: "300k+ Successful admission dossier references." },
                { icon: <Activity className="w-5 h-5" />, title: "AI Reasoning", desc: "Validates your logic against visa officer mental models." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="p-3 rounded-full bg-[#3B82F6]/20 text-[#3B82F6]">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-[#F9FAFB]">{item.title}</h4>
                    <p className="text-sm text-[#93C5FD]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-96 neumorphic-surface rounded-xl flex items-center justify-center overflow-hidden border border-[#374151]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
            <div className="relative z-10 w-32 h-32 bg-[#3B82F6]/20 blur-3xl rounded-full animate-pulse" />
            <Brain className="w-16 h-16 text-[#3B82F6] relative z-20" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* WHY CHOOSE US — Animated Floating Badges */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-[140px] overflow-hidden reveal">
        {/* Background atmospheric effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] via-[#111827]/40 to-[#0B0F19] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Drifting particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 bg-[#3B82F6]/40 rounded-full animate-particle pointer-events-none"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * -1.2}s`,
              animationDuration: `${5 + i}s`,
            }}
          />
        ))}

        <div className="relative z-10 px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] font-bold text-xs uppercase tracking-[0.2em] border border-[#3B82F6]/25 mb-6">
              ✦ Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-[52px] font-extrabold tracking-[-0.03em] text-[#F9FAFB] mb-4">
              Built Different.{" "}
              <span className="bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#3B82F6] bg-clip-text text-transparent animate-shimmer-text">
                Built to Win.
              </span>
            </h2>
            <p className="text-lg text-[#93C5FD] max-w-2xl mx-auto leading-relaxed">
              Our AI engine combines deep institutional knowledge, visa law compliance, and human authenticity scoring — all in one platform.
            </p>
          </div>

          {/* Central Orbital Visual with Floating Badges */}
          <div className="relative w-full flex items-center justify-center" style={{ minHeight: "600px" }}>
            
            {/* Outermost rotating dashed ring */}
            <div className="absolute w-[520px] h-[520px] rounded-full border border-dashed border-[#3B82F6]/15 animate-spin-slow pointer-events-none" />
            
            {/* Middle rotating ring (reverse) */}
            <div className="absolute w-[380px] h-[380px] rounded-full border border-[#3B82F6]/10 animate-spin-reverse-slow pointer-events-none" />
            
            {/* Inner pulse ring */}
            <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-[#3B82F6]/20 animate-pulse-ring pointer-events-none" />
            
            {/* Glow core */}
            <div className="absolute w-40 h-40 rounded-full bg-[#3B82F6]/10 blur-[60px] pointer-events-none" />
            
            {/* Central Icon Hub */}
            <div className="relative z-20 w-28 h-28 rounded-full bg-gradient-to-br from-[#1F2937] to-[#111827] border-2 border-[#3B82F6]/40 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.2)]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#1E3A8A]/30 flex items-center justify-center">
                <Zap className="w-10 h-10 text-[#3B82F6]" />
              </div>
            </div>

            {/* Floating Specialty Badges — Each with unique orbital animation */}
            
            {/* Badge 1: Top-Left */}
            <div className="absolute top-[5%] left-[8%] sm:left-[12%] animate-orbit-1 z-30" style={{ animationDelay: "0s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-[#3B82F6]/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-[#3B82F6] hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-400/20 group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">300K+ References</p>
                  <p className="text-[10px] text-[#93C5FD]">Admission dossier knowledge</p>
                </div>
              </div>
            </div>

            {/* Badge 2: Top-Right */}
            <div className="absolute top-[8%] right-[5%] sm:right-[10%] animate-orbit-2 z-30" style={{ animationDelay: "-1.5s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-emerald-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-emerald-400 hover:shadow-[0_8px_30px_rgba(52,211,153,0.15)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-400/20 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">Visa Compliant</p>
                  <p className="text-[10px] text-[#93C5FD]">GTE/GS auto-verified</p>
                </div>
              </div>
            </div>

            {/* Badge 3: Middle-Left */}
            <div className="absolute top-[38%] left-[0%] sm:left-[3%] animate-orbit-3 z-30" style={{ animationDelay: "-3s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-purple-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-purple-400 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-400/20 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">AI Humanizer</p>
                  <p className="text-[10px] text-[#93C5FD]">Removes all AI patterns</p>
                </div>
              </div>
            </div>

            {/* Badge 4: Middle-Right */}
            <div className="absolute top-[42%] right-[0%] sm:right-[3%] animate-orbit-4 z-30" style={{ animationDelay: "-4.5s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-amber-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-amber-400 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-400/20 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">94+ AI Score</p>
                  <p className="text-[10px] text-[#93C5FD]">Avg compliance benchmark</p>
                </div>
              </div>
            </div>

            {/* Badge 5: Bottom-Left */}
            <div className="absolute bottom-[8%] left-[8%] sm:left-[14%] animate-orbit-5 z-30" style={{ animationDelay: "-2s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-cyan-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-cyan-400 hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/20 group-hover:scale-110 transition-transform">
                  <Globe2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">7 Target Countries</p>
                  <p className="text-[10px] text-[#93C5FD]">UK, IE, AU, KR, CA, MY, DE</p>
                </div>
              </div>
            </div>

            {/* Badge 6: Bottom-Right */}
            <div className="absolute bottom-[5%] right-[8%] sm:right-[12%] animate-orbit-6 z-30" style={{ animationDelay: "-5s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-rose-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-rose-400 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center border border-rose-400/20 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">7 Document Types</p>
                  <p className="text-[10px] text-[#93C5FD]">SOP, GS, LOE, Study Plan…</p>
                </div>
              </div>
            </div>

            {/* Badge 7: Top-Center */}
            <div className="absolute top-[-2%] left-1/2 -translate-x-1/2 animate-orbit-1 z-30" style={{ animationDelay: "-6s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-sky-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-sky-400 hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center border border-sky-400/20 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">Groq → Gemini</p>
                  <p className="text-[10px] text-[#93C5FD]">Smart LLM fallback chain</p>
                </div>
              </div>
            </div>

            {/* Badge 8: Bottom-Center */}
            <div className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 animate-orbit-2 z-30" style={{ animationDelay: "-7s" }}>
              <div className="glass-card px-5 py-3.5 rounded-2xl border border-teal-500/25 bg-[#1F2937]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-teal-400 hover:shadow-[0_8px_30px_rgba(45,212,191,0.2)] transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-400/20 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F9FAFB]">Plagiarism Remover</p>
                  <p className="text-[10px] text-[#93C5FD]">100% Original & Undetectable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* DASHBOARD PREVIEW */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] px-6 sm:px-10 lg:px-20 reveal">
        <div className="max-w-[1280px] mx-auto">
          <Link href="/dashboard" className="block relative group hover:scale-[1.01] transition-all cursor-pointer">
            {/* Live Dashboard Tag badge */}
            <div className="absolute top-6 right-6 bg-[#3B82F6] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-30 flex items-center gap-1.5 hover:brightness-110">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Launch Live 3D Dashboard</span>
            </div>
            
            <div className="glass-card p-2 rounded-xl shadow-2xl overflow-hidden border border-[#374151]">
              <div className="bg-[#111827] rounded-lg h-[500px] flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-[#1F2937] bg-[#0B0F19] p-6 hidden md:flex flex-col gap-6">
                  <div className="h-8 w-32 bg-[#3B82F6]/20 rounded mb-8" />
                  <div className="space-y-4">
                    <div className="h-10 bg-[#3B82F6]/20 rounded-lg flex items-center px-4"><div className="w-full h-2 bg-[#3B82F6] rounded" /></div>
                    <div className="h-10 rounded-lg flex items-center px-4 opacity-30"><div className="w-full h-2 bg-[#374151] rounded" /></div>
                    <div className="h-10 rounded-lg flex items-center px-4 opacity-30"><div className="w-full h-2 bg-[#374151] rounded" /></div>
                  </div>
                </div>
                {/* Canvas */}
                <div className="flex-1 p-10 flex flex-col gap-10 overflow-y-auto">
                  <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-[#F9FAFB]">Fall 2025: Columbia Univ. SOP</h3>
                      <p className="text-[#93C5FD] text-sm">Last saved 2 minutes ago</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="px-4 py-2 neumorphic-inset rounded-lg text-xs font-bold text-[#3B82F6]">AI Score: 94/100</div>
                      <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-xs font-bold">Export</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Word Count", value: "742" },
                      { label: "Sentiment", value: "Academic" },
                      { label: "Grammar", value: "Perfect" },
                    ].map((s, i) => (
                      <div key={i} className="glass-card p-6 rounded-lg text-center border-[#374151] bg-[#1F2937] shadow-sm">
                        <p className="text-xs text-[#93C5FD] mb-2">{s.label}</p>
                        <p className="text-2xl font-bold text-[#3B82F6]">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-[#0B0F19] p-10 shadow-inner rounded-xl border border-[#1F2937] min-h-[200px]">
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div className="h-4 bg-[#1F2937] rounded w-full" />
                      <div className="h-4 bg-[#1F2937] rounded w-5/6" />
                      <div className="h-4 bg-[#1F2937] rounded w-full" />
                      <div className="bg-[#3B82F6]/15 rounded w-3/4 p-3 px-4 text-[10px] text-[#3B82F6] italic border-l-2 border-[#3B82F6]">
                        AI has updated this paragraph to emphasize your leadership experience in the debate club.
                      </div>
                      <div className="h-4 bg-[#1F2937] rounded w-full" />
                      <div className="h-4 bg-[#1F2937] rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SUPPORTED COUNTRIES */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] px-6 sm:px-10 lg:px-20 max-w-[1280px] mx-auto reveal">
        <h2 className="text-3xl sm:text-[48px] font-semibold tracking-[-0.02em] text-center mb-16 text-[#F9FAFB]">
          Global Destinations Supported
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { code: "au", name: "Australia", tag: "GTE Compliant" },
            { code: "ca", name: "Canada", tag: "Study Permit Specialist" },
            { code: "gb", name: "UK", tag: "CAS Ready Documents" },
            { code: "de", name: "Germany", tag: "Uni-Assist Format" },
            { code: "ie", name: "Ireland", tag: "Visa Support" },
            { code: "kr", name: "South Korea", tag: "GS Compliant" },
            { code: "my", name: "Malaysia", tag: "GS Compliant" },
          ].map((c) => (
            <div key={c.name} className="glass-card p-8 rounded-xl text-center tilt-card hover:border-[#3B82F6] transition-all group shadow-sm bg-[#1F2937]">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#111827] rounded-full overflow-hidden flex items-center justify-center border border-[#374151] shadow-inner">
                <img
                  alt={`${c.name} Flag`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  src={`https://flagcdn.com/${c.code}.svg`}
                />
              </div>
              <h4 className="font-bold text-[#F9FAFB]">{c.name}</h4>
              <p className="text-[10px] text-[#93C5FD] mt-2 uppercase tracking-wider font-medium">{c.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* PRICING */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] px-6 sm:px-10 lg:px-20 bg-[#111827]/80 border-y border-[#1F2937]">
        <div className="max-w-[1280px] mx-auto reveal">
          <h2 className="text-3xl sm:text-[48px] font-semibold tracking-[-0.02em] text-center mb-16 text-[#F9FAFB]">
            Invest in Your Future
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="glass-card p-10 rounded-xl flex flex-col hover:shadow-2xl transition-all reveal border-[#374151] bg-[#1F2937]">
              <h3 className="text-2xl font-semibold mb-2 text-[#F9FAFB]">Starter</h3>
              <p className="text-[#93C5FD] mb-6">Perfect for a single application.</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-[#F9FAFB]">$29</span>
                <span className="text-[#93C5FD]">/one-time</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[#93C5FD]"><Check className="w-4 h-4 text-[#3B82F6]" /> 1 Statement of Purpose</li>
                <li className="flex items-center gap-3 text-[#93C5FD]"><Check className="w-4 h-4 text-[#3B82F6]" /> 3 AI Revisions</li>
                <li className="flex items-center gap-3 opacity-30 text-[#93C5FD]"><X className="w-4 h-4" /> Visa Statement Generator</li>
              </ul>
              <button className="w-full py-4 border border-[#3B82F6]/40 text-[#3B82F6] font-bold rounded-xl hover:bg-[#3B82F6] hover:text-white transition-all">
                Select Starter
              </button>
            </div>
            {/* Professional */}
            <div className="glass-card p-10 rounded-xl flex flex-col border-2 border-[#3B82F6] relative transform scale-105 shadow-[0_20px_50px_rgba(59,130,246,0.2)] reveal delay-100 bg-[#1F2937]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#3B82F6] text-white text-xs font-bold rounded-full shadow-md">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-[#F9FAFB]">Professional</h3>
              <p className="text-[#93C5FD] mb-6">For serious global applicants.</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-[#F9FAFB]">$59</span>
                <span className="text-[#93C5FD]">/one-time</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[#F9FAFB]"><Check className="w-4 h-4 text-[#3B82F6]" /> Unlimited SOPs & Letters</li>
                <li className="flex items-center gap-3 text-[#F9FAFB]"><Check className="w-4 h-4 text-[#3B82F6]" /> Visa Statement Pro</li>
                <li className="flex items-center gap-3 text-[#F9FAFB]"><Check className="w-4 h-4 text-[#3B82F6]" /> Expert AI Review Score</li>
                <li className="flex items-center gap-3 text-[#F9FAFB]"><Check className="w-4 h-4 text-[#3B82F6]" /> Document Export (Word/PDF)</li>
              </ul>
              <button className="w-full py-4 bg-[#3B82F6] text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">
                Get Professional Access
              </button>
            </div>
            {/* Counselor */}
            <div className="glass-card p-10 rounded-xl flex flex-col hover:shadow-2xl transition-all reveal delay-200 border-[#374151] bg-[#1F2937]">
              <h3 className="text-2xl font-semibold mb-2 text-[#F9FAFB]">Counselor</h3>
              <p className="text-[#93C5FD] mb-6">For agents & consultancies.</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-[#F9FAFB]">Custom</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[#93C5FD]"><Check className="w-4 h-4 text-[#3B82F6]" /> Bulk Management</li>
                <li className="flex items-center gap-3 text-[#93C5FD]"><Check className="w-4 h-4 text-[#3B82F6]" /> White-label Exports</li>
                <li className="flex items-center gap-3 text-[#93C5FD]"><Check className="w-4 h-4 text-[#3B82F6]" /> Priority AI Pipeline</li>
              </ul>
              <button className="w-full py-4 border border-[#374151] text-[#F9FAFB] font-bold rounded-xl hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FAQ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-[120px] px-6 sm:px-10 lg:px-20 max-w-2xl mx-auto reveal">
        <h2 className="text-3xl sm:text-[48px] font-semibold tracking-[-0.02em] text-center mb-16 text-[#F9FAFB]">
          Common Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: "Is the content plagiarism-free?", a: "Yes. Our AI generates original content based on your unique inputs. Each document is run through a check before export." },
            { q: "Does it support all universities?", a: "We support top universities across 7 key countries: UK, Ireland, Australia, South Korea, Canada, Malaysia, and Germany." },
            { q: "Can I edit the AI-generated text?", a: "Absolutely. Our document editor allows you to refine any section or ask the AI to rewrite specific parts in a different tone." },
          ].map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── FAQ Item Component ─── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="neumorphic-surface p-6 rounded-xl cursor-pointer group border border-[#374151] hover:border-[#3B82F6]/50 transition-all bg-[#1F2937]"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-[#F9FAFB]">{question}</h4>
        <ChevronDown className={`w-5 h-5 text-[#3B82F6] transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="mt-4 text-sm text-[#93C5FD] transition-all">{answer}</div>
      )}
    </div>
  );
}
