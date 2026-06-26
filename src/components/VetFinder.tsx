import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  ShieldCheck, 
  Heart, 
  ArrowRight, 
  Video, 
  CalendarCheck, 
  Navigation, 
  Activity, 
  AlertOctagon, 
  Globe, 
  Compass, 
  FileText,
  UserPlus,
  Flame,
  CheckCircle2,
  Info
} from "lucide-react";
import { VetClinic } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Standard Helplines by Country
interface EmergencyHelpline {
  countryName: string;
  countryCode: string;
  helplineName: string;
  phone: string;
  description: string;
  secondaryPhone?: string;
  secondaryName?: string;
}

const emergencyHelplines: EmergencyHelpline[] = [
  {
    countryCode: "IN",
    countryName: "India (भारत)",
    helplineName: "Friendicoes Animal Rescue & ICU",
    phone: "+919810007544",
    description: "24/7 Veterinary ambulance, emergency treatment, and critical feline admissions.",
    secondaryPhone: "+911124320543",
    secondaryName: "Sanjay Gandhi Animal Care Centre (SGACC)"
  },
  {
    countryCode: "US",
    countryName: "United States (USA)",
    helplineName: "ASPCA Animal Poison Control",
    phone: "+18884264435",
    description: "Premier 24/7 emergency poison triage and toxicological guide for felines.",
    secondaryPhone: "+18002136680",
    secondaryName: "Pet Poison Helpline (24 Hours)"
  },
  {
    countryCode: "GB",
    countryName: "United Kingdom (UK)",
    helplineName: "RSPCA National Emergency Helpline",
    phone: "+443001234999",
    description: "24-hour hotline to report cats in severe danger, injury, or critical conditions.",
    secondaryPhone: "+441306740008",
    secondaryName: "Feline Advisory Bureau Urgent Vet Care"
  },
  {
    countryCode: "CA",
    countryName: "Canada",
    helplineName: "Ontario SPCA Emergency & Rescue",
    phone: "+13107722",
    description: "Provincial emergency rescue, animal ambulance, and critical vet network dispatch.",
    secondaryPhone: "+18884264435",
    secondaryName: "ASPCA North American Poison Hotline"
  },
  {
    countryCode: "AU",
    countryName: "Australia",
    helplineName: "RSPCA Emergency Rescue Hotline",
    phone: "+13002783589",
    description: "National emergency ambulance dispatch for injured strays, domestic cats, and wildlife.",
    secondaryPhone: "+611300852868",
    secondaryName: "Lort Smith 24/7 Animal Hospital (Melbourne)"
  }
];

// Predefined Veterinary Clinics with coordinates to calculate mathematically
interface GeoClinic {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewsCount: number;
  address: string;
  phone: string;
  isEmergency: boolean;
  hasOnlineConsult: boolean;
  website?: string;
  city?: string;
}

