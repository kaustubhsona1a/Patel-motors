import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bike, Users, Settings, LogOut, Search, User as UserIcon, KeyRound, ShieldAlert, ArrowLeft, Menu, X, PlusCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVehicles, sanitizeHeroImage } from '../context/VehicleContext';
import { supabase } from '../lib/supabase';
import { SmartImage } from '../components/SmartImage';

export default function AdminLayout() {
  const location = useLocation();
  const { isAdmin, logout, user, loading: authLoading, loginAsDealer } = useAuth();
  const { siteConfig, metrics } = useVehicles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please enter your Supabase admin email and password.');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (supabaseError) {
        throw supabaseError;
      }
      
      if (!data?.user) {
        throw new Error('Authentication failed. No user returned.');
      }
    } catch (err: any) {
      console.error('Supabase auth failed:', err);
      setError(err?.message || 'Invalid email or password. Please verify credentials in your Supabase project.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: 'Dealer Dashboard', path: '/dealer-management', icon: LayoutDashboard },
    { name: 'Acquire Bike', path: '/dealer-management/inventory/add', icon: PlusCircle },
    { name: 'Inventory and Billing', path: '/dealer-management/inventory', icon: Bike },
    { name: 'Showroom Setting', path: '/dealer-management/settings', icon: Settings },
    { name: 'Leads', path: '/dealer-management/leads', icon: Users },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans relative">
        <div className="absolute top-[35%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-45"></div>
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-white mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500 font-bold animate-pulse">Verifying Security Credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-300 font-sans relative px-4">
        {/* Soft, noble subtle glow in background */}
        <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] bg-white/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-40"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] bg-white/3 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-30"></div>
        
        <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-zinc-900 rounded-3xl p-10 shadow-2xl relative overflow-hidden text-center z-10">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/45 to-transparent"></div>
          
          <Link to="/" className="inline-flex flex-col items-center mb-8 group">
            <img 
              src={siteConfig.logo || "/logo.png"} 
              alt="Patel Motors" 
              className="h-14 w-auto object-contain mb-3" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.endsWith('/logo.png')) {
                  target.src = '/logo.png';
                }
              }}
            />
            <p className="text-[8px] uppercase tracking-[0.45em] text-white font-mono mt-1.5 font-semibold">Dealer Portal Lock</p>
          </Link>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label htmlFor="dealer-email" className="block text-[10px] tracking-widest uppercase text-zinc-400 font-mono font-bold">Supabase Admin Email</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                <input 
                  id="dealer-email"
                  type="email" 
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-left text-sm font-semibold tracking-wider text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <label htmlFor="dealer-password" className="block text-[10px] tracking-widest uppercase text-zinc-400 font-mono font-bold">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                <input 
                  id="dealer-password"
                  type="password" 
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-left text-sm font-semibold tracking-wider text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all"
                  placeholder="Enter your Supabase password..."
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] tracking-wider uppercase font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center font-mono mt-2">
                <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full mt-4 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 py-3.5 rounded-xl uppercase tracking-widest text-xs font-bold transition-all duration-300 font-mono shadow-md shadow-white/10">
              {loading ? 'Authenticating with Supabase...' : 'Sign In to Dealer Portal'}
            </button>

            <div className="pt-2 text-center">
              <button 
                type="button" 
                onClick={() => loginAsDealer()}
                className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[10px] font-mono uppercase font-bold tracking-wider transition-all border border-white/10"
              >
                Quick Demo Access (Preview Mode)
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] tracking-widest uppercase font-semibold font-mono text-zinc-500">
            <Link to="/" className="hover:text-white flex items-center transition-colors"><ArrowLeft className="w-3 h-3 mr-1" /> Return Home</Link>
            <span>Auth v3.0</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex relative overflow-hidden font-sans">
      {/* Universal Background Photo alignment */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {(siteConfig.homeHeroMobileImage || siteConfig.homeHeroImage) && (
          <SmartImage 
            src={siteConfig.homeHeroMobileImage || siteConfig.homeHeroImage} 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-[3px] scale-[1.01]"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px]" />
      </div>

      {/* Screen Backdrop Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar - sliding on mobile, static on desktop */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-zinc-950/95 lg:bg-zinc-950/80 backdrop-blur-md text-white flex-shrink-0 flex flex-col border-r border-white/5 z-50 lg:z-10 transition-transform duration-300 ease-out transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link to="/dealer-management" className="flex flex-col justify-center select-none group py-0.5">
            <div className="flex items-baseline tracking-[0.18em] leading-tight">
              <span className="font-sans text-sm font-extrabold text-white uppercase group-hover:text-orange-400 transition-colors">
                PATEL
              </span>
              <span className="font-sans text-xs font-bold text-zinc-300 uppercase ml-1.5 group-hover:text-white transition-colors">
                MOTORS
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[7.5px] font-mono tracking-[0.25em] text-orange-400 uppercase font-semibold">
                DEALER PORTAL
              </span>
            </div>
          </Link>
          {/* Close button for mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 flex-grow space-y-1">
            <p className="px-4 text-[9px] font-bold text-white uppercase tracking-widest mb-4 mt-2 font-mono">Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dealer-management' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-mono text-xs tracking-wider uppercase font-semibold ${
                    isActive 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center p-4 pb-2">
            {user && (user.user_metadata?.avatar_url || (user as any).photoURL) ? (
              <img src={user.user_metadata?.avatar_url || (user as any).photoURL} alt="Admin avatar" className="w-8 h-8 rounded-full mr-3 flex-shrink-0 object-cover border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-zinc-950 mr-3 flex-shrink-0 font-mono">
                {(user?.user_metadata?.full_name || (user as any)?.displayName) ? (user?.user_metadata?.full_name || (user as any)?.displayName)[0].toUpperCase() : 'P'}
              </div>
            )}
            <div className="leading-tight overflow-hidden">
              <p className="text-xs font-semibold truncate text-white" title={user?.user_metadata?.full_name || (user as any)?.displayName || user?.email?.split('@')[0] || "Patel Motors Partner"}>
                {user?.user_metadata?.full_name || (user as any)?.displayName || user?.email?.split('@')[0] || "Patel Motors Partner"}
              </p>
              <p className="text-[10px] text-white font-mono uppercase tracking-wider">
                ● SUPABASE READY
              </p>
            </div>
          </div>
          <button onClick={() => logout()} className="flex items-center w-full space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 mt-1 transition-colors text-left text-xs uppercase tracking-wider font-mono">
            <LogOut className="w-4 h-4" />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden z-10 relative">
        {/* Top Header */}
        <header className="h-16 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 flex-shrink-0 gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Hamburger Button for mobile */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Input - responsive width */}
            <div className="hidden sm:flex items-center text-zinc-400 bg-zinc-900/30 px-3 py-1.5 rounded-lg w-full max-w-xs md:max-w-sm border border-white/5">
              <Search className="w-4 h-4 mr-2 text-white shrink-0" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-zinc-650 text-zinc-200"
              />
            </div>
            {/* Minimal Mobile Header brand */}
            <div className="sm:hidden flex items-baseline gap-1.5 pointer-events-none">
              <span className="font-sans text-xs tracking-wider text-white font-extrabold uppercase">PATEL MOTORS</span>
              <span className="font-mono text-[8px] tracking-widest font-semibold text-orange-400 uppercase">DEALER</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="text-[10px] sm:text-xs text-white border border-white/40 hover:border-white hover:bg-white/5 px-3 py-1.5 rounded-lg font-mono font-bold tracking-wider uppercase transition-colors">
              Website ↗
            </Link>
          </div>
        </header>

        {/* Scrollable Content with responsive padding */}
        <div className="flex-1 overflow-auto p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-zinc-950/10 backdrop-blur-[1px]">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Mobile Dealer Bottom Navigation Bar - 1-Tap navigation on phones */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-2xl">
          <Link
            to="/dealer-management"
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              location.pathname === '/dealer-management'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">Overview</span>
          </Link>

          <Link
            to="/dealer-management/inventory"
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              location.pathname === '/dealer-management/inventory'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">Bikes</span>
          </Link>

          <Link
            to="/dealer-management/inventory/add"
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors text-orange-400 hover:text-orange-300 font-bold ${
              location.pathname.includes('/add') ? 'scale-105' : ''
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">Acquire</span>
          </Link>

          <Link
            to="/dealer-management/leads"
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/dealer-management/leads')
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">Leads</span>
          </Link>

          <Link
            to="/dealer-management/settings"
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/dealer-management/settings')
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">Settings</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
