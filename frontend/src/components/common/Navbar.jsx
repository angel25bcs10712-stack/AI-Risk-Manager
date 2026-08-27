import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Receipt, 
  Sliders, 
  Bot, 
  BarChart3, 
  BrainCircuit, 
  FileText, 
  RotateCcw, 
  Menu, 
  X,
  Sparkles,
  Server
} from 'lucide-react';

export default function Navbar() {
  const { systemHealth, addToast, triggerRefresh } = useApp();
  const [isReseeding, setIsReseeding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Risk Analysis', path: '/analyze', icon: Sliders },
    { label: 'AI Agent', path: '/agent', icon: Bot, highlight: true },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Model Performance', path: '/model-performance', icon: BrainCircuit },
    { label: 'Audit Trail', path: '/audit-logs', icon: FileText }
  ];

  const handleReseed = async () => {
    if (!window.confirm('Reset demo transactions and reload baseline dataset?')) return;
    setIsReseeding(true);
    try {
      await api.reseedData();
      addToast('Demo transactions reloaded successfully!', 'success');
      triggerRefresh();
    } catch (err) {
      addToast('Failed to reset demo dataset.', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0E17]/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  RiskGuard <span className="text-blue-400 font-mono">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Payment Risk Manager
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'}
                    ${item.highlight ? 'relative' : ''}
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Status Indicators & Quick Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live Engine Status */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className={`w-2 h-2 rounded-full ${systemHealth.backend ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                ML Engine
              </span>
            </div>

            {/* Quick Demo Reset Button */}
            <button
              onClick={handleReseed}
              disabled={isReseeding}
              title="Reset demo transactions to initial state"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isReseeding ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0A0E17] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition
                  ${isActive 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">ML Service: Connected</span>
            <button
              onClick={() => { handleReseed(); setMobileMenuOpen(false); }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
            >
              Reset Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
