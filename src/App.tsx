import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  MessageCircle,
  Activity,
  MapPin,
  ShoppingBag,
  TrendingUp,
  User,
  Menu,
  X,
  Bell,
  CheckCircle,
  Heart,
  Volume2,
  VolumeX
} from "lucide-react";

// Types
import { CatProfile } from "./types";

// Modular Subcomponents
import HeroSection from "./components/HeroSection";
import PricingModel from "./components/PricingModel";
import CatProfileManager from "./components/CatProfileManager";
import DailyCareAssistant from "./components/DailyCareAssistant";
import HealthCenter from "./components/HealthCenter";
import VetFinder from "./components/VetFinder";
import CommunitySection from "./components/CommunitySection";
import MarketplaceSection from "./components/MarketplaceSection";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CatCompanion from "./components/CatCompanion";
import PaymentModal from "./components/PaymentModal";
import FunnyCatQuotes from "./components/FunnyCatQuotes";

// Dynamic audio utility
import { playCatMeow, MeowType } from "./utils/catSound";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currentPlan, setCurrentPlan] = useState<string>("Free Trial");
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Payment Modal state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState<{
    name: string;
    price: number;
    type: "subscription" | "product";
    onSuccess: () => void;
  } | null>(null);

  // Initial Cat Profiles to populate with rich contents
  const [cats, setCats] = useState<CatProfile[]>([
    {
      id: "cat-1",
      name: "Zeus",
      breed: "British Shorthair",
      age: "2.5",
      weight: "5.2",
      medicalHistory: "Excellent health index, no chronic symptoms.",
      vaccinations: "Rabies & FVRCP fully booster checked.",
      allergies: "Slight pollen sensitivity in spring.",
      diet: "Premium high-protein salmon kibble & wet gravy recipe.",
      behavior: "Gentle giant, loves sleeping on sunny windowsills, purrs loudly.",
      appearance: "Thick plush blue-grey fur with large expressive golden eyes.",
      personality: "Calm, royal, incredibly graceful, yet demanding of morning rubs.",
      avatarUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-2",
      name: "Luna",
      breed: "Siamese",
      age: "1.2",
      weight: "3.8",
      medicalHistory: "Healthy kitten checks, active metabolism.",
      vaccinations: "Rabies, FVRCP booster completed.",
      allergies: "Grain ingredients (fed grain-free only).",
      diet: "Dehydrated organic chicken bits & purified water.",
      behavior: "Extremely vocal, loves chasing toy lasers, jumps on high cupboards.",
      appearance: "Cream colored body with sleek dark chocolate points and deep blue eyes.",
      personality: "Extremely sassy, curious explorer, chatterbox, and very loving.",
      avatarUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=80",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [selectedCatId, setSelectedCatId] = useState<string>("cat-1");

  // Trigger occasional premium smart notifications for high realism and user engagement
  useEffect(() => {
    const notifications = [
      "🧠 AI Care Assistant: Zeus is due for his afternoon coat brushing!",
      "🔔 Hydration alert: Luna's water fountain was active. Excellent hydration stats!",
      "🛒 Marketplace Match: Save 15% on customized Grain-Free Salmon Kibble!",
      "🩺 Vet Finder: Grand Velvet Feline Hospital added a weekend telemedicine slot."
    ];

    const interval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setShowNotification(randomNotification);
      setTimeout(() => setShowNotification(null), 5000);
    }, 20000);

    // Initial greeting notification
    setTimeout(() => {
      setShowNotification("✨ Welcome to PurrVerse AI! Create profiles to generate personalized daily care schedules.");
      setTimeout(() => setShowNotification(null), 5000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Global click detector to play cute synthesized cat sounds on option/button interaction
  useEffect(() => {
    if (!soundEnabled) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Detect if click was on button, link, selector, or customizable clickable containers
      const interactiveEl = target.closest("button, a, select, input, [role='button']");
      if (interactiveEl) {
        const text = (interactiveEl.textContent || "").toLowerCase();
        let soundType: MeowType = "short";

        if (text.includes("emergency") || text.includes("helpline") || text.includes("danger") || text.includes("alert") || text.includes("911") || text.includes("call")) {
          soundType = "high";
        } else if (text.includes("book") || text.includes("pay") || text.includes("secure") || text.includes("checkout")) {
          soundType = "chirp";
        } else if (text.includes("care") || text.includes("routine") || text.includes("health") || text.includes("vets")) {
          soundType = "purr";
        } else if (text.includes("delete") || text.includes("remove") || text.includes("cancel")) {
          soundType = "angry";
        } else if (text.includes("play") || text.includes("cat") || text.includes("purr")) {
          soundType = "soft";
        } else {
          const types: MeowType[] = ["short", "chirp", "soft"];
          soundType = types[Math.floor(Math.random() * types.length)];
        }

        // Delay slightly for click responsiveness
        setTimeout(() => playCatMeow(soundType), 50);
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [soundEnabled]);

  const handleSelectCat = (id: string) => {
    setSelectedCatId(id);
    const cat = cats.find(c => c.id === id);
    if (cat) {
      setShowNotification(`🐈 Switched active profile to ${cat.name}. Care logs updated.`);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleAddCat = (newCat: Omit<CatProfile, "id" | "createdAt">) => {
    const id = "cat-" + Date.now();
    const created: CatProfile = {
      ...newCat,
      id,
      createdAt: new Date().toISOString(),
    };
    setCats(prev => [...prev, created]);
    setSelectedCatId(id);
    setShowNotification(`🎉 ${newCat.name} registered successfully! AI care curves compiled.`);
    setTimeout(() => setShowNotification(null), 4000);
  };

  const handleDeleteCat = (id: string) => {
    if (cats.length <= 1) {
      alert("At least one registered cat profile is required for ecosystem operation.");
      return;
    }
    const catToDelete = cats.find(c => c.id === id);
    setCats(prev => prev.filter(c => c.id !== id));
    setSelectedCatId(cats.find(c => c.id !== id)?.id || "");
    setShowNotification(`🗑️ Deleted profile for ${catToDelete?.name || 'Cat'}.`);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleSelectPlan = (planName: string) => {
    let price = 0;
    if (planName === "Premium Plan") price = 29;
    else if (planName === "Pro Plan") price = 99;
    else if (planName === "Feline Merchant Plan") price = 149;
    else {
      // Free Trial or other
      setCurrentPlan(planName);
      setShowNotification(`👑 Subscription updated! You are now subscribed to the ${planName}.`);
      setTimeout(() => setShowNotification(null), 5000);
      setActiveTab("profiles");
      return;
    }

    setPaymentItem({
      name: `${planName} Subscription`,
      price,
      type: "subscription",
      onSuccess: () => {
        setCurrentPlan(planName);
        setShowNotification(`👑 Subscription updated! You are now subscribed to the ${planName}.`);
        setTimeout(() => setShowNotification(null), 5000);
        // If it's the merchant plan, open the marketplace tab so they see their portal
        if (planName === "Feline Merchant Plan") {
          setActiveTab("marketplace");
        } else {
          setActiveTab("profiles");
        }
      }
    });
    setPaymentOpen(true);
  };

  const selectedCat = cats.find(c => c.id === selectedCatId);

  // Tabs layout navigation
  const navigationItems = [
    { id: "home", label: "Overview", icon: BookOpen },
    { id: "profiles", label: "AI Profiles", icon: User },
    { id: "care", label: "Care Routine", icon: Calendar },
    { id: "companion", label: "AI Companion", icon: MessageCircle },
    { id: "health", label: "Health Center", icon: Activity },
    { id: "vets", label: "Vet Finder", icon: MapPin },
    { id: "community", label: "Community", icon: Heart },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-brand-matte text-brand-warm flex flex-col font-sans">
      {/* Top Premium Navbar */}
      <nav className="sticky top-0 z-40 bg-brand-matte/95 border-b border-brand-gold/10 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Luxury Brand Signature */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("home")}>
            {/* Minimalist circuit gold paw icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-gold to-yellow-600 p-[1px] flex items-center justify-center shadow-[0_0_15px_rgba(214,175,55,0.2)]">
              <div className="w-full h-full bg-brand-matte rounded-[11px] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-6.5 h-6.5 fill-current text-brand-gold">
                  <path d="M50,45 C56,45 61,49 61,56 C61,63 56,67 50,67 C44,67 39,63 39,56 C39,49 44,45 50,45 Z" />
                  <circle cx="34" cy="40" r="7" />
                  <circle cx="45" cy="30" r="7.5" />
                  <circle cx="55" cy="30" r="7.5" />
                  <circle cx="66" cy="40" r="7" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-base sm:text-lg tracking-wider text-brand-warm uppercase">
                PurrVerse<span className="text-brand-gold"> AI</span>
              </span>
              <span className="block text-[8px] font-mono tracking-widest text-neutral-500 uppercase">
                Premium Cat Care
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-full text-xs font-medium font-sans tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shadow"
                      : "text-neutral-400 hover:text-brand-warm"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right actions (Plan status + Active cat indicator + Sound Toggle) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Feline Sound Toggle */}
            <button
              onClick={() => {
                const newVal = !soundEnabled;
                setSoundEnabled(newVal);
                if (newVal) setTimeout(() => playCatMeow("chirp"), 100);
              }}
              title={soundEnabled ? "Mute Cat Meows" : "Unmute Cat Meows"}
              className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                soundEnabled
                  ? "bg-brand-gold/10 border-brand-gold/30 text-brand-gold shadow-[0_0_10px_rgba(214,175,55,0.15)] hover:bg-brand-gold/20"
                  : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-brand-warm"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {selectedCat && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-850">
                <img
                  src={selectedCat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80"}
                  alt={selectedCat.name}
                  className="w-5.5 h-5.5 rounded-lg object-cover"
                />
                <span className="text-[10px] font-mono tracking-wide text-brand-warm">
                  {selectedCat.name} Active
                </span>
              </div>
            )}

            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider border transition cursor-pointer ${
                currentPlan === 'Pro Plan' ? "bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-matte border-brand-gold shadow" :
                currentPlan === 'Premium Plan' ? "bg-brand-emerald text-brand-warm border-brand-emerald" :
                currentPlan === 'Feline Merchant Plan' ? "bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]" :
                "bg-neutral-950 text-neutral-400 border-neutral-850 hover:text-brand-warm"
              }`}
            >
              👑 {currentPlan}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => {
                const newVal = !soundEnabled;
                setSoundEnabled(newVal);
                if (newVal) setTimeout(() => playCatMeow("chirp"), 100);
              }}
              className={`p-1.5 rounded-lg border transition ${
                soundEnabled
                  ? "bg-brand-gold/10 border-brand-gold/25 text-brand-gold"
                  : "bg-neutral-950 border-neutral-850 text-neutral-500"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveTab("pricing")}
              className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono text-brand-gold uppercase tracking-widest shrink-0"
            >
              {currentPlan}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-brand-warm transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-brand-matte border-b border-brand-gold/10 z-30 p-4 space-y-2.5 shadow-2xl"
          >
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium font-sans text-left transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/15"
                      : "text-neutral-400 hover:bg-neutral-950"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Smart Notifications Bar */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl glass-panel text-brand-warm border border-brand-gold/30 shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex items-start gap-3"
          >
            <div className="p-1.5 rounded-lg bg-neutral-950 border border-brand-gold/25 text-brand-gold mt-0.5 animate-pulse-slow">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-sans leading-relaxed text-neutral-300">
                {showNotification}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="text-xs text-neutral-500 hover:text-neutral-400 transition ml-2 self-start"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Body Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            {activeTab === "home" && (
              <HeroSection
                onStartTrial={() => handleSelectPlan("Premium Plan")}
                onExploreFeatures={() => setActiveTab("profiles")}
              />
            )}

            {activeTab === "pricing" && (
              <PricingModel currentPlan={currentPlan} onSelectPlan={handleSelectPlan} />
            )}

            {activeTab === "profiles" && (
              <CatProfileManager
                cats={cats}
                selectedCatId={selectedCatId}
                onSelectCat={handleSelectCat}
                onAddCat={handleAddCat}
                onDeleteCat={handleDeleteCat}
                currentPlan={currentPlan}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === "care" && (
              <DailyCareAssistant 
                selectedCat={selectedCat} 
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === "companion" && (
              // AI Cat Companion chat interface loads dynamically
              <CatCompanion 
                selectedCat={selectedCat} 
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === "health" && (
              <HealthCenter 
                selectedCat={selectedCat} 
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === "vets" && (
              <VetFinder 
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === "community" && (
              <CommunitySection />
            )}

            {activeTab === "marketplace" && (
              <MarketplaceSection 
                selectedCat={selectedCat} 
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsDashboard 
                selectedCat={selectedCat} 
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
                onSelectTab={setActiveTab}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Funny Cat Quotes Auto-rotating Ticker */}
      <FunnyCatQuotes />

      {/* Luxury Footer */}
      <footer className="border-t border-brand-gold/10 bg-brand-matte py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-500 font-sans mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 PurrVerse AI. All rights reserved. Crafted for Royal Felines & Intelligent Parents.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("pricing")} className="hover:text-brand-gold transition cursor-pointer">Made in India | Owner: Ayush Chatterjee</button>
            <span>&bull;</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-semibold">INTELLIGENT HEALTH REVOLUTION</span>
          </div>
        </div>
      </footer>

      {paymentItem && (
        <PaymentModal
          isOpen={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          itemName={paymentItem.name}
          itemPrice={paymentItem.price}
          itemType={paymentItem.type}
          onPaymentSuccess={paymentItem.onSuccess}
        />
      )}
    </div>
  );
}
