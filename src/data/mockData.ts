export type BikeType = 'Superbike' | 'Cruiser' | 'Adventure' | 'Street / Naked' | 'Sports' | 'Cafe Racer' | 'Tourer' | 'Commuter';

export const BIKE_TYPES: BikeType[] = ['Superbike', 'Cruiser', 'Adventure', 'Street / Naked', 'Sports', 'Cafe Racer', 'Tourer', 'Commuter'];
export const BODY_TYPES = BIKE_TYPES;
export type BodyType = BikeType;

export type VehicleStatus = 'Draft' | 'Available' | 'Reserved' | 'Sold' | 'Archived' | 'Booked' | 'Deleted';

export interface SaleRecord {
  invoiceNumber: string;
  saleDate: string;
  deliveryTime?: string;
  salePrice: number;
  taxAmount?: number;
  rtoCharges?: number;
  discount?: number;
  finalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerIdentity?: string;
  customerGst?: string;
  paymentMethod: 'Bank Transfer (NEFT/RTGS)' | 'UPI' | 'Cheque' | 'Cash' | 'Card' | 'Finance / Loan';
  paymentStatus: 'Paid in Full' | 'Partial / Token' | 'Pending';
  paymentRef?: string;
  hypothecation?: string;
  insuranceCompany?: string;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
}