const METROPOLIS_CLINICS: GeoClinic[] = [
  // Kolkata Clinics
  {
    id: "kol-1",
    name: "Apex 24/7 Feline Hospital & Trauma Care",
    latitude: 22.5850, 
    longitude: 88.3720,
    rating: 4.9,
    reviewsCount: 312,
    address: "P-12 Salt Lake Sector V, Near Tech Hub, Kolkata, West Bengal 700091",
    phone: "+91 98300 11223",
    isEmergency: true,
    hasOnlineConsult: true,
    website: "https://www.apexcattrauma.com",
    city: "Kolkata"
  },
  {
    id: "kol-2",
    name: "Purrfect Care Clinic & Diagnostics",
    latitude: 22.5120, 
    longitude: 88.3450,
    rating: 4.8,
    reviewsCount: 185,
    address: "48B Gariahat Road, South Avenue, Kolkata, West Bengal 700019",
    phone: "+91 33 2464 8899",
    isEmergency: false,
    hasOnlineConsult: true,
    website: "https://www.purrfectcareclinic.com",
    city: "Kolkata"
  },
  {
    id: "kol-3",
    name: "Royal Pet ICU & Emergency Center",
    latitude: 22.6210, 
    longitude: 88.4120,
    rating: 4.7,
    reviewsCount: 450,
    address: "100 VIP Road, Near Airport Crossing, Kolkata, West Bengal 700052",
    phone: "+91 98450 91100",
    isEmergency: true,
    hasOnlineConsult: false,
    website: "https://www.royalpeticu.com",
    city: "Kolkata"
  },
  {
    id: "kol-4",
    name: "Cat Health Sanctuary & Wellness Clinic",
    latitude: 22.5410, 
    longitude: 88.3510,
    rating: 4.9,
    reviewsCount: 94,
    address: "74 Park Street, Landmark Court, Kolkata, West Bengal 700016",
    phone: "+91 33 4004 7711",
    isEmergency: false,
    hasOnlineConsult: false,
    website: "https://www.cathealthsanctuary.com",
    city: "Kolkata"
  },
  {
    id: "kol-5",
    name: "Suburban Feline Medicare Center",
    latitude: 22.8120, // ~29 km
    longitude: 88.4320,
    rating: 4.6,
    reviewsCount: 110,
    address: "Chinsurah Vet Bypass Road, Hooghly, West Bengal 712101",
    phone: "+91 94330 88221",
    isEmergency: true,
    hasOnlineConsult: true,
    website: "https://www.suburbanfelinemed.com",
    city: "Kolkata"
  },
  {
    id: "kol-6",
    name: "Feline Specialist Outpost (Out of Range)",
    latitude: 23.0120, // ~55 km
    longitude: 88.5120,
    rating: 4.8,
    reviewsCount: 78,
    address: "Ranaghat National Highway 34 Intersection, West Bengal 741201",
    phone: "+91 98311 00334",
    isEmergency: false,
    hasOnlineConsult: true,
    website: "https://www.felinespecialistoutpost.com",
    city: "Kolkata"
  },

  // Delhi / NCR Clinics
  {
    id: "del-1",
    name: "Delhi Feline Emergency ICU & Clinic",
    latitude: 28.6145, 
    longitude: 77.2095,
    rating: 4.9,
    reviewsCount: 220,
    address: "A-24 Connaught Place, Inner Circle, New Delhi 110001",
    phone: "+91 98110 54321",
    isEmergency: true,
    hasOnlineConsult: true,
    website: "https://www.delhifelinehospital.com",
    city: "Delhi"
  },
  {
    id: "del-2",
    name: "South Delhi Cat Wellness Sanctuary",
    latitude: 28.5244, 
    longitude: 77.2102,
    rating: 4.8,
    reviewsCount: 140,
    address: "S-56 Saket District Centre, Sector 6, New Delhi 110017",
    phone: "+91 11 4166 7788",
    isEmergency: false,
    hasOnlineConsult: true,
    website: "https://www.southdelhicatclinic.com",
    city: "Delhi"
  },
  {
    id: "del-3",
    name: "Gurgaon Feline Trauma Care Unit",
    latitude: 28.4595, // ~25 km
    longitude: 77.0266,
    rating: 4.7,
    reviewsCount: 195,
    address: "Shop 12, Golf Course Road, Sector 54, Gurgaon, Haryana 122002",
    phone: "+91 99999 88877",
    isEmergency: true,
    hasOnlineConsult: false,
    website: "https://www.gurgaonfelinetrauma.com",
    city: "Delhi"
  },
  {
    id: "del-4",
    name: "Noida Cat Hospital & Pet Boarding",
    latitude: 28.5355, // ~20 km
    longitude: 77.3910,
    rating: 4.6,
    reviewsCount: 88,
    address: "B-88 Sector 62, Near Fortis Hospital, Noida, Uttar Pradesh 201301",
    phone: "+91 120 456 7890",
    isEmergency: false,
    hasOnlineConsult: true,
    website: "https://www.noidacathospital.com",
    city: "Delhi"
  },

  // US New York Clinics
  {
    id: "ny-1",
    name: "Manhattan 24/7 Veterinary Center",
    latitude: 40.7580, 
    longitude: -73.9855,
    rating: 4.9,
    reviewsCount: 560,
    address: "150 W 42nd St, Times Square, New York, NY 10036",
    phone: "+1 212 555 0190",
    isEmergency: true,
    hasOnlineConsult: true,
    website: "https://www.manhattanvetcenter.com",
    city: "New York"
  },
  {
    id: "ny-2",
    name: "Brooklyn Cat Specialist & Wellness",
    latitude: 40.6782, // ~10 km
    longitude: -73.9442,
    rating: 4.8,
    reviewsCount: 310,
    address: "450 Nostrand Ave, Bed-Stuy, Brooklyn, NY 11216",
    phone: "+1 718 555 0124",
    isEmergency: false,
    hasOnlineConsult: true,
    website: "https://www.brooklyncatvet.com",
    city: "New York"
  },
  {
    id: "ny-3",
    name: "Queens Feline Emergency Hospital",
    latitude: 40.7282, // ~15 km
    longitude: -73.7949,
    rating: 4.7,
    reviewsCount: 220,
    address: "164-09 Union Tpke, Fresh Meadows, NY 11366",
    phone: "+1 347 555 0177",
    isEmergency: true,
    hasOnlineConsult: false,
    website: "https://www.queensfelineer.com",
    city: "New York"
  },

  // UK London Clinics
  {
    id: "lon-1",
    name: "London Central Feline Hospital",
    latitude: 51.5074, 
    longitude: -0.1278,
    rating: 4.9,
    reviewsCount: 420,
    address: "Trafalgar Sq, Charing Cross, London WC2N 5DN",
    phone: "+44 20 7946 0192",
    isEmergency: true,
    hasOnlineConsult: true,
    website: "https://www.londonfelinehospital.co.uk",
    city: "London"
  },
  {
    id: "lon-2",
    name: "Westminster Veterinary Care & ER",
    latitude: 51.4975, // ~1.5 km
    longitude: -0.1357,
    rating: 4.8,
    reviewsCount: 180,
    address: "32 Victoria St, Westminster, London SW1H 0TL",
    phone: "+44 20 7946 0145",
    isEmergency: true,
    hasOnlineConsult: false,
    website: "https://www.westminstervetcare.co.uk",
    city: "London"
  },
  {
    id: "lon-3",
    name: "Greenwich Cat Wellness & Vet Clinic",
    latitude: 51.4826, // ~10 km
    longitude: -0.0077,
    rating: 4.7,
    reviewsCount: 95,
    address: "Greenwich High Rd, London SE10 8NN",
    phone: "+44 20 7946 0111",
    isEmergency: false,
    hasOnlineConsult: true,
    website: "https://www.greenwichcatclinic.co.uk",
    city: "London"
  }
];

