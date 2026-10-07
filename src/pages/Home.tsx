import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, ShieldCheck, Gauge, Fuel, Settings, ArrowRight, DollarSign, RefreshCw, Award, Banknote, Bike } from 'lucide-react';
import { formatPrice, MOCK_REVIEWS } from '../data/mockData';
import { useVehicles } from '../context/VehicleContext';
import { Helmet } from 'react-helmet-async';
import { SmartImage, VEHICLE_PLACEHOLDER_FALLBACK } from '../components/SmartImage';

export default function Home() {
  const { vehicles, siteConfig } = useVehicles();
  
  // Critical: Only bikes with status === 'Available' and not deleted should appear in public customer inventory!
  const featuredBikes = useMemo(() => {
    const available = vehicles.filter(v => 
      !v.deleted && 
      v.status === 'Available'
    );
    // 1. Bikes explicitly flagged as featured
    const flagged = available.filter(v => (v as any).featured === true || (v as any).is_featured === true);
    if (flagged.length > 0) {
      return flagged.slice(0, 6);
    }
    return available.slice(0, 6);
  }, [vehicles]);

  const defaultDesc = "Buy and sell premium pre-owned bikes in Mumbai with Patel Motors. Trusted inspections, transparent pricing and quality motorcycles.";

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-zinc-200 font-sans">
      <Helmet>
        <title>Patel Motors | Premium Pre-Owned Bikes Mumbai</title>
        <meta name="description" content={defaultDesc} />
        <meta property="og:title" content="Patel Motors | Premium Pre-Owned Bikes Mumbai" />
        <meta property="og:description" content={defaultDesc} />
        <meta property="og:image" content={siteConfig.homeHeroImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Clean Hero Section - Open Canvas For Custom Background Banner */}
      <section className="relative min-h-[calc(100vh-58px)] sm:min-h-[80vh] md:min-h-[85vh] flex flex-col justify-center sm:justify-end items-center pt-28 sm:pt-0 pb-10 sm:pb-16 px-4 sm:px-6 md:px-12 text-center z-20">
        <h1 className="sr-only">Patel Motors - Premium Pre-Owned Bikes Mumbai</h1>

        {/* Direct Action Buttons: on mobile stacked one below the other, small and compact, in little below centre position */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Link 
            to="/inventory" 
            className="w-36 sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-bold tracking-wider uppercase text-[11px] sm:text-xs rounded-full transition-all duration-300 shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>Buy Bike</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link 
            to="/sell" 
            className="w-36 sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-black/65 border border-white/30 hover:border-white text-white font-sans font-bold tracking-wider uppercase text-[11px] sm:text-xs rounded-full backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black active:scale-95 shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>Sell Bike</span>
          </Link>
        </div>
      </section>

      {/* Main Content Area - 10% background image visible upon scrolling */}
      <div className="relative z-20 bg-[#070709]/90 backdrop-blur-[2px] border-t border-white/10 shadow-[0_-20px_50px_rgba(7,7,9,0.95)]">
        
        {/* 1. FEATURED MOTORCYCLES (Strictly status === 'Available', first after hero section) */}
        {featuredBikes.length > 0 && (
          <section className="py-10 sm:py-16 border-b border-white/10">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-10">
                <div>
                  <span className="text-orange-400 font-mono tracking-[0.25em] uppercase text-[10px] sm:text-xs font-bold mb-1 block">
                    Verified Inventory
                  </span>
                  <h2 className="text-xl sm:text-3xl font-cinzel font-bold text-white uppercase tracking-wider">
                    Featured Motorcycles
                  </h2>
                </div>
                <Link 
                  to="/inventory" 
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase font-mono font-bold tracking-wider text-zinc-300 hover:text-white transition-colors group"
                >
                  <span>All Bikes ({vehicles.filter(v => !v.deleted && v.status === 'Available').length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Bike Grid - Compact cards on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {featuredBikes.map((bike) => (
                  <div 
                    key={bike.id} 
                    className="group relative bg-[#0e0e12]/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between hover:border-orange-500/40 transition-all duration-300 shadow-xl"
                  >
                    {/* Top Image Container */}
                    <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-black/80 mb-3">
                      <SmartImage 
                        src={bike.images?.[0] || ""} 
                        fallbackSrc={VEHICLE_PLACEHOLDER_FALLBACK}
                        alt={`${bike.make} ${bike.model}`}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" 
                      />
                      
                      {/* Year Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-mono font-bold rounded-md tracking-wider">
                        {bike.year}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-400 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                        {bike.bodyType || 'Motorcycle'}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col flex-grow justify-between">
                      <div>
                        {/* Title: Make (Bold) Model (Normal) */}
                        <h3 className="text-sm sm:text-base font-sans tracking-tight text-white mb-0.5 truncate">
                          <span className="font-extrabold">{bike.make}</span>{" "}
                          <span className="font-normal text-zinc-200">{bike.model}</span>
                        </h3>

                        {/* Variant / Subtitle */}
                        <p className="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 truncate">
                          {bike.variant || "PREMIUM SPEC"}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="w-1 h-3.5 bg-orange-500 rounded-full inline-block shrink-0"></span>
                          <span className="text-base sm:text-lg font-bold font-sans text-orange-400 tracking-tight">
                            {formatPrice(bike.price)}
                          </span>
                        </div>
                      </div>

                      {/* 2x2 Specs Grid */}
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 py-2 border-t border-white/10 text-zinc-300 text-[10px] sm:text-[11px] font-sans">
                        <div className="flex items-center gap-1.5 truncate">
                          <Gauge className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.mileage.toLocaleString('en-IN')} KM</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Settings className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.engine || (bike.engineCC ? `${bike.engineCC} cc` : 'Standard')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Fuel className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <ShieldCheck className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.ownership}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Link 
                        to={`/inventory/${bike.id}`}
                        className="mt-2.5 w-full py-2 sm:py-2.5 border border-white/15 hover:border-orange-400 hover:bg-orange-500 hover:text-black rounded-lg sm:rounded-xl text-center text-[10.5px] sm:text-xs uppercase tracking-wider font-bold text-zinc-200 transition-all block font-mono"
                      >
                        View Bike Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. SERVICES SECTION - Compact responsive grid, no repetitive filler */}
        <section className="py-10 sm:py-16 border-b border-white/10 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-zinc-400 font-mono tracking-[0.25em] uppercase text-[10px] sm:text-xs font-bold mb-1.5 block">
                Showroom Services
              </span>
              <h2 className="text-xl sm:text-3xl font-cinzel font-bold text-white uppercase tracking-wider">
                Our Motorcycle Services
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-5">
              {/* 1. Buy Bikes */}
              <div className="frost-card p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
                    <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
                    Buy Bikes
                  </h3>
                  <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                    Verified condition superbikes, cruisers, and tourers with transparent title.
                  </p>
                </div>
                <Link to="/inventory" className="mt-2.5 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Browse</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Link>
              </div>

              {/* 2. Sell Bikes */}
              <div className="frost-card p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
                    Sell Bikes
                  </h3>
                  <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                    Top market valuation, spot physical inspection, and instant bank settlement.
                  </p>
                </div>
                <Link to="/sell" className="mt-2.5 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Sell Bike</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Link>
              </div>

              {/* 3. Exchange Bikes */}
              <div className="frost-card p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
                    Exchange Bikes
                  </h3>
                  <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                    Trade in your existing bike toward any premium showroom motorcycle.
                  </p>
                </div>
                <Link to="/sell" className="mt-2.5 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Exchange</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Link>
              </div>

              {/* 4. Bike Inspection */}
              <div className="frost-card p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
                    50-Point Inspection
                  </h3>
                  <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                    Rigorous checks on engine compression, electricals, and frame alignment.
                  </p>
                </div>
                <Link to="/about" className="mt-2.5 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Details</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Link>
              </div>

              {/* 5. Finance Assistance */}
              <div className="frost-card p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group col-span-2 sm:col-span-1">
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
                    Finance Assistance
                  </h3>
                  <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                    Fast loan approvals with low interest rates and flexible tenure options.
                  </p>
                </div>
                <Link to="/inventory" className="mt-2.5 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Loan EMI</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CUSTOMER REVIEWS SECTION */}
        <section className="py-10 sm:py-16 border-b border-white/10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-zinc-400 font-mono tracking-[0.25em] uppercase text-[10px] sm:text-xs font-bold mb-1.5 block">
                Rider Testimonials
              </span>
              <h2 className="text-xl sm:text-3xl font-cinzel font-bold text-white uppercase tracking-wider">
                Trusted By Mumbai Bikers
              </h2>
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-2"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="frost-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-amber-400 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-sans mb-3">
                      "{review.text}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <p className="text-white font-bold text-[11px] sm:text-xs">{review.name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">{review.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. ABOUT SECTION */}
        <section className="py-10 sm:py-16 border-b border-white/10 bg-white/[0.01]">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
            <span className="text-orange-400 font-mono tracking-[0.25em] uppercase text-[10px] sm:text-xs font-bold block">
              Patel Motors Mumbai
            </span>
            <h2 className="text-xl sm:text-3xl font-cinzel font-bold text-white uppercase tracking-wider">
              Where Trust Meets Performance
            </h2>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"></div>
            <p className="text-xs sm:text-base text-zinc-300 font-sans leading-relaxed max-w-2xl mx-auto font-light">
              Patel Motors is a Mumbai-based premium pre-owned bike dealership focused on quality motorcycles, transparent transactions, and customer satisfaction. Every bike is carefully selected and inspected before being offered for sale.
            </p>
            <div className="pt-2 flex justify-center">
              <Link 
                to="/about"
                className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-white hover:text-orange-400 transition-colors"
              >
                <span>About Dealership</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION BANNER */}
        <section className="py-10 sm:py-16 text-center">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-3xl font-cinzel font-bold text-white uppercase tracking-wider">
              Ready To Ride Your Dream Motorcycle?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-xl mx-auto leading-relaxed">
              Visit Patel Motors in Mulund, Mumbai, or browse our verified collection online. Book a test ride or get your bike valued today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 pt-1">
              <Link
                to="/inventory"
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold tracking-wider uppercase text-xs rounded-full shadow-lg transition-all"
              >
                Browse All Bikes
              </Link>
              <Link
                to="/sell"
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-zinc-900 border border-white/20 hover:border-white text-white font-mono font-bold tracking-wider uppercase text-xs rounded-full transition-all"
              >
                Sell Your Bike
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
