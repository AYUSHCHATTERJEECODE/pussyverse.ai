import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Award, 
  Calendar, 
  Weight, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Upload,
  MessageSquare,
  Video,
  Lock,
  Volume2,
  Mic,
  Send,
  VolumeX,
  Tv,
  Waves,
  Radio,
  VideoOff
} from "lucide-react";
import { CatProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { playCatMeow, MeowType } from "../utils/catSound";

interface CatProfileManagerProps {
  cats: CatProfile[];
  selectedCatId: string;
  onSelectCat: (id: string) => void;
  onAddCat: (cat: Omit<CatProfile, "id" | "createdAt" | "isCustomPhoto">) => void;
  onDeleteCat: (id: string) => void;
  currentPlan: string;
  onSelectTab: (tab: string) => void;
}

export default function CatProfileManager({
  cats,
  selectedCatId,
  onSelectCat,
  onAddCat,
  onDeleteCat,
  currentPlan,
  onSelectTab,
}: CatProfileManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [analyzingBreed, setAnalyzingBreed] = useState(false);
  const [recognizedBreed, setRecognizedBreed] = useState("");

  // Face-to-Face AI Animation States
  const [ftfMessage, setFtfMessage] = useState("");
  const [ftfChat, setFtfChat] = useState<Array<{role: "user" | "cat", text: string}>>([]);
  const [ftfSpeaking, setFtfSpeaking] = useState(false);
  const [ftfTyping, setFtfTyping] = useState(false);
  const [ftfActive, setFtfActive] = useState(false);

  // Face-to-Face AI Video Limit & Session Tracker States
  const [freeTrialSessionsUsed, setFreeTrialSessionsUsed] = useState<number>(() => {
    const saved = localStorage.getItem("freeTrialSessionsUsed");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [premiumSessionsUsed, setPremiumSessionsUsed] = useState<number>(() => {
    const saved = localStorage.getItem("premiumSessionsUsed");
    return saved ? parseInt(saved, 10) : 0;
  });

  // 30 minute timer in seconds (1800 seconds)
  const [timeLeft, setTimeLeft] = useState(1800);

  // Sync session metrics with localStorage
  useEffect(() => {
    localStorage.setItem("freeTrialSessionsUsed", freeTrialSessionsUsed.toString());
  }, [freeTrialSessionsUsed]);

  useEffect(() => {
    localStorage.setItem("premiumSessionsUsed", premiumSessionsUsed.toString());
  }, [premiumSessionsUsed]);

  // Handle Free Trial 30-minute live countdown timer ticking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (ftfActive && currentPlan === "Free Trial") {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setFtfActive(false);
            if ("speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            setFtfSpeaking(false);
            alert("Your 30-minute Free Trial session has expired! Upgrade to Premium or Pro to keep using Face-to-Face Live AI Animation.");
            return 1800; // Reset
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ftfActive, currentPlan]);

  // Reset face-to-face states when switching active cat to prevent state leak
  useEffect(() => {
    setFtfMessage("");
    setFtfChat([]);
    setFtfSpeaking(false);
    setFtfTyping(false);
    setFtfActive(false);
    setTimeLeft(1800);
  }, [selectedCatId]);

  const handleFtfSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ftfMessage.trim() || !selectedCat) return;

    const userText = ftfMessage;
    setFtfChat(prev => [...prev, { role: "user", text: userText }]);
    setFtfMessage("");
    setFtfTyping(true);

    // Play user-feline telemetry establish sound
    playCatMeow("chirp");

    setTimeout(() => {
      setFtfTyping(false);
      setFtfSpeaking(true);

      const responsePool = [
        `*Wiggles ears and looks directly at you* Meow! Oh hooman, I can feel your warm thoughts through this neural bridge! I love being your virtual companion.`,
        `*Purrs softly, breathing in sync* Purrrr... my feline sensors show highly relaxed vibes between us. Can we look at the Marketplace for some crunchy gourmet treats next?`,
        `*Tilts head with wide shining eyes* Squeak! Did you say you love me? My heart index just spiked by 25%! You're the best parent in the PurrVerse.`,
        `*Stretches claws playfully on the screen* Rawr! Let's schedule a feather-chasing play session on my Care Routine board. I am feeling super energetic!`,
        `*Blinks slowly in sign of ultimate trust* Meow, your voice sounds so lovely. I am fully customized and rigged using your custom photo upload!`
      ];

      // Custom keyword responses
      let replyText = responsePool[Math.floor(Math.random() * responsePool.length)];
      let meowSound: MeowType = "soft";

      const lowerText = userText.toLowerCase();
      if (lowerText.includes("hungry") || lowerText.includes("food") || lowerText.includes("treat") || lowerText.includes("eat")) {
        replyText = `*Licks lips and wags tail* Meow! Food or gourmet salmon treats? I am always ready to digest premium kibbles! Let's consult the Care Planner.`;
        meowSound = "high";
      } else if (lowerText.includes("play") || lowerText.includes("game") || lowerText.includes("toy")) {
        replyText = `*Jumps and pounces toward your camera* Purrrr! Chasing lasers and batted feathers is my absolute specialty! Let's play right now!`;
        meowSound = "chirp";
      } else if (lowerText.includes("sad") || lowerText.includes("bad") || lowerText.includes("cry") || lowerText.includes("tired")) {
        replyText = `*Comes extremely close, rubbing face on the lens* Oh, don't worry hooman. I'm right here in your live stream. Let me purr until you feel cozy again. *purrrr*`;
        meowSound = "purr";
      } else if (lowerText.includes("sick") || lowerText.includes("hurt") || lowerText.includes("vet")) {
        replyText = `*Meows with an empathetic tone* Meow... if we have an active symptom, we can run a 30 km scan on the Vet Finder tab! I'll stay strong for you.`;
        meowSound = "short";
      } else if (lowerText.includes("voice") || lowerText.includes("talk") || lowerText.includes("speak") || lowerText.includes("hello")) {
        replyText = `*Purrs with high-fidelity lip sync* I am speaking back to you in real-time, hooman! My audio algorithms are optimized for vocal clarity!`;
        meowSound = "high";
      }

      setFtfChat(prev => [...prev, { role: "cat", text: replyText }]);

      // Play matching synthesized cat meow
      playCatMeow(meowSound);

      // Speak aloud using SpeechSynthesis
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const cleanSpeech = replyText.replace(/\*.*?\*/g, "").trim();
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.pitch = currentPlan === "Pro Plan" ? 1.55 : 1.35; // Higher-pitched/happier voice for Pro Plan
        utterance.rate = 1.05;
        
        utterance.onend = () => {
          setFtfSpeaking(false);
        };
        utterance.onerror = () => {
          setFtfSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setFtfSpeaking(false);
        }, 3000);
      }

    }, 1200);
  };

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "2",
    weight: "4.5",
    medicalHistory: "Healthy, no chronic conditions.",
    vaccinations: "Rabies, FVRCP fully up to date.",
    allergies: "None",
    diet: "Dry salmon kibble & wet food twice daily.",
    behavior: "Extremely affectionate, plays with feathers, loves high spots.",
    appearance: "Fluffy calico pattern with bright green eyes and soft paws.",
    personality: "Royal, graceful, curious, and slightly demanding.",
  });

  // Simple local images for quick simulation
  const dummyAvatars = [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80", // Tabby
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=80", // Cool sunglasses cat
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80", // Ginger
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80", // Elegant shorthair
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageFile(result);
        
        // Simulate advanced AI Breed Recognition
        setAnalyzingBreed(true);
        setTimeout(() => {
          const simulatedBreeds = [
            "Ragdoll (98.4% Match)",
            "Bengal Cat (96.2% Match)",
            "Persian Cat (95.1% Match)",
            "Maine Coon (97.8% Match)",
            "Siamese Cat (99.1% Match)",
            "British Shorthair (94.5% Match)"
          ];
          const randomBreed = simulatedBreeds[Math.floor(Math.random() * simulatedBreeds.length)];
          setRecognizedBreed(randomBreed);
          setFormData(prev => ({
            ...prev,
            breed: randomBreed.split(" (")[0]
          }));
          setAnalyzingBreed(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    onAddCat({
      ...formData,
      avatarUrl: imageFile || dummyAvatars[cats.length % dummyAvatars.length],
      isCustomPhoto: !!imageFile,
    });
    
    // Reset form
    setFormData({
      name: "",
      breed: "",
      age: "2",
      weight: "4.5",
      medicalHistory: "Healthy.",
      vaccinations: "Up to date.",
      allergies: "None",
      diet: "Dry salmon kibble.",
      behavior: "Active, affectionate.",
      appearance: "Soft coat.",
      personality: "Curious, quiet.",
    });
    setImageFile(null);
    setRecognizedBreed("");
    setIsAdding(false);
  };

  const selectedCat = cats.find((c) => c.id === selectedCatId);

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-6 sm:p-8 text-brand-warm shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold tracking-tight text-brand-warm flex items-center gap-2">
            🐈 AI Cat Profiles
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Manage your multi-cat household profiles and custom breed recognition keys.
          </p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-full bg-brand-gold text-brand-matte text-xs tracking-wide font-display font-semibold flex items-center gap-1.5 hover:bg-yellow-500 transition-all cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add New Cat
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cat Selector Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <p className="text-[10px] tracking-widest uppercase font-mono text-neutral-500 mb-1">
            Registered Companions ({cats.length})
          </p>
          
          <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {cats.map((cat) => {
              const isSelected = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCat(cat.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-300 min-w-[200px] lg:min-w-0 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-neutral-900/80 border-brand-gold/60 text-brand-warm shadow-lg"
                      : "bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:border-neutral-800"
                  }`}
                >
                  <img
                    src={cat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80"}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-xs text-brand-warm truncate">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5 font-sans">
                      {cat.breed}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Area: Add Form OR Profile Viewer */}
        <div className="lg:col-span-8 bg-neutral-950/30 border border-neutral-900/60 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.form
                key="add-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
                  <h3 className="text-sm tracking-wider uppercase font-mono text-brand-gold">
                    New Cat Profile & AI Breed Recognizer
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-neutral-500 hover:text-brand-warm transition"
                  >
                    Cancel
                  </button>
                </div>

                {/* AI Breed Recognition Upload Area */}
                <div className="p-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/50 flex flex-col items-center justify-center text-center">
                  {imageFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={imageFile}
                        alt="Cat candidate"
                        className="w-28 h-28 object-cover rounded-2xl border border-brand-gold/30"
                      />
                      {analyzingBreed ? (
                        <div className="flex items-center gap-1.5 text-xs text-brand-gold font-mono animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          AI recognizing breed...
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                          <p className="text-[10px] uppercase font-mono text-neutral-500">Recognized Breed Result</p>
                          <p className="text-xs font-semibold text-brand-gold font-display mt-0.5">
                            {recognizedBreed || "Breed identified successfully!"}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-4">
                      <div className="p-3 rounded-full bg-neutral-900 border border-neutral-800 mb-2 hover:border-brand-gold transition duration-300">
                        <Upload className="w-5 h-5 text-neutral-400" />
                      </div>
                      <span className="text-xs font-medium text-brand-warm">Upload Cat Image for AI Breed Recognition</span>
                      <span className="text-[10px] text-neutral-500 mt-1">Supports PNG, JPG, JPEG</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Standard Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Cat Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Luna"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Breed</label>
                    <input
                      type="text"
                      placeholder="e.g. British Shorthair"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Age (Years)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Dietary Routine</label>
                    <textarea
                      rows={2}
                      value={formData.diet}
                      onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Personality Traits</label>
                      <input
                        type="text"
                        value={formData.personality}
                        onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Appearance Description</label>
                      <input
                        type="text"
                        value={formData.appearance}
                        onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Medical Records</label>
                      <input
                        type="text"
                        value={formData.medicalHistory}
                        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Vaccinations</label>
                      <input
                        type="text"
                        value={formData.vaccinations}
                        onChange={(e) => setFormData({ ...formData, vaccinations: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-gold text-brand-matte font-display font-semibold text-xs uppercase tracking-wider hover:bg-yellow-500 transition shadow-lg cursor-pointer"
                >
                  Save Companion & Generate AI Insights
                </button>
              </motion.form>
            ) : selectedCat ? (
              <motion.div
                key="view-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-brand-warm"
              >
                {/* Header with Avatar */}
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between border-b border-neutral-900 pb-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedCat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80"}
                      alt={selectedCat.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-brand-gold/25 shadow-xl"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-display font-bold text-brand-warm">
                          {selectedCat.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-[10px] text-brand-gold uppercase tracking-wide border border-brand-gold/20">
                          Verified Profile
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-sans mt-0.5">
                        {selectedCat.breed} &bull; {selectedCat.age} years old
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteCat(selectedCat.id)}
                    className="p-2.5 rounded-xl border border-red-900/40 text-red-400 hover:bg-red-950/20 transition cursor-pointer"
                    title="Delete companion profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Two-Column Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-neutral-400">
                        <Weight className="w-3.5 h-3.5 text-brand-gold" /> Body Weight
                      </div>
                      <p className="text-xs font-semibold mt-1 font-mono text-brand-warm">
                        {selectedCat.weight} KG
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-neutral-400">
                        <Award className="w-3.5 h-3.5 text-brand-gold" /> Personality
                      </div>
                      <p className="text-xs mt-1 text-neutral-300 font-sans leading-relaxed">
                        {selectedCat.personality}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-neutral-400">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Appearance
                      </div>
                      <p className="text-xs mt-1 text-neutral-300 font-sans leading-relaxed">
                        {selectedCat.appearance}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-neutral-400">
                        <FileText className="w-3.5 h-3.5 text-brand-emerald" /> Dietary Rules
                      </div>
                      <p className="text-xs mt-1 text-neutral-300 font-sans leading-relaxed">
                        {selectedCat.diet}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-neutral-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-brand-emerald" /> Medical Records
                      </div>
                      <p className="text-xs mt-1 text-neutral-300 font-sans leading-relaxed">
                        {selectedCat.medicalHistory}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-neutral-400">
                        <Calendar className="w-3.5 h-3.5 text-brand-emerald" /> Vaccination Tracker
                      </div>
                      <p className="text-xs mt-1 text-neutral-300 font-sans leading-relaxed">
                        {selectedCat.vaccinations}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/80 border border-brand-emerald/10 text-brand-emerald rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>AI Recommendation:</strong> Vaccinations are active. This breed is susceptible to seasonal shedding. Keep fresh water in multiple locations to promote bladder health.
                  </p>
                </div>

                {/* 🎬 Cat AI Live Face-to-Face Animation Stream & Interactive Chat */}
                <div className="mt-8 border border-neutral-900 bg-neutral-950/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden" id="f2f-animation-module">
                  {/* Subtle Background Radial Aura */}
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-5 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-brand-gold/10 text-brand-gold">
                          <Video className="w-4 h-4" />
                        </span>
                        <h4 className="text-lg font-display font-bold text-brand-warm">
                          Live AI Face-to-Face Interaction Stream
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        Synthesize interactive expressions, lip-sync audio, and talk directly to {selectedCat.name} based on subscription tier capabilities.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                        selectedCat.isCustomPhoto 
                          ? "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/20" 
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                      }`}>
                        {selectedCat.isCustomPhoto ? "✓ Custom Photo Rigged" : "Standard Rig Model"}
                      </span>

                      {currentPlan === "Free Trial" && (
                        <span className="bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider">
                          Free Trial: {1 - freeTrialSessionsUsed}/1 Session Left (30m Limit)
                        </span>
                      )}
                      {currentPlan === "Premium Plan" && (
                        <span className="bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider">
                          Premium: {20 - premiumSessionsUsed}/20 Sessions Left
                        </span>
                      )}
                      {currentPlan === "Pro Plan" && (
                        <span className="bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold">
                          Pro Plan: Unlimited Sessions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing-Aware Display Configuration */}
                  {currentPlan === "Free Trial" && freeTrialSessionsUsed >= 1 ? (
                    <div className="relative rounded-2xl border border-neutral-900 bg-neutral-950/80 p-8 text-center overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
                      {/* Blurry Background Mockup */}
                      <div className="absolute inset-0 opacity-15 filter blur-md select-none pointer-events-none">
                        <img 
                          src={selectedCat.avatarUrl} 
                          alt="blurry cat preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="relative z-10 max-w-md mx-auto space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center animate-bounce-slow border border-red-500/20">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h5 className="text-md font-display font-bold text-brand-warm">
                          Free Trial Session Exhausted (1/1 Used)
                        </h5>
                        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                          You have completed your 1 free 30-minute session for <strong>{selectedCat.name}</strong>. Upgrade to Premium for 20 more sessions or Pro for infinite high-fidelity interactions!
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => onSelectTab("pricing")}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-matte font-display font-semibold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                          >
                            Upgrade Subscription Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : currentPlan === "Premium Plan" && premiumSessionsUsed >= 20 ? (
                    <div className="relative rounded-2xl border border-neutral-900 bg-neutral-950/80 p-8 text-center overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
                      {/* Blurry Background Mockup */}
                      <div className="absolute inset-0 opacity-15 filter blur-md select-none pointer-events-none">
                        <img 
                          src={selectedCat.avatarUrl} 
                          alt="blurry cat preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="relative z-10 max-w-md mx-auto space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center animate-bounce-slow border border-red-500/20">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h5 className="text-md font-display font-bold text-brand-warm">
                          Premium Plan Sessions Exhausted (20/20 Used)
                        </h5>
                        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                          You have exhausted all 20 Premium Face-to-Face sessions for <strong>{selectedCat.name}</strong>. Upgrade to the Royalty Pro Plan to enjoy infinite high-fidelity interactions and real-time voice synthesis!
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => onSelectTab("pricing")}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-matte font-display font-semibold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                          >
                            Upgrade to Royalty Pro Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Left Side: Feline Animation Video Feed Monitor */}
                      <div className="lg:col-span-5 flex flex-col">
                        <div className="relative rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950 flex-1 min-h-[280px] flex items-center justify-center shadow-inner">
                          
                          {/* Main Stream Rendering */}
                          {ftfActive ? (
                            <>
                              {/* Dynamic Visual Filter: Simple/Fuzzy vs Realistic */}
                              {currentPlan === "Premium Plan" ? (
                                // Premium Simple Plan: retro pixel scanlines, jerky static overlays
                                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
                                  {/* Scanlines layer */}
                                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.3)_50%)] bg-[size:100%_6px] opacity-40" />
                                  <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 via-transparent to-brand-gold/5 mix-blend-overlay opacity-30" />
                                  {/* Jerky horizontal glitch simulation bar */}
                                  <motion.div 
                                    animate={{ y: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                                    className="h-[2px] w-full bg-brand-gold/20 absolute opacity-30 shadow-[0_0_8px_rgba(214,175,55,0.4)]"
                                  />
                                </div>
                              ) : (
                                // Pro Plan: Ultra-HD Cinematic Vignette, High-fidelity glowing frame
                                <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl">
                                  <div className="absolute inset-0 bg-radial-vignette opacity-25" />
                                  <div className="absolute inset-0 border border-brand-gold/15 rounded-2xl animate-pulse-slow" />
                                  {/* Real-time orbital target tracking lines */}
                                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-brand-gold/30" />
                                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-brand-gold/30" />
                                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-brand-gold/30" />
                                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-brand-gold/30" />
                                </div>
                              )}

                              {/* Interactive Animated Cat Avatar */}
                              <motion.div
                                animate={
                                  currentPlan === "Pro Plan"
                                    ? {
                                        // Pro: Realistic breathing, subtle physical head bobs & scale shifts
                                        y: [0, -4, 2, -3, 0],
                                        rotate: [0, 0.4, -0.4, 0.2, 0],
                                        scale: ftfSpeaking ? [1, 1.03, 0.99, 1.02, 1] : [1, 1.015, 1],
                                      }
                                    : {
                                        // Premium: Simple digital pulsing vibration when speaking
                                        scale: ftfSpeaking ? [1, 1.04, 1, 1.04, 1] : 1,
                                      }
                                }
                                transition={{
                                  repeat: Infinity,
                                  duration: currentPlan === "Pro Plan" ? 5.5 : 0.45,
                                  ease: "easeInOut",
                                }}
                                className="w-full h-full absolute inset-0"
                              >
                                <img
                                  src={selectedCat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80"}
                                  alt={selectedCat.name}
                                  className={`w-full h-full object-cover transition-all ${
                                    currentPlan === "Premium Plan" 
                                      ? "filter contrast-130 brightness-90 saturate-120 blur-[0.4px]" 
                                      : "filter contrast-105 brightness-100 saturate-100"
                                  }`}
                                />
                              </motion.div>

                              {/* Glowing Speech Ring Overlay on the cat's mouth area */}
                              <AnimatePresence>
                                {ftfSpeaking && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: [0.7, 1, 0.7], scale: [0.8, 1.2, 0.8] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-brand-gold/40 bg-brand-gold/5 blur-sm z-20"
                                  />
                                )}
                              </AnimatePresence>

                              {/* Live Audio Equalizer Waveform overlay */}
                              {currentPlan === "Pro Plan" && (
                                <div className="absolute bottom-4 left-4 z-20 flex items-end gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-950/80 border border-brand-gold/15 backdrop-blur-md">
                                  <Radio className="w-3.5 h-3.5 text-brand-gold animate-pulse shrink-0 self-center" />
                                  <span className="text-[9px] font-mono text-neutral-400 mr-1">LIVE AUDIO</span>
                                  <div className="flex items-end gap-0.5 h-3">
                                    <div className={`w-0.5 bg-brand-gold rounded-full transition-all duration-150 ${ftfSpeaking ? "h-3 animate-pulse" : "h-1"}`} />
                                    <div className={`w-0.5 bg-brand-gold rounded-full transition-all duration-150 delay-75 ${ftfSpeaking ? "h-2.5 animate-pulse" : "h-1"}`} />
                                    <div className={`w-0.5 bg-brand-gold rounded-full transition-all duration-150 delay-150 ${ftfSpeaking ? "h-3.5 animate-pulse" : "h-1"}`} />
                                    <div className={`w-0.5 bg-brand-gold rounded-full transition-all duration-150 ${ftfSpeaking ? "h-1.5 animate-pulse" : "h-1"}`} />
                                  </div>
                                </div>
                              )}

                              {currentPlan === "Premium Plan" && (
                                <div className="absolute bottom-4 left-4 z-20 px-2 py-1 rounded-md bg-neutral-950/85 border border-neutral-800 text-[8px] font-mono text-brand-gold flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full bg-brand-gold ${ftfSpeaking ? "animate-ping" : ""}`} />
                                  STANDARD VOICE FEED
                                </div>
                              )}

                              {/* Camera Feed Watermark / Metadata Info */}
                              <div className="absolute top-4 left-4 z-20 pointer-events-none font-mono text-[8px] text-neutral-400 space-y-0.5 bg-neutral-950/40 p-1.5 rounded backdrop-blur-xs border border-neutral-900/20">
                                <p>FEED_CH: {selectedCat.name.toUpperCase()}_AI</p>
                                <p>RIG_MATCH: {selectedCat.isCustomPhoto ? "98.9% CUSTOM" : "BLUEPRINT"}</p>
                                <p>SYS_STATUS: {ftfSpeaking ? "V_OUT_ON" : "STANDBY"}</p>
                              </div>

                              {/* Live Session Timer Overlay */}
                              <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1.5 rounded-lg bg-neutral-950/85 border border-neutral-800 text-[10px] font-mono text-brand-warm flex items-center gap-1.5 shadow-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                                <span className="text-neutral-500 uppercase text-[8px]">SESSION_TIME:</span>
                                <span className="font-bold text-brand-gold">
                                  {currentPlan === "Free Trial" ? (
                                    `${Math.floor(timeLeft / 60).toString().padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`
                                  ) : (
                                    "UNLIMITED"
                                  )}
                                </span>
                              </div>

                              {/* Terminate Feed Button */}
                              <button
                                onClick={() => {
                                  setFtfActive(false);
                                  if ("speechSynthesis" in window) {
                                    window.speechSynthesis.cancel();
                                  }
                                  setFtfSpeaking(false);
                                }}
                                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-900/30 transition hover:scale-105 active:scale-95 cursor-pointer"
                                title="Disconnect Camera Feed"
                              >
                                <VideoOff className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            // Off Camera State
                            <div className="text-center p-6 space-y-4 flex flex-col items-center">
                              <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 shadow-lg">
                                <Tv className="w-6 h-6 animate-pulse" />
                              </div>
                              <div className="space-y-1">
                                <h6 className="text-xs font-semibold text-brand-warm uppercase tracking-wider font-mono">
                                  Feline Feed Disconnected
                                </h6>
                                <p className="text-[10px] text-neutral-500 max-w-[200px] font-sans">
                                  Click below to launch the orbital physical rigging feed and connect face-to-face.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  if (currentPlan === "Free Trial") {
                                    if (freeTrialSessionsUsed >= 1) {
                                      alert("Free Trial Limit Reached! You have completed your 1 free 30-minute session. Please upgrade to the Premium Plan (20 sessions) or Royalty Pro Plan (Infinite sessions) to continue interacting with your feline!");
                                      return;
                                    }
                                    setFreeTrialSessionsUsed(prev => prev + 1);
                                    setTimeLeft(1800);
                                  } else if (currentPlan === "Premium Plan") {
                                    if (premiumSessionsUsed >= 20) {
                                      alert("Premium Limit Reached! You have exhausted your 20 Premium sessions. Please upgrade to the Royalty Pro Plan for infinite sessions!");
                                      return;
                                    }
                                    setPremiumSessionsUsed(prev => prev + 1);
                                  }
                                  setFtfActive(true);
                                  playCatMeow("chirp");
                                  setFtfChat([
                                    { role: "cat", text: `*Blinks slowly, establishing secure mindlink* Meow! Hello hooman! I am live on your screen. Type or speak to me directly!` }
                                  ]);
                                }}
                                className="px-4 py-2 rounded-full border border-brand-gold/30 hover:border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/15 text-brand-gold text-[10px] font-mono tracking-wider uppercase transition cursor-pointer"
                              >
                                Establish Live Feed
                              </button>
                            </div>
                          )}

                        </div>

                        {/* Telemetry Status text underneath video */}
                        {ftfActive && (
                          <div className="mt-3 p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-900/50 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                            <span>MODE: {currentPlan === "Pro Plan" ? "REALISTIC HD GRAPHICS" : "SIMPLE CARTOON GRAPHICS"}</span>
                            <span className="flex items-center gap-1">
                              <Waves className="w-3 h-3 text-brand-gold animate-bounce" /> 
                              {ftfSpeaking ? "CAT TALKING..." : ftfTyping ? "PROCESSING SYNC..." : "LISTENING..."}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Interactive Feline Mind Link Text Portal */}
                      <div className="lg:col-span-7 flex flex-col justify-between border border-neutral-900 bg-neutral-950/50 rounded-2xl p-4 min-h-[340px]">
                        
                        {/* Interactive Speech Logs */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[265px] custom-scrollbar scroll-smooth">
                          {!ftfActive ? (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-xs text-neutral-500 font-sans italic">
                                Initialize the live stream on the left to see feline telepathic messages here.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {ftfChat.map((msg, idx) => (
                                <div 
                                  key={idx} 
                                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                >
                                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed font-sans ${
                                    msg.role === "user"
                                      ? "bg-brand-gold/10 border border-brand-gold/20 text-brand-gold rounded-tr-none"
                                      : "bg-neutral-900/80 border border-neutral-850 text-neutral-200 rounded-tl-none"
                                  }`}>
                                    {/* Format italics/actions slightly differently for premium styling */}
                                    {msg.text.startsWith("*") ? (
                                      <span>
                                        <span className="text-brand-gold font-mono text-[10px] block mb-1 italic opacity-85">
                                          {msg.text.substring(0, msg.text.indexOf("*", 1) + 1)}
                                        </span>
                                        {msg.text.substring(msg.text.indexOf("*", 1) + 1).trim()}
                                      </span>
                                    ) : (
                                      msg.text
                                    )}
                                  </div>
                                  <span className="text-[8px] font-mono text-neutral-500 mt-1 uppercase">
                                    {msg.role === "user" ? "You" : selectedCat.name}
                                  </span>
                                </div>
                              ))}

                              {ftfTyping && (
                                <div className="flex flex-col items-start">
                                  <div className="bg-neutral-900/60 border border-neutral-900/40 px-3 py-2.5 rounded-xl rounded-tl-none flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-150" />
                                  </div>
                                  <span className="text-[8px] font-mono text-neutral-500 mt-1 uppercase">
                                    {selectedCat.name} is thinking...
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Interactive Voice/Text Mind-Link Input Form */}
                        <form onSubmit={handleFtfSend} className="mt-4 pt-3 border-t border-neutral-900/80 flex items-center gap-2">
                          <input
                            type="text"
                            value={ftfMessage}
                            onChange={(e) => setFtfMessage(e.target.value)}
                            placeholder={ftfActive ? `Type to talk to ${selectedCat.name} directly...` : "Launch the visual stream first"}
                            disabled={!ftfActive || ftfTyping}
                            className="flex-1 bg-neutral-950 border border-neutral-900 hover:border-neutral-800 focus:border-brand-gold/50 rounded-xl px-4 py-2.5 text-xs text-brand-warm focus:outline-none transition placeholder-neutral-500 disabled:opacity-50 font-sans"
                          />
                          
                          {/* Aesthetic Voice/Mic input button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!ftfActive) return;
                              setFtfMessage(currentPlan === "Pro Plan" ? "Are you happy today, voice companion?" : "Do you want some treats?");
                              playCatMeow("soft");
                            }}
                            disabled={!ftfActive || ftfTyping}
                            className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-brand-gold transition hover:border-brand-gold/30 disabled:opacity-50 cursor-pointer shrink-0"
                            title="Speak via Microphone (Simulation / Fast-speak presets)"
                          >
                            <Mic className="w-4 h-4" />
                          </button>

                          <button
                            type="submit"
                            disabled={!ftfActive || !ftfMessage.trim() || ftfTyping}
                            className="p-2.5 rounded-xl bg-brand-gold text-brand-matte hover:bg-brand-gold/90 transition disabled:opacity-40 disabled:hover:bg-brand-gold cursor-pointer shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>

                      </div>

                    </div>
                  )}

                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-neutral-500 font-sans text-xs">
                Create or select a cat to see their luxury profile metrics.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
