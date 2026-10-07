import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, BIKE_TYPES, Vehicle } from '../data/mockData';
import { Search, Filter, Gauge, Fuel, Settings, ShieldCheck, X, ArrowUpDown, Bike, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { SmartImage, VEHICLE_PLACEHOLDER_FALLBACK } from '../components/SmartImage';
import { Helmet } from 'react-helmet-async';

const FILTERS_STORAGE_KEY = 'pm_bike_filters';

export default function Inventory() {
  const { vehicles, loading } = useVehicles();

  const BUDGET_OPTIONS = [
    300000,   // Under 3 Lakh
    500000,   // Under 5 Lakh
    800000,   // Under 8 Lakh
    1200000,  // Under 12 Lakh
    1600000,  // Under 16 Lakh
    2000000,  // Under 20 Lakh
    3000000,  // Under 30 Lakh
    100000000 // Any Budget
  ];

  // Retrieve saved filters if any
  const getSavedFilters = () => {
    try {
      const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const initialFilters = getSavedFilters();

  const [searchTerm, setSearchTerm] = useState<string>(initialFilters?.searchTerm ?? '');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialFilters?.selectedBrand ?? 'All Brands');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters?.selectedCategory ?? 'All Categories');
  const [budgetIndex, setBudgetIndex] = useState<number>(initialFilters?.budgetIndex ?? (BUDGET_OPTIONS.length - 1));
  const [minYear, setMinYear] = useState<number | null>(initialFilters?.minYear ?? null);
  const [ccRange, setCcRange] = useState<string>(initialFilters?.ccRange ?? 'All CC');
  const [sortBy, setSortBy] = useState<string>(initialFilters?.sortBy ?? 'featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // CRITICAL REQUIREMENT (Section 8, 10, 15):
  // Strictly filter bikes so ONLY status === 'Available' appear publicly!
  // Any bike with status 'Sold', 'Draft', 'Reserved', 'Archived', or 'Deleted'
  // is completely excluded from active customer browsing.
  const availableBikes = useMemo(() => {
    return vehicles.filter(bike => !bike.deleted && bike.status === 'Available');
  }, [vehicles]);

  // Dynamically extract available brands from the database
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    availableBikes.forEach(b => {
      if (b.make && b.make.trim()) {
        brands.add(b.make.trim());
      }
    });
    return Array.from(brands).sort();
  }, [availableBikes]);

  // Persist filter criteria in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
        searchTerm,
        selectedBrand,
        selectedCategory,
        budgetIndex,
        minYear,
        ccRange,
        sortBy
      }));
    } catch {}
  }, [searchTerm, selectedBrand, selectedCategory, budgetIndex, minYear, ccRange, sortBy]);

  // Filtered & Sorted bikes
  const filteredBikes = useMemo(() => {
    let result = [...availableBikes];

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(b => 
        b.make.toLowerCase().includes(q) ||
        b.model.toLowerCase().includes(q) ||
        (b.variant && b.variant.toLowerCase().includes(q)) ||
        (b.bodyType && b.bodyType.toLowerCase().includes(q)) ||
        (b.engine && b.engine.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (selectedBrand !== 'All Brands') {
      result = result.filter(b => b.make.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Category / Body type filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter(b => b.bodyType?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Budget filter
    if (budgetIndex < BUDGET_OPTIONS.length - 1) {
      const maxBudget = BUDGET_OPTIONS[budgetIndex];
      result = result.filter(b => b.price <= maxBudget);
    }

    // Min Year filter
    if (minYear !== null) {
      result = result.filter(b => Number(b.year) >= minYear);
    }

    // Engine CC filter
    if (ccRange !== 'All CC') {
      result = result.filter(b => {
        const cc = b.engineCC || (b.engine ? parseInt(b.engine.replace(/\D/g, ''), 10) : 0);
        if (!cc) return true;
        if (ccRange === 'under-400') return cc < 400;
        if (ccRange === '400-750') return cc >= 400 && cc <= 750;
        if (ccRange === '750-1000') return cc > 750 && cc <= 1000;
        if (ccRange === '1000-plus') return cc > 1000;
        return true;
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'mileage') {
      result.sort((a, b) => a.mileage - b.mileage);
    } else if (sortBy === 'year-newest') {
      result.sort((a, b) => Number(b.year) - Number(a.year));
    }

    return result;
  }, [availableBikes, searchTerm, selectedBrand, selectedCategory, budgetIndex, minYear, ccRange, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('All Brands');
    setSelectedCategory('All Categories');
    setBudgetIndex(BUDGET_OPTIONS.length - 1);
    setMinYear(null);
    setCcRange('All CC');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12 font-sans text-zinc-300 relative z-10">
      <Helmet>
        <title>Browse Pre-Owned Bikes in Mumbai | Patel Motors</title>
        <meta name="description" content="Browse verified premium pre-owned motorcycles in Mumbai at Patel Motors. 50-point inspected bikes, transparent pricing, and instant delivery." />
      </Helmet>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-orange-400 font-bold mb-1.5">
              <span>Showroom Catalog</span>
              <span>•</span>
              <span>{filteredBikes.length} Verified Bikes Available</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-cinzel font-bold text-white uppercase tracking-tight">
              Pre-Owned Motorcycles
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1.5 max-w-2xl">
              Every motorcycle in our showroom is physically verified, compression-tested, and cleared for instant RTO transfer across Mumbai and Maharashtra.
            </p>
          </div>

          {/* Quick Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden px-4 py-2.5 bg-zinc-900 border border-white/15 text-white rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center bg-zinc-900/80 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer uppercase text-[11px]"
              >
                <option value="featured" className="bg-zinc-950 text-white">Sort: Featured</option>
                <option value="price-low" className="bg-zinc-950 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-zinc-950 text-white">Price: High to Low</option>
                <option value="year-newest" className="bg-zinc-950 text-white">Year: Newest</option>
                <option value="mileage" className="bg-zinc-950 text-white">Mileage: Lowest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Bike Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* DESKTOP / MOBILE SIDEBAR FILTERS */}
          <aside className={`lg:block ${isMobileFiltersOpen ? 'fixed inset-0 z-50 bg-black/95 p-6 overflow-y-auto' : 'hidden'}`}>
            <div className="space-y-6 bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2 text-white font-mono font-bold text-xs uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-orange-400" />
                  <span>Filter Inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetFilters} 
                    className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white underline"
                  >
                    Reset
                  </button>
                  {isMobileFiltersOpen && (
                    <button 
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="lg:hidden p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Keyword */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400">Search Models</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search brand, model, spec..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-white font-sans"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400">Brand / Make</label>
                <select
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                >
                  <option>All Brands</option>
                  {availableBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Category / Body Type */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400">Motorcycle Type</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                >
                  <option>All Categories</option>
                  {BIKE_TYPES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  <span>Max Budget</span>
                  <span className="text-orange-400 font-bold">
                    {budgetIndex === BUDGET_OPTIONS.length - 1 ? 'Any Price' : formatPrice(BUDGET_OPTIONS[budgetIndex])}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={BUDGET_OPTIONS.length - 1}
                  step={1}
                  value={budgetIndex}
                  onChange={e => setBudgetIndex(Number(e.target.value))}
                  className="w-full accent-orange-400 cursor-pointer"
                />
              </div>

              {/* Engine Displacement (CC) */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400">Engine Displacement</label>
                <select
                  value={ccRange}
                  onChange={e => setCcRange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                >
                  <option value="All CC">All Displacements</option>
                  <option value="under-400">Below 400 cc</option>
                  <option value="400-750">400 cc - 750 cc</option>
                  <option value="750-1000">750 cc - 1000 cc</option>
                  <option value="1000-plus">1000 cc+ (Open Class)</option>
                </select>
              </div>

              {/* Registration Year */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400">Minimum Model Year</label>
                <select
                  value={minYear || ''}
                  onChange={e => setMinYear(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                >
                  <option value="">Any Year</option>
                  <option value="2024">2024 or Newer</option>
                  <option value="2023">2023 or Newer</option>
                  <option value="2022">2022 or Newer</option>
                  <option value="2021">2021 or Newer</option>
                  <option value="2020">2020 or Newer</option>
                </select>
              </div>

              {/* Apply / Close for Mobile */}
              {isMobileFiltersOpen && (
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 bg-orange-500 text-black font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg mt-4"
                >
                  View {filteredBikes.length} Bikes
                </button>
              )}
            </div>
          </aside>

          {/* MOTORCYCLE CARDS GRID */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="p-16 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
                Loading Patel Motors Inventory...
              </div>
            ) : filteredBikes.length === 0 ? (
              <div className="frost-card p-12 text-center rounded-2xl border border-white/10 space-y-4">
                <Bike className="w-12 h-12 text-zinc-500 mx-auto" />
                <h3 className="text-xl font-serif font-bold text-white uppercase tracking-wider">
                  No Matching Motorcycles
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  We currently have no available bikes matching your selected filter criteria. Try resetting filters or request a custom motorcycle search.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBikes.map(bike => (
                  <div
                    key={bike.id}
                    className="group bg-[#0e0e12]/90 border border-white/10 hover:border-orange-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    <div>
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/80 mb-3.5">
                        <SmartImage
                          src={bike.images?.[0] || ""}
                          fallbackSrc={VEHICLE_PLACEHOLDER_FALLBACK}
                          alt={`${bike.make} ${bike.model}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Year Badge */}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono font-bold rounded-lg">
                          {bike.year}
                        </div>
                        {/* Body Type Badge */}
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-400 text-[9.5px] font-mono font-bold uppercase tracking-wider rounded-lg">
                          {bike.bodyType || 'Motorcycle'}
                        </div>
                      </div>

                      {/* Title & Variant */}
                      <h3 className="text-lg font-sans tracking-tight text-white mb-0.5">
                        <span className="font-extrabold">{bike.make}</span>{" "}
                        <span className="font-normal text-zinc-200">{bike.model}</span>
                      </h3>
                      <p className="text-[10.5px] font-mono uppercase tracking-widest text-zinc-400 mb-3 truncate">
                        {bike.variant || "Standard Spec"}
                      </p>

                      {/* Selling Price */}
                      <div className="flex items-center gap-2 mb-3.5">
                        <span className="w-1.5 h-4.5 bg-orange-500 rounded-full inline-block shrink-0"></span>
                        <span className="text-xl font-bold font-sans text-white tracking-tight">
                          {formatPrice(bike.price)}
                        </span>
                      </div>

                      {/* 2x2 Specs Grid */}
                      <div className="grid grid-cols-2 gap-y-2 gap-x-3 py-2.5 border-t border-white/10 text-zinc-300 text-xs font-sans">
                        <div className="flex items-center gap-2 truncate">
                          <Gauge className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.mileage.toLocaleString('en-IN')} KM</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.engine || (bike.engineCC ? `${bike.engineCC} cc` : 'Standard')}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <Fuel className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.ownership}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Link */}
                    <Link
                      to={`/inventory/${bike.id}`}
                      className="mt-4 w-full py-2.5 border border-white/15 hover:border-orange-400 hover:bg-orange-500 hover:text-black rounded-xl text-center text-xs uppercase tracking-widest font-bold text-zinc-200 transition-all font-mono block"
                    >
                      View Bike Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
