import React, { useState } from 'react';
import {
  Pill,
  Package,
  Sparkles,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AiStockPredictorModal } from '../ai/AiStockPredictorModal';

export const PharmacyInventoryView: React.FC = () => {
  const {
    currentUser,
    inventory,
    addInventoryItem,
    updateInventoryStock,
    prescriptions,
    dispensePrescriptionItem,
    formatCurrency,
    setActiveDocumentPrint,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions');
  const [searchDrug, setSearchDrug] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAiStockModal, setShowAiStockModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // Form state for new medicine
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState<any>('Antibiotics');
  const [medForm, setMedForm] = useState<any>('Tablet');
  const [medStrength, setMedStrength] = useState('500mg');
  const [medBatch, setMedBatch] = useState('BT-2026-990');
  const [medExpiry, setMedExpiry] = useState('2027-12-31');
  const [medStock, setMedStock] = useState(100);
  const [medMinStock, setMedMinStock] = useState(50);
  const [medPriceRWF, setMedPriceRWF] = useState(500);
  const [medSupplier, setMedSupplier] = useState('Rwanda Medical Supply (RMS)');
  const [medRack, setMedRack] = useState('Aisle B, Shelf 3');

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchDrug.toLowerCase()) ||
      item.code.toLowerCase().includes(searchDrug.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minStockLevel).length;

  const handleAddNewMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem({
      code: `MED-${medName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: medName,
      category: medCategory,
      form: medForm,
      strength: medStrength,
      batchNumber: medBatch,
      expiryDate: medExpiry,
      currentStock: medStock,
      minStockLevel: medMinStock,
      unitPriceRWF: medPriceRWF,
      supplier: medSupplier,
      rackLocation: medRack,
    });
    setShowAddMedModal(false);
    setMedName('');
    alert(`Added ${medName} to central pharmacy inventory.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Central Pharmacy & Pharmaceutical Supply Chain
          </h2>
          <p className="text-xs text-slate-500">
            Pharmacist on Duty: <span className="font-semibold text-slate-800">{currentUser.name}</span> · National Pharmacy Council Verified
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAiStockModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 font-semibold text-xs transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Stockout Predictor
          </button>
          <button
            onClick={() => setShowAddMedModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Add Medicine Batch
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border'
          }`}
        >
          <FileText className="w-4 h-4" />
          Electronic Prescriptions Queue ({prescriptions.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border'
          }`}
        >
          <Package className="w-4 h-4" />
          Medicine Stock Catalog ({inventory.length})
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ELECTRONIC PRESCRIPTIONS QUEUE */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((prx) => {
              const allDispensed = prx.status === 'Dispensed';
              return (
                <div
                  key={prx.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{prx.prescriptionNo}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            allDispensed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prx.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-1">
                        Patient: {prx.patientName} ({prx.patientId})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Prescribed by: {prx.doctorName} · {prx.date}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveDocumentPrint({ type: 'prescription', data: prx })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Print Official Prescription"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items to Dispense */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {prx.items.map((item, idx) => {
                      const stockItem = inventory.find((i) => i.id === item.medicineId);
                      const currentStock = stockItem?.currentStock || 0;
                      const hasStock = currentStock >= item.quantity;

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900">{item.medicineName}</div>
                            <div className="text-slate-500 text-[11px]">
                              {item.dosage} · {item.frequency} for {item.duration}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                              Instructions: {item.instructions}
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono">
                              Required: <span className="font-bold text-teal-800">{item.quantity}</span> · Available Stock:{' '}
                              <span className={hasStock ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                                {currentStock} units
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 self-start sm:self-center">
                            {item.dispensed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Dispensed
                              </span>
                            ) : (
                              <button
                                onClick={() => dispensePrescriptionItem(prx.id, item.medicineId)}
                                disabled={!hasStock}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                              >
                                {hasStock ? 'Dispense & Deduct Stock' : 'Stock Depleted'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICINE STOCK CATALOG */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchDrug}
                onChange={(e) => setSearchDrug(e.target.value)}
                placeholder="Search drug name, ATC code, or batch..."
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-xl px-3 py-2 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Therapeutic Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Antimalarials">Antimalarials</option>
              <option value="Analgesics">Analgesics & NSAIDs</option>
              <option value="Cardiovascular">Cardiovascular & Diabetes</option>
              <option value="IV Fluids">IV Fluids & Electrolytes</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b">
                <tr>
                  <th className="py-3 px-3">Item Name & Strength</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Batch & Expiry</th>
                  <th className="py-3 px-3 text-center">Stock Level</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3">Rack Location</th>
                  <th className="py-3 px-3 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = item.currentStock <= item.minStockLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.code} · {item.form} ({item.strength})
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[10px]">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>{item.batchNumber}</div>
                        <div className="text-slate-400">Exp: {item.expiryDate}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.currentStock} units
                        </span>
                        {isLow && <div className="text-[10px] text-rose-600 mt-0.5">Reorder Alert</div>}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(item.unitPriceRWF)}
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {item.rackLocation}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            const newCount = prompt(`Enter updated stock units for ${item.name}:`, String(item.currentStock));
                            if (newCount !== null && !isNaN(Number(newCount))) {
                              updateInventoryStock(item.id, Number(newCount));
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                        >
                          Quick Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Medicine Batch Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Pharmaceutical Batch</h3>
              <button onClick={() => setShowAddMedModal(false)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewMedSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Drug Generic / Brand Name</label>
                <input
                  required
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Ciprofloxacin 500mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Therapeutic Category</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Antimalarials">Antimalarials</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="IV Fluids">IV Fluids</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dosage Form</label>
                  <select
                    value={medForm}
                    onChange={(e) => setMedForm(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Vial/Ampoule">Vial/Ampoule</option>
                    <option value="Infusion Bag">Infusion Bag</option>
                    <option value="Syrup">Syrup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Strength</label>
                  <input
                    type="text"
                    value={medStrength}
                    onChange={(e) => setMedStrength(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={medBatch}
                    onChange={(e) => setMedBatch(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={medStock}
                    onChange={(e) => setMedStock(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={medMinStock}
                    onChange={(e) => setMedMinStock(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Price (RWF)</label>
                  <input
                    type="number"
                    value={medPriceRWF}
                    onChange={(e) => setMedPriceRWF(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={medExpiry}
                    onChange={(e) => setMedExpiry(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={medRack}
                    onChange={(e) => setMedRack(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Register Medicine Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Stock Shortage Predictor */}
      <AiStockPredictorModal isOpen={showAiStockModal} onClose={() => setShowAiStockModal(false)} />
    </div>
  );
};
