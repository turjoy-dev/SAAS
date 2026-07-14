"use client";

import React, { useState } from "react";
import { FileText, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check } from "lucide-react";

export default function SopGenerator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "India",
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
    const text = document.getElementById("sop-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white shadow-sm text-xs font-bold text-blue-900 mb-4">
          <span>📝 University-Specific AI</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-[#1e3a8a]" />
          Statement of Purpose (SOP)
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Create personalized, university-specific SOPs for admission applications.
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
              <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Analyzing profiles & composing your Statement of Purpose...</p>
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
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="johndoe@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="+1 234 567 890" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Nationality</label>
                      <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="India">India</option>
                        <option value="China">China</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Bangladesh">Bangladesh</option>
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
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Academic Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Highest Qualification</label>
                      <select name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="High School">High School Diploma</option>
                        <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                        <option value="Master's Degree">Master&apos;s Degree</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Institution Name</label>
                      <input type="text" name="institution" value={formData.institution} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Harvard University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Computer Science" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">GPA / Percentage</label>
                        <input type="text" name="gpa" value={formData.gpa} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="3.8 / 85%" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Graduation Year</label>
                        <input type="text" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Target Program */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Target Program</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target Country</label>
                      <select name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Germany">Germany</option>
                        <option value="Ireland">Ireland</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target University</label>
                      <input type="text" name="targetUniversity" value={formData.targetUniversity} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="University of Melbourne" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Program Name</label>
                      <input type="text" name="programName" value={formData.programName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Master of Information Technology" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Intake Term</label>
                      <select name="intake" value={formData.intake} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
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
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Experience & Career Goals</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Work Experience & Internships (Optional)</label>
                      <textarea name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[100px]" placeholder="Briefly list your job titles, organizations, and key duties." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Key Projects or Research Works</label>
                      <textarea name="projects" value={formData.projects} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[100px]" placeholder="Describe major academic or professional projects you conducted." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Why are you interested in this program?</label>
                      <textarea name="whyProgram" value={formData.whyProgram} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[100px]" placeholder="Explain your core motivation and course alignment." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Immediate Career Goals Post-Graduation</label>
                      <textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[100px]" placeholder="e.g. Seeking a position as a Senior Systems Architect at..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
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
          <div className="glass-card p-8 rounded-3xl border border-emerald-200/60 bg-emerald-50/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                  SOP Draft Generated Successfully!
                </h3>
                <p className="text-slate-600 text-sm mt-1">Review the layout or copy/export the formatted Statement of Purpose text below.</p>
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

          <div id="sop-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#c5c5d3]/20 bg-white leading-relaxed text-slate-800 space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <h4 className="text-center font-sans font-bold text-xl text-slate-900 uppercase tracking-wide">
              STATEMENT OF PURPOSE
            </h4>
            <p className="font-sans text-right text-sm text-slate-500">
              <strong>Applicant:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Target University:</strong> {formData.targetUniversity || "University of Melbourne"} <br />
              <strong>Program:</strong> {formData.programName || "Master of Information Technology"}
            </p>
            <hr className="border-slate-200" />
            <p>
              My academic pursuits and career aspirations have always been centered on the transformative potential of technology. I am writing to formally express my interest in enrolling in the <strong>{formData.programName || "Master of Information Technology"}</strong> at <strong>{formData.targetUniversity || "University of Melbourne"}</strong> for the <strong>{formData.intake || "Fall 2025"}</strong> intake. I firmly believe this program aligns perfectly with my professional goals and previous educational background.
            </p>
            <p>
              I recently graduated with a <strong>{formData.highestQualification || "Bachelor's Degree"}</strong> in <strong>{formData.fieldOfStudy || "Computer Science"}</strong> from <strong>{formData.institution || "Harvard University"}</strong>, achieving a cumulative GPA of <strong>{formData.gpa || "3.8"}</strong>. During my studies, I engaged in extensive coursework and hands-on projects, which allowed me to cultivate a profound understanding of software systems, algorithms, and logical problem-solving. Among my achievements, my project on <em>{formData.projects || "Distributed Systems Analysis"}</em> stood out, teaching me how to apply advanced computational logic to address real-world business bottlenecks.
            </p>
            <p>
              Additionally, my background is reinforced by my experiences in <em>{formData.experience || "Software Engineering Internships"}</em>. Through these roles, I collaborated with multidisciplinary teams, honed my code architecture skills, and realized the immense value of scalable IT systems. To build upon this foundation, pursuing an advanced postgraduate degree in a highly compliant academic ecosystem is the logical next step.
            </p>
            <p>
              The decision to pursue my education in <strong>{formData.targetCountry || "Australia"}</strong> was driven by its global reputation for academic rigor, modern research infrastructure, and welcoming student environment. The <strong>{formData.targetUniversity || "University of Melbourne"}</strong> specifically stands out due to its renowned faculty, state-of-the-art labs, and strong partnerships with industry leaders. I am particularly eager to study under the guidance of distinguished professors who specialize in data systems and cloud engineering.
            </p>
            <p>
              Post-graduation, my immediate career goal is to secure a role as a <strong>{formData.careerGoals || "Senior Software Developer"}</strong>, applying the advanced technical knowledge and global perspective gained from your institution. I am confident that my diligence, academic preparation, and passion make me an excellent fit for your student community. Thank you for considering my application.
            </p>
          </div>

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700">
              Create Another Statement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
