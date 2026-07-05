import React from 'react';
import { Sprout, ShieldCheck, MapPin, TrendingUp, Sparkles, LogIn, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStartAuth: (role: 'farmer' | 'customer' | 'dealer' | null) => void;
}

export default function LandingPage({ onStartAuth }: LandingPageProps) {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-emerald-500 selection:text-black" id="landing-container">
      {/* Top Banner Accent */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-emerald-400 py-2.5 px-4 text-center text-[11px] font-mono tracking-wider uppercase border-b border-emerald-900/30">
        ⚡ SmartKisan 360: The Secure Full-Lifecycle AI Agriculture Ecosystem
      </div>

      {/* Main Premium Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800/60 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-xl">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-black p-2.5 rounded-xl shadow-lg shadow-emerald-500/10">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-white tracking-tight font-display">
            SmartKisan <span className="text-emerald-400">360</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onStartAuth(null)}
            className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 transition"
          >
            <LogIn className="w-4 h-4 text-emerald-400" />
            <span>Access Portals</span>
          </button>
          <button
            onClick={() => onStartAuth('farmer')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-200"
          >
            Farmer Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>CIA Triad Security + Real-Time Location Analytics</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none max-w-4xl mx-auto mb-6 font-display">
          Empowering Agriculture from <span className="text-emerald-400 underline decoration-wavy decoration-1 underline-offset-8">Seed Planting</span> to direct <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-black">Market Selling</span>
        </h1>
        <p className="text-md text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate intelligent, secure portal connecting verified Farmers, local Customers, and bulk Dealers. Powered by server-side Gemini AI prediction models, weather safety warnings, and live spatial coordinates.
        </p>

        {/* Portals Fast Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          {/* Farmer Portal Card */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group flex flex-col justify-between text-left">
            <div>
              <div className="bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 font-bold text-xl shadow-inner">
                👨‍🌾
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-emerald-400 transition">
                Farmer Portal
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Predict high-yield crops based on climate data and soil parameters, view week-by-week schedules, diagnose plant disease instantly from photo uploads, and fix prices with live government benchmarks.
              </p>
            </div>
            <button
              onClick={() => onStartAuth('farmer')}
              className="mt-4 inline-flex items-center space-x-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-transform"
            >
              <span>Farmer Access</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Portal Card */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-teal-500/30 shadow-xl hover:shadow-teal-500/5 transition-all duration-300 group flex flex-col justify-between text-left">
            <div>
              <div className="bg-teal-950/60 border border-teal-900/30 text-teal-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 font-bold text-xl shadow-inner">
                🛒
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-teal-400 transition">
                Customer Portal
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Locate verified local farmers within a strict 5 to 10 km radius using live Google Maps geocoding. Secure fresh crops directly, bypass middle-man inflated prices, and support sustainable community farming.
              </p>
            </div>
            <button
              onClick={() => onStartAuth('customer')}
              className="mt-4 inline-flex items-center space-x-1 text-sm font-bold text-teal-400 hover:text-teal-300 group-hover:translate-x-1 transition-transform"
            >
              <span>Customer Access</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dealer Portal Card */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group flex flex-col justify-between text-left">
            <div>
              <div className="bg-blue-950/60 border border-blue-900/30 text-blue-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 font-bold text-xl shadow-inner">
                🚛
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-blue-400 transition">
                Bulk Dealer Portal
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Source agricultural yield in bulk directly from local certified land holders. Hides pre-cultivation parameters to guarantee clean trading confidentiality, high durability, and professional commerce logistics.
              </p>
            </div>
            <button
              onClick={() => onStartAuth('dealer')}
              className="mt-4 inline-flex items-center space-x-1 text-sm font-bold text-blue-400 hover:text-blue-300 group-hover:translate-x-1 transition-transform"
            >
              <span>Dealer Access</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Product Phases Features */}
      <section className="bg-slate-900 border-y border-slate-850 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4 font-display">
              Integrated Three-Phase Intelligent Lifecycle
            </h2>
            <p className="text-slate-400 text-sm">
              SmartKisan 360 guides the agricultural process end-to-end, protecting farmer livelihood and optimizing purchaser experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Phase 1 */}
            <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-900/30 shadow-inner">
                  1
                </div>
                <h4 className="text-lg font-bold text-white font-display">Phase 1: Soil & Climate Matching</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-1">
                Identifies real-time GPS coordinates. Connects coordinates with agricultural surveys and live meteorological indicators. Suggests the single most optimal, high-value crop, estimating prices in 6 months.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-950/60 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-900/30 shadow-inner">
                  2
                </div>
                <h4 className="text-lg font-bold text-white font-display">Phase 2: Weekly Schedule & Plant Disease</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-1">
                Generates a detailed week-by-week guide. Actively sends climate alerts if sudden extreme weather occurs. Integrated Gemini Vision matches leaf photographs with specific crop disease profiles to suggest pesticides and pricing.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-900/30 shadow-inner">
                  3
                </div>
                <h4 className="text-lg font-bold text-white font-display">Phase 3: Direct Selling Radius Market</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-1">
                Farmers establish their pricing comparing standard daily government benchmarks. Buyers query local listings within 5-10 km radius. Ensures confidential logistics and maximum freshness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CIA Triad & Trust Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-mono border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CIA TRIAD COMPLIANT SECURITY STRUCTURE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
            Enterprise-Grade Confidentiality, Integrity, and Availability
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            SmartKisan 360 is built with security first. We verify every farmer with structural land ledger documents, and dealers with active enterprise licensing to secure transaction integrity.
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg font-mono font-bold text-sm border border-emerald-900/30">
                C
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm font-display">Confidentiality</h5>
                <p className="text-xs text-slate-400 mt-1">Buyer profiles, listings, and pre-cultivation details are protected. Session auth uses secure signed JSON Web Tokens (JWT).</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg font-mono font-bold text-sm border border-emerald-900/30">
                I
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm font-display">Integrity</h5>
                <p className="text-xs text-slate-400 mt-1">Land registries and credentials prevent fraudulent accounts. Password strength checking and dynamic 2FA OTP block manipulation.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg font-mono font-bold text-sm border border-emerald-900/30">
                A
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm font-display">Availability</h5>
                <p className="text-xs text-slate-400 mt-1">Local JSON-based caching ensures seamless page restoring, fallback paging, and zero database availability delays.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2 font-display">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Live Government Price Index (Standard INR/kg)</span>
          </h3>
          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-300 font-sans font-medium">🌾 Wheat (Grade A)</span>
              <span className="text-emerald-400 font-bold">₹24.25 / kg (Government MSP)</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-300 font-sans font-medium">🍚 Rice (Paddy Standard)</span>
              <span className="text-emerald-400 font-bold">₹21.83 / kg (Government MSP)</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-300 font-sans font-medium">🌽 Maize</span>
              <span className="text-emerald-400 font-bold">₹20.90 / kg (Government MSP)</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-300 font-sans font-medium">🥔 Potato</span>
              <span className="text-emerald-400 font-bold">₹15.00 / kg (Standard Benchmark)</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-slate-300 font-sans font-medium">🍅 Tomato</span>
              <span className="text-emerald-400 font-bold">₹25.00 / kg (Standard Benchmark)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            * Government minimum support prices (MSP) and agricultural indices synced from central datasets. Registered farmers reference these to protect unit revenue.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-6 text-center text-slate-500 text-[11px] font-mono">
        <p>© 2026 SmartKisan 360 Agriculture Ecosystem. All Rights Reserved. Complies with full-scale agricultural safety and direct direct-trade standards.</p>
      </footer>
    </div>
  );
}
