"use client";

import React, { useState } from "react";
import { User, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check } from "lucide-react";

export default function PersonalStatement() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    nationality: "India",
    city: "",
    aboutMe: "",
    lastInstitution: "",
    degree: "",
    fieldOfStudy: "",
    gpa: "",
    gradYear: "",
    achievements: "",
    experience: "",
    leadership: "",
    skills: "",
    whyProgram: "",
    experienceShaping: "",
    longTermGoals: "",
    uniqueTraits: ""
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
    const text = document.getElementById("statement-output")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white shadow-sm text-xs font-bold text-blue-900 mb-4">
          <span>👤 Authentic & Personal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <User className="w-8 h-8 sm:w-12 sm:h-12 text-[#1e3a8a]" />
          Personal Statement
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Create authentic personal statements highlighting your background, experiences, achievements, and aspirations.
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
              <p className="text-lg font-bold text-[#1e3a8a] animate-pulse">Drafting personal narrative milestones and matching core competencies...</p>
            </div>
          ) : (
            <>
              {/* Step 1: About You */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">About You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Age</label>
                      <input type="text" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="24" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Current City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Mumbai" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0b1c30] mb-2">Brief Intro About Yourself</label>
                    <textarea name="aboutMe" value={formData.aboutMe} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[80px]" placeholder="List your primary field of interest and life values." />
                  </div>
                </div>
              )}

              {/* Step 2: Education */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Education Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Current/Last Institution</label>
                      <input type="text" name="lastInstitution" value={formData.lastInstitution} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="IIT Bombay" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Degree Name</label>
                      <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Bachelor of Technology" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Electrical Engineering" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">GPA / Final Score</label>
                        <input type="text" name="gpa" value={formData.gpa} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="8.9 / 10" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0b1c30] mb-2">Graduation Year</label>
                        <input type="text" name="gradYear" value={formData.gradYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Experiences */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Achievements & Experiences</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Key Academic/Professional Achievements</label>
                      <textarea name="achievements" value={formData.achievements} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="List scholarships, awards, publications, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Work or Volunteer Experience</label>
                      <textarea name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Briefly describe key roles and internships." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Leadership Roles</label>
                      <textarea name="leadership" value={formData.leadership} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Student union, team lead, project manager positions, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Core Skills & Hobbies</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30]" placeholder="Python coding, graphic design, debate, sports..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Aspirations */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-2 border-slate-200/60">Aspirations & Future</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Why this program/university choice?</label>
                      <textarea name="whyProgram" value={formData.whyProgram} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Describe alignment with your interests." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">How have your previous experiences shaped your outlook?</label>
                      <textarea name="experienceShaping" value={formData.experienceShaping} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Describe specific learning curves or turning points." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">Long Term Career Goals</label>
                      <textarea name="longTermGoals" value={formData.longTermGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Where do you see yourself in 5-10 years?" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0b1c30] mb-2">What makes you unique?</label>
                      <textarea name="uniqueTraits" value={formData.uniqueTraits} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-[#c5c5d3]/40 rounded-xl text-[#0b1c30] min-h-[90px]" placeholder="Any specific personal drive, perspective, or unique outlook." />
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
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Generate Statement
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
                  Personal Statement Ready!
                </h3>
                <p className="text-slate-600 text-sm mt-1">Structured with authentic hooks based on your unique backgrounds.</p>
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

          <div id="statement-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#c5c5d3]/20 bg-white leading-relaxed text-slate-800 space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <h4 className="text-center font-sans font-bold text-xl text-slate-900 uppercase tracking-wide">
              PERSONAL STATEMENT
            </h4>
            <p className="font-sans text-right text-sm text-slate-500">
              <strong>Applicant:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Nationality:</strong> {formData.nationality || "Indian"} <br />
              <strong>Prior Education:</strong> {formData.degree || "Bachelor of Technology"} ({formData.lastInstitution || "IIT Bombay"})
            </p>
            <hr className="border-slate-200" />
            
            <p>
              Every individual is shaped by a unique series of events, challenges, and milestones. My own path has been deeply rooted in my passion for <em>{formData.aboutMe || "technology and research development"}</em>. I have always believed that learning is an active, continuous engagement with the world around us.
            </p>
            <p>
              During my academic pursuits in <strong>{formData.fieldOfStudy || "Electrical Engineering"}</strong> at <strong>{formData.lastInstitution || "IIT Bombay"}</strong>, achieving a GPA of <strong>{formData.gpa || "8.9"}</strong>, I was able to participate in various research groups. My key achievements, including <em>{formData.achievements || "top performance in regional design competitions"}</em>, taught me how to synthesize complex concepts into tangible applications.
            </p>
            <p>
              These experiences were further enriched by my leadership roles as <em>{formData.leadership || "Student Council Lead"}</em>. Leading teams under pressure taught me how to communicate, manage differing perspectives, and build consensus.
            </p>
            <p>
              Looking forward, I plan to leverage my training to pursue roles in <em>{formData.longTermGoals || "advanced research and development consulting"}</em>. My unique traits, including <em>{formData.uniqueTraits || "my persistence and analytical mindset"}</em>, will help me add value to your academic community. Thank you for considering my candidancy.
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
