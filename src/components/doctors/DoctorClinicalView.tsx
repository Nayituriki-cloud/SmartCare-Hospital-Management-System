import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Pill,
  FlaskConical,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  FileCheck
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AiClinicalAssistantModal } from '../ai/AiClinicalAssistantModal';

export const DoctorClinicalView: React.FC = () => {
  const {
    currentUser,
    appointments,
    updateAppointmentStatus,
    patients,
    vitals,
    inventory,
    addConsultation,
    addPrescription,
    orderLabTest,
    orderRadiology,
    setActiveDocumentPrint,
  } = useHospital();

  const [activeAptId, setActiveAptId] = useState<string>(appointments[0]?.id || '');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Form states for active consultation
  const [chiefComplaint, setChiefComplaint] = useState(
    'Persistent dry cough, intermittent fever spikes, and general malaise for 4 days.'
  );
  const [historyOfIllness, setHistoryOfIllness] = useState(
    'Started with mild scratchy throat 4 days ago, progressed to subjective fever and night sweats. No hemoptysis, denies chest pain.'
  );
  const [examFindings, setExamFindings] = useState(
    'Alert, oriented x3. Temperature 38.4°C. Chest auscultation reveals mild scattered rhonchi bilaterally. Heart regular rhythm without murmur.'
  );
  const [diagnosis, setDiagnosis] = useState('Acute Bronchitis with Suspicion of Uncomplicated Malaria');
  const [icdCode, setIcdCode] = useState('J20.9 / B54');
  const [followUpDays, setFollowUpDays] = useState('5');

  // AI SOAP notes holder
  const [soapNotes, setSoapNotes] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null>(null);

  // Dynamic Prescription items in consultation
  const [prescriptionItems, setPrescriptionItems] = useState<
    Array<{
      medicineId: string;
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
      quantity: number;
    }>
  >([
    {
      medicineId: inventory[1]?.id || 'INV-MED-02',
      medicineName: inventory[1]?.name || 'Artemether + Lumefantrine (Coartem)',
      dosage: '20/120mg (4 tabs/dose)',
      frequency: 'Twice daily',
      duration: '3 days',
      instructions: 'Take immediately after fatty meals',
      quantity: 24,
    },
    {
      medicineId: inventory[0]?.id || 'INV-MED-01',
      medicineName: inventory[0]?.name || 'Amoxicillin Trihydrate 500mg',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '5 days',
      instructions: 'Drink ample water',
      quantity: 15,
    },
  ]);

  // Lab orders in consultation
  const [labTestsToOrder, setLabTestsToOrder] = useState<string[]>([
    'Malaria Rapid Diagnostic Test (RDT) & Giemsa Blood Smear',
    'Full Blood Count (FBC / NFS) & Platelets',
  ]);

  // Radiology order
  const [radiologyModality, setRadiologyModality] = useState<string>('None');

  const currentAppointment = appointments.find((a) => a.id === activeAptId) || appointments[0];
  const currentPatient = patients.find((p) => p.id === currentAppointment?.patientId) || patients[0];
  const patientVitals = vitals.find((v) => v.patientId === currentPatient?.id);

  const handleApplySoapFromAi = (soap: any) => {
    setSoapNotes(soap);
    setChiefComplaint(soap.subjective || chiefComplaint);
    setExamFindings(soap.objective || examFindings);
    setDiagnosis(soap.assessment || diagnosis);
  };

  const handleAddPrescriptionRow = () => {
    const med = inventory[0];
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.strength,
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take as directed',
        quantity: 10,
      },
    ]);
  };

  const handleRemovePrescriptionRow = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleFinishConsultation = () => {
    if (!currentPatient) return;

    // 1. Save Consultation Record
    const newCon = addConsultation({
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      chiefComplaint,
      historyOfPresentIllness: historyOfIllness,
      vitals: {
        bp: patientVitals ? `${patientVitals.bpSystolic}/${patientVitals.bpDiastolic} mmHg` : '120/80 mmHg',
        hr: patientVitals?.heartRate || 80,
        temp: patientVitals?.temperature || 37.0,
        spo2: patientVitals?.spo2 || 98,
      },
      physicalExamination: examFindings,
      diagnosis,
      icdCode,
      soapNotes: soapNotes || undefined,
      aiAssisted: !!soapNotes,
      followUpDate: new Date(Date.now() + Number(followUpDays) * 86400000).toISOString().split('T')[0],
    });

    // 2. Add Prescriptions if items present
    if (prescriptionItems.length > 0) {
      addPrescription({
        patientId: currentPatient.id,
        patientName: currentPatient.fullName,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: prescriptionItems.map((p) => ({ ...p, dispensed: false })),
        totalCostRWF: prescriptionItems.reduce((sum, item) => sum + item.quantity * 250, 0),
      });
    }

    // 3. Order Lab tests if selected
    labTestsToOrder.forEach((testName) => {
      orderLabTest({
        patientId: currentPatient.id,
        patientName: currentPatient.fullName,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        testCategory: testName.includes('Malaria') ? 'Parasitology' : 'Hematology',
        testName,
        sampleType: 'Whole Blood',
        urgency: 'STAT (Immediate)',
        status: 'Requested',
        results: [],
        clinicalNotes: `Routine diagnostic workup for ${diagnosis}`,
      });
    });

    // 4. Order Radiology if selected
    if (radiologyModality !== 'None') {
      orderRadiology({
        patientId: currentPatient.id,
        patientName: currentPatient.fullName,
        doctorId: currentUser.id,
        modality: radiologyModality as any,
        bodyPart: 'Chest / Thorax',
        urgency: 'Routine',
        status: 'Requested',
      });
    }

    // 5. Update appointment status
    if (currentAppointment) {
      updateAppointmentStatus(currentAppointment.id, 'Completed');
    }

    alert(`Consultation signed and filed for ${currentPatient.fullName}. Prescriptions dispatched to Pharmacy and Lab tests routed to LIMS.`);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Doctor Clinical Workspace & Electronic Medical Records
          </h2>
          <p className="text-xs text-slate-500">
            Attending Physician: <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.department || 'Clinical Medicine'})
          </p>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md transition"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          AI Clinical Assistant (SOAP Drafter)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Consultation Schedule Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" /> Today's Consultations ({appointments.length})
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {appointments.filter((a) => a.status !== 'Completed').length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {appointments.map((apt) => {
              const isSelected = apt.id === currentAppointment?.id;
              return (
                <div
                  key={apt.id}
                  onClick={() => setActiveAptId(apt.id)}
                  className={`p-4 transition cursor-pointer space-y-1.5 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{apt.patientName}</span>
                    <span className="font-mono text-[11px] text-slate-500">{apt.time}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">{apt.reason}</p>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-400 font-medium">{apt.type}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full font-bold uppercase ${
                        apt.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : apt.status === 'Checked-In'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Digital Clinical Examination & Ordering Desk */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Patient Overview Header */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{currentPatient.fullName}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  {currentPatient.hospitalId}
                </span>
                <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                  {currentPatient.bloodType}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {currentPatient.gender}, DOB: {currentPatient.dob} · Insurance: <span className="font-semibold text-blue-700">{currentPatient.insuranceProvider}</span>
              </div>
            </div>

            {/* Vitals Snapshot */}
            <div className="flex items-center gap-3 text-xs">
              <div className="text-center p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">BP</span>
                <span className="font-bold text-slate-800 font-mono">
                  {patientVitals ? `${patientVitals.bpSystolic}/${patientVitals.bpDiastolic}` : '122/80'}
                </span>
              </div>
              <div className="text-center p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">HR</span>
                <span className="font-bold text-slate-800 font-mono">
                  {patientVitals ? `${patientVitals.heartRate} bpm` : '78 bpm'}
                </span>
              </div>
              <div className="text-center p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
                <span className="font-bold text-slate-800 font-mono">
                  {patientVitals ? `${patientVitals.temperature}°C` : '36.8°C'}
                </span>
              </div>
              <div className="text-center p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">SpO2</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {patientVitals ? `${patientVitals.spo2}%` : '98%'}
                </span>
              </div>
            </div>
          </div>

          {/* Allergy Banner */}
          {currentPatient.allergies.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <span className="font-bold">Patient Drug Allergy Alert: </span>
                {currentPatient.allergies.join(', ')}. Avoid prescribing beta-lactams or related compounds.
              </span>
            </div>
          )}

          {/* Clinical Examination Fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chief Complaints & Present Illness</label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Physical Examination Findings</label>
              <textarea
                rows={2}
                value={examFindings}
                onChange={(e) => setExamFindings(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full text-xs border rounded-xl px-3 py-2 bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ICD-11 / ICD-10 Code</label>
                <input
                  type="text"
                  value={icdCode}
                  onChange={(e) => setIcdCode(e.target.value)}
                  className="w-full text-xs border rounded-xl px-3 py-2 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Electronic Prescription Pad */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" /> Electronic Prescription Pad (Direct to Pharmacy)
              </h4>
              <button
                type="button"
                onClick={handleAddPrescriptionRow}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            <div className="space-y-2">
              {prescriptionItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-500 block">Medicine</label>
                    <select
                      value={item.medicineId}
                      onChange={(e) => {
                        const chosen = inventory.find((i) => i.id === e.target.value);
                        if (chosen) {
                          const updated = [...prescriptionItems];
                          updated[idx].medicineId = chosen.id;
                          updated[idx].medicineName = chosen.name;
                          updated[idx].dosage = chosen.strength;
                          setPrescriptionItems(updated);
                        }
                      }}
                      className="w-full border rounded-lg px-2 py-1 bg-white font-medium"
                    >
                      {inventory.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.form}, {i.strength})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-500 block">Dosage & Frequency</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => {
                        const updated = [...prescriptionItems];
                        updated[idx].frequency = e.target.value;
                        setPrescriptionItems(updated);
                      }}
                      className="w-full border rounded-lg px-2 py-1 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 block">Duration</label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => {
                        const updated = [...prescriptionItems];
                        updated[idx].duration = e.target.value;
                        setPrescriptionItems(updated);
                      }}
                      className="w-full border rounded-lg px-2 py-1 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 block">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...prescriptionItems];
                        updated[idx].quantity = Number(e.target.value);
                        setPrescriptionItems(updated);
                      }}
                      className="w-full border rounded-lg px-2 py-1 bg-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemovePrescriptionRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Investigation Orders (Laboratory & Radiology) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
            {/* Laboratory Orders */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <FlaskConical className="w-4 h-4 text-purple-600" /> Order Diagnostic Lab Tests
              </h4>
              <div className="space-y-1.5">
                {[
                  'Malaria Rapid Diagnostic Test (RDT) & Giemsa Blood Smear',
                  'Full Blood Count (FBC / NFS) & Platelets',
                  'Comprehensive Renal Panel & Electrolytes',
                  'Urinalysis Dipstick & Microscopy',
                  'Blood Glucose Random / Fasting',
                ].map((testName) => {
                  const isChecked = labTestsToOrder.includes(testName);
                  return (
                    <label
                      key={testName}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setLabTestsToOrder(labTestsToOrder.filter((t) => t !== testName));
                          } else {
                            setLabTestsToOrder([...labTestsToOrder, testName]);
                          }
                        }}
                        className="rounded text-purple-600"
                      />
                      <span className="text-slate-700">{testName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Radiology Modality */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Radio className="w-4 h-4 text-sky-600" /> Order Radiology Imaging
              </h4>
              <div className="space-y-1.5">
                {['None', 'X-Ray', 'Ultrasound', 'CT Scan', 'MRI'].map((mod) => (
                  <label
                    key={mod}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="radiologyMod"
                      value={mod}
                      checked={radiologyModality === mod}
                      onChange={() => setRadiologyModality(mod)}
                      className="text-blue-600"
                    />
                    <span className="text-slate-700">{mod === 'None' ? 'No imaging requested' : `${mod} Imaging Request`}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Follow-up in:</span>
              <select
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value)}
                className="border rounded-lg px-2 py-1 bg-white font-medium"
              >
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
                <option value="7">1 Week</option>
                <option value="14">2 Weeks</option>
                <option value="30">1 Month</option>
              </select>
            </div>

            <button
              onClick={handleFinishConsultation}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition"
            >
              <FileCheck className="w-4 h-4" />
              Sign Consultation & Dispatch Orders
            </button>
          </div>
        </div>
      </div>

      {/* AI Clinical Assistant Modal */}
      <AiClinicalAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplySoap={handleApplySoapFromAi}
        prefillPatientId={currentPatient?.id}
      />
    </div>
  );
};
