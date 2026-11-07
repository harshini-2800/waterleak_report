import React, { useState } from 'react';
import { Droplets, AlertCircle, Search, ShieldCheck, PlusCircle, Compass, Menu, X, ArrowRight } from 'lucide-react';

const Navbar = ({ activePage, setActivePage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Droplets },
    { id: 'explore', label: 'Explore Reports', icon: Compass },
    { id: 'report', label: 'Report a Leak', icon: PlusCircle, highlight: true },
    { id: 'track', label: 'Track Status', icon: Search },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck },
  ];

  const handleNav = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/60 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-navy-900 via-aqua-dark to-aqua flex items-center justify-center text-white shadow-md shadow-aqua/20 group-hover:scale-105 transition-transform duration-300">
              <Droplets className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-navy-900 group-hover:text-aqua transition-colors">
                  WaterLeak<span className="text-aqua">Watch</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-brand bg-emerald-50 border border-emerald-200 rounded-full uppercase">
                  Live Network
                </span>
              </div>
              <p className="text-[11px] text-muted hidden sm:block tracking-wide">
                Every Drop Matters. Every Leak Counts.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className="ml-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aqua-dark via-aqua to-aqua-light text-navy-950 font-semibold text-sm shadow-luxury hover:shadow-luxury-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-white/20"
                  >
                    <Icon className="w-4 h-4 text-navy-950" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-navy-900 bg-slate-100/80 font-semibold shadow-inner'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-aqua' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => handleNav('report')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-aqua text-navy-950"
            >
              Report Leak
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                  item.highlight
                    ? 'bg-gradient-to-r from-aqua-dark to-aqua text-navy-950 font-bold'
                    : isActive
                    ? 'bg-slate-100 text-navy-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-aqua-dark" />
                  <span>{item.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;