const CITIES = [
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, flag: "🇮🇳" },
  { name: "Delhi", lat: 28.6139, lng: 77.2090, flag: "🇮🇳" },
  { name: "New York", lat: 40.7128, lng: -74.0060, flag: "🇺🇸" },
  { name: "London", lat: 51.5074, lng: -0.1278, flag: "🇬🇧" }
];

interface VetFinderProps {
  currentPlan: string;
  onSelectPlan: (planName: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function VetFinder({
  currentPlan,
  onSelectPlan,
  onSelectTab
}: VetFinderProps) {
  const [activeTab, setActiveTab] = useState<"search" | "helpline">("search");
  
  // User input details
  const [catName, setCatName] = useState("Zeus");
  const [catBreed, setCatBreed] = useState("British Shorthair");
  const [catSymptom, setCatSymptom] = useState("Routine feline health checkup");
  const [detailsAdded, setDetailsAdded] = useState(true);

  // Approximate center (e.g. Kolkata Park Street area as default fallback)
  const defaultCenter = { lat: 22.5726, lng: 88.3639 };

  // Location settings - ON by default with immediate fallback center for robust iframe telemetry
  const [isLocationOn, setIsLocationOn] = useState(true);
  const [isTriangulating, setIsTriangulating] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(defaultCenter);

  // Search/Filters inside VetFinder
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [filterVideo, setFilterVideo] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<GeoClinic | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState("");

  // Country selector for Emergency Helpline
  const [selectedCountryCode, setSelectedCountryCode] = useState("IN");

  // Trigger GPS Geolocation or beautiful radar simulation
  useEffect(() => {
    if (isLocationOn) {
      // If we don't have coordinates yet or if we want to refresh/re-triangulate on link activation
      if (!gpsCoordinates) {
        setIsTriangulating(true);
        
        // Request actual browser geolocation if supported
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setGpsCoordinates({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              setTimeout(() => {
                setIsTriangulating(false);
              }, 800);
            },
            (error) => {
              console.warn("Geolocation permission denied/unavailable. Using high-fidelity fallback coordinates.");
              setGpsCoordinates({ lat: defaultCenter.lat, lng: defaultCenter.lng });
              setTimeout(() => {
                setIsTriangulating(false);
              }, 1000);
            },
            { timeout: 1500, enableHighAccuracy: false, maximumAge: 60000 }
          );
        } else {
          setGpsCoordinates({ lat: defaultCenter.lat, lng: defaultCenter.lng });
          setTimeout(() => {
            setIsTriangulating(false);
          }, 800);
        }
      }
    } else {
      setGpsCoordinates(null);
      setIsTriangulating(false);
    }
  }, [isLocationOn]);

  // Haversine formula to calculate true geographic distance in Kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  // Process and filter clinics based on Location state, 30 km Range, symptoms, and search query
  const getFilteredClinics = () => {
    if (!isLocationOn || !gpsCoordinates) {
      return [];
    }

    return METROPOLIS_CLINICS.map(clinic => {
      const distance = calculateDistance(
        gpsCoordinates.lat, 
        gpsCoordinates.lng, 
        clinic.latitude, 
        clinic.longitude
      );
      return { ...clinic, distanceValue: distance };
    })
    .filter(clinic => {
      // Limit range to exactly 30 km!
      if (clinic.distanceValue > 30) return false;

      // Filter by name search query
      if (searchQuery && !clinic.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Filter by emergency tag
      if (filterEmergency && !clinic.isEmergency) return false;

      // Filter by video consult tag
      if (filterVideo && !clinic.hasOnlineConsult) return false;

      return true;
    })
    .sort((a, b) => a.distanceValue - b.distanceValue);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedClinic(null);
      setBookingDate("");
    }, 2800);
  };

