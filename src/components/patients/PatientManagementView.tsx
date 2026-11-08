import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Bed,
  FileText,
  AlertTriangle,
  HeartPulse,
  Pill,
  FlaskConical,
  Receipt,
  CheckCircle,
  X,
  Stethoscope,
  Printer,
  Calendar
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient, InsuranceProvider, AdmissionStatus } from '../../types';

interface Props {
  isRegisterOpen?: boolean;
  onCloseRegister?: () => void;
}

export const PatientManagementView: React.FC<Props> = ({ isRegisterOpen, onCloseRegister }) => {
  const {
    patients,
    addPatient,
    updatePatient,
    admitPatient,
    dischargePatient,
    vitals,
    prescriptions,
    labOrders,
    invoices,
    wards,
    staffList,
    formatCurrency,
    setActiveDocumentPrint,
    searchQuery,
    setSearchQuery,
  } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(isRegisterOpen || false);
  const [filterAdmission, setFilterAdmission] = useState<string>('ALL');
  const [showAdmitModal, setShowAdmitModal] = useState<boolean>(false);

  // Form states for new patient registration
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '1995-05-15',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    bloodType: 'O+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
    nationalId: '1199570028491823',
    phone: '+250 788 ',
    email: '',
    address: 'Kigali, Gasabo, Kimironko',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '+250 788 ',
    insuranceProvider: 'RSSB / RAMA' as InsuranceProvider,
    insurancePolicyNumber: 'RAMA-2026-',
    allergies: 'Penicillin',
    chronicConditions: 'None',
  });

  // Admission form state
  const [selectedWardId, setSelectedWardId] = useState(wards[0]?.id || '');
  const [selectedBedNumber, setSelectedBedNumber] = useState('');
  const [attendingDoctor, setAttendingDoctor] = useState(
    staffList.find((s) => s.role === 'Doctor')?.name || 'Dr. David Mugisha, MD'
  );

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Filtering
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalId.includes(searchQuery) ||
      p.phone.includes(searchQuery);

    const matchesStatus =
      filterAdmission === 'ALL' || p.admissionStatus === filterAdmission;

    return matchesSearch && matchesStatus;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addPatient({
      fullName: formData.fullName,
      dob: formData.dob,
      gender: formData.gender,
      bloodType: formData.bloodType,
      nationalId: formData.nationalId,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      emergencyContact: {
        name: formData.emergencyName || 'Family Member',
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone,
      },
      insuranceProvider: formData.insuranceProvider,
      insurancePolicyNumber: formData.insurancePolicyNumber,
      allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
      chronicConditions: formData.chronicConditions
        ? formData.chronicConditions.split(',').map((s) => s.trim())
        : [],
      admissionStatus: 'Outpatient',
    });

    setSelectedPatientId(created.id);
    setShowRegisterModal(false);
    if (onCloseRegister) onCloseRegister();
  };

  const handleConfirmAdmission = () => {
    if (!selectedBedNumber) {
      alert('Please select an available bed');
      return;
    }
    const doc = staffList.find((s) => s.name === attendingDoctor) || staffList[2];
    admitPatient(activePatient.id, selectedWardId, selectedBedNumber, doc.id, doc.name);
    setShowAdmitModal(false);
  };

  const handleGenerateCertificate = () => {
    setActiveDocumentPrint({
      type: 'dischargeCertificate',
      data: {
        patientName: activePatient.fullName,
        hospitalId: activePatient.hospitalId,
        age: new Date().getFullYear() - new Date(activePatient.dob).getFullYear(),
        diagnosis: 'Acute episode under resolution. Cleared for recuperation.',
        treatment: 'Comprehensive inpatient monitoring and therapy.',
        doctorName: attendingDoctor,
      },
    });
  };

  const currentPatientVitals = vitals.filter((v) => v.patientId === activePatient?.id);
  const currentPatientPrescriptions = prescriptions.filter((p) => p.patientId === activePatient?.id);
  const currentPatientLabs = labOrders.filter((l) => l.patientId === activePatient?.id);
  const currentPatientInvoices = invoices.filter((i) => i.patientId === activePatient?.id);

  const selectedWardObj = wards.find((w) => w.id === selectedWardId);
  const availableBedsInSelectedWard = selectedWardObj?.beds.filter((b) => b.status === 'Available') || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Management & Electronic Health Records (EHR)
          </h2>
          <p className="text-xs text-slate-500">
            Secure centralized registry compliant with Rwanda Data Protection and Privacy Law
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, Hospital ID (SC-KGL-...), National ID (16 digits), or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterAdmission}
            onChange={(e) => setFilterAdmission(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Admission Statuses</option>
            <option value="Outpatient">Outpatient</option>
            <option value="Admitted">Inpatient Admitted</option>
            <option value="Discharged">Discharged</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Patients List (Left) & Active Patient Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Patient Master Directory */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Patients Registry ({filteredPatients.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Real-time sync</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching patients found. Click "Register New Patient" to add.
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = p.id === activePatient?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-4 transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{p.fullName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                            p.admissionStatus === 'Admitted'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.admissionStatus}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>{p.hospitalId}</span>
                        <span>·</span>
                        <span>{p.phone}</span>
                      </div>

                      <div className="text-[11px] text-slate-600">
                        {p.gender}, DOB: {p.dob} · <span className="font-semibold text-blue-700">{p.insuranceProvider}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border">
                        {p.bloodType}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Comprehensive Patient Medical Record */}
        {activePatient ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-slate-900">{activePatient.fullName}</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md font-mono">
                    {activePatient.hospitalId}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-md">
                    Blood: {activePatient.bloodType}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  National ID / Passport: <span className="font-mono text-slate-700 font-medium">{activePatient.nationalId}</span> · Phone: {activePatient.phone}
                </p>
                <p className="text-xs text-slate-500">
                  Address: {activePatient.address}
                </p>
              </div>

              {/* Patient Admission Status & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {activePatient.admissionStatus === 'Admitted' ? (
                  <>
                    <button
                      onClick={() => dischargePatient(activePatient.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      Discharge Patient
                    </button>
                    <button
                      onClick={handleGenerateCertificate}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Discharge Summary
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAdmitModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <Bed className="w-3.5 h-3.5" />
                    Admit to Ward
                  </button>
                )}
              </div>
            </div>

            {/* Insurance & Emergency Alert Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-800">Insurance Scheme</span>
                <div className="font-semibold text-slate-900">{activePatient.insuranceProvider}</div>
                <div className="text-slate-500 font-mono text-[11px]">{activePatient.insurancePolicyNumber}</div>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Known Drug Allergies
                </span>
                <div className="font-semibold text-rose-950">
                  {activePatient.allergies.length > 0 ? activePatient.allergies.join(', ') : 'No known drug allergies (NKDA)'}
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-800">Emergency Contact</span>
                <div className="font-semibold text-slate-900">{activePatient.emergencyContact.name} ({activePatient.emergencyContact.relationship})</div>
                <div className="text-slate-500 font-mono text-[11px]">{activePatient.emergencyContact.phone}</div>
              </div>
            </div>

            {/* Inpatient Ward Assignment details if admitted */}
            {activePatient.admissionStatus === 'Admitted' && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-indigo-700" />
                  <div>
                    <span className="font-bold text-indigo-950">Currently Admitted in: </span>
                    <span className="font-semibold text-indigo-900">{activePatient.assignedWard}</span> — Bed <span className="font-bold">{activePatient.assignedBed}</span>
                  </div>
                </div>
                <div className="text-indigo-800">
                  Attending: <span className="font-semibold">{activePatient.attendingDoctorName || 'On-Call Consultant'}</span>
                </div>
              </div>
            )}

            {/* Longitudinal Vitals History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                Latest Vitals Monitoring Records
              </h4>

              {currentPatientVitals.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                  No vitals records logged yet. Nursing staff can enter vitals under "Nursing & Wards".
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">BP (mmHg)</th>
                        <th className="p-2.5">HR (bpm)</th>
                        <th className="p-2.5">Temp (°C)</th>
                        <th className="p-2.5">SpO2 (%)</th>
                        <th className="p-2.5">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentPatientVitals.map((v) => (
                        <tr key={v.id}>
                          <td className="p-2.5 font-mono text-slate-600">{v.timestamp}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{v.bpSystolic}/{v.bpDiastolic}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{v.heartRate}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{v.temperature}°C</td>
                          <td className="p-2.5 font-semibold text-emerald-700">{v.spo2}%</td>
                          <td className="p-2.5 text-slate-500">{v.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Prescriptions & Lab Results Tabs / Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prescriptions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Prescriptions
                </h4>
                {currentPatientPrescriptions.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                    No active prescriptions.
                  </div>
                ) : (
                  currentPatientPrescriptions.map((prx) => (
                    <div key={prx.id} className="p-3 bg-slate-50 rounded-xl border space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{prx.prescriptionNo}</span>
                        <span className="px-2 py-0.2 rounded-full font-bold text-[10px] bg-teal-100 text-teal-800">
                          {prx.status}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        {prx.items.map((i) => i.medicineName).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-400">Dr. {prx.doctorName} · {prx.date}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Diagnostic Labs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  Diagnostic Lab Orders
                </h4>
                {currentPatientLabs.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                    No laboratory tests ordered yet.
                  </div>
                ) : (
                  currentPatientLabs.map((lab) => (
                    <div key={lab.id} className="p-3 bg-slate-50 rounded-xl border space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{lab.testName}</span>
                        <span className="px-2 py-0.2 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
                          {lab.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sample: {lab.sampleType} · {lab.requestedDate}
                      </div>
                      <button
                        onClick={() => setActiveDocumentPrint({ type: 'lab', data: lab })}
                        className="text-[11px] text-blue-600 font-semibold hover:underline"
                      >
                        Preview Official Lab Certificate
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Billing Invoices & Receipts
                </h4>
              </div>

              {currentPatientInvoices.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                  No invoices generated.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPatientInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{inv.invoiceNo}</span>
                        <div className="text-[11px] text-slate-500">Issued: {inv.date} · {inv.insuranceProvider}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-slate-900">{formatCurrency(inv.patientPayableRWF)}</div>
                        <button
                          onClick={() => setActiveDocumentPrint({ type: 'invoice', data: inv })}
                          className="text-[11px] text-blue-600 font-semibold hover:underline"
                        >
                          Print Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Select a patient to inspect complete medical record.
          </div>
        )}
      </div>

      {/* Patient Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Patient Registration</h3>
                <p className="text-xs text-blue-100">Automatic Hospital ID & National Health Registry compliant</p>
              </div>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  if (onCloseRegister) onCloseRegister();
                }}
                className="p-1 rounded text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Mugabo Alain"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    National ID (16 digits) or Passport *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="1199580029384726"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-rose-700"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number (MTN / Airtel)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Physical Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Kigali, Gasabo, Kimironko, KG 178 St"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Insurance Scheme</label>
                  <select
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value as any })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-medium text-slate-900"
                  >
                    <option value="Mutuelle de Santé">Mutuelle de Santé (90% MoH co-pay)</option>
                    <option value="RSSB / RAMA">RSSB / RAMA (85% coverage)</option>
                    <option value="MMI (Military Medical Insurance)">MMI (Military Medical Insurance)</option>
                    <option value="Britam Health">Britam Health Private</option>
                    <option value="Radiant Insurance">Radiant Insurance</option>
                    <option value="Private / Cash">Private / Self-Pay</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Policy / Affiliate Number</label>
                  <input
                    type="text"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Full name & relationship"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-rose-700 block mb-1">Known Drug Allergies (Comma separated)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm border-rose-200 bg-rose-50/30"
                  placeholder="e.g. Penicillin, Sulfa drugs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition"
              >
                Complete Patient Admission & Generate Hospital ID
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inpatient Bed Admission Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Admit Patient to Inpatient Ward</h3>
                <p className="text-xs text-slate-500">{activePatient?.fullName}</p>
              </div>
              <button onClick={() => setShowAdmitModal(false)} className="p-1 rounded text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Inpatient Ward</label>
                <select
                  value={selectedWardId}
                  onChange={(e) => {
                    setSelectedWardId(e.target.value);
                    setSelectedBedNumber('');
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.beds.filter((b) => b.status === 'Available').length} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Available Bed</label>
                <select
                  value={selectedBedNumber}
                  onChange={(e) => setSelectedBedNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono font-bold text-blue-900"
                >
                  <option value="">-- Choose Bed --</option>
                  {availableBedsInSelectedWard.map((b) => (
                    <option key={b.id} value={b.bedNumber}>
                      Bed {b.bedNumber} (Ready)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Attending Physician</label>
                <select
                  value={attendingDoctor}
                  onChange={(e) => setAttendingDoctor(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {staffList
                    .filter((s) => s.role === 'Doctor')
                    .map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAdmitModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdmission}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
