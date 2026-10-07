import { Bike, TrendingUp, Plus, List, Settings, ArrowRight, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { vehicles, leads } = useVehicles();

  const activeBikes = vehicles.filter(v => v.status === 'Available').length;
  const soldBikes = vehicles.filter(v => v.status === 'Sold').length;
  const totalBikes = vehicles.length;

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1">
          <span>Patel Motors Mumbai</span>
          <span>•</span>
          <span className="text-orange-400 font-bold">Dealer Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wider uppercase">
          DEALER DASHBOARD
        </h1>
        <p className="text-zinc-400 text-xs mt-1.5 font-mono uppercase tracking-wider">
          Direct management options for pre-owned motorcycle inventory and showroom settings.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Quick Workflows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Acquire Bike */}
          <Link
            to="/dealer-management/inventory/add"
            className="group bg-zinc-900/60 hover:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                <Plus className="w-5 h-5 text-white group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="font-serif font-bold text-white text-base tracking-widest uppercase mb-1">
                ACQUIRE BIKE
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Add an acquired motorcycle with specs, pricing, inspection status, and photos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
              <span>ADD MOTORCYCLE</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* View Inventory */}
          <Link
            to="/dealer-management/inventory"
            className="group bg-zinc-900/60 hover:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                <List className="w-5 h-5 text-white group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="font-serif font-bold text-white text-base tracking-widest uppercase mb-1">
                MANAGE INVENTORY
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Browse bikes, update status (Available, Draft, Sold), and generate sales invoices.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
              <span>MANAGE FLEET</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Site Settings */}
          <Link
            to="/dealer-management/settings"
            className="group bg-zinc-900/60 hover:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                <Settings className="w-5 h-5 text-white group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="font-serif font-bold text-white text-base tracking-widest uppercase mb-1">
                SHOWROOM SETTINGS
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Configure Patel Motors showroom covers, contact details, and branding.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
              <span>EDIT SETTINGS</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Inventory Summary */}
      <div>
        <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Fleet Performance & Inventory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-zinc-900/40 backdrop-blur-md p-5 rounded-xl border border-white/5 flex items-center shadow-md">
            <div className="bg-orange-500/10 w-11 h-11 rounded-lg flex items-center justify-center mr-4 border border-orange-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-bold">Active Public Bikes</p>
              <p className="text-2xl font-serif font-bold text-white mt-0.5">{activeBikes}</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-5 rounded-xl border border-white/5 flex items-center shadow-md">
            <div className="bg-purple-500/10 w-11 h-11 rounded-lg flex items-center justify-center mr-4 border border-purple-500/20 shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-bold">Bikes Sold & Invoiced</p>
              <p className="text-2xl font-serif font-bold text-white mt-0.5">{soldBikes}</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-5 rounded-xl border border-white/5 flex items-center shadow-md">
            <div className="bg-white/5 w-11 h-11 rounded-lg flex items-center justify-center mr-4 border border-white/10 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-bold">Total Dealership Records</p>
              <p className="text-2xl font-serif font-bold text-white mt-0.5">{totalBikes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="font-serif font-bold text-white text-base tracking-widest uppercase">Recent Customer Inquiries</h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider mt-0.5">Latest test ride requests and bike valuation appraisals</p>
          </div>
          <Link to="/dealer-management/leads" className="text-[11px] text-white hover:text-zinc-300 font-semibold font-mono uppercase tracking-wider flex items-center transition-colors">
            View All ({leads.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div>
          {leads.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
              No recent inquiries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest font-mono border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Motorcycle of Interest</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {leads.slice(0, 5).map(lead => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors font-mono">
                      <td className="px-6 py-4 font-sans font-bold text-white">{lead.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{lead.phone || lead.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-zinc-200">{lead.car}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          lead.status === 'New Lead' ? 'bg-white/10 text-white border-white/20' :
                          lead.status === 'Contacted' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' :
                          'bg-zinc-950 text-zinc-500 border-zinc-900'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{lead.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
