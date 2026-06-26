import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Award, Droplet, Dumbbell, ShieldAlert, Heart, Calendar, Lock, Sparkles, Cpu, Activity } from "lucide-react";
import { CatProfile } from "../types";

interface AnalyticsDashboardProps {
  selectedCat: CatProfile | undefined;
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function AnalyticsDashboard({ 
  selectedCat, 
  currentPlan, 
  onSelectPlan, 
  onSelectTab 
}: AnalyticsDashboardProps) {
  
  // Biometric datasets
  const weightData = [
    { month: "Jan", weight: 4.1 },
    { month: "Feb", weight: 4.2 },
    { month: "Mar", weight: 4.3 },
    { month: "Apr", weight: 4.4 },
    { month: "May", weight: 4.5 },
    { month: "Jun", weight: selectedCat ? parseFloat(selectedCat.weight) || 4.5 : 4.5 },
  ];

  const hydrationData = [
    { day: "Mon", actual: 180, target: 200 },
    { day: "Tue", actual: 190, target: 200 },
    { day: "Wed", actual: 210, target: 200 },
    { day: "Thu", actual: 160, target: 200 },
    { day: "Fri", actual: 200, target: 200 },
    { day: "Sat", actual: 220, target: 200 },
    { day: "Sun", actual: 195, target: 200 },
  ];

  const activityData = [
    { hour: "08:00", playMinutes: 15 },
    { hour: "10:00", playMinutes: 5 },
    { hour: "12:00", playMinutes: 0 },
    { hour: "14:00", playMinutes: 0 },
    { hour: "16:00", playMinutes: 10 },
    { hour: "18:00", playMinutes: 25 },
    { hour: "20:00", playMinutes: 20 },
    { hour: "22:00", playMinutes: 10 },
  ];

  // Exclusive Pro Plan Early Access Experimental Biometrics
  const cognitiveIndexData = [
    { subject: 'Curiosity', value: 92, fullMark: 100 },
    { subject: 'Response', value: 88, fullMark: 100 },
    { subject: 'Sassiness', value: 95, fullMark: 100 },
    { subject: 'Affection', value: 98, fullMark: 100 },
    { subject: 'Playfulness', value: 85, fullMark: 100 },
    { subject: 'Napping', value: 100, fullMark: 100 },
  ];

  const hrvSleepData = [
    { time: "Day 1", hrv: 62, sleepScore: 78 },
    { time: "Day 2", hrv: 65, sleepScore: 82 },
    { time: "Day 3", hrv: 70, sleepScore: 90 },
    { time: "Day 4", hrv: 58, sleepScore: 75 },
    { time: "Day 5", hrv: 68, sleepScore: 85 },
    { time: "Day 6", hrv: 75, sleepScore: 92 },
    { time: "Day 7", hrv: 72, sleepScore: 88 },
  ];

  if (!selectedCat) {
    return (
      <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500 font-sans text-xs">
        Please register or select a cat companion to see metrics in the Analytics Dashboard.
      </div>
    );
  }

  // Gates
  const isFreeTrial = currentPlan === "Free Trial";
  const isProPlan = currentPlan === "Pro Plan";

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-6 sm:p-8 text-brand-warm shadow-xl space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-neutral-900 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-brand-warm flex items-center gap-2">
              📊 Analytics Dashboard
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Track weight curves, hydration targets, physical play minutes, and download monthly health reports.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-1.5 rounded-full text-xs font-mono">
            <span className="text-neutral-500">ACTIVE SUBSCRIPTION:</span>
            <span className="text-brand-gold uppercase font-bold">{currentPlan}</span>
          </div>
        </div>
      </div>

      {/* Row 1: Weight & Water (Water intake is locked for Free Trial) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weight Curve (Open to all) */}
        <div className="p-5 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Weight Progression (KG)
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">Free Tier Standard</span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#161616" />
                <XAxis dataKey="month" stroke="#444" fontSize={10} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#444" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }}
                  labelStyle={{ color: "#D4AF37", fontSize: "11px" }}
                  itemStyle={{ color: "#f8f7f5", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="weight" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#weightColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water Intake (Locked on Free Trial) */}
        <div className="p-5 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-4 relative overflow-hidden">
          {isFreeTrial && (
            <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-6 h-6 text-brand-gold mb-2 animate-pulse" />
              <h4 className="text-xs font-mono uppercase text-brand-gold tracking-widest font-semibold">Premium Feature</h4>
              <p className="text-[11px] text-neutral-400 font-sans mt-1 max-w-xs leading-relaxed">
                Unlock advanced daily hydration trend tracking & target goals with <strong>Premium Plan</strong> or above.
              </p>
              <button
                onClick={() => onSelectTab("pricing")}
                className="mt-3.5 px-4 py-1.5 rounded-full bg-brand-gold text-brand-matte font-display font-semibold text-[9px] uppercase tracking-wider"
              >
                Join Premium Circle
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5">
              <Droplet className="w-4 h-4" /> Water Intake (ML)
            </h3>
            <span className="text-[10px] font-mono text-brand-emerald">Target: 200 ML</span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hydrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161616" />
                <XAxis dataKey="day" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }}
                  labelStyle={{ color: "#D4AF37", fontSize: "11px" }}
                  itemStyle={{ color: "#f8f7f5", fontSize: "11px" }}
                />
                <Bar dataKey="actual" fill="#1E8E5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Playtime & Report Card (Playtime is locked for Free Trial) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Playtime Tracker (Locked on Free Trial) */}
        <div className="lg:col-span-8 p-5 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-4 relative overflow-hidden">
          {isFreeTrial && (
            <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-6 h-6 text-brand-gold mb-2 animate-pulse" />
              <h4 className="text-xs font-mono uppercase text-brand-gold tracking-widest font-semibold">Premium Feature</h4>
              <p className="text-[11px] text-neutral-400 font-sans mt-1 max-w-xs leading-relaxed">
                Unlock physical playtime distribution tracking and hourly biometrics with <strong>Premium Plan</strong>.
              </p>
              <button
                onClick={() => onSelectTab("pricing")}
                className="mt-3.5 px-4 py-1.5 rounded-full bg-brand-gold text-brand-matte font-display font-semibold text-[9px] uppercase tracking-wider"
              >
                Join Premium Circle
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" /> Today's Active Play Time (Minutes)
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">Hourly Distribution</span>
          </div>

          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161616" />
                <XAxis dataKey="hour" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }}
                  labelStyle={{ color: "#D4AF37", fontSize: "11px" }}
                  itemStyle={{ color: "#f8f7f5", fontSize: "11px" }}
                />
                <Line type="monotone" dataKey="playMinutes" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic Report Card (Premium discount details inside) */}
        <div className="lg:col-span-4 p-5 bg-gradient-to-tr from-brand-gold/10 via-neutral-950 to-neutral-950 border border-brand-gold/15 rounded-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-gold animate-bounce-slow" />
              <p className="text-xs uppercase font-mono tracking-wider text-brand-gold font-semibold">Monthly Feline Report</p>
            </div>
            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Based on {selectedCat.name}'s biometric progression, dietary logs, and behavior updates, she receives an overall health index of <strong>Grade A- (Excellent)</strong>. We recommend maintaining her {selectedCat.weight}kg weight curve.
            </p>
            
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-900 text-[10px] text-neutral-400 space-y-1">
              <div className="flex justify-between">
                <span>Diet Compliance:</span>
                <span className="text-brand-emerald">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Vaccine Boosters:</span>
                <span className="text-brand-gold">Up to Date</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert(`Comprehensive Health Report Compiled for ${selectedCat.name}! In production, this saves to an encrypted PDF report.`)}
            className="w-full mt-4 py-2.5 rounded-xl bg-brand-gold text-brand-matte text-xs font-display font-semibold hover:bg-yellow-500 transition cursor-pointer text-center"
          >
            Download Health Report
          </button>
        </div>
      </div>

      {/* Row 3: Early Access Experimental Biometrics (Pro Plan Exclusive) */}
      <div className="border-t border-neutral-900 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-display font-bold text-brand-warm flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
              <span>🔬 Early Access: Experimental Biometric Telemetry</span>
            </h3>
            <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
              Exclusive advanced cognitive algorithms and Heart Rate Variability (HRV) indices for pet technology pioneers.
            </p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/25 font-mono text-[9px] uppercase tracking-widest font-bold">
            Royalty Pro Exclusive
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Lock Overlay if NOT on Pro Plan */}
          {!isProPlan && (
            <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center rounded-3xl border border-brand-gold/20 shadow-2xl min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center mb-3 animate-bounce-slow">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-md font-display font-bold text-brand-warm">Royalty Pro Plan Subscription Required</h4>
              <p className="text-xs text-neutral-400 font-sans max-w-md mt-1 leading-relaxed">
                Cognitive Intelligence Mapping and Heart Rate Variability sleep curves are unlocked exclusively for <strong>Royalty Pro</strong> pioneers.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => onSelectTab("pricing")}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-matte rounded-full font-display font-bold text-[10px] uppercase tracking-wider shadow-lg"
                >
                  Upgrade to Royalty Pro
                </button>
              </div>
            </div>
          )}

          {/* Left: Cognitive Index Radar */}
          <div className="lg:col-span-5 p-5 bg-neutral-950/40 border border-neutral-900 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Cognitive & Behavioral Intelligence
              </h4>
            </div>

            <div className="h-56 w-full flex items-center justify-center text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cognitiveIndexData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" stroke="#666" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#333" fontSize={8} />
                  <Radar name={selectedCat.name} dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Heart Rate Variability & Sleep Quality */}
          <div className="lg:col-span-7 p-5 bg-neutral-950/40 border border-neutral-900 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5">
                <Activity className="w-4 h-4 animate-pulse" /> HRV Sleep Curve (Autonomous System)
              </h4>
              <span className="text-[10px] font-mono text-brand-emerald">Telemetry Active</span>
            </div>

            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hrvSleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hrvColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="sleepColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E8E5A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1E8E5A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#161616" />
                  <XAxis dataKey="time" stroke="#444" fontSize={10} />
                  <YAxis stroke="#444" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Area type="monotone" name="Heart Rate Variability (ms)" dataKey="hrv" stroke="#D4AF37" strokeWidth={1.5} fill="url(#hrvColor)" />
                  <Area type="monotone" name="Deep Sleep Score (%)" dataKey="sleepScore" stroke="#1E8E5A" strokeWidth={1.5} fill="url(#sleepColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
