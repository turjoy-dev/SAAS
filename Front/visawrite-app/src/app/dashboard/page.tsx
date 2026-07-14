"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Shield, Award, BookOpen, Compass, Plus, BarChart3, Database, MessageSquare, Download, Trash2, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const metrics = [
    { label: "SOPs Drafted", value: "3", change: "+1 this week", icon: <FileText className="w-5 h-5 text-blue-600" /> },
    { label: "Compliance Score", value: "96%", change: "Excellent", icon: <Shield className="w-5 h-5 text-emerald-600" /> },
    { label: "Active Plans", value: "2", change: "Australia & Canada", icon: <BookOpen className="w-5 h-5 text-purple-600" /> },
  ];

  const recentDocs = [
    { title: "Master of Data Science SOP", uni: "RMIT University", date: "July 09, 2026", score: "94/100", type: "SOP" },
    { title: "Genuine Student (GS) Statement", uni: "University of Sydney", date: "July 08, 2026", score: "98/100", type: "GS" },
    { title: "Canada Study Permit LOE", uni: "York University", date: "July 05, 2026", score: "91/100", type: "LOE" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 relative">
      
      {/* Background Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-64 glass-card p-6 rounded-3xl flex flex-col gap-6 shadow-lg border border-white/80">
          <div className="flex items-center gap-3 border-b pb-4 border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-lg">
              W
            </div>
            <div>
              <h3 className="font-bold text-[#0b1c30] text-sm">John Doe</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Premium Student</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: "overview", label: "Dashboard Overview", icon: <Compass className="w-4 h-4" /> },
              { id: "documents", label: "My Documents", icon: <FileText className="w-4 h-4" /> },
              { id: "analytics", label: "Compliance Analytics", icon: <BarChart3 className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-[#1e3a8a] text-white shadow-md shadow-blue-900/10" : "text-slate-600 hover:bg-[#eff4ff] hover:text-[#1e3a8a]"}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 p-4 bg-gradient-to-br from-[#eff4ff] to-[#dce9ff]/40 rounded-2xl border border-blue-200/50">
            <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider mb-2">Need a document?</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-4">Generate visa statements, SOPs, and study plans in seconds.</p>
            <Link href="/ai-writer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-bold text-xs rounded-lg hover:brightness-110 transition-all">
              <Plus className="w-3 h-3" /> New Document
            </Link>
          </div>
        </div>

        {/* Right Dashboard Area */}
        <div className="flex-1 w-full space-y-8">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl border border-white/80 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">{m.label}</p>
                  <p className="text-3xl font-extrabold text-[#0b1c30]">{m.value}</p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">{m.change}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-white">
                  {m.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Live 3D Analytics Globe/Chart */}
              <div className="lg:col-span-7 glass-card p-8 rounded-[32px] border border-white/80 shadow-lg flex flex-col justify-between min-h-[400px]">
                <div>
                  <h4 className="font-extrabold text-[#0b1c30] text-lg">Live 3D Compliance Vector</h4>
                  <p className="text-xs text-slate-500">Real-time simulation of visa approval likelihood across criteria.</p>
                </div>

                {/* 3D simulated visualization card */}
                <div className="relative w-full h-56 my-6 flex items-center justify-center bg-gradient-to-t from-[#eff4ff]/20 to-transparent rounded-2xl border border-slate-200/40 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  
                  {/* Outer 3D ring */}
                  <div className="w-48 h-48 rounded-full border border-dashed border-[#1e3a8a]/20 flex items-center justify-center animate-spin" style={{ animationDuration: "25s" }}>
                    <div className="w-36 h-36 rounded-full border border-blue-400/30 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-t-[#06b6d4] border-r-transparent border-slate-200 animate-spin" />
                    </div>
                  </div>

                  {/* Core neomorphic orb */}
                  <div className="absolute w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center border border-white">
                    <Database className="w-8 h-8 text-[#1e3a8a] animate-pulse" />
                  </div>

                  {/* Orbit node tags */}
                  <div className="absolute -top-2 left-1/4 glass-card px-3 py-1 rounded-full border border-[#1e3a8a]/20 flex items-center gap-1 shadow-md animate-float">
                    <span className="text-[10px] font-bold text-slate-800">SOP Strength: 94%</span>
                  </div>
                  <div className="absolute bottom-6 right-10 glass-card px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 shadow-md animate-float" style={{ animationDelay: "-2s" }}>
                    <span className="text-[10px] font-bold text-slate-800">GTE Rules: Met</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4 border-slate-200/60 text-xs font-bold text-[#1e3a8a]">
                  <span>Status: Ready to Apply</span>
                  <Link href="/ai-writer" className="flex items-center gap-1 hover:translate-x-1 transition-transform">
                    Optimize Documents <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Recent Documents */}
              <div className="lg:col-span-5 glass-card p-8 rounded-[32px] border border-white/80 shadow-lg flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-[#0b1c30] text-lg">My Documents</h4>
                  <Link href="/ai-writer" className="text-xs font-bold text-[#1e3a8a] hover:underline">View All</Link>
                </div>

                <div className="space-y-4 flex-1">
                  {recentDocs.map((doc, i) => (
                    <div key={i} className="bg-white/60 border border-[#c5c5d3]/30 p-4 rounded-2xl flex items-center justify-between hover:border-[#1e3a8a] hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#1e3a8a]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0b1c30]">{doc.title}</p>
                          <p className="text-[10px] text-slate-500">{doc.uni}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#1e3a8a] bg-[#eff4ff] px-2.5 py-1 rounded-lg">
                          {doc.score}
                        </span>
                        <p className="text-[9px] text-slate-500 mt-1">{doc.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="glass-card p-8 rounded-[32px] border border-white/80 shadow-lg space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-[#0b1c30] text-lg">All Saved Documents</h4>
                <Link href="/ai-writer" className="px-4 py-2 bg-[#1e3a8a] text-white font-bold text-xs rounded-xl flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Create New
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentDocs.map((doc, i) => (
                  <div key={i} className="bg-white/80 border border-[#c5c5d3]/30 p-6 rounded-2xl flex flex-col justify-between hover:border-[#1e3a8a] hover:shadow-md transition-all gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#1e3a8a]">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-[#0b1c30] text-sm">{doc.title}</h5>
                          <p className="text-xs text-slate-500">{doc.uni}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#1e3a8a] bg-[#eff4ff] px-2.5 py-1 rounded-lg">
                        {doc.score}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t pt-4 border-slate-200/60 mt-2">
                      <span className="text-[10px] text-slate-500">Saved {doc.date}</span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 shadow-sm">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 border border-rose-200 shadow-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="glass-card p-8 rounded-[32px] border border-white/80 shadow-lg space-y-6">
              <h4 className="font-extrabold text-[#0b1c30] text-lg">Compliance Score Breakdown</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our AI analyzes your documents against specific immigration laws, university enrollment filters, and previous visa officer decision patterns.
              </p>

              <div className="space-y-6 pt-4">
                {[
                  { criteria: "Financial Capacity ties", score: 98, status: "Excellent", desc: "No red flags. Documents clearly prove source of funds." },
                  { criteria: "Academic Intent (SOP Match)", score: 92, status: "Very Strong", desc: "Solid connection between prior study and target course." },
                  { criteria: "Genuine Student (GS) compliance", score: 95, status: "Excellent", desc: "Timeline explanations and return plan are fully articulated." },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{item.criteria}</span>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-[#1e3a8a]">{item.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-[#1e3a8a] rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
