import React, { useState } from 'react';
import {
  HospitalProvider,
  useHospital,
} from './context/HospitalContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Bed,
  Pill,
  FlaskConical,
  Radio,
  Receipt,
  AlertOctagon,
  Scissors,
  Smartphone,
  Globe2,
  DollarSign,
  UserCheck,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { PatientManagementView } from './components/patients/PatientManagementView';
import { DoctorClinicalView } from './components/doctors/DoctorClinicalView';
import { NursingWardView } from './components/nursing/NursingWardView';
import { PharmacyInventoryView } from './components/pharmacy/PharmacyInventoryView';
import { LaboratoryView } from './components/laboratory/LaboratoryView';
import { RadiologyView } from './components/radiology/RadiologyView';
import { BillingFinanceView } from './components/billing/BillingFinanceView';
import { EmergencyTriageView } from './components/emergency/EmergencyTriageView';
import { BloodBankAndSurgeriesView } from './components/surgeries/BloodBankAndSurgeriesView';
import { PatientPortalView } from './components/portal/PatientPortalView';
import { MedicalDocumentPrintModal } from './components/modals/MedicalDocumentPrintModal';
import { UserRole, SupportedLanguage } from './types';

function HospitalApp() {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
    currentUser,
    switchRole,
    staffList,
    searchQuery,
    setSearchQuery,
  } = useHospital();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNewPatientModal, setOpenNewPatientModal] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'patients', label: t('patients'), icon: Users },
    { id: 'clinicalDoctors', label: t('clinicalDoctors'), icon: Stethoscope },
    { id: 'nursingWard', label: t('nursingWard'), icon: Bed },
    { id: 'pharmacy', label: t('pharmacy'), icon: Pill },
    { id: 'laboratory', label: t('laboratory'), icon: FlaskConical },
    { id: 'radiology', label: t('radiology'), icon: Radio },
    { id: 'billing', label: t('billing'), icon: Receipt },
    { id: 'emergency', label: t('emergency'), icon: AlertOctagon },
    { id: 'surgeriesBlood', label: t('surgeriesBlood'), icon: Scissors },
    { id: 'patientPortal', label: t('patientPortal'), icon: Smartphone },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    // If patient selected, navigate to patient portal
    if (role === 'Patient') {
      setActiveTab('patientPortal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                SC
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-blue-950 uppercase">
                    SMARTCARE
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Rwanda & Global
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                  HOSPITAL MANAGEMENT SYSTEM
                </p>
              </div>
            </div>
          </div>

          {/* Center search (desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, hospital ID, medical test, or invoice..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Right Header Utilities: Language, Currency, Role Switcher, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector (RWF / USD) */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => setCurrency('RWF')}
                className={`px-2 py-1 rounded-lg transition ${
                  currency === 'RWF'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                RWF
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-lg transition ${
                  currency === 'USD'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                USD
              </button>
            </div>

            {/* Language Switcher (EN / FR / RW) */}
            <div className="flex items-center border border-slate-200 rounded-xl px-2 py-1 bg-slate-50 text-xs font-semibold text-slate-700 gap-1">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="rw">RW</option>
              </select>
            </div>

            {/* User Role Quick Switcher */}
            <div className="relative">
              <select
                value={currentUser.role}
                onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
                className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer max-w-[130px] sm:max-w-none truncate"
                title="Simulate user role access"
              >
                <option value="Super Administrator">Role: Super Admin</option>
                <option value="Hospital Director">Role: Director</option>
                <option value="Doctor">Role: Doctor (David Mugisha)</option>
                <option value="Nurse">Role: Nurse (Claire Mukamana)</option>
                <option value="Pharmacist">Role: Pharmacist (Patrick Kwizera)</option>
                <option value="Laboratory Technician">Role: Lab Tech (Aline Umutoni)</option>
                <option value="Radiologist">Role: Radiologist (Eric Ndayisaba)</option>
                <option value="Accountant">Role: Accountant (Sandrine Kayitesi)</option>
                <option value="Receptionist">Role: Receptionist (Moses Nsengi)</option>
                <option value="Patient">Role: Patient (Keza Grace)</option>
              </select>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-4">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hospital Departments
              </div>

              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Project Details & MoH Compliance Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-4 text-white shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-teal-300 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>SmartCare Hospital System</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Project Owner: <span className="text-white font-semibold">Nayituriki Emmanuel</span>
              </p>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                SMART HEALTHCARE • BETTER MANAGEMENT • SAFER PATIENTS
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="bg-white w-72 h-full p-4 space-y-4 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                      SC
                    </div>
                    <span className="font-bold text-sm text-slate-900">SMARTCARE HMS</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                Owner: Emmanuel Nayituriki · Kigali, Rwanda
              </div>
            </div>
          </div>
        )}

        {/* Main Dynamic View Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNewPatientModal={() => {
                setActiveTab('patients');
                setOpenNewPatientModal(true);
              }}
            />
          )}

          {activeTab === 'patients' && (
            <PatientManagementView
              isRegisterOpen={openNewPatientModal}
              onCloseRegister={() => setOpenNewPatientModal(false)}
            />
          )}

          {activeTab === 'clinicalDoctors' && <DoctorClinicalView />}

          {activeTab === 'nursingWard' && <NursingWardView />}

          {activeTab === 'pharmacy' && <PharmacyInventoryView />}

          {activeTab === 'laboratory' && <LaboratoryView />}

          {activeTab === 'radiology' && <RadiologyView />}

          {activeTab === 'billing' && <BillingFinanceView />}

          {activeTab === 'emergency' && <EmergencyTriageView />}

          {activeTab === 'surgeriesBlood' && <BloodBankAndSurgeriesView />}

          {activeTab === 'patientPortal' && <PatientPortalView />}
        </main>
      </div>

      {/* Official Document Print & Download Modal */}
      <MedicalDocumentPrintModal />
    </div>
  );
}

export default function App() {
  return (
    <HospitalProvider>
      <HospitalApp />
    </HospitalProvider>
  );
}
