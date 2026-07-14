"use client";

import React, { useState } from "react";
import { FileCheck, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check } from "lucide-react";

export default function LetterOfExplanation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 2000);
  };

  const copyToClipboard = () => {
    const text = document.getElementById("loe-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white shadow-sm text-xs font-bold text-blue-900 mb-4">
          <span>📄 Visa Application Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <FileCheck className="w-8 h-8 sm:w-12 sm:h-12 text-[#1e3a8a]" />
          Letter of Explanation (LOE)
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Generate professional Letters of Explanation for study permits, visa applications, or other supporting documents.
        </p>
      </div>

      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between max-w-md mx-auto mb-10">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-initial">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num ? "bg-[#1e3a8a] text-white shadow-md" : "bg-white border border-[#c5c5d3] text-slate-400"}`}>
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
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#1e3a8a]/10 bg-white/70 backdrop-blur-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-t-[#1e3a8a] border-blue-200 rounded-full animate-spin" />
              <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Generating Letter of Explanation with targeted legal context & timelines...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Applicant Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Passport Number</label>
                      <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="A12345678" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0b1c30] mb-2">Current Address</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[80px]" placeholder="Your residential address" />
                  </div>
                </div>
              )}

              {/* Step 2: Application Context */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Application Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Purpose of LOE</label>
                      <select name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="Study Permit">Study Permit Application</option>
                        <option value="Visa Extension">Visa Extension / Renewal</option>
                        <option value="Financial Explanation">Financial / Funding Explanation</option>
                        <option value="Travel History">Travel History Justification</option>
                        <option value="Other">Other Custom Purpose</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target Country</label>
                      <input type="text" name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Canada" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Visa Type</label>
                      <input type="text" name="visaType" value={formData.visaType} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Student Visa" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Application Reference (Optional)</label>
                      <input type="text" name="refNumber" value={formData.refNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="V12345678" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Explanation Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Explanation details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">What issue/fact needs to be explained?</label>
                      <textarea name="whatToExplain" value={formData.whatToExplain} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="e.g. Explaining the source of recent large financial deposits in my account..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Supporting Details & Timelines</label>
                      <textarea name="timelineDetails" value={formData.timelineDetails} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List dates, bank transfers, or official events." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Referenced Supporting Documents</label>
                      <textarea name="referencedDocs" value={formData.referencedDocs} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="e.g. Bank statement, property sale deed, tax returns..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Desired Outcome / Request to Officer</label>
                      <textarea name="desiredOutcome" value={formData.desiredOutcome} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="e.g. I request the officer to consider this explanation to satisfy the financial capacity requirements." />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200/60">
                {step > 1 ? (
                  <button onClick={handleBack} className="px-6 py-3 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 flex items-center gap-2">
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
                <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                  Letter of Explanation Generated!
                </h3>
                <p className="text-slate-600 text-sm mt-1">Formulated with structured logic addressing specific visa queries.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyToClipboard} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                </button>
                <button className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>

          <div id="loe-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#c5c5d3]/20 bg-white leading-relaxed text-slate-800 space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <p className="font-sans text-sm text-slate-500">
              <strong>Applicant Name:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Passport No:</strong> {formData.passportNumber || "A12345678"} <br />
              <strong>Reference No:</strong> {formData.refNumber || "N/A"} <br />
              <strong>Target Country:</strong> {formData.targetCountry || "Canada"}
            </p>
            <hr className="border-slate-200" />
            
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

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700">
              Create Another Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
