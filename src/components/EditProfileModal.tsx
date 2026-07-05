import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, Phone, MapPin, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import LeafletMap from './LeafletMap';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token: string;
  onUserUpdate: (updatedUser: User) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, token, onUserUpdate }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [soilType, setSoilType] = useState(user.soilType || 'Clayey');
  const [address, setAddress] = useState(user.location?.address || '');
  const [lat, setLat] = useState(user.location?.lat?.toString() || '20.5937');
  const [lng, setLng] = useState(user.location?.lng?.toString() || '78.9629');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          soilType,
          location: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            address
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      onUserUpdate(data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleGetCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setLat(newLat.toFixed(6));
          setLng(newLng.toFixed(6));
          setAddress('Resolving current GPS address...');

          try {
            const res = await fetch(`/api/geocode?lat=${newLat}&lng=${newLng}`);
            if (res.ok) {
              const data = await res.json();
              if (data.address) {
                setAddress(data.address);
              }
            }
          } catch (err) {
            console.error(err);
          }
        },
        (err) => {
          alert('GPS access denied. Please enable location permissions.');
        }
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl z-10 font-sans"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-950/60 border border-emerald-900/50 rounded-lg text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Secure User Profile</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify credentials & details instantly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-950/30 border border-red-900/40 text-red-300 p-3.5 rounded-xl text-xs font-medium">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 p-3.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Profile updated successfully! Closing...</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                </div>

                {/* Farmer-Specific Soil Type */}
                {user.role === 'farmer' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Soil Composition Type</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                    >
                      <option value="Clayey">Clayey Soil</option>
                      <option value="Sandy">Sandy Soil</option>
                      <option value="Loamy">Loamy Soil</option>
                      <option value="Black">Black Soil</option>
                      <option value="Red">Red Soil</option>
                    </select>
                  </div>
                )}

                {/* Physical Delivery / Farm Address */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location Address</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentGPS}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Use Current GPS</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter visual physical address"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                  />
                </div>

                {/* Coordinates (Readonly or Editable) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                </div>

                {/* Interactive Map Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Interactive Map Selection
                  </label>
                  <p className="text-[10px] text-slate-400 font-medium">
                    💡 <span className="text-emerald-400 font-bold">Click/Tap anywhere on the map</span> to select a different custom location. The address and coordinates will update automatically.
                  </p>
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-inner">
                    <LeafletMap
                      center={{ lat: parseFloat(lat) || 20.5937, lng: parseFloat(lng) || 78.9629 }}
                      address={address}
                      zoom={6}
                      mainMarkerColor={user.role === 'farmer' ? '#10b981' : user.role === 'dealer' ? '#3b82f6' : '#14b8a6'}
                      onMapClick={async (clickedLat, clickedLng) => {
                        setLat(clickedLat.toFixed(6));
                        setLng(clickedLng.toFixed(6));
                        setAddress('Resolving selected address...');
                        try {
                          const res = await fetch(`/api/geocode?lat=${clickedLat}&lng=${clickedLng}`);
                          if (res.ok) {
                            const data = await res.json();
                            if (data.address) {
                              setAddress(data.address);
                            }
                          }
                        } catch (err) {
                          console.error('Error reverse geocoding clicked location:', err);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
