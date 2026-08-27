import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export default function HighRiskTrendChart({ data = [] }) {
  const chartData = data.length > 0 ? data.slice(0, 12) : [
    { hour: '00:00', highRisk: 2, mediumRisk: 1 },
    { hour: '02:00', highRisk: 4, mediumRisk: 2 },
    { hour: '04:00', highRisk: 3, mediumRisk: 3 },
    { hour: '06:00', highRisk: 1, mediumRisk: 2 },
    { hour: '08:00', highRisk: 0, mediumRisk: 1 },
    { hour: '10:00', highRisk: 1, mediumRisk: 2 },
    { hour: '12:00', highRisk: 2, mediumRisk: 4 },
    { hour: '14:00', highRisk: 1, mediumRisk: 3 },
    { hour: '16:00', highRisk: 3, mediumRisk: 2 },
    { hour: '18:00', highRisk: 2, mediumRisk: 3 },
    { hour: '20:00', highRisk: 4, mediumRisk: 1 },
    { hour: '22:00', highRisk: 5, mediumRisk: 2 }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-80">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>High-Risk Attack Velocity</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Threat Timeline
          </span>
        </h3>
        <p className="text-xs text-slate-400">High vs Medium risk anomalies detected over time</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
            />
            <Bar dataKey="highRisk" name="High Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mediumRisk" name="Medium Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
