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
      <section className="relative min-h-[72vh] sm:min-h-[80vh] md:min-h-[85vh] flex flex-col justify-end items-center pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 text-center z-20">
        <h1 className="sr-only">Patel Motors - Premium Pre-Owned Bikes Mumbai</h1>

        {/* Direct Action Buttons: Buy Bike & Sell Bike */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none">
          <Link 
            to="/inventory" 
            className="w-full sm:w-auto min-w-[210px] px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-bold tracking-wider uppercase text-xs sm:text-sm rounded-full ring-2 ring-white/60 ring-offset-2 ring-offset-black transition-all duration-300 shadow-[0_4px_25px_rgba(255,255,255,0.35)] hover:shadow-[0_8px_35px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Buy Bike</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link 
            to="/sell" 
            className="w-full sm:w-auto min-w-[210px] px-8 py-4 bg-black/60 border border-white/40 hover:border-white text-white font-sans font-bold tracking-wider uppercase text-xs sm:text-sm rounded-full ring-2 ring-white/40 ring-offset-2 ring-offset-black/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black active:scale-95 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2"
          >
            <span>Sell Bike</span>
          </Link>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative z-20 bg-[#070709] border-t border-white/10 shadow-[0_-20px_50px_rgba(7,7,9,0.95)]">
        
        {/* ABOUT SECTION (Exact Brief Copy) */}
        <section className="py-16 sm:py-20 border-b border-white/10 bg-white/[0.01]">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
            <span className="text-orange-400 font-mono tracking-[0.25em] uppercase text-xs font-bold block">
              About Patel Motors
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel font-bold text-white uppercase tracking-wider">
              Where Trust Meets Performance
            </h2>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"></div>
            <blockquote className="text-base sm:text-xl text-zinc-200 font-sans leading-relaxed max-w-3xl mx-auto font-light">
              "Patel Motors is a Mumbai-based premium pre-owned bike dealership focused on quality motorcycles, transparent transactions, and customer satisfaction. Every bike is carefully selected and inspected before being offered for sale."
            </blockquote>
            <div className="pt-4 flex justify-center">
              <Link 
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-white hover:text-orange-400 transition-colors"
              >
                <span>Read More About Our Dealership</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION (Exact 5 Services from Brief) */}
        <section className="py-16 sm:py-24 border-b border-white/10 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <span className="text-zinc-400 font-mono tracking-[0.25em] uppercase text-xs font-bold mb-2 block">
                Comprehensive Dealership Services
              </span>
              <h2 className="text-2xl sm:text-4xl font-cinzel font-bold text-white uppercase tracking-wider">
                Our Motorcycle Services
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto font-sans">
                Everything you need to buy, sell, exchange, inspect, or finance your dream motorcycle in Mumbai.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* 1. Buy Bikes */}
              <div className="frost-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-2">
                    Buy Bikes
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Browse verified, showroom-condition pre-owned superbikes, cruisers, adventure tourers, and commuters with warranty options.
                  </p>
                </div>
                <Link to="/inventory" className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Browse Fleet</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* 2. Sell Bikes */}
              <div className="frost-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-2">
                    Sell Bikes
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Get top market valuation for your motorcycle with spot inspection, transparent agreement, and immediate bank transfer.
                  </p>
                </div>
                <Link to="/sell" className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Get Valuation</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* 3. Exchange Bikes */}
              <div className="frost-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-2">
                    Exchange Bikes
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Upgrade seamlessly. Trade in your current motorcycle toward any premium motorcycle in our showroom with fair appraisal.
                  </p>
                </div>
                <Link to="/sell" className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Trade In</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* 4. Bike Inspection */}
              <div className="frost-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-2">
                    Bike Inspection
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Rigorous 50-point technical check covering engine compression, electricals, chassis alignment, brakes, and genuine odometer.
                  </p>
                </div>
                <Link to="/about" className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Our Standards</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* 5. Finance Assistance */}
              <div className="frost-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-2">
                    Finance Assistance
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Fast approval pre-owned two-wheeler loans with competitive interest rates and flexible EMIs from trusted banking partners.
                  </p>
                </div>
                <Link to="/inventory" className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono uppercase font-bold text-zinc-300 group-hover:text-orange-400 flex items-center">
                  <span>Calculate EMI</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED MOTORCYCLES (Strictly status === 'Available') */}
        {featuredBikes.length > 0 && (
          <section className="py-16 sm:py-24 border-b border-white/10">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 sm:mb-12">
                <div>
                  <span className="text-orange-400 font-mono tracking-[0.25em] uppercase text-xs font-bold mb-1 block">
                    Verified Inventory
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-cinzel font-bold text-white uppercase tracking-wider">
                    Featured Motorcycles
                  </h2>
                </div>
                <Link 
                  to="/inventory" 
                  className="inline-flex items-center gap-1.5 text-xs uppercase font-mono font-bold tracking-widest text-zinc-300 hover:text-white transition-colors group"
                >
                  <span>View All Available Bikes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Bike Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {featuredBikes.map((bike) => (
                  <div 
                    key={bike.id} 
                    className="group relative bg-[#0e0e12]/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between hover:border-orange-500/40 transition-all duration-300 shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
                  >
                    {/* Top Image Container */}
                    <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-black/80 mb-4">
                      <SmartImage 
                        src={bike.images?.[0] || ""} 
                        fallbackSrc={VEHICLE_PLACEHOLDER_FALLBACK}
                        alt={`${bike.make} ${bike.model}`}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" 
                      />
                      
                      {/* Year Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold rounded-lg tracking-wider">
                        {bike.year}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg">
                        {bike.bodyType || 'Motorcycle'}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col flex-grow justify-between">
                      <div>
                        {/* Title: Make (Bold) Model (Normal) */}
                        <h3 className="text-lg sm:text-xl font-sans tracking-tight text-white mb-1">
                          <span className="font-extrabold">{bike.make}</span>{" "}
                          <span className="font-normal text-zinc-200">{bike.model}</span>
                        </h3>

                        {/* Variant / Subtitle */}
                        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                          {bike.variant || "PREMIUM SPEC"}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-1.5 h-5 bg-orange-500 rounded-full inline-block shrink-0"></span>
                          <span className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                            {formatPrice(bike.price)}
                          </span>
                        </div>
                      </div>

                      {/* 2x2 Specs Grid */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 py-3.5 border-t border-white/10 text-zinc-300 text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.mileage.toLocaleString('en-IN')} KM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.engine || (bike.engineCC ? `${bike.engineCC} cc` : 'Standard')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{bike.ownership}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Link 
                        to={`/inventory/${bike.id}`}
                        className="mt-4 w-full py-3 border border-white/15 hover:border-orange-400 hover:bg-orange-500 hover:text-black rounded-xl text-center text-xs uppercase tracking-widest font-bold text-zinc-200 transition-all duration-300 block font-mono"
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

        {/* CUSTOMER REVIEWS SECTION */}
        <section className="py-16 sm:py-24 border-b border-white/10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <span className="text-zinc-400 font-mono tracking-[0.25em] uppercase text-xs font-bold mb-2 block">
                Rider Testimonials
              </span>
              <h2 className="text-2xl sm:text-4xl font-cinzel font-bold text-white uppercase tracking-wider">
                Trusted By Mumbai Bikers
              </h2>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="frost-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-amber-400 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-4">
                      "{review.text}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-white font-bold text-xs">{review.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{review.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="py-16 sm:py-20 text-center">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
            <h2 className="text-2xl sm:text-4xl font-cinzel font-bold text-white uppercase tracking-wider">
              Ready To Ride Your Dream Motorcycle?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-xl mx-auto leading-relaxed">
              Visit Patel Motors in Mulund, Mumbai, or browse our verified collection online. Book a test ride or get your bike valued today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/inventory"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold tracking-widest uppercase text-xs rounded-full shadow-lg transition-all"
              >
                Browse All Bikes
              </Link>
              <Link
                to="/sell"
                className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 border border-white/20 hover:border-white text-white font-mono font-bold tracking-widest uppercase text-xs rounded-full transition-all"
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
