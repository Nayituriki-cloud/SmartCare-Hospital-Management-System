import React, { useState } from 'react';
import { PackageSearch, X, AlertCircle, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AiStockPredictorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { inventory, formatCurrency, updateInventoryStock } = useHospital();
  const [season, setSeason] = useState('Rainy Season (High Malaria & Waterborne Vector)');
  const [occupancyRate, setOccupancyRate] = useState('85% (Peak Inpatient)');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handlePredict = async () => {
    setLoading(true);
    setInsights(null);
    try {
      const response = await fetch('/api/ai/inventory-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItems: inventory.map((i) => ({
            name: i.name,
            currentStock: i.currentStock,
            minStockLevel: i.minStockLevel,
            category: i.category,
          })),
          season,
          hospitalOccupancyRate: occupancyRate,
        }),
      });

      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOrder = (drugName: string, quantity: number) => {
    const matched = inventory.find((i) => i.name.toLowerCase().includes(drugName.toLowerCase()));
    if (matched) {
      updateInventoryStock(matched.id, matched.currentStock + quantity);
      alert(`PO Created & Restocked: Added ${quantity} units of ${matched.name}. Current stock: ${matched.currentStock + quantity}`);
    } else {
      alert(`Purchase order simulated for ${drugName} (${quantity} units).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <PackageSearch className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                AI Automated Stock Shortage & Supply Chain Advisor
              </h3>
              <p className="text-xs text-emerald-100">
                Predicts pharmaceutical depletion windows based on seasonal epidemiology & ward consumption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seasonal / Epidemiological Context
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-300 border px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Rainy Season (High Malaria & Waterborne Vector)">
                  Rainy Season (High Malaria & Waterborne Vector)
                </option>
                <option value="Dry Season (Respiratory Infections & Trauma)">
                  Dry Season (Respiratory Infections & Trauma)
                </option>
                <option value="School Resumption Period (Pediatric Viral Outbreaks)">
                  School Resumption Period (Pediatric Viral Outbreaks)
                </option>
                <option value="Holiday Season (High Surgical & Emergency Volume)">
                  Holiday Season (High Surgical & Emergency Volume)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital Ward Occupancy Rate
              </label>
              <select
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-300 border px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="95% (Near Capacity / Surge)">95% (Near Capacity / Surge)</option>
                <option value="85% (High Inpatient Volume)">85% (High Inpatient Volume)</option>
                <option value="70% (Average Ward Occupancy)">70% (Average Ward Occupancy)</option>
                <option value="50% (Low Activity)">50% (Low Activity)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Calculating Supply Depletion Rates & Forecasting Stockouts...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Forecast Stockouts & Generate Restock Purchase Orders
              </>
            )}
          </button>

          {/* Results Table */}
          {insights && (
            <div className="pt-2 space-y-3">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Critical Reorder Predictions & Forecasted Runouts
              </h4>

              <div className="divide-y divide-slate-200 border rounded-xl overflow-hidden bg-white shadow-xs">
                {insights.map((item, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{item.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            item.status === 'Critical Alert'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.status === 'Reorder Soon'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {item.status} (Runout: ~{item.runoutDays} days)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{item.reason}</p>
                      <div className="text-xs text-slate-700">
                        Suggested Restock: <span className="font-bold text-teal-700">{item.suggestedOrder} units</span> · Est. Total:{' '}
                        <span className="font-semibold">{formatCurrency(item.totalEstRWF || item.suggestedOrder * 200)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyOrder(item.name, item.suggestedOrder)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg shadow-xs transition self-start sm:self-center shrink-0"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Approve & Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