  // Submit Cat Health Details
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSymptom.trim()) {
      alert("Please provide both cat name and current medical symptoms!");
      return;
    }
    setDetailsAdded(true);
  };

  const activeHelpline = emergencyHelplines.find(h => h.countryCode === selectedCountryCode) || emergencyHelplines[0];
  const processedClinics = getFilteredClinics();

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-[32px] p-6 sm:p-8 text-brand-warm shadow-2xl relative overflow-hidden">
      
      {/* Decorative ambient backdrop */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header and Switchable tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-6 mb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-semibold">
            VETERINARY MEDICINE & HELPLINE INTERFACE
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-brand-warm mt-1">
            🩺 Feline Healthcare Portal
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Register diagnostic concerns, enable GPS location tracking for a 30 km veterinary perimeter scan, or access live emergency country helplines instantly.
          </p>
        </div>

        {/* Segmented Controller (Search vs Helplines) */}
        <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-850 self-start">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 rounded-xl text-xs font-display font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "search"
                ? "bg-brand-gold text-brand-matte"
                : "text-neutral-400 hover:text-brand-warm"
            }`}
          >
            <Compass className="w-4 h-4" /> 30km Vet Scan
          </button>
          <button
            onClick={() => setActiveTab("helpline")}
            className={`px-4 py-2 rounded-xl text-xs font-display font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "helpline"
                ? "bg-red-950/40 text-red-400 border border-red-900/40"
                : "text-neutral-400 hover:text-brand-warm"
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-red-500" /> Emergency Hotline
          </button>
        </div>
      </div>

      {/* SEARCH / 30KM RANGE VET FINDER PORTION */}
      {activeTab === "search" && (
        <div className="space-y-8">
          
          {/* STEP 1: FILL IN DETAILS & TOGGLE LOCATION ON */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form details section */}
            <div className="lg:col-span-6 bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-900">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 text-brand-gold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-mono tracking-wider text-brand-gold font-semibold">
                    Step 1: Patient Diagnostics Details
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-sans">Enter symptoms before executing regional satellite scan</p>
                </div>
              </div>

              {detailsAdded ? (
                <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-brand-emerald uppercase font-bold">
                      PATIENT DETAILS COMMITTED
                    </span>
                    <button
                      onClick={() => setDetailsAdded(false)}
                      className="text-[10px] font-mono text-neutral-500 hover:text-brand-warm underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="text-xs space-y-1 text-neutral-300">
                    <p><span className="text-neutral-500 font-mono">Feline Name:</span> <strong className="text-brand-warm">{catName}</strong></p>
                    <p><span className="text-neutral-500 font-mono">Breed/Heritage:</span> {catBreed}</p>
                    <p><span className="text-neutral-500 font-mono">Active Symptoms:</span> <span className="text-brand-gold font-medium">"{catSymptom}"</span></p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-emerald">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Medical logs logged. Ready for location pairing.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveDetails} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        Cat's Name
                      </label>
                      <input
                        type="text"
                        required
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="e.g. Zeus"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        Cat Breed
                      </label>
                      <select
                        value={catBreed}
                        onChange={(e) => setCatBreed(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                      >
                        <option value="British Shorthair">British Shorthair</option>
                        <option value="Siamese">Siamese</option>
                        <option value="Persian">Persian Cat</option>
                        <option value="Maine Coon">Maine Coon</option>
                        <option value="Ragdoll">Ragdoll</option>
                        <option value="Indie/Stray">Indie / Stray Feline</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Current Sickness / Health Issue
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={catSymptom}
                      onChange={(e) => setCatSymptom(e.target.value)}
                      placeholder="e.g. High fever, persistent sneezing, refusing food, urgent injury, etc."
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs text-brand-warm focus:outline-none focus:border-brand-gold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-brand-gold text-xs font-display font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Save Patient Details
                  </button>
                </form>
              )}
            </div>

            {/* GPS Location Services pairing block */}
            <div className="lg:col-span-6 bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-900">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 text-brand-gold">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-mono tracking-wider text-brand-gold font-semibold">
                    Step 2: Satellite GPS Linkage
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-sans">Toggle location services to initiate a 30 km radius scanner</p>
                </div>
              </div>

              {/* Status and Toggle Switch */}
              <div className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-brand-warm font-display">GPS Telemetry State</p>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                    {isLocationOn 
                      ? "Satellite linked. True calculated perimeter activated." 
                      : "Inactive. GPS coordinate verification is disabled."
                    }
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!isLocationOn) {
                      setIsLocationOn(true);
                      setGpsCoordinates(defaultCenter);
                    } else {
                      setIsLocationOn(false);
                      setGpsCoordinates(null);
                    }
                  }}
                  className={`relative inline-flex h-6.5 w-12.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${
                    isLocationOn ? "bg-brand-gold" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-brand-matte shadow ring-0 transition duration-300 ease-in-out ${
                      isLocationOn ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* High-Fidelity Regional presets override for sandbox frames */}
              {isLocationOn && (
                <div className="space-y-2 p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-brand-gold/80">
                    📍 Regional Presets (Bypass Iframe Sandbox GPS Lock)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CITIES.map((city) => {
                      const isActive = gpsCoordinates && Math.abs(gpsCoordinates.lat - city.lat) < 0.01;
                      return (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => {
                            setIsTriangulating(true);
                            setGpsCoordinates({ lat: city.lat, lng: city.lng });
                            setTimeout(() => {
                              setIsTriangulating(false);
                            }, 500);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-sans tracking-wide transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isActive
                              ? "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-semibold"
                              : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-brand-warm hover:border-neutral-800"
                          }`}
                        >
                          <span className="text-sm select-none">{city.flag}</span>
                          <span>{city.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Visual Radar Satellite simulation */}
              <div className="h-28 rounded-xl bg-neutral-950 border border-neutral-850 overflow-hidden relative flex items-center justify-center p-3">
                {isTriangulating ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-9 h-9 rounded-full border-2 border-brand-gold/20 border-t-brand-gold animate-spin" />
                    <p className="text-[9px] font-mono uppercase tracking-widest text-brand-gold animate-pulse">
                      Triangulating Satellite Ping...
                    </p>
                  </div>
                ) : gpsCoordinates ? (
                  <div className="w-full h-full flex items-center justify-between px-3 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                        🛰️ RADAR CONVERGENCE ACQUIRED
                      </p>
                      <p className="text-[10px] font-sans text-neutral-400">
                        Virtual Center Lat: <strong className="font-mono text-brand-warm">{gpsCoordinates.lat.toFixed(4)}</strong>
                      </p>
                      <p className="text-[10px] font-sans text-neutral-400">
                        Virtual Center Lng: <strong className="font-mono text-brand-warm">{gpsCoordinates.lng.toFixed(4)}</strong>
                      </p>
                      <p className="text-[9px] uppercase font-mono text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded border border-brand-emerald/10 inline-block mt-1 font-bold">
                        30 KM CLAMP ENABLED
                      </p>
                    </div>

                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-brand-gold/20 animate-ping" />
                      <div className="w-10 h-10 rounded-full border border-brand-gold/40 animate-pulse-slow flex items-center justify-center">
                        <Compass className="w-4 h-4 text-brand-gold animate-spin-slow" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center px-4 space-y-1">
                    <p className="text-xs font-semibold text-neutral-400 font-display">GPS Hardware Offline</p>
                    <p className="text-[10px] text-neutral-500 font-sans leading-relaxed">
                      Toggle the GPS Location button above. Once link is built, our 30 km range filters will activate immediately.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* STEP 2: DYNAMIC LISTING BASED ON ACCURED CONVERGENCE */}
          <div className="border-t border-neutral-900 pt-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-brand-warm flex items-center gap-2">
                  🩺 {isLocationOn ? `Active Clinics within 30 km Radius (${processedClinics.length})` : "Nearby Feline Care Centers"}
                </h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">
                  Showing feline specialized critical trauma care, diagnostic labs, and general clinical consults.
                </p>
              </div>

              {/* Internal filters (only available when location is paired to maintain high context) */}
              {isLocationOn && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterEmergency(!filterEmergency)}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider transition border cursor-pointer ${
                      filterEmergency
                        ? "bg-red-950/40 text-red-400 border-red-900/60"
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:border-neutral-800"
                    }`}
                  >
                    🚨 24/7 Critical Only
                  </button>
                  <button
                    onClick={() => setFilterVideo(!filterVideo)}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider transition border cursor-pointer ${
                      filterVideo
                        ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:border-neutral-800"
                    }`}
                  >
                    Video Consults
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic visual state dispatcher */}
            {!detailsAdded ? (
              <div className="bg-neutral-950/20 border border-dashed border-neutral-900 rounded-2xl py-12 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center mx-auto text-neutral-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <p className="text-sm font-semibold text-brand-warm font-display">Waiting for Patient Diagnostics Details</p>
                  <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                    Please provide your feline's active symptoms and diagnostic name in the <strong>Patient Details</strong> card first to compile the triage dispatch file.
                  </p>
                </div>
              </div>
            ) : !isLocationOn ? (
              <div className="bg-neutral-950/20 border border-dashed border-neutral-900 rounded-2xl py-12 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center mx-auto text-brand-gold/40 animate-pulse">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <p className="text-sm font-semibold text-brand-warm font-display">Location Authorization Required</p>
                  <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                    To map out veterinarians with exact telemetry coordinates, toggle the <strong>Satellite GPS Linkage (Location On)</strong> switch above to unlock your local 30 km range.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Clinics list inside 30 km range */}
                <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {processedClinics.length > 0 ? (
                    processedClinics.map((clinic) => (
                      <div
                        key={clinic.id}
                        className="p-5 bg-neutral-950/60 border border-neutral-900 rounded-2xl hover:border-brand-gold/30 transition-all duration-300 flex justify-between items-start gap-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-display font-semibold text-brand-warm hover:text-brand-gold transition duration-200">
                              {clinic.name}
                            </h3>
                            {clinic.isEmergency && (
                              <span className="px-2 py-0.5 rounded-md bg-red-950/40 border border-red-900/20 text-[8px] uppercase tracking-wider font-mono text-red-400 font-bold">
                                Emergency
                              </span>
                            )}
                            {clinic.hasOnlineConsult && (
                              <span className="px-2 py-0.5 rounded-md bg-brand-gold/10 border border-brand-gold/20 text-[8px] uppercase tracking-wider font-mono text-brand-gold">
                                Video consult
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {/* Clickable Address Link */}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + " " + clinic.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-neutral-400 hover:text-brand-gold font-sans flex items-center gap-2 transition-all group/link cursor-pointer"
                              title="Click to get directions on Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5 text-neutral-500 group-hover/link:text-brand-gold transition-colors shrink-0" />
                              <span className="underline decoration-dashed decoration-neutral-800 group-hover/link:decoration-brand-gold/60 text-left">
                                {clinic.address}
                              </span>
                            </a>
                            
                            {/* Clickable Phone Call Link */}
                            <a
                              href={`tel:${clinic.phone.replace(/\s+/g, "")}`}
                              className="text-xs text-neutral-400 hover:text-brand-gold font-sans flex items-center gap-2 transition-all group/link cursor-pointer"
                              title="Click to call this veterinary clinic"
                            >
                              <Phone className="w-3.5 h-3.5 text-neutral-500 group-hover/link:text-brand-gold transition-colors shrink-0" />
                              <span className="underline decoration-dashed decoration-neutral-800 group-hover/link:decoration-brand-gold/60 font-mono">
                                {clinic.phone} (Call Now)
                              </span>
                            </a>

                            {/* Clickable Website Link if available */}
                            {clinic.website && (
                              <a
                                href={clinic.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-neutral-400 hover:text-brand-gold font-sans flex items-center gap-2 transition-all group/link cursor-pointer"
                                title="Click to open official clinic website"
                              >
                                <Globe className="w-3.5 h-3.5 text-neutral-500 group-hover/link:text-brand-gold transition-colors shrink-0" />
                                <span className="underline decoration-dashed decoration-neutral-800 group-hover/link:decoration-brand-gold/60 font-mono">
                                  {clinic.website.replace("https://", "")}
                                </span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-sans text-neutral-400 mt-1">
                            {/* TRUE PERIMETER KM DISPLAY */}
                            <span className="text-brand-gold font-mono font-bold bg-brand-gold/5 px-2 py-0.5 rounded border border-brand-gold/10">
                              🚀 {clinic.distanceValue} km away
                            </span>
                            <span className="text-neutral-600">|</span>
                            <span className="flex items-center gap-0.5 text-brand-gold">
                              <Star className="w-3.5 h-3.5 fill-current text-brand-gold" /> {clinic.rating} ({clinic.reviewsCount} reviews)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedClinic(clinic)}
                          className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-brand-gold text-brand-gold text-xs font-semibold tracking-wide transition cursor-pointer shrink-0"
                        >
                          Book Vet
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-neutral-500 font-sans text-xs">
                      No feline hospitals are currently located within 30 km of your coordinates with these active tags.
                    </div>
                  )}
                </div>

                {/* Booking Console / Radar Visualizer */}
                <div className="lg:col-span-5">
                  <AnimatePresence mode="wait">
                    {selectedClinic ? (
                      <motion.div
                        key="booking-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4"
                      >
                        {bookingSuccess ? (
                          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-emerald/15 border border-brand-emerald text-brand-emerald flex items-center justify-center animate-bounce">
                              ✓
                            </div>
                            <p className="text-sm font-semibold text-brand-warm font-display">Triage Appt Scheduled!</p>
                            <p className="text-xs text-neutral-400 font-sans max-w-xs leading-relaxed">
                              Consultation with <strong>{selectedClinic.name}</strong> has been secured for {catName} (Issue: "{catSymptom}"). A specialist team will be prepared.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleBookAppointment} className="space-y-4 text-brand-warm">
                            <div className="pb-3 border-b border-neutral-900 flex justify-between items-center">
                              <p className="text-xs uppercase font-mono tracking-wider text-brand-gold font-bold">
                                Dispatch Care Team
                              </p>
                              <button
                                type="button"
                                onClick={() => setSelectedClinic(null)}
                                className="text-[10px] uppercase font-mono text-neutral-500 hover:text-brand-warm"
                              >
                                Close
                              </button>
                            </div>

                            <div>
                              <p className="text-xs font-semibold font-display text-brand-warm">{selectedClinic.name}</p>
                              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">{selectedClinic.address}</p>
                              <p className="text-[10px] text-brand-gold font-mono mt-1 font-bold">🎯 Precise Distance: {selectedClinic.distanceValue} km away</p>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Appointment Date & Time</label>
                              <input
                                type="datetime-local"
                                required
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-brand-warm focus:outline-none focus:border-brand-gold transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Triage Protocol</label>
                              <select className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-brand-warm focus:outline-none focus:border-brand-gold">
                                <option value="emergency">Critical ER Admission - Symptom Triage</option>
                                <option value="in-clinic">Standard Clinical General Checkup</option>
                                {selectedClinic.hasOnlineConsult && (
                                  <option value="video">Virtual Consultation (FaceTime/Zoom Link)</option>
                                )}
                              </select>
                            </div>

                            {/* Patient Recap banner */}
                            <div className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-850 text-[10px] text-neutral-400 leading-relaxed space-y-1">
                              <p className="font-semibold text-brand-warm uppercase tracking-wider font-mono">Patient File Loaded:</p>
                              <p>&bull; Name: {catName} ({catBreed})</p>
                              <p>&bull; Symptoms: <span className="text-brand-gold">"{catSymptom}"</span></p>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 rounded-xl bg-brand-gold text-brand-matte font-display font-bold text-xs uppercase tracking-wider hover:bg-yellow-500 transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                            >
                              <CalendarCheck className="w-4 h-4" /> CONFIRM CONSULTATION
                            </button>
                          </form>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="interactive-map-mock"
                        className="relative h-80 rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950/60 flex flex-col justify-between p-6"
                      >
                        {/* Visual grid representing metropolis locations */}
                        <div className="absolute inset-0 bg-neutral-950 opacity-40 pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
                        
                        {/* Grid markings mimicking clinics */}
                        <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-brand-gold border border-brand-warm animate-ping" />
                        <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-brand-gold border border-brand-warm" />
                        
                        <div className="absolute top-2/3 right-1/4 w-3 h-3 rounded-full bg-brand-emerald border border-brand-warm animate-ping" />
                        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 rounded-full bg-brand-emerald border border-brand-warm" />

                        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-red-500 border border-brand-warm animate-ping" />
                        <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 rounded-full bg-red-500 border border-brand-warm" />

                        <div className="relative z-10">
                          <span className="px-2.5 py-1 rounded bg-neutral-900 text-[10px] tracking-widest uppercase font-mono text-brand-gold border border-brand-gold/20 font-bold">
                            Live Geographic Radar Active
                          </span>
                        </div>

                        <div className="relative z-10 bg-neutral-900/95 border border-neutral-850 p-4 rounded-xl text-xs space-y-1.5 shadow-lg">
                          <p className="font-semibold text-brand-warm font-display flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-brand-emerald animate-pulse" /> Precision Telemetry Range
                          </p>
                          <p className="text-neutral-500 font-sans leading-relaxed">
                            Geographical coordinates mapped. Highlighted clinics are strictly bounded inside your current <strong className="text-brand-gold">30 km radius</strong>.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Telemedicine & Priority Queuing */}
                  <div className="mt-6 p-5 bg-gradient-to-tr from-brand-gold/5 to-neutral-950 border border-neutral-900 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-4.5 h-4.5 text-brand-gold" />
                      <p className="text-xs uppercase font-mono tracking-wider text-brand-gold font-bold">
                        Priority Telemedicine Consulting
                      </p>
                    </div>
                    
                    {currentPlan === "Pro Plan" ? (
                      <div className="space-y-3">
                        <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                          Your <strong>Royalty Pro</strong> account unlocks immediate, zero-waiting direct video triage consultation with feline certified veterinarians.
                        </p>
                        <div className="p-2 bg-brand-emerald/10 border border-brand-emerald/20 rounded-lg text-[10px] text-brand-emerald font-mono flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
                          <span>Status: Direct Priority Queue Unlocked (0 min wait)</span>
                        </div>
                        <button
                          onClick={() => alert("Direct encrypted link initialized! Under production, this launches a high-fidelity video consult channel with a certified feline veterinarian.")}
                          className="w-full py-2 bg-brand-gold text-brand-matte rounded-xl text-xs font-display font-bold uppercase tracking-wider hover:bg-yellow-500 transition cursor-pointer"
                        >
                          Connect with Vet Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                          Standard online consultation has an average queue wait time of <strong>45 minutes</strong>. Upgrade to <strong>Pro Plan</strong> for instant priority routing.
                        </p>
                        <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded-lg text-[10px] text-neutral-400 font-mono flex items-center justify-between">
                          <span>Current Queue Wait:</span>
                          <span className="text-brand-gold font-bold">45 Mins</span>
                        </div>
                        <button
                          onClick={() => onSelectTab("pricing")}
                          className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-brand-gold rounded-xl text-xs font-display font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" /> Jump to Priority Queue
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* CAT EMERGENCY HELPLINE PORTION WITH COUNTRY DETECTOR */}
      {activeTab === "helpline" && (
        <div className="space-y-6">
          <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-display font-semibold text-red-400 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 animate-pulse" /> Critical Emergency Cat Helpline Directory
              </h3>
              <p className="text-xs text-neutral-400 max-w-xl">
                Immediate 24-hour response hotlines, pet poison guidance, feline trauma ambulances, and rescue services sorted by region.
              </p>
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-850">
              <Globe className="w-4 h-4 text-brand-gold" />
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="bg-transparent border-none text-xs text-brand-warm focus:outline-none cursor-pointer font-sans"
              >
                {emergencyHelplines.map(h => (
                  <option key={h.countryCode} value={h.countryCode} className="bg-neutral-950 text-brand-warm">
                    {h.countryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Helpline Contact Card */}
            <div className="lg:col-span-7 bg-neutral-950/60 border border-neutral-900 p-6 rounded-2xl space-y-6">
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-gold">
                  PRIMARY ACCREDITED EMERGENCY CONTACT ({activeHelpline.countryCode})
                </p>
                <h4 className="text-lg font-display font-bold text-brand-warm">
                  {activeHelpline.helplineName}
                </h4>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  {activeHelpline.description}
                </p>
              </div>

              {/* Central Direct Call button */}
              <div className="p-4 bg-red-950/20 border border-red-500/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-[10px] font-mono text-neutral-400">EMERGENCY PHONE LINE</p>
                  <p className="text-xl font-mono font-bold text-red-400">{activeHelpline.phone}</p>
                </div>
                <a
                  href={`tel:${activeHelpline.phone}`}
                  className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-brand-warm text-xs font-display font-bold uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> DIAL DISPATCH INSTANTLY
                </a>
              </div>

              {/* Secondary helpline if present */}
              {activeHelpline.secondaryPhone && (
                <div className="border-t border-neutral-900 pt-5 space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    SECONDARY / LOCAL EMERGENCY BACKUP LINE
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-950 rounded-xl border border-neutral-850">
                    <div>
                      <p className="text-xs font-semibold text-brand-warm font-sans">{activeHelpline.secondaryName}</p>
                      <p className="text-xs font-mono text-brand-gold mt-0.5">{activeHelpline.secondaryPhone}</p>
                    </div>
                    <a
                      href={`tel:${activeHelpline.secondaryPhone}`}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-brand-warm text-[10px] font-mono font-semibold tracking-wide transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-500" /> Dial Backup
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick First-Aid Protocol Cards (Saves lives) */}
            <div className="lg:col-span-5 bg-neutral-950/40 border border-neutral-900 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-brand-gold font-bold">
                🆘 Critical Poison & Trauma Guide
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                If your cat is showing immediate medical trauma:
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 text-xs">
                  <p className="font-semibold text-brand-warm font-display">1. Check for Toxicity</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    If your feline ingested lilies, onions, chocolate, or pain relievers, immediately call ASPCA / Poison Control before attempting to induce vomiting.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 text-xs">
                  <p className="font-semibold text-brand-warm font-display">2. Starlight Bleeding Control</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    Apply firm, gentle direct pressure using clean sterile gauze. Avoid tourniquets unless directed by a licensed surgeon.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 text-xs">
                  <p className="font-semibold text-brand-warm font-display">3. Safe Transportation</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    Wrap your feline companion in a thick warm towel to restrict movement and prevent secondary shocks while on route to the ER.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-brand-gold/5 border border-brand-gold/10 rounded-xl text-[10px] text-neutral-500 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-brand-gold shrink-0" />
                <span>
                  Always communicate diagnostic details (Cat Age, Breed, symptoms) compiled in the Step 1 card to the dispatch operators.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
