import { Bike, TrendingUp, Plus, List, Settings, ArrowRight, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { vehicles, leads } = useVehicles();

  const activeBikes = vehicles.filter(v => v.status === 'Available').length;
  const soldBikes = vehicles.filter(v => v.status === 'Sold').length;
  const totalBikes = vehicles.length;

  return (
    <div className="space-y-6 sm:space-y-10 animate-fadeIn max-w-7xl mx-auto">
      {/* Header - Clean, minimal title only */}
      <div>
        <h1 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-wider uppercase">
          DEALER DASHBOARD
        </h1>
      </div>

      {/* Quick Actions - Clean, direct buttons with zero double text */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Acquire Bike */}
        <Link
          to="/dealer-management/inventory/add"
          className="group bg-zinc-900/60 hover:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-black transition-colors">
              <Plus className="w-4 h-4 text-orange-400 group-hover:text-black transition-colors" />
            </div>
            <h3 className="font-serif font-bold text-white text-xs sm:text-sm tracking-wider uppercase truncate">
              ACQUIRE BIKE
            </h3>
          </div>
          <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* View Inventory */}
        <Link
          to="/dealer-management/inventory"
          className="group bg-zinc-900/60 hover:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
              <List className="w-4 h-4 text-white group-hover:text-black transition-colors" />
            </div>
            <h3 className="font-serif font-bold text-white text-xs sm:text-sm tracking-wider uppercase truncate">
              INVENTORY AND BILLING
            </h3>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* Site Settings */}
        <Link
          to="/dealer-management/settings"
          className="group bg-zinc-900/60 hover:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
              <Settings className="w-4 h-4 text-white group-hover:text-black transition-colors" />
            </div>
            <h3 className="font-serif font-bold text-white text-xs sm:text-sm tracking-wider uppercase truncate">
              SHOWROOM SETTING
            </h3>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Inventory Summary - 3 Column compact layout on all screen sizes */}
      <div>
        <h2 className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-3 sm:mb-4">
          Fleet Overview
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          <div className="bg-zinc-900/40 backdrop-blur-md p-2.5 sm:p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center shadow-md">
            <div className="bg-orange-500/10 w-7 h-7 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center mb-1.5 sm:mb-0 sm:mr-4 border border-orange-500/20 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-bold truncate">Live Active</p>
              <p className="text-lg sm:text-2xl font-serif font-bold text-white mt-0.5">{activeBikes}</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-2.5 sm:p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center shadow-md">
            <div className="bg-purple-500/10 w-7 h-7 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center mb-1.5 sm:mb-0 sm:mr-4 border border-purple-500/20 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-bold truncate">Sold & Invoiced</p>
              <p className="text-lg sm:text-2xl font-serif font-bold text-white mt-0.5">{soldBikes}</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-2.5 sm:p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center shadow-md">
            <div className="bg-white/5 w-7 h-7 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center mb-1.5 sm:mb-0 sm:mr-4 border border-white/10 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-bold truncate">Total Fleet</p>
              <p className="text-lg sm:text-2xl font-serif font-bold text-white mt-0.5">{totalBikes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/5 shadow-lg overflow-hidden">
        <div className="p-3.5 sm:p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="font-serif font-bold text-white text-xs sm:text-base tracking-widest uppercase">Recent Inquiries</h2>
          </div>
          <Link to="/dealer-management/leads" className="text-[10px] sm:text-[11px] text-white hover:text-zinc-300 font-semibold font-mono uppercase tracking-wider flex items-center transition-colors">
            View All ({leads.length}) <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </Link>
        </div>

        <div>
          {leads.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-zinc-500 font-mono text-[11px] sm:text-xs uppercase tracking-wider">
              No recent inquiries recorded yet.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest font-mono border-b border-white/5">
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Motorcycle of Interest</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300 font-sans">
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors font-mono">
                        <td className="px-5 py-3.5 font-sans font-bold text-white">{lead.name}</td>
                        <td className="px-5 py-3.5 text-zinc-400">{lead.phone || lead.email || 'N/A'}</td>
                        <td className="px-5 py-3.5 text-zinc-200 font-sans">{lead.car}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${
                            lead.status === 'New Lead' ? 'bg-white/10 text-white border-white/20' :
                            lead.status === 'Contacted' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' :
                            'bg-zinc-950 text-zinc-500 border-zinc-900'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-400">{lead.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Compact List View */}
              <div className="sm:hidden divide-y divide-white/5">
                {leads.slice(0, 4).map(lead => (
                  <div key={lead.id} className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs truncate">{lead.name}</span>
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded border border-white/10 text-zinc-400 uppercase">
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-sans truncate mt-0.5">{lead.car}</p>
                      <p className="text-[9.5px] text-zinc-500 font-mono">{lead.phone} • {lead.date}</p>
                    </div>
                    {lead.phone && (
                      <a 
                        href={`tel:${lead.phone}`} 
                        className="px-2.5 py-1 bg-white/10 text-white hover:bg-white hover:text-black rounded-lg text-[9.5px] font-mono font-bold uppercase tracking-wider shrink-0"
                      >
                        Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
