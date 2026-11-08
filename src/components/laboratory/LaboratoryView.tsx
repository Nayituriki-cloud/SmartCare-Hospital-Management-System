import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Search,
  Filter,
  FileCheck,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { LabTestOrder, LabTestParameter } from '../../types';

export const LaboratoryView: React.FC = () => {
  const {
    currentUser,
    labOrders,
    updateLabResults,
    verifyLabTest,
    setActiveDocumentPrint,
  } = useHospital();

  const [activeOrderId, setActiveOrderId] = useState<string>(labOrders[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Results entry state for active test
  const activeOrder = labOrders.find((o) => o.id === activeOrderId) || labOrders[0];

  const [paramRows, setParamRows] = useState<LabTestParameter[]>(
    activeOrder?.results?.length
      ? activeOrder.results
      : [
          { name: 'Analyte 1', value: '12.4', unit: 'g/dL', referenceRange: '11.0 - 15.0', status: 'Normal' },
          { name: 'Analyte 2', value: '160', unit: 'x10³/µL', referenceRange: '150 - 450', status: 'Normal' },
        ]
  );
  const [technicianNotes, setTechnicianNotes] = useState<string>(activeOrder?.clinicalNotes || '');

  const filteredOrders = labOrders.filter((o) => {
    const matchesSearch =
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || o.testCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectOrder = (order: LabTestOrder) => {
    setActiveOrderId(order.id);
    setParamRows(
      order.results.length
        ? order.results
        : [
            { name: 'Primary Analyte', value: '', unit: 'mg/dL', referenceRange: '0 - 100', status: 'Normal' },
          ]
    );
    setTechnicianNotes(order.clinicalNotes || '');
  };

  const handleSaveResults = () => {
    if (!activeOrder) return;
    updateLabResults(activeOrder.id, paramRows, technicianNotes);
    alert(`Results for order ${activeOrder.orderNo} successfully saved and marked Completed.`);
  };

  const handleVerify = () => {
    if (!activeOrder) return;
    verifyLabTest(activeOrder.id, currentUser.name);
    alert(`Order ${activeOrder.orderNo} verified by ${currentUser.name}. Report ready for doctor review.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            Clinical Laboratory Information Management System (LIMS)
          </h2>
          <p className="text-xs text-slate-500">
            Medical Technologist: <span className="font-semibold text-slate-800">{currentUser.name}</span> · ISO 15189 Certified Reference Lab
          </p>
        </div>

        {activeOrder && (
          <button
            onClick={() => setActiveDocumentPrint({ type: 'lab', data: activeOrder })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition self-start sm:self-center"
          >
            <Printer className="w-4 h-4" />
            Print Official Lab Certificate
          </button>
        )}
      </div>

      {/* Main Grid: Orders Queue & Diagnostic Result Entry Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Lab Orders Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Test Orders Queue ({filteredOrders.length})
              </span>
              <span className="text-[11px] font-mono text-purple-700 font-bold">
                {labOrders.filter((l) => l.status !== 'Verified').length} Pending
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, order #..."
                className="w-full text-xs border rounded-lg px-2.5 py-1.5 bg-white"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs border rounded-lg px-2 py-1.5 bg-white text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Parasitology">Parasitology</option>
                <option value="Hematology">Hematology</option>
                <option value="Microbiology">Microbiology</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredOrders.map((order) => {
              const isSelected = order.id === activeOrder?.id;
              const isStat = order.urgency.includes('STAT');
              return (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 transition cursor-pointer space-y-1.5 ${
                    isSelected ? 'bg-purple-50/80 border-l-4 border-l-purple-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{order.testName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                        order.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">{order.patientName}</span>
                    <span className="font-mono text-slate-400">{order.orderNo}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Sample: {order.sampleType}</span>
                    {isStat && (
                      <span className="text-rose-600 font-bold uppercase tracking-wider animate-pulse">
                        ● STAT Priority
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Diagnostic Analysis & Result Verification Workspace */}
        {activeOrder ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{activeOrder.testName}</h3>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-xs font-semibold">
                    {activeOrder.orderNo}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <span className="font-bold text-slate-800">{activeOrder.patientName}</span> · Category:{' '}
                  <span className="font-semibold text-purple-800">{activeOrder.testCategory}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Sample Type: <span className="font-semibold">{activeOrder.sampleType}</span> · Requested by:{' '}
                  {activeOrder.doctorName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeOrder.status === 'Verified' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-4 h-4" /> Verified & Sealed
                  </span>
                ) : (
                  <button
                    onClick={handleVerify}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    Doctor Verification Sign-Off
                  </button>
                )}
              </div>
            </div>

            {/* Parameters Entry Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Laboratory Test Analytes & Reference Limits
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setParamRows([
                      ...paramRows,
                      { name: 'Additional Parameter', value: '', unit: '', referenceRange: '', status: 'Normal' },
                    ])
                  }
                  className="text-xs text-purple-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Analyte Row
                </button>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="p-2.5">Analyte Name</th>
                      <th className="p-2.5">Observed Value</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5">Reference Range</th>
                      <th className="p-2.5">Flag Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paramRows.map((row, idx) => (
                      <tr key={idx} className={row.status === 'High' || row.status === 'Critical' ? 'bg-rose-50/40' : ''}>
                        <td className="p-2 font-medium">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => {
                              const updated = [...paramRows];
                              updated[idx].name = e.target.value;
                              setParamRows(updated);
                            }}
                            className="w-full border rounded px-2 py-1 bg-white font-semibold text-slate-900"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => {
                              const updated = [...paramRows];
                              updated[idx].value = e.target.value;
                              setParamRows(updated);
                            }}
                            className="w-24 border rounded px-2 py-1 bg-white font-mono font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => {
                              const updated = [...paramRows];
                              updated[idx].unit = e.target.value;
                              setParamRows(updated);
                            }}
                            className="w-20 border rounded px-2 py-1 bg-white text-slate-600 font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.referenceRange}
                            onChange={(e) => {
                              const updated = [...paramRows];
                              updated[idx].referenceRange = e.target.value;
                              setParamRows(updated);
                            }}
                            className="w-24 border rounded px-2 py-1 bg-white text-slate-500 font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={row.status}
                            onChange={(e) => {
                              const updated = [...paramRows];
                              updated[idx].status = e.target.value as any;
                              setParamRows(updated);
                            }}
                            className="border rounded px-2 py-1 bg-white text-[11px] font-bold"
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Low">Low</option>
                            <option value="Critical">Critical Alert</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technologist Observations & Remarks */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Technologist Microscopic & Pathological Remarks
              </label>
              <textarea
                rows={2}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-white"
                placeholder="Microscopic morphology, differential smear percentage, pathogen identified..."
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-[11px] text-slate-400">
                Technician: {activeOrder.technicianName || currentUser.name}
              </span>
              <button
                onClick={handleSaveResults}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Save & Update LIMS Record
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border p-12 text-center text-slate-400">
            Select a diagnostic order from the queue.
          </div>
        )}
      </div>
    </div>
  );
};
