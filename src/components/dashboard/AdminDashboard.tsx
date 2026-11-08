import React, { useState } from 'react';
import {
  Users,
  Bed,
  Calendar,
  AlertOctagon,
  FlaskConical,
  Package,
  DollarSign,
  TrendingUp,
  UserPlus,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  ArrowUpRight,
  Stethoscope,
  HeartPulse,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AiClinicalAssistantModal } from '../ai/AiClinicalAssistantModal';
import { AiTriageHelperModal } from '../ai/AiTriageHelperModal';
import { AiStockPredictorModal } from '../ai/AiStockPredictorModal';
import { AiPatientMessengerModal } from '../ai/AiPatientMessengerModal';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenNewPatientModal: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigateTab, onOpenNewPatientModal }) => {
  const {
    t,
    patients,
    appointments,
    staffList,
    wards,
    inventory,
    labOrders,
    invoices,
    emergencies,
    formatCurrency,
    setActiveDocumentPrint,
  } = useHospital();

  // AI Modal States
  const [showAiClinical, setShowAiClinical] = useState(false);
  const [showAiTriage, setShowAiTriage] = useState(false);
  const [showAiStock, setShowAiStock] = useState(false);
  const [showAiMessenger, setShowAiMessenger] = useState(false);

  // Derived metrics
  const totalPatients = patients.length;
  const admittedPatients = patients.filter((p) => p.admissionStatus === 'Admitted').length;
  const doctorsOnDuty = staffList.filter((s) => s.role === 'Doctor' && s.onDuty).length;

  const totalBeds = wards.reduce((sum, w) => sum + w.totalBeds, 0);
  const occupiedBeds = wards.reduce(
    (sum, w) => sum + w.beds.filter((b) => b.status === 'Occupied').length,
    0
  );
  const availableBeds = wards.reduce(
    (sum, w) => sum + w.beds.filter((b) => b.status === 'Available').length,
    0
  );
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const todayAppointments = appointments.length;
  const activeEmergencies = emergencies.filter(
    (e) => e.status !== 'Discharged' && e.status !== 'Admitted to Ward'
  ).length;
  const pendingLabs = labOrders.filter((l) => l.status !== 'Verified').length;
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minStockLevel).length;

  const todayRevenueRWF = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.patientPayableRWF, 0);

  const unpaidInvoicesRWF = invoices
    .filter((inv) => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + inv.patientPayableRWF, 0);

  return (
    <div className="space-y-6">
      {/* Banner / Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-sky-900 to-teal-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Live Operations Monitoring · Kigali Main Complex
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SmartCare Hospital Command Center
            </h1>
            <p className="text-sm text-sky-100/90 leading-relaxed">
              Integrated real-time clinical workflows, inpatient bed tracking, pharmacy stock predictions, and intelligent decision support across Rwanda and regional partner facilities.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:self-center">
            <button
              onClick={onOpenNewPatientModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-semibold text-xs sm:text-sm hover:bg-blue-50 shadow-md transition transform active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-blue-700" />
              {t('newPatient')}
            </button>
            <button
              onClick={() => setShowAiClinical(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/20 border border-teal-300/40 text-teal-100 font-semibold text-xs sm:text-sm hover:bg-teal-500/30 backdrop-blur-xs transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Clinical Note
            </button>
          </div>
        </div>

        {/* Subtle decorative background circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Grid (As defined in prompt section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Registered Patients */}
        <div
          onClick={() => onNavigateTab('patients')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Patients
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPatients}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active hospital census</span>
          </div>
        </div>

        {/* Inpatients Admitted */}
        <div
          onClick={() => onNavigateTab('nursingWard')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inpatients Admitted
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{admittedPatients}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Occupancy rate: <span className="font-semibold text-slate-700">{occupancyRate}%</span>
          </div>
        </div>

        {/* Doctors & Staff On Duty */}
        <div
          onClick={() => onNavigateTab('clinicalDoctors')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Staff On Duty
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {doctorsOnDuty}{' '}
            <span className="text-xs font-normal text-slate-500">
              / {staffList.filter((s) => s.onDuty).length} total
            </span>
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            Coverage in all 4 shifts
          </div>
        </div>

        {/* Available Beds */}
        <div
          onClick={() => onNavigateTab('nursingWard')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Available Beds
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{availableBeds}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {wards.length} clinical wards
          </div>
        </div>

        {/* Today's Appointments */}
        <div
          onClick={() => onNavigateTab('clinicalDoctors')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Appointments
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{todayAppointments}</div>
          <div className="text-[11px] text-slate-500 mt-1">Consultation sessions scheduled</div>
        </div>

        {/* Emergency Cases */}
        <div
          onClick={() => onNavigateTab('emergency')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Emergency Cases
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">{activeEmergencies}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Priority 1 & 2 care underway</div>
        </div>

        {/* Pending Lab Tests */}
        <div
          onClick={() => onNavigateTab('laboratory')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Lab Tests
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900">{pendingLabs}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Awaiting verification</div>
        </div>

        {/* Pharmacy Low Stock Alerts */}
        <div
          onClick={() => onNavigateTab('pharmacy')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Low Stock Alerts
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{lowStockCount}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Below minimum threshold</div>
        </div>

        {/* Daily Revenue Collected */}
        <div
          onClick={() => onNavigateTab('billing')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Receipts
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
            {formatCurrency(todayRevenueRWF)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Via MTN MoMo, Card & Cash</div>
        </div>

        {/* Unpaid Invoices */}
        <div
          onClick={() => onNavigateTab('billing')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unpaid Invoices
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-800 font-mono">
            {formatCurrency(unpaidInvoicesRWF)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending claims & settlement</div>
        </div>
      </div>

      {/* AI Assistant Quick Toolbelt */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital AI Assistant Suite</h3>
              <p className="text-xs text-slate-500">
                Augmenting clinical productivity, triage urgency, stock resilience & multilingual communication
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
            Powered by Gemini 3.8
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setShowAiClinical(true)}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Clinical SOAP Drafter</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Synthesizes vitals & exam into structured doctor notes</p>
            </div>
          </button>

          <button
            onClick={() => setShowAiTriage(true)}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Emergency Triage AI</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Evaluates red flags, urgency category & rapid labs</p>
            </div>
          </button>

          <button
            onClick={() => setShowAiStock(true)}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Stockout Predictor</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Forecasts depletion by seasonal demand surge</p>
            </div>
          </button>

          <button
            onClick={() => setShowAiMessenger(true)}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Patient Communicator</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Drafts SMS in Kinyarwanda, Français & English</p>
            </div>
          </button>
        </div>
      </div>

      {/* Operations Split: Inpatient Wards Overview & Recent Clinical Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Occupancy & Visual Bed Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-600" />
                Hospital Ward & Bed Occupancy
              </h3>
              <p className="text-xs text-slate-500">Live bed distribution across specialized departments</p>
            </div>
            <button
              onClick={() => onNavigateTab('nursingWard')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              Full Bed Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wards.map((ward) => {
              const occ = ward.beds.filter((b) => b.status === 'Occupied').length;
              const cln = ward.beds.filter((b) => b.status === 'Cleaning').length;
              const ava = ward.beds.filter((b) => b.status === 'Available').length;
              const percent = Math.round((occ / ward.totalBeds) * 100);

              return (
                <div key={ward.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{ward.name}</h4>
                      <p className="text-[11px] text-slate-500">{ward.floor} · {ward.nurseInCharge}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border">
                      {occ} / {ward.totalBeds} Beds
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-blue-600 h-full" style={{ width: `${percent}%` }} />
                    <div
                      className="bg-amber-400 h-full"
                      style={{ width: `${(cln / ward.totalBeds) * 100}%` }}
                    />
                  </div>

                  {/* Mini bed indicator boxes */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ward.beds.map((bed) => (
                      <span
                        key={bed.id}
                        title={`${bed.bedNumber} - ${bed.status} ${bed.patientName ? `(${bed.patientName})` : ''}`}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold cursor-pointer ${
                          bed.status === 'Occupied'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : bed.status === 'Cleaning'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : bed.status === 'Maintenance'
                            ? 'bg-slate-200 text-slate-600 border border-slate-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {bed.bedNumber}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="text-emerald-700 font-medium">● {ava} Available</span>
                    <span className="text-blue-700 font-medium">● {occ} Occupied</span>
                    <span className="text-amber-700 font-medium">● {cln} Cleaning</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Triage & Real-Time Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              Active Emergency Queue
            </h3>
            <button
              onClick={() => onNavigateTab('emergency')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
            >
              View Board <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {emergencies.map((emg) => (
              <div
                key={emg.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                      emg.code.includes('Red')
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {emg.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{emg.arrivalTime.split(' ')[1]}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{emg.patientName}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{emg.chiefComplaint}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Vitals: BP {emg.triageVitals.bp} · SpO2 {emg.triageVitals.spo2}%</span>
                  <span className="font-semibold text-slate-800">{emg.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rwanda MoH Compliance Badge */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
            <span className="font-bold block mb-0.5">Rwanda Data Protection & Privacy Certified</span>
            Strict role-based access control (RBAC) compliant with National Cyber Security Authority (NCSA) & Ministry of Health regulations.
          </div>
        </div>
      </div>

      {/* Recent Registered Patients Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Registered Patients Registry</h3>
            <p className="text-xs text-slate-500">Patients undergoing treatment and outpatient review</p>
          </div>
          <button
            onClick={() => onNavigateTab('patients')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            View All Patients <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hospital ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Gender & Age</th>
                <th className="py-3 px-4">Insurance Scheme</th>
                <th className="py-3 px-4">Admission Status</th>
                <th className="py-3 px-4">Assigned Ward / Bed</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.slice(0, 5).map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                    {patient.hospitalId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {patient.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {patient.gender}, {patient.dob}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border text-[11px]">
                      {patient.insuranceProvider}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        patient.admissionStatus === 'Admitted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {patient.admissionStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {patient.assignedWard ? `${patient.assignedWard} (${patient.assignedBed})` : 'Outpatient / Clinic'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('patients')}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      View Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Modals */}
      <AiClinicalAssistantModal isOpen={showAiClinical} onClose={() => setShowAiClinical(false)} />
      <AiTriageHelperModal isOpen={showAiTriage} onClose={() => setShowAiTriage(false)} />
      <AiStockPredictorModal isOpen={showAiStock} onClose={() => setShowAiStock(false)} />
      <AiPatientMessengerModal isOpen={showAiMessenger} onClose={() => setShowAiMessenger(false)} />
    </div>
  );
};
