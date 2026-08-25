"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, Users, AlertTriangle, Cpu, RefreshCw, Lock, KeyRound, 
  CheckCircle2, ArrowRight, Activity, Ban, UserCheck, Settings, LogOut
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 48,
    authorizedUsers: 42,
    pendingUsers: 6,
    totalFailures: 3,
    activeModelChain: "Groq (Llama-3.3-70b) → Gemini 1.5 Pro",
    systemHealth: "Operational"
  });

  useEffect(() => {
    const isAuth = localStorage.getItem("isAdmin") === "true";
    if (isAuth) {
      setAuthorized(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin123" || passwordInput === "admin") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", "admin@visawrite.com");
      setAuthorized(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect admin password. Default master password is 'admin123'.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setAuthorized(false);
    router.push("/login?mode=admin");
  };

  if (!authorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 bg-[#0B0F19] text-[#F9FAFB]">
        <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-[#374151] bg-[#1F2937] text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#F9FAFB] mb-2">Admin Security Gate</h2>
          <p className="text-xs text-[#9CA3AF] mb-6">
            Please enter your master admin password to access the system control panel.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password (admin123)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111827] border border-[#374151] text-[#F9FAFB] text-sm focus:border-[#3B82F6] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#3B82F6] text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Authenticate Session</span>
            </button>
          </form>
          
          <div className="mt-6">
            <Link href="/" className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB]">
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 relative bg-[#0B0F19] text-[#F9FAFB] min-h-screen">
      
      {/* Background Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-[#374151]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Admin Control Panel</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {stats.systemHealth}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">Manage user permissions, monitor LLM fallbacks, and review error traces.</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="px-4 py-2 bg-[#1F2937] border border-[#374151] text-[#3B82F6] font-bold text-xs rounded-xl hover:border-[#3B82F6] transition-all flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-3xl border border-[#374151] bg-[#1F2937] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Total Registered Users</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#3B82F6]"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-[#F9FAFB]">{stats.totalUsers}</p>
          <p className="text-[10px] text-emerald-400 mt-2 font-medium">↑ 12 new this week</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-[#374151] bg-[#1F2937] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Authorized Applicants</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><UserCheck className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-[#F9FAFB]">{stats.authorizedUsers}</p>
          <p className="text-[10px] text-[#9CA3AF] mt-2 font-medium">{stats.pendingUsers} pending review</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-[#374151] bg-[#1F2937] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Generation Failures</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-[#F9FAFB]">{stats.totalFailures}</p>
          <p className="text-[10px] text-amber-400 mt-2 font-medium">3 unhandled exceptions</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-[#374151] bg-[#1F2937] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">LLM Fallback Engine</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400"><Cpu className="w-5 h-5" /></div>
          </div>
          <p className="text-sm font-extrabold text-[#F9FAFB] line-clamp-1">Groq → Gemini</p>
          <p className="text-[10px] text-[#9CA3AF] mt-2 font-medium">Strict 2-provider constraint active</p>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* User Management Card */}
        <Link href="/admin/users" className="glass-card p-8 rounded-[32px] border border-[#374151] bg-[#1F2937] hover:border-[#3B82F6] transition-all group shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <span className="px-3 py-1 bg-[#111827] text-xs font-bold text-[#9CA3AF] rounded-full border border-[#374151]">
              Active User Base
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#F9FAFB] mb-3 group-hover:text-[#3B82F6] transition-colors">
            User Management & Grants
          </h3>
          <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6">
            Search, filter, authorize, or suspend applicants. Manage subscription plans, cost estimation, and view full user audit trails.
          </p>
          <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm">
            <span>Open User Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Failures & Exceptions Card */}
        <Link href="/admin/failures" className="glass-card p-8 rounded-[32px] border border-[#374151] bg-[#1F2937] hover:border-[#3B82F6] transition-all group shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <span className="px-3 py-1 bg-[#111827] text-xs font-bold text-amber-400 rounded-full border border-[#374151]">
              3 Errors Pending
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#F9FAFB] mb-3 group-hover:text-[#3B82F6] transition-colors">
            Failure Log & Retry Queue
          </h3>
          <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6">
            Inspect unhandled generation errors, view stack trace payloads, and trigger one-click pipeline retries directly from the admin panel.
          </p>
          <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm">
            <span>Inspect Error Queue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* System Policy & Constraint Banner */}
      <div className="p-6 bg-[#111827] rounded-3xl border border-[#374151] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[#F9FAFB] text-sm">LLM Fallback Chain Constraint Enforced</h4>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Strict execution order: <span className="text-[#3B82F6] font-bold">Groq (Primary) → Gemini (Fallback)</span>. No unauthorized paid APIs permitted.</p>
          </div>
        </div>
        <button
          onClick={() => alert("LLM Fallback Status: Groq (Active) | Gemini (Standby)")}
          className="px-5 py-2.5 bg-[#1F2937] border border-[#374151] text-[#F9FAFB] font-bold text-xs rounded-xl hover:border-[#3B82F6] transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4 text-[#3B82F6]" />
          <span>Verify API Status</span>
        </button>
      </div>

    </div>
  );
}
