"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, Copy, Download, Check, AlertTriangle } from "lucide-react";

export default function StudyPlan() {
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
        university: formData.targetUniversity,
        program: formData.courseName,
        dob: formData.dob,
        previousDegree: formData.currentEduLevel,
        previousInstitution: formData.institutionName,
        fieldOfStudy: formData.fieldOfStudy,
        graduationYear: formData.completionYear,
        cgpa: formData.gpaScore,
        doc_type: "study_plan",
        whyCourse: formData.whyCourse,
        pastEduConnection: formData.pastEduConnection,
        semesterExpectations: formData.semesterExpectations,
        careerGoals: formData.careerGoals
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
    const text = document.getElementById("plan-output")?.innerText || "";
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
          <span>📚 Visa-Ready Academic Roadmap</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#60A5FA] mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-[#60A5FA]" />
          Study Plan
        </h1>
        <p className="text-[#93C5FD] text-lg max-w-2xl mx-auto leading-relaxed">
          Build structured study plans explaining your academic journey, course choice, and future career goals.
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
              <p className="text-lg font-bold text-[#60A5FA] animate-pulse">Building structured academic roadmaps and career milestones...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Student Profile */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Student Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Indian" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Current Education Level</label>
                      <select name="currentEduLevel" value={formData.currentEduLevel} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]">
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
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Current/Previous Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Institution Name</label>
                      <input type="text" name="institutionName" value={formData.institutionName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Delhi University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Degree & Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Bachelor of Business Administration" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">GPA / Final Score</label>
                      <input type="text" name="gpaScore" value={formData.gpaScore} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="7.8 / 10" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Completion Year</label>
                      <input type="text" name="completionYear" value={formData.completionYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="2023" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Target Program */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Target Program details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target Country</label>
                      <select name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]">
                        <option value="UK">United Kingdom (UK)</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Australia">Australia</option>
                        <option value="South Korea">South Korea</option>
                        <option value="Canada">Canada</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Target University</label>
                      <input type="text" name="targetUniversity" value={formData.targetUniversity} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="York University" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Course Name</label>
                      <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]" placeholder="Post-Graduate Diploma in Digital Marketing" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Duration & Mode</label>
                      <select name="studyMode" value={formData.studyMode} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA]">
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
                  <h3 className="text-xl font-bold text-[#60A5FA] border-b pb-2 border-[#374151]">Study Plan Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">Why are you choosing this specific course?</label>
                      <textarea name="whyCourse" value={formData.whyCourse} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="List direct course value points, specialized modules, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">How does it connect to your previous education/experience?</label>
                      <textarea name="pastEduConnection" value={formData.pastEduConnection} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="List links, transition reasonings, or career progressions." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">What are your semester expectations?</label>
                      <textarea name="semesterExpectations" value={formData.semesterExpectations} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="Outline target projects, research fields, or internships." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#60A5FA] mb-2">What are your long term career goals?</label>
                      <textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-[#60A5FA] min-h-[90px]" placeholder="State target roles in home country post graduation." />
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
          <div className="glass-card p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="w-6 h-6 text-emerald-400 bg-emerald-900/50 rounded-full p-0.5" />
                  Study Plan Generated Successfully!
                </h3>
                <p className="text-[#93C5FD] text-sm mt-1">Review the roadmap structure below or copy/download the text format.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyToClipboard} className="px-4 py-2 bg-[#1F2937] border border-[#374151] hover:bg-[#374151] text-[#93C5FD] font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                </button>
                <button className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>

          <div id="plan-output" className="neumorphic-surface p-8 sm:p-12 rounded-3xl border border-[#374151] bg-[#1F2937] leading-relaxed text-[#93C5FD] space-y-6 font-serif max-h-[700px] overflow-y-auto">
            <h4 className="text-center font-sans font-bold text-xl text-[#60A5FA] uppercase tracking-wide">
              STUDY PLAN & ACADEMIC ROADMAP
            </h4>
            <p className="font-sans text-right text-sm text-[#93C5FD]">
              <strong>Student:</strong> {formData.fullName || "John Doe"} <br />
              <strong>Institution:</strong> {formData.targetUniversity || "York University"} <br />
              <strong>Program:</strong> {formData.courseName || "Post-Graduate Diploma in Digital Marketing"}
            </p>
            <hr className="border-[#374151]" />
            
            {sopResult.text ? (
              <div dangerouslySetInnerHTML={{ __html: sopResult.text.replace(/\n/g, "<br />") }} />
            ) : (
              <div>
                <h5 className="font-sans font-bold text-[#60A5FA] text-base">1. Academic & Professional Journey</h5>
                <p>
                  I complete my studies representing a solid foundation in <strong>{formData.fieldOfStudy || "Business Administration"}</strong> from <strong>{formData.institutionName || "Delhi University"}</strong>. My long term commitment has always been focused on digital business systems. Applying for postgraduate specialization is the logical continuation of my previous study trajectory.
                </p>

                <h5 className="font-sans font-bold text-[#60A5FA] text-base">2. Rationale for Program & Country Choice</h5>
                <p>
                  The digital ecosystem in <strong>{formData.targetCountry || "Canada"}</strong> provides state-of-the-art exposure to tech frameworks. The curriculum at <strong>{formData.targetUniversity || "York University"}</strong> includes modern database marketing modules and analytics platforms that directly align with my target skill set.
                </p>

                <h5 className="font-sans font-bold text-[#60A5FA] text-base">3. Semester-by-Semester Study expectations</h5>
                <p>
                  During my academic semesters, I plan to focus on <em>{formData.semesterExpectations || "e-commerce optimization, consumer data analysis, and visual design strategies"}</em>. I will also seek hands-on projects to bridge theory with practical requirements.
                </p>

                <h5 className="font-sans font-bold text-[#60A5FA] text-base">4. Future Career Path & Re-integration</h5>
                <p>
                  Immediately following my studies, I plan to return to {formData.nationality || "India"} to pursue roles as a Digital Strategist. The skills acquired in Canada will allow me to implement data-driven marketing models in competitive national corporations.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-[#374151] hover:bg-[#4B5563] text-[#93C5FD]">
              Create Another Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
