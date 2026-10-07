import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { formatPrice, Vehicle, BIKE_TYPES, VehicleStatus, SaleRecord } from '../../data/mockData';
import { Search, Plus, Edit, Trash2, AlertTriangle, FileText, CheckCircle2, Eye, EyeOff, Bookmark, Archive, Printer, X, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { SmartImage, VEHICLE_PLACEHOLDER_FALLBACK } from '../../components/SmartImage';
import { generateInvoiceNumber, printInvoice, generateInvoiceHtml, numberToWordsIndian, PATEL_MOTORS_DEALERSHIP } from '../../lib/invoice';

export default function AdminInventory() {
  const { vehicles, updateVehicle, removeVehicle } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Modals state
  const [bikeToDelete, setBikeToDelete] = useState<Vehicle | null>(null);
  const [bikeToSell, setBikeToSell] = useState<Vehicle | null>(null);
  const [previewInvoiceBike, setPreviewInvoiceBike] = useState<{ bike: Vehicle; sale: SaleRecord } | null>(null);

  // Sale form state for "Mark as Sold & Generate Invoice"
  const [saleFormData, setSaleFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerIdentity: '',
    customerGst: '',
    deliveryTime: '',
    salePrice: 0,
    rtoCharges: 0,
    taxAmount: 0,
    discount: 0,
    paymentMethod: 'Bank Transfer (NEFT/RTGS)' as SaleRecord['paymentMethod'],
    paymentStatus: 'Paid in Full' as SaleRecord['paymentStatus'],
    paymentRef: '',
    hypothecation: 'Nil / Cleared',
    insuranceCompany: '',
    amountPaid: 0,
    notes: ''
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const textToSearch = `${v.make} ${v.model} ${v.variant || ''} ${v.bodyType || ''} ${v.registration || ''}`.toLowerCase();
      const matchesSearch = textToSearch.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Statuses' || v.status === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' || v.bodyType === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vehicles, searchTerm, statusFilter, categoryFilter]);

  // Counts for quick filter pills
  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'Available').length,
      draft: vehicles.filter(v => v.status === 'Draft').length,
      reserved: vehicles.filter(v => v.status === 'Reserved' || v.status === 'Booked').length,
      sold: vehicles.filter(v => v.status === 'Sold').length,
      archived: vehicles.filter(v => v.status === 'Archived').length
    };
  }, [vehicles]);

  const handleDeleteConfirm = () => {
    if (bikeToDelete) {
      removeVehicle(bikeToDelete.id);
      setBikeToDelete(null);
    }
  };

  const handleOpenSellModal = (bike: Vehicle) => {
    const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setBikeToSell(bike);
    setSaleFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      customerIdentity: '',
      customerGst: '',
      deliveryTime: currentTimeStr,
      salePrice: bike.price,
      rtoCharges: 1500,
      taxAmount: 0,
      discount: 0,
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      paymentStatus: 'Paid in Full',
      paymentRef: '',
      hypothecation: 'Nil / Cleared',
      insuranceCompany: bike.insuranceStatus || 'Valid Mumbai RTO',
      amountPaid: bike.price + 1500,
      notes: ''
    });
  };

  const handleConfirmSaleAndInvoice = () => {
    if (!bikeToSell) return;

    if (!saleFormData.customerName.trim() || !saleFormData.customerPhone.trim()) {
      alert('Please provide the customer name and phone number for the invoice.');
      return;
    }

    const netRtoCharges = Number(saleFormData.rtoCharges || saleFormData.taxAmount || 0);
    const finalAmount = Math.max(0, Number(saleFormData.salePrice) + netRtoCharges - Number(saleFormData.discount || 0));
    const balanceDue = Math.max(0, finalAmount - Number(saleFormData.amountPaid || 0));
    const invoiceNumber = generateInvoiceNumber(bikeToSell);

    const saleRecord: SaleRecord = {
      invoiceNumber,
      saleDate: new Date().toISOString().split('T')[0],
      deliveryTime: saleFormData.deliveryTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      salePrice: Number(saleFormData.salePrice),
      rtoCharges: netRtoCharges,
      taxAmount: netRtoCharges,
      discount: Number(saleFormData.discount || 0),
      finalAmount,
      customerName: saleFormData.customerName.trim(),
      customerPhone: saleFormData.customerPhone.trim(),
      customerEmail: saleFormData.customerEmail.trim() || undefined,
      customerAddress: saleFormData.customerAddress.trim() || undefined,
      customerIdentity: saleFormData.customerIdentity.trim() || undefined,
      customerGst: saleFormData.customerGst.trim() || undefined,
      paymentMethod: saleFormData.paymentMethod,
      paymentStatus: saleFormData.paymentStatus,
      paymentRef: saleFormData.paymentRef.trim() || undefined,
      hypothecation: saleFormData.hypothecation.trim() || undefined,
      insuranceCompany: saleFormData.insuranceCompany.trim() || undefined,
      amountPaid: Number(saleFormData.amountPaid),
      balanceDue,
      notes: saleFormData.notes.trim() || undefined
    };

    // Update status to Sold and persist sale record.
    updateVehicle(bikeToSell.id, {
      status: 'Sold',
      saleInfo: saleRecord
    });

    const soldBikeSnapshot: Vehicle = {
      ...bikeToSell,
      status: 'Sold',
      saleInfo: saleRecord
    };

    setBikeToSell(null);

    // Open the invoice preview directly for print or download
    setPreviewInvoiceBike({
      bike: soldBikeSnapshot,
      sale: saleRecord
    });
  };

  const handleTogglePublish = (bike: Vehicle) => {
    const nextStatus: VehicleStatus = bike.status === 'Available' ? 'Draft' : 'Available';
    updateVehicle(bike.id, { status: nextStatus });
  };

  const handleToggleReserve = (bike: Vehicle) => {
    const nextStatus: VehicleStatus = bike.status === 'Reserved' ? 'Available' : 'Reserved';
    updateVehicle(bike.id, { status: nextStatus });
  };

  const handleToggleArchive = (bike: Vehicle) => {
    const nextStatus: VehicleStatus = bike.status === 'Archived' ? 'Draft' : 'Archived';
    updateVehicle(bike.id, { status: nextStatus });
  };

  return (
    <div className="space-y-4 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wider uppercase">
            INVENTORY AND BILLING
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link 
            to="/dealer-management/inventory/add" 
            className="w-full sm:w-auto justify-center inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-[11px] sm:text-xs font-bold tracking-widest font-mono uppercase transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> Acquire Bike
          </Link>
        </div>
      </div>

      {/* Status Summary Counter Cards - Clean responsive grid on mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        <button 
          onClick={() => setStatusFilter('All Statuses')}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'All Statuses' 
              ? 'bg-white/10 border-white text-white shadow-md' 
              : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider truncate">All Fleet</div>
          <div className="text-base sm:text-xl font-bold font-serif text-white mt-0.5 sm:mt-1">{stats.total}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('Available')}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Available' 
              ? 'bg-orange-500/20 border-orange-400 text-white shadow-md' 
              : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-orange-400 font-semibold flex items-center truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1 animate-pulse shrink-0"></span> Available
          </div>
          <div className="text-base sm:text-xl font-bold font-serif text-white mt-0.5 sm:mt-1">{stats.available}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('Reserved')}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Reserved' 
              ? 'bg-amber-500/20 border-amber-400 text-white shadow-md' 
              : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold truncate">Reserved</div>
          <div className="text-base sm:text-xl font-bold font-serif text-white mt-0.5 sm:mt-1">{stats.reserved}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('Sold')}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Sold' 
              ? 'bg-purple-500/20 border-purple-400 text-white shadow-md' 
              : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold truncate">Sold</div>
          <div className="text-base sm:text-xl font-bold font-serif text-white mt-0.5 sm:mt-1">{stats.sold}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('Draft')}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'Draft' 
              ? 'bg-zinc-800 border-zinc-500 text-white shadow-md' 
              : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold truncate">Drafts</div>
          <div className="text-base sm:text-xl font-bold font-serif text-white mt-0.5 sm:mt-1">{stats.draft}</div>
        </button>
      </div>

      {/* Main Filter & Inventory Table Container */}
      <div className="bg-zinc-950/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 border-b border-white/5 flex flex-col md:flex-row gap-2.5 sm:gap-3 bg-white/[0.02]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search model, reg no, spec..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full sm:w-auto bg-zinc-900/60 border border-white/10 text-zinc-300 rounded-xl px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs outline-none focus:border-white transition-all font-mono uppercase tracking-wider"
            >
              <option className="bg-zinc-950 text-white">All Statuses</option>
              <option className="bg-zinc-950 text-orange-400">Available</option>
              <option className="bg-zinc-950 text-amber-400">Reserved</option>
              <option className="bg-zinc-950 text-purple-400">Sold</option>
              <option className="bg-zinc-950 text-zinc-400">Draft</option>
              <option className="bg-zinc-950 text-zinc-500">Archived</option>
            </select>

            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)} 
              className="bg-zinc-900/50 border border-white/10 text-zinc-300 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-white transition-all font-mono uppercase tracking-wider"
            >
              <option className="bg-zinc-950 text-white">All Categories</option>
              {BIKE_TYPES.map(cat => (
                <option key={cat} value={cat} className="bg-zinc-950 text-white">{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.04] text-white text-[10px] uppercase font-bold tracking-widest font-mono border-b border-white/10">
              <tr>
                <th className="px-5 py-4">Motorcycle</th>
                <th className="px-5 py-4">Reg No / Specs</th>
                <th className="px-5 py-4">Purchase Price</th>
                <th className="px-5 py-4">Selling Price</th>
                <th className="px-5 py-4">Inventory Status</th>
                <th className="px-5 py-4 text-right">Dealer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredVehicles.map(bike => {
                const isAvailable = bike.status === 'Available';
                const isSold = bike.status === 'Sold';
                const isDraft = bike.status === 'Draft';
                const isReserved = bike.status === 'Reserved' || bike.status === 'Booked';
                const isArchived = bike.status === 'Archived';

                return (
                  <tr key={bike.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Motorcycle Image & Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-16 h-12 rounded-lg border border-white/10 overflow-hidden shrink-0 bg-black/50">
                          <SmartImage 
                            src={bike.images?.[0] || ""} 
                            fallbackSrc={VEHICLE_PLACEHOLDER_FALLBACK}
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">
                            <span className="font-extrabold">{bike.make}</span> {bike.model}
                          </p>
                          <p className="text-[10.5px] text-zinc-400 mt-0.5 font-mono uppercase tracking-wider">
                            {bike.year} • {bike.bodyType || 'Motorcycle'} • {bike.mileage.toLocaleString('en-IN')} KM
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Reg No & Specs */}
                    <td className="px-5 py-4 font-mono text-zinc-300">
                      <div className="font-bold text-white text-[11px]">{bike.registration || 'Reg: Unassigned'}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {bike.engine || (bike.engineCC ? `${bike.engineCC} cc` : 'N/A')} • {bike.ownership}
                      </div>
                    </td>

                    {/* Cost of Acquisition / Purchase Price */}
                    <td className="px-5 py-4 font-mono">
                      {bike.purchasePrice ? (
                        <span className="text-zinc-400 text-xs font-medium">
                          {formatPrice(bike.purchasePrice)}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-[10px] uppercase font-mono tracking-wider">—</span>
                      )}
                    </td>

                    {/* Selling Price */}
                    <td className="px-5 py-4 font-sans font-bold text-white text-sm">
                      {formatPrice(bike.price)}
                    </td>

                    {/* Lifecycle Status Pill */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center space-x-1.5">
                        <select 
                          value={bike.status}
                          onChange={(e) => updateVehicle(bike.id, { status: e.target.value as any })}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border outline-none cursor-pointer bg-zinc-950 font-mono transition-all ${
                            isAvailable ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                            isSold ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                            isReserved ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                            isDraft ? 'border-zinc-700 text-zinc-300 bg-zinc-900/60' :
                            'border-zinc-800 text-zinc-500 bg-zinc-950'
                          }`}
                        >
                          <option value="Available" className="bg-zinc-950 text-orange-400">Available (Live)</option>
                          <option value="Draft" className="bg-zinc-950 text-zinc-300">Draft (Hidden)</option>
                          <option value="Reserved" className="bg-zinc-950 text-amber-400">Reserved</option>
                          <option value="Sold" className="bg-zinc-950 text-purple-400">Sold</option>
                          <option value="Archived" className="bg-zinc-950 text-zinc-500">Archived</option>
                        </select>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Sell & Generate Invoice Action */}
                        {!isSold ? (
                          <button
                            onClick={() => handleOpenSellModal(bike)}
                            className="inline-flex items-center px-2.5 py-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/30 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all"
                            title="Sell Bike & Generate Invoice"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            <span>Mark Sold</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const saleRec: SaleRecord = bike.saleInfo || {
                                invoiceNumber: generateInvoiceNumber(bike),
                                saleDate: new Date().toISOString().split('T')[0],
                                salePrice: bike.price,
                                finalAmount: bike.price,
                                customerName: "Valued Customer",
                                customerPhone: "+91 98201 12345",
                                paymentMethod: "Bank Transfer (NEFT/RTGS)",
                                paymentStatus: "Paid in Full",
                                amountPaid: bike.price,
                                balanceDue: 0
                              };
                              setPreviewInvoiceBike({ bike, sale: saleRec });
                            }}
                            className="inline-flex items-center px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all"
                            title="View / Print Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            <span>Invoice</span>
                          </button>
                        )}

                        {/* Quick Publish / Unpublish */}
                        <button
                          onClick={() => handleTogglePublish(bike)}
                          className={`p-2 rounded-lg border transition-all ${
                            isAvailable 
                              ? 'text-zinc-400 hover:text-amber-400 bg-zinc-900/40 border-white/5 hover:border-amber-400/30' 
                              : 'text-orange-400 hover:text-orange-300 bg-orange-500/10 border-orange-500/30'
                          }`}
                          title={isAvailable ? "Unpublish Bike (Move to Draft)" : "Publish to Customer Website"}
                        >
                          {isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Bike */}
                        <Link 
                          to={`/dealer-management/inventory/edit/${bike.id}`} 
                          className="p-2 text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg transition-all"
                          title="Edit Bike Specs & Images"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Bike */}
                        <button 
                          onClick={() => setBikeToDelete(bike)} 
                          className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-900/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-lg transition-all" 
                          title="Delete Bike Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout - Compact, small, dense dealer card */}
        <div className="block lg:hidden divide-y divide-white/5">
          {filteredVehicles.map(bike => {
            const isAvailable = bike.status === 'Available';
            const isSold = bike.status === 'Sold';

            return (
              <div key={bike.id} className="p-2.5 sm:p-3.5 space-y-2">
                <div className="flex space-x-2.5 items-center">
                  <div className="w-14 h-12 rounded-lg border border-white/10 overflow-hidden shrink-0 bg-black/60">
                    <SmartImage 
                      src={bike.images?.[0] || ""} 
                      fallbackSrc={VEHICLE_PLACEHOLDER_FALLBACK}
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="font-bold text-white text-xs truncate max-w-[170px]">{bike.make} {bike.model}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                        isAvailable ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                        isSold ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                        'border-zinc-700 text-zinc-400 bg-zinc-900'
                      }`}>
                        {bike.status}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-zinc-400 mt-0.5 font-mono uppercase tracking-wider truncate">
                      {bike.year} • {bike.bodyType || 'Bike'} • {bike.mileage.toLocaleString('en-IN')} KM
                    </p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="text-[9.5px] font-mono text-zinc-400 truncate">{bike.registration || "Reg: N/A"}</span>
                      <span className="text-xs font-bold text-white shrink-0">{formatPrice(bike.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Mobile Action Bar */}
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/[0.04]">
                  {!isSold ? (
                    <button
                      onClick={() => handleOpenSellModal(bike)}
                      className="py-1 px-2.5 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/30 rounded-lg text-[9.5px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>Sell & Bill</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const saleRec: SaleRecord = bike.saleInfo || {
                          invoiceNumber: generateInvoiceNumber(bike),
                          saleDate: new Date().toISOString().split('T')[0],
                          salePrice: bike.price,
                          finalAmount: bike.price,
                          customerName: "Valued Customer",
                          customerPhone: "+91 98201 12345",
                          paymentMethod: "Bank Transfer (NEFT/RTGS)",
                          paymentStatus: "Paid in Full",
                          amountPaid: bike.price,
                          balanceDue: 0
                        };
                        setPreviewInvoiceBike({ bike, sale: saleRec });
                      }}
                      className="py-1 px-2.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-[9.5px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Invoice</span>
                    </button>
                  )}

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(bike)}
                      className={`p-1.5 rounded-lg border ${
                        isAvailable 
                          ? 'text-zinc-400 bg-zinc-900 border-white/5' 
                          : 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                      }`}
                      title="Toggle Visibility"
                    >
                      {isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <Link 
                      to={`/dealer-management/inventory/edit/${bike.id}`} 
                      className="p-1.5 text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button 
                      onClick={() => setBikeToDelete(bike)} 
                      className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-900 border border-white/10 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
            No motorcycles found matching filter criteria.
          </div>
        )}
      </div>

      {/* MARK AS SOLD & GENERATE INVOICE MODAL */}
      {bikeToSell && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div 
            onClick={() => setBikeToSell(null)} 
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
          />
          <div className="bg-zinc-950 border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-2xl w-full relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-4 sm:mb-6">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-orange-400 uppercase tracking-widest font-bold block">
                  Official Dealership Sale
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white uppercase tracking-wider mt-0.5">
                  Sell Bike & Generate Invoice
                </h3>
              </div>
              <button 
                onClick={() => setBikeToSell(null)}
                className="p-1.5 sm:p-2 text-zinc-400 hover:text-white bg-zinc-900/60 rounded-full border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Bike Summary Header */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center space-x-3 sm:space-x-4">
              <div className="w-14 h-12 sm:w-16 sm:h-12 rounded-lg border border-white/10 overflow-hidden shrink-0 bg-black/60">
                <SmartImage 
                  src={bikeToSell.images?.[0] || ""} 
                  fallbackSrc={VEHICLE_PLACEHOLDER_FALLBACK}
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-sm sm:text-base truncate">{bikeToSell.year} {bikeToSell.make} {bikeToSell.model}</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 font-mono uppercase tracking-wider mt-0.5 truncate">
                  Reg: {bikeToSell.registration || 'N/A'} • {bikeToSell.engine || `${bikeToSell.engineCC || ''} cc`} • {bikeToSell.ownership}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400">List Price</div>
                <div className="text-sm sm:text-base font-bold text-orange-400 font-sans">{formatPrice(bikeToSell.price)}</div>
              </div>
            </div>

            {/* Customer Details Inputs */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold mb-2.5 sm:mb-3 border-b border-white/5 pb-1">
                  1. Customer & Identification Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Customer Full Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={saleFormData.customerName}
                      onChange={e => setSaleFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 98201 12345"
                      value={saleFormData.customerPhone}
                      onChange={e => setSaleFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      placeholder="customer@example.com"
                      value={saleFormData.customerEmail}
                      onChange={e => setSaleFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      ID Proof (Aadhar / PAN / DL)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Aadhar / PAN No."
                      value={saleFormData.customerIdentity}
                      onChange={e => setSaleFormData(prev => ({ ...prev, customerIdentity: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Residential / Delivery Address
                    </label>
                    <input 
                      type="text" 
                      placeholder="Flat / Building, Road, Area, Mumbai - PIN Code"
                      value={saleFormData.customerAddress}
                      onChange={e => setSaleFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sale & Pricing Breakdown */}
              <div>
                <h4 className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold mb-2.5 sm:mb-3 border-b border-white/5 pb-1">
                  2. Pricing & Delivery Charges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Agreed Vehicle Price (₹) *
                    </label>
                    <input 
                      type="number" 
                      required
                      value={saleFormData.salePrice}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSaleFormData(prev => {
                          const netRto = Number(prev.rtoCharges || 0);
                          const netDisc = Number(prev.discount || 0);
                          const total = Math.max(0, val + netRto - netDisc);
                          return {
                            ...prev, 
                            salePrice: val, 
                            amountPaid: prev.paymentStatus === 'Paid in Full' ? total : prev.amountPaid 
                          };
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      RTO & Docs Fee (₹)
                    </label>
                    <input 
                      type="number" 
                      value={saleFormData.rtoCharges}
                      onChange={e => {
                        const rto = Number(e.target.value);
                        setSaleFormData(prev => {
                          const netPrice = Number(prev.salePrice || 0);
                          const netDisc = Number(prev.discount || 0);
                          const total = Math.max(0, netPrice + rto - netDisc);
                          return {
                            ...prev,
                            rtoCharges: rto,
                            amountPaid: prev.paymentStatus === 'Paid in Full' ? total : prev.amountPaid
                          };
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Special Discount (₹)
                    </label>
                    <input 
                      type="number" 
                      value={saleFormData.discount}
                      onChange={e => {
                        const disc = Number(e.target.value);
                        setSaleFormData(prev => {
                          const netPrice = Number(prev.salePrice || 0);
                          const netRto = Number(prev.rtoCharges || 0);
                          const total = Math.max(0, netPrice + netRto - disc);
                          return {
                            ...prev,
                            discount: disc,
                            amountPaid: prev.paymentStatus === 'Paid in Full' ? total : prev.amountPaid
                          };
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Delivery Settlement */}
              <div>
                <h4 className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold mb-2.5 sm:mb-3 border-b border-white/5 pb-1">
                  3. Settlement & Handover Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Delivery Time
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 11:30 AM"
                      value={saleFormData.deliveryTime}
                      onChange={e => setSaleFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={saleFormData.paymentMethod}
                      onChange={e => setSaleFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    >
                      <option>Bank Transfer (NEFT/RTGS)</option>
                      <option>UPI</option>
                      <option>Cheque</option>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Finance / Loan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Payment Ref / UTR No.
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. UTR / Cheque Ref"
                      value={saleFormData.paymentRef}
                      onChange={e => setSaleFormData(prev => ({ ...prev, paymentRef: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={saleFormData.paymentStatus}
                      onChange={e => {
                        const status = e.target.value as any;
                        const finalAmt = Math.max(0, Number(saleFormData.salePrice) + Number(saleFormData.rtoCharges || 0) - Number(saleFormData.discount || 0));
                        setSaleFormData(prev => ({ 
                          ...prev, 
                          paymentStatus: status,
                          amountPaid: status === 'Paid in Full' ? finalAmt : prev.amountPaid
                        }));
                      }}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    >
                      <option>Paid in Full</option>
                      <option>Partial / Token</option>
                      <option>Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Amount Paid (₹)
                    </label>
                    <input 
                      type="number" 
                      value={saleFormData.amountPaid}
                      onChange={e => setSaleFormData(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-orange-400 outline-none focus:border-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                      Hypothecation / Loan
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Nil / Cleared"
                      value={saleFormData.hypothecation}
                      onChange={e => setSaleFormData(prev => ({ ...prev, hypothecation: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>
                </div>

                {/* Calculation summary pill */}
                <div className="mt-3.5 p-3 bg-zinc-900/60 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[9.5px]">Net Invoice Total:</span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {formatPrice(Math.max(0, Number(saleFormData.salePrice) + Number(saleFormData.rtoCharges || 0) - Number(saleFormData.discount || 0)))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBikeToSell(null)}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSaleAndInvoice}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono uppercase font-bold tracking-wider shadow-lg shadow-orange-900/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Invoice & Mark Sold</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* INVOICE PREVIEW & PRINT MODAL - Pristine Authentic Design */}
      {previewInvoiceBike && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          <div 
            onClick={() => setPreviewInvoiceBike(null)} 
            className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
          />
          <div className="bg-zinc-950 border border-white/20 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-w-4xl w-full relative z-10 shadow-2xl max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[9.5px] font-mono text-purple-400 uppercase tracking-widest font-bold block">
                  Official Sale Receipt & Delivery Challan
                </span>
                <h3 className="text-base sm:text-xl font-serif font-bold text-white uppercase tracking-wider mt-0.5 truncate max-w-xs sm:max-w-md">
                  #{previewInvoiceBike.sale.invoiceNumber}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => printInvoice(previewInvoiceBike.bike, previewInvoiceBike.sale)}
                  className="px-3 sm:px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-[11px] sm:text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button 
                  onClick={() => setPreviewInvoiceBike(null)}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Invoice Render: Clean, Crisp, Professional */}
            <div className="bg-white text-zinc-900 rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-inner overflow-x-auto text-[11px] sm:text-xs font-sans">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-zinc-900 pb-3 mb-4 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black m-0">PATEL MOTORS</h2>
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-orange-600 font-bold mt-0.5">
                    Buy, Sell & Exchange Premium Pre-Owned Two Wheelers
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-600 mt-1.5 leading-snug">
                    Showroom No. 4, L.B.S. Marg, Opp. Marathon Heights, Mulund West, Mumbai, MH - 400080<br />
                    Phone: +91 98201 55443 / +91 74001 13999 | Email: sales@patelmotors.in<br />
                    GSTIN: <strong className="font-mono text-zinc-800">27AABCP1234F1Z8</strong> | PAN: <strong className="font-mono text-zinc-800">AABCP1234F</strong> | State: <strong>27 (Maharashtra)</strong>
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono shrink-0">
                  <div className="inline-block bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                    Tax / Sale Invoice & Challan
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-black">#{previewInvoiceBike.sale.invoiceNumber}</div>
                  <div className="text-zinc-600 text-[10px] sm:text-[11px] mt-0.5">Date: {previewInvoiceBike.sale.saleDate}</div>
                  <div className="text-zinc-600 text-[10px] sm:text-[11px]">Time: {previewInvoiceBike.sale.deliveryTime || '11:00 AM IST'}</div>
                  <div className="font-bold text-[10px] sm:text-[11px] mt-0.5 text-emerald-700">
                    Status: {previewInvoiceBike.sale.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Two columns: Customer & Motorcycle Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <div className="text-[8.5px] font-bold uppercase tracking-wider font-mono text-zinc-500 mb-1.5 border-b border-zinc-200 pb-1">
                    1. Purchaser / Customer Details
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-black">{previewInvoiceBike.sale.customerName}</div>
                  <div className="text-[10.5px] text-zinc-700 mt-0.5">Phone: <strong>{previewInvoiceBike.sale.customerPhone}</strong></div>
                  {previewInvoiceBike.sale.customerEmail && (
                    <div className="text-[10px] text-zinc-700">Email: {previewInvoiceBike.sale.customerEmail}</div>
                  )}
                  {previewInvoiceBike.sale.customerAddress && (
                    <div className="text-[10px] text-zinc-700">Address: {previewInvoiceBike.sale.customerAddress}</div>
                  )}
                  {previewInvoiceBike.sale.customerIdentity && (
                    <div className="text-[10px] text-zinc-700 font-mono mt-0.5">
                      ID Proof (Aadhar/PAN): <strong>{previewInvoiceBike.sale.customerIdentity}</strong>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <div className="text-[8.5px] font-bold uppercase tracking-wider font-mono text-zinc-500 mb-1.5 border-b border-zinc-200 pb-1">
                    2. Motorcycle Particulars & RTO Record
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-black">
                    {previewInvoiceBike.bike.year} {previewInvoiceBike.bike.make} {previewInvoiceBike.bike.model} {previewInvoiceBike.bike.variant ? `(${previewInvoiceBike.bike.variant})` : ''}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-zinc-700 mt-1 font-mono">
                    <div>Reg No: <strong className="text-black">{previewInvoiceBike.bike.registration || 'N/A'}</strong></div>
                    <div>Odo: <strong className="text-black">{previewInvoiceBike.bike.mileage.toLocaleString('en-IN')} KM</strong></div>
                    <div>Chassis: <span className="text-zinc-800">{previewInvoiceBike.bike.chassisNumber || 'Verified on VIN'}</span></div>
                    <div>Engine: <span className="text-zinc-800">{previewInvoiceBike.bike.engineNumber || 'Verified'}</span></div>
                    <div>Ownership: <span className="text-zinc-800">{previewInvoiceBike.bike.ownership || '1st Owner'}</span></div>
                    <div>Fuel: <span className="text-zinc-800">{previewInvoiceBike.bike.fuelType || 'Petrol'}</span></div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 text-white text-[9.5px] uppercase font-mono font-bold tracking-wider">
                    <tr>
                      <th className="p-2 sm:p-2.5">Particulars / Goods Description</th>
                      <th className="p-2 sm:p-2.5 text-center">Year</th>
                      <th className="p-2 sm:p-2.5 text-center">Odometer</th>
                      <th className="p-2 sm:p-2.5 text-right">Agreed Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-sans text-[11px]">
                    <tr>
                      <td className="p-2.5">
                        <strong className="text-black text-xs">
                          {previewInvoiceBike.bike.make} {previewInvoiceBike.bike.model} {previewInvoiceBike.bike.variant || ''}
                        </strong>
                        <div className="text-[9.5px] text-zinc-500 mt-0.5">
                          Verified showroom delivery, certified clean title, 50-point technical check completed.
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-mono">{previewInvoiceBike.bike.year}</td>
                      <td className="p-2.5 text-center font-mono">{previewInvoiceBike.bike.mileage.toLocaleString('en-IN')} KM</td>
                      <td className="p-2.5 text-right font-mono font-bold text-black">
                        {formatPrice(previewInvoiceBike.sale.salePrice)}
                      </td>
                    </tr>
                    {(previewInvoiceBike.sale.rtoCharges || previewInvoiceBike.sale.taxAmount) ? (
                      <tr>
                        <td className="p-2.5">
                          <strong className="text-black text-xs">RTO Ownership Transfer & Documentation</strong>
                          <div className="text-[9.5px] text-zinc-500">Government fees, Forms 29 & 30 paperwork processing.</div>
                        </td>
                        <td className="p-2.5 text-center font-mono">-</td>
                        <td className="p-2.5 text-center font-mono">-</td>
                        <td className="p-2.5 text-right font-mono font-bold text-black">
                          {formatPrice(previewInvoiceBike.sale.rtoCharges || previewInvoiceBike.sale.taxAmount || 0)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Settlement and Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10.5px]">
                  <div className="text-[8.5px] font-bold uppercase tracking-wider font-mono text-zinc-500 mb-1 border-b border-zinc-200 pb-0.5">
                    Settlement & Payment Breakdown
                  </div>
                  <div className="space-y-1 mt-1 text-zinc-700">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <strong>{previewInvoiceBike.sale.paymentMethod}</strong>
                    </div>
                    {previewInvoiceBike.sale.paymentRef && (
                      <div className="flex justify-between">
                        <span>Transaction Ref / UTR:</span>
                        <strong className="font-mono">{previewInvoiceBike.sale.paymentRef}</strong>
                      </div>
                    )}
                    {previewInvoiceBike.sale.hypothecation && (
                      <div className="flex justify-between">
                        <span>Hypothecation:</span>
                        <strong>{previewInvoiceBike.sale.hypothecation}</strong>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-dashed border-zinc-200 text-[10px]">
                      <span className="text-zinc-500">Amount in Words:</span><br />
                      <strong className="text-black font-serif italic">
                        {numberToWordsIndian(previewInvoiceBike.sale.finalAmount)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-zinc-200 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-zinc-600">
                    <span>Agreed Vehicle Price:</span>
                    <span>{formatPrice(previewInvoiceBike.sale.salePrice)}</span>
                  </div>
                  {(previewInvoiceBike.sale.rtoCharges || previewInvoiceBike.sale.taxAmount) ? (
                    <div className="flex justify-between text-zinc-600">
                      <span>RTO / Charges:</span>
                      <span>+{formatPrice(previewInvoiceBike.sale.rtoCharges || previewInvoiceBike.sale.taxAmount || 0)}</span>
                    </div>
                  ) : null}
                  {Boolean(previewInvoiceBike.sale.discount) && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(previewInvoiceBike.sale.discount!)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black border-t-2 border-zinc-900 pt-1.5 text-black">
                    <span>Total Net Invoice:</span>
                    <span>{formatPrice(previewInvoiceBike.sale.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold text-[10.5px]">
                    <span>Amount Paid ({previewInvoiceBike.sale.paymentMethod}):</span>
                    <span>{formatPrice(previewInvoiceBike.sale.amountPaid)}</span>
                  </div>
                  {previewInvoiceBike.sale.balanceDue > 0 ? (
                    <div className="flex justify-between text-red-600 font-bold text-[10.5px]">
                      <span>Balance Due:</span>
                      <span>{formatPrice(previewInvoiceBike.sale.balanceDue)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-700 font-bold text-[10px]">
                      <span>Balance Due:</span>
                      <span>NIL (Fully Settled)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal Delivery Undertaking */}
              <div className="border-t border-zinc-200 pt-2.5 text-[9px] text-zinc-500 leading-relaxed">
                <strong>Delivery & Legal Undertaking:</strong> The purchaser acknowledges physical delivery and satisfactory inspection of the motorcycle. From date ({previewInvoiceBike.sale.saleDate}) and time ({previewInvoiceBike.sale.deliveryTime || '11:00 AM IST'}) of handover, all traffic fines, e-challans, third-party and Motor Vehicles Act liabilities rest exclusively with the purchaser. Patel Motors warrants clear unencumbered title and non-accidental chassis.
              </div>

              {/* Dual Signatures */}
              <div className="border-t border-dashed border-zinc-300 pt-3 mt-3 flex justify-between items-end text-[10px] text-zinc-500">
                <div className="text-center w-36">
                  <div className="w-full border-b border-zinc-400 mb-1"></div>
                  <div className="font-bold text-black uppercase">Purchaser Signature</div>
                  <div className="text-[9px]">{previewInvoiceBike.sale.customerName}</div>
                </div>
                <div className="text-center w-36">
                  <div className="w-full border-b border-zinc-400 mb-1"></div>
                  <div className="font-bold text-black uppercase">For PATEL MOTORS</div>
                  <div className="text-[9px]">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {bikeToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            onClick={() => setBikeToDelete(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
          />
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white tracking-wider uppercase">Confirm Bike Deletion</h3>
                <p className="text-sm text-zinc-300 font-sans mt-1">
                  Are you sure you want to remove this motorcycle record?
                </p>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 mt-3 text-xs text-zinc-400 font-mono">
                  <p className="text-white font-bold text-sm">{bikeToDelete.year} {bikeToDelete.make} {bikeToDelete.model}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mt-1">{bikeToDelete.registration || 'Reg: N/A'} • {formatPrice(bikeToDelete.price)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2 font-mono">
                <button
                  type="button"
                  onClick={() => setBikeToDelete(null)}
                  className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
