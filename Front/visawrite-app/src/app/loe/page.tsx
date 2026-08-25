"use client";

import React, { useState, useEffect } from "react";
import { FileCheck, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check, AlertTriangle } from "lucide-react";

export default function LetterOfExplanation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [sopResult, setSopResult] = useState({
    text: "",
    criticScore: 0,
    criticFlags: [] as string[],
    residualFlags: [] as string[],
    edited: false
  });

  const [formData, setFormData] = useState({
    fullName: "",
    passportNumber: "",
    nationality: "India",
    dob: "",
    address: "",
    purpose: "Study Permit",
    targetCountry: "Canada",
    visaType: "Student Visa (Subclass 500 / Study Permit)",
    refNumber: "",
    whatToExplain: "",
    timelineDetails: "",
    referencedDocs: "",
    desiredOutcome: ""
  });

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

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const payload = {
      factSheet: {
        fullName: formData.fullName,
        nationality: formData.nationality,
        country: formData.targetCountry.toLowerCase(),
        targetCountry: formData.targetCountry.toLowerCase(),
        passportNumber: formData.passportNumber,
        dob: formData.dob,
        address: formData.address,
        doc_type: "loe",
        purpose: formData.purpose,
        visaType: formData.visaType,
        refNumber: formData.refNumber,
        whatToExplain: formData.whatToExplain,
        timelineDetails: formData.timelineDetails,
        referencedDocs: formData.referencedDocs,
        desiredOutcome: formData.desiredOutcome
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
          setLoading(false);
          setGenerationId(null);
          setStep(4);
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

  const copyToClipboard = () => {
    const text = document.getElementById("loe-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
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

      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#374151] bg-[#1F2937] shadow-sm text-xs font-bold text-[#60A5FA] mb-4">
          <span>📄 Visa Application Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#60A5FA] mb-4 flex items-center justify-center gap-3">
          <FileCheck className="w-8 h-8 sm:w-12 sm:h-12 text-[#60A5FA]" />
          Letter of Explanation (LOE)
        </h1>
        <p className="text-[#93C5FD] text-lg max-w-2xl mx-auto leading-relaxed">
          Generate professional Letters of Explanation for study permits, visa applications, or other supporting documents.
        </p>
      </div>

      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between max-w-md mx-auto mb-10">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-initial">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num ? "bg-[#1e3a8a] text-white shadow-md" : "bg-[#1F2937] border border-[#374151] text-[#93C5FD]"}`}>
                {num}
              </div>
              {num < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > num ? "bg-[#1e3a8a]" : "bg-[#c5c5d3]/30"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Glass Card Form Container */}
      {step < 4 && (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#374151] bg-[#1F2937]/70 backdrop-blur-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-t-[#60A5FA] border-blue-200 rounded-full animate-spin" />
              <p className="text-lg font-bold text-[#60A5FA] animate-pulse">Generating Letter of Explanation with targeted legal context & timelines...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Applicant Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Passport Number</label>
                      <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="A12345678" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#60A5FA] mb-2">Current Address</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[80px]" placeholder="Your residential address" />
                  </div>
                </div>
              )}

              {/* Step 2: Application Context */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Application Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Purpose of LOE</label>
                      <select name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]">
                        <option value="Study Permit">Study Permit Application</option>
                        <option value="Visa Extension">Visa Extension / Renewal</option>
                        <option value="Financial Explanation">Financial / Funding Explanation</option>
                        <option value="Travel History">Travel History Justification</option>
                        <option value="Other">Other Custom Purpose</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target Country</label>
                      <input type="text" name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Canada" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Visa Type</label>
                      <input type="text" name="visaType" value={formData.visaType} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Student Visa" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Application Reference (Optional)</label>
                      <input type="text" name="refNumber" value={formData.refNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="V12345678" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Explanation Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Explanation details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">What issue/fact needs to be explained?</label>
                      <textarea name="whatToExplain" value={formData.whatToExplain} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="e.g. Explaining the source of recent large financial deposits in my account..." />
                      <p className="text-xs text-[#93C5FD] mt-1 flex items-center gap-1">
                        💡 You can type in English or Banglish (e.g. <i>"bank deposit ta land sale er taka"</i>) — our engine translates it into formal visa English.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Supporting Details & Timelines</label>
                      <textarea name="timelineDetails" value={formData.timelineDetails} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="List dates, bank transfers, or official events." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Referenced Supporting Documents</label>
                      <textarea name="referencedDocs" value={formData.referencedDocs} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="e.g. Bank statement, property sale deed, tax returns..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Desired Outcome / Request to Officer</label>
                      <textarea name="desiredOutcome" value={formData.desiredOutcome} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="e.g. I request the officer to consider this explanation to satisfy the financial capacity requirements." />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#374151]/60">
                {step > 1 ? (
                  <button onClick={handleBack} className="px-6 py-3 rounded-xl font-bold bg-[#374151] hover:bg-[#4B5563] text-[#93C5FD] flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}
                
                {step < 3 ? (
                  <button onClick={handleNext} className="px-6 py-3 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleGenerate} className="px-8 py-4 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Generate Letter
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 4: Output */}
      {step === 4 && (
        <div className="space-y-8 reveal active">
          <div className="glass-card p-8 rounded-3xl border border-emerald-200/60 bg-emerald-50/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#60A5FA] flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                  Letter of Explanation Generated!
                </h3>
                <p className="text-[#93C5FD] text-sm mt-1">Formulated with structured logic addressing specific visa queries.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyToClipboard} className="px-4 py-2 bg-[#1F2937] border border-[#374151] hover:bg-[#374151] text-[#93C5FD] font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                </button>
                <button className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>

          <div id="loe-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#374151] bg-[#1F2937] leading-relaxed text-[#60A5FA] space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <p className="font-sans text-sm text-[#93C5FD]">
              <strong>Applicant Name:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Passport No:</strong> {formData.passportNumber || "A12345678"} <br />
              <strong>Reference No:</strong> {formData.refNumber || "N/A"} <br />
              <strong>Target Country:</strong> {formData.targetCountry || "Canada"}
            </p>
            <hr className="border-[#374151]" />
            
            {sopResult.text ? (
              <div dangerouslySetInnerHTML={{ __html: sopResult.text.replace(/\n/g, "<br />") }} />
            ) : (
              <div>
                <p>To,</p>
                <p>The Visa Officer,<br />Immigration, Refugees and Citizenship Canada (IRCC)</p>
                
                <p><strong>Subject: Letter of Explanation regarding {formData.purpose || "Study Permit Application"}</strong></p>
                
                <p>Dear Sir/Madam,</p>
                <p>
                  I am writing this letter to provide clarification on specific aspects of my application for a <strong>{formData.visaType || "Student Visa / Study Permit"}</strong> to pursue my studies in <strong>{formData.targetCountry || "Canada"}</strong>.
                </p>
                <p>
                  Specifically, I wish to explain the following: <strong>{formData.whatToExplain || "the source of financial assets and recent bank deposits"}</strong>.
                </p>
                <p>
                  To outline the context: <em>{formData.timelineDetails || "The funds were transferred from a fixed deposit maturity and the sale of agricultural land owned by my family."}</em>. I have attached the official land sale registry and bank transaction logs to corroborate this transition.
                </p>
                <p>
                  I have enclosed the following supporting documents for your review:
                </p>
                <p className="pl-6 italic">
                  - {formData.referencedDocs || "Deed of sale, FD maturity receipt, and updated 6-month bank statements."}
                </p>
                <p>
                  {formData.desiredOutcome || "I request the esteemed officer to consider this context and approve my application."}
                </p>
                <p className="pt-6">
                  Yours sincerely, <br />
                  <strong>{formData.fullName || "John Doe"}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#374151] hover:bg-[#4B5563] text-[#93C5FD]">
              Create Another Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
