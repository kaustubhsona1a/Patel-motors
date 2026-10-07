import React, { useState, FormEvent, useRef, DragEvent, ChangeEvent } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { uploadMultipleImagesToStorage } from '../lib/supabase';
import { processUploadFiles } from '../lib/heic';
import { 
  Upload, 
  X, 
  Loader2, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Bike
} from 'lucide-react';
import { 
  formatBikeSellWhatsAppMessage, 
  createWhatsAppUrl, 
  forwardToWhatsApp, 
  DEFAULT_DEALER_WHATSAPP 
} from '../lib/whatsapp';

export default function SellCar() {
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addLead, siteConfig } = useVehicles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [forwardedData, setForwardedData] = useState<{
    dealerUrl: string;
    customerUrl: string;
    dealerPhone: string;
    customerPhone: string;
    summary: {
      make: string;
      model: string;
      year: string;
      mileage: string;
      ownership: string;
      expectedPrice?: string;
      name: string;
      phone: string;
      photosCount: number;
    };
  } | null>(null);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    name: '',
    phone: '',
    ownership: 'First',
    expectedPrice: '',
    notes: ''
  });

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file: any) => 
        file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name)
      ) as File[];
      addFiles(filesArray);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files).filter((file: any) => 
        file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name)
      ) as File[];
      addFiles(filesArray);
    }
  };

  const addFiles = async (files: File[]) => {
    const processed = await processUploadFiles(files);
    setSelectedFiles(prev => [...prev, ...processed]);
    const urls = processed.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUploads = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    const path = `leads/l_${Date.now()}`;
    const { successful } = await uploadMultipleImagesToStorage(files, path, 'vehicle-images');
    return successful;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // 1. Process all selected images
      const uploadedImageUrls = await handleImageUploads(selectedFiles);
      
      // 2. Format details for lead recording
      const formattedMessage = `${formData.year} ${formData.make} ${formData.model} (${Number(formData.mileage).toLocaleString()} KM)\nOwnership: ${formData.ownership} Owner${formData.expectedPrice ? `\nExpected: ₹${Number(formData.expectedPrice).toLocaleString('en-IN')}` : ''}${formData.notes ? `\nNotes: ${formData.notes}` : ''}`;
      
      // 3. Save lead to context/database
      await addLead({
        name: formData.name,
        phone: formData.phone,
        car: formattedMessage,
        images: uploadedImageUrls,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year) || undefined,
        mileage: Number(formData.mileage) || undefined,
        ownership: formData.ownership,
        expectedPrice: formData.expectedPrice ? Number(formData.expectedPrice) : undefined,
        notes: formData.notes || undefined
      });

      // 4. Create concise WhatsApp text message
      const whatsappText = formatBikeSellWhatsAppMessage({
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        ownership: formData.ownership,
        expectedPrice: formData.expectedPrice,
        name: formData.name,
        phone: formData.phone,
        notes: formData.notes,
        images: uploadedImageUrls
      });

      // 5. Target numbers & WhatsApp links
      const dealerPhone = siteConfig?.whatsappNumber || DEFAULT_DEALER_WHATSAPP;
      const dealerUrl = createWhatsAppUrl(dealerPhone, whatsappText);
      const customerUrl = createWhatsAppUrl(formData.phone, whatsappText);

      setForwardedData({
        dealerUrl,
        customerUrl,
        dealerPhone,
        customerPhone: formData.phone,
        summary: {
          make: formData.make,
          model: formData.model,
          year: formData.year,
          mileage: formData.mileage,
          ownership: formData.ownership,
          expectedPrice: formData.expectedPrice,
          name: formData.name,
          phone: formData.phone,
          photosCount: uploadedImageUrls.length
        }
      });

      // 6. Forward directly to WhatsApp of the dealer
      forwardToWhatsApp(dealerPhone, whatsappText);
      
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failure:', err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      make: '', 
      model: '', 
      year: '', 
      mileage: '', 
      name: '', 
      phone: '', 
      ownership: 'First', 
      expectedPrice: '', 
      notes: '' 
    });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setForwardedData(null);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-10 font-sans text-zinc-300 z-10 relative">
      <div className="container mx-auto max-w-3xl px-3.5 sm:px-4">
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-cinzel font-bold tracking-wide uppercase text-white mb-2">Sell Your Bike</h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-normal max-w-xl mx-auto leading-relaxed font-sans">
            Submit your bike details for valuation. Instant inspection and direct payment.
          </p>
        </div>

        {submitted && forwardedData ? (
          <div className="frost-card p-6 sm:p-10 text-center rounded-2xl max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <MessageCircle className="w-7 h-7" />
            </div>

            <div>
              <span className="inline-block px-3 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-widest font-bold rounded-full mb-2">
                Forwarded to WhatsApp
              </span>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white uppercase">
                Bike Details Sent
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm mt-1 font-sans max-w-md mx-auto">
                Details are ready to send directly to WhatsApp for fast valuation.
              </p>
            </div>

            {/* Submission Summary Card */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 text-left font-sans text-xs space-y-2.5">
              <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                <span className="text-white font-bold text-sm">
                  {forwardedData.summary.year} {forwardedData.summary.make} {forwardedData.summary.model}
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  {Number(forwardedData.summary.mileage || 0).toLocaleString()} KM
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                <div>Ownership: <strong className="text-white">{forwardedData.summary.ownership} Owner</strong></div>
                {forwardedData.summary.expectedPrice ? (
                  <div>Expected: <strong className="text-white">₹{Number(forwardedData.summary.expectedPrice).toLocaleString()}</strong></div>
                ) : null}
                <div>Seller: <strong className="text-white">{forwardedData.summary.name}</strong></div>
                <div>Phone: <strong className="text-white">{forwardedData.summary.phone}</strong></div>
              </div>
              {forwardedData.summary.photosCount > 0 && (
                <div className="text-[10.5px] text-zinc-400 pt-1 border-t border-white/5">
                  Attached Photos: <strong className="text-white">{forwardedData.summary.photosCount} photos</strong>
                </div>
              )}
            </div>

            {/* WhatsApp Forwarding Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href={forwardedData.dealerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 font-sans cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Forward to Patel Motors WhatsApp (+91 84520 88500)</span>
              </a>

              <a
                href={forwardedData.customerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/20 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 font-sans cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                <span>Forward to Seller's WhatsApp (+91 {forwardedData.summary.phone})</span>
              </a>
            </div>

            <div className="pt-2 border-t border-white/10">
              <button 
                onClick={resetForm} 
                className="text-zinc-400 hover:text-white text-xs font-sans uppercase tracking-widest transition-colors py-1 cursor-pointer"
              >
                + Submit Another Bike
              </button>
            </div>
          </div>
        ) : (
          <div className="frost-card rounded-2xl p-4 sm:p-8 md:p-10 font-sans">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-4 sm:mb-5 border-b border-white/15 pb-2 font-cinzel">Bike Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="make" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Brand / Make</label>
                    <input id="make" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="e.g. Royal Enfield, Kawasaki, KTM" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="model" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Model</label>
                    <input id="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="e.g. GT 650, Ninja ZX-10R" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="year" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Registration Year</label>
                    <input id="year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="e.g. 2023" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="mileage" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Kilometers (KM)</label>
                    <input id="mileage" type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="e.g. 12000" required />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Ownership</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
                      {['First', 'Second', 'Third', 'Fourth+'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({...formData, ownership: opt})}
                          className={`py-2.5 px-3 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all border ${
                            formData.ownership === opt 
                              ? 'bg-white border-white text-black shadow-md'
                              : 'bg-black/40 border-white/20 text-zinc-300 hover:border-white/50 hover:text-white'
                          }`}
                        >
                          {opt} Owner
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="expectedPrice" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Expected Price (₹ Optional)</label>
                    <input id="expectedPrice" type="number" value={formData.expectedPrice} onChange={e => setFormData({...formData, expectedPrice: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="e.g. 250000 (leave blank if open for quote)" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-4 sm:mb-5 border-b border-white/15 pb-2 font-cinzel">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Your Name</label>
                    <input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="Enter name" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Phone Number (WhatsApp)</label>
                    <input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="+91" required />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notes" className="block text-[10px] tracking-wider uppercase text-zinc-300 font-sans font-bold">Notes (Optional)</label>
                <textarea id="notes" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-sans" placeholder="Condition, service history, accessories..." />
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-4 border-b border-white/15 pb-2 font-cinzel">Photos (Optional)</h3>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? 'border-white bg-white/10' 
                      : 'border-white/20 bg-black/40 hover:border-white/50 hover:bg-black/60'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    id="lead-photos"
                    type="file" 
                    multiple 
                    accept="image/*,.heic,.heif,image/heic,image/heif" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <Upload className="w-8 h-8 text-white mb-3" />
                  <p className="text-zinc-100 text-xs font-semibold uppercase tracking-wider font-sans">Drag and drop images here</p>
                  <p className="text-zinc-300 text-[10px] font-sans uppercase tracking-wider mt-1.5">or click to browse from device</p>
                </div>

                {/* Previews Grid */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-white/20 bg-black">
                        <img 
                          src={url} 
                          alt={`Upload Preview ${index + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-600 text-white rounded-lg opacity-95 hover:opacity-100 transition-all border border-white/20"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notice regarding WhatsApp Forwarding */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-sans">
                <MessageCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Details are forwarded directly to WhatsApp for rapid valuation.</span>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-white hover:bg-zinc-100 disabled:opacity-50 text-black py-3 sm:py-3.5 rounded-full uppercase tracking-wider text-[11px] sm:text-xs font-bold transition-all duration-300 font-sans shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Processing details...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-black text-white" />
                    <span>Submit & Forward to WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
