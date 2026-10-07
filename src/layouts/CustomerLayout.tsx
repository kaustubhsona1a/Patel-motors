import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Instagram, Twitter, Menu, X, Star, Upload, Image, Check, ChevronRight, Bike } from 'lucide-react';
import React, { useState } from 'react';
import { useVehicles, sanitizeHeroImage, sanitizeHeroMobileImage, PATEL_HERO_DESKTOP, PATEL_HERO_MOBILE, FALLBACK_HERO_DESKTOP, FALLBACK_HERO_MOBILE } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { SmartImage } from '../components/SmartImage';

let globalVideoFinished = false;

export default function CustomerLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const { siteConfig } = useVehicles();
  const { loginAsDealer } = useAuth();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateMatches = () => setIsMobileScreen(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateMatches);
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, []);

  const desktopVideoRef = React.useRef<HTMLVideoElement>(null);
  const mobileVideoRef = React.useRef<HTMLVideoElement>(null);
  const hasPlayedRef = React.useRef(false);
  const [isFading, setIsFading] = React.useState(false);

  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    globalVideoFinished = true;
    setIsFading(false);
    video.pause();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (globalVideoFinished && video.duration && !isNaN(video.duration)) {
      video.currentTime = video.duration;
    }
  };

  React.useEffect(() => {
    if (isHomePage) {
      if (globalVideoFinished) {
        if (desktopVideoRef.current && !isNaN(desktopVideoRef.current.duration)) {
          desktopVideoRef.current.pause();
          desktopVideoRef.current.currentTime = desktopVideoRef.current.duration;
        }
        if (mobileVideoRef.current && !isNaN(mobileVideoRef.current.duration)) {
          mobileVideoRef.current.pause();
          mobileVideoRef.current.currentTime = mobileVideoRef.current.duration;
        }
        return;
      }

      if (scrollY > 5) {
        if (!hasPlayedRef.current) {
          hasPlayedRef.current = true;
          desktopVideoRef.current?.play().catch(() => {});
          mobileVideoRef.current?.play().catch(() => {});
        }
      }
    }
  }, [scrollY, isHomePage]);

  // Custom multi-tap tracker for dealer console access on mobile (esp. Safari iOS)
  const tapHistoryRef = React.useRef<number[]>([]);
  const lastTapEventTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleSecretLogin = () => {
    setNotification('Opening Dealer Login...');
    setTimeout(() => {
      navigate('/dealer-management');
      setNotification('');
    }, 600);
  };

  const handleCopyrightTap = (e: React.SyntheticEvent) => {
    const now = Date.now();
    // Debounce duplicate events (e.g. touchend followed immediately by synthetic click)
    if (now - lastTapEventTimeRef.current < 120) return;
    lastTapEventTimeRef.current = now;

    // Filter to taps that happened within the last 1500ms
    const recentTaps = [...tapHistoryRef.current.filter(t => now - t < 1500), now];
    tapHistoryRef.current = recentTaps;

    if (recentTaps.length >= 3) {
      tapHistoryRef.current = [];
      handleSecretLogin();
    }
  };

  const heroDesktopImage = sanitizeHeroImage(siteConfig?.homeHeroImage);
  const heroMobileImage = sanitizeHeroMobileImage(siteConfig?.homeHeroMobileImage || heroDesktopImage);

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-300 relative bg-transparent">
      {/* Dynamic secret greeting/bypass notification */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 text-white font-semibold text-xs tracking-widest uppercase font-mono px-8 py-5 rounded-full shadow-2xl border border-zinc-800 flex items-center space-x-3 transition-all animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Global Background - Showroom Backdrop: fixed across entire viewport */}
      <div className="fixed inset-0 z-0 bg-[#070709] overflow-hidden pointer-events-none flex items-center justify-center">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 767px)" srcSet={heroMobileImage} />
          <img 
            src={heroDesktopImage} 
            alt="Patel Motors Showroom" 
            loading="eager" 
            decoding="async" 
            className="w-full h-full object-cover object-top md:object-center" 
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes('patel_hero_laptop.png')) {
                target.src = '/patel-hero-desktop.png';
              } else if (!target.src.includes('unsplash.com')) {
                target.src = FALLBACK_HERO_DESKTOP;
              }
            }}
          />
        </picture>
        {/* Crystal-clear Base Gradient for Hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

        {/* Scrim layer upon scrolling: keeps showroom background image 10 percent visible */}
        <div 
          className={`absolute inset-0 bg-[#070709]/90 backdrop-blur-[2px] transition-all duration-500 ease-out pointer-events-none ${
            (!isHomePage || isScrolled) ? 'opacity-100' : 'opacity-0'
          }`} 
        />

        {/* Clean Subtle Monochrome Ambient Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none z-2"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-white/[0.015] rounded-full blur-[180px] pointer-events-none z-2"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-grow min-h-screen overflow-x-hidden w-full max-w-full">
        {/* Main Navbar - Solid Dark on mobile, frosted glass on desktop */}
        <nav className={`sticky top-0 z-50 transition-all duration-500 bg-[#070709] md:bg-transparent overflow-x-hidden w-full max-w-full ${
          isScrolled 
            ? 'frost-nav-scrolled' 
            : 'frost-nav'
        } text-zinc-100`}>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3.5 flex justify-between items-center gap-3 sm:gap-4 h-[58px] sm:h-auto overflow-hidden">
            
            {/* Zone 1: Branding Logo (Typographic mark with refined spacing, bike logo removed) */}
            <Link to="/" className="flex flex-col justify-center shrink-0 select-none group py-0.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline tracking-[0.16em] leading-tight">
                <span className="font-sans text-[13.5px] sm:text-lg font-extrabold text-white uppercase group-hover:text-orange-400 transition-colors tracking-[0.2em]">
                  PATEL
                </span>
                <span className="font-sans text-[11px] sm:text-base font-bold text-zinc-300 uppercase sm:ml-1.5 group-hover:text-white transition-colors tracking-[0.22em] mt-0.5 sm:mt-0">
                  MOTORS
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-1 whitespace-nowrap">
                <span className="text-[8.5px] sm:text-[9px] font-sans tracking-[0.24em] text-orange-400 uppercase font-semibold">
                  MUMBAI
                </span>
                <span className="text-zinc-600 text-[8px]">•</span>
                <span className="text-[8px] sm:text-[8.5px] font-sans tracking-[0.16em] text-zinc-400 uppercase font-medium">
                  PRE-OWNED BIKES
                </span>
              </div>
            </Link>

            {/* Zone 2: Desktop Navigation Links (Centered, roomy, non-wrapping) */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-[12px] xl:text-[12.5px] tracking-[0.14em] uppercase font-sans font-semibold whitespace-nowrap">
              <Link 
                to="/" 
                className={`relative py-1.5 transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'text-white font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                HOME
                {location.pathname === '/' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
                )}
              </Link>
              <Link 
                to="/inventory" 
                className={`relative py-1.5 transition-all duration-300 ${
                  location.pathname.startsWith('/inventory') 
                    ? 'text-white font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                BROWSE BIKES
                {location.pathname.startsWith('/inventory') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
                )}
              </Link>
              <Link 
                to="/sell" 
                className={`relative py-1.5 transition-all duration-300 ${
                  location.pathname === '/sell' 
                    ? 'text-white font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                SELL YOUR BIKE
                {location.pathname === '/sell' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
                )}
              </Link>
              <Link 
                to="/about" 
                className={`relative py-1.5 transition-all duration-300 ${
                  location.pathname === '/about' 
                    ? 'text-white font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ABOUT
                {location.pathname === '/about' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
                )}
              </Link>
              <a 
                href="#contact" 
                className="relative py-1.5 text-zinc-400 hover:text-white transition-all duration-300"
              >
                CONTACT
              </a>
            </nav>

            {/* Zone 3: Right Quick Action Cluster */}
            <div className="hidden lg:flex items-center space-x-3 shrink-0">
              {/* Desktop Phone Number Pill: Clean single-line layout that never wraps */}
              <a 
                href="tel:+917400113999" 
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full frost-pill hover:border-white/40 text-xs font-sans whitespace-nowrap group transition-all shrink-0"
                title="Call Patel Motors: +91 74001 13999"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-orange-400 group-hover:text-white transition-colors">
                  <Phone className="w-3 h-3 stroke-[2]" />
                </div>
                <span className="text-zinc-200 group-hover:text-white font-medium tracking-wide text-[12px] font-sans whitespace-nowrap">
                  +91 74001 13999
                </span>
              </a>

              {/* Vertical Subtle Divider */}
              <div className="h-4 w-[1px] bg-white/20 shrink-0"></div>

              {/* Frosted Social & Location Icons */}
              <div className="flex items-center space-x-2 shrink-0">
                <a 
                  href="https://wa.me/917400113999" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-[#25D366] hover:text-white hover:border-[#25D366]/60 transition-all shrink-0"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 stroke-[1.8]" />
                </a>
                <a 
                  href="https://www.instagram.com/patelmotorsmumbai/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-[#E4405F] hover:text-[#f77737] hover:border-[#E4405F]/60 transition-all shrink-0"
                  title="Instagram @patelmotorsmumbai"
                >
                  <Instagram className="w-3.5 h-3.5 stroke-[1.8]" />
                </a>
                <a 
                  href="https://maps.google.com/?q=Patel+Motors+Mulund+West+Mumbai" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-[#EA4335] hover:text-red-400 hover:border-[#EA4335]/60 transition-all shrink-0"
                  title="Google Location & Showroom"
                >
                  <MapPin className="w-3.5 h-3.5 stroke-[1.8]" />
                </a>
              </div>

              {/* Dealer Portal Badge */}
              <Link
                to="/dealer-management"
                className="ml-1 px-3 py-1.5 rounded-full border border-white/20 hover:border-white text-zinc-300 hover:text-white text-[10.5px] font-mono tracking-wider uppercase transition-all bg-white/[0.04] hover:bg-white/10 whitespace-nowrap shrink-0"
              >
                Dealer Portal ↗
              </Link>
            </div>

            {/* Mobile / Compact Quick Actions (< lg) - Spread out with comfortable breathing room */}
            <div className="flex lg:hidden items-center space-x-2.5 sm:space-x-3.5 shrink-0">
              <a 
                href="tel:+917400113999" 
                className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-zinc-200 hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0"
                title="Call Showroom"
              >
                <Phone className="w-3.5 h-3.5 stroke-[1.8] text-orange-400" />
              </a>
              <a 
                href="https://wa.me/917400113999" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-[#25D366] hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 stroke-[1.8]" />
              </a>
              <a 
                href="https://www.instagram.com/patelmotorsmumbai/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-[#E4405F] hover:text-[#f77737] transition-all hover:scale-105 active:scale-95 shrink-0"
                title="Instagram @patelmotorsmumbai"
              >
                <Instagram className="w-3.5 h-3.5 stroke-[1.8]" />
              </a>
              <button 
                className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-zinc-200 hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0" 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Mobile / Tablet Navigation Drawer with Translucent Frosted Glass Styling */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-black/85 backdrop-blur-2xl border-b border-white/15 border-t border-white/10 px-5 py-5 flex flex-col space-y-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in">
              <Link 
                to="/" 
                onClick={closeMenu} 
                className={`px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold tracking-widest uppercase font-sans flex items-center justify-between ${
                  location.pathname === '/' 
                    ? 'bg-white/15 text-white font-bold border border-white/20' 
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Home</span>
                {location.pathname === '/' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </Link>
              
              <Link 
                to="/inventory" 
                onClick={closeMenu} 
                className={`px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold tracking-widest uppercase font-sans flex items-center justify-between ${
                  location.pathname.startsWith('/inventory') 
                    ? 'bg-white/15 text-white font-bold border border-white/20' 
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Browse Bikes</span>
                {location.pathname.startsWith('/inventory') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </Link>
              
              <Link 
                to="/sell" 
                onClick={closeMenu} 
                className={`px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold tracking-widest uppercase font-sans flex items-center justify-between ${
                  location.pathname === '/sell' 
                    ? 'bg-white/15 text-white font-bold border border-white/20' 
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Sell Your Bike</span>
                {location.pathname === '/sell' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </Link>
              
              <Link 
                to="/about" 
                onClick={closeMenu} 
                className={`px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold tracking-widest uppercase font-sans flex items-center justify-between ${
                  location.pathname === '/about' 
                    ? 'bg-white/15 text-white font-bold border border-white/20' 
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>About</span>
                {location.pathname === '/about' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </Link>
              
              <a 
                href="#contact" 
                onClick={closeMenu} 
                className="px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold tracking-widest uppercase font-sans text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between"
              >
                <span>Contact</span>
              </a>

              <Link 
                to="/dealer-management" 
                onClick={closeMenu} 
                className="px-4 py-3 rounded-xl transition-all duration-200 text-xs font-mono tracking-wider uppercase text-zinc-400 hover:bg-white/10 hover:text-white flex items-center justify-between border border-white/5"
              >
                <span>Dealer Portal</span>
                <span className="text-[10px] text-zinc-500">↗</span>
              </Link>

              {/* Mobile Menu Footer Details */}
              <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-sans text-zinc-400 px-2">
                <a 
                  href="https://www.instagram.com/patelmotorsmumbai/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-white"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                  <span>@patelmotorsmumbai</span>
                </a>
                <a href="tel:+917400113999" className="text-zinc-300 hover:text-white">
                  +91 74001 13999
                </a>
              </div>
            </div>
          )}
        </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer - Frosted Glass Container */}
      <footer className="bg-black/40 backdrop-blur-2xl border-t border-white/10 text-zinc-400 pt-10 sm:pt-14 pb-12 px-4 mt-0 relative overflow-hidden font-sans">
        {/* Ambient pulse */}
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-white/[0.015] rounded-full blur-[160px] pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10 text-zinc-300">
          <div className="space-y-4 md:col-span-1">
            <div>
              <div className="flex items-baseline tracking-[0.16em] leading-none">
                <span className="font-cinzel text-lg font-bold text-white uppercase">
                  PATEL
                </span>
                <span className="font-cinzel text-lg font-medium text-zinc-300 uppercase ml-1.5">
                  MOTORS
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-sans tracking-[0.24em] text-orange-400 uppercase font-semibold">
                  MUMBAI
                </span>
                <span className="text-zinc-600 text-[8px]">•</span>
                <span className="text-[8.5px] font-sans tracking-[0.18em] text-zinc-400 uppercase font-medium">
                  PRE-OWNED BIKES
                </span>
              </div>
            </div>
            <p className="text-xs tracking-wide leading-relaxed text-zinc-300 font-normal font-sans">
              Patel Motors is a Mumbai-based premium pre-owned bike dealership focused on quality motorcycles, transparent transactions, and customer satisfaction. Every bike is carefully selected and inspected before being offered for sale.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a 
                href="https://www.instagram.com/patelmotorsmumbai/" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-full frost-pill hover:bg-[#E4405F] hover:text-white transition-all text-[#E4405F]" 
                title="Instagram @patelmotorsmumbai"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/917400113999" target="_blank" rel="noreferrer" className="p-2.5 rounded-full frost-pill hover:bg-[#25D366] hover:text-white transition-all text-[#25D366]" title="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="tel:+919820155443" className="p-2.5 rounded-full frost-pill hover:bg-white hover:text-black transition-all text-white" title="Call Showroom">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-cinzel tracking-wider text-xs font-bold uppercase border-b border-white/10 pb-2">Our Services</h3>
            <ul className="space-y-2.5 text-xs font-sans text-zinc-300">
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span> Buy Bikes</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span> Sell Bikes</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span> Exchange Bikes</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span> 50-Point Bike Inspection</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span> Finance Assistance</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-cinzel tracking-wider text-xs font-bold uppercase border-b border-white/10 pb-2">Quick Navigation</h3>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase font-semibold font-sans text-zinc-300">
              <li><Link to="/inventory" className="hover:text-white transition-colors duration-300">Browse Bikes</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors duration-300">Sell Your Bike</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors duration-300">About Patel Motors</Link></li>
              <li><Link to="/dealer-management" className="text-orange-400 hover:text-orange-300 font-mono transition-colors duration-300">Dealer Portal ↗</Link></li>
            </ul>
          </div>

          <div className="space-y-4" id="contact">
            <h3 className="text-white font-cinzel tracking-wider text-xs font-bold uppercase border-b border-white/10 pb-2">Showroom & Inquiries</h3>
            <ul className="space-y-3.5 text-xs text-zinc-200 font-sans">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 text-orange-400 mr-2.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-normal text-zinc-300">
                  Showroom No. 4, L.B.S. Marg, Opp. Marathon Heights, Mulund West, Mumbai, Maharashtra 400080
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 text-orange-400 mr-2.5 shrink-0" />
                <a href="tel:+919820155443" className="hover:text-white font-mono font-bold text-white">+91 98201 55443 / +91 74001 13999</a>
              </li>
              <li className="flex items-center">
                <Instagram className="w-4 h-4 text-orange-400 mr-2.5 shrink-0" />
                <a 
                  href="https://www.instagram.com/patelmotorsmumbai/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white font-mono font-medium text-zinc-200"
                >
                  @patelmotorsmumbai
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 text-orange-400 mr-2.5 shrink-0" />
                <a href="mailto:info@patelmotors.in" className="hover:text-white font-medium text-zinc-200">info@patelmotors.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl mt-10 sm:mt-12 pt-6 border-t border-white/10 text-[10px] tracking-widest uppercase text-zinc-400 flex flex-col md:flex-row justify-between items-center font-sans font-semibold">
          <button 
            type="button"
            onClick={handleCopyrightTap}
            onTouchEnd={handleCopyrightTap}
            className="select-none text-zinc-400 cursor-pointer hover:text-white outline-none transition-colors bg-transparent border-0 p-0 text-left text-[10px] tracking-widest uppercase font-mono"
          >
            &copy; {new Date().getFullYear()} Patel Motors. Mumbai's Premium Pre-Owned Motorcycle Dealership.
          </button>
          <div className="flex items-center space-x-6 mt-4 md:mt-0 text-zinc-400 font-mono text-[10px]">
            <Link to="/dealer-management" className="text-zinc-400 hover:text-white transition-colors">Dealer Portal</Link>
            <a href="#contact" className="hover:text-white">Mumbai, MH</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
