import React, { useState } from 'react';
import {
  Scissors,
  Droplet,
  Clock,
  User,
  ShieldAlert,
  Plus,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const BloodBankAndSurgeriesView: React.FC = () => {
  const { surgeries, scheduleSurgery, bloodBank, reserveBlood, patients } = useHospital();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [procedureName, setProcedureName] = useState('Open Inguinal Hernia Repair with Mesh');
  const [theatreRoom, setTheatreRoom] = useState<any>('OT 3 (General Surgery)');
  const [leadSurgeon, setLeadSurgeon] = useState('Dr. Vincent Gasana, FCS');
  const [anesthesiologist, setAnesthesiologist] = useState('Dr. Karangwa Alexis, MD');
  const [scheduledTime, setScheduledTime] = useState('2026-11-09 09:00');
  const [durationMins, setDurationMins] = useState(60);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    scheduleSurgery({
      theatreRoom,
      procedureName,
      patientName: pat.fullName,
      patientId: pat.id,
      leadSurgeon,
      anesthesiologist,
      scheduledTime,
      estimatedDurationMins: durationMins,
      status: 'Scheduled',
    });
    setShowScheduleModal(false);
    alert(`Surgery scheduled for ${pat.fullName} in ${theatreRoom}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scissors className="w-5 h-5 text-indigo-600" />
            Operating Theatres (OT) & National Blood Transfusion Bank
          </h2>
          <p className="text-xs text-slate-500">
            Surgical Suite Scheduling · Cold Chain Blood Product Surveillance (National Center for Blood Transfusion NCBT)
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Schedule Surgical Procedure
        </button>
      </div>

      {/* BLOOD BANK INVENTORY STRIP */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Hospital Blood Bank Storage</h3>
              <p className="text-xs text-slate-500">Real-time packed red blood cells (PRBC) inventory by ABO & Rh type</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Total Available: <span className="font-bold text-rose-700">{bloodBank.reduce((s, b) => s + b.unitsAvailable, 0)} units</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodBank.map((unit) => {
            const isLow = unit.unitsAvailable < 5;
            return (
              <div
                key={unit.group}
                className={`p-3 rounded-xl border flex flex-col justify-between text-center transition ${
                  isLow ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="text-lg font-black font-sans text-rose-700 block">{unit.group}</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{unit.unitsAvailable}</div>
                  <span className="text-[10px] text-slate-500 block">Units Ready</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                  <div>Reserved: <span className="font-semibold text-slate-800">{unit.unitsReserved}</span></div>
                  <button
                    onClick={() => {
                      if (unit.unitsAvailable <= 0) {
                        alert(`No available units for ${unit.group}. Contact Regional Blood Center.`);
                        return;
                      }
                      reserveBlood(unit.group, 1);
                      alert(`Reserved 1 unit of ${unit.group} for surgical theatre.`);
                    }}
                    disabled={unit.unitsAvailable <= 0}
                    className="w-full py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[10px] transition disabled:opacity-40"
                  >
                    Reserve Unit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OPERATING THEATRE SUITES SCHEDULE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-indigo-600" />
            Today's Surgical Theatre Operations
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {surgeries.length} procedures on roster
          </span>
        </div>

        <div className="divide-y divide-slate-100 border rounded-2xl overflow-hidden">
          {surgeries.map((surg) => (
            <div key={surg.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{surg.procedureName}</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      surg.status === 'In Theatre'
                        ? 'bg-rose-100 text-rose-800 animate-pulse border border-rose-200'
                        : surg.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {surg.status}
                  </span>
                </div>

                <div className="text-slate-600">
                  Patient: <span className="font-semibold text-slate-900">{surg.patientName}</span> ({surg.patientId}) · Room:{' '}
                  <span className="font-semibold text-indigo-700">{surg.theatreRoom}</span>
                </div>

                <div className="text-slate-500 text-[11px]">
                  Lead Surgeon: <span className="font-semibold">{surg.leadSurgeon}</span> · Anesthesia: {surg.anesthesiologist}
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="text-[11px] text-slate-500">
                  <div className="font-semibold font-mono text-slate-800">{surg.scheduledTime}</div>
                  <div>Est. {surg.estimatedDurationMins} minutes</div>
                </div>

                {surg.status === 'Scheduled' && (
                  <button
                    onClick={() => {
                      alert(`Patient prepped and transferred to ${surg.theatreRoom}.`);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Prep Patient
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Surgery Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Book Surgical Theatre Suite</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.hospitalId}) — Blood: {p.bloodType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Procedure Name</label>
                <input
                  required
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Laparoscopic Appendectomy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Operating Theatre Suite</label>
                  <select
                    value={theatreRoom}
                    onChange={(e) => setTheatreRoom(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="OT 1 (Laparoscopy & Minimally Invasive)">OT 1 - Laparoscopic</option>
                    <option value="OT 2 (Orthopedics & Trauma)">OT 2 - Orthopedics</option>
                    <option value="OT 3 (General Surgery)">OT 3 - General Surgery</option>
                    <option value="OT 4 (Obstetrics & C-Section)">OT 4 - C-Section & Obs</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lead Surgeon</label>
                  <input
                    type="text"
                    value={leadSurgeon}
                    onChange={(e) => setLeadSurgeon(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Anesthesiologist</label>
                  <input
                    type="text"
                    value={anesthesiologist}
                    onChange={(e) => setAnesthesiologist(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scheduled Date & Time</label>
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="YYYY-MM-DD HH:mm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Book Operation Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
