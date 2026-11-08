import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Ambulance,
  HeartPulse,
  Activity,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { EmergencyCase } from '../../types';
import { AiTriageHelperModal } from '../ai/AiTriageHelperModal';

export const EmergencyTriageView: React.FC = () => {
  const { currentUser, emergencies, addEmergencyCase, updateEmergencyStatus } = useHospital();
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for incoming emergency
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [arrivalMode, setArrivalMode] = useState<any>('Ambulance 912');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [triageCode, setTriageCode] = useState<any>('Red (Resuscitation)');
  const [bp, setBp] = useState('90/60');
  const [hr, setHr] = useState(115);
  const [temp, setTemp] = useState(36.5);
  const [spo2, setSpo2] = useState(92);

  const handleApplyAiTriage = (aiSupport: any) => {
    if (aiSupport.triageLevel.includes('Red')) {
      setTriageCode('Red (Resuscitation)');
    } else if (aiSupport.triageLevel.includes('Orange')) {
      setTriageCode('Orange (Emergent)');
    } else if (aiSupport.triageLevel.includes('Yellow')) {
      setTriageCode('Yellow (Urgent)');
    } else {
      setTriageCode('Green (Standard)');
    }
  };

  const handleAddEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    addEmergencyCase({
      code: triageCode,
      patientName,
      age,
      gender,
      arrivalMode,
      arrivalTime: timeStr,
      chiefComplaint,
      triageVitals: { bp, hr, temp, spo2 },
      triageNurse: currentUser.name,
      status: triageCode.includes('Red') ? 'Resuscitation Room' : 'Triage Waiting',
    });

    setShowAddModal(false);
    setPatientName('');
    setChiefComplaint('');
    alert(`Emergency patient ${patientName} admitted to triage queue under ${triageCode}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            Emergency Department, Trauma Center & Triage
          </h2>
          <p className="text-xs text-slate-500">
            Emergency Triage Officer: <span className="font-semibold text-slate-800">{currentUser.name}</span> · Kigali 912 Ambulance Command Link
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-semibold text-xs transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Emergency Triage Helper
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Log Incoming Emergency Case
          </button>
        </div>
      </div>

      {/* Color Coded Triage Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RED CATEGORY */}
        <div className="bg-rose-50/50 rounded-2xl border-2 border-rose-300 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-rose-200">
            <span className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              Level 1: Red (Immediate)
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-mono">
              {emergencies.filter((e) => e.code.includes('Red')).length}
            </span>
          </div>

          <div className="space-y-2.5">
            {emergencies
              .filter((e) => e.code.includes('Red'))
              .map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-xl border border-rose-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{c.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.arrivalTime.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{c.chiefComplaint}</p>
                  <div className="text-[10px] text-rose-700 font-semibold">
                    BP {c.triageVitals.bp} · HR {c.triageVitals.hr} bpm · SpO2 {c.triageVitals.spo2}%
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t text-[10px]">
                    <span className="text-slate-500">{c.arrivalMode}</span>
                    <button
                      onClick={() => updateEmergencyStatus(c.id, 'Transferred to ICU')}
                      className="text-rose-700 font-bold hover:underline"
                    >
                      Transfer to ICU →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ORANGE CATEGORY */}
        <div className="bg-amber-50/50 rounded-2xl border-2 border-amber-300 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-amber-200">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Level 2: Orange (Emergent)
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-mono">
              {emergencies.filter((e) => e.code.includes('Orange')).length}
            </span>
          </div>

          <div className="space-y-2.5">
            {emergencies
              .filter((e) => e.code.includes('Orange'))
              .map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{c.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.arrivalTime.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{c.chiefComplaint}</p>
                  <div className="text-[10px] text-amber-800 font-semibold">
                    BP {c.triageVitals.bp} · HR {c.triageVitals.hr} bpm · Temp {c.triageVitals.temp}°C
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t text-[10px]">
                    <span className="text-slate-500">{c.arrivalMode}</span>
                    <span className="text-amber-800 font-semibold">{c.status}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* YELLOW CATEGORY */}
        <div className="bg-yellow-50/50 rounded-2xl border-2 border-yellow-300 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-yellow-200">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              Level 3: Yellow (Urgent)
            </span>
            <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full font-mono">
              {emergencies.filter((e) => e.code.includes('Yellow')).length}
            </span>
          </div>

          <div className="space-y-2.5">
            {emergencies
              .filter((e) => e.code.includes('Yellow'))
              .map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-xl border border-yellow-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{c.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.arrivalTime.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{c.chiefComplaint}</p>
                  <div className="text-[10px] text-yellow-900 font-semibold">
                    BP {c.triageVitals.bp} · Temp {c.triageVitals.temp}°C
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t text-[10px]">
                    <span className="text-slate-500">{c.arrivalMode}</span>
                    <button
                      onClick={() => updateEmergencyStatus(c.id, 'Admitted to Ward')}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Admit to Ward →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* GREEN CATEGORY */}
        <div className="bg-emerald-50/50 rounded-2xl border-2 border-emerald-300 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Level 4: Green (Standard)
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
              {emergencies.filter((e) => e.code.includes('Green')).length}
            </span>
          </div>

          <div className="space-y-2.5">
            {emergencies.filter((e) => e.code.includes('Green')).length === 0 ? (
              <div className="p-4 text-center text-[11px] text-slate-400">
                No active green non-urgent cases waiting in ED.
              </div>
            ) : (
              emergencies
                .filter((e) => e.code.includes('Green'))
                .map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-2 text-xs">
                    <span className="font-bold text-slate-900">{c.patientName}</span>
                    <p className="text-[11px] text-slate-600">{c.chiefComplaint}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Log Incoming Emergency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Log Incoming Emergency / Trauma Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmergencySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Patient Name or Unknown ID</label>
                  <input
                    required
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. John Doe / Trauma 903"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Arrival Mode</label>
                  <select
                    value={arrivalMode}
                    onChange={(e) => setArrivalMode(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Ambulance 912">Ambulance 912</option>
                    <option value="Walk-In">Walk-In Emergency</option>
                    <option value="Private Transfer">Private Hospital Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Triage Priority</label>
                  <select
                    value={triageCode}
                    onChange={(e) => setTriageCode(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-rose-700"
                  >
                    <option value="Red (Resuscitation)">Red (Immediate Resuscitation)</option>
                    <option value="Orange (Emergent)">Orange (Emergent &lt;10m)</option>
                    <option value="Yellow (Urgent)">Yellow (Urgent &lt;60m)</option>
                    <option value="Green (Standard)">Green (Standard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chief Presentation & Mechanism of Injury</label>
                <textarea
                  required
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs"
                  placeholder="e.g. Head trauma, acute dyspnea, suspected sepsis..."
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">BP</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full border rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">HR</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(Number(e.target.value))}
                    className="w-full border rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Temp</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="w-full border rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SpO2</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full border rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Admit to Triage Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Triage Helper Modal */}
      <AiTriageHelperModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyTriage={handleApplyAiTriage}
      />
    </div>
  );
};
