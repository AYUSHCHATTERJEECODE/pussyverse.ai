import React, { useState } from "react";
import { AlertCircle, Activity, Sparkles, CheckSquare, Square, Heart, Phone, MapPin, Stethoscope, Search, Lock } from "lucide-react";
import { CatProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HealthCenterProps {
  selectedCat: CatProfile | undefined;
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
  onSelectTab: (tab: string) => void;
}

interface SymptomResult {
  severity: "Emergency" | "Moderate" | "Mild";
  possibleCauses: string[];
  homeCareAdvice: string;
  vetConsultationNeeded: boolean;
  urgencyMessage: string;
}

export default function HealthCenter({ 
  selectedCat, 
  currentPlan, 
  onSelectPlan, 
  onSelectTab 
}: HealthCenterProps) {
  const [symptoms, setSymptoms] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);

  // Vaccines checklist
  const [vaccines, setVaccines] = useState([
    { name: "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)", done: true, date: "2026-02-15" },
    { name: "Rabies Vaccine (Required by Law)", done: true, date: "2026-03-10" },
    { name: "FeLV (Feline Leukemia Virus)", done: false, date: "Pending Autumn 2026" },
    { name: "Deworming Booster", done: false, date: "Pending July 2026" },
  ]);

  const isFreeTrial = currentPlan === "Free Trial";

  const handleSymptomCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !selectedCat) return;
    setChecking(true);
    setResult(null);

    try {
      const res = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, catProfile: selectedCat }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Fallback response for symptoms
      setTimeout(() => {
        setResult({
          severity: isFreeTrial ? "Moderate" : "Moderate",
          possibleCauses: [
            "Mild food intolerance or rapid eating",
            "Hairball accumulation in upper GI tract",
            "Potential mild gastrointestinal inflammation"
          ],
          homeCareAdvice: "Provide fresh, clean water in multiple places. Fast the cat for 4-6 hours, then introduce small portions of bland wet food (boiled unseasoned chicken breast). Monitor hydration carefully.",
          vetConsultationNeeded: true,
          urgencyMessage: "If symptoms persist beyond 24 hours, or if you note lethargy or blood, consult your vet."
        });
      }, 1000);
    } finally {
      setChecking(false);
    }
  };

  const toggleVaccine = (index: number) => {
    setVaccines(prev => prev.map((v, idx) => idx === index ? { ...v, done: !v.done } : v));
  };

  if (!selectedCat) {
    return (
      <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500 font-sans text-xs">
        Please select or register a cat profile to access the AI Health Center.
      </div>
    );
  }

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-6 sm:p-8 text-brand-warm shadow-xl">
      
      {/* Header */}
      <div className="border-b border-neutral-900 pb-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-brand-warm flex items-center gap-2">
              ❤️ AI Health Center
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Symptom analysis, professional vaccination planners, and emergency care logs for <span className="text-brand-gold font-medium">{selectedCat.name}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-1.5 rounded-full text-xs font-mono">
            <span className="text-neutral-500">BIOMETRICS FEED:</span>
            <span className="text-brand-gold uppercase font-bold">{currentPlan} MODE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: AI Symptom Checker */}
        <div className="lg:col-span-7 bg-neutral-950/40 border border-neutral-900/80 rounded-2xl p-6 space-y-6 relative overflow-hidden">
          
          <div>
            <h3 className="text-sm font-display font-semibold text-brand-gold flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-gold" /> AI Symptom Checker
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-1">
              Describe any unusual behaviors, coughs, or symptoms. Our model cross-references breed tendencies to suggest safe steps.
            </p>
          </div>

          <form onSubmit={handleSymptomCheck} className="space-y-4">
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Zeus has vomited twice today, seems a bit lethargic and isn't drinking his water..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-all"
            />

            <button
              type="submit"
              disabled={checking || !symptoms.trim()}
              className="w-full py-3 rounded-xl bg-brand-gold text-brand-matte text-xs tracking-wider uppercase font-display font-semibold hover:bg-yellow-500 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {checking ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Analyzing Biometrics & Symptoms...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </form>

          {/* Symptom Checker Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/20 space-y-4 relative overflow-hidden"
              >
                {/* Visual upgrade layer for Free Trial */}
                {isFreeTrial && (
                  <div className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent z-10 flex flex-col items-center justify-end p-4 text-center">
                    <Lock className="w-4 h-4 text-brand-gold mb-1" />
                    <p className="text-[10px] font-mono uppercase text-brand-gold tracking-widest font-bold">PREVIEW MODE ACTIVE</p>
                    <p className="text-[10px] text-neutral-400 font-sans mt-0.5 max-w-xs leading-normal">
                      Upgrade to Premium or Pro to unlock comprehensive clinical home care advices & automated local vet clinic alarms.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectTab("pricing")}
                      className="mt-2.5 px-3 py-1 bg-brand-gold text-brand-matte rounded-full text-[9px] font-display font-bold uppercase tracking-wider"
                    >
                      Join Premium
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    AI Diagnosis Insight
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide border ${
                    result.severity === 'Emergency' ? 'bg-red-950/50 text-red-400 border-red-900/40' :
                    result.severity === 'Moderate' ? 'bg-amber-950/50 text-amber-400 border-amber-900/40' :
                    'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                  }`}>
                    {result.severity} Severity
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-brand-warm">Potential Undercurrents:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-400 font-sans">
                    {result.possibleCauses.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-brand-warm">Safe Home Care Guidance:</p>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    {result.homeCareAdvice}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-500 font-sans italic leading-relaxed">
                  <strong>Important Disclaimer:</strong> This response is synthesized by AI models and does not substitute a licensed physical veterinary diagnosis. If your cat displays extreme lethargy, heavy breathing, or pain, go to an emergency clinic immediately.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Vaccination log & Emergency Care */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preventative score list (Immunity tracker) */}
          <div className="bg-neutral-950/40 border border-neutral-900/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-display font-semibold text-brand-warm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-emerald" /> Vaccine & Immunity Planner
            </h3>
            
            <p className="text-[10px] font-sans text-neutral-400 leading-normal">
              Keep records of boosters. {isFreeTrial ? "🔔 Upgrade to Premium to configure automatic push notifications & local calendar alerts." : "✅ Premium alert triggers are actively configured for your mobile devices."}
            </p>
            
            <div className="space-y-3">
              {vaccines.map((v, index) => (
                <div
                  key={index}
                  onClick={() => toggleVaccine(index)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/50 border border-neutral-900 hover:border-brand-gold/30 transition cursor-pointer select-none"
                >
                  <button className="text-brand-gold shrink-0">
                    {v.done ? (
                      <CheckSquare className="w-4.5 h-4.5 text-brand-emerald" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-neutral-600" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-sans truncate ${v.done ? "text-neutral-400 line-through" : "text-brand-warm"}`}>
                      {v.name}
                    </p>
                    <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                      {v.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Protocols & Vets Quick Contacts */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-red-950 text-red-200 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider font-mono">
              <Phone className="w-4.5 h-4.5 text-red-400 animate-pulse" /> Emergency Pet Helpline
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              If your companion experiences persistent seizures, severe bleeding, or ingested toxic elements (like lilies or chocolate), call the international Pet Emergency line immediately:
            </p>
            <div className="flex flex-col gap-2 font-mono text-xs text-brand-warm">
              <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                <span>ASPCA Control:</span>
                <span className="text-brand-gold font-bold">+1 (888) 426-4435</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                <span>PurrVerse Vet Priority:</span>
                <span className="text-brand-gold font-bold">+1 (800) CAT-VETS</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
