import React from 'react';
import { Droplets, Heart, Shield, Sparkles, ExternalLink } from 'lucide-react';

const Footer = ({ setActivePage }) => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-aqua/20 border border-aqua/40 flex items-center justify-center text-aqua">
                <Droplets className="w-5 h-5 text-aqua" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                WaterLeak<span className="text-aqua">Watch</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              WaterLeak Watch is an environmental public infrastructure technology platform. We empower citizens to instantly report municipal water leaks, eliminate duplicate complaints, and accelerate utility resolution times.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-aqua">
                <Sparkles className="w-3.5 h-3.5 text-aqua" /> Smart Duplicate Detection
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-brand">
                <Shield className="w-3.5 h-3.5 text-emerald-brand" /> Verified Auditing
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('home')} className="hover:text-aqua transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('report')} className="hover:text-aqua transition-colors">
                  Report a Water Leak
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('explore')} className="hover:text-aqua transition-colors">
                  Live Public Feed
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('track')} className="hover:text-aqua transition-colors">
                  Track Leak Resolution
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('admin')} className="hover:text-aqua transition-colors">
                  Administrator Console
                </button>
              </li>
            </ul>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Infrastructure
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>• Automated Photo Upload & Validation</li>
              <li>• Location & Area Street Normalizer</li>
              <li>• Similar Incident Clustering</li>
              <li>• 4-Stage Resolution Pipeline</li>
              <li>• Time-to-Resolution Analytics</li>
              <li>• In-App Event Notifications</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WaterLeak Watch. Designed for municipal conservation & smart governance.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Status: <span className="text-emerald-400 font-medium">Systems Operational</span></span>
            <span>Tagline: Every Drop Matters. Every Leak Counts.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

