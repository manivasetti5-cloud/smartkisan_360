import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ShoppingBag,
  MapPin,
  Phone,
  Info,
  ChevronRight,
  Filter,
  CheckCircle,
  HelpCircle,
  User as UserIcon,
} from 'lucide-react';
import { User, MarketItem, LocationCoordinates } from '../types';
import LeafletMap from './LeafletMap';
import EditProfileModal from './EditProfileModal';
import { SupportedLanguage, translations } from '../translations';

interface CustomerPortalProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export default function CustomerPortal({ user, token, onLogout, onUserUpdate, currentLanguage, onLanguageChange }: CustomerPortalProps) {
  const t = translations[currentLanguage];

  const [coordinates, setCoordinates] = useState<LocationCoordinates>(
    user.location || { lat: 20.5937, lng: 78.9629, address: 'Customer Location' }
  );

  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Sync profile edits immediately
  useEffect(() => {
    if (user.location) {
      setCoordinates(user.location);
    }
  }, [user]);
  
  const [radius, setRadius] = useState<number>(10); // Default 10km radius
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCrop, setFilterCrop] = useState('All');
  
  // Selected listing for buy/contact popup
  const [selectedListing, setSelectedListing] = useState<any | null>(null);

  useEffect(() => {
    fetchListings();
  }, [coordinates.lat, coordinates.lng, radius]);

  // Geocode coordinates whenever they change if they lack a real physical address
  useEffect(() => {
    const resolveAddress = async () => {
      if (!coordinates.lat || !coordinates.lng) return;
      if (coordinates.address && 
          coordinates.address !== 'Customer Location' && 
          coordinates.address !== 'GPS Coordinate' && 
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

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Error fetching marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger GPS locator
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
          alert('GPS permission blocked. Please enable geolocation to locate crop sellers nearby.');
        }
      );
    }
  };

  // Filter listings based on crop selector
  const filteredListings = filterCrop === 'All' 
    ? listings 
    : listings.filter(item => item.cropName.toLowerCase() === filterCrop.toLowerCase());

  // Generate distinct crop list for selector
  const distinctCrops = ['All', ...Array.from(new Set(listings.map(item => item.cropName)))];

  return (
    <div className="bg-slate-950 min-h-screen pb-16 font-sans text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Top Banner */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 rounded-b-2xl sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-black p-2.5 rounded-xl shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-white font-display">SmartKisan 360</span>
                <span className="bg-teal-950/60 text-teal-400 text-[10px] px-2.5 py-0.5 font-bold rounded-full uppercase tracking-wider border border-teal-900/40">
                  {t.customerPortal}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{t.welcome}, <strong className="text-white">{user.name}</strong> • Local Sourcing Active</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            {/* Language Select Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Lang:</span>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-extrabold text-teal-400 outline-none border-0 p-0 pr-6 cursor-pointer focus:ring-0 animate-fade-in"
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
              className="bg-teal-950/80 hover:bg-teal-900/40 text-teal-300 text-xs px-3.5 py-2.5 rounded-xl font-bold transition flex items-center space-x-1.5 border border-teal-900/30 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.editProfile}</span>
            </button>
            <button
              onClick={handleDetectLocation}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold transition flex items-center space-x-1.5 border border-slate-700/60 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
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
            <div className="bg-teal-950/80 p-1.5 rounded-lg border border-teal-900/40 shrink-0">
              <MapPin className="w-4 h-4 text-teal-400" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px] block">{t.currentAddress}</span>
              <span className="text-slate-100 font-medium block truncate md:max-w-2xl">
                {coordinates.address || 'Resolving location address...'}
              </span>
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 font-mono text-slate-400 flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse shrink-0"></span>
            <span>Lat: <strong className="text-white">{coordinates.lat.toFixed(6)}°N</strong></span>
            <span className="text-slate-600">•</span>
            <span>Lng: <strong className="text-white">{coordinates.lng.toFixed(6)}°E</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FILTERS & GEOLOCATION MAP */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Spatial controls */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-2 font-display">
              <Filter className="w-4 h-4 text-teal-400" />
              <span>Radius Filtering</span>
            </h3>

            {/* Slider to filter distance */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Maximum Radius distance:</span>
                <span className="text-teal-400 font-bold">{radius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full accent-teal-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer border border-slate-800"
              />
              <p className="text-[10px] text-slate-500 leading-normal font-mono">Harness Haversine math to find crops planted within {radius}km of your GPS location.</p>
            </div>

            {/* Crop Categorization tab selector */}
            <div className="space-y-2 pt-2 border-t border-slate-805">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Crop Variety</label>
              <div className="flex flex-wrap gap-1.5">
                {distinctCrops.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setFilterCrop(crop)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                      filterCrop === crop
                        ? 'bg-teal-500 text-black border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map showing sellers */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 font-display">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Local Crop Geolocation Pins</span>
            </h3>

            <div className="h-48 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner z-10">
              <LeafletMap
                center={{ lat: coordinates.lat, lng: coordinates.lng }}
                address={coordinates.address}
                mainMarkerColor="#0d9488"
                markers={filteredListings.map((item) => ({
                  id: item.id,
                  lat: item.location.lat,
                  lng: item.location.lng,
                  label: `${item.cropName} - ₹${item.priceForCustomer ?? item.price}/kg (${item.quantity}kg)`,
                  color: '#16a34a',
                  address: item.location.address,
                }))}
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DIRECT FARMER SELLING ACTIVE OFFERS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
                Verified Local Farm Harvests Published Nearby
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connecting you directly with the registered farmers within your selected radius. Pre-cultivation parameters and details are hidden under secure confidentiality codes.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500 animate-pulse text-xs font-mono">Scanning surrounding farmlands for crop offers...</div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/60 hover:bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-250"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-teal-950 text-teal-400 px-2.5 py-0.5 rounded-md font-bold border border-teal-900/30">
                            {item.cropName}
                          </span>
                          <h4 className="text-base font-bold text-white mt-2 font-display">{item.cropName} Harvest</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-teal-400 block font-display">₹{item.priceForCustomer ?? item.price} <span className="text-xs font-normal text-slate-500">/ kg</span></span>
                          <span className="text-[9px] text-slate-500 font-mono block mt-1">Benchmark: ₹{item.liveMarketPrice}/kg</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-850 pt-3">
                        <div className="flex items-center space-x-1.5">
                          <span>📦 Available Quantity:</span>
                          <strong className="text-slate-200 font-bold">{item.quantity} kg</strong>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Farmer is <strong>{item.distance} km</strong> away</span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 italic leading-tight pt-2 border-t border-slate-850 mt-2 font-sans">
                            "{item.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedListing(item)}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-black font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Connect & Buy Direct
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
                <span className="text-3xl">🏜️</span>
                <h4 className="font-extrabold text-slate-300 mt-2.5 text-sm font-display">No Active Sellers Found Nearby</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Adjust your max radius filter, update your coordinates manually, or publish a new coordinate point to scan broader fields.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* POPUP BUYER MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl max-w-md w-full border border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2 font-display">
              <ShoppingBag className="w-5 h-5 text-teal-400" />
              <span>Farmer Connection Protocol</span>
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Compliant with Phase 3 direct commerce regulations, we disclose direct contact information. Coordinate your collection or home delivery of:
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-6 text-xs">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Crop:</span>
                <span className="text-teal-400 font-bold">{selectedListing.cropName}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Direct Farmer:</span>
                <span className="text-white">{selectedListing.farmerName}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Price per kg:</span>
                <span className="text-white">₹{selectedListing.priceForCustomer ?? selectedListing.price} / kg</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Distance:</span>
                <span className="text-white">{selectedListing.distance} km</span>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Farmer Contact Number:</span>
              <a
                href={`tel:${selectedListing.farmerPhone}`}
                className="bg-teal-950/40 hover:bg-teal-950/80 text-teal-300 py-3.5 px-4 rounded-xl border border-teal-900/30 font-mono font-bold text-center text-lg tracking-widest flex items-center justify-center space-x-2 transition"
              >
                <Phone className="w-5 h-5 text-teal-400 animate-pulse" />
                <span>{selectedListing.farmerPhone}</span>
              </a>
            </div>

            <button
              onClick={() => setSelectedListing(null)}
              className="w-full bg-slate-850 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
            >
              Close Connection Box
            </button>
          </div>
        </div>
      )}

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
