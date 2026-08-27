import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Cpu, 
  UserCheck, 
  Smartphone, 
  MapPin, 
  Activity, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export default function InvestigationTimeline({ timeline = [] }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStepIcon = (toolName) => {
    switch (toolName) {
      case 'calculateRisk': return Cpu;
      case 'getCustomerHistory': return UserCheck;
      case 'checkDevice': return Smartphone;
      case 'checkLocation': return MapPin;
      case 'getTransactionHistory': return Activity;
      case 'createReviewCase': return Sparkles;
      default: return CheckCircle2;
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-slate-400">
        Investigation timeline initializing...
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Autonomous Investigation Timeline</span>
          </h3>
          <p className="text-xs text-slate-400">Sequential multi-tool forensic inspection</p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
          7/7 Tools Executed
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-violet-500 before:via-blue-500 before:to-emerald-500">
        {timeline.map((step, idx) => {
          const Icon = getStepIcon(step.tool);
          const isExpanded = !!expandedSteps[idx];
          const hasOutput = !!step.output;

          return (
            <div key={idx} className="relative group">
              {/* Step Marker Node */}
              <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#0A0E17] border-2 border-violet-500 flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-110 transition-transform">
                <Icon className="w-3 h-3 text-violet-400" />
              </div>

              {/* Step Card Content */}
              <div className="glass-panel rounded-xl p-4 ml-2 border border-slate-800/80 hover:border-violet-500/40 transition">
                <div 
                  className="flex items-start justify-between cursor-pointer select-none"
                  onClick={() => hasOutput && toggleStep(idx)}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-white">
                        {step.step ? `Step ${step.step}: ` : ''}{step.name}
                      </span>
                      {step.tool && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-violet-300 border border-violet-900/40">
                          {step.tool}()
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {step.timestamp ? new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </span>
                    {hasOutput && (
                      <div className="p-1 rounded text-slate-400 hover:text-white transition">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Tool Output Drawer */}
                {isExpanded && hasOutput && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 animate-fade-in">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-1 flex items-center gap-1">
                      <span>Tool Output Data</span>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(step.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
