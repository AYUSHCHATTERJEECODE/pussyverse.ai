import { Check, Flame, Trophy, Sparkles, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

interface PricingModelProps {
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
}

export default function PricingModel({ currentPlan, onSelectPlan }: PricingModelProps) {
  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "3-day trial",
      description: "Experience the magic of PurrVerse AI with zero risk.",
      features: [
        "Create up to 2 cat profiles",
        "AI Daily Care planner preview",
        "Access to global forums",
        "Limited virtual Cat Chat (10 msgs)",
        "Nearby Veterinarian Lookup",
      ],
      icon: Flame,
      color: "border-neutral-800 text-neutral-400 bg-neutral-900/40",
      btnText: "Try Free for 3 Days",
      badge: "No Credit Card Needed",
    },
    {
      name: "Premium Plan",
      price: "$29",
      period: "per month",
      description: "Unlock full health, care routines, and personalized AI companion benefits.",
      features: [
        "Unlimited cat profiles",
        "Simple Cat AI Animation (Face-to-Face)",
        "Interactive AI Daily Routine Planner",
        "AI Symptom Checker & Vaccine Alerting",
        "Full AI Cat Companion Chat (100 msgs/day)",
        "Advanced Health Trends Dashboard",
        "Premium Marketplace Recommendations",
        "Emergency Veterinary Hospital Navigator",
      ],
      icon: Sparkles,
      color: "border-brand-gold/40 text-brand-gold bg-neutral-900/60 shadow-[0_0_30px_rgba(214,175,55,0.08)]",
      btnText: "Join Premium Circle",
      badge: "Most Popular Choice",
    },
    {
      name: "Pro Plan",
      price: "$99",
      period: "per month",
      description: "The ultimate luxury pet care experience with voice AI and dedicated vet care.",
      features: [
        "Everything in Premium plan",
        "Realistic Cat AI Animation (HD Face-to-Face)",
        "Unlimited AI Cat Chats & Memory system",
        "Voice AI Cat Companion (Text-to-Speech)",
        "Advanced veterinary consulting & priority queue",
        "Family accounts (up to 5 members)",
        "Exclusive premium marketplace 20% discount",
        "Custom story modes & greetings",
        "Early access to new experimental pet metrics",
      ],
      icon: Trophy,
      color: "border-brand-gold bg-gradient-to-b from-neutral-950 to-neutral-900 shadow-[0_0_40px_rgba(214,175,55,0.15)]",
      btnText: "Upgrade to Royalty Pro",
      badge: "Absolute Elite Tier",
    },
    {
      name: "Feline Merchant Plan",
      price: "$149",
      period: "per month",
      description: "Exclusively for brands, boutiques, and merchants who want to list clothing, custom merchandise, or goods.",
      features: [
        "Exclusively for Sellers & Collaborations",
        "List unlimited clothing & cat merchandise",
        "Attach custom affiliate links to your products",
        "Track seller dashboard clicks & views",
        "Automatic commission split (10% rate)",
        "Direct-to-email query solutions and pitches",
        "Featured brand placement across the platform",
        "Custom storefront branding controls",
      ],
      icon: ShoppingBag,
      color: "border-amber-500 bg-gradient-to-b from-amber-950/20 to-neutral-950 shadow-[0_0_35px_rgba(245,158,11,0.12)]",
      btnText: "Purchase Seller Plan",
      badge: "Exclusively for Sellers",
    },
  ];

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto text-brand-warm" id="pricing-plans">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight mb-4">
          Select Your{" "}
          <span className="bg-gradient-to-r from-brand-gold to-yellow-100 bg-clip-text text-transparent">
            Care Tier
          </span>
        </h2>
        <p className="text-neutral-400 font-sans max-w-xl mx-auto font-light text-sm sm:text-base">
          Choose a tier that matches your dedication to your cat's health, lifestyle, and virtual emotional companionship.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          const isPro = plan.name === "Pro Plan";
          const isPremium = plan.name === "Premium Plan";
          const isMerchant = plan.name === "Feline Merchant Plan";
          const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col justify-between p-6 rounded-3xl border ${plan.color} backdrop-blur-md transition-all duration-300 hover:scale-[1.02]`}
            >
              {plan.badge && (
                <span className={`absolute -top-3.5 left-6 px-3.5 py-1 rounded-full text-[9px] uppercase font-mono tracking-widest font-semibold border ${
                  isPro 
                    ? "bg-brand-gold text-brand-matte border-brand-gold" 
                    : isPremium 
                    ? "bg-brand-emerald text-brand-warm border-brand-emerald"
                    : isMerchant
                    ? "bg-amber-500 text-neutral-950 border-amber-500" 
                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                }`}>
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-display font-semibold text-brand-warm">
                    {plan.name}
                  </span>
                  <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                    <IconComponent className={`w-5 h-5 ${isPro || isPremium || isMerchant ? "text-brand-gold" : "text-neutral-400"}`} />
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl font-display font-bold text-brand-warm">
                    {plan.price}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono tracking-wide">
                    / {plan.period}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-6 font-light">
                  {plan.description}
                </p>

                <hr className="border-neutral-800/60 my-6" />

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-neutral-300 font-sans">
                      <div className="p-0.5 rounded-full bg-brand-gold/10 text-brand-gold shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className={`w-full py-3 rounded-full font-display font-semibold text-[11px] tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? "bg-brand-emerald text-brand-warm border border-brand-emerald cursor-default shadow-[0_0_15px_rgba(30,142,90,0.3)]"
                    : isPro
                    ? "bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-yellow-500 hover:to-brand-gold text-brand-matte font-bold shadow-[0_4px_15px_rgba(214,175,55,0.25)]"
                    : isMerchant
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-neutral-950 font-bold shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
                    : isPremium
                    ? "bg-brand-matte border border-brand-gold/60 hover:border-brand-gold text-brand-gold hover:bg-neutral-900"
                    : "bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-neutral-300"
                }`}
                disabled={isCurrent}
              >
                {isCurrent ? "Active Plan" : plan.btnText}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
