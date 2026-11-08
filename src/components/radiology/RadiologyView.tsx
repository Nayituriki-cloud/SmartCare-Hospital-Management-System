import React, { useState } from 'react';
import {
  Radio,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Printer,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { RadiologyOrder } from '../../types';

export const RadiologyView: React.FC = () => {
  const { currentUser, radiologyOrders, updateRadiologyReport } = useHospital();
  const [activeOrderId, setActiveOrderId] = useState<string>(radiologyOrders[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeOrder = radiologyOrders.find((r) => r.id === activeOrderId) || radiologyOrders[0];

  const [reportText, setReportText] = useState(activeOrder?.reportText || '');
  const [impression, setImpression] = useState(activeOrder?.impression || '');

  const filteredOrders = radiologyOrders.filter((r) =>
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.modality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOrder = (order: RadiologyOrder) => {
    setActiveOrderId(order.id);
    setReportText(order.reportText || '');
    setImpression(order.impression || '');
  };

  const handleSaveReport = () => {
    if (!activeOrder) return;
    updateRadiologyReport(activeOrder.id, reportText, impression, currentUser.name);
    alert(`Radiology study ${activeOrder.orderNo} reported and signed off.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-600" />
            Diagnostic Radiology & Medical Imaging (PACS/DICOM)
          </h2>
          <p className="text-xs text-slate-500">
            Consultant Radiologist: <span className="font-semibold text-slate-800">{currentUser.name}</span> · Multi-Slice CT / 1.5T MRI / Digital X-Ray
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Imaging Worklist */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Imaging Worklist ({filteredOrders.length})
              </span>
              <span className="text-[11px] font-mono text-sky-700 font-bold">
                {radiologyOrders.filter((r) => r.status !== 'Reported').length} Pending
              </span>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, modality, order #..."
              className="w-full text-xs border rounded-lg px-2.5 py-1.5 bg-white"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredOrders.map((order) => {
              const isSelected = order.id === activeOrder?.id;
              return (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 transition cursor-pointer space-y-1.5 ${
                    isSelected ? 'bg-sky-50/80 border-l-4 border-l-sky-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{order.modality} — {order.bodyPart}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                        order.status === 'Reported'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold">{order.patientName}</span>
                    <span className="font-mono text-slate-400">{order.orderNo}</span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Requested by: Dr. {order.doctorId} · {order.requestedDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Radiologist Reading Console */}
        {activeOrder ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {activeOrder.modality} Study: {activeOrder.bodyPart}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-xs font-semibold">
                    {activeOrder.orderNo}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <span className="font-bold text-slate-800">{activeOrder.patientName}</span> ({activeOrder.patientId})
                </p>
              </div>

              {activeOrder.status === 'Reported' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" /> Final Report Signed
                </span>
              )}
            </div>

            {/* Diagnostic Image Reference preview */}
            {activeOrder.imageThumbnailUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex flex-col items-center p-3 text-center">
                <img
                  src={activeOrder.imageThumbnailUrl}
                  alt="Medical scan thumbnail"
                  className="max-h-64 object-cover rounded-lg shadow-md"
                />
                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  High-Resolution Digital Imaging Matrix · Calibrated PACS Feed
                </span>
              </div>
            )}

            {/* Radiologist Report Entry */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Radiological Findings & Anatomical Observations
                </label>
                <textarea
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-white text-xs leading-relaxed"
                  placeholder="Detail parenchymal density, bone cortex, vascularization, soft tissue..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Diagnostic Impression & Conclusion
                </label>
                <textarea
                  rows={2}
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-white text-xs font-semibold text-slate-900"
                  placeholder="Definitive diagnostic conclusion..."
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-[11px] text-slate-400">
                Reporting Radiologist: {activeOrder.radiologistName || currentUser.name}
              </span>
              <button
                onClick={handleSaveReport}
                className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Sign & Finalize Imaging Report
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border p-12 text-center text-slate-400">
            Select an imaging study from the worklist.
          </div>
        )}
      </div>
    </div>
  );
};
