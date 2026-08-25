"use client";

import React, { useState, useEffect } from "react";
import { User, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check, AlertTriangle } from "lucide-react";

export default function PersonalStatement() {
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

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const payload = {
      factSheet: {
        fullName: formData.fullName,
        nationality: formData.nationality,
        country: "uk",
        targetCountry: "uk",
        previousDegree: formData.degree,
        previousInstitution: formData.lastInstitution,
        fieldOfStudy: formData.fieldOfStudy,
        graduationYear: formData.gradYear,
        cgpa: formData.gpa,
        doc_type: "personal_statement",
        aboutMe: formData.aboutMe,
        achievements: formData.achievements,
        experience: formData.experience,
        leadership: formData.leadership,
        skills: formData.skills,
        whyProgram: formData.whyProgram,
        experienceShaping: formData.experienceShaping,
        longTermGoals: formData.longTermGoals,
        uniqueTraits: formData.uniqueTraits
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

  const copyToClipboard = () => {
    const text = document.getElementById("statement-output")?.innerText || "";
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
          <span>👤 Authentic & Personal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#60A5FA] mb-4 flex items-center justify-center gap-3">
          <User className="w-8 h-8 sm:w-12 sm:h-12 text-[#60A5FA]" />
          Personal Statement
        </h1>
        <p className="text-[#93C5FD] text-lg max-w-2xl mx-auto leading-relaxed">
          Create authentic personal statements highlighting your background, experiences, achievements, and aspirations.
        </p>
      </div>

      {/* Step Indicator */}
      {step < 5 && (
        <div className="flex items-center justify-between max-w-md mx-auto mb-10">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-initial">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num ? "bg-[#2563EB] text-white shadow-md" : "bg-[#1F2937] border border-[#374151] text-[#93C5FD]"}`}>
                {num}
              </div>
              {num < 4 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > num ? "bg-[#60A5FA]" : "bg-[#374151]"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Glass Card Form Container */}
      {step < 5 && (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-lg border border-[#374151] bg-[#1F2937]/70 backdrop-blur-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-t-[#60A5FA] border-[#374151] rounded-full animate-spin" />
              <p className="text-lg font-bold text-[#60A5FA] animate-pulse">Drafting personal narrative milestones and matching core competencies...</p>
            </div>
          ) : (
            <>
              {/* Step 1: About You */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">About You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Age</label>
                      <input type="text" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="24" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Current City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="Mumbai" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#60A5FA] mb-2">Brief Intro About Yourself</label>
                    <textarea name="aboutMe" value={formData.aboutMe} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[80px]" placeholder="List your primary field of interest and life values." />
                  </div>
                </div>
              )}

              {/* Step 2: Education */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Education Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Current/Last Institution</label>
                      <input type="text" name="lastInstitution" value={formData.lastInstitution} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="IIT Bombay" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Degree Name</label>
                      <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="Bachelor of Technology" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="Electrical Engineering" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#60A5FA] mb-2">GPA / Final Score</label>
                        <input type="text" name="gpa" value={formData.gpa} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="8.9 / 10" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#60A5FA] mb-2">Graduation Year</label>
                        <input type="text" name="gradYear" value={formData.gradYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Experiences */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Achievements & Experiences</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Key Academic/Professional Achievements</label>
                      <textarea name="achievements" value={formData.achievements} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="List scholarships, awards, publications, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Work or Volunteer Experience</label>
                      <textarea name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="Briefly describe key roles and internships." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Leadership Roles</label>
                      <textarea name="leadership" value={formData.leadership} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="Student union, team lead, project manager positions, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Core Skills & Hobbies</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF]" placeholder="Python coding, graphic design, debate, sports..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Aspirations */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Aspirations & Future</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Why this program/university choice?</label>
                      <textarea name="whyProgram" value={formData.whyProgram} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="Describe alignment with your interests." />
                      <p className="text-xs text-[#93C5FD] mt-1.5 flex items-center gap-1">
                        💡 এখানে বাংলায় বা বাংলিশে (e.g., 'Ami 2 bochor job korsi karon...') লিখলেও চলবে। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে প্রফেশনাল ভিসা স্ট্যান্ডার্ডে রূপান্তর করবে।
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">How have your previous experiences shaped your outlook?</label>
                      <textarea name="experienceShaping" value={formData.experienceShaping} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="Describe specific learning curves or turning points." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Long Term Career Goals</label>
                      <textarea name="longTermGoals" value={formData.longTermGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="Where do you see yourself in 5-10 years?" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">What makes you unique?</label>
                      <textarea name="uniqueTraits" value={formData.uniqueTraits} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] min-h-[90px]" placeholder="Any specific personal drive, perspective, or unique outlook." />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#374151]">
                {step > 1 ? (
                  <button onClick={handleBack} className="px-6 py-3 rounded-xl font-bold bg-[#374151] hover:bg-[#4B5563] text-[#93C5FD] flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}
                
                {step < 4 ? (
                  <button onClick={handleNext} className="px-6 py-3 rounded-xl font-bold bg-[#2563EB] hover:bg-[#1d4ed8] text-white flex items-center gap-2">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleGenerate} className="px-8 py-4 rounded-xl font-bold bg-[#2563EB] hover:bg-[#1d4ed8] text-white flex items-center gap-2 shadow-lg shadow-blue-900/20">
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
          <div className="glass-card p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-400 bg-emerald-900/50 rounded-full p-0.5" />
                  Personal Statement Ready!
                </h3>
                <p className="text-[#93C5FD] text-sm mt-1">Structured with authentic hooks based on your unique backgrounds.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyToClipboard} className="px-4 py-2 bg-[#1F2937] border border-[#374151] hover:bg-[#374151] text-[#93C5FD] font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                </button>
                <button className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>

          <div id="statement-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#374151] bg-[#1F2937] leading-relaxed text-[#F9FAFB] space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <h4 className="text-center font-sans font-bold text-xl text-[#60A5FA] uppercase tracking-wide">
              PERSONAL STATEMENT
            </h4>
            <p className="font-sans text-right text-sm text-[#93C5FD]">
              <strong>Applicant:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Nationality:</strong> {formData.nationality || "Indian"} <br />
              <strong>Prior Education:</strong> {formData.degree || "Bachelor of Technology"} ({formData.lastInstitution || "IIT Bombay"})
            </p>
            <hr className="border-[#374151]" />
            
            {sopResult.text ? (
              <div dangerouslySetInnerHTML={{ __html: sopResult.text.replace(/\n/g, "<br />") }} />
            ) : (
              <div>
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
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#374151] hover:bg-[#4B5563] text-[#93C5FD]">
              Create Another Statement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
