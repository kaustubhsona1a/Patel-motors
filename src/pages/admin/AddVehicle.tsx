import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { UploadCloud, X, Plus, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Camera, ShieldCheck, Sparkles, DollarSign, FileCheck, Layers } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../../context/VehicleContext';
import { Vehicle, BIKE_TYPES, VehicleStatus, formatPrice } from '../../data/mockData';
import { uploadMultipleImagesToStorage, deleteImagesFromStorage } from '../../lib/supabase';
import { processUploadFiles } from '../../lib/heic';
import { SmartImage } from '../../components/SmartImage';

const RECOMMENDED_ANGLES = [
  "Front View",
  "Rear View",
  "Left Profile",
  "Right Profile",
  "Handlebar / Dashboard",
  "Engine & Exhaust",
  "Front & Rear Tyres",
  "Odometer Reading",
  "Additional Detail"
];

export default function AdminAddVehicle() {
  const { vehicles, addVehicle, updateVehicle } = useVehicles();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isEditing = Boolean(id);

  // Track images uploaded in this session for cleanup if discarded
  const sessionUploadedImages = useRef<string[]>([]);
  const formSaved = useRef(false);

  useEffect(() => {
    return () => {
      if (!formSaved.current && sessionUploadedImages.current.length > 0) {
        deleteImagesFromStorage(sessionUploadedImages.current, 'vehicle-images').catch(() => {});
      }
    };
  }, []);

  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadNotice, setUploadNotice] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    registrationYear: new Date().getFullYear(),
    registration: '',
    price: '',
    purchasePrice: '',
    bodyType: 'Superbike',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: '',
    engine: '',
    engineCC: '',
    color: '',
    ownership: '1st Owner',
    insuranceStatus: 'Comprehensive (Valid)',
    rcStatus: 'Valid (Mumbai RTO)',
    serviceHistory: 'Complete Authorized Service Records',
    condition: 'Showroom Condition',
    location: 'Mumbai',
    chassisNumber: '',
    engineNumber: '',
    description: '',
    inspectionNotes: '',
    instagramReel: '',
    status: 'Available' as VehicleStatus,
    featured: false
  });

  const [images, setImages] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      const bike = vehicles.find(v => v.id === id);
      if (bike) {
        setFormData({
          make: bike.make,
          model: bike.model,
          variant: bike.variant || '',
          year: bike.year,
          registrationYear: bike.registrationYear || bike.year,
          registration: bike.registration || '',
          price: bike.price ? bike.price.toString() : '',
          purchasePrice: bike.purchasePrice ? bike.purchasePrice.toString() : '',
          bodyType: bike.bodyType || 'Superbike',
          fuelType: bike.fuelType || 'Petrol',
          transmission: bike.transmission || 'Manual',
          mileage: bike.mileage ? bike.mileage.toString() : '',
          engine: bike.engine || '',
          engineCC: bike.engineCC ? bike.engineCC.toString() : '',
          color: bike.color || '',
          ownership: bike.ownership || '1st Owner',
          insuranceStatus: bike.insuranceStatus || 'Comprehensive (Valid)',
          rcStatus: bike.rcStatus || 'Valid (Mumbai RTO)',
          serviceHistory: bike.serviceHistory || 'Complete Authorized Service Records',
          condition: bike.condition || 'Showroom Condition',
          location: bike.location || 'Mumbai',
          chassisNumber: bike.chassisNumber || '',
          engineNumber: bike.engineNumber || '',
          description: bike.description || '',
          inspectionNotes: bike.inspectionNotes || '',
          instagramReel: bike.instagramReel || '',
          status: bike.status || 'Available',
          featured: Boolean(bike.featured)
        });
        setImages(bike.images || []);
      }
    }
  }, [id, isEditing, vehicles]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const newImages = [...images];
    const [removed] = newImages.splice(draggedIdx, 1);
    newImages.splice(targetIdx, 0, removed);
    setImages(newImages);
    setDraggedIdx(null);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const rawFiles = Array.from(e.target.files) as File[];
      setIsCompressing(true);
      setUploadProgress({ current: 0, total: rawFiles.length });
      setUploadNotice({
        type: 'warning',
        message: 'Optimizing high-res bike photos for Supabase storage...'
      });

      try {
        const files = await processUploadFiles(rawFiles, (current, total) => {
          setUploadProgress({ current, total });
        });

        const { successful, failed } = await uploadMultipleImagesToStorage(
          files, 
          'vehicles', 
          'vehicle-images',
          (completed, total) => {
            setUploadProgress({ current: completed, total });
          }
        );
        
        if (successful.length > 0) {
          sessionUploadedImages.current.push(...successful);
          setImages(prev => [...prev, ...successful]);
        }

        if (failed.length === 0) {
          setUploadNotice({
            type: 'success',
            message: `All ${successful.length} photo${successful.length > 1 ? 's were' : ' was'} successfully optimized and stored in Supabase.`
          });
        } else if (successful.length > 0) {
          setUploadNotice({
            type: 'warning',
            message: `Uploaded ${successful.length} photo(s). ${failed.length} failed to process.`
          });
        } else {
          setUploadNotice({
            type: 'error',
            message: `Upload failed: ${failed[0]?.reason || 'Check storage connection.'}`
          });
        }
      } catch (err: any) {
        console.error('Image upload failed', err);
        setUploadNotice({
          type: 'error',
          message: err?.message || 'Failed to process images.'
        });
      } finally {
        setIsCompressing(false);
        setUploadProgress(null);
        e.target.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));

    try {
      if (urlToRemove && typeof urlToRemove === 'string' && urlToRemove.includes('supabase.co')) {
        const isEditingOriginal = isEditing && id && vehicles.find(v => v.id === id)?.images?.includes(urlToRemove);
        if (!isEditingOriginal) {
          await deleteImagesFromStorage([urlToRemove], 'vehicle-images');
          sessionUploadedImages.current = sessionUploadedImages.current.filter(u => u !== urlToRemove);
        }
      }
    } catch (err) {
      console.warn("Failed to delete image from storage:", err);
    }
  };

  const handleSaveDraft = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    formSaved.current = true;

    // For drafts, photos, VIN, and engine numbers are completely optional
    const bikePayload: Partial<Vehicle> = {
      make: formData.make.trim() || 'Draft Motorcycle',
      model: formData.model.trim() || 'Untitled',
      variant: formData.variant.trim(),
      year: Number(formData.year) || new Date().getFullYear(),
      registrationYear: Number(formData.registrationYear || formData.year) || new Date().getFullYear(),
      registration: formData.registration.trim().toUpperCase(),
      price: formData.price ? Number(formData.price) : 0,
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
      mileage: formData.mileage ? Number(formData.mileage) : 0,
      bodyType: formData.bodyType,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      engine: formData.engine.trim() || (formData.engineCC ? `${formData.engineCC} cc` : 'Standard'),
      engineCC: formData.engineCC ? Number(formData.engineCC) : undefined,
      color: formData.color.trim() || 'Standard',
      ownership: formData.ownership,
      insuranceStatus: formData.insuranceStatus,
      rcStatus: formData.rcStatus,
      serviceHistory: formData.serviceHistory,
      condition: formData.condition,
      location: formData.location,
      chassisNumber: formData.chassisNumber.trim() || undefined,
      engineNumber: formData.engineNumber.trim() || undefined,
      description: formData.description.trim(),
      inspectionNotes: formData.inspectionNotes.trim(),
      instagramReel: formData.instagramReel.trim(),
      status: 'Draft',
      featured: formData.featured,
      images: images || [], // Empty photos completely allowed for drafts
      features: []
    };

    if (isEditing && id) {
      updateVehicle(id, bikePayload);
    } else {
      const newBike: Vehicle = {
        id: 'bike_' + Date.now().toString(),
        make: bikePayload.make!,
        model: bikePayload.model!,
        variant: bikePayload.variant,
        year: bikePayload.year!,
        registrationYear: bikePayload.registrationYear,
        registration: bikePayload.registration,
        price: bikePayload.price!,
        purchasePrice: bikePayload.purchasePrice,
        mileage: bikePayload.mileage!,
        bodyType: bikePayload.bodyType,
        fuelType: bikePayload.fuelType!,
        transmission: bikePayload.transmission!,
        engine: bikePayload.engine!,
        engineCC: bikePayload.engineCC,
        color: bikePayload.color!,
        ownership: bikePayload.ownership!,
        insuranceStatus: bikePayload.insuranceStatus,
        rcStatus: bikePayload.rcStatus,
        serviceHistory: bikePayload.serviceHistory,
        condition: bikePayload.condition,
        location: bikePayload.location,
        chassisNumber: bikePayload.chassisNumber,
        engineNumber: bikePayload.engineNumber,
        description: bikePayload.description,
        inspectionNotes: bikePayload.inspectionNotes,
        instagramReel: bikePayload.instagramReel,
        status: 'Draft',
        featured: bikePayload.featured,
        images: images || [],
        features: []
      };
      addVehicle(newBike);
    }

    navigate('/dealer-management/inventory');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    formSaved.current = true;

    if (formData.status === 'Draft') {
      handleSaveDraft();
      return;
    }

    const bikePayload: Partial<Vehicle> = {
      make: formData.make.trim(),
      model: formData.model.trim(),
      variant: formData.variant.trim(),
      year: Number(formData.year),
      registrationYear: Number(formData.registrationYear || formData.year),
      registration: formData.registration.trim().toUpperCase(),
      price: Number(formData.price) || 0,
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
      mileage: Number(formData.mileage) || 0,
      bodyType: formData.bodyType,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      engine: formData.engine.trim() || (formData.engineCC ? `${formData.engineCC} cc` : 'Standard'),
      engineCC: formData.engineCC ? Number(formData.engineCC) : undefined,
      color: formData.color.trim() || 'Standard',
      ownership: formData.ownership,
      insuranceStatus: formData.insuranceStatus,
      rcStatus: formData.rcStatus,
      serviceHistory: formData.serviceHistory,
      condition: formData.condition,
      location: formData.location,
      chassisNumber: formData.chassisNumber.trim() || undefined,
      engineNumber: formData.engineNumber.trim() || undefined,
      description: formData.description.trim(),
      inspectionNotes: formData.inspectionNotes.trim(),
      instagramReel: formData.instagramReel.trim(),
      status: formData.status,
      featured: formData.featured,
      images: images || [],
      features: []
    };

    if (isEditing && id) {
      updateVehicle(id, bikePayload);
    } else {
      const newBike: Vehicle = {
        id: 'bike_' + Date.now().toString(),
        make: bikePayload.make!,
        model: bikePayload.model!,
        variant: bikePayload.variant,
        year: bikePayload.year!,
        registrationYear: bikePayload.registrationYear,
        registration: bikePayload.registration,
        price: bikePayload.price!,
        purchasePrice: bikePayload.purchasePrice,
        mileage: bikePayload.mileage!,
        bodyType: bikePayload.bodyType,
        fuelType: bikePayload.fuelType!,
        transmission: bikePayload.transmission!,
        engine: bikePayload.engine!,
        engineCC: bikePayload.engineCC,
        color: bikePayload.color!,
        ownership: bikePayload.ownership!,
        insuranceStatus: bikePayload.insuranceStatus,
        rcStatus: bikePayload.rcStatus,
        serviceHistory: bikePayload.serviceHistory,
        condition: bikePayload.condition,
        location: bikePayload.location,
        chassisNumber: bikePayload.chassisNumber,
        engineNumber: bikePayload.engineNumber,
        description: bikePayload.description,
        inspectionNotes: bikePayload.inspectionNotes,
        instagramReel: bikePayload.instagramReel,
        status: bikePayload.status!,
        featured: bikePayload.featured,
        images: images || [],
        features: []
      };
      addVehicle(newBike);
    }

    navigate('/dealer-management/inventory');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-6">
        <div>
          <Link 
            to="/dealer-management/inventory"
            className="inline-flex items-center text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Inventory
          </Link>
          <h1 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-wider uppercase">
            {isEditing ? 'Edit Motorcycle' : 'ACQUIRE BIKE'}
          </h1>
        </div>

        {/* Quick status selector */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-1.5 bg-zinc-900/80 border border-white/10 p-1 rounded-xl">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-1.5 hidden sm:inline">Status:</span>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'Available' }))}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
              formData.status === 'Available' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'Draft' }))}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
              formData.status === 'Draft' ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'Reserved' }))}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
              formData.status === 'Reserved' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reserved
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: BASIC MOTORCYCLE INFORMATION */}
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 sm:p-7 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <Layers className="w-4 h-4 text-orange-400" />
            <h2 className="font-serif font-bold text-white text-base uppercase tracking-wider">
              1. Motorcycle Identification & Specs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Brand / Make *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Kawasaki, Royal Enfield, BMW"
                value={formData.make}
                onChange={e => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Model Name *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Ninja ZX-10R, Continental GT 650"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Variant / Trim
              </label>
              <input 
                type="text" 
                placeholder="e.g. KRT Edition ABS, Mr Clean"
                value={formData.variant}
                onChange={e => setFormData({ ...formData, variant: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Category / Body Type
              </label>
              <select
                value={formData.bodyType}
                onChange={e => setFormData({ ...formData, bodyType: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              >
                {BIKE_TYPES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Manufacturing Year *
              </label>
              <input 
                type="number" 
                required
                min={2000}
                max={2030}
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Registration Year
              </label>
              <input 
                type="number" 
                min={2000}
                max={2030}
                value={formData.registrationYear}
                onChange={e => setFormData({ ...formData, registrationYear: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Registration Number *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. MH-02-FE-1000"
                value={formData.registration}
                onChange={e => setFormData({ ...formData, registration: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Kilometers Driven *
              </label>
              <input 
                type="number" 
                required
                min={0}
                placeholder="e.g. 5800"
                value={formData.mileage}
                onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Color & Livery
              </label>
              <input 
                type="text" 
                placeholder="e.g. Lime Green / Ebony"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ENGINE, MECHANICS & CONDITION */}
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 sm:p-7 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h2 className="font-serif font-bold text-white text-base uppercase tracking-wider">
              2. Powertrain, Condition & Mechanics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Engine Displacement (CC) *
              </label>
              <input 
                type="number" 
                placeholder="e.g. 998 or 650"
                value={formData.engineCC}
                onChange={e => setFormData({ ...formData, engineCC: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Engine Details / Spec
              </label>
              <input 
                type="text" 
                placeholder="e.g. 998 cc Liquid-Cooled Inline-4"
                value={formData.engine}
                onChange={e => setFormData({ ...formData, engine: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Fuel Type
              </label>
              <select
                value={formData.fuelType}
                onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              >
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Transmission / Shifter
              </label>
              <select
                value={formData.transmission}
                onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              >
                <option value="Manual">Manual (Standard 6-Speed)</option>
                <option value="Quickshifter">Quickshifter Up/Down</option>
                <option value="Automatic">Automatic / DCT</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Physical & Mechanical Condition
              </label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              >
                <option value="Showroom Condition">Showroom Condition</option>
                <option value="Mint">Mint / Flawless</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good / Well-Kept</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Current Location
              </label>
              <input 
                type="text" 
                placeholder="e.g. Mumbai (Dadar Showroom)"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: DOCUMENTATION & TITLE CREDENTIALS */}
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 sm:p-7 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <FileCheck className="w-4 h-4 text-orange-400" />
            <h2 className="font-serif font-bold text-white text-base uppercase tracking-wider">
              3. Documentation & Title Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Ownership History
              </label>
              <select
                value={formData.ownership}
                onChange={e => setFormData({ ...formData, ownership: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              >
                <option value="1st Owner">1st Owner</option>
                <option value="2nd Owner">2nd Owner</option>
                <option value="3rd Owner">3rd Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Insurance Status
              </label>
              <input 
                type="text" 
                placeholder="e.g. Comprehensive (Valid till Nov 2027)"
                value={formData.insuranceStatus}
                onChange={e => setFormData({ ...formData, insuranceStatus: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                RC / Registration Status
              </label>
              <input 
                type="text" 
                placeholder="e.g. Valid (Andheri RTO), Clear Title"
                value={formData.rcStatus}
                onChange={e => setFormData({ ...formData, rcStatus: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Service History Record
              </label>
              <input 
                type="text" 
                placeholder="e.g. Complete Authorized Workshop Records"
                value={formData.serviceHistory}
                onChange={e => setFormData({ ...formData, serviceHistory: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Chassis Number / VIN (Optional)
              </label>
              <input 
                type="text" 
                placeholder="Optional"
                value={formData.chassisNumber}
                onChange={e => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Engine Number (Optional)
              </label>
              <input 
                type="text" 
                placeholder="Optional"
                value={formData.engineNumber}
                onChange={e => setFormData({ ...formData, engineNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PRICING & MARGIN */}
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 sm:p-7 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <h2 className="font-serif font-bold text-white text-base uppercase tracking-wider">
              4. Acquisition Cost & Selling Price
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Cost of Acquisition / Purchase Price (₹)
              </label>
              <input 
                type="number" 
                placeholder="e.g. 1420000"
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono font-bold"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                Dealer-confidential. Stored securely for dealership profit accounting.
              </p>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Customer Selling Price (₹) *
              </label>
              <input 
                type="number" 
                required
                placeholder="e.g. 1580000"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-orange-500/50 rounded-xl text-orange-400 text-sm outline-none focus:border-orange-400 transition-all font-mono font-bold"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                Public showroom listing price displayed across customer website.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: MULTI-ANGLE BIKE PHOTO UPLOAD */}
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 sm:p-7 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <Camera className="w-4 h-4 text-orange-400" />
              <h2 className="font-serif font-bold text-white text-base uppercase tracking-wider">
                5. Motorcycle Gallery Upload (Supabase Storage)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                {images.length} Photos Uploaded
              </span>
              <span className="text-[9.5px] font-mono text-orange-400 uppercase bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                Optional for Draft
              </span>
            </div>
          </div>

          {/* Quick Option to save as draft without photos */}
          {images.length === 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-zinc-900/60 border border-white/10 rounded-xl">
              <div>
                <p className="text-white text-xs font-bold">Save as Draft without uploading photos?</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">Photos are not required for drafts. You can save now and upload photos later.</p>
              </div>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition-colors shrink-0 border border-white/10"
              >
                Save Draft Without Photos
              </button>
            </div>
          )}

          {/* Recommended Angles Guide */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2">
              Recommended Photo Angles for Patel Motors:
            </span>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-300">
              {RECOMMENDED_ANGLES.map(angle => (
                <span key={angle} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  {angle}
                </span>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-white/15 hover:border-white/40 rounded-2xl p-8 text-center transition-all bg-zinc-900/30">
            <input 
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              onChange={handleImageUpload}
              disabled={isCompressing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
                {isCompressing ? <Loader2 className="w-6 h-6 animate-spin text-orange-400" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  {isCompressing ? "Processing & Uploading Photos..." : "Click or Drag & Drop Motorcycle Photos"}
                </p>
                <p className="text-zinc-400 text-xs mt-1">
                  Upload multiple photos (JPG, PNG, WebP, Apple HEIC). Automatically compressed and stored on Supabase Storage.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Notice */}
          {uploadNotice && (
            <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2 border ${
              uploadNotice.type === 'success' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              uploadNotice.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {uploadNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {uploadNotice.type === 'warning' && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{uploadNotice.message}</span>
            </div>
          )}

          {/* Gallery Thumbnails with Drag to Re-Order */}
          {images.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                Current Gallery (First photo is cover image • Drag to rearrange):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, idx)}
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/15 group cursor-move bg-black/50"
                  >
                    <SmartImage 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-orange-500 text-black text-[8px] font-mono uppercase font-bold rounded shadow">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: DESCRIPTION & NOTES - Plain fields */}
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 sm:p-7 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <h2 className="font-serif font-bold text-white text-base uppercase tracking-wider">
              6. Description & Notes
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Description
              </label>
              <textarea 
                rows={4}
                placeholder="Enter description..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Notes
              </label>
              <textarea 
                rows={3}
                placeholder="Enter notes..."
                value={formData.inspectionNotes}
                onChange={e => setFormData({ ...formData, inspectionNotes: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10.5px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Instagram Reel URL (Optional)
              </label>
              <input 
                type="url" 
                placeholder="https://www.instagram.com/reel/..."
                value={formData.instagramReel}
                onChange={e => setFormData({ ...formData, instagramReel: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-white transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <Link 
            to="/dealer-management/inventory"
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono uppercase font-bold tracking-widest text-center"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-initial px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all border border-white/10"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={() => setFormData(prev => ({ ...prev, status: 'Available' }))}
              className="flex-1 sm:flex-initial px-8 py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all shadow-lg active:scale-95"
            >
              {isEditing ? 'Save Changes' : 'Save & Publish Bike'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
