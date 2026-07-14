"use client";

import React, { useState } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check } from "lucide-react";

export default function StudyPlan() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    nationality: "India",
    dob: "",
    currentEduLevel: "Bachelor's Degree",
    institutionName: "",
    degreeProgram: "",
    fieldOfStudy: "",
    completionYear: "",
    gpaScore: "",
    targetCountry: "Canada",
    targetUniversity: "",
    courseName: "",
    duration: "2 Years",
    startDate: "",
    studyMode: "Full-time",
    whyCourse: "",
    pastEduConnection: "",
    semesterExpectations: "",
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
    const text = document.getElementById("plan-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white shadow-sm text-xs font-bold text-blue-900 mb-4">
          <span>📚 Visa-Ready Academic Roadmap</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-[#1e3a8a]" />
          Study Plan
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Build structured study plans explaining your academic journey, course choice, and future career goals.
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
              <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Building structured academic roadmaps and career milestones...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Student Profile */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Student Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Current Education Level</label>
                      <select name="currentEduLevel" value={formData.currentEduLevel} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="High School">High School</option>
                        <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                        <option value="Master's Degree">Master&apos;s Degree</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Current Education */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Current/Previous Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Institution Name</label>
                      <input type="text" name="institutionName" value={formData.institutionName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Delhi University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Degree & Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Bachelor of Business Administration" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">GPA / Final Score</label>
                      <input type="text" name="gpaScore" value={formData.gpaScore} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="7.8 / 10" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Completion Year</label>
                      <input type="text" name="completionYear" value={formData.completionYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="2023" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Target Program */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Target Program details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target Country</label>
                      <select name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="UK">UK</option>
                        <option value="Germany">Germany</option>
                        <option value="USA">USA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Target University</label>
                      <input type="text" name="targetUniversity" value={formData.targetUniversity} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="York University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Course Name</label>
                      <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Post-Graduate Diploma in Digital Marketing" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Duration & Mode</label>
                      <select name="studyMode" value={formData.studyMode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Study Plan Details */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Study Plan Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Why are you choosing this specific course?</label>
                      <textarea name="whyCourse" value={formData.whyCourse} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List direct course value points, specialized modules, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">How does it connect to your previous education/experience?</label>
                      <textarea name="pastEduConnection" value={formData.pastEduConnection} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List links, transition reasonings, or career progressions." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">What are your semester expectations?</label>
                      <textarea name="semesterExpectations" value={formData.semesterExpectations} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Outline target projects, research fields, or internships." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">What are your long term career goals?</label>
                      <textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="State target roles in home country post graduation." />
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
                
                {step < 4 ? (
                  <button onClick={handleNext} className="px-6 py-3 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleGenerate} className="px-8 py-4 rounded-xl font-bold bg-[#1e3a8a] hover:bg-[#1a337a] text-white flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Generate Study Plan
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
                  Study Plan Generated Successfully!
                </h3>
                <p className="text-slate-600 text-sm mt-1">Review the roadmap structure below or copy/download the text format.</p>
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

          <div id="plan-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#c5c5d3]/20 bg-white leading-relaxed text-slate-800 space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <h4 className="text-center font-sans font-bold text-xl text-slate-900 uppercase tracking-wide">
              STUDY PLAN & ACADEMIC ROADMAP
            </h4>
            <p className="font-sans text-right text-sm text-slate-500">
              <strong>Student:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Institution:</strong> {formData.targetUniversity || "York University"} <br />
              <strong>Program:</strong> {formData.courseName || "Post-Graduate Diploma in Digital Marketing"}
            </p>
            <hr className="border-slate-200" />
            
            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">1. Academic & Professional Journey</h5>
            <p>
              I complete my studies representing a solid foundation in <strong>{formData.fieldOfStudy || "Business Administration"}</strong> from <strong>{formData.institutionName || "Delhi University"}</strong>. My long term commitment has always been focused on digital business systems. Applying for postgraduate specialization is the logical continuation of my previous study trajectory.
            </p>

            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">2. Rationale for Program & Country Choice</h5>
            <p>
              The digital ecosystem in <strong>{formData.targetCountry || "Canada"}</strong> provides state-of-the-art exposure to tech frameworks. The curriculum at <strong>{formData.targetUniversity || "York University"}</strong> includes modern database marketing modules and analytics platforms that directly align with my target skill set.
            </p>

            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">3. Semester-by-Semester Study expectations</h5>
            <p>
              During my academic semesters, I plan to focus on <em>{formData.semesterExpectations || "e-commerce optimization, consumer data analysis, and visual design strategies"}</em>. I will also seek hands-on projects to bridge theory with practical requirements.
            </p>

            <h5 className="font-sans font-bold text-[#1e3a8a] text-base">4. Future Career Path & Re-integration</h5>
            <p>
              Immediately following my studies, I plan to return to {formData.nationality || "India"} to pursue roles as a Digital Strategist. The skills acquired in Canada will allow me to implement data-driven marketing models in competitive national corporations.
            </p>
          </div>

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700">
              Create Another Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
