"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check, Bold, Italic, List, AlertTriangle } from "lucide-react";
export default function SopGenerator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [completedGenId, setCompletedGenId] = useState<string | null>(null);
  const [sopText, setSopText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "Bangladesh",
    dob: "",
    highestQualification: "Bachelor's Degree",
    institution: "",
    fieldOfStudy: "",
    gpa: "",
    graduationYear: "",
    targetCountry: "Australia",
    targetUniversity: "",
    programName: "",
    intake: "Fall 2025",
    scholarship: "no",
    experience: "",
    projects: "",
    whyProgram: "",
    careerGoals: ""
  });

  const [sopResult, setSopResult] = useState({
    text: "",
    criticScore: 0,
    criticFlags: [] as string[],
    residualFlags: [] as string[],
    edited: false
  });

  const outputRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Submit form data to FastAPI backend
  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Structure payload based on what backend orchestrator expects
    const payload = {
      factSheet: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        targetCountry: formData.targetCountry,
        country: formData.targetCountry,
        university: formData.targetUniversity,
        program: formData.programName,
        previousDegree: formData.highestQualification,
        previousInstitution: formData.institution,
        fieldOfStudy: formData.fieldOfStudy,
        cgpa: formData.gpa,
        graduationYear: formData.graduationYear,
        relevant_experience: formData.experience,
        projects: formData.projects,
        whyCourse: formData.whyProgram,
        careerGoals: formData.careerGoals,
        homeTies: "Family properties and professional opportunities in " + formData.nationality,
        sponsorType: formData.scholarship === "yes" ? "scholarship" : "personal savings",
        doc_type: "sop"
      }
    };

    try {
      const token = localStorage.getItem("sb-access-token") || "mock-dev-token";
      const response = await fetch(`${API_URL}/sop/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to trigger generation");
      }

      const data = await response.json();
      setGenerationId(data.generation_id);
      setPollCount(0);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // Poll status endpoint
  useEffect(() => {
    if (!generationId) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        setPollCount((c) => c + 1);
        const token = localStorage.getItem("sb-access-token") || "mock-dev-token";
        const res = await fetch(`${API_URL}/sop/generate/${generationId}/status`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error("Failed to check status");
        }

        const data = await res.json();

        if (data.status === "completed") {
          setSopResult({
            text: data.result.text,
            criticScore: data.result.critic_score,
            criticFlags: data.result.critic_flags,
            residualFlags: data.result.residual_flags,
            edited: data.result.llm_calls > 2
          });
          setCompletedGenId(generationId);
          setSopText(data.result.text);
          setLoading(false);
          setGenerationId(null);
          setStep(5);
        } else if (data.status === "failed") {
          throw new Error(data.error || "Generation process failed.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Poller error.");
        setLoading(false);
        setGenerationId(null);
      }
    };

    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [generationId]);

  const handleSaveEdits = async () => {
    if (!completedGenId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const token = localStorage.getItem("sb-access-token") || "mock-dev-token";
      const res = await fetch(`${API_URL}/sop/generations/${completedGenId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: sopText }),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save edits.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sopText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#374151] bg-[#1F2937] shadow-sm text-xs font-bold text-[#60A5FA] mb-4">
          <span>📝 University-Specific AI</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#60A5FA] mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-[#60A5FA]" />
          Statement of Purpose (SOP)
        </h1>
        <p className="text-[#93C5FD] text-lg max-w-2xl mx-auto leading-relaxed">
          Create personalized, university-specific SOPs for admission applications.
        </p>
      </div>

      {/* Step Indicator */}
      {step < 5 && (
        <div className="flex items-center justify-between max-w-md mx-auto mb-10">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-initial">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num ? "bg-[#1e3a8a] text-white shadow-md" : "bg-[#1F2937] border border-[#374151] text-[#93C5FD]"}`}>
                {num}
              </div>
              {num < 4 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > num ? "bg-[#60A5FA]" : "bg-[#374151]/50"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold">Generation Error</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Glass Card Form Container */}
      {step < 5 && (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#374151] bg-[#1F2937]/70 backdrop-blur-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-t-[#60A5FA] border-blue-900 rounded-full animate-spin" />
              <p className="text-lg font-bold text-[#60A5FA] animate-pulse">
                {pollCount > 0 ? `Composing Draft (Polling cycle ${pollCount})...` : "Initializing generation job..."}
              </p>
              <p className="text-sm text-[#93C5FD] max-w-md">Our multi-stage 7-layer engine is analyzing your profile, evaluating metrics, and editing paragraphs for visa compliance.</p>
            </div>
          ) : (
            <>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="johndoe@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="+1 234 567 890" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Nationality</label>
                      <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]">
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="India">India</option>
                        <option value="China">China</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Vietnam">Vietnam</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Background */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Academic Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Highest Qualification</label>
                      <select name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]">
                        <option value="High School">High School Diploma</option>
                        <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                        <option value="Master's Degree">Master&apos;s Degree</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Institution Name</label>
                      <input type="text" name="institution" value={formData.institution} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="Harvard University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="Computer Science" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#60A5FA] mb-2">GPA / Percentage</label>
                        <input type="text" name="gpa" value={formData.gpa} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="3.8 / 85%" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#60A5FA] mb-2">Graduation Year</label>
                        <input type="text" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Target Program */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Target Program</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target Country</label>
                      <select name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]">
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">UK</option>
                        <option value="Germany">Germany</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="South Korea">South Korea</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target University</label>
                      <input type="text" name="targetUniversity" value={formData.targetUniversity} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="University of Melbourne" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Program Name</label>
                      <input type="text" name="programName" value={formData.programName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]" placeholder="Master of Information Technology" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Intake Term</label>
                      <select name="intake" value={formData.intake} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB]">
                        <option value="Fall 2025">Fall 2025</option>
                        <option value="Spring 2026">Spring 2026</option>
                        <option value="Fall 2026">Fall 2026</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Experience & Goals */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Experience & Career Goals</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Work Experience & Internships (Optional)</label>
                      <textarea name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] min-h-[100px]" placeholder="Briefly list your job titles, organizations, and key duties." />
                      <p className="text-xs text-[#93C5FD] mt-1.5 flex items-center gap-1">
                        💡 এখানে বাংলায় বা বাংলিশে (e.g., 'Ami 2 bochor job korsi karon...') লিখলেও চলবে। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে প্রফেশনাল ভিসা স্ট্যান্ডার্ডে রূপান্তর করবে।
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Key Projects or Research Works</label>
                      <textarea name="projects" value={formData.projects} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] min-h-[100px]" placeholder="Describe major academic or professional projects you conducted." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Why are you interested in this program?</label>
                      <textarea name="whyProgram" value={formData.whyProgram} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] min-h-[100px]" placeholder="Explain your core motivation and course alignment." />
                      <p className="text-xs text-[#93C5FD] mt-1.5 flex items-center gap-1">
                        💡 এখানে বাংলায় বা বাংলিশে (e.g., 'Ami 2 bochor job korsi karon...') লিখলেও চলবে। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে প্রফেশনাল ভিসা স্ট্যান্ডার্ডে রূপান্তর করবে।
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Immediate Career Goals Post-Graduation</label>
                      <textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] min-h-[100px]" placeholder="e.g. Seeking a position as a Senior Systems Architect at..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#374151]">
                {step > 1 ? (
                  <button onClick={handleBack} className="px-6 py-3 rounded-xl font-bold bg-[#1F2937] hover:bg-[#374151] text-[#93C5FD] flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}
                
                {step < 4 ? (
                  <button onClick={handleNext} className="px-6 py-3 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleGenerate} className="px-8 py-4 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Generate Document
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* STEP 5: OUTPUT RESULT */}
      {/* ═══════════════════════════════════════════════ */}
      {step === 5 && (
        <div className="space-y-8 reveal active">
          
          {/* Header Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-[#374151] bg-[#1F2937]/70">
              <span className="text-xs font-bold text-[#93C5FD] uppercase">Evaluation Score</span>
              <p className="text-3xl font-extrabold text-[#60A5FA] mt-1">{sopResult.criticScore}/100</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-[#374151] bg-[#1F2937]/70">
              <span className="text-xs font-bold text-[#93C5FD] uppercase">Engine Operations</span>
              <p className="text-3xl font-extrabold text-[#60A5FA] mt-1">{sopResult.edited ? "Draft + Critique + Auto-Edit" : "Draft + Critique (Passed)"}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-[#374151] bg-[#1F2937]/70">
              <span className="text-xs font-bold text-[#93C5FD] uppercase">Linter Flags</span>
              <p className="text-3xl font-extrabold text-red-400 mt-1">{sopResult.residualFlags.length}</p>
            </div>
          </div>

          {/* Setup flags display if any exist */}
          {(sopResult.criticFlags.length > 0 || sopResult.residualFlags.length > 0) && (
            <div className="p-6 rounded-2xl border border-yellow-500/30 bg-yellow-950/30 text-yellow-200 space-y-3">
              <h4 className="font-bold flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                SOP Compliance Warning: {sopResult.criticFlags.length + sopResult.residualFlags.length} issues flagged
              </h4>
              <ul className="list-disc pl-5 text-sm space-y-1 text-[#93C5FD]">
                {sopResult.criticFlags.map((f, i) => <li key={`c-${i}`}>Critic: {f}</li>)}
                {sopResult.residualFlags.map((f, i) => <li key={`r-${i}`}>Linter: {f}</li>)}
              </ul>
            </div>
          )}

          {/* Editor Header Panel */}
          <div className="glass-card p-4 rounded-3xl border border-[#374151] bg-[#1F2937]/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={handleSaveEdits} disabled={isSaving} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm disabled:opacity-50">
                {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Edits"}
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={copyToClipboard} className="px-4 py-2.5 bg-[#1F2937] border border-[#374151] hover:bg-[#374151] text-[#93C5FD] font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
              {completedGenId && (
                <>
                  <a href={`http://localhost:5000/sop/export/${completedGenId}?format=docx`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-[#1F2937] border border-[#374151] hover:bg-[#374151] text-[#93C5FD] font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> Export Word
                  </a>
                  <a href={`http://localhost:5000/sop/export/${completedGenId}?format=pdf`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-blue-900/10">
                    <Download className="w-4 h-4" /> Export PDF
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Statement Editor Surface */}
          <div className="neumorphic-surface p-6 rounded-3xl border border-[#374151] bg-[#1F2937]">
            <label className="block text-xs font-bold text-[#93C5FD] uppercase tracking-wider mb-2">
              Generated Statement Content (Editable)
            </label>
            <textarea
              value={sopText}
              onChange={(e) => setSopText(e.target.value)}
              className="w-full min-h-[450px] p-6 bg-[#111827] border border-[#374151] rounded-2xl text-[#F9FAFB] font-serif leading-relaxed text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Generated Statement of Purpose content will appear here..."
            />
          </div>

          <div className="flex justify-center pt-4">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#1F2937] hover:bg-[#374151] text-[#93C5FD]">
              Create Another Statement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
