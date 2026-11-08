import React, { useState } from 'react';
import {
  Bed,
  HeartPulse,
  Pill,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  ClipboardList,
  User,
  Activity
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const NursingWardView: React.FC = () => {
  const {
    currentUser,
    wards,
    patients,
    vitals,
    recordVitals,
    marRecords,
    updateMedicationAdmin,
    updateBedStatus,
  } = useHospital();

  const [activeWardId, setActiveWardId] = useState<string>(wards[0]?.id || '');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[1]?.id || patients[0]?.id || '');
  const [showVitalsModal, setShowVitalsModal] = useState<boolean>(false);

  // Vitals form
  const [bpSystolic, setBpSystolic] = useState<number>(128);
  const [bpDiastolic, setBpDiastolic] = useState<number>(82);
  const [heartRate, setHeartRate] = useState<number>(76);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [spo2, setSpo2] = useState<number>(98);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [bloodGlucose, setBloodGlucose] = useState<number>(110);
  const [painScore, setPainScore] = useState<number>(1);
  const [nursingNotes, setNursingNotes] = useState<string>('Patient comfortable, resting in bed. Tolerating oral fluids well.');

  const activeWard = wards.find((w) => w.id === activeWardId) || wards[0];
  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const patientVitals = vitals.filter((v) => v.patientId === activePatient?.id);
  const patientMAR = marRecords.filter((m) => m.patientId === activePatient?.id);

  const handleRecordVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    recordVitals({
      patientId: activePatient.id,
      recordedBy: currentUser.name,
      bpSystolic,
      bpDiastolic,
      heartRate,
      temperature,
      spo2,
      respiratoryRate,
      bloodGlucose,
      painScore,
      notes: nursingNotes,
    });

    setShowVitalsModal(false);
    alert(`Vital signs recorded successfully for ${activePatient.fullName}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-600" />
            Nursing Station & Ward Bed Management
          </h2>
          <p className="text-xs text-slate-500">
            Nurse on duty: <span className="font-semibold text-slate-800">{currentUser.name}</span> · Ward assignment: {activeWard?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVitalsModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition"
          >
            <HeartPulse className="w-4 h-4" />
            Record Vital Signs
          </button>
        </div>
      </div>

      {/* Ward Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {wards.map((w) => {
          const isSelected = w.id === activeWard?.id;
          const occupied = w.beds.filter((b) => b.status === 'Occupied').length;
          return (
            <button
              key={w.id}
              onClick={() => setActiveWardId(w.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {w.name} ({occupied}/{w.totalBeds} Occupied)
            </button>
          );
        })}
      </div>

      {/* Interactive Bed Map */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {activeWard?.name} — Floor {activeWard?.floor}
            </h3>
            <p className="text-xs text-slate-500">
              Nurse-in-Charge: <span className="font-semibold">{activeWard?.nurseInCharge}</span>
            </p>
          </div>

          {/* Status Legends */}
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Occupied
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cleaning
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Maintenance
            </span>
          </div>
        </div>

        {/* Beds Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {activeWard?.beds.map((bed) => {
            const isBedOccupied = bed.status === 'Occupied';
            const isCleaning = bed.status === 'Cleaning';
            const isAvailable = bed.status === 'Available';

            return (
              <div
                key={bed.id}
                className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition ${
                  isBedOccupied
                    ? 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-xs'
                    : isCleaning
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : isAvailable
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-sm">{bed.bedNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isBedOccupied
                          ? 'bg-blue-200 text-blue-900'
                          : isCleaning
                          ? 'bg-amber-200 text-amber-900'
                          : isAvailable
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  {isBedOccupied ? (
                    <div className="mt-2 space-y-0.5">
                      <div className="font-bold text-slate-900 line-clamp-1">{bed.patientName}</div>
                      <div className="text-[10px] text-slate-500">Since {bed.admissionDate}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-slate-400 italic">
                      {isCleaning ? 'Sanitization in progress' : 'Ready for admission'}
                    </div>
                  )}
                </div>

                {/* Bed Status Actions */}
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  {isCleaning && (
                    <button
                      onClick={() => updateBedStatus(activeWard.id, bed.id, 'Available')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      ✓ Mark Ready
                    </button>
                  )}
                  {isAvailable && (
                    <button
                      onClick={() => updateBedStatus(activeWard.id, bed.id, 'Cleaning')}
                      className="text-amber-700 font-medium hover:underline"
                    >
                      Clean Bed
                    </button>
                  )}
                  {isBedOccupied && (
                    <button
                      onClick={() => {
                        const targetPat = patients.find((p) => p.id === bed.patientId);
                        if (targetPat) setSelectedPatientId(targetPat.id);
                      }}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Select Chart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Care & MAR Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Patient Selector for Care */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Select Inpatient for Nursing Care
          </span>

          <div className="space-y-2">
            {patients
              .filter((p) => p.admissionStatus === 'Admitted' || p.id === selectedPatientId)
              .map((p) => {
                const isSelected = p.id === activePatient?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">{p.fullName}</span>
                      <span className="font-mono text-[10px] text-blue-700 font-semibold">{p.assignedBed || 'Bed B-04'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {p.assignedWard || 'Internal Medicine'} · Dr. {p.attendingDoctorName || 'David Mugisha'}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Medication Administration Record (MAR) & Nursing Vitals Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Care Sheet: {activePatient?.fullName} ({activePatient?.hospitalId})
              </h3>
              <p className="text-xs text-slate-500">
                Ward: <span className="font-semibold">{activePatient?.assignedWard || 'Inpatient Ward'}</span> · Allergies:{' '}
                <span className="text-rose-700 font-bold">
                  {activePatient?.allergies.length ? activePatient.allergies.join(', ') : 'None'}
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowVitalsModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              + Log New Vitals
            </button>
          </div>

          {/* Scheduled Medication Administration Record (MAR) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-indigo-600" />
              Medication Administration Record (MAR Checklist)
            </h4>

            {patientMAR.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                No active scheduled doses on MAR for this patient today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                {patientMAR.map((mar) => (
                  <div key={mar.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 transition">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{mar.medicineName}</span>
                        <span className="px-2 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                          {mar.dosage} ({mar.route})
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Scheduled Time: <span className="font-semibold text-slate-800">{mar.scheduledTime}</span>
                        {mar.administeredTime && (
                          <span className="text-emerald-700 ml-2 font-medium">
                            · Given at {mar.administeredTime} by {mar.administeredBy}
                          </span>
                        )}
                      </div>
                      {mar.notes && <div className="text-[10px] text-slate-400 italic">Notes: {mar.notes}</div>}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {mar.status === 'Given' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Administered
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => updateMedicationAdmin(mar.id, 'Given')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Mark Given
                          </button>
                          <button
                            onClick={() => updateMedicationAdmin(mar.id, 'Held', 'Patient nauseous')}
                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-medium"
                          >
                            Hold Dose
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vitals Trend Table */}
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Observed Vital Signs & Nursing Notes
            </h4>

            {patientVitals.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                No vitals logged yet for this patient.
              </div>
            ) : (
              <div className="space-y-3">
                {patientVitals.map((v) => (
                  <div key={v.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-slate-500 font-semibold">{v.timestamp}</span>
                      <span className="text-slate-600 font-medium">Logged by: {v.recordedBy}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-400 block uppercase">Blood Pressure</span>
                        <span className="font-bold text-slate-900 font-mono">{v.bpSystolic}/{v.bpDiastolic} mmHg</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-400 block uppercase">Heart Rate</span>
                        <span className="font-bold text-slate-900 font-mono">{v.heartRate} bpm</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
                        <span className="font-bold text-slate-900 font-mono">{v.temperature}°C</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-400 block uppercase">SpO2</span>
                        <span className="font-bold text-emerald-700 font-mono">{v.spo2}%</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-400 block uppercase">Pain Score</span>
                        <span className="font-bold text-amber-700 font-mono">{v.painScore} / 10</span>
                      </div>
                    </div>

                    {v.notes && (
                      <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">Observation Notes: </span>
                        {v.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Patient Vital Signs</h3>
                <p className="text-xs text-slate-500">{activePatient?.fullName} ({activePatient?.hospitalId})</p>
              </div>
              <button onClick={() => setShowVitalsModal(false)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordVitalsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">BP Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pain Scale (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nursing Care Notes & Observations</label>
                <textarea
                  rows={2}
                  value={nursingNotes}
                  onChange={(e) => setNursingNotes(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Vitals Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
