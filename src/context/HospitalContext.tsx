import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Patient,
  Appointment,
  ClinicalConsultation,
  VitalSignRecord,
  MedicationAdminRecord,
  InventoryItem,
  Prescription,
  LabTestOrder,
  RadiologyOrder,
  Ward,
  Invoice,
  EmergencyCase,
  BloodUnit,
  SurgerySchedule,
  SupportedLanguage,
  UserRole
} from '../types';
import {
  initialStaff,
  initialPatients,
  initialAppointments,
  initialConsultations,
  initialVitals,
  initialMAR,
  initialInventory,
  initialPrescriptions,
  initialLabOrders,
  initialRadiology,
  initialWards,
  initialInvoices,
  initialEmergencies,
  initialBloodBank,
  initialSurgeries
} from '../data/mockData';
import { translations } from '../i18n/translations';

interface HospitalContextType {
  // Localization & Currency
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  currency: 'RWF' | 'USD';
  setCurrency: (c: 'RWF' | 'USD') => void;
  formatCurrency: (rwfAmount: number) => string;

  // Active User / Role
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  staffList: UserProfile[];
  switchRole: (role: UserRole) => void;

  // Data Collections
  patients: Patient[];
  appointments: Appointment[];
  consultations: ClinicalConsultation[];
  vitals: VitalSignRecord[];
  marRecords: MedicationAdminRecord[];
  inventory: InventoryItem[];
  prescriptions: Prescription[];
  labOrders: LabTestOrder[];
  radiologyOrders: RadiologyOrder[];
  wards: Ward[];
  invoices: Invoice[];
  emergencies: EmergencyCase[];
  bloodBank: BloodUnit[];
  surgeries: SurgerySchedule[];

