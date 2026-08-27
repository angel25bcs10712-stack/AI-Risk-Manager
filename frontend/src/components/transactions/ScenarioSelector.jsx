import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Zap, Lock, UserPlus } from 'lucide-react';

export const DEMO_SCENARIOS = [
  {
    id: 'SCENARIO_1_NORMAL',
    title: 'Scenario 1: Normal Routine Spend',
    expectedRisk: 'LOW',
    tag: 'Safe Baseline',
    color: 'emerald',
    icon: ShieldCheck,
    description: 'Normal purchase at grocery store from known laptop, standard spend level, matched location.',
    payload: {
      amount: 45.20,
      customerId: 'CUST-88310',
      merchant: 'Whole Foods Market',
      merchantCategory: 'Groceries',
      deviceId: 'DEV-MAC-CHROME-12',
      deviceAge: 240,
      location: 'Seattle, US',
      usualLocation: 'Seattle, US',
      transactionHour: 14,
      transactionFrequency: 0,
      failedTransactions: 0,
      previousAverage: 52.00,
      accountAge: 480,
      previousChargebacks: 0
    }
  },
  {
    id: 'SCENARIO_2_MODERATE',
    title: 'Scenario 2: Unusual Amount Jump',
    expectedRisk: 'MEDIUM',
    tag: 'Anomaly Ratio',
    color: 'amber',
    icon: AlertTriangle,
    description: 'Elevated amount (3.2x typical spend) on slightly new device; triggers manual review flag.',
    payload: {
      amount: 890.00,
      customerId: 'CUST-72109',
      merchant: 'Target Supercenter',
      merchantCategory: 'General Retail',
      deviceId: 'DEV-WIN-EDGE-09',
      deviceAge: 5,
      location: 'Austin, US',
      usualLocation: 'Dallas, US',
      transactionHour: 19,
      transactionFrequency: 2,
      failedTransactions: 1,
      previousAverage: 280.00,
      accountAge: 65,
      previousChargebacks: 0
    }
  },
  {
    id: 'SCENARIO_3_ATO',
    title: 'Scenario 3: Account Takeover (ATO)',
    expectedRisk: 'HIGH',
    tag: 'Critical Threat',
    color: 'rose',
    icon: ShieldAlert,
    description: 'Huge amount (5.7x average), brand new device, overseas location jump, 3 failed CVV attempts.',
    payload: {
      amount: 4850.00,
      customerId: 'CUST-10492',
      merchant: 'Apple Store Fifth Ave',
      merchantCategory: 'Electronics & Luxury',
      deviceId: 'DEV-IPHONE-NEW-99',
      deviceAge: 0.5,
      location: 'Singapore, SG',
      usualLocation: 'New York, US',
      transactionHour: 3,
      transactionFrequency: 6,
      failedTransactions: 3,
      previousAverage: 180.00,
      accountAge: 140,
      previousChargebacks: 1
    }
  },
  {
    id: 'SCENARIO_4_VELOCITY',
    title: 'Scenario 4: Card Testing Bot Attack',
    expectedRisk: 'HIGH',
    tag: 'Velocity Spike',
    color: 'rose',
    icon: Zap,
    description: 'High transaction frequency (9 orders in 10 mins) + 5 authentication failures on prepaid vouchers.',
    payload: {
      amount: 1850.00,
      customerId: 'CUST-84019',
      merchant: 'GiftCardsNow Online',
      merchantCategory: 'Prepaid / Gift Cards',
      deviceId: 'DEV-EMULATOR-AND-11',
      deviceAge: 0.0,
      location: 'Kyiv, UA',
      usualLocation: 'Denver, US',
      transactionHour: 23,
      transactionFrequency: 9,
      failedTransactions: 5,
      previousAverage: 40.00,
      accountAge: 2,
      previousChargebacks: 0
    }
  },
  {
    id: 'SCENARIO_5_NEW_ACCT',
    title: 'Scenario 5: New Account Bust-Out',
    expectedRisk: 'HIGH',
    tag: 'New Account Drain',
    color: 'rose',
    icon: UserPlus,
    description: 'Account created 3 days ago immediately attempting $7,500 international wire transfer.',
    payload: {
      amount: 7500.00,
      customerId: 'CUST-29014',
      merchant: 'Global Wire Remit',
      merchantCategory: 'Money Transfer',
      deviceId: 'DEV-VIRTUAL-MACH-99',
      deviceAge: 0.0,
      location: 'Cayman Islands, KY',
      usualLocation: 'Boston, US',
      transactionHour: 4,
      transactionFrequency: 8,
      failedTransactions: 6,
      previousAverage: 110.00,
      accountAge: 3,
      previousChargebacks: 2
    }
  }
];

export default function ScenarioSelector({ onSelectScenario, activeScenarioId }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Load Pre-Configured Test Scenarios
        </h4>
        <span className="text-[11px] text-blue-400 font-mono">1-Click Demo Presets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {DEMO_SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const isSelected = activeScenarioId === sc.id;

          let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          let borderHover = 'hover:border-emerald-500/40';
          if (sc.expectedRisk === 'HIGH') {
            badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            borderHover = 'hover:border-rose-500/40';
          } else if (sc.expectedRisk === 'MEDIUM') {
            badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            borderHover = 'hover:border-amber-500/40';
          }

          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectScenario(sc)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10' 
                  : `bg-slate-900/60 border-slate-800 ${borderHover}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {sc.expectedRisk} RISK
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xs font-bold text-white leading-snug">{sc.title.split(':')[1] || sc.title}</div>
              </div>

              <div className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-tight">
                {sc.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
