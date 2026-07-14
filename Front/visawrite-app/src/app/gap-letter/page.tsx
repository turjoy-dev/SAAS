"use client";

import React, { useState } from "react";
import { Clock, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check } from "lucide-react";

export default function GapLetter() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    nationality: "India",
    email: "",
    startDate: "",
    endDate: "",
    duration: "1 Year",
    reason: "Career Exploration",
    activities: "",
    certifications: "",
    workVolunteer: "",
    preparation: "",
    targetUni: "",
    targetProgram: "",
    targetCountry: "Australia",
    preventGaps: ""
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
      setStep(5);
    }, 2000);
  };

  const copyToClipboard = () => {
    const text = document.getElementById("gap-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white shadow-sm text-xs font-bold text-blue-900 mb-4">
          <span>⏳ Gap Justification Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-[#1e3a8a]" />
          Gap Explanation Letter
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Professionally explain study or employment gaps with clear timelines, productive activities, and future academic plans.
        </p>
      </div>

      {/* Step Indicator */}
      {step < 5 && (
        <div className="flex items-center justify-between max-w-md mx-auto mb-10">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-initial">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num ? "bg-[#1e3a8a] text-white shadow-md" : "bg-white border border-[#c5c5d3] text-slate-400"}`}>
                {num}
              </div>
              {num < 4 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > num ? "bg-[#1e3a8a]" : "bg-[#c5c5d3]/30"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Glass Card Form Container */}
      {step < 5 && (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#1e3a8a]/10 bg-white/70 backdrop-blur-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-t-[#1e3a8a] border-blue-200 rounded-full animate-spin" />
              <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Analyzing activities & formatting timeline justification letter...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Contact Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="johndoe@example.com" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Gap Period */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Gap Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Gap Start Date</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Gap End Date</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Estimated Duration</label>
                      <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="e.g. 14 Months" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Primary Reason for Gap</label>
                      <select name="reason" value={formData.reason} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="Health Issues">Health / Medical Issues</option>
                        <option value="Family Responsibilities">Family Responsibilities</option>
                        <option value="Financial Constraints">Financial Constraints</option>
                        <option value="Career Exploration">Career Exploration / Upskilling</option>
                        <option value="Personal Development">Personal Development</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Gap Activities */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Gap Activities</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">What did you do during this gap?</label>
                      <textarea name="activities" value={formData.activities} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List direct activities, freelance work, family care, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Any certifications, courses, or training completed?</label>
                      <textarea name="certifications" value={formData.certifications} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="e.g. Completed Advanced Digital Marketing course on Coursera..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">How has this gap prepared you for future studies?</label>
                      <textarea name="preparation" value={formData.preparation} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Explain how the skills or mindset built will assist your study goals." />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Future Plans */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Target Studies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target University</label>
                      <input type="text" name="targetUni" value={formData.targetUni} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Macquarie University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target Program Name</label>
                      <input type="text" name="targetProgram" value={formData.targetProgram} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Master of Cyber Security" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target Country</label>
                      <input type="text" name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Australia" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0b1c30] mb-2">How will you ensure no further gaps occur during study?</label>
                    <textarea name="preventGaps" value={formData.preventGaps} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List details such as secure funding, focused timeline plans, etc." />
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
                
                {step < 4 ? (
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

      {/* Step 5: Output */}
      {step === 5 && (
        <div className="space-y-8 reveal active">
          <div className="glass-card p-8 rounded-3xl border border-emerald-200/60 bg-emerald-50/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                  Gap Explanation Letter Generated!
                </h3>
                <p className="text-slate-600 text-sm mt-1">Timeline elements have been organized to emphasize proactive and career-ready actions.</p>
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

          <div id="gap-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#c5c5d3]/20 bg-white leading-relaxed text-slate-800 space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <p className="font-sans text-sm text-slate-500">
              <strong>Applicant:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Nationality:</strong> {formData.nationality || "India"} <br />
              <strong>Target Course:</strong> {formData.targetProgram || "Master of Cyber Security"} ({formData.targetUni || "Macquarie University"})
            </p>
            <hr className="border-slate-200" />
            
            <p>To,</p>
            <p>The Visa Officer,<br />Department of Home Affairs / Target Embassy</p>
            
            <p><strong>Subject: Explanation of Academic & Employment Timeline Gap</strong></p>
            
            <p>Dear Sir/Madam,</p>
            <p>
              I am writing this letter in support of my application to pursue the <strong>{formData.targetProgram || "Master of Cyber Security"}</strong> at <strong>{formData.targetUni || "Macquarie University"}</strong> in <strong>{formData.targetCountry || "Australia"}</strong>. Specifically, I wish to address the gap in my timeline between <strong>{formData.startDate || "June 2023"}</strong> and <strong>{formData.endDate || "August 2024"}</strong>.
            </p>
            <p>
              During this period of <strong>{formData.duration || "14 Months"}</strong>, I made a conscious decision to focus on <strong>{formData.reason || "Career Exploration & Upskilling"}</strong>. Rather than remaining inactive, I utilized this period to build targeted skills that directly align with my future research goals.
            </p>
            <p>
              Specifically, I conducted: <em>{formData.activities || "freelance data system audits and cybersecurity coursework"}</em>. Through these tasks, I built a strong base in network vulnerabilities and database security.
            </p>
            <p>
              To confirm my progression, I successfully completed certifications in:
            </p>
            <p className="pl-6 italic">
              - {formData.certifications || "CompTIA Security+ and Advanced Cloud Systems course."}
            </p>
            <p>
              This period of study was crucial in establishing my dedication to cybersecurity. {formData.preventGaps || "Having secured full financial sponsorship and university confirmation, I am confident I will maintain a continuous study track throughout my stay in Australia."}
            </p>
            <p>
              Thank you for reviewing my profile.
            </p>
            <p className="pt-6">
              Sincerely, <br />
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
