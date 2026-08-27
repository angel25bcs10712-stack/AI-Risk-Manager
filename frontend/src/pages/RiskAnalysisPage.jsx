import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import ScenarioSelector, { DEMO_SCENARIOS } from '../components/transactions/ScenarioSelector';
import RiskMeter from '../components/common/RiskMeter';
import RiskBadge from '../components/common/RiskBadge';
import RiskFactorList from '../components/transactions/RiskFactorList';
import CustomerBaselineComparison from '../components/transactions/CustomerBaselineComparison';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Send, 
  Bot, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  DollarSign, 
  Smartphone, 
  MapPin, 
  Clock, 
  User, 
  Layers
} from 'lucide-react';

export default function RiskAnalysisPage() {
  const navigate = useNavigate();
  const { openActionModal, addToast, triggerRefresh } = useApp();

  const [activeScenarioId, setActiveScenarioId] = useState('SCENARIO_3_ATO');
  const [formData, setFormData] = useState({
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
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelectScenario = (scenario) => {
    setActiveScenarioId(scenario.id);
    setFormData(scenario.payload);
    setResult(null); // reset result on change
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        deviceAge: parseFloat(formData.deviceAge) || 0,
        transactionFrequency: parseInt(formData.transactionFrequency) || 0,
        failedTransactions: parseInt(formData.failedTransactions) || 0,
        previousAverage: parseFloat(formData.previousAverage) || 100,
        accountAge: parseFloat(formData.accountAge) || 90,
        transactionHour: parseInt(formData.transactionHour) || 12,
        previousChargebacks: parseInt(formData.previousChargebacks) || 0
      };

      const res = await api.analyzeTransaction(payload);
      setResult(res.data);
      addToast(`Analysis complete: Score ${res.data.riskScore}/100 (${res.data.riskLevel} Risk)`, 'success');
      triggerRefresh();
    } catch (err) {
      addToast(err.message || 'Transaction analysis failed.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-2 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Interactive Risk Simulator & Feature Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Transaction Risk Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Enter custom payment parameters or load benchmark fraud presets to test the scikit-learn ML risk model in real-time.
        </p>
      </div>

      {/* Preset Scenario Selector */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <ScenarioSelector
          onSelectScenario={handleSelectScenario}
          activeScenarioId={activeScenarioId}
        />
      </div>

      {/* Main Two-Column Layout: Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 14 Transaction Input Fields */}
        <form onSubmit={handleAnalyze} className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Transaction Telemetry Parameters</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">14 Feature Vectors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Amount */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Transaction Amount ($ USD) <span className="text-blue-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Previous Average */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Customer Historical Avg ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.previousAverage}
                onChange={(e) => handleInputChange('previousAverage', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Customer ID */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Customer Identifier
              </label>
              <input
                type="text"
                value={formData.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Target Merchant
              </label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => handleInputChange('merchant', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Merchant Category */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Merchant Category
              </label>
              <select
                value={formData.merchantCategory}
                onChange={(e) => handleInputChange('merchantCategory', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Electronics & Luxury">Electronics & Luxury</option>
                <option value="Crypto / Digital Assets">Crypto / Digital Assets</option>
                <option value="Prepaid / Gift Cards">Prepaid / Gift Cards</option>
                <option value="Gaming & Entertainment">Gaming & Entertainment</option>
                <option value="Money Transfer">Money Transfer</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="General Retail">General Retail</option>
                <option value="Groceries">Groceries</option>
                <option value="Food & Delivery">Food & Delivery</option>
              </select>
            </div>

            {/* Device ID */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Device Fingerprint ID
              </label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => handleInputChange('deviceId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Device Age */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Device Age (Days) <span className="text-[10px] text-slate-400 font-normal">(0 = new hardware)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.deviceAge}
                onChange={(e) => handleInputChange('deviceAge', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Transaction Location */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Transaction Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Customer Usual Location */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Customer Usual Domicile
              </label>
              <input
                type="text"
                value={formData.usualLocation}
                onChange={(e) => handleInputChange('usualLocation', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Transaction Frequency (10m) */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Transactions in Last 10 Mins (Velocity)
              </label>
              <input
                type="number"
                min="0"
                value={formData.transactionFrequency}
                onChange={(e) => handleInputChange('transactionFrequency', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Failed Transactions */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Failed Attempts (PIN/CVV/Auth)
              </label>
              <input
                type="number"
                min="0"
                value={formData.failedTransactions}
                onChange={(e) => handleInputChange('failedTransactions', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Transaction Hour */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Transaction Hour (0–23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.transactionHour}
                onChange={(e) => handleInputChange('transactionHour', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Account Age */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Account Age (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.accountAge}
                onChange={(e) => handleInputChange('accountAge', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Previous Chargebacks */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Historical Chargebacks / Disputes
              </label>
              <input
                type="number"
                min="0"
                value={formData.previousChargebacks}
                onChange={(e) => handleInputChange('previousChargebacks', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Risk Model...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Model Output Display */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 animate-slide-up bg-slate-900/50">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Live ML Evaluation Result</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {result.transactionId}</p>
                </div>
                <RiskBadge level={result.riskLevel} score={result.riskScore} size="md" />
              </div>

              {/* Gauge */}
              <div className="py-2 flex flex-col items-center justify-center">
                <RiskMeter score={result.riskScore} size="lg" showLabels={true} />
              </div>

              {/* Recommendation Box */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Recommended Policy Action
                  </span>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                    result.recommendation === 'BLOCK' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : result.recommendation === 'MANUAL REVIEW' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {result.recommendation === 'BLOCK' ? <Ban className="w-3.5 h-3.5" /> : result.recommendation === 'MANUAL REVIEW' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {result.recommendation}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex justify-between pt-1">
                  <span>Fraud Probability:</span>
                  <span className="font-mono text-white font-bold">
                    {(result.fraudProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Dynamic Risk Factors */}
              <RiskFactorList factors={result.riskFactors} riskScore={result.riskScore} />

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/agent?id=${result.transactionId}`)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/20"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Launch AI Agent</span>
                </button>

                <button
                  onClick={() => openActionModal(result, (updated) => setResult(prev => ({ ...prev, ...updated })))}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
                >
                  Take Action
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-10 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <SlidersHorizontal className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Awaiting Analysis</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Click <span className="text-blue-400 font-semibold">"Analyze Transaction"</span> above to trigger real-time ML risk scoring and factor attribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