  // Mutations
  addPatient: (patient: Omit<Patient, 'id' | 'hospitalId' | 'registeredDate'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  admitPatient: (patientId: string, wardId: string, bedNumber: string, doctorId: string, doctorName: string) => void;
  dischargePatient: (patientId: string) => void;

  bookAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  addConsultation: (consultation: Omit<ClinicalConsultation, 'id'>) => ClinicalConsultation;

  recordVitals: (record: Omit<VitalSignRecord, 'id' | 'timestamp'>) => void;
  updateMedicationAdmin: (marId: string, status: MedicationAdminRecord['status'], notes?: string) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryStock: (id: string, newStock: number) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescriptionNo'>) => Prescription;
  dispensePrescriptionItem: (prescriptionId: string, medicineId: string) => void;

  orderLabTest: (order: Omit<LabTestOrder, 'id' | 'orderNo' | 'requestedDate'>) => LabTestOrder;
  updateLabResults: (orderId: string, results: LabTestOrder['results'], notes?: string) => void;
  verifyLabTest: (orderId: string, verifiedBy: string) => void;

  orderRadiology: (order: Omit<RadiologyOrder, 'id' | 'orderNo' | 'requestedDate'>) => RadiologyOrder;
  updateRadiologyReport: (orderId: string, reportText: string, impression: string, radiologistName: string) => void;

  updateBedStatus: (wardId: string, bedId: string, status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance') => void;

  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNo' | 'date'>) => Invoice;
  payInvoice: (invoiceId: string, method: Invoice['paymentMethod'], reference?: string) => void;

  addEmergencyCase: (emg: Omit<EmergencyCase, 'id'>) => void;
  updateEmergencyStatus: (id: string, status: EmergencyCase['status']) => void;

  reserveBlood: (group: string, count: number) => void;
  scheduleSurgery: (surgery: Omit<SurgerySchedule, 'id'>) => void;

  // Print Modal
  activeDocumentPrint: {
    type: 'invoice' | 'prescription' | 'lab' | 'clinical' | 'dischargeCertificate';
    data: any;
  } | null;
  setActiveDocumentPrint: (doc: any) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [currency, setCurrency] = useState<'RWF' | 'USD'>('RWF');
  const [searchQuery, setSearchQuery] = useState('');

  // Staff and current user
  const [staffList] = useState<UserProfile[]>(initialStaff);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialStaff[0]); // Default Super Admin

  // Data collections with localStorage cache
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('smartcare_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('smartcare_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [consultations, setConsultations] = useState<ClinicalConsultation[]>(() => {
    const saved = localStorage.getItem('smartcare_consultations');
    return saved ? JSON.parse(saved) : initialConsultations;
  });

  const [vitals, setVitals] = useState<VitalSignRecord[]>(() => {
    const saved = localStorage.getItem('smartcare_vitals');
    return saved ? JSON.parse(saved) : initialVitals;
  });

  const [marRecords, setMarRecords] = useState<MedicationAdminRecord[]>(() => {
    const saved = localStorage.getItem('smartcare_mar');
    return saved ? JSON.parse(saved) : initialMAR;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('smartcare_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('smartcare_prescriptions');
    return saved ? JSON.parse(saved) : initialPrescriptions;
  });

  const [labOrders, setLabOrders] = useState<LabTestOrder[]>(() => {
    const saved = localStorage.getItem('smartcare_lab_orders');
    return saved ? JSON.parse(saved) : initialLabOrders;
  });

  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>(() => {
    const saved = localStorage.getItem('smartcare_radiology');
    return saved ? JSON.parse(saved) : initialRadiology;
  });

  const [wards, setWards] = useState<Ward[]>(() => {
    const saved = localStorage.getItem('smartcare_wards');
    return saved ? JSON.parse(saved) : initialWards;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('smartcare_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [emergencies, setEmergencies] = useState<EmergencyCase[]>(() => {
    const saved = localStorage.getItem('smartcare_emergencies');
    return saved ? JSON.parse(saved) : initialEmergencies;
  });

  const [bloodBank, setBloodBank] = useState<BloodUnit[]>(() => {
    const saved = localStorage.getItem('smartcare_blood_bank');
    return saved ? JSON.parse(saved) : initialBloodBank;
  });

  const [surgeries, setSurgeries] = useState<SurgerySchedule[]>(() => {
    const saved = localStorage.getItem('smartcare_surgeries');
    return saved ? JSON.parse(saved) : initialSurgeries;
  });

  const [activeDocumentPrint, setActiveDocumentPrint] = useState<HospitalContextType['activeDocumentPrint']>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('smartcare_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('smartcare_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('smartcare_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('smartcare_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('smartcare_lab_orders', JSON.stringify(labOrders));
  }, [labOrders]);

  useEffect(() => {
    localStorage.setItem('smartcare_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('smartcare_wards', JSON.stringify(wards));
  }, [wards]);

  // Translation helper
  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Currency helper
  const formatCurrency = (rwfAmount: number): string => {
    if (currency === 'USD') {
      const usd = rwfAmount / 1380;
      return `$${usd.toFixed(2)}`;
    }
    return `${rwfAmount.toLocaleString()} RWF`;
  };

  // Role Switcher
  const switchRole = (role: UserRole) => {
    const matched = staffList.find((s) => s.role === role);
    if (matched) {
      setCurrentUser(matched);
    }
  };

  // Mutations
  const addPatient = (patientData: Omit<Patient, 'id' | 'hospitalId' | 'registeredDate'>): Patient => {
    const randomId = Math.floor(100 + Math.random() * 900);
    const newPatient: Patient = {
      ...patientData,
      id: `PAT-0${patients.length + 1}`,
      hospitalId: `SC-KGL-0${randomId}`,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const admitPatient = (patientId: string, wardId: string, bedNumber: string, doctorId: string, doctorName: string) => {
    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) return;

    // Update patient
    updatePatient(patientId, {
      admissionStatus: 'Admitted',
      assignedWard: wards.find((w) => w.id === wardId)?.name || 'Inpatient Ward',
      assignedBed: bedNumber,
      attendingDoctorId: doctorId,
      attendingDoctorName: doctorName,
    });

    // Update ward bed
    setWards((prev) =>
      prev.map((w) => {
        if (w.id === wardId) {
          return {
            ...w,
            beds: w.beds.map((b) =>
              b.bedNumber === bedNumber
                ? {
                    ...b,
                    status: 'Occupied',
                    patientId,
                    patientName: targetPatient.fullName,
                    admissionDate: new Date().toISOString().split('T')[0],
                  }
                : b
            ),
          };
        }
        return w;
      })
    );
  };

  const dischargePatient = (patientId: string) => {
    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) return;

    // Release ward bed
    setWards((prev) =>
      prev.map((w) => ({
        ...w,
        beds: w.beds.map((b) =>
          b.patientId === patientId ? { ...b, status: 'Cleaning', patientId: undefined, patientName: undefined } : b
        ),
      }))
    );

    // Update patient status
    updatePatient(patientId, {
      admissionStatus: 'Discharged',
      assignedWard: undefined,
      assignedBed: undefined,
    });
  };

  const bookAppointment = (aptData: Omit<Appointment, 'id'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
    };
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const addConsultation = (conData: Omit<ClinicalConsultation, 'id'>): ClinicalConsultation => {
    const newCon: ClinicalConsultation = {
      ...conData,
      id: `CON-${Math.floor(100 + Math.random() * 900)}`,
    };
    setConsultations((prev) => [newCon, ...prev]);
    return newCon;
  };

  const recordVitals = (recordData: Omit<VitalSignRecord, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newRecord: VitalSignRecord = {
      ...recordData,
      id: `VIT-${Math.floor(100 + Math.random() * 900)}`,
      timestamp,
    };
    setVitals((prev) => [newRecord, ...prev]);
  };

  const updateMedicationAdmin = (marId: string, status: MedicationAdminRecord['status'], notes?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMarRecords((prev) =>
      prev.map((m) =>
        m.id === marId
          ? {
              ...m,
              status,
              administeredTime: status === 'Given' ? timeStr : m.administeredTime,
              administeredBy: status === 'Given' ? currentUser.name : m.administeredBy,
              notes: notes || m.notes,
            }
          : m
      )
    );
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `INV-MED-${Math.floor(10 + Math.random() * 90)}`,
    };
    setInventory((prev) => [...prev, newItem]);
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, currentStock: Math.max(0, newStock) } : i)));
  };

