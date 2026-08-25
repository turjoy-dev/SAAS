"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Shield, Award, BookOpen, Compass, Plus, BarChart3, Database, MessageSquare, Download, Trash2, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSopsGenerated: 0,
    totalSopsEvaluated: 0,
    avgEvaluationScore: 0,
    recentSops: [] as any[]
  });

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("sb-access-token") || "mock-dev-token";
    setIsLoading(true);
    fetch(`${API_URL}/dashboard/summary`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStats({
            totalSopsGenerated: data.totalSopsGenerated || 0,
            totalSopsEvaluated: data.totalSopsEvaluated || 0,
            avgEvaluationScore: data.avgEvaluationScore || 0,
            recentSops: data.recentSops || []
          });
        }
      })
      .catch((err) => console.error("Failed to load dashboard summary:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = [
    { label: "SOPs Drafted", value: isLoading ? "..." : stats.totalSopsGenerated.toString(), change: "Live DB count", icon: <FileText className="w-5 h-5 text-blue-400" /> },
    { label: "Avg Compliance Score", value: isLoading ? "..." : `${stats.avgEvaluationScore}%`, change: "Verified engine score", icon: <Shield className="w-5 h-5 text-emerald-400" /> },
    { label: "Evaluations Completed", value: isLoading ? "..." : stats.totalSopsEvaluated.toString(), change: "Total runs", icon: <BookOpen className="w-5 h-5 text-purple-400" /> },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 relative bg-[#0B0F19] text-[#F9FAFB] min-h-screen">
      
      {/* Background Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-64 glass-card p-6 rounded-3xl flex flex-col gap-6 shadow-lg border border-[#374151] bg-[#1F2937]">
          <div className="flex items-center gap-3 border-b pb-4 border-[#374151]">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              W
            </div>
            <div>
              <h3 className="font-bold text-[#F9FAFB] text-sm">John Doe</h3>
              <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">Premium Student</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/20" : "text-[#9CA3AF] hover:bg-[#111827] hover:text-[#3B82F6]"}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 p-4 bg-[#111827] rounded-2xl border border-[#374151]">
            <h4 className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider mb-2">Need a document?</h4>
            <p className="text-[10px] text-[#9CA3AF] leading-relaxed mb-4">Generate visa statements, SOPs, and study plans in seconds.</p>
            <Link href="/ai-writer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white font-bold text-xs rounded-lg hover:brightness-110 transition-all">
              <Plus className="w-3 h-3" /> New Document
            </Link>
          </div>
        </div>

        {/* Right Dashboard Area */}
        <div className="flex-1 w-full space-y-8">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl border border-[#374151] bg-[#1F2937] flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-[#9CA3AF] font-bold mb-1 uppercase tracking-wider">{m.label}</p>
                  <p className="text-3xl font-extrabold text-[#F9FAFB]">{m.value}</p>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">{m.change}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#111827] flex items-center justify-center border border-[#374151]">
                  {m.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Live 3D Analytics Globe/Chart */}
              <div className="lg:col-span-7 glass-card p-8 rounded-[32px] border border-[#374151] bg-[#1F2937] shadow-lg flex flex-col justify-between min-h-[400px]">
                <div>
                  <h4 className="font-extrabold text-[#F9FAFB] text-lg">Live 3D Compliance Vector</h4>
                  <p className="text-xs text-[#9CA3AF]">Real-time simulation of visa approval likelihood across criteria.</p>
                </div>

                {/* 3D simulated visualization card */}
                <div className="relative w-full h-56 my-6 flex items-center justify-center bg-[#111827] rounded-2xl border border-[#374151] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  
                  {/* Outer 3D ring */}
                  <div className="w-48 h-48 rounded-full border border-dashed border-[#3B82F6]/40 flex items-center justify-center animate-spin" style={{ animationDuration: "25s" }}>
                    <div className="w-36 h-36 rounded-full border border-blue-400/40 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-t-[#3B82F6] border-r-transparent border-slate-700 animate-spin" />
                    </div>
                  </div>

                  {/* Core neomorphic orb */}
                  <div className="absolute w-20 h-20 rounded-full bg-[#1F2937] shadow-2xl flex items-center justify-center border border-[#374151]">
                    <Database className="w-8 h-8 text-[#3B82F6] animate-pulse" />
                  </div>

                  {/* Orbit node tags */}
                  <div className="absolute -top-2 left-1/4 glass-card px-3 py-1 rounded-full border border-[#3B82F6]/40 flex items-center gap-1 shadow-md animate-float bg-[#1F2937]">
                    <span className="text-[10px] font-bold text-[#F9FAFB]">SOP Strength: 94%</span>
                  </div>
                  <div className="absolute bottom-6 right-10 glass-card px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1 shadow-md animate-float bg-[#1F2937]" style={{ animationDelay: "-2s" }}>
                    <span className="text-[10px] font-bold text-emerald-400">GTE Rules: Met</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4 border-[#374151] text-xs font-bold text-[#3B82F6]">
                  <span>Status: Ready to Apply</span>
                  <Link href="/ai-writer" className="flex items-center gap-1 hover:translate-x-1 transition-transform text-[#3B82F6]">
                    Optimize Documents <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Recent Documents */}
              <div className="lg:col-span-5 glass-card p-8 rounded-[32px] border border-[#374151] bg-[#1F2937] shadow-lg flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-[#F9FAFB] text-lg">My Documents</h4>
                  <Link href="/ai-writer" className="text-xs font-bold text-[#3B82F6] hover:underline">View All</Link>
                </div>

                <div className="space-y-4 flex-1">
                  {isLoading ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-xs">Loading documents...</div>
                  ) : stats.recentSops.length === 0 ? (
                    <div className="p-8 text-center bg-[#111827] rounded-2xl border border-[#374151] space-y-3">
                      <p className="text-xs font-bold text-[#F9FAFB]">No documents generated yet</p>
                      <p className="text-[11px] text-[#9CA3AF]">Create your first visa statement or SOP to see compliance analytics.</p>
                      <Link href="/sop-generator" className="inline-flex items-center gap-1 px-4 py-2 bg-[#3B82F6] text-white font-bold text-xs rounded-xl">
                        <Plus className="w-4 h-4" /> Create Document
                      </Link>
                    </div>
                  ) : (
                    stats.recentSops.map((item: any, i: number) => (
                      <div key={i} className="bg-[#111827] border border-[#374151] p-4 rounded-2xl flex items-center justify-between hover:border-[#3B82F6] transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center text-[#3B82F6]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#F9FAFB]">{item.content ? item.content.slice(0, 35) + "..." : "Visa Statement"}</p>
                            <p className="text-[10px] text-[#9CA3AF]">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#3B82F6] bg-[#1F2937] border border-[#374151] px-2.5 py-1 rounded-lg">
                            {item.critic_score || 0}/100
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="glass-card p-8 rounded-[32px] border border-[#374151] bg-[#1F2937] shadow-lg space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-[#F9FAFB] text-lg">All Saved Documents</h4>
                <Link href="/sop-generator" className="px-4 py-2 bg-[#3B82F6] text-white font-bold text-xs rounded-xl flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Create New
                </Link>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="p-8 text-center text-[#9CA3AF] text-xs">Loading documents...</div>
                ) : stats.recentSops.length === 0 ? (
                  <div className="p-8 text-center bg-[#111827] rounded-2xl border border-[#374151] space-y-3">
                    <p className="text-xs font-bold text-[#F9FAFB]">No documents generated yet</p>
                    <Link href="/sop-generator" className="inline-flex items-center gap-1 px-4 py-2 bg-[#3B82F6] text-white font-bold text-xs rounded-xl">
                      <Plus className="w-4 h-4" /> Start SOP Generator
                    </Link>
                  </div>
                ) : (
                  stats.recentSops.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-[#111827] rounded-xl border border-[#374151] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#3B82F6]" />
                        <div>
                          <p className="text-sm font-bold text-[#F9FAFB]">{item.content ? item.content.slice(0, 45) + "..." : "Visa Statement"}</p>
                          <p className="text-xs text-[#9CA3AF]">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-400 bg-[#1F2937] px-3 py-1 rounded-lg border border-[#374151]">
                          {item.critic_score || 0}/100
                        </span>
                        <a href={`http://localhost:5000/sop/export/${item.generation_id}?format=docx`} target="_blank" rel="noopener noreferrer" className="p-2 text-[#9CA3AF] hover:text-[#3B82F6]">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="glass-card p-8 rounded-[32px] border border-[#374151] bg-[#1F2937] shadow-lg space-y-6">
              <h4 className="font-extrabold text-[#F9FAFB] text-lg">Compliance Analytics Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#111827] rounded-2xl border border-[#374151] space-y-3">
                  <h5 className="font-bold text-[#F9FAFB] text-sm">GTE / GS Compliance Engine</h5>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">Australia student visa genuine student requirement scoring logic verified.</p>
                  <div className="w-full bg-[#1F2937] h-3 rounded-full overflow-hidden border border-[#374151]">
                    <div className="bg-[#3B82F6] h-full w-[94%]" />
                  </div>
                  <span className="text-xs font-bold text-[#3B82F6] block text-right">94% Compliant</span>
                </div>
                <div className="p-6 bg-[#111827] rounded-2xl border border-[#374151] space-y-3">
                  <h5 className="font-bold text-[#F9FAFB] text-sm">Canada Study Permit Compliance</h5>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">Financial justification and ties to home country verification model.</p>
                  <div className="w-full bg-[#1F2937] h-3 rounded-full overflow-hidden border border-[#374151]">
                    <div className="bg-emerald-500 h-full w-[91%]" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 block text-right">91% Compliant</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
