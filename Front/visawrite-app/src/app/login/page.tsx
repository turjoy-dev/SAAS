"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "user";
  
  const [tab, setTab] = useState<"user" | "admin">(initialMode);
  
  // User Login Form
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  
  // Admin Login Form
  const [adminEmail, setAdminEmail] = useState("admin@visawrite.com");
  const [adminPassword, setAdminPassword] = useState("");
  
  // States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (!userEmail) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
      }
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("sb-access-token", "user-authenticated-token");
      setSuccess("Login successful! Redirecting to Dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 800);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      // Check Admin Password (default master password: admin123)
      if (adminPassword !== "admin123" && adminPassword !== "admin") {
        setError("Invalid Admin Password. Default master password is 'admin123'.");
        setLoading(false);
        return;
      }

      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", adminEmail);
      localStorage.setItem("sb-access-token", "admin-session-token-99");
      setSuccess("Admin Authorized! Opening Admin Control Panel...");
      setTimeout(() => {
        router.push("/admin");
      }, 800);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20">
              W
            </div>
            <span className="font-['Outfit',sans-serif] font-bold text-2xl tracking-tight text-[#F9FAFB]">
              WriteAbroad AI
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#F9FAFB] tracking-tight">
            {tab === "admin" ? "Admin Control Portal" : "Welcome Back"}
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {tab === "admin" ? "Authorized personnel only. Password protected portal." : "Sign in to manage your Statement of Purpose & Visa documents."}
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card p-8 rounded-3xl border border-[#374151] bg-[#1F2937] shadow-2xl">
          
          {/* Tab Switcher */}
          <div className="flex bg-[#111827] p-1.5 rounded-2xl mb-8 border border-[#374151]">
            <button
              onClick={() => { setTab("user"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                tab === "user"
                  ? "bg-[#3B82F6] text-white shadow-md"
                  : "text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Login</span>
            </button>
            <button
              onClick={() => { setTab("admin"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                tab === "admin"
                  ? "bg-[#3B82F6] text-white shadow-md"
                  : "text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Student Login Form */}
          {tab === "user" ? (
            <form onSubmit={handleUserLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111827] border border-[#374151] text-[#F9FAFB] text-sm focus:border-[#3B82F6] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111827] border border-[#374151] text-[#F9FAFB] text-sm focus:border-[#3B82F6] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded bg-[#111827] border-[#374151] text-[#3B82F6]" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#" className="hover:text-[#3B82F6] transition-colors">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#3B82F6] text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="p-3 bg-[#111827] rounded-xl border border-blue-500/20 text-[11px] text-[#9CA3AF]">
                <p className="font-bold text-[#3B82F6] mb-0.5">Master Admin Credentials:</p>
                <p>Default Master Password: <code className="bg-[#1F2937] px-1.5 py-0.5 rounded text-white font-mono">admin123</code></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111827] border border-[#374151] text-[#F9FAFB] text-sm focus:border-[#3B82F6] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Admin Security Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password (admin123)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111827] border border-[#374151] text-[#F9FAFB] text-sm focus:border-[#3B82F6] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Authorize & Open Admin Panel</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
            ← Return to Landing Page
          </Link>
        </div>

      </div>
    </div>
  );
}
