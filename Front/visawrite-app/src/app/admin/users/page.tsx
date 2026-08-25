"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, Search, RefreshCw, ChevronLeft, ChevronRight, 
  ShieldAlert, ShieldCheck, Ban, CheckCircle, Edit3, 
  FileText, Cpu, DollarSign, History, X, Check, Info, Trash2, UserPlus
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  is_authorized: boolean;
  suspended: boolean;
  plan: string | null;
  plan_expires_at: string | null;
  created_at: string;
  country: string | null;
}

interface AuditLog {
  id: string;
  admin_email: string | null;
  action: string;
  target_email: string | null;
  reason: string;
  created_at: string;
}

interface UserDetailStats {
  doc_count: number;
  total_llm_calls: number;
  estimated_cost: number;
}

interface DashboardStats {
  total_users: number;
  running_users: number;
  dead_users: number;
  total_documents: number;
  total_llm_calls: number;
  estimated_cost: number;
}

export default function AdminUsersPage() {
  // Lists state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  // UI state
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserDetailStats | null>(null);
  const [userLogs, setUserLogs] = useState<AuditLog[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Dashboard Stats state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>("user");

  // Overlay state for actions
  const [actionModal, setActionModal] = useState<{
    type: "authorize" | "suspend" | "role";
    targetUser: UserProfile;
    targetValue: any;
  } | null>(null);
  const [modalReason, setModalReason] = useState("");
  const [modalRole, setModalRole] = useState("user");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Manual User Creation state
  const [createUserModal, setCreateUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [newPlan, setNewPlan] = useState("none");
  const [newTrialDays, setNewTrialDays] = useState(15);
  const [newCountry, setNewCountry] = useState("Australia");
  const [customCountry, setCustomCountry] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Fetch initial token
  const getAuthToken = () => {
    return localStorage.getItem("sb-access-token") || "mock-dev-token";
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchUsers = async () => {
    setLoading(true);
    const offset = (page - 1) * limit;
    const token = getAuthToken();

    try {
      const url = `${API_URL}/admin/users?limit=${limit}&offset=${offset}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer {token}` }
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      showToast(err.message || "Failed to fetch user list", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    const token = getAuthToken();
    try {
      // Decode current user role from JWT token to check permissions
      if (token && token !== "mock-dev-token") {
        try {
          const parts = token.split(".");
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            const role = payload.role || payload.app_metadata?.role || payload.user_metadata?.role || "user";
            setCurrentUserRole(role);
          }
        } catch (jwtErr) {
          console.error("JWT decode error:", jwtErr);
        }
      } else {
        setCurrentUserRole("owner"); // Default for mock mode
      }

      const res = await fetch(`${API_URL}/admin/dashboard-stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUserDetail = async (user: UserProfile) => {
    setLoadingDetail(true);
    const token = getAuthToken();
    try {
      // 1. Fetch user usage stats
      const statsRes = await fetch(`${API_URL}/admin/users/${user.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setUserStats({
          doc_count: statsData.doc_count || 0,
          total_llm_calls: statsData.total_llm_calls || 0,
          estimated_cost: statsData.estimated_cost || 0.0
        });
      }

      // 2. Fetch user audit logs
      const logsRes = await fetch(`${API_URL}/admin/audit-log?target_user_id={user.id}&limit=10`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setUserLogs(logsData.logs || []);
      }
    } catch (err: any) {
      showToast("Error retrieving user detailed metrics", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const triggerAction = async () => {
    if (!actionModal) return;
    if (modalReason.trim().length < 10) {
      showToast("Audit reason must be at least 10 characters long.", "error");
      return;
    }

    setActionLoading(true);
    const { type, targetUser, targetValue } = actionModal;
    const token = getAuthToken();

    let endpoint = "";
    let bodyPayload: any = { reason: modalReason };

    if (type === "authorize") {
      endpoint = `${API_URL}/admin/users/${targetUser.id}/authorize`;
      bodyPayload.is_authorized = targetValue;
    } else if (type === "suspend") {
      endpoint = `${API_URL}/admin/users/${targetUser.id}/suspend`;
      bodyPayload.suspended = targetValue;
    } else if (type === "role") {
      endpoint = `${API_URL}/admin/users/${targetUser.id}/role`;
      bodyPayload.role = modalRole;
    }

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Action failed");
      }

      showToast(`Action executed successfully.`, "success");
      
      // If updating current drawer user, refresh details
      if (selectedUser && selectedUser.id === targetUser.id) {
        const updatedUser = { ...selectedUser };
        if (type === "authorize") updatedUser.is_authorized = targetValue;
        if (type === "suspend") updatedUser.suspended = targetValue;
        if (type === "role") updatedUser.role = modalRole;
        setSelectedUser(updatedUser);
        fetchUserDetail(updatedUser);
      }

      setActionModal(null);
      setModalReason("");
      fetchUsers();
      fetchDashboardStats();
    } catch (err: any) {
      showToast(err.message || "Failed to update user profile", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast("Email address is required.", "error");
      return;
    }
    
    setCreatingUser(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newEmail,
          phone: newPhone || null,
          role: newRole,
          plan: null,
          country: newCountry === "Other" ? customCountry : newCountry
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create user");
      }

      showToast("User account registered successfully!", "success");
      setCreateUserModal(false);
      setNewEmail("");
      setNewPhone("");
      setNewRole("admin");
      setNewPlan("none");
      setNewCountry("Australia");
      setCustomCountry("");
      
      fetchUsers();
      fetchDashboardStats();
    } catch (err: any) {
      showToast(err.message || "Failed to register user account", "error");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeletingUser(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}/admin/users/${deleteConfirmUser.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Delete operation failed");
      }

      showToast(`Permanently deleted account: ${deleteConfirmUser.email}`, "success");
      setDeleteConfirmUser(null);
      setSelectedUser(null);
      
      fetchUsers();
      fetchDashboardStats();
    } catch (err: any) {
      showToast(err.message || "Delete operation failed", "error");
    } finally {
      setDeletingUser(false);
    }
  };

  const openUserDrawer = (user: UserProfile) => {
    setSelectedUser(user);
    setUserStats(null);
    setUserLogs([]);
    fetchUserDetail(user);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-10 flex flex-col gap-6 relative min-h-screen">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border max-w-sm transition-all duration-300 ${
          toastMessage.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
            : "bg-rose-50 border-rose-200 text-rose-950"
        }`}>
          <Info className={`w-5 h-5 ${toastMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#60A5FA] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#1e3a8a]" /> User Directory & Accounts Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search subscriber profiles, manage access permissions, check real-time pipeline usage costs, and review audit history logs.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto items-center">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Search
          </button>
          
          {/* Create User Trigger (Available for Owners & Admins) */}
          {["owner", "admin", "sales_rep"].includes(currentUserRole) && (
            <button
              type="button"
              onClick={() => setCreateUserModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add User
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              fetchUsers();
              fetchDashboardStats();
            }}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${(loading || loadingStats) ? "animate-spin" : ""}`} />
          </button>
        </form>
      </div>

      {/* Dashboard Overview Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active running accounts</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#60A5FA]">
              {loadingStats ? "..." : (dashboardStats?.running_users ?? 0)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Running / Features Active</span>
          </div>
        </div>

        <div className="p-5 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Dead / Suspended / Expired</span>
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#60A5FA]">
              {loadingStats ? "..." : (dashboardStats?.dead_users ?? 0)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Suspended or Expired</span>
          </div>
        </div>

        <div className="p-5 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Documents Generated</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#60A5FA]">
              {loadingStats ? "..." : (dashboardStats?.total_documents ?? 0)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Documents</span>
          </div>
        </div>

        <div className="p-5 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total LLM Calls & Estimated Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#60A5FA] text-emerald-700">
              ${loadingStats ? "..." : (dashboardStats?.estimated_cost ?? 0.0)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              ({loadingStats ? "..." : (dashboardStats?.total_llm_calls ?? 0)} LLM calls)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Users Table Card */}
        <div className="flex-1 glass-card rounded-3xl border border-white/80 shadow-lg bg-white/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Subscriber</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Plan Status</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">System Rights</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Querying database profiles...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => openUserDrawer(user)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedUser?.id === user.id ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-[#60A5FA]">{user.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.phone || "No phone linked"}</div>
                        {user.country && (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span>📍</span> {user.country}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-md border tracking-wide ${
                          user.role === "owner" 
                            ? "bg-purple-50 border-purple-200 text-purple-700" 
                            : ["admin", "sales_rep"].includes(user.role)
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                              : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                          user.plan === "free_forever" 
                            ? "bg-teal-50 border-teal-200 text-teal-700"
                            : user.plan === "trial_days"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}>
                          {user.plan || "Free tier"}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">
                        {user.plan_expires_at 
                          ? new Date(user.plan_expires_at).toLocaleDateString() 
                          : "No expiry"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <span className={`flex items-center gap-1 text-[10px] font-bold ${user.is_authorized ? "text-emerald-700" : "text-slate-400"}`}>
                            {user.is_authorized ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                            {user.is_authorized ? "Authorized" : "Guest"}
                          </span>
                          {user.suspended && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              <Ban className="w-3 h-3 text-rose-500" /> Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {/* Authorize Toggle */}
                          <button
                            onClick={() => setActionModal({
                              type: "authorize",
                              targetUser: user,
                              targetValue: !user.is_authorized
                            })}
                            title={user.is_authorized ? "De-authorize User" : "Authorize User"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              user.is_authorized
                                ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {user.is_authorized ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                          {/* Suspend Toggle */}
                          <button
                            onClick={() => setActionModal({
                              type: "suspend",
                              targetUser: user,
                              targetValue: !user.suspended
                            })}
                            title={user.suspended ? "Un-suspend User" : "Suspend User"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              user.suspended
                                ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {user.suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200/80 bg-slate-50/50 text-xs font-bold text-slate-600">
            <span>Total Subscribers: {total}</span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* User Details Drawer Panel */}
        {selectedUser && (
          <div className="w-full lg:w-96 glass-card rounded-3xl border border-white/80 shadow-lg bg-white/95 p-6 flex flex-col gap-6 animate-in slide-in-from-right-5 duration-200">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b pb-4 border-slate-200">
              <div className="max-w-[85%]">
                <h2 className="font-extrabold text-[#60A5FA] break-all">{selectedUser.email}</h2>
                <div className="text-[10px] text-slate-500 font-mono mt-1">ID: {selectedUser.id}</div>
                {selectedUser.country && (
                  <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <span>📍 Country:</span> <span>{selectedUser.country}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aggregating billing & audit history metrics...
              </div>
            ) : (
              <>
                {/* Generation Cost Analytics */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">usage statistics</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <FileText className="w-4 h-4 text-[#1e3a8a] mb-1" />
                      <div className="text-base font-extrabold text-[#60A5FA]">{userStats?.doc_count}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Docs</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <Cpu className="w-4 h-4 text-indigo-600 mb-1" />
                      <div className="text-base font-extrabold text-[#60A5FA]">{userStats?.total_llm_calls}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Calls</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <DollarSign className="w-4 h-4 text-emerald-600 mb-1" />
                      <div className="text-base font-extrabold text-[#60A5FA]">${userStats?.estimated_cost}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Cost</div>
                    </div>

                  </div>
                </div>

                {/* Role Modifier Control (Available for Owners to edit) */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">role permissions</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedUser.role}
                      disabled={currentUserRole !== "owner"}
                      onChange={(e) => {
                        setModalRole(e.target.value);
                        setActionModal({
                          type: "role",
                          targetUser: selectedUser,
                          targetValue: e.target.value
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]/20 disabled:opacity-75"
                    >
                      <option value="user">User (Standard)</option>
                      <option value="admin">Admin</option>
                      <option value="sales_rep">Sales Representative</option>
                      <option value="owner">Owner (Admin)</option>
                    </select>
                  </div>
                  {currentUserRole !== "owner" && (
                    <span className="text-[9px] text-slate-400 italic">Only the account Owner can alter user roles.</span>
                  )}
                </div>

                {/* Audit Logs Trail */}
                <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                  <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1">
                    <History className="w-3.5 h-3.5" /> admin audit trail
                  </h3>
                  <div className="flex-1 overflow-y-auto max-h-48 border border-slate-100 rounded-2xl bg-slate-50/50 p-3 flex flex-col gap-3">
                    {userLogs.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center py-4">No audit history for this subscriber.</div>
                    ) : (
                      userLogs.map((log) => (
                        <div key={log.id} className="text-[11px] leading-relaxed border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span className="uppercase text-[#1e3a8a] text-[10px]">{log.action}</span>
                            <span className="text-slate-400 text-[9px] font-mono">{new Date(log.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 mt-1">{log.reason}</p>
                          <div className="text-[9px] text-slate-400 mt-0.5">By: {log.admin_email || "System"}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Owner-Only Account Deletion (Cut Account) */}
                {currentUserRole === "owner" && (
                  <div className="border-t pt-4 mt-2">
                    <button
                      onClick={() => setDeleteConfirmUser(selectedUser)}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete User Account
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        )}

      </div>

      {/* Manual User Creation Dialog Modal */}
      {createUserModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#60A5FA] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" /> Register User Profile
              </h3>
              <button 
                onClick={() => setCreateUserModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">email address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. subscriber@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">phone number (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +15550199"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">system role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="admin">Admin</option>
                  {currentUserRole === "owner" && (
                    <option value="owner">Owner (Admin)</option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">country name *</label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Australia">Australia</option>
                  <option value="UK">UK</option>
                  <option value="Germany">Germany</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setCreateUserModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {creatingUser ? "Registering..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Account Confirmation Dialog */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-base font-extrabold text-[#60A5FA]">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-500">
                Are you absolutely sure you want to permanently delete the account <strong>{deleteConfirmUser.email}</strong>? This action will immediately terminate their credentials and is irreversible.
              </p>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                disabled={deletingUser}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {deletingUser ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog Modal (Audit Gating Toggles) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            
            <h3 className="text-base font-extrabold text-[#60A5FA] capitalize flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> 
              confirm {actionModal.type === "role" ? "role change" : actionModal.type} operation
            </h3>
            
            <p className="text-xs text-slate-500 mt-2">
              This action requires an explicit audit log reason (minimum 10 characters) explaining why this modification is being applied to <strong>{actionModal.targetUser.email}</strong>.
            </p>

            <div className="flex flex-col gap-4 mt-4">
              
              {actionModal.type === "role" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">new user role</label>
                  <select 
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="sales_rep">Sales Representative</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">audit reason</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Authorized account following successful sales trial extension demo."
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                />
                <span className={`text-[9px] text-right ${modalReason.length >= 10 ? "text-slate-400" : "text-rose-500 font-bold"}`}>
                  {modalReason.length}/10 characters minimum
                </span>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setActionModal(null);
                  setModalReason("");
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={triggerAction}
                disabled={actionLoading || modalReason.trim().length < 10}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md flex items-center gap-1.5"
              >
                {actionLoading ? "Executing..." : <Check className="w-4 h-4" />} Apply Modification
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
