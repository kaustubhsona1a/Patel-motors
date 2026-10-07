import { Star, X, ChevronLeft, ChevronRight, MapPin, Clock, Bookmark, ShieldCheck, Sparkles, ExternalLink, Bike, CheckCircle2, Award, Banknote, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVehicles, sanitizeAboutImage, PATEL_ABOUT_IMAGE } from '../context/VehicleContext';
import { MOCK_REVIEWS } from '../data/mockData';
import React, { useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { isBombayMotorsUrl } from '../lib/imageCache';
import { Helmet } from 'react-helmet-async';

export default function About() {
  const { siteConfig } = useVehicles();
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const deliveries = (siteConfig.clientDeliveries || []).filter(img => Boolean(img) && !isBombayMotorsUrl(img));
  const heroShowcaseImage = sanitizeAboutImage(siteConfig.aboutImage) || (deliveries.length > 0 ? deliveries[0] : PATEL_ABOUT_IMAGE);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveries.length === 0) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % deliveries.length : 0));
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveries.length === 0) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + deliveries.length) % deliveries.length : 0));
  };

  return (
    <div className="bg-transparent text-zinc-300 font-sans min-h-screen">
      <Helmet>
        <title>About Us | Patel Motors Mumbai</title>
        <meta name="description" content="Patel Motors is a Mumbai-based premium pre-owned bike dealership focused on quality motorcycles, transparent transactions, and customer satisfaction." />
      </Helmet>

      {/* Top Header & Milestone Section */}
      <section className="pt-4 sm:pt-8 pb-6 sm:pb-10 bg-transparent relative z-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-6">
          
          {/* Header Title Block */}
          <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7 animate-fade-in">
            <span className="text-orange-400 font-mono tracking-[0.25em] uppercase text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 block">
              BOUTIQUE MOTORCYCLE DEALERSHIP
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-cinzel tracking-tight text-white uppercase mb-2 sm:mb-3">
              PATEL MOTORS
            </h1>
            
            {/* Established Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-md text-zinc-200 text-[9px] sm:text-xs uppercase tracking-wider font-sans font-semibold shadow-sm mb-3 sm:mb-4">
              <Bike className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>PREMIUM PRE-OWNED BIKES • MUMBAI</span>
            </div>

            {/* Clean Brief Statement */}
            <blockquote className="text-zinc-200 text-sm sm:text-base md:text-lg leading-relaxed font-light max-w-2xl mx-auto px-2 border-l-2 border-orange-400/80 pl-4 my-4 italic">
              "Mumbai's trusted showroom for verified pre-owned motorcycles. Inspected, certified, and ready to ride."
            </blockquote>
          </div>

          {/* Pillars of Patel Motors */}
          <div className="frost-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/15 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 sm:pb-4 border-b border-white/10 mb-4 sm:mb-6 text-[10px] sm:text-xs md:text-sm font-sans tracking-wider uppercase font-bold flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-zinc-300 font-semibold">THE PATEL MOTORS PROMISE</span>
              </div>
              <span className="text-zinc-500 hidden sm:inline">•</span>
              <span className="text-white font-bold">TRANSPARENCY • QUALITY • TRUST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              <div className="bg-black/40 border border-white/10 hover:border-orange-500/40 rounded-xl sm:rounded-2xl p-4 md:p-5 transition-all duration-300">
                <div className="text-orange-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">01 / Inspection</div>
                <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase font-sans mb-1.5">
                  50-Point Check
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans font-normal">
                  Engine compression, electricals, brakes, frame alignment, and genuine odometer verification.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 hover:border-orange-500/40 rounded-xl sm:rounded-2xl p-4 md:p-5 transition-all duration-300">
                <div className="text-orange-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">02 / Documentation</div>
                <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase font-sans mb-1.5">
                  Clean Mumbai Title
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans font-normal">
                  Clear RC, valid insurance, zero hypothecation hassle, and complete RTO transfer support.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 hover:border-orange-500/40 rounded-xl sm:rounded-2xl p-4 md:p-5 transition-all duration-300">
                <div className="text-orange-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">03 / Trade-In</div>
                <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase font-sans mb-1.5">
                  Bike Exchange
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans font-normal">
                  Trade in your current motorcycle against any bike from our inventory with spot valuation.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 hover:border-orange-500/40 rounded-xl sm:rounded-2xl p-4 md:p-5 transition-all duration-300">
                <div className="text-orange-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">04 / Finance</div>
                <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase font-sans mb-1.5">
                  Loan Assistance
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans font-normal">
                  Tie-ups with leading banks for quick loan approvals with low EMIs and flexible tenure.
                </p>
              </div>
            </div>
          </div>

          {/* 5 Core Dealership Services Banner */}
          <div className="mt-8 frost-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/15">
            <h2 className="text-lg sm:text-2xl font-cinzel font-bold text-white uppercase tracking-wider mb-2 text-center">
              Our Services
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 text-center max-w-xl mx-auto mb-6 font-sans">
              Complete motorcycle buying, selling, exchange, and financing solutions.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <Link to="/inventory" className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Buy Bikes</div>
                <div className="text-zinc-400 text-[10px] mt-1">Verified Fleet</div>
              </Link>

              <Link to="/sell" className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Sell Bikes</div>
                <div className="text-zinc-400 text-[10px] mt-1">Instant Valuation</div>
              </Link>

              <Link to="/sell" className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Exchange Bikes</div>
                <div className="text-zinc-400 text-[10px] mt-1">Easy Upgrades</div>
              </Link>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Inspection</div>
                <div className="text-zinc-400 text-[10px] mt-1">50-Point Technical</div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Finance</div>
                <div className="text-zinc-400 text-[10px] mt-1">Low Interest EMIs</div>
              </div>
            </div>
          </div>

          {/* Showroom & Contact Info */}
          <div className="mt-8 frost-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/15 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-orange-400 font-mono text-[10px] font-bold uppercase tracking-widest block">VISIT OUR SHOWROOM</span>
              <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-white uppercase">Patel Motors Mumbai</h3>
              <p className="text-zinc-300 text-xs sm:text-sm font-sans max-w-md">
                Basement 2, Kohinoor Square, East Tower, N C. Kelkar Rd, Ram Ganesh Gadkari Chowk, Dadar West, Mumbai, Maharashtra 400028.
              </p>
              <p className="text-zinc-400 text-xs font-sans">
                Open Monday to Saturday, 10:00 AM – 8:00 PM.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://maps.app.goo.gl/5puPNNYsbCpFjaPbA" 
                target="_blank" 
                rel="noreferrer" 
                className="px-6 py-3 bg-white text-black hover:bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Google Maps Location</span>
              </a>
              <a 
                href="tel:+918452088500" 
                className="px-6 py-3 frost-pill text-white hover:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-center"
              >
                Call: +91 84520 88500
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
