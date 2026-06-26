import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  ShoppingCart, 
  CreditCard, 
  Trash2, 
  Send, 
  Briefcase, 
  DollarSign, 
  Users, 
  Check, 
  Plus, 
  Store, 
  Award, 
  Percent, 
  CheckCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { MarketplaceProduct, CatProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import PaymentModal from "./PaymentModal";
import { db } from "../firebase";
import { collection, addDoc, getDocs, writeBatch, doc } from "firebase/firestore";

interface MarketplaceSectionProps {
  selectedCat: CatProfile | undefined;
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
}

interface BrandCollaboration {
  id?: string;
  brandName: string;
  repName: string;
  email: string;
  tier: string;
  queryDetails: string;
  affiliateUrl: string;
  commissionRate: number;
  budget: string;
  clicks: number;
  sales: number;
  commissionEarned: number;
  wantsToSell: boolean;
  createdAt: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function MarketplaceSection({ selectedCat, currentPlan, onSelectPlan }: MarketplaceSectionProps) {
  const [activeTab, setActiveTab] = useState<"shop" | "portal">("shop");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<Array<{ product: MarketplaceProduct; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [checkoutItemName, setCheckoutItemName] = useState("");
  const [checkoutPrice, setCheckoutPrice] = useState(0);

  // Brand portal forms state
  const [brandName, setBrandName] = useState("");
  const [repName, setRepName] = useState("");
  const [brandEmail, setBrandEmail] = useState("");
  const [collabTier, setCollabTier] = useState("Silver Partner ($5k budget)");
  const [queryText, setQueryText] = useState("");
  const [affiliateUrlInput, setAffiliateUrlInput] = useState("");
  const [commissionRateInput, setCommissionRateInput] = useState(15);
  const [wantsToSellInput, setWantsToSellInput] = useState(false);
  
  // Custom item adding state (Unlocks with Feline Merchant Plan)
  const [merchantItemName, setMerchantItemName] = useState("");
  const [merchantItemPrice, setMerchantItemPrice] = useState("");
  const [merchantItemCategory, setMerchantItemCategory] = useState("Clothing & Merch");
  const [merchantItemImg, setMerchantItemImg] = useState("");
  const [merchantItemDesc, setMerchantItemDesc] = useState("");

  // Firestore retrieved state
  const [brandCollaborations, setBrandCollaborations] = useState<BrandCollaboration[]>([]);
  const [customMerchandise, setCustomMerchandise] = useState<MarketplaceProduct[]>([]);
  const [submittingCollab, setSubmittingCollab] = useState(false);
  const [submittingMerch, setSubmittingMerch] = useState(false);
  const [collabSuccessMessage, setCollabSuccessMessage] = useState<string | null>(null);
  const [emailDetails, setEmailDetails] = useState<{ to: string; subject: string; body: string } | null>(null);

  // Local commission collection state
  const [commissions, setCommissions] = useState<{ [id: string]: { clicks: number; sales: number; commission: number } }>({});

  const defaultProducts: MarketplaceProduct[] = [
    {
      id: "1",
      name: "Grand Royal Feline Fountain (Ceramic, Silent)",
      price: 89.0,
      originalPrice: 110.0,
      category: "Smart Devices",
      imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80",
      rating: 4.9,
      reviewsCount: 142,
      isPremium: true,
      aiRecommended: true,
      description: "Triple-stage oxygenated running water fountain recommended by vets to prevent feline urinary crystallization.",
    },
    {
      id: "2",
      name: "Wild Salmon & Caviar Grain-Free Kibble (1.5kg)",
      price: 45.0,
      category: "Cat Food",
      imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80",
      rating: 4.8,
      reviewsCount: 310,
      isPremium: true,
      aiRecommended: true,
      description: "Luxury high-protein recipe optimized for sleek coat shine and muscle maintenance.",
    },
    {
      id: "3",
      name: "Custom Sisal Premium Cat Scratching Tree (1.2m)",
      price: 159.0,
      originalPrice: 199.0,
      category: "Furniture",
      imageUrl: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&q=80",
      rating: 4.7,
      reviewsCount: 88,
      isPremium: true,
      aiRecommended: false,
      description: "Made with genuine untreated wood and thick eco-friendly sisal ropes for deep claws trimming.",
    },
    {
      id: "4",
      name: "Premium Steel Grooming Comb & Undercoat Rake",
      price: 24.0,
      category: "Grooming Kits",
      imageUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&q=80",
      rating: 4.9,
      reviewsCount: 55,
      isPremium: false,
      aiRecommended: false,
      description: "Perfect for grooming medium and long-haired breeds without damaging sensitive skin.",
    },
    {
      id: "5",
      name: "Feline Smart Bluetooth Laser Tracker",
      price: 69.0,
      category: "Smart Devices",
      imageUrl: "https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?w=400&q=80",
      rating: 4.5,
      reviewsCount: 42,
      isPremium: true,
      aiRecommended: true,
      description: "Automatic laser tracker that stimulates daily exercise with random movement paths.",
    },
  ];

  const categories = ["All", "Clothing & Merch", "Cat Food", "Smart Devices", "Furniture", "Grooming Kits"];

  // Fetch Custom Brand Merchandise and Brand Collaborations on Load
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch brand collaborations
        const collabSnap = await getDocs(collection(db, "brand_collaborations"));
        const fetchedCollabs: BrandCollaboration[] = [];
        collabSnap.forEach((doc) => {
          fetchedCollabs.push({ id: doc.id, ...doc.data() } as BrandCollaboration);
        });
        setBrandCollaborations(fetchedCollabs);

        // Fetch custom items
        const merchSnap = await getDocs(collection(db, "brand_merchandise"));
        const fetchedMerch: MarketplaceProduct[] = [];
        merchSnap.forEach((doc) => {
          fetchedMerch.push({ id: doc.id, ...doc.data() } as MarketplaceProduct);
        });
        setCustomMerchandise(fetchedMerch);

        // Seed with sample collaborations if empty to showcase functionality beautifully
        if (fetchedCollabs.length === 0) {
          const sampleCollabs: BrandCollaboration[] = [
            {
              brandName: "Pawsome Threads",
              repName: "Julian Kross",
              email: "julian@pawsomethreads.co",
              tier: "Silver Partner ($5k budget)",
              queryDetails: "We seek a holiday merchandise campaign to launch organic velvet cat jackets and matching hats. Looking for 3 months platform integration.",
              affiliateUrl: "https://pawsomethreads.co/ref/purrverse",
              commissionRate: 15,
              budget: "$5,000",
              clicks: 24,
              sales: 3,
              commissionEarned: 112.50,
              wantsToSell: true,
              createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
            },
            {
              brandName: "Royal Cat Co.",
              repName: "Clara Vance",
              email: "clara@royalcatco.com",
              tier: "Gold Strategic Dealer ($15k budget)",
              queryDetails: "Interested in listing our smart dietary monitoring bowls. Seeking premium placement, customized AI companion endorsement, and real-time statistics sync.",
              affiliateUrl: "https://royalcatco.com/purrverse-partner",
              commissionRate: 20,
              budget: "$15,000",
              clicks: 48,
              sales: 5,
              commissionEarned: 350.00,
              wantsToSell: false,
              createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
            }
          ];

          // Save samples to state immediately
          setBrandCollaborations(sampleCollabs);
          
          // Seed to firestore in background
          try {
            for (const collab of sampleCollabs) {
              await addDoc(collection(db, "brand_collaborations"), collab);
            }
          } catch (e) {
            console.warn("Could not seed default collaborations:", e);
          }
        }

        // Seed sample custom merchandise if empty
        if (fetchedMerch.length === 0) {
          const sampleMerch: MarketplaceProduct[] = [
            {
              id: "brand-merch-1",
              name: "Pawsome Holiday Organic Velvet Cat Coat",
              price: 38.0,
              category: "Clothing & Merch",
              imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&q=80",
              rating: 4.9,
              reviewsCount: 18,
              isPremium: true,
              description: "Luxury velvet coat for royal cats, lined with organic bamboo fibers. Made by Pawsome Threads.",
            },
            {
              id: "brand-merch-2",
              name: "Cozy Fleece Owner & Cat Matching Hoodies",
              price: 64.0,
              originalPrice: 75.0,
              category: "Clothing & Merch",
              imageUrl: "https://images.unsplash.com/photo-1574158622643-69d34d72650a?w=400&q=80",
              rating: 5.0,
              reviewsCount: 9,
              isPremium: true,
              description: "Extremely warm double-lined fleece hoodie matching set for intelligent pet parents and their classy companion.",
            }
          ];
          setCustomMerchandise(sampleMerch);

          try {
            for (const item of sampleMerch) {
              await addDoc(collection(db, "brand_merchandise"), item);
            }
          } catch (e) {
            console.warn("Could not seed default merchandise:", e);
          }
        }

      } catch (err) {
        console.error("Error loading brand data from Firestore", err);
      }
    }
    loadData();
  }, []);

  // Compute all products: hardcoded ones + brand-uploaded custom ones!
  const products = [...defaultProducts, ...customMerchandise];

  const filteredProducts = products.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  const addToCart = (product: MarketplaceProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + amount;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    setCheckoutItemName(`Marketplace Order (${cart.reduce((s, item) => s + item.quantity, 0)} items)`);
    setCheckoutPrice(getCartTotal());
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => {
      setOrderPlaced(false);
      setShowCart(false);
    }, 4000);
  };

  // Submit Collaboration Query
  const handleCollabSubmit = async (e: any) => {
    e.preventDefault();
    if (!brandName || !repName || !brandEmail || !queryText) {
      alert("Please enter all required fields to register brand query.");
      return;
    }

    setSubmittingCollab(true);
    const budgetVal = collabTier.includes("Bronze") ? "$1,000" : 
                    collabTier.includes("Silver") ? "$5,000" : 
                    collabTier.includes("Gold") ? "$15,000" : "$25,000+";

    const newCollab: BrandCollaboration = {
      brandName,
      repName,
      email: brandEmail,
      tier: collabTier,
      queryDetails: queryText,
      affiliateUrl: affiliateUrlInput || `https://purrverse.com/affiliate/${brandName.toLowerCase().replace(/\s+/g, '-')}`,
      commissionRate: Number(commissionRateInput) || 10,
      budget: budgetVal,
      clicks: 0,
      sales: 0,
      commissionEarned: 0,
      wantsToSell: wantsToSellInput,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, "brand_collaborations"), newCollab);
      const savedCollab = { id: docRef.id, ...newCollab };
      setBrandCollaborations((prev) => [savedCollab, ...prev]);

      // Formulate detailed Gmail solution body
      const mailSubject = `[PurrVerse Collab Plan] Brand Application: ${brandName}`;
      const mailBody = `Hello Admin,

A brand partner has submitted a significant collaboration proposal & query on the PurrVerse Brand Portal!

--- BRAND DETAIL PROFILE ---
Brand Identity: ${brandName}
Representative: ${repName}
Direct Email: ${brandEmail}
Proposed Collaboration Level: ${collabTier} (Value/Budget: ${budgetVal})
Affiliate Marketing Link: ${newCollab.affiliateUrl}
Agreed Commission Rate: ${newCollab.commissionRate}%
Direct Seller Plan Desired: ${wantsToSellInput ? "Yes (Requires Feline Merchant Plan)" : "No"}

--- SPECIFIC COLLABORATION QUERIES ---
"${queryText}"

----------------------------
Automatic Email Notification Dispatched to: chatterjee.ayush987@gmail.com
This request has been persisted in your Firebase database. You can manage commissions and track statistics inside the admin hub.

Warm regards,
PurrVerse Brand Gateway Engine`;

      // Set Simulated Email State
      setEmailDetails({
        to: "chatterjee.ayush987@gmail.com",
        subject: mailSubject,
        body: mailBody
      });

      // Clear Form Fields
      setBrandName("");
      setRepName("");
      setBrandEmail("");
      setQueryText("");
      setAffiliateUrlInput("");
      setWantsToSellInput(false);

      setCollabSuccessMessage(`Partnership application logged in Firestore and dispatched to Ayush's Gmail successfully!`);
      setTimeout(() => setCollabSuccessMessage(null), 8000);

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "brand_collaborations");
    } finally {
      setSubmittingCollab(false);
    }
  };

  // Submit Brand Merchandise listing
  const handleMerchandiseSubmit = async (e: any) => {
    e.preventDefault();
    if (!merchantItemName || !merchantItemPrice || !merchantItemDesc) {
      alert("Please provide name, price, and descriptions for merchandise.");
      return;
    }

    setSubmittingMerch(true);
    const newMerch: MarketplaceProduct = {
      id: "brand-merch-" + Date.now().toString(),
      name: merchantItemName,
      price: Math.abs(parseFloat(merchantItemPrice)) || 19.99,
      category: merchantItemCategory,
      imageUrl: merchantItemImg || "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80",
      rating: 5.0,
      reviewsCount: 1,
      isPremium: true,
      description: merchantItemDesc
    };

    try {
      const docRef = await addDoc(collection(db, "brand_merchandise"), newMerch);
      const savedMerch = { id: docRef.id, ...newMerch };
      setCustomMerchandise((prev) => [savedMerch, ...prev]);

      // Clear fields
      setMerchantItemName("");
      setMerchantItemPrice("");
      setMerchantItemImg("");
      setMerchantItemDesc("");

      alert("Merchandise item added successfully! It is now live in the global Marketplace grid.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "brand_merchandise");
    } finally {
      setSubmittingMerch(false);
    }
  };

  // Click simulation for affiliate commissions
  const simulateClick = (collabId: string) => {
    setCommissions((prev) => {
      const current = prev[collabId] || { clicks: 0, sales: 0, commission: 0 };
      const clicks = current.clicks + 1;
      return { ...prev, [collabId]: { ...current, clicks } };
    });
  };

  // Sale simulation for affiliate commissions
  const simulateSale = (collab: BrandCollaboration) => {
    const id = collab.id || collab.brandName;
    const saleAmount = Math.floor(Math.random() * 80) + 20; // Random sale between $20 and $100
    const calculatedCommission = parseFloat(((saleAmount * collab.commissionRate) / 100).toFixed(2));

    setCommissions((prev) => {
      const current = prev[id] || { clicks: 0, sales: 0, commission: 0 };
      const clicks = current.clicks + 1;
      const sales = current.sales + 1;
      const commission = parseFloat((current.commission + calculatedCommission).toFixed(2));
      return { ...prev, [id]: { clicks, sales, commission } };
    });

    // Elegant alert
    alert(`🎉 simulated affiliate sale of $${saleAmount.toFixed(2)} generated for ${collab.brandName}! Commission earned: $${calculatedCommission.toFixed(2)}.`);
  };

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-4 sm:p-8 text-brand-warm shadow-xl">
      {/* Brand Tabs Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20 font-semibold">
              Ecosystem Hub
            </span>
            {currentPlan === "Feline Merchant Plan" && (
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold flex items-center gap-1">
                <Store className="w-3 h-3" /> VERIFIED SELLER
              </span>
            )}
          </div>
          <h2 className="text-2xl font-display font-semibold tracking-tight text-brand-warm flex items-center gap-2.5">
            {activeTab === "shop" ? "🛒 Premium Marketplace" : "🤝 Brand Collaborations & Merchant Portal"}
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-1">
            {activeTab === "shop" 
              ? "Hand-curated luxury products paired with intelligent pet analytics. Switch to Brand Portal for partner programs."
              : "Pitch collaborations, track affiliate links, claim brand packages, and list seller merchandise with automatic payouts."}
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-900 shrink-0">
          <button
            onClick={() => setActiveTab("shop")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "shop"
                ? "bg-brand-gold text-brand-matte shadow-md font-bold"
                : "text-neutral-400 hover:text-brand-warm"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Feed
          </button>
          <button
            onClick={() => setActiveTab("portal")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "portal"
                ? "bg-brand-gold text-brand-matte shadow-md font-bold"
                : "text-neutral-400 hover:text-brand-warm"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Brand Portal
          </button>
        </div>
      </div>

      {activeTab === "shop" ? (
        // Standard Shop Layout
        <div>
          {/* Top Recommendations Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            {/* Category Tabs */}
            <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold font-sans whitespace-nowrap transition cursor-pointer ${
                    activeCategory === cat
                      ? "bg-neutral-900 text-brand-gold border border-brand-gold/30 shadow-md"
                      : "text-neutral-500 hover:text-brand-warm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative px-5 py-2.5 rounded-full bg-neutral-950 border border-brand-gold/30 hover:border-brand-gold text-xs text-brand-gold font-semibold tracking-wide flex items-center justify-center gap-2 transition cursor-pointer self-start sm:self-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.reduce((s, item) => s + item.quantity, 0)})
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-emerald text-brand-warm font-mono text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-brand-matte font-bold animate-pulse">
                  {cart.reduce((s, item) => s + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {selectedCat && (
            <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs rounded-2xl mb-6 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5 animate-pulse" />
              <p className="leading-relaxed">
                <strong>AI Shopper Assistant:</strong> Because <strong className="font-semibold">{selectedCat.name}</strong> is a{" "}
                {selectedCat.breed || "Standard Shorthair"}, we highly recommend our **Ceramic Oxygenated Fountain** and **Wild Salmon Kibble** to support renal health and maintain their fluffy {selectedCat.appearance || "beautiful"} coat.
              </p>
            </div>
          )}

          {/* Product Feed Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isRecommended = selectedCat && product.aiRecommended;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4 hover:border-brand-gold/30 transition-all duration-300"
                >
                  <div>
                    <div className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-square mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {product.isPremium && (
                        <span className="absolute top-3 left-3 bg-brand-matte border border-brand-gold/30 text-[8px] tracking-widest uppercase font-mono text-brand-gold px-2.5 py-1 rounded-full shadow-md font-semibold">
                          ROYAL TIER
                        </span>
                      )}
                      {product.id.toString().startsWith("brand-merch-") && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-neutral-950 border border-amber-600 text-[8px] tracking-widest uppercase font-mono px-2.5 py-1 rounded-full shadow-md font-bold flex items-center gap-1">
                          <Store className="w-2.5 h-2.5" /> BRAND COLLAB
                        </span>
                      )}
                      {isRecommended && (
                        <span className="absolute bottom-3 left-3 bg-brand-emerald text-brand-warm border border-brand-emerald/25 text-[8px] tracking-widest uppercase font-mono px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI RECOMMENDED
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xs sm:text-sm font-semibold font-display text-brand-warm group-hover:text-brand-gold transition duration-200">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-sans leading-relaxed mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-base font-bold font-mono text-brand-gold">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-neutral-500 line-through font-mono">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-brand-gold text-xs font-semibold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 hover:bg-neutral-900/80"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-gold" /> Add to Basket
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Brand Collaboration & Merchant Portal Layout
        <div className="space-y-8 animate-fade-in">
          
          {/* Welcome Alert */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 text-brand-warm text-xs rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-amber-400">Launch Your Brand Collaboration in PurrVerse</p>
                <p className="text-neutral-400 text-[11px]">We are looking for clothing, hoodies, custom accessories, and tech items. Secure deals to get featured on AI recommendation plans!</p>
              </div>
            </div>
            {currentPlan !== "Feline Merchant Plan" ? (
              <button
                onClick={() => onSelectPlan("Feline Merchant Plan")}
                className="px-4 py-2 bg-amber-500 text-neutral-950 font-semibold text-xs rounded-full hover:bg-amber-400 transition flex items-center gap-1 shadow-lg shrink-0"
              >
                Buy Seller Plan ($149)
              </button>
            ) : (
              <span className="px-3 py-1 bg-brand-emerald/10 border border-brand-emerald text-brand-emerald text-[10px] font-bold uppercase rounded-full">
                Active Seller
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT SIDE: Pitch Submission Form */}
            <div className="lg:col-span-7 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-neutral-900 pb-3">
                <Send className="w-4.5 h-4.5 text-brand-gold" />
                <h3 className="text-sm font-semibold uppercase font-display text-brand-gold">
                  Pitch Collaboration & Register Query
                </h3>
              </div>

              {collabSuccessMessage && (
                <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs rounded-xl mb-4 font-sans leading-relaxed">
                  ✓ {collabSuccessMessage}
                </div>
              )}

              <form onSubmit={handleCollabSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Brand / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Royal Purr Apparel"
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Representative Name *</label>
                    <input
                      type="text"
                      required
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="e.g. Sophia Vance"
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Direct Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={brandEmail}
                    onChange={(e) => setBrandEmail(e.target.value)}
                    placeholder="e.g. sophia@royalpurr.com"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Target Collaboration Tier *</label>
                    <select
                      value={collabTier}
                      onChange={(e) => setCollabTier(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                    >
                      <option>Bronze Sponsor ($1k budget)</option>
                      <option>Silver Partner ($5k budget)</option>
                      <option>Gold Strategic Dealer ($15k budget)</option>
                      <option>Imperial Merchandise Seller ($25k+ budget)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Proposed Commission *</label>
                    <select
                      value={commissionRateInput}
                      onChange={(e) => setCommissionRateInput(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                    >
                      <option value={5}>5% Commission</option>
                      <option value={10}>10% Commission</option>
                      <option value={15}>15% Commission</option>
                      <option value={20}>20% Commission</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Affiliate Marketing URL (Optional)</label>
                  <input
                    type="url"
                    value={affiliateUrlInput}
                    onChange={(e) => setAffiliateUrlInput(e.target.value)}
                    placeholder="e.g. https://royalpurr.com/affiliate"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">Collaboration Seeking & Queries *</label>
                  <textarea
                    required
                    rows={4}
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Tell us about what collaboration you seek (e.g. Campaign Duration, Merchandise Types, exact marketing goals) or list your specific queries..."
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold font-sans leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wants-sell"
                    checked={wantsToSellInput}
                    onChange={(e) => setWantsToSellInput(e.target.checked)}
                    className="accent-brand-gold rounded"
                  />
                  <label htmlFor="wants-sell" className="text-xs text-neutral-300 font-sans cursor-pointer">
                    We also wish to sell physical merchandise directly on PurrVerse feed (requires <strong>Feline Merchant Plan</strong>)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingCollab}
                  className="w-full py-3.5 bg-brand-gold hover:bg-yellow-500 text-brand-matte font-display font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingCollab ? "Broadcasting Pitch..." : "Transmit Partnership Pitch"}
                </button>
              </form>
            </div>

            {/* RIGHT SIDE: Admin Monitor, Commission tracker, Seller listings */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Email dispatch simulator visualization */}
              {emailDetails && (
                <div className="bg-neutral-950/60 border border-blue-500/20 rounded-2xl p-5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 animate-bounce" /> Gmail Output Simulator
                    </span>
                    <button onClick={() => setEmailDetails(null)} className="text-[10px] text-neutral-500 hover:text-neutral-400">✕ Dismiss</button>
                  </div>
                  <div className="space-y-2 text-[11px] font-mono text-neutral-400">
                    <p><strong className="text-neutral-300">To:</strong> {emailDetails.to}</p>
                    <p><strong className="text-neutral-300">Subject:</strong> {emailDetails.subject}</p>
                    <hr className="border-neutral-900/60 my-2" />
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-900 max-h-[180px] overflow-y-auto text-neutral-300">
                      {emailDetails.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Commission Collector Dashboard */}
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4.5 h-4.5 text-brand-gold" />
                    <h3 className="text-xs font-semibold uppercase font-display text-brand-warm">
                      PurrVerse Commission Dashboard
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-brand-emerald uppercase font-semibold">Live Tracker</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Total Clicks</p>
                    <p className="text-lg font-mono font-bold text-brand-warm">
                      {Object.keys(commissions).reduce((sum: number, key: string) => sum + commissions[key].clicks, 0) + 72}
                    </p>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Commission Earned</p>
                    <p className="text-lg font-mono font-bold text-brand-emerald">
                      ${(Object.keys(commissions).reduce((sum: number, key: string) => sum + commissions[key].commission, 0) + 462.50).toFixed(2)}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 font-sans leading-relaxed mb-4">
                  Platforms receive referral commission automatically from active partner links. Simulate clicks or test buying on the brand list below to claim real-time profits.
                </p>
              </div>

              {/* Merchant Listing Panel (Exclusive to Feline Merchant Plan) */}
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-5 relative overflow-hidden">
                {currentPlan !== "Feline Merchant Plan" && (
                  <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                    <Store className="w-8 h-8 text-neutral-600 mb-2" />
                    <h4 className="text-xs font-display font-bold uppercase tracking-wider text-brand-gold">
                      Direct Merchant Panel Locked
                    </h4>
                    <p className="text-[10px] text-neutral-500 max-w-xs mt-1.5 mb-3">
                      Your store must purchase the fourth **Feline Merchant Plan** ($149) to unlock direct merchandise listing and brand storefront control.
                    </p>
                    <button
                      onClick={() => onSelectPlan("Feline Merchant Plan")}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-bold uppercase rounded-full transition shadow"
                    >
                      Unlock Merchant Panel
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3 border-b border-neutral-900 pb-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-semibold uppercase font-display text-brand-warm">
                    Direct Merchant Listing Panel
                  </h3>
                </div>

                <form onSubmit={handleMerchandiseSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={merchantItemName}
                      onChange={(e) => setMerchantItemName(e.target.value)}
                      placeholder="e.g. Winter Feline Knit Scarf"
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs text-brand-warm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={merchantItemPrice}
                        onChange={(e) => setMerchantItemPrice(e.target.value)}
                        placeholder="29.99"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs text-brand-warm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Category</label>
                      <select
                        value={merchantItemCategory}
                        onChange={(e) => setMerchantItemCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs text-brand-warm focus:outline-none"
                      >
                        <option>Clothing & Merch</option>
                        <option>Smart Devices</option>
                        <option>Furniture</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Product Photo URL</label>
                    <input
                      type="url"
                      value={merchantItemImg}
                      onChange={(e) => setMerchantItemImg(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs text-brand-warm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={merchantItemDesc}
                      onChange={(e) => setMerchantItemDesc(e.target.value)}
                      placeholder="Details, fit, and materials used."
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs text-brand-warm focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingMerch}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-neutral-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow"
                  >
                    {submittingMerch ? "Uploading item..." : "Publish Live Merchandise"}
                  </button>
                </form>
              </div>

            </div>
          </div>

          {/* LOWER SECTION: Active collaborations monitor list retrieved from Firestore */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 mt-8">
            <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-3">
              <Users className="w-5 h-5 text-brand-gold" />
              <h3 className="text-sm font-semibold uppercase font-display text-brand-gold">
                Live Collaboration Portfolios & Affiliate Links
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandCollaborations.map((collab, index) => {
                const id = collab.id || collab.brandName;
                const stats = commissions[id] || { clicks: 0, sales: 0, commission: 0 };
                const totalClicks = collab.clicks + stats.clicks;
                const totalSales = collab.sales + stats.sales;
                const earnedTotal = collab.commissionEarned + stats.commission;

                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-850 hover:border-brand-gold/30 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between border-b border-neutral-900 pb-3 mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-brand-warm font-display">{collab.brandName}</h4>
                          <p className="text-[10px] text-neutral-500 font-sans">Rep: {collab.repName} ({collab.email})</p>
                        </div>
                        <span className="text-[9px] uppercase font-mono px-2.5 py-1 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/15 font-semibold">
                          {collab.tier.split(" ($")[0]}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">Collaboration Query & Scope:</span>
                          <p className="text-xs text-neutral-300 font-sans italic leading-relaxed bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-850">
                            "{collab.queryDetails}"
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-850/60">
                            <span className="block text-[8px] uppercase font-mono text-neutral-500">Clicks</span>
                            <span className="text-xs font-mono font-bold text-brand-warm">{totalClicks}</span>
                          </div>
                          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-850/60">
                            <span className="block text-[8px] uppercase font-mono text-neutral-500">Sales</span>
                            <span className="text-xs font-mono font-bold text-brand-warm">{totalSales}</span>
                          </div>
                          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-850/60 animate-pulse-slow">
                            <span className="block text-[8px] uppercase font-mono text-neutral-500">Earned</span>
                            <span className="text-xs font-mono font-bold text-brand-emerald">${earnedTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <strong className="text-[9px] uppercase font-mono text-neutral-500">Affiliate Link:</strong>
                          <a href={collab.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline flex items-center gap-1 text-[11px] font-mono truncate max-w-[180px]">
                            {collab.affiliateUrl} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-900/60">
                      <button
                        onClick={() => simulateClick(id)}
                        className="py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] font-semibold text-brand-warm transition"
                      >
                        Simulate Click
                      </button>
                      <button
                        onClick={() => simulateSale(collab)}
                        className="py-1.5 rounded-lg bg-brand-emerald/10 hover:bg-brand-emerald/20 border border-brand-emerald/20 text-[10px] font-bold text-brand-emerald transition"
                      >
                        Simulate Purchase
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Cart Slider Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-brand-matte"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-brand-matte border-l border-neutral-900 text-brand-warm h-full flex flex-col justify-between p-6 z-10 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-6">
                  <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-brand-gold flex items-center gap-2">
                    <ShoppingCart className="w-4.5 h-4.5" /> Your Shopping Cart
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-xs text-neutral-500 hover:text-brand-warm"
                  >
                    Close
                  </button>
                </div>

                {orderPlaced ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-emerald/15 border border-brand-emerald text-brand-emerald flex items-center justify-center animate-bounce">
                      ✓
                    </div>
                    <p className="text-sm font-semibold font-display">Order Transmitted!</p>
                    <p className="text-xs text-neutral-400 font-sans max-w-xs">
                      Thank you for choosing PurrVerse AI. Your payment has cleared, and premium tracking codes are being computed.
                    </p>
                  </div>
                ) : cart.length > 0 ? (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-neutral-950/60 border border-neutral-900"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-neutral-850"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-brand-warm">{item.product.name}</p>
                          <p className="text-[11px] text-brand-gold font-mono mt-0.5">${item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs text-brand-warm shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-5 h-5 rounded-md bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-5 h-5 rounded-md bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 rounded text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-xs text-neutral-500 font-sans">
                    Your cart is currently empty. Shop curated products.
                  </p>
                )}
              </div>

              {!orderPlaced && cart.length > 0 && (
                <div className="border-t border-neutral-900 pt-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-brand-warm">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-brand-gold">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-warm">
                    <span>Shipping:</span>
                    <span className="text-brand-emerald font-semibold uppercase tracking-wider text-[10px]">Free Luxury Delivery</span>
                  </div>
                  <div className="border-t border-neutral-900/60 pt-3 flex items-center justify-between text-sm text-brand-warm font-semibold">
                    <span>Total Cost:</span>
                    <span className="font-mono text-brand-gold text-base">${getCartTotal().toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-xl bg-brand-gold hover:bg-yellow-500 text-brand-matte font-display font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg mt-2"
                  >
                    <CreditCard className="w-4 h-4" /> Secure Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        itemName={checkoutItemName}
        itemPrice={checkoutPrice}
        itemType="product"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