  const addPrescription = (prxData: Omit<Prescription, 'id' | 'prescriptionNo'>): Prescription => {
    const newPrx: Prescription = {
      ...prxData,
      id: `PRX-${Math.floor(100 + Math.random() * 900)}`,
      prescriptionNo: `RX-2026-${Math.floor(100 + Math.random() * 900)}`,
    };
    setPrescriptions((prev) => [newPrx, ...prev]);
    return newPrx;
  };

  const dispensePrescriptionItem = (prescriptionId: string, medicineId: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id === prescriptionId) {
          const updatedItems = p.items.map((item) => {
            if (item.medicineId === medicineId) {
              // Deduct from stock
              updateInventoryStock(
                medicineId,
                (inventory.find((i) => i.id === medicineId)?.currentStock || item.quantity) - item.quantity
              );
              return { ...item, dispensed: true };
            }
            return item;
          });
          const allDispensed = updatedItems.every((i) => i.dispensed);
          return {
            ...p,
            items: updatedItems,
            status: allDispensed ? 'Dispensed' : 'Partially Dispensed',
            dispensedBy: currentUser.name,
            dispensedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return p;
      })
    );
  };

  const orderLabTest = (orderData: Omit<LabTestOrder, 'id' | 'orderNo' | 'requestedDate'>): LabTestOrder => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newOrder: LabTestOrder = {
      ...orderData,
      id: `LAB-${Math.floor(100 + Math.random() * 900)}`,
      orderNo: `LAB-2026-${Math.floor(3000 + Math.random() * 1000)}`,
      requestedDate: now,
    };
    setLabOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateLabResults = (orderId: string, results: LabTestOrder['results'], notes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLabOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              results,
              clinicalNotes: notes || o.clinicalNotes,
              status: 'Completed',
              completedDate: now,
              technicianId: currentUser.id,
              technicianName: currentUser.name,
            }
          : o
      )
    );
  };

  const verifyLabTest = (orderId: string, verifiedBy: string) => {
    setLabOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Verified', verifiedBy } : o))
    );
  };

  const orderRadiology = (orderData: Omit<RadiologyOrder, 'id' | 'orderNo' | 'requestedDate'>): RadiologyOrder => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newRad: RadiologyOrder = {
      ...orderData,
      id: `RAD-${Math.floor(100 + Math.random() * 900)}`,
      orderNo: `RAD-2026-${Math.floor(100 + Math.random() * 900)}`,
      requestedDate: now,
    };
    setRadiologyOrders((prev) => [newRad, ...prev]);
    return newRad;
  };

  const updateRadiologyReport = (orderId: string, reportText: string, impression: string, radiologistName: string) => {
    setRadiologyOrders((prev) =>
      prev.map((r) =>
        r.id === orderId
          ? {
              ...r,
              reportText,
              impression,
              radiologistName,
              status: 'Reported',
            }
          : r
      )
    );
  };

  const updateBedStatus = (wardId: string, bedId: string, status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance') => {
    setWards((prev) =>
      prev.map((w) => {
        if (w.id === wardId) {
          return {
            ...w,
            beds: w.beds.map((b) =>
              b.id === bedId
                ? {
                    ...b,
                    status,
                    patientId: status === 'Available' || status === 'Cleaning' ? undefined : b.patientId,
                    patientName: status === 'Available' || status === 'Cleaning' ? undefined : b.patientName,
                  }
                : b
            ),
          };
        }
        return w;
      })
    );
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNo' | 'date'>): Invoice => {
    const today = new Date().toISOString().split('T')[0];
    const newInvoice: Invoice = {
      ...invData,
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      invoiceNo: `INV-2026-0${Math.floor(300 + Math.random() * 700)}`,
      date: today,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const payInvoice = (invoiceId: string, method: Invoice['paymentMethod'], reference?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const txRef = reference || `MTN-RW-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'Paid',
              paymentMethod: method,
              transactionReference: txRef,
              paidAt: now,
            }
          : inv
      )
    );
  };

  const addEmergencyCase = (emgData: Omit<EmergencyCase, 'id'>) => {
    const newCase: EmergencyCase = {
      ...emgData,
      id: `EMG-${Math.floor(900 + Math.random() * 99)}`,
    };
    setEmergencies((prev) => [newCase, ...prev]);
  };

  const updateEmergencyStatus = (id: string, status: EmergencyCase['status']) => {
    setEmergencies((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const reserveBlood = (group: string, count: number) => {
    setBloodBank((prev) =>
      prev.map((b) =>
        b.group === group
          ? {
              ...b,
              unitsAvailable: Math.max(0, b.unitsAvailable - count),
              unitsReserved: b.unitsReserved + count,
            }
          : b
      )
    );
  };

  const scheduleSurgery = (surgeryData: Omit<SurgerySchedule, 'id'>) => {
    const newSurg: SurgerySchedule = {
      ...surgeryData,
      id: `SURG-0${surgeries.length + 1}`,
    };
    setSurgeries((prev) => [...prev, newSurg]);
  };

  return (
    <HospitalContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currency,
        setCurrency,
        formatCurrency,
        currentUser,
        setCurrentUser,
        staffList,
        switchRole,
        patients,
        appointments,
        consultations,
        vitals,
        marRecords,
        inventory,
        prescriptions,
        labOrders,
        radiologyOrders,
        wards,
        invoices,
        emergencies,
        bloodBank,
        surgeries,
        addPatient,
        updatePatient,
        admitPatient,
        dischargePatient,
        bookAppointment,
        updateAppointmentStatus,
        addConsultation,
        recordVitals,
        updateMedicationAdmin,
        addInventoryItem,
        updateInventoryStock,
        addPrescription,
        dispensePrescriptionItem,
        orderLabTest,
        updateLabResults,
        verifyLabTest,
        orderRadiology,
        updateRadiologyReport,
        updateBedStatus,
        createInvoice,
        payInvoice,
        addEmergencyCase,
        updateEmergencyStatus,
        reserveBlood,
        scheduleSurgery,
        activeDocumentPrint,
        setActiveDocumentPrint,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
