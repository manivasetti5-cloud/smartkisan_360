import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ShieldCheck,
  CloudSun,
  MapPin,
  Camera,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Coins,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  HelpCircle,
  UploadCloud,
  Layers,
  Map as MapIcon,
  ExternalLink,
  ChevronDown,
  User as UserIcon,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { User, WeatherData, CropSuggestion, CropDiseaseResult, MarketItem, LocationCoordinates } from '../types';
import LeafletMap from './LeafletMap';
import EditProfileModal from './EditProfileModal';
import { SupportedLanguage, translations } from '../translations';

interface FarmerPortalProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export default function FarmerPortal({ user, token, onLogout, onUserUpdate, currentLanguage, onLanguageChange }: FarmerPortalProps) {
  const t = translations[currentLanguage];
  
  // Geolocation & Weather
  const [coordinates, setCoordinates] = useState<LocationCoordinates>(
    user.location || { lat: 20.5937, lng: 78.9629, address: 'Farming Coordinate' }
  );
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [soilType, setSoilType] = useState<string>(user.soilType || 'Clayey');
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Sync user changes (from profile edits)
  useEffect(() => {
    if (user.location) {
      setCoordinates(user.location);
    }
    if (user.soilType) {
      setSoilType(user.soilType);
    }
  }, [user]);

