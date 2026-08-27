import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function CategoryRiskChart({ data = [] }) {
  const chartData = (data.length > 0 ? data : [
    { category: 'Crypto / Digital Assets', averageRiskScore: 92 },
    { category: 'Luxury Goods', averageRiskScore: 84 },
    { category: 'Prepaid / Gift Cards', averageRiskScore: 78 },
    { category: 'Gaming & Vouchers', averageRiskScore: 68 },
    { category: 'Travel & Lodging', averageRiskScore: 42 },
    { category: 'Groceries', averageRiskScore: 12 }
  ]).slice(0, 6);

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-80">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Risk by Merchant Category</span>
        </h3>
        <p className="text-xs text-slate-400">Average risk score by business vertical</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical" 
            data={chartData} 
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis 
              type="category" 
              dataKey="category" 
              stroke="#94A3B8" 
              fontSize={10} 
              tickLine={false}
              width={100}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
              formatter={(val) => [`${val}/100`, 'Avg Risk Score']}
            />
            <Bar dataKey="averageRiskScore" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => {
                const score = entry.averageRiskScore;
                const fill = score >= 75 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#10B981';
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
