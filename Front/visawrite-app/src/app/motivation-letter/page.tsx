"use client";

import React, { useState, useEffect } from "react";
import { Award, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check, AlertTriangle } from "lucide-react";

export default function MotivationLetter() {
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
    email: "",
    nationality: "India",
    city: "",
    eduLevel: "Bachelor's Degree",
    uniName: "",
    fieldOfStudy: "",
    gpaScore: "",
    targetUni: "",
    programName: "",
    targetCountry: "Germany",
    appType: "University Admission",
    scholarshipName: "",
    whyUni: "",
    whyProgram: "",
    achievements: "",
    careerGoals: "",
    extracurriculars: ""
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
        university: formData.targetUni,
        program: formData.programName,
        previousDegree: formData.eduLevel,
        previousInstitution: formData.uniName,
        fieldOfStudy: formData.fieldOfStudy,
        graduationYear: "2024",
        cgpa: formData.gpaScore,
        doc_type: "motivation_letter",
        whyUni: formData.whyUni,
        whyProgram: formData.whyProgram,
        achievements: formData.achievements,
        careerGoals: formData.careerGoals,
        extracurriculars: formData.extracurriculars
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
    const text = document.getElementById("letter-output")?.innerText || "";
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
          <span>🎯 Scholarship & Admission Ready</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#60A5FA] mb-4 flex items-center justify-center gap-3">
          <Award className="w-8 h-8 sm:w-12 sm:h-12 text-[#60A5FA]" />
          Motivation Letter
        </h1>
        <p className="text-[#93C5FD] text-lg max-w-2xl mx-auto leading-relaxed">
          Write compelling motivation letters for universities, scholarships, and academic programs.
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
                <div className={`flex-1 h-1 mx-2 rounded ${step > num ? "bg-[#1e3a8a]" : "bg-[#c5c5d3]/30"}`} />
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
              <div className="w-16 h-16 border-4 border-t-[#60A5FA] border-blue-200 rounded-full animate-spin" />
              <p className="text-lg font-bold text-[#60A5FA] animate-pulse">Drafting motivation letter parameters according to target institution rubrics...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="johndoe@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Current City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Mumbai" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Background */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Academic Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Current Education Level</label>
                      <select name="eduLevel" value={formData.eduLevel} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]">
                        <option value="High School">High School</option>
                        <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                        <option value="Master's Degree">Master&apos;s Degree</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">University Name</label>
                      <input type="text" name="uniName" value={formData.uniName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Delhi University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Mechanical Engineering" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">GPA / Score</label>
                      <input type="text" name="gpaScore" value={formData.gpaScore} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="8.5 / 10" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Application Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Application Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target University</label>
                      <input type="text" name="targetUni" value={formData.targetUni} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Technical University of Munich" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Program Applied For</label>
                      <input type="text" name="programName" value={formData.programName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Master of Automotive Engineering" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target Country</label>
                      <input type="text" name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Germany" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Application Type</label>
                      <select name="appType" value={formData.appType} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]">
                        <option value="University Admission">University Admission</option>
                        <option value="Scholarship Application">Scholarship Application</option>
                        <option value="Research Position">Research Position</option>
                      </select>
                    </div>
                  </div>
                  {formData.appType === "Scholarship Application" && (
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Scholarship Name</label>
                      <input type="text" name="scholarshipName" value={formData.scholarshipName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="DAAD Scholarship" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Motivation & Goals */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]/60">Motivation & Goals</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Why this specific university?</label>
                      <textarea name="whyUni" value={formData.whyUni} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="List faculty research, course labs, or university rank." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Why this program of study?</label>
                      <textarea name="whyProgram" value={formData.whyProgram} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="Explain alignment with prior academic projects." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Relevant Achievements & Extracurriculars</label>
                      <textarea name="achievements" value={formData.achievements} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="e.g. Winner of national robot design cup..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Future Career Aspirations</label>
                      <textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="Describe where you want to work and what value you'll add." />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#374151]/60">
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
                <h3 className="text-xl font-bold text-[#60A5FA] flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                  Motivation Letter Ready!
                </h3>
                <p className="text-[#93C5FD] text-sm mt-1">Formulated with structured hooks and aligned to European university standards.</p>
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

          <div id="letter-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#374151] bg-[#1F2937] leading-relaxed text-[#60A5FA] space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <p className="font-sans text-sm text-[#93C5FD]">
              <strong>From:</strong> {formData.fullName || "John Doe"}, {formData.city || "Mumbai"} <br />
              <strong>To:</strong> Admissions Office, {formData.targetUni || "Technical University of Munich"} <br />
              <strong>Subject:</strong> Letter of Motivation for {formData.programName || "Master of Automotive Engineering"}
            </p>
            <hr className="border-[#374151]" />
            
            {sopResult.text ? (
              <div dangerouslySetInnerHTML={{ __html: sopResult.text.replace(/\n/g, "<br />") }} />
            ) : (
              <div>
                <p>Dear Members of the Selection Committee,</p>
                <p>
                  I am writing to express my strong motivation to apply for the <strong>{formData.programName || "Master of Automotive Engineering"}</strong> at the <strong>{formData.targetUni || "Technical University of Munich"}</strong> for the upcoming academic intake. Having completed my <strong>{formData.eduLevel || "Bachelor's Degree"}</strong> in <strong>{formData.fieldOfStudy || "Mechanical Engineering"}</strong> at <strong>{formData.uniName || "Delhi University"}</strong> with a GPA of <strong>{formData.gpaScore || "8.5"}</strong>, I am eager to transition to postgraduate research in Germany.
                </p>
                <p>
                  My interest in this field is rooted in my academic projects and work on <em>{formData.achievements || "automotive thermal dynamics and formula student designs"}</em>. TU Munich stands out as a world leader in this discipline, offering unmatched lab resources and direct connection to advanced industry networks. Allying my background with your engineering methodologies represents a key milestone for my professional growth.
                </p>
                <p>
                  Post graduation, I aspire to contribute to sustainable smart mobility systems. I am confident that my dedication, foundation, and research focus make me a suitable candidate for admission. Thank you for your time and consideration.
                </p>
                <p className="pt-6">
                  Sincerely, <br />
                  <strong>{formData.fullName || "John Doe"}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#1F2937] hover:bg-[#374151] text-[#93C5FD]">
              Create Another Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
