"use client";

import React, { useState } from "react";
import { Shield, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check, FileText, MessageSquare, Upload, ArrowRight } from "lucide-react";

export default function GsStatement() {
  const [method, setMethod] = useState<"guided" | "upload" | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    passportNumber: "",
    nationality: "India",
    dob: "",
    address: "",
    lastQualification: "Bachelor's Degree",
    institutionName: "",
    fieldOfStudy: "",
    completionYear: "",
    gpaScore: "",
    uniName: "",
    courseName: "",
    cricosCode: "",
    duration: "2 Years",
    tuitionFee: "",
    coeNumber: "",
    whyCourse: "",
    whyAustralia: "",
    careerBenefit: "",
    whyNotHome: ""
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setUploadedFile(fileName);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(5);
      }, 2000);
    }
  };

  const copyToClipboard = () => {
    const text = document.getElementById("gs-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white shadow-sm text-xs font-bold text-blue-900 mb-4">
          <span>🇦🇺 Australia Visa Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-[#1e3a8a]" />
          Genuine Student (GS) Statement
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Generate Australia-compliant GS statements that align with current student visa requirements.
        </p>
      </div>

      {/* ── CHOOSE WRITING METHOD SCREEN ── */}
      {method === null && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Choose Writing Method</h2>
            <p className="text-sm text-slate-500 mt-2">
              Select how you&apos;d like to collaborate with WriteAbroad AI to craft your Genuine Student statement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Guided Questionnaire */}
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between items-center text-center shadow-lg border border-white/80 transition-all hover:scale-[1.01]">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 flex items-center justify-center text-[#1e3a8a] mb-6 shadow-sm">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Guided Questionnaire</h3>
                <p className="text-[#444651] text-xs leading-relaxed mb-8">
                  Answer a series of intelligently targeted questions about your academic background, career goals, and personal drive. Our AI uses your responses to construct a narrative-driven Genuine Student Statement.
                </p>
              </div>
              <button
                onClick={() => setMethod("guided")}
                className="w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-sm"
              >
                <span>Start Writing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Upload guidelines */}
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between items-center text-center shadow-lg border border-white/80 transition-all hover:scale-[1.01] relative">
              <div className="absolute -top-3.5 right-6 bg-[#1e3a8a] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" /> Recommended
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 flex items-center justify-center text-[#1e3a8a] mb-6 shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Upload University Requirements</h3>
                <p className="text-[#444651] text-xs leading-relaxed mb-8">
                  Drag and drop your university&apos;s application instructions, course syllabus, or subclass 500 prompts. WriteAbroad AI will extract key selection criteria and tailor your statement to match exactly what is required.
                </p>
              </div>
              
              <label className="w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD WORKFLOW SCREEN ── */}
      {method === "upload" && !uploadedFile && (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#1e3a8a]/10 bg-white/70 backdrop-blur-xl animate-fadeIn">
          <div className="text-center max-w-md mx-auto mb-8">
            <h3 className="text-xl font-bold text-slate-800">Upload Course & Visa Guidelines</h3>
            <p className="text-xs text-slate-500 mt-2">
              Our model will immediately extract compliance markers and structure the GS statement response.
            </p>
          </div>

          <label className="border-2 border-dashed border-[#c5c5d3] hover:border-[#1e3a8a] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-white/40 shadow-inner">
            <Upload className="w-12 h-12 text-[#1e3a8a] animate-pulse" />
            <div className="text-center">
              <span className="text-sm font-bold text-slate-700">Drag & drop files here</span>
              <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, or TXT (Max 10MB)</p>
            </div>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={() => setMethod(null)} className="mt-8 px-6 py-2.5 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Methods
          </button>
        </div>
      )}

      {/* ── GUIDED WORKFLOW SCREEN ── */}
      {method === "guided" && step < 5 && (
        <>
          {/* Step Indicator */}
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

          {/* Form Card */}
          <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#1e3a8a]/10 bg-white/70 backdrop-blur-xl">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-t-[#1e3a8a] border-blue-200 rounded-full animate-spin" />
                <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Drafting GS response metrics to conform with Subclass 500 criteria...</p>
              </div>
            ) : (
              <>
                {/* Step 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Personal Details</h3>
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
                        <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                          <option value="India">India</option>
                          <option value="China">China</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="Nepal">Nepal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Current Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[80px]" placeholder="Your residential address in home country" />
                    </div>
                  </div>
                )}

                {/* Step 2: Education History */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Education History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Last Qualification</label>
                        <input type="text" name="lastQualification" value={formData.lastQualification} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Bachelor of Science" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Institution Name</label>
                        <input type="text" name="institutionName" value={formData.institutionName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Delhi University" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Field of Study</label>
                        <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Information Technology" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-[#0b1c30] mb-2">Completion Year</label>
                          <input type="text" name="completionYear" value={formData.completionYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="2023" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#0b1c30] mb-2">GPA / Score</label>
                          <input type="text" name="gpaScore" value={formData.gpaScore} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="8.2 / 10" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Australia Course Details */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Australia Course Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Australian University</label>
                        <input type="text" name="uniName" value={formData.uniName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="RMIT University" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Course Name</label>
                        <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Master of Data Science" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">CRICOS Code</label>
                        <input type="text" name="cricosCode" value={formData.cricosCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="093282M" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Tuition Fee (AUD / Year)</label>
                        <input type="text" name="tuitionFee" value={formData.tuitionFee} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="38,000" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: GS Responses */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Genuine Student Responses</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Q1: Why did you choose this course and this provider?</label>
                        <textarea name="whyCourse" value={formData.whyCourse} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Explain your course choice interest." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Q2: Why did you choose to study in Australia rather than in your home country?</label>
                        <textarea name="whyAustralia" value={formData.whyAustralia} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List benefits of Australian study over home country." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Q3: How will this course benefit your future career in your home country?</label>
                        <textarea name="careerBenefit" value={formData.careerBenefit} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Identify target roles and job market returns." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Q4: If there are any study gaps, what did you do during this gap period?</label>
                        <textarea name="whyNotHome" value={formData.whyNotHome} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List employment details, courses, or certifications." />
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
                    <button onClick={() => setMethod(null)} className="px-6 py-3 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" /> Back to Methods
                    </button>
                  )}
                  
                  {step < 4 ? (
                    <button onClick={handleNext} className="px-6 py-3 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2">
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleGenerate} className="px-8 py-4 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2 shadow-lg shadow-blue-900/20">
                      <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Generate Statement
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── GENERATED OUTPUT SCREEN ── */}
      {(loading && method === "upload") ? (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#1e3a8a]/10 bg-white/70 backdrop-blur-xl py-20 text-center flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 border-4 border-t-[#1e3a8a] border-blue-200 rounded-full animate-spin" />
          <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Extracting criteria & generating subclass 500 visa-ready GS statement...</p>
        </div>
      ) : step === 5 && (
        <div className="space-y-8 reveal active">
          <div className="glass-card p-8 rounded-3xl border border-emerald-200/60 bg-emerald-50/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                  Genuine Student (GS) Statement Ready!
                </h3>
                <p className="text-slate-600 text-sm mt-1">Compiled in accordance with official Australian Department of Home Affairs guidelines.</p>
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

          <div id="gs-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#c5c5d3]/20 bg-white leading-relaxed text-slate-800 space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <h4 className="text-center font-sans font-bold text-xl text-slate-900 uppercase tracking-wide">
              GENUINE STUDENT (GS) STATEMENT
            </h4>
            <p className="font-sans text-right text-sm text-slate-500">
              <strong>Applicant:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Passport No:</strong> {formData.passportNumber || "A12345678"} <br />
              <strong>Course:</strong> {formData.courseName || "Master of Data Science"} ({formData.uniName || "RMIT University"})
            </p>
            <hr className="border-slate-200" />
            
            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">Section 1: Course & Provider Choice</h5>
            <p>
              I am applying for the <strong>{formData.courseName || "Master of Data Science"}</strong> at <strong>{formData.uniName || "RMIT University"}</strong>. I chose this specific course because its curriculum matches my prior background in <em>{formData.fieldOfStudy || "Information Technology"}</em>. The program provides core modules in advanced analytics and cloud architectures, areas that are directly applicable to current market opportunities.
            </p>

            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">Section 2: Why Australia instead of Home Country?</h5>
            <p>
              While my home country offers primary degrees in computer applications, Australia offers high-impact industry collaboration projects and a modern educational system recognized worldwide. RMIT provides a hands-on learning model that is not readily available in {formData.nationality || "India"}.
            </p>

            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">Section 3: Career Benefits in Home Country</h5>
            <p>
              Upon completing this course, I intend to return to {formData.nationality || "India"} to pursue opportunities as a Data Consultant. The analytical skills built during my study will allow me to enter competitive corporate environments where such expertise is highly valued.
            </p>

            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">Section 4: Gap and Timeline Analysis</h5>
            <p>
              During my recent gap period, I engaged in productive activities such as <em>{formData.whyNotHome || "industry certification courses and internship projects"}</em>. This work has reinforced my academic preparation and confirmed my commitment to mastering this discipline.
            </p>
          </div>

          <div className="flex justify-center">
            <button onClick={() => { setMethod(null); setStep(1); setUploadedFile(null); }} className="px-6 py-3 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700">
              Create Another Statement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