export type Vehicle = {
  id: string;
  make: string; // Brand e.g. Kawasaki, Royal Enfield, BMW, Triumph
  model: string;
  variant?: string;
  year: number; // Manufacturing Year
  registrationYear?: number;
  registration?: string; // Registration Number
  price: number; // Selling Price (INR)
  purchasePrice?: number; // Cost of Acquisition (Dealer only)
  mileage: number; // Kilometers Driven
  fuelType: 'Petrol' | 'Electric' | string;
  transmission: 'Manual' | 'Automatic' | 'Quickshifter' | string;
  bodyType?: string; // Motorcycle Category
  engine?: string; // Engine specification e.g. "998 cc Inline-4"
  engineCC?: number; // Numeric CC e.g. 998
  color: string;
  ownership: string; // 1st Owner, 2nd Owner, etc.
  insuranceStatus?: string; // Comprehensive, Third Party, Expired, Valid till 2027
  rcStatus?: string; // Valid, Clear RTO Mumbai, NOC Available
  serviceHistory?: string; // Complete Authorized Service Records, Verified
  condition?: string; // Showroom Condition, Mint, Excellent, Good
  location?: string; // Mumbai, Bandra, Andheri, Mulund, Thane
  chassisNumber?: string;
  engineNumber?: string;
  images: string[];
  features: string[];
  status: VehicleStatus;
  featured?: boolean;
  description?: string;
  instagramReel?: string;
  inspectionNotes?: string;
  updatedAt?: number;
  deleted?: boolean;
  saleInfo?: SaleRecord;
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "kawasaki_zx10r_2023",
    make: "Kawasaki",
    model: "Ninja ZX-10R",
    variant: "KRT Edition ABS",
    year: 2023,
    registrationYear: 2023,
    price: 1580000,
    purchasePrice: 1420000,
    mileage: 5800,
    fuelType: "Petrol",
    transmission: "Quickshifter (6-Speed)",
    bodyType: "Superbike",
    engine: "998 cc Liquid-Cooled Inline-4 (203 HP)",
    engineCC: 998,
    color: "Lime Green / Ebony",
    ownership: "1st Owner",
    registration: "MH-02-FE-1000",
    insuranceStatus: "Comprehensive (Valid till Nov 2027)",
    rcStatus: "Valid (Andheri RTO)",
    serviceHistory: "Complete Kawasaki Mumbai Center Records",
    condition: "Mint / Showroom Condition",
    location: "Mumbai",
    chassisNumber: "JKAZX1000PA089211",
    engineNumber: "ZXT00NE091823",
    images: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200"
    ],
    features: [
      "Brembo M50 Monobloc Calipers",
      "Showa Balance Free Front Fork (BFF)",
      "Kawasaki Cornering Management Function (KCMF)",
      "Launch Control Mode (KLCM)",
      "Electronic Cruise Control",
      "TFT Full-Colour Instrumentation with Smartphone Connectivity"
    ],
    status: "Available",
    featured: true,
    description: "Pristine condition Kawasaki Ninja ZX-10R KRT Edition. Regularly serviced at authorized Kawasaki Mumbai. Complete paint protection film (PPF) applied since delivery. Zero track abuse, flawless mechanical health.",
    inspectionNotes: "50-point inspection passed with 100% score. Brake pads 85% remaining, Pirelli Diablo Supercorsa tyres in superb shape, chain-sprocket inspected.",
    updatedAt: Date.now(),
    deleted: false
  },
  {
    id: "bmw_r1250gs_adv_2022",
    make: "BMW",
    model: "R 1250 GS",
    variant: "Adventure Triple Black",
    year: 2022,
    registrationYear: 2022,
    price: 1950000,
    purchasePrice: 1780000,
    mileage: 14200,
    fuelType: "Petrol",
    transmission: "Manual (6-Speed with Shift Assist Pro)",
    bodyType: "Adventure",
    engine: "1254 cc Boxer Twin ShiftCam (136 HP)",
    engineCC: 1254,
    color: "Triple Black Metallic",
    ownership: "1st Owner",
    registration: "MH-01-DK-1250",
    insuranceStatus: "Comprehensive (Zero Dep till Aug 2027)",
    rcStatus: "Valid (Tardeo RTO)",
    serviceHistory: "Full BMW Motorrad Mumbai Records",
    condition: "Showroom Condition",
    location: "Mumbai",
    chassisNumber: "WB10M0106NZ948172",
    engineNumber: "122EN39108192",
    images: [
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1200"
    ],
    features: [
      "Dynamic ESA Electronic Suspension",
      "Full Touratech Pannier Set & Top Box",
      "Adaptive LED Headlight",
      "Riding Modes Pro (Dynamic, Enduro Pro)",
      "Heated Grips & Cruise Control",
      "Keyless Ride System"
    ],
    status: "Available",
    featured: true,
    description: "The definitive globetrotter. Meticulously maintained BMW R 1250 GS Adventure in striking Triple Black. Equipped with high-spec touring accessories, crash bars, auxiliary fog lamps, and aluminum luggage.",
    inspectionNotes: "Complete shaft-drive service performed. Boxer cylinder heads sealed, battery health 100%, front & rear ABS calibration verified.",
    updatedAt: Date.now(),
    deleted: false
  },
  {
    id: "re_continental_gt650_2023",
    make: "Royal Enfield",
    model: "Continental GT 650",
    variant: "Mr Clean Chrome Custom",
    year: 2023,
    registrationYear: 2023,
    price: 345000,
    purchasePrice: 295000,
    mileage: 4100,
    fuelType: "Petrol",
    transmission: "Manual (6-Speed with Slipper Clutch)",
    bodyType: "Cafe Racer",
    engine: "648 cc Parallel Twin (47 HP)",
    engineCC: 648,
    color: "Mr Clean Polished Chrome",
    ownership: "1st Owner",
    registration: "MH-03-EB-0650",
    insuranceStatus: "Valid till May 2028 (Third Party + Own Damage)",
    rcStatus: "Valid (Wadala RTO)",
    serviceHistory: "Authorized Royal Enfield Company Workshop",
    condition: "Showroom Mint",
    location: "Mumbai",
    chassisNumber: "ME3GT650NP029184",
    engineNumber: "GT650EN019481",
    images: [
      "https://images.unsplash.com/photo-1558981420-87aa9210d993?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558981826-79a5c244249a?auto=format&fit=crop&q=80&w=1200"
    ],
    features: [
      "ByBre Dual-Channel ABS Brakes",
      "Pirelli Phantom Sportscomp Tyres",
      "Single Touring Cowl Seat + Pillion Seat",
      "Bar End CNC Mirrors",
      "Twin Exhaust with Stainless Steel Headers",
      "Sump Guard Engine Protector"
    ],
    status: "Available",
    featured: true,
    description: "A head-turning modern classic. Mr Clean flagship chrome tank with zero scratches or swirls. Low dry mileage on Western Express Highway. A rare, immaculate twin-cylinder motorcycle ready for weekend cafe runs.",
    inspectionNotes: "Zero oil weeping, clutch play aligned to factory spec, valve clearances checked, brand new battery.",
    updatedAt: Date.now(),
    deleted: false
  },
  {
    id: "triumph_street_triple_rs_2022",
    make: "Triumph",
    model: "Street Triple",
    variant: "RS 765",
    year: 2022,
    registrationYear: 2022,
    price: 980000,
    purchasePrice: 870000,
    mileage: 8600,
    fuelType: "Petrol",
    transmission: "Quickshifter (Triumph Shift Assist)",
    bodyType: "Street / Naked",
    engine: "765 cc Liquid-Cooled Inline-3 (121 HP)",
    engineCC: 765,
    color: "Matt Silver Ice with Diablo Red accents",
    ownership: "1st Owner",
    registration: "MH-04-LA-0765",
    insuranceStatus: "Comprehensive (Valid till Oct 2027)",
    rcStatus: "Valid (Thane RTO)",
    serviceHistory: "Triumph Shaman Mumbai Service Records",
    condition: "Excellent",
    location: "Mumbai",
    chassisNumber: "SMT765RS00NK41829",
    engineNumber: "TR765E910284",
    images: [
      "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200"
    ],
    features: [
      "Öhlins STX40 Fully Adjustable Rear Monoshock",
      "Showa 41mm BPF Big Piston Front Forks",
      "Brembo Stylema 4-Piston Radial Monobloc Calipers",
      "Full Colour 5-inch TFT Display",
      "5 Riding Modes including Track",
      "Carbon Fiber Exhaust End Cap"
    ],
    status: "Available",
    featured: false,
    description: "The ultimate middleweight naked streetfighter. The Moto2-derived 765cc triple engine produces exhilarating punch with signature acoustic howl. Owned by an avid motorcycle enthusiast with zero drops or accidents.",
    inspectionNotes: "Braking fluid flushed recently. Tyres have 70% life, swingarm and headstock bearings tight and smooth.",
    updatedAt: Date.now(),
    deleted: false
  },
  {
    id: "ducati_monster_937_2022",
    make: "Ducati",
    model: "Monster",
    variant: "937 Red",
    year: 2022,
    registrationYear: 2022,
    price: 1120000,
    purchasePrice: 990000,
    mileage: 6200,
    fuelType: "Petrol",
    transmission: "Quickshifter (Ducati Quick Shift Up/Down)",
    bodyType: "Street / Naked",
    engine: "937 cc Testastretta 11° V-Twin (111 HP)",
    engineCC: 937,
    color: "Ducati Red",
    ownership: "1st Owner",
    registration: "MH-47-AP-0937",
    insuranceStatus: "Comprehensive (Valid till July 2027)",
    rcStatus: "Valid (Borivali RTO)",
    serviceHistory: "Ducati Mumbai Bandra Showroom",
    condition: "Showroom Condition",
    location: "Mumbai",
    chassisNumber: "ZDM937MN00891823",
    engineNumber: "937VA019842",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&q=80&w=1200"
    ],
    features: [
      "Cornering ABS & Ducati Traction Control (DTC)",
      "Ducati Wheelie Control (DWC)",
      "4.3-inch Full Color TFT Screen",
      "Brembo M4.32 Monobloc Radial Calipers",
      "LED Projector Headlight with DRL",
      "Lightweight Aluminum Front Subframe"
    ],
    status: "Available",
    featured: false,
    description: "Pure Italian thrill. Extremely agile, lightweight chassis matched with the torque-rich Testastretta twin. Always parked under covered garage with trickle charger connected. Clean Mumbai registration.",
    inspectionNotes: "Desmo service timeline verified. Chain tension adjusted, electronic IMU recalibrated, zero faults detected.",
    updatedAt: Date.now(),
    deleted: false
  },
  {
    id: "harley_iron883_2021",
    make: "Harley-Davidson",
    model: "Sportster Iron 883",
    variant: "Dark Custom ABS",
    year: 2021,
    registrationYear: 2021,
    price: 790000,
    purchasePrice: 680000,
    mileage: 11500,
    fuelType: "Petrol",
    transmission: "Manual (5-Speed Belt Drive)",
    bodyType: "Cruiser",
    engine: "883 cc Air-Cooled Evolution V-Twin (51 HP)",
    engineCC: 883,
    color: "River Rock Gray Denim (Matte)",
    ownership: "1st Owner",
    registration: "MH-01-EE-8830",
    insuranceStatus: "Valid (Zero Dep till Dec 2026)",
    rcStatus: "Valid (Mumbai Central RTO)",
    serviceHistory: "Seven Islands Harley-Davidson Mumbai Records",
    condition: "Mint",
    location: "Mumbai",
    chassisNumber: "1HD4CR218MB419281",
    engineNumber: "CR2M0194821",
    images: [
      "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558981420-87aa9210d993?auto=format&fit=crop&q=80&w=1200"
    ],
    features: [
      "Vance & Hines Shortshots Staggered Exhaust",
      "Screamin' Eagle High-Flow Air Cleaner",
      "Drag-Style Handlebars & Forward Controls",
      "Solo Tuck and Roll Leather Seat",
      "Dual-Channel ABS Braking",
      "Keyless Smart Security Fob"
    ],
    status: "Available",
    featured: false,
    description: "An authentic American icon with the authentic V-Twin rumble. Finished in factory River Rock Gray Denim matte coat. Comes with Screamin' Eagle stage 1 tune and Vance & Hines pipes.",
    inspectionNotes: "Belt drive inspected with zero cracks or wear. Primary fluid and engine oil replaced with genuine HD Screamin' Eagle synth.",
    updatedAt: Date.now(),
    deleted: false
  }
];

