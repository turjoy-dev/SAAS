"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";

interface FailureRecord {
  id: string;
  generation_id: string | null;
  stage: string;
  error_detail: string;
  raw_payload: any;
  created_at: string;
}

export default function AdminFailuresPage() {
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const fetchFailures = async () => {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const offset = (page - 1) * limit;

    try {
      const res = await fetch(`${API_URL}/dashboard/failures?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch failure queue");
      const data = await res.json();
      setFailures(data.failures || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("Error fetching failures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailures();
  }, [page]);

  const handleRetry = async (record: FailureRecord) => {
    setRetryingId(record.id);
    setRetryMessage(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const payload = record.raw_payload || {};
    try {
      const token = localStorage.getItem("sb-access-token") || "mock-dev-token";
      const res = await fetch(`${API_URL}/sop/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Retry failed");
      }

      const data = await res.json();
      setRetryMessage(`✅ Job re-queued successfully with ID: ${data.generation_id}`);
      fetchFailures();
    } catch (err: any) {
      setRetryMessage(`❌ Retry failed: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#60A5FA] flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-600" /> Admin Generation Failure Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor async background execution errors, inspect stack traces, and manually re-trigger failed jobs.
          </p>
        </div>

        <button
          onClick={fetchFailures}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
        </button>
      </div>

      {retryMessage && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" /> {retryMessage}
        </div>
      )}

      {/* Failure Queue Table */}
      <div className="glass-card rounded-3xl border border-white/80 shadow-lg overflow-hidden bg-white/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Error Details</th>
                <th className="p-4">Generation ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading failure queue...
                  </td>
                </tr>
              ) : failures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-emerald-600 font-bold">
                    🎉 No active failure records found. All background pipelines operating normally.
                  </td>
                </tr>
              ) : (
                failures.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-rose-700">
                      <span className="px-2 py-1 bg-rose-50 border border-rose-200 rounded-md">
                        {item.stage}
                      </span>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="font-semibold text-slate-800 line-clamp-2">{item.error_detail}</p>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {item.generation_id || "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRetry(item)}
                        disabled={retryingId === item.id}
                        className="px-3 py-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-[11px] rounded-lg transition-all disabled:opacity-50"
                      >
                        {retryingId === item.id ? "Re-triggering..." : "Retry Job"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200/80 bg-slate-50/50 text-xs font-bold text-slate-600">
          <span>Total Failures: {total}</span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