  // Profile edit modal toggle
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Phase 1: Crop Prediction State
  const [predictingCrop, setPredictingCrop] = useState(false);
  const [predictionResult, setPredictionResult] = useState<CropSuggestion | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);
  
  // Phase 1 Extra: Manual Crop Selection & mode
  const [cropSelectionMode, setCropSelectionMode] = useState<'ai' | 'manual'>('ai');
  const [presetCropSelection, setPresetCropSelection] = useState<string>('Wheat');
  const [customCropName, setCustomCropName] = useState<string>('');

  // Phase 2: Plant Disease Diagnosis State
  const [selectedDiagnosisCrop, setSelectedDiagnosisCrop] = useState('Wheat');
  const [diseaseImageBase64, setDiseaseImageBase64] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<CropDiseaseResult | null>(null);
  const [diseaseError, setDiseaseError] = useState<string | null>(null);

  // Phase 3: Marketplace listings state
  const [listCropName, setListCropName] = useState('Wheat');
  const [listQuantity, setListQuantity] = useState('');
  const [listPriceCustomer, setListPriceCustomer] = useState('');
  const [listPriceDealer, setListPriceDealer] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [listingSuccess, setListingSuccess] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<MarketItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Editing marketplace listing state
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editPriceCustomer, setEditPriceCustomer] = useState('');
  const [editPriceDealer, setEditPriceDealer] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Benchmarks list
  const [benchmarks, setBenchmarks] = useState<any[]>([]);

  // Active Dashboard page tab
  const [activePage, setActivePage] = useState<'overview' | 'predict' | 'disease' | 'sell'>('overview');

  // Load weather & benchmarks
  useEffect(() => {
    fetchWeather();
    fetchBenchmarks();
    fetchMyListings();
  }, [coordinates.lat, coordinates.lng]);

  // Geocode coordinates whenever they change if they lack a real physical address
  useEffect(() => {
    const resolveAddress = async () => {
      if (!coordinates.lat || !coordinates.lng) return;
      if (coordinates.address && 
          coordinates.address !== 'Farming Coordinate' && 
          coordinates.address !== 'GPS Refreshed Coordinate' && 
          coordinates.address !== 'Resolving physical address...' &&
          coordinates.address !== 'GPS Localized Coordinate' &&
          coordinates.address !== 'Resolving address...') {
        return;
      }

      try {
        const response = await fetch(`/api/geocode?lat=${coordinates.lat}&lng=${coordinates.lng}`);
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setCoordinates(prev => ({
              ...prev,
              address: data.address
            }));
          }
        }
      } catch (err) {
        console.error('Error in address geocoder:', err);
      }
    };
    resolveAddress();
  }, [coordinates.lat, coordinates.lng]);

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const response = await fetch(`/api/weather?lat=${coordinates.lat}&lng=${coordinates.lng}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchBenchmarks = async () => {
    try {
      const response = await fetch('/api/benchmarks');
      if (response.ok) {
        const data = await response.json();
        setBenchmarks(data);
      }
    } catch (err) {
      console.error('Error fetching benchmarks:', err);
    }
  };

  const fetchMyListings = async () => {
    setLoadingListings(true);
    try {
      // Fetch all listings and filter on farmer ID
      const response = await fetch(`/api/market?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=100000`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((item: MarketItem) => item.farmerId === user.id);
        setMyListings(filtered);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  // Re-fetch current location
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
            address: 'Resolving physical address...',
          });
        },
        (err) => {
          alert('GPS Permissions blocked. Please enable geolocation permissions in your browser bar.');
        }
      );
    }
  };

  // Phase 1: Predict Crop Action
  const handlePredictCrop = async (selectedCropToQuery?: string) => {
    setPredictingCrop(true);
    setPredictError(null);
    try {
      const response = await fetch('/api/crop/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: coordinates.lat,
          lng: coordinates.lng,
          soilType,
          locationName: weather?.locationName,
          selectedCrop: selectedCropToQuery || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failure');
      }
      setPredictionResult(data);
      // Auto pre-populate selling portal name with the recommended/evaluated crop
      setListCropName(data.cropName);
    } catch (err: any) {
      setPredictError(err.message);
    } finally {
      setPredictingCrop(false);
    }
  };

  // Convert uploaded image file to base64
  const handleDiseaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiseaseImageBase64(reader.result as string);
        setDiseaseResult(null);
        setDiseaseError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Phase 2: Diagnose Disease Action
  const handleDiagnoseDisease = async () => {
    if (!diseaseImageBase64) return;
    setDiagnosing(true);
    setDiseaseError(null);
    try {
      const response = await fetch('/api/crop/disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: diseaseImageBase64,
          cropName: selectedDiagnosisCrop,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Disease analysis failed');
      }
      setDiseaseResult(data);
    } catch (err: any) {
      setDiseaseError(err.message);
    } finally {
      setDiagnosing(false);
    }
  };

  // Phase 3: List Crop on Marketplace
  const handleListHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingError(null);
    setListingSuccess(false);

    // Look up live benchmark price for this crop type
    const benchmarkItem = benchmarks.find((b) => b.cropName.toLowerCase() === listCropName.toLowerCase());
    const liveBenchmark = benchmarkItem ? benchmarkItem.standardPrice : 30.0;

    try {
      const response = await fetch('/api/market/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cropName: listCropName,
          quantity: listQuantity,
          price: listPriceCustomer,
          priceForCustomer: listPriceCustomer,
          priceForDealer: listPriceDealer,
          liveMarketPrice: liveBenchmark,
          location: coordinates,
          description: listDescription,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to list product');
      }

      setListingSuccess(true);
      setListQuantity('');
      setListPriceCustomer('');
      setListPriceDealer('');
      setListDescription('');
      fetchMyListings(); // refresh list
    } catch (err: any) {
      setListingError(err.message);
    }
  };

  // Delete Listing Action
  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to retract this crop listing from the local market?')) return;
    try {
      const response = await fetch(`/api/market/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchMyListings();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to delete listing.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Editing Listing
  const handleStartEdit = (item: MarketItem) => {
    setEditingListingId(item.id);
    setEditQuantity(String(item.quantity));
    setEditPriceCustomer(String(item.priceForCustomer ?? item.price));
    setEditPriceDealer(String(item.priceForDealer ?? item.price));
    setEditDescription(item.description || '');
  };

  // Save Edited Listing
  const handleSaveEdit = async (listingId: string) => {
    try {
      const response = await fetch(`/api/market/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: editQuantity,
          priceForCustomer: editPriceCustomer,
          priceForDealer: editPriceDealer,
          description: editDescription,
        }),
      });

      if (response.ok) {
        setEditingListingId(null);
        fetchMyListings();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to update listing.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingListingId(null);
  };

  return (
    <div className="bg-slate-950 min-h-screen pb-16 font-sans text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Professional Portal Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 rounded-b-2xl sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-black p-2.5 rounded-xl shadow-inner">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-white font-display">SmartKisan 360</span>
                <span className="bg-emerald-950/60 text-emerald-400 text-[10px] px-2.5 py-0.5 font-bold rounded-full uppercase tracking-wider border border-emerald-900/40">
                  {t.farmerPortal}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{t.welcome}, <strong className="text-white">{user.name}</strong> • Connected Securely</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            {/* Language Select Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Lang:</span>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-extrabold text-emerald-400 outline-none border-0 p-0 pr-6 cursor-pointer focus:ring-0"
              >
                <option value="en" className="bg-slate-950 text-white font-semibold">EN</option>
                <option value="hi" className="bg-slate-950 text-white font-semibold">हिंदी</option>
                <option value="te" className="bg-slate-950 text-white font-semibold">తెలుగు</option>
                <option value="ta" className="bg-slate-950 text-white font-semibold">தமிழ்</option>
                <option value="kn" className="bg-slate-950 text-white font-semibold">ಕನ್ನಡ</option>
              </select>
            </div>

            <button
              onClick={() => setShowProfileEdit(true)}
              className="bg-emerald-950/80 hover:bg-emerald-900/40 text-emerald-300 text-xs px-3.5 py-2.5 rounded-xl font-bold transition flex items-center space-x-1.5 border border-emerald-900/30 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.editProfile}</span>
            </button>
            <button
              onClick={handleDetectLocation}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold transition flex items-center space-x-1.5 border border-slate-700/60 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.detectGps}</span>
            </button>
            <button
              onClick={onLogout}
              className="bg-red-950/80 hover:bg-red-900/80 text-red-300 text-xs px-4 py-2.5 rounded-xl font-bold transition border border-red-900/30 cursor-pointer"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Unified Geolocation Coordinates & Address Banner */}
      <div className="bg-slate-900 border-b border-slate-800/50 py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-slate-300 w-full md:w-auto">
            <div className="bg-emerald-950/80 p-1.5 rounded-lg border border-emerald-900/40 shrink-0">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px] block">{t.currentAddress}</span>
              <span className="text-slate-100 font-medium block truncate md:max-w-2xl">
                {coordinates.address || 'Resolving location address...'}
              </span>
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 font-mono text-slate-400 flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
            <span>Lat: <strong className="text-white">{coordinates.lat.toFixed(6)}°N</strong></span>
            <span className="text-slate-600">•</span>
            <span>Lng: <strong className="text-white">{coordinates.lng.toFixed(6)}°E</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDEBAR NAVIGATION COLUMN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2">
              Farmer Services
            </span>
            <nav className="space-y-1">
              {/* TAB 1: OVERVIEW */}
              <button
                onClick={() => setActivePage('overview')}
                className={`w-full text-left px-3 py-3 rounded-xl font-medium transition flex items-center space-x-3 cursor-pointer group ${
                  activePage === 'overview'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border border-transparent'
                }`}
              >
                <Layers className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  activePage === 'overview' ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <div className="leading-tight">
                  <span className="block text-xs">Farm Overview</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-400 font-normal">Map & Live Weather</span>
                </div>
              </button>

              {/* TAB 2: CROP PREDICTION (PHASE 1) */}
              <button
                onClick={() => setActivePage('predict')}
                className={`w-full text-left px-3 py-3 rounded-xl font-medium transition flex items-center space-x-3 cursor-pointer group ${
                  activePage === 'predict'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border border-transparent'
                }`}
              >
                <Sprout className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  activePage === 'predict' ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <div className="leading-tight">
                  <span className="block text-xs">AI Crop Matcher</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-400 font-normal">Phase 1 Predictor</span>
                </div>
              </button>

              {/* TAB 3: DISEASE DIAGNOSIS (PHASE 2) */}
              <button
                onClick={() => setActivePage('disease')}
                className={`w-full text-left px-3 py-3 rounded-xl font-medium transition flex items-center space-x-3 cursor-pointer group ${
                  activePage === 'disease'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border border-transparent'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  activePage === 'disease' ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <div className="leading-tight">
                  <span className="block text-xs">Leaf Disease AI</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-400 font-normal">Phase 2 Diagnostics</span>
                </div>
              </button>

              {/* TAB 4: MARKETPLACE (PHASE 3) */}
              <button
                onClick={() => setActivePage('sell')}
                className={`w-full text-left px-3 py-3 rounded-xl font-medium transition flex items-center space-x-3 cursor-pointer group ${
                  activePage === 'sell'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border border-transparent'
                }`}
              >
                <Coins className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  activePage === 'sell' ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <div className="leading-tight">
                  <span className="block text-xs">Direct Selling</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-400 font-normal">Phase 3 Marketplace</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Quick Info box inside the sidebar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
              Active Session Info
            </span>
            <div className="bg-slate-950/60 p-3 rounded-xl space-y-1.5 border border-slate-800/40 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Soil Condition:</span>
                <span className="text-emerald-400 font-bold">{soilType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Connection:</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                  <span>Active</span>
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/50 space-y-1.5">
                <div className="text-[10px] font-mono text-slate-500 text-center">
                  Lat: {coordinates.lat.toFixed(4)} • Lng: {coordinates.lng.toFixed(4)}
                </div>
                {coordinates.address && (
                  <div className="text-[10px] text-slate-300 text-center bg-slate-900/60 p-2 rounded border border-slate-800/40 font-medium break-words leading-tight">
                    📍 {coordinates.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PAGE 1: OVERVIEW & MAP STATION */}
          {activePage === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <h2 className="text-lg font-bold text-white font-display">Farm Meteorological & Geolocation Center</h2>
                <p className="text-xs text-slate-400">
                  Monitor active spatial parameters, live climate patterns, and crop marketplace pricing from this hub.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather Widget */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2 font-display">
                    <CloudSun className="w-4 h-4 text-emerald-400" />
                    <span>Live Meteorological Weather</span>
                  </h3>

                  {loadingWeather ? (
                    <div className="py-6 text-center text-xs text-slate-500 animate-pulse">Syncing satellite climate indexes...</div>
                  ) : weather ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-4xl font-black text-white">{weather.temperature}°C</span>
                          <span className="text-xs text-slate-400 block font-medium mt-0.5">{weather.condition}</span>
                        </div>
                        <span className="text-3xl">☀️</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/30">💧 Humid: <strong className="text-white">{weather.humidity}%</strong></div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/30">💨 Wind: <strong className="text-white">{weather.windSpeed} km/h</strong></div>
                      </div>
                      <div className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/40 font-medium flex flex-col gap-1">
                        <div className="flex items-center space-x-1 font-mono text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
                        </div>
                        {coordinates.address && (
                          <div className="text-slate-300 mt-0.5 border-t border-slate-800/40 pt-1">
                            <span className="text-slate-500 text-[9px] font-bold block uppercase tracking-wide">Physical Address:</span>
                            <span className="break-words leading-tight block mt-0.5">{coordinates.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Weather Warning Alerts */}
                      {weather.alert && (
                        <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                          weather.alert.severity === 'danger'
                            ? 'bg-red-950/40 text-red-300 border-red-900/30'
                            : 'bg-amber-950/30 text-amber-300 border-amber-900/20'
                        }`} id="weather-alert-box">
                          <p className="font-bold flex items-center space-x-1.5 uppercase text-[10px] tracking-wide text-amber-400">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{weather.alert.severity === 'danger' ? 'Extreme Hazard Warning' : 'Climate Hazard Warning'}</span>
                          </p>
                          <p className="leading-relaxed text-slate-300">{weather.alert.message}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No climate indices synced.</p>
                  )}
                </div>

                {/* Daily MSP Benchmark Prices */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2 font-display">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>Government Benchmark (MSP) Index</span>
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    {benchmarks.length > 0 ? (
                      benchmarks.map((bench, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-2.5 border-b border-slate-800/40 last:border-0 last:pb-0">
                          <span className="text-slate-300 font-sans font-semibold">{bench.cropName}</span>
                          <div className="text-right">
                            <span className="font-bold text-white">₹{bench.standardPrice}/kg</span>
                            <span className="text-[10px] text-emerald-400 ml-1.5">{bench.trend}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-500">Loading government MSP survey trends...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Viewer Widget */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 font-display">
                    <MapIcon className="w-4 h-4 text-emerald-400" />
                    <span>Interactive Farm & Marketplace Map</span>
                  </h3>
                  <span className="text-[9px] bg-emerald-950/60 text-emerald-400 px-2.5 py-0.5 font-bold rounded-full uppercase tracking-wider border border-emerald-900/40">
                    OpenStreetMap Live
                  </span>
                </div>

                {/* REAL LEAFLET MAP WITH ACTIVE SATELLITE TERRAIN OVERLAYS */}
                <div className="h-96 rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner z-10">
                  <LeafletMap center={{ lat: coordinates.lat, lng: coordinates.lng }} mainMarkerColor="#10b981" />
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: CROP PREDICTION PANEL (PHASE 1) */}
          {activePage === 'predict' && (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 animate-fade-in">
              <div className="border-b border-slate-800/80 pb-4">
                <div className="inline-flex items-center space-x-2 bg-emerald-950/40 text-emerald-400 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-900/30">
                  <span>Phase 1 Crop Prediction Model</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
                  Soil & Future Price Market Match Prediction
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Utilize server-side deep learning prompts to match localized government crop directories, soil surveys, weather cycles, and project price indices 6 months ahead.
                </p>
              </div>

              {/* Prediction Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/60 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setCropSelectionMode('ai');
                    setPredictError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    cropSelectionMode === 'ai'
                      ? 'bg-emerald-600 text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  🤖 AI Crop Recommendation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCropSelectionMode('manual');
                    setPredictError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    cropSelectionMode === 'manual'
                      ? 'bg-emerald-600 text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  🌾 Select a Crop (Manual Suitability)
                </button>
              </div>

              {/* Input Selection parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Soil Condition (Surveys Update)</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold outline-none text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 transition-all"
                  >
                    <option value="Clayey">Clayey (Retains water well, ideal for Rice)</option>
                    <option value="Sandy">Sandy (Well-draining, ideal for potatoes)</option>
                    <option value="Loamy">Loamy (Balanced fertility, ideal for Wheat)</option>
                    <option value="Black">Black Soil (High clay content, ideal for Cotton)</option>
                    <option value="Red">Red Soil (Iron-rich, ideal for oilseeds)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Geo Coordinate</label>
                  <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-xs font-mono text-slate-300 flex justify-between items-center">
                    <span>{coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-900/30">Satellite Synced</span>
                  </div>
                </div>
              </div>

              {/* Manual Crop Selection Panel if mode is manual */}
              {cropSelectionMode === 'manual' && (
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose a Popular Crop</label>
                    <select
                      value={presetCropSelection}
                      onChange={(e) => setPresetCropSelection(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold outline-none text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 transition-all"
                    >
                      <option value="Wheat">Wheat</option>
                      <option value="Rice">Rice</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Potato">Potato</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Maize">Maize</option>
                      <option value="Mustard">Mustard</option>
                      <option value="Groundnut">Groundnut</option>
                      <option value="Soybean">Soybean</option>
                      <option value="Custom">-- Type Custom Crop --</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {presetCropSelection === 'Custom' ? 'Type Custom Crop Name *' : 'Selected Crop Name'}
                    </label>
                    {presetCropSelection === 'Custom' ? (
                      <input
                        type="text"
                        required
                        value={customCropName}
                        onChange={(e) => setCustomCropName(e.target.value)}
                        placeholder="e.g. Garlic, Ginger, Barley"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold outline-none text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 transition-all"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400 font-mono">
                        {presetCropSelection}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  const targetCrop = cropSelectionMode === 'manual' 
                    ? (presetCropSelection === 'Custom' ? customCropName.trim() : presetCropSelection) 
                    : undefined;
                  if (cropSelectionMode === 'manual' && presetCropSelection === 'Custom' && !customCropName.trim()) {
                    setPredictError('Please specify a custom crop name first.');
                    return;
                  }
                  handlePredictCrop(targetCrop);
                }}
                disabled={predictingCrop}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-black font-extrabold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 text-xs cursor-pointer"
              >
                <span>
                  {predictingCrop 
                    ? 'Processing Suitability Assessment...' 
                    : cropSelectionMode === 'manual' 
                      ? `Analyze ${presetCropSelection === 'Custom' ? (customCropName || 'Custom Crop') : presetCropSelection} Suitability`
                      : 'Execute AI Crop Prediction'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* ERROR IF PREDICTION FAIL */}
              {predictError && (
                <div className="bg-red-950/30 border border-red-900/40 text-red-300 p-4 rounded-xl text-xs">
                  {predictError}
                </div>
              )}

              {/* PREDICTION RESULTS SCREEN */}
              {predictionResult && (
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Recommended Crop */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Recommended Crop</span>
                      <span className="text-2xl font-black text-emerald-400 block font-display">{predictionResult.cropName}</span>
                      <div className="inline-flex items-center justify-center space-x-1 bg-emerald-950/60 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-900/30 mt-1">
                        <span>{predictionResult.confidenceScore}% Match</span>
                      </div>
                    </div>

                    {/* Harvest Timeline */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Timeline to Harvest</span>
                      <span className="text-2xl font-black text-white block font-display">{predictionResult.expectedHarvestMonths} Months</span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">Est: {predictionResult.yieldEstimation}</span>
                    </div>

                    {/* Pricing Prediction Index */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Harvest Price Index</span>
                      <div className="flex items-center justify-center space-x-1.5 mt-1">
                        <span className="text-slate-500 line-through text-xs">₹{predictionResult.currentMarketPrice}</span>
                        <span className="text-2xl font-black text-emerald-400 font-display">₹{predictionResult.predictedHarvestPrice}</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 block font-bold font-mono mt-1">+{Math.round(((predictionResult.predictedHarvestPrice - predictionResult.currentMarketPrice)/predictionResult.currentMarketPrice)*100)}% projected markup</span>
                    </div>

                  </div>

                  {/* Crop Reasoning Explanations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                      <strong className="text-emerald-400 block mb-1.5 font-display">🌦️ Climate Adaptability Analysis:</strong>
                      <p className="text-slate-300 leading-normal">{predictionResult.climateReasoning}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                      <strong className="text-emerald-400 block mb-1.5 font-display">🌱 Soil Chemistry Analysis:</strong>
                      <p className="text-slate-300 leading-normal">{predictionResult.soilReasoning}</p>
                    </div>
                  </div>

                  {/* WEEK-BY-WEEK CULTIVATION SCHEDULE */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2 font-display">
                      Milestone Week Cultivation Schedule Guide
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {predictionResult.schedule.map((step, idx) => (
                        <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 flex items-start space-x-3.5 shadow-sm">
                          <div className="bg-emerald-950/80 text-emerald-400 font-bold text-xs w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-emerald-900/30 font-mono">
                            W {step.week}
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-bold text-white text-xs">{step.title}</h5>
                            <p className="text-xs text-slate-400 leading-relaxed">{step.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* PAGE 3: CROP DISEASE DIAGNOSTICS VISION (PHASE 2) */}
          {activePage === 'disease' && (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 animate-fade-in">
              <div className="border-b border-slate-800/80 pb-4">
                <div className="inline-flex items-center space-x-2 bg-teal-950/40 text-teal-400 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-teal-900/30">
                  <span>Phase 2 Gemini Vision Health Check</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
                  Crop Leaf Disease Diagnostics
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Is there any disease occurring? Select the crop, upload a photograph of your crop leaf, and Gemini's vision model will diagnose the exact pathogen/rust disease, suggest pesticide controls, and estimate standard prices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop Type</label>
                  <select
                    value={selectedDiagnosisCrop}
                    onChange={(e) => setSelectedDiagnosisCrop(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold outline-none text-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/15 transition-all"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Potato">Potato</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>

                {/* Photo select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Crop leaf Photograph</label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer bg-slate-855 hover:bg-slate-800 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700/60 flex items-center space-x-1.5 transition">
                      <UploadCloud className="w-4 h-4 text-slate-400" />
                      <span>Choose Leaf Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDiseaseImageUpload}
                        className="hidden"
                      />
                    </label>
                    {diseaseImageBase64 && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1 font-mono">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Loaded</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected leaf preview box */}
              {diseaseImageBase64 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-sm flex flex-col items-center">
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-2 font-mono">Leaf Photograph Preview:</p>
                  <img
                    src={diseaseImageBase64}
                    alt="Crop Leaf Preview"
                    className="h-36 object-cover rounded-lg border border-slate-800"
                  />
                </div>
              )}

              <button
                onClick={handleDiagnoseDisease}
                disabled={diagnosing || !diseaseImageBase64}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-black font-extrabold py-3.5 rounded-xl transition text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-teal-500/10 cursor-pointer"
              >
                <span>{diagnosing ? 'Analyzing plant leaf image in server...' : 'Submit Leaf to Gemini Vision Analyzer'}</span>
              </button>

              {diseaseError && (
                <div className="bg-red-950/30 border border-red-900/40 text-red-300 p-4 rounded-xl text-xs">
                  {diseaseError}
                </div>
              )}

              {/* DISEASE OUTCOME METRIC */}
              {diseaseResult && (
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Diagnosed Condition</span>
                      <span className="text-lg font-black text-white block font-display">{diseaseResult.diseaseName}</span>
                    </div>
                    <span className="bg-yellow-950/60 text-yellow-400 font-bold text-xs px-3 py-1 rounded-full border border-yellow-900/30">
                      {diseaseResult.confidence}% Diagnostic Confidence
                    </span>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block mb-2">🔍 Observed Leaf Symptoms:</span>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                      {diseaseResult.symptoms.map((sym, i) => (
                        <li key={i}>{sym}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">💊 Suggested Pesticide & Remedies Treatment:</span>
                    {diseaseResult.recommendedPesticides.map((pest, i) => (
                      <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs text-teal-400 font-bold">{pest.name}</strong>
                          <span className="text-[10px] font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                            Price: {pest.estimatedPriceRange}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{pest.applicationInstructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 4: HARVEST MARKET SELLING PORTAL (PHASE 3) */}
          {activePage === 'sell' && (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 animate-fade-in">
              <div className="border-b border-slate-800/80 pb-4">
                <div className="inline-flex items-center space-x-2 bg-blue-950/40 text-blue-400 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-blue-900/30">
                  <span>Phase 3 Local Direct Selling Portal</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
                  Direct Selling Radius Marketplace
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Post crop quantities directly to consumers and bulk dealers in your local area. You set your own prices dynamically based on the current live government index benchmarks!
                </p>
              </div>

              {listingSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 p-4 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Your harvest item listing has been successfully published for buyers!</span>
                </div>
              )}

              {listingError && (
                <div className="bg-red-950/30 border border-red-900/40 text-red-300 p-4 rounded-xl text-xs">
                  {listingError}
                </div>
              )}

              {/* List Item form */}
              <form onSubmit={handleListHarvest} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop Harvest</label>
                  <select
                    value={listCropName}
                    onChange={(e) => setListCropName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold outline-none text-slate-200 focus:border-emerald-500 transition-all"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Potato">Potato</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={listQuantity}
                    onChange={(e) => setListQuantity(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium outline-none text-white focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Price (₹ / kg)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={listPriceCustomer}
                    onChange={(e) => setListPriceCustomer(e.target.value)}
                    placeholder="e.g. 28.0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium outline-none text-white focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dealer Price (₹ / kg)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={listPriceDealer}
                    onChange={(e) => setListPriceDealer(e.target.value)}
                    placeholder="e.g. 25.0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium outline-none text-white focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Trading Notes (Quality, Transport, etc.)</label>
                  <textarea
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    placeholder="e.g. Certified organic loamy field harvested last week. Available for immediate farmgate pickup or localized delivery."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium outline-none text-white h-16 resize-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="md:col-span-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold py-3 rounded-xl text-xs transition shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Publish New Active Harvest Offer
                </button>
              </form>

              {/* List of my active listings */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  My Active Harvest Offers Published Online:
                </h4>
                
                {loadingListings ? (
                  <div className="text-center py-4 text-xs text-slate-500 animate-pulse">Updating listings...</div>
                ) : myListings.length > 0 ? (
                  <div className="space-y-2">
                    {myListings.map((item) => {
                      const isEditing = editingListingId === item.id;
                      return (
                        <div key={item.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                                <span className="text-xs font-bold text-white">Editing: {item.cropName}</span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black p-1.5 rounded-lg transition text-xs font-bold flex items-center space-x-1 cursor-pointer"
                                    title="Save Changes"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded-lg transition text-xs font-bold flex items-center space-x-1 cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Quantity (kg)</label>
                                  <input
                                    type="number"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-white focus:border-emerald-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Cust. Price (₹/kg)</label>
                                  <input
                                    type="number"
                                    value={editPriceCustomer}
                                    onChange={(e) => setEditPriceCustomer(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-white focus:border-emerald-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Dealer Price (₹/kg)</label>
                                  <input
                                    type="number"
                                    value={editPriceDealer}
                                    onChange={(e) => setEditPriceDealer(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-white focus:border-emerald-500"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Notes</label>
                                <textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-white focus:border-emerald-500 h-12 resize-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <strong className="text-xs text-white">{item.cropName}</strong>
                                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold border border-slate-700/30">
                                    Qty: {item.quantity} kg
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Customer Price: <strong className="text-emerald-400">₹{item.priceForCustomer ?? item.price}/kg</strong> • Dealer Price: <strong className="text-blue-400">₹{item.priceForDealer ?? item.price}/kg</strong> • Daily MSP Reference: ₹{item.liveMarketPrice}/kg
                                </p>
                                {item.description && (
                                  <p className="text-[10px] text-slate-500 italic mt-0.5">Note: {item.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 p-2 rounded-xl transition cursor-pointer"
                                  title="Edit Listing"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteListing(item.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950/50 p-2 rounded-xl transition cursor-pointer"
                                  title="Delete Listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No crops currently listed for sale. Fill the form to launch your selling portal.</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      <EditProfileModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        user={user}
        token={token}
        onUserUpdate={onUserUpdate}
      />
    </div>
  );
}