export const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Arjun Singhania",
    rating: 5,
    text: "Purchased a pre-owned 2022 Kawasaki Ninja ZX-10R from Patel Motors Mumbai. The bike was mechanically spotless with verified service history from day one. Patel Motors completed the Andheri RTO transfer in just 5 days without any stress.",
    date: "Bandra West, Mumbai • 2 weeks ago"
  },
  {
    id: 2,
    name: "Rohan & Sanjana Mehta",
    rating: 5,
    text: "Found an immaculate Royal Enfield Continental GT 650 Chrome here. The 50-point inspection report was shown upfront, including compression test and tyre wear. Transparent pricing with zero hidden dealer cuts. Patel Motors is Mumbai's finest used bike dealership!",
    date: "Powai, Mumbai • 1 month ago"
  },
  {
    id: 3,
    name: "Aditya Deshmukh",
    rating: 5,
    text: "Upgraded to a BMW R 1250 GS Adventure through Patel Motors. They evaluated my older Duke 390 exchange fairly and arranged quick finance with HDFC Bank. Honest guidance and true motorcycle passion.",
    date: "Thane West • 3 weeks ago"
  },
  {
    id: 4,
    name: "Vikramaditya Rao",
    rating: 5,
    text: "Sold my Triumph Street Triple to Patel Motors. Spot valuation, instant IMPS payment, and immediate agreement copy before taking delivery. Transparent and professional bike dealers in Mumbai.",
    date: "Worli, Mumbai • 1 month ago"
  }
];

export const MOCK_LEADS = [
  { id: 'l1', name: 'Kabir Varma', phone: '9820192837', email: 'kabir@example.com', car: 'Kawasaki Ninja ZX-10R', status: 'New Lead', date: '2026-09-28' },
  { id: 'l2', name: 'Tanya Joshi', phone: '9819283746', email: 'tanya@example.com', car: 'Royal Enfield Continental GT 650', status: 'Contacted', date: '2026-09-25' },
  { id: 'l3', name: 'Farhan Merchant', phone: '9821837465', email: 'farhan@example.com', car: 'BMW R 1250 GS', status: 'Negotiating', date: '2026-09-22' }
];

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};
