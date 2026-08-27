import React from 'react';
import { UserCheck, Smartphone, MapPin, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EvidenceBoard({ evidence = {} }) {
  const customer = evidence.customer || {};
  const device = evidence.device || {};
  const location = evidence.location || {};
  const velocity = evidence.velocity || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Customer Baseline */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Customer Profile Baseline</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {customer.kycStatus || 'VERIFIED'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Customer ID:</span>
            <span className="font-mono text-white">{customer.customerId || 'CUST-N/A'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Account Maturity:</span>
            <span className="font-medium text-slate-200">{customer.accountAgeDays || 0} days ({customer.accountMaturity || 'ESTABLISHED'})</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Historical Typical Spend:</span>
            <span className="font-mono text-emerald-400 font-bold">${parseFloat(customer.historicalAverageAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Past Chargebacks:</span>
            <span className={`font-mono font-bold ${customer.chargebackCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {customer.chargebackCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Device Fingerprint */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Device Hardware Integrity</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${device.isNewHardware ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {device.fingerprintStatus || 'RECOGNIZED'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Device ID:</span>
            <span className="font-mono text-slate-300 truncate max-w-[140px]">{device.deviceId || 'DEV-HARDWARE'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">First Observed:</span>
            <span className="font-medium text-slate-200">{device.deviceAgeDays || 0} days ago</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Hardware Anomaly Index:</span>
            <span className={`font-mono font-bold ${device.hardwareAnomalyScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {device.hardwareAnomalyScore || 0}/100
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Binding Integrity:</span>
            <span className="font-semibold text-slate-300">{device.riskFlag || 'TRUSTED_DEVICE'}</span>
          </div>
        </div>
      </div>

      {/* 3. Geolocation & Impossible Travel */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Geolocation Verification</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${location.isLocationMismatch ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {location.isLocationMismatch ? 'GEO_MISMATCH' : 'DOMESTIC_MATCH'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Txn Origin:</span>
            <span className="font-medium text-white">{location.transactionLocation || 'New York, US'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Customer Domicile:</span>
            <span className="font-medium text-slate-300">{location.customerUsualLocation || 'New York, US'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Impossible Velocity:</span>
            <span className={`font-mono font-bold ${location.impossibleTravelVelocity === 'DETECTED' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {location.impossibleTravelVelocity || 'NOT_OBSERVED'}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Travel Classification:</span>
            <span className="text-slate-300">{location.geoRiskAssessment || 'DOMESTIC_ESTABLISHED'}</span>
          </div>
        </div>
      </div>

      {/* 4. Velocity & Authentication Friction */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Velocity & Auth Friction</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${velocity.transactionsLast10Min >= 4 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {velocity.velocityRisk || 'NORMAL'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Transactions (10m):</span>
            <span className="font-mono font-bold text-white">{velocity.transactionsLast10Min || 0} orders</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Failed PIN/CVV Attempts:</span>
            <span className={`font-mono font-bold ${velocity.failedAttemptsLast10Min > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {velocity.failedAttemptsLast10Min || 0} attempts
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Friction Level:</span>
            <span className="text-slate-300">{velocity.authenticationFriction || 'NONE'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Target Merchant:</span>
            <span className="text-slate-200 truncate max-w-[140px]">{velocity.merchantTarget || 'General'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
