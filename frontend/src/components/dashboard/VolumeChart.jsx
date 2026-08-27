import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function VolumeChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { hour: '00:00', total: 4, volume: 3200 },
    { hour: '04:00', total: 8, volume: 7400 },
    { hour: '08:00', total: 14, volume: 11200 },
    { hour: '12:00', total: 22, volume: 18900 },
    { hour: '16:00', total: 18, volume: 14500 },
    { hour: '20:00', total: 12, volume: 9800 }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Transaction Volume Trend</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              24-Hour Velocity
            </span>
          </h3>
          <p className="text-xs text-slate-400">Total volume and count of processed transactions</p>
        </div>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="hour" 
              stroke="#64748B" 
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={11}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
              formatter={(value, name) => [
                name === 'volume' ? `$${Number(value).toLocaleString()}` : value,
                name === 'volume' ? 'USD Volume' : 'Txn Count'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#3B82F6" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#volumeGradient)" 
              name="Transactions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
