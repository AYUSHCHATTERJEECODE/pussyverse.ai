import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, Heart, Shield, HelpCircle, Volume2, Mic, Settings, Lock } from "lucide-react";
import { CatProfile, ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CatCompanionProps {
  selectedCat: CatProfile | undefined;
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function CatCompanion({ 
  selectedCat, 
  currentPlan, 
  onSelectPlan, 
  onSelectTab 
}: CatCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [catMood, setCatMood] = useState("Happy");
  const [voiceMode, setVoiceMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceLockedAlert, setShowVoiceLockedAlert] = useState(false);
  
  // Track message count per tier in localStorage
  const [msgCount, setMsgCount] = useState<number>(() => {
    const saved = localStorage.getItem(`companion_msg_count_${currentPlan}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync count with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`companion_msg_count_${currentPlan}`, msgCount.toString());
  }, [msgCount, currentPlan]);

  // Initial welcome message from the cat
  useEffect(() => {
    if (selectedCat) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content: `*yawns and stretches, then walks over to rub against your hand* Meow, hello hooman! I am your virtual ${selectedCat.name}. I am feeling super ${catMood.toLowerCase()} today! Ask me anything, or tell me about your day! *purrs softly*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedCat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Check if messages have run out for the current plan
  const getPlanMessageLimit = () => {
    if (currentPlan === "Free Trial") return 10;
    if (currentPlan === "Premium Plan") return 100;
    if (currentPlan === "Feline Merchant Plan") return 100;
    return Infinity; // Pro is unlimited
  };

  const limit = getPlanMessageLimit();
  const isLimitReached = msgCount >= limit;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCat || sending) return;

    // Check limit first
    if (isLimitReached) {
      return;
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);
    setIsTyping(true);

    // Increment message usage
    setMsgCount(prev => prev + 1);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          catProfile: selectedCat,
          history: messages.slice(-8), // send last 8 messages as context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        const reply = data.reply;
        
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "model",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        
        // Speak if voiceMode is active (only allowed on Pro Plan)
        if (voiceMode && currentPlan === "Pro Plan") {
          speakMessage(reply);
        }

        // Randomly update mood based on keywords
        if (inputText.toLowerCase().includes("treat") || inputText.toLowerCase().includes("food")) {
          setCatMood("Excited");
        } else if (inputText.toLowerCase().includes("bath") || inputText.toLowerCase().includes("vet")) {
          setCatMood("Suspicious");
        } else if (inputText.toLowerCase().includes("sleep") || inputText.toLowerCase().includes("night")) {
          setCatMood("Sleepy");
        } else {
          setCatMood("Happy");
        }
      } else {
        throw new Error();
      }
    } catch (error) {
      setIsTyping(false);
      // Fallback cat responses if backend is not responding or during loading
      setTimeout(() => {
        const catReplies = [
          `*stares at you with big curious eyes* Meow? I heard you, but my feline brain is temporarily distracted by a virtual speck of dust! Tell me again! *swishes tail*`,
          `*purrs softly and nudges your hand with my head* Purrr, I love when you talk to me. Can we get some premium treats from the Marketplace later? *meow*`,
          `*curls up into a warm little ball next to you* I'm feeling a bit sleepy, hooman. Let's take a cozy nap together! *meows quietly*`,
          `*bats playfully at your screen* Rawr! Let's chase some lasers! Tell me more about your day, I am listening! *meow meow*`
        ];
        const randomReply = catReplies[Math.floor(Math.random() * catReplies.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "model",
            content: randomReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        if (voiceMode && currentPlan === "Pro Plan") {
          speakMessage(randomReply);
        }
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      // Clean asterisks actions for smooth reading
      const cleanText = text.replace(/\*.*?\*/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Try to find a high-pitched friendly cat-like voice
      const voices = window.speechSynthesis.getVoices();
      const elegantVoice = voices.find(v => v.lang.includes("en")) || voices[0];
      if (elegantVoice) {
        utterance.voice = elegantVoice;
      }
      // Pitch tuning: Royalty Pro plan gets high quality sweet pitch
      utterance.pitch = currentPlan === "Pro Plan" ? 1.55 : 1.35;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceToggle = () => {
    if (currentPlan !== "Pro Plan") {
      setShowVoiceLockedAlert(true);
      setTimeout(() => setShowVoiceLockedAlert(false), 5000);
      return;
    }
    const nextVal = !voiceMode;
    setVoiceMode(nextVal);
    if (nextVal) {
      speakMessage("Meow! Royalty Pro Voice Text-to-Speech active!");
    }
  };

  if (!selectedCat) {
    return (
      <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500 font-sans text-xs">
        Please register or select a cat companion to open the AI Cat Companion chat room.
      </div>
    );
  }

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-6 sm:p-8 text-brand-warm shadow-xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={selectedCat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80"}
            alt={selectedCat.name}
            className="w-12 h-12 rounded-xl object-cover border border-brand-gold/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-display font-semibold text-brand-warm">
                {selectedCat.name}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono ${
                catMood === 'Happy' ? "bg-brand-emerald/15 text-brand-emerald" :
                catMood === 'Excited' ? "bg-orange-950/50 text-orange-400" :
                catMood === 'Sleepy' ? "bg-blue-950/50 text-blue-400" :
                "bg-yellow-950/50 text-brand-gold"
              }`}>
                {catMood} Mood
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              AI Virtual Companion of your {selectedCat.breed}.
            </p>
          </div>
        </div>

        {/* Action Controls / Limit Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            Messages: {msgCount} / {limit === Infinity ? "Unlimited" : limit}
          </span>

          <button
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
              voiceMode
                ? "bg-brand-gold/15 text-brand-gold border-brand-gold/40 shadow-[0_0_15px_rgba(214,175,55,0.15)]"
                : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:border-neutral-800"
            }`}
            title="Toggle Voice Text-to-Speech (Royalty Pro Feature)"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Voice AI</span>
            {currentPlan !== "Pro Plan" && <Lock className="w-3 h-3 text-brand-gold/60" />}
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-850 text-[10px] uppercase font-mono text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-brand-gold" /> Memory: {currentPlan === "Pro Plan" ? "Long Term" : "Standard"}
          </div>
        </div>
      </div>

      {/* Voice Mode Locked Banner */}
      <AnimatePresence>
        {showVoiceLockedAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold flex items-center justify-between text-xs font-sans"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
              <span>
                <strong>Voice AI Cat Companion (Text-to-Speech)</strong> is exclusively reserved for <strong>Royalty Pro Plan</strong> subscribers. Speak back and listen to realistic feline vocal streams!
              </span>
            </div>
            <button 
              onClick={() => onSelectTab("pricing")}
              className="ml-4 px-3 py-1.5 bg-brand-gold text-brand-matte rounded-lg font-display font-semibold text-[10px] tracking-wider uppercase hover:bg-yellow-500"
            >
              Upgrade
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chat window */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-neutral-950/30 border border-neutral-900 rounded-2xl h-[450px] relative overflow-hidden">
          
          {/* Lock Overlay when Messages are exhausted */}
          {isLimitReached && (
            <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center border border-brand-gold/30 text-brand-gold mb-4 animate-bounce-slow">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-brand-warm mb-2">
                Daily AI Messages Limit Reached!
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed font-sans">
                You have used all <strong>{limit}</strong> virtual chats available on your <strong>{currentPlan}</strong> subscription today. Experience unlimited interactions, memory retention, and rich voice playback!
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectTab("pricing")}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-yellow-500 hover:to-brand-gold text-brand-matte rounded-full font-display font-semibold text-xs tracking-wider uppercase shadow-lg hover:scale-105 transition"
                >
                  View Premium pricing
                </button>
                <button
                  onClick={() => {
                    // Cheat-code/reset mode just in case they want to sandbox-reset
                    setMsgCount(0);
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 border border-neutral-800 rounded-full font-mono text-[10px]"
                >
                  Reset Limit (Sandbox Dev Mode)
                </button>
              </div>
            </div>
          )}

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isCat = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isCat ? "justify-start" : "justify-end"}`}
                >
                  {isCat && (
                    <img
                      src={selectedCat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80"}
                      alt={selectedCat.name}
                      className="w-7 h-7 rounded-lg object-cover border border-neutral-850"
                    />
                  )}
                  
                  <div className="max-w-[80%] flex flex-col">
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-sans leading-relaxed shadow-md ${
                        isCat
                          ? "bg-neutral-900 text-brand-warm rounded-bl-none border border-neutral-850"
                          : "bg-brand-gold text-brand-matte font-medium rounded-br-none"
                      }`}
                    >
                      {/* Highlight cat actions (in asterisks) with different styling */}
                      {isCat ? (
                        <p>
                          {msg.content.split("*").map((part, index) => {
                            if (index % 2 === 1) {
                              return <span key={index} className="text-brand-gold italic font-medium">*{part}*</span>;
                            }
                            return part;
                          })}
                        </p>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    
                    <span className={`text-[9px] text-neutral-500 font-mono mt-1 ${isCat ? "text-left" : "text-right"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-end gap-2.5">
                <img
                  src={selectedCat.avatarUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80"}
                  alt={selectedCat.name}
                  className="w-7 h-7 rounded-lg object-cover border border-neutral-850 animate-pulse"
                />
                <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-2xl rounded-bl-none flex gap-1 items-center py-2.5 px-4 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-900 flex gap-2">
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Chat with ${selectedCat.name}...`}
              className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-3 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
              disabled={sending || isLimitReached}
            />

            <button
              type="submit"
              disabled={sending || !inputText.trim() || isLimitReached}
              className="p-3 bg-brand-gold hover:bg-yellow-500 text-brand-matte rounded-xl transition cursor-pointer shadow-lg disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Personality controls & Speech output info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Speech indicator */}
          <div className="p-6 rounded-2xl bg-neutral-950/40 border border-neutral-900 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Persona Config
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-mono">Simulated Tone</p>
                <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px] font-sans font-medium text-neutral-400">
                  <span className="px-2 py-1.5 rounded bg-neutral-900 border border-brand-gold/25 text-brand-gold text-center">Affectionate</span>
                  <span className="px-2 py-1.5 rounded bg-neutral-950 text-center">Sassy/Witty</span>
                  <span className="px-2 py-1.5 rounded bg-neutral-950 text-center">Curious Explorer</span>
                  <span className="px-2 py-1.5 rounded bg-neutral-950 text-center">Royal Highness</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-mono">Cat Memory System</p>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mt-1">
                  Our custom story engine saves details like favorite sleeping spots, treats, and schedules. {currentPlan === "Pro Plan" ? "💾 Active session context is securely saved in your unlimited Cloud Profile container." : "⚠️ Local-only memory buffer active."}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Chat suggestions */}
          <div className="p-6 rounded-2xl bg-neutral-950/40 border border-neutral-900 space-y-3">
            <p className="text-xs font-semibold text-brand-warm">Ask me things like:</p>
            <div className="space-y-2 text-xs font-sans text-neutral-400">
              <button
                onClick={() => setInputText(`How are you feeling today ${selectedCat.name}?`)}
                className="w-full text-left p-2 rounded bg-neutral-950 hover:border-brand-gold/30 border border-transparent transition cursor-pointer truncate"
              >
                "How are you feeling today?"
              </button>
              <button
                onClick={() => setInputText(`${selectedCat.name}, can I get you some Salmon treats?`)}
                className="w-full text-left p-2 rounded bg-neutral-950 hover:border-brand-gold/30 border border-transparent transition cursor-pointer truncate"
              >
                "Can I get you some Salmon treats?"
              </button>
              <button
                onClick={() => setInputText(`${selectedCat.name}, help me organize my afternoon workout schedule!`)}
                className="w-full text-left p-2 rounded bg-neutral-950 hover:border-brand-gold/30 border border-transparent transition cursor-pointer truncate"
              >
                "Help me organize my schedule!"
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
