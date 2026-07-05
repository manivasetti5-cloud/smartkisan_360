import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, KeyRound, Mail, Phone, Lock, FileText, ArrowLeft, RefreshCw, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole, User, LocationCoordinates } from '../types';

interface AuthPageProps {
  initialRole: UserRole | null;
  onAuthSuccess: (token: string, user: User) => void;
  onBackToLanding: () => void;
}

export default function AuthPage({ initialRole, onAuthSuccess, onBackToLanding }: AuthPageProps) {
  const [role, setRole] = useState<UserRole>(initialRole || 'farmer');
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [soilType, setSoilType] = useState('Clayey');
  const [landPapersFile, setLandPapersFile] = useState<string>('');
  const [dealerDocsFile, setDealerDocsFile] = useState<string>('');

  // OTP Verification state
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes (300s)
  const [resendTimer, setResendTimer] = useState(0); // 1 minute block timer (60s)

  // Status/Error states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Geolocation parameters
  const [coordinates, setCoordinates] = useState<LocationCoordinates | undefined>(undefined);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Auto detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          setCoordinates({
            lat,
            lng,
            address: 'Resolving physical address...',
          });
          setGpsError(null);

          try {
            const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data.address) {
                setCoordinates({
                  lat,
                  lng,
                  address: data.address,
                });
              }
            }
          } catch (err) {
            console.error('Error geocoding initial location:', err);
          }
        },
        (err) => {
          console.warn('GPS permission is not enabled or failed:', err.message);
          setGpsError('GPS permission is recommended for SmartKisan crop matching and local markets.');
        }
      );
    } else {
      setGpsError('Geolocation is not supported by your browser.');
    }
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any;
    if (requiresOtp && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [requiresOtp, otpTimer]);

  // Resend OTP Block Countdown Timer
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Password strength check helper
  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 25, text: 'Very Weak (Add numbers & capitals)', color: 'bg-red-500' };
      case 2:
        return { score: 50, text: 'Weak (Add special characters)', color: 'bg-orange-400' };
      case 3:
        return { score: 75, text: 'Moderate Strength', color: 'bg-yellow-500' };
      case 4:
        return { score: 100, text: 'Secure Strength (Excellent)', color: 'bg-emerald-500' };
      default:
        return { score: 0, text: 'Very Weak', color: 'bg-red-500' };
    }
  };

  const passStrength = checkPasswordStrength(password);

  // File selection simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'land' | 'dealer') => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      if (fileType === 'land') {
        setLandPapersFile(name);
      } else {
        setDealerDocsFile(name);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        if (response.status === 202 && data.requiresVerification) {
          // Requires unverified user OTP verification
          setRequiresOtp(true);
          setEmail(data.email);
          setDevOtp(data.devOtp);
          setOtpTimer(300);
          setSuccessMsg(data.message);
        } else {
          // Fully logged in
          onAuthSuccess(data.token, data.user);
        }
      } else {
        // REGISTRATION
        if (role === 'farmer' && !landPapersFile) {
          throw new Error('Please select and upload your Land Registry proof.');
        }
        if (role === 'dealer' && !dealerDocsFile) {
          throw new Error('Please select and upload your Business Licenses/Documents.');
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            role,
            location: coordinates || { lat: 20.5937, lng: 78.9629, address: 'Default Center' },
            soilType: role === 'farmer' ? soilType : undefined,
            landPapersProof: role === 'farmer' ? landPapersFile : undefined,
            dealerDocsProof: role === 'dealer' ? dealerDocsFile : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setRequiresOtp(true);
        setDevOtp(data.devOtp);
        setOtpTimer(300);
        setSuccessMsg(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setRequiresOtp(false);
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resend OTP failed');
      }

      setDevOtp(data.devOtp);
      setOtpTimer(300);
      setResendTimer(60); // block resend for 1 minute
      setSuccessMsg('A fresh OTP has been successfully dispatched to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-950 min-h-screen py-12 px-4 flex flex-col justify-center items-center font-sans text-slate-100" id="auth-container">
      <button
        onClick={onBackToLanding}
        className="mb-6 flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition self-start max-w-sm mx-auto w-full px-4"
        id="back-to-home-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="bg-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
            SmartKisan <span className="text-emerald-400">360</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-1.5 uppercase tracking-widest">
            {requiresOtp ? '2FA Secure Verification' : `${role} Authentication`}
          </p>
        </div>

        {/* Global Alert Notification */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/60 text-red-300 p-4 rounded-xl mb-6 text-xs flex items-start space-x-2 animate-shake" id="error-alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 p-4 rounded-xl mb-6 text-xs flex items-start space-x-2" id="success-alert">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. OTP VERIFICATION SCREEN */}
        {requiresOtp ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Please enter the 6-digit One-Time Password (OTP) dispatched to <strong className="text-slate-200">{email}</strong>.
              </p>
              <div className="flex justify-between items-center bg-slate-950/50 px-4 py-2 rounded-xl text-xs font-mono text-slate-400 max-w-xs mx-auto border border-slate-800/60">
                <span>Validity remaining:</span>
                <span className={`font-bold ${otpTimer < 60 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                  {formatTimer(otpTimer)}
                </span>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0"
                className="w-full text-center text-3xl font-bold font-mono tracking-[1em] pl-4 py-3 bg-slate-950 text-white rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition"
                required
                id="otp-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpTimer === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold py-3.5 rounded-2xl tracking-wide transition shadow-lg shadow-emerald-500/10"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            {/* Resend Actions */}
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={loading || resendTimer > 0}
                onClick={handleResendOtp}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 inline-flex items-center space-x-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Verification Code'}</span>
              </button>
            </div>

            {/* Sandbox Developer Safe helper */}
            {devOtp && (
              <div className="bg-yellow-950/25 border border-yellow-900/40 p-4 rounded-xl text-xs space-y-1.5 text-slate-300">
                <p className="font-bold text-yellow-500 flex items-center space-x-1">
                  <span>🛠️ Sandbox Helper:</span>
                </p>
                <p>The system automatically generated this secure simulated OTP for local credential testing:</p>
                <p className="font-mono text-sm font-bold bg-slate-950 px-2 py-1.5 rounded border border-yellow-900/30 text-center text-yellow-400 mt-2 tracking-widest">
                  {devOtp}
                </p>
              </div>
            )}
          </form>
        ) : (
          /* 2. MAIN LOGIN/REGISTER FORMS */
          <div className="space-y-6">
            {/* Role Tab Selector */}
            {!requiresOtp && (
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800" id="role-selector">
                {(['farmer', 'customer', 'dealer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl capitalize transition-all ${
                      role === r
                        ? 'bg-slate-800 text-white shadow-md border border-slate-750'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r === 'farmer' ? '👨‍🌾 Farmer' : r === 'customer' ? '🛒 User' : '🚛 Dealer'}
                  </button>
                ))}
              </div>
            )}

            {/* Toggle Login/Register buttons */}
            <div className="flex border-b border-slate-800/80">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-xs font-extrabold text-center transition ${
                  isLogin ? 'border-b-2 border-emerald-500 text-white' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-xs font-extrabold text-center transition ${
                  !isLogin ? 'border-b-2 border-emerald-500 text-white' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Registration/Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Registration Only) */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/60 text-white rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition text-xs"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 text-white rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition text-xs"
                    required
                  />
                </div>
              </div>

              {/* Phone (Registration Only) */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                      placeholder="+91 9876543210"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/60 text-white rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition text-xs"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Soil Type Selector (Farmers Registration Only) */}
              {!isLogin && role === 'farmer' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Default Soil Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 text-white rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition text-xs font-medium"
                  >
                    <option value="Clayey">Clayey (Retains water well, ideal for Rice)</option>
                    <option value="Sandy">Sandy (Well-draining, ideal for tubers/potatoes)</option>
                    <option value="Loamy">Loamy (Balanced fertility, ideal for Wheat)</option>
                    <option value="Black">Black Soil (High clay content, ideal for Cotton)</option>
                    <option value="Red">Red Soil (Iron-rich, ideal for pulses/oilseeds)</option>
                  </select>
                </div>
              )}

              {/* Document upload: Land registry (Farmer registration) */}
              {!isLogin && role === 'farmer' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Land Ownership Proof (Registry Papers / Patta)*
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer bg-slate-950/60 hover:bg-slate-950 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-800">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Select Proof Document</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'land')}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {landPapersFile ? landPapersFile : 'No document chosen'}
                    </span>
                  </div>
                </div>
              )}

              {/* Document upload: License/Cert (Dealer registration) */}
              {!isLogin && role === 'dealer' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Business Certification / APMC License*
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer bg-slate-950/60 hover:bg-slate-950 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-800">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Select License File</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'dealer')}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {dealerDocsFile ? dealerDocsFile : 'No document chosen'}
                    </span>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 text-white rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition text-xs"
                    required
                  />
                </div>

                {/* Password Strength Meter (Registration Only) */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 uppercase">Password Security</span>
                      <span className="text-slate-300 font-mono">{passStrength.text}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: `${passStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Location Status warning (Registration only) */}
              {!isLogin && (
                <div className={`p-4 rounded-xl text-xs flex flex-col space-y-2 border ${
                  coordinates 
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-900/30' 
                    : 'bg-amber-950/30 text-amber-300 border-amber-900/30'
                }`}>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${coordinates ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
                    <div>
                      {coordinates ? (
                        <p className="font-bold">
                          GPS Coordinate Acquired
                        </p>
                      ) : (
                        <p className="font-semibold">
                          {gpsError || 'Requesting GPS permissions... Please allow geolocation to locate your farming coordinates.'}
                        </p>
                      )}
                    </div>
                  </div>
                  {coordinates && (
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40 text-[11px] font-sans text-slate-300 space-y-1.5">
                      <div className="font-mono text-slate-400 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Latitude: <strong>{coordinates.lat.toFixed(6)}°</strong></span>
                        <span>•</span>
                        <span>Longitude: <strong>{coordinates.lng.toFixed(6)}°</strong></span>
                      </div>
                      {coordinates.address && (
                        <div className="border-t border-slate-800/60 pt-1.5">
                          <span className="text-slate-500 text-[9px] font-bold block uppercase tracking-wider">Physical Address</span>
                          <span className="text-slate-200">{coordinates.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/10 mt-4 cursor-pointer"
              >
                {loading ? 'Processing Secure Connection...' : isLogin ? `Log In to ${role} Portal` : 'Sign Up & Send Verification OTP'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
