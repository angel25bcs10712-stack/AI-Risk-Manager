import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function RiskDistributionChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Low Risk', value: 16, percentage: 53, color: '#10B981' },
    { name: 'Medium Risk', value: 7, percentage: 23, color: '#F59E0B' },
    { name: 'High Risk', value: 7, percentage: 23, color: '#EF4444' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-80">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white">Risk Distribution</h3>
        <p className="text-xs text-slate-400">Classification across risk tiers</p>
      </div>

      <div className="flex items-center justify-between h-60">
        {/* Donut Chart */}
        <div className="w-1/2 h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="#0A0E17"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
                formatter={(val, name) => [`${val} transactions`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend & Percentages */}
        <div className="w-1/2 flex flex-col justify-center gap-3 pl-2">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">{item.value}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${item.percentage || 0}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
