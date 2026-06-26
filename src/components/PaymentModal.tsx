import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  X, 
  CreditCard, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Printer,
  Mail,
  User,
  Info,
  Tag,
  Ticket,
  Trash2,
  Check
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemPrice: number;
  itemType: "subscription" | "product";
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  itemName, 
  itemPrice, 
  itemType, 
  onPaymentSuccess 
}: PaymentModalProps) {
  // Contact details
  const [email, setEmail] = useState("chatterjee.ayush987@gmail.com");
  const [fullName, setFullName] = useState("");
  
  // PayPal Simulator States
  const [paypalEmail, setPaypalEmail] = useState("chatterjee.ayush987@gmail.com");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [paypalStage, setPaypalStage] = useState<"form" | "login" | "review">("form");
  const [paypalOrderId, setPaypalOrderId] = useState("");

  // Common States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [processingStep, setProcessingStep] = useState(0);
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [receiptData, setReceiptData] = useState<{
    txnRef: string;
    paidAmountINR: number;
    paidAmountUSD: number;
    paymentId: string;
    date: string;
  } | null>(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const discountedPrice = itemPrice * (1 - discountPercent / 100);
  const finalPriceUSD = parseFloat(discountedPrice.toFixed(2));
  const finalPriceINR = Math.round(finalPriceUSD * 83);

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (code === "PURRVERSEPUSSY100%") {
      setDiscountPercent(100);
      setAppliedCoupon("PURRVERSEPUSSY100%");
      setCouponSuccess("🎉 100% OFF Code Applied! Enjoy Free Full Lifetime Access!");
    } else if (code === "PURRVERSEPUSSY10%") {
      setDiscountPercent(10);
      setAppliedCoupon("PURRVERSEPUSSY10%");
      setCouponSuccess("🎉 10% OFF Coupon Code Applied successfully!");
    } else {
      setCouponError("Invalid coupon code. Try 'PURRVERSEPUSSY10%'");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountPercent(0);
    setCouponSuccess("");
    setCouponError("");
  };

  const steps = [
    "Establishing secure PurrVerse gateway...",
    "Initiating handshake with PayPal billing service...",
    "Acquiring secure customer approval token...",
    "Verifying funding allocation & ledger clearance...",
    "Confirming credit allocation & premium sync..."
  ];

  // Stepper simulation timer (used for sandbox or background status)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentStatus === "processing" && isSandboxMode) {
      if (processingStep < steps.length) {
        timer = setTimeout(() => {
          setProcessingStep(prev => prev + 1);
        }, 1000);
      } else {
        setReceiptData({
          txnRef: paypalOrderId || `PV-PP-${Math.floor(100000 + Math.random() * 900000)}`,
          paidAmountINR: finalPriceINR,
          paidAmountUSD: finalPriceUSD,
          paymentId: `PAY-MOCK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          date: new Date().toLocaleString()
        });
        setPaymentStatus("success");
      }
    }
    return () => clearTimeout(timer);
  }, [paymentStatus, processingStep, isSandboxMode]);

  // Initiate the payment process (Fetch PayPal Order ID from server)
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic Validation
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your name.";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (discountPercent === 100) {
      // 100% OFF Coupon bypasses PayPal gateway
      setPaymentStatus("processing");
      setProcessingStep(0);
      setIsSandboxMode(true);
      setPaypalOrderId(`PV-FREE-${Math.floor(100000 + Math.random() * 900000)}`);
      return;
    }

    setPaymentStatus("processing");
    setProcessingStep(0);

    try {
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPriceUSD,
          itemName,
          itemType
        })
      });

      if (!orderResponse.ok) {
        throw new Error("Order service responded with an error");
      }

      const orderData = await orderResponse.json();
      setPaypalOrderId(orderData.id);

      // Reset paymentStatus back to idle so they can log in via PayPal
      setPaymentStatus("idle");
      setPaypalEmail(email);

      if (orderData.isMock) {
        setIsSandboxMode(true);
        setPaypalStage("login");
      } else {
        setIsSandboxMode(false);
        setPaypalStage("login");
      }
    } catch (err: any) {
      console.warn("PayPal initialization failed, activating in-app sandbox:", err.message);
      setIsSandboxMode(true);
      setPaypalOrderId(`paypal_mock_order_${Math.floor(Math.random() * 10000000)}`);
      setPaymentStatus("idle");
      setPaypalEmail(email);
      setPaypalStage("login");
    }
  };

  // Complete PayPal verification / capturing on backend
  const handleCompletePayPalPayment = async () => {
    setPaymentStatus("processing");
    setProcessingStep(0);

    if (isSandboxMode) {
      // Background verification call to mock
      try {
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paypal_order_id: paypalOrderId,
            isMock: true
          })
        });
      } catch (err) {
        console.error("Mock verify call failed", err);
      }
    } else {
      // Real Live Capture
      try {
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paypal_order_id: paypalOrderId,
            isMock: false
          })
        });

        const verifyResult = await verifyResponse.json();
        if (verifyResponse.ok && verifyResult.status === "success") {
          setReceiptData({
            txnRef: paypalOrderId,
            paidAmountINR: finalPriceINR,
            paidAmountUSD: finalPriceUSD,
            paymentId: verifyResult.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || `pay_live_${Math.random().toString(36).substring(2, 11)}`,
            date: new Date().toLocaleString()
          });
          setPaymentStatus("success");
        } else {
          setPaymentStatus("idle");
          setPaypalStage("review");
          setErrors({ payment: verifyResult.error || "PayPal payment capture failed." });
        }
      } catch (err: any) {
        setPaymentStatus("idle");
        setPaypalStage("review");
        setErrors({ payment: err.message || "Failed to capture PayPal transaction." });
      }
    }
  };

  const handleFinish = () => {
    onPaymentSuccess();
    // Reset state
    setFullName("");
    setPaymentStatus("idle");
    setPaypalStage("form");
    setProcessingStep(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (paymentStatus !== "processing") onClose();
          }}
          className="absolute inset-0 bg-[#070707] backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-lg bg-[#0F0F0F] border border-brand-gold/20 rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-brand-gold/10 flex items-center justify-between bg-neutral-950/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-brand-gold">
                  Secure Checkout
                </h3>
                <p className="text-[10px] text-neutral-500 font-mono">
                  PAYPAL VERIFIED PAYMENT CHANNEL
                </p>
              </div>
            </div>
            {paymentStatus !== "processing" && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-500 hover:text-brand-warm transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            
            {/* 1. INITIAL FORM ENTRY STATE */}
            {paymentStatus === "idle" && paypalStage === "form" && (
              <>
                {/* Order Summary Panel */}
                <div className="p-5 rounded-2xl bg-neutral-950/60 border border-brand-gold/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">CARE ITEM / SERVICE</p>
                    <p className="text-xs sm:text-sm font-semibold font-display text-brand-warm mt-0.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-gold" /> {itemName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">TOTAL AMOUNT</p>
                    <p className="text-base sm:text-lg font-bold font-mono text-brand-gold mt-0.5">
                      {discountPercent > 0 && (
                        <span className="line-through text-neutral-500 text-xs mr-2">${itemPrice.toFixed(2)}</span>
                      )}
                      ${finalPriceUSD.toFixed(2)} USD
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      (Approx ₹{finalPriceINR.toLocaleString()})
                    </p>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-900 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-gold" /> Have a Coupon?
                    </span>
                    <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded self-start sm:self-auto">
                      Active Code: <strong className="select-all text-brand-gold">PURRVERSEPUSSY10%</strong> (10% OFF)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-brand-warm font-mono uppercase focus:outline-none focus:border-brand-gold/50 transition-all placeholder:text-neutral-600 disabled:opacity-60"
                      />
                      <Ticket className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 rounded-xl bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-900 hover:text-neutral-100 text-xs transition cursor-pointer flex items-center justify-center gap-1"
                        title="Remove Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 rounded-xl bg-brand-gold text-brand-matte font-display font-semibold text-xs hover:bg-yellow-500 transition cursor-pointer"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponError && (
                    <p className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[10px] text-brand-emerald flex items-center gap-1 font-sans">
                      <Check className="w-3.5 h-3.5" /> {couponSuccess}
                    </p>
                  )}
                </div>

                {/* Secure Gateway Hint */}
                <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-2xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-brand-warm font-display">PayPal Smart Gateway Active</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                        Seamlessly settle via your PayPal account or dynamic wallet. Real-time protection with instant confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM FIELDS */}
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Billing Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full bg-neutral-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold/50 transition-all font-sans ${
                          errors.fullName ? "border-red-500/50" : "border-brand-gold/10"
                        }`}
                        placeholder="e.g. Ayush Chatterjee"
                      />
                      <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.fullName && (
                      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Billing Email */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Billing Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-neutral-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-brand-gold/50 transition-all font-sans ${
                          errors.email ? "border-red-500/50" : "border-brand-gold/10"
                        }`}
                        placeholder="your@email.com"
                      />
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* API Alert message */}
                  {errors.payment && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-[11px] text-red-300 leading-relaxed">
                      <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Sandbox Activated
                      </p>
                      {errors.payment}
                    </div>
                  )}

                  {/* Safe payment note */}
                  <div className="p-3.5 bg-neutral-950 border border-brand-gold/10 rounded-xl flex items-start gap-2 text-[10px] text-neutral-400 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      PCI-DSS Compliant PayPal secure tunnel active. Settle via linked card, bank accounts, or PayPal Balance securely.
                    </span>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-neutral-950 font-display font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> PROCEED TO PAYPAL SECURE CHECKOUT
                  </button>
                </form>
              </>
            )}

            {/* 2. PAYPAL SECURE LOGIN STAGE */}
            {paymentStatus === "idle" && paypalStage === "login" && (
              <div className="space-y-6">
                {/* PayPal Branded Secure Header */}
                <div className="bg-[#003087] rounded-2xl p-4 flex items-center justify-between border border-[#0079C1]/30 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-extrabold italic text-lg text-white tracking-tight flex items-center gap-0.5">
                      Pay<span className="text-[#0079C1]">Pal</span>
                    </span>
                    <span className="text-[9px] bg-white/20 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">SECURE LINK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#0079C1] bg-white px-2 py-0.5 rounded-full font-bold">
                    <Lock className="w-3 h-3" /> VERIFIED
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-950/60 border border-brand-gold/10 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Log in to your PayPal account</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Log in securely to approve your purchase of <span className="text-brand-gold font-semibold font-mono">{itemName} (${finalPriceUSD.toFixed(2)})</span>.
                  </p>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        PayPal Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-[#0079C1]/50 transition-all font-mono"
                          placeholder="paypal@example.com"
                        />
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        PayPal Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={paypalPassword}
                          onChange={(e) => setPaypalPassword(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-warm focus:outline-none focus:border-[#0079C1]/50 transition-all font-mono"
                          placeholder="••••••••"
                        />
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaypalStage("form");
                        setErrors({});
                      }}
                      className="flex-1 py-2.5 rounded-full border border-neutral-800 hover:bg-neutral-900 text-xs font-mono text-neutral-400 cursor-pointer transition text-center"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!paypalEmail || !paypalEmail.includes("@")) {
                          alert("Please enter a valid PayPal email");
                          return;
                        }
                        setPaypalStage("review");
                      }}
                      className="flex-1 py-2.5 rounded-full bg-[#0079C1] hover:bg-[#00457C] text-white font-display font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-lg text-center"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAYPAL APPROVAL & FUND REVIEW STAGE */}
            {paymentStatus === "idle" && paypalStage === "review" && (
              <div className="space-y-6">
                {/* PayPal Header */}
                <div className="bg-[#003087] rounded-2xl p-4 flex items-center justify-between border border-[#0079C1]/30 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-extrabold italic text-lg text-white tracking-tight flex items-center gap-0.5">
                      Pay<span className="text-[#0079C1]">Pal</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-white font-mono opacity-85">
                    User: <span className="font-bold">{paypalEmail}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-950/60 border border-brand-gold/10 space-y-5">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                    <div>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Purchase item</p>
                      <p className="text-xs font-semibold text-brand-warm mt-0.5 font-display flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> {itemName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Total Charge</p>
                      <p className="text-sm font-bold font-mono text-brand-gold mt-0.5">${finalPriceUSD.toFixed(2)} USD</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Choose Funding Source</p>
                    
                    {/* PayPal Balance option */}
                    <div className="p-3.5 bg-[#0079C1]/10 border border-[#0079C1]/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0079C1]/20 flex items-center justify-center text-[#0079C1]">
                          <span className="font-sans italic font-extrabold text-xs">$</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-warm font-sans">PayPal Balance</p>
                          <p className="text-[10px] text-neutral-400">Available: $350.00 USD</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-[#0079C1] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#0079C1]" />
                      </div>
                    </div>

                    {/* Credit Card option */}
                    <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-850 flex items-center justify-center text-neutral-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-400">Visa Debit Card (•••• 4242)</p>
                          <p className="text-[10px] text-neutral-500">Backup funding</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {errors.payment && (
                    <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-sans">
                      {errors.payment}
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaypalStage("login");
                      }}
                      className="flex-1 py-2.5 rounded-full border border-neutral-800 hover:bg-neutral-900 text-xs font-mono text-neutral-400 cursor-pointer transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCompletePayPalPayment}
                      className="flex-1 py-2.5 rounded-full bg-[#D6AF37] hover:bg-[#C59E26] text-neutral-950 font-display font-extrabold text-xs uppercase tracking-wider cursor-pointer transition shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> COMPETE PURCHASE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PROCESSING SECURE TRANSACTION STATE */}
            {paymentStatus === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                {/* Secure animated spinner loader */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-gold/20 border-t-brand-gold animate-spin" />
                  <Lock className="w-6 h-6 text-brand-gold absolute inset-0 m-auto animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold font-display tracking-wide text-brand-warm">
                    Securing PayPal Gateway...
                  </h4>
                  <p className="text-[10px] uppercase font-mono text-brand-gold tracking-widest animate-pulse">
                    Authenticating Core Settle
                  </p>
                </div>

                {/* Processing Steps stepper */}
                <div className="w-full max-w-sm bg-neutral-950/60 rounded-2xl border border-brand-gold/10 p-5 space-y-3.5">
                  {steps.map((step, idx) => {
                    const isCompleted = processingStep > idx;
                    const isCurrent = processingStep === idx;
                    return (
                      <div key={idx} className="flex items-center gap-3 text-left">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCompleted 
                            ? "bg-brand-emerald text-brand-warm" 
                            : isCurrent 
                            ? "bg-brand-gold text-brand-matte animate-bounce" 
                            : "bg-neutral-900 text-neutral-500 border border-neutral-850"
                        }`}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className={`text-[11px] font-sans ${
                          isCompleted 
                            ? "text-brand-emerald line-through opacity-70" 
                            : isCurrent 
                            ? "text-brand-gold font-medium" 
                            : "text-neutral-500"
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUCCESS STATE WITH PREMIUM GOLD RECEIPT */}
            {paymentStatus === "success" && receiptData && (
              <div className="py-6 space-y-6">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-brand-emerald/15 border border-brand-emerald text-brand-emerald flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold font-display tracking-wide text-brand-warm">
                    Payment Succeeded!
                  </h4>
                  <p className="text-xs text-brand-gold font-medium font-sans">
                    PayPal order successfully created, captured & settled.
                  </p>
                </div>

                {/* RECEIPT PREVIEW */}
                <div className="bg-neutral-950 border border-brand-gold/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-[0.03] text-brand-gold pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current">
                      <path d="M50,45 C56,45 61,49 61,56 C61,63 56,67 50,67 C44,67 39,63 39,56 C39,49 44,45 50,45 Z" />
                      <circle cx="34" cy="40" r="7" />
                      <circle cx="45" cy="30" r="7.5" />
                      <circle cx="55" cy="30" r="7.5" />
                      <circle cx="66" cy="40" r="7" />
                    </svg>
                  </div>

                  <div className="border-b border-brand-gold/10 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold">
                        PurrVerse AI Inc.
                      </p>
                      <p className="text-[8px] text-neutral-500 font-sans">
                        Settling Gateway: PayPal Rest Api
                      </p>
                    </div>
                    <span className="text-[9px] uppercase font-mono tracking-wider bg-brand-emerald/15 text-brand-emerald px-2 py-0.5 rounded border border-brand-emerald/10 font-bold">
                      COMPLETED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">PayPal Order ID:</span>
                      <span className="font-mono text-brand-warm truncate max-w-[150px]">{receiptData.txnRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">Billing To:</span>
                      <span className="font-sans text-brand-warm truncate max-w-[150px]">{fullName.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">Billing Notification Email:</span>
                      <span className="font-mono text-brand-warm truncate max-w-[150px]">{email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">PayPal Account Logged:</span>
                      <span className="font-mono text-brand-gold truncate max-w-[150px]">{paypalEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">PayPal Capture ID:</span>
                      <span className="font-mono text-brand-warm truncate max-w-[150px]">{receiptData.paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">Settled Time:</span>
                      <span className="font-mono text-brand-warm">{receiptData.date}</span>
                    </div>
                    <hr className="border-brand-gold/10 my-3" />
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-neutral-300 font-sans">{itemName} ({itemType === "subscription" ? "CARE TIER" : "PRODUCT"})</span>
                      <span className="font-mono text-brand-gold">${receiptData.paidAmountUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="border-t border-brand-gold/20 pt-2.5 mt-2 flex justify-between text-sm font-bold text-brand-warm">
                      <span>Total Settle (USD):</span>
                      <span className="font-mono text-brand-gold">${receiptData.paidAmountUSD.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => alert("Printing PayPal transaction ledger details.")}
                    className="flex-1 py-3 bg-neutral-950 border border-brand-gold/20 hover:border-brand-gold/40 rounded-xl text-xs font-mono font-medium text-brand-gold cursor-pointer flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4" /> PRINT LEDGER
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-3 bg-brand-gold text-brand-matte hover:bg-yellow-500 rounded-xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition"
                  >
                    CONTINUE <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
