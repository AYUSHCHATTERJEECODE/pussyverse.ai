import { useState, useEffect } from "react";
import { CheckSquare, Square, RefreshCw, Calendar, Clock, Sparkles, Droplet, Dumbbell, ShieldAlert, Heart, Lock } from "lucide-react";
import { CatProfile, Insights } from "../types";
import { motion } from "motion/react";

interface DailyCareAssistantProps {
  selectedCat: CatProfile | undefined;
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function DailyCareAssistant({ 
  selectedCat, 
  currentPlan, 
  onSelectPlan, 
  onSelectTab 
}: DailyCareAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [checkedActivities, setCheckedActivities] = useState<Record<string, boolean>>({});

  const isFreeTrial = currentPlan === "Free Trial";

  const generateAIPlan = async () => {
    if (!selectedCat) return;
    
    // Enforce gate for Free Trial on subsequent generation
    if (isFreeTrial && insights !== null) {
      alert("AI Plan recalibration is a Premium Plan feature! Join the Premium Circle to unlock unlimited personalized nutrition recalculations.");
      onSelectTab("pricing");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catProfile: selectedCat }),
      });
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
        setCheckedActivities({});
      } else {
        throw new Error("Failed to load insights");
      }
    } catch (e) {
      console.error(e);
      // Beautiful fallback data
      setInsights({
        healthScore: 88,
        breedDescription: `${selectedCat.breed} is known for its royal, friendly disposition. They are generally resilient but thrive on fixed routines.`,
        nutritionPlan: `Calorie goal: ~240 kcal/day. Provide high-quality kibble with 30%+ protein. Mix in wet salmon food to boost bladder hydration.`,
        preventiveCare: `Keep up FVRCP vaccine boosters. Maintain weight tracking to prevent obesity, as standard indoor cats can gain weight easily.`,
        groomingTips: `Brush twice a week. Clean ears with cat-safe solution. Trim nails every 2-3 weeks.`,
        dailySchedule: [
          { time: "07:00", activity: "Morning feeding (wet salmon recipe, 60g)", type: "feeding" },
          { time: "08:30", activity: "Interactive feather wand play session", type: "play" },
          { time: "11:00", activity: "Water fountain replenishment & check", type: "hydration" },
          { time: "15:00", activity: "Quick grooming (coat brushing & massage)", type: "grooming" },
          { time: "19:00", activity: "Evening feeding (premium kibble, 40g)", type: "feeding" },
          { time: "21:30", activity: "Litter box cleaning & general hydration check", type: "medication" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCat) {
      generateAIPlan();
    } else {
      setInsights(null);
    }
  }, [selectedCat]);

  const toggleActivity = (time: string) => {
    setCheckedActivities((prev) => ({
      ...prev,
      [time]: !prev[time],
    }));
  };

  if (!selectedCat) {
    return (
      <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500 font-sans text-xs">
        Please register or select a cat to access the AI Daily Care Assistant.
      </div>
    );
  }

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-6 sm:p-8 text-brand-warm shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold tracking-tight text-brand-warm flex items-center gap-2">
            🧠 AI Daily Care Assistant
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Personalized feeding logs, hydration planners, and active routines for <span className="text-brand-gold font-semibold">{selectedCat.name}</span>.
          </p>
        </div>

        {isFreeTrial ? (
          <button
            onClick={() => onSelectTab("pricing")}
            className="px-4 py-2 rounded-full border border-brand-gold/50 bg-brand-gold/10 text-[10px] tracking-widest font-mono text-brand-gold uppercase flex items-center gap-2 transition cursor-pointer hover:bg-brand-gold hover:text-brand-matte font-bold"
          >
            <Lock className="w-3.5 h-3.5" />
            Recalibrate AI Routine
          </button>
        ) : (
          <button
            onClick={generateAIPlan}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-brand-gold/30 hover:border-brand-gold bg-neutral-950 text-[10px] tracking-widest font-mono text-brand-gold uppercase flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Regenerating..." : "Regenerate Plan"}
          </button>
        )}
      </div>

      {isFreeTrial && (
        <div className="mb-6 p-4 rounded-2xl bg-neutral-950 border border-neutral-900 text-[11px] text-neutral-400 font-sans flex items-center gap-2.5 leading-relaxed">
          <Sparkles className="w-4.5 h-4.5 text-brand-gold shrink-0 animate-pulse" />
          <span>
            <strong>Free Trial Preview:</strong> Showing default calculated routine for {selectedCat.breed} breeds. Upgrade to <strong>Premium Plan</strong> to recalculate diets, set customized hydration limits, and configure calorie calculators.
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-brand-gold uppercase tracking-wider animate-pulse">
            AI is analyzing {selectedCat.name}'s biometric profile...
          </p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Daily Schedule List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm tracking-wider uppercase font-mono text-brand-gold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Today's Intelligent Routine
            </h3>
            
            <div className="space-y-3">
              {insights.dailySchedule.map((item, idx) => {
                const isChecked = checkedActivities[item.time] || false;
                return (
                  <div
                    key={idx}
                    onClick={() => toggleActivity(item.time)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-350 cursor-pointer select-none ${
                      isChecked
                        ? "bg-brand-emerald/10 border-brand-emerald/30 text-neutral-300"
                        : "bg-neutral-950/50 border-neutral-900 text-brand-warm hover:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <button className="text-brand-gold">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-brand-emerald" />
                        ) : (
                          <Square className="w-5 h-5 text-neutral-600 hover:text-brand-gold" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-wider font-semibold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400">
                            {item.time}
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
                            item.type === 'feeding' ? "bg-orange-950/50 text-orange-400" :
                            item.type === 'play' ? "bg-purple-950/50 text-purple-400" :
                            item.type === 'hydration' ? "bg-blue-950/50 text-blue-400" :
                            "bg-neutral-900 text-neutral-400"
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <p className={`text-xs mt-1.5 font-sans leading-relaxed truncate ${isChecked ? "line-through text-neutral-500" : ""}`}>
                          {item.activity}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Metrics & Insights Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Health Score Shield */}
            <div className="p-6 rounded-3xl bg-neutral-950/50 border border-brand-gold/15 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-[10px] uppercase font-mono text-neutral-500">Predicted Health Score</p>
                <p className="text-3xl font-display font-bold text-brand-gold mt-1">
                  {insights.healthScore} <span className="text-xs text-neutral-500 font-mono">/ 100</span>
                </p>
                <p className="text-[10px] text-brand-emerald font-sans mt-1">
                  &bull; Optimal Metabolic State
                </p>
              </div>
              
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Visual circle gauge */}
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#1c1917" strokeWidth="4" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="4"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (175 * insights.healthScore) / 100}
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold text-brand-gold">
                  {insights.healthScore}%
                </span>
              </div>
            </div>

            {/* AI Insights Accordion/List */}
            <div className="space-y-4">
              <div className="p-4 bg-neutral-900/30 border border-neutral-900 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold font-display">
                  <Heart className="w-4 h-4 text-brand-gold" /> Personalized Nutrition Advisor
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mt-2">
                  {insights.nutritionPlan}
                </p>
              </div>

              <div className="p-4 bg-neutral-900/30 border border-neutral-900 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold font-display">
                  <ShieldAlert className="w-4 h-4 text-brand-emerald" /> Preventive Care Recommendations
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mt-2">
                  {insights.preventiveCare}
                </p>
              </div>

              <div className="p-4 bg-neutral-900/30 border border-neutral-900 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold font-display">
                  <Sparkles className="w-4 h-4 text-brand-gold" /> Grooming & Coat Instructions
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mt-2">
                  {insights.groomingTips}
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500 font-sans text-xs">
          Press 'Regenerate Plan' to fetch a personalized AI daily routine.
        </div>
      )}
    </div>
  );
}
