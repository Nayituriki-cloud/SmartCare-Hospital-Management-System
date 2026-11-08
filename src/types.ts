export type UserRole =
  | 'Super Administrator'
  | 'Hospital Director'
  | 'Hospital Administrator'
  | 'Doctor'
  | 'Nurse'
  | 'Pharmacist'
  | 'Laboratory Technician'
  | 'Radiologist'
  | 'Accountant'
  | 'Receptionist'
  | 'Patient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  department?: string;
  licenseNumber?: string;
  onDuty?: boolean;
}

export type InsuranceProvider =
  | 'Mutuelle de Santé'
  | 'RSSB / RAMA'
  | 'MMI (Military Medical Insurance)'
  | 'Britam Health'
  | 'Radiant Insurance'
  | 'UAP Old Mutual'
  | 'Private / Cash';

export type AdmissionStatus = 'Outpatient' | 'Admitted' | 'Discharged' | 'Transferred';

export interface Patient {
  id: string;
  hospitalId: string; // e.g. SC-KGL-0482
  nationalId: string; // 16 digit Rwandan NID or Passport
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email?: string;
  address: string; // e.g. Kigali, Gasabo, Kimironko
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceProvider: InsuranceProvider;
  insurancePolicyNumber: string;
  allergies: string[];
  chronicConditions: string[];
  admissionStatus: AdmissionStatus;
  assignedWard?: string;
  assignedBed?: string;
  attendingDoctorId?: string;
  attendingDoctorName?: string;
  registeredDate: string;
}

export interface VitalSignRecord {
  id: string;
  patientId: string;
  timestamp: string;
  recordedBy: string;
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number; // bpm
  temperature: number; // °C
  spo2: number; // %
  respiratoryRate: number; // breaths/min
  bloodGlucose?: number; // mg/dL
  painScore: number; // 0-10
  notes?: string;
}

export interface MedicationAdminRecord {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  route: 'Oral' | 'IV' | 'IM' | 'Subcutaneous' | 'Topical' | 'Inhalation';
  scheduledTime: string;
  administeredTime?: string;
  administeredBy?: string;
  status: 'Scheduled' | 'Given' | 'Refused' | 'Held' | 'Discontinued';
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'In-person Consultation' | 'Teleconsultation' | 'Emergency Review' | 'Follow-up';
  status: 'Scheduled' | 'Checked-In' | 'In-Consultation' | 'Completed' | 'Cancelled' | 'No-Show';
  reason: string;
  notes?: string;
}

export interface ClinicalConsultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
  };
  physicalExamination: string;
  diagnosis: string;
  icdCode: string;
  soapNotes?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    disclaimer?: string;
  };
  aiAssisted?: boolean;
  followUpDate?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Antibiotics' | 'Analgesics' | 'Antimalarials' | 'Cardiovascular' | 'IV Fluids' | 'Consumables' | 'Vaccines';
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Vial/Ampoule' | 'Infusion Bag' | 'Ointment';
  strength: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minStockLevel: number;
  unitPriceRWF: number;
  supplier: string;
  rackLocation: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  dispensed: boolean;
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed' | 'Cancelled';
  items: PrescriptionItem[];
  dispensedBy?: string;
  dispensedDate?: string;
  totalCostRWF: number;
}

export interface LabTestParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface LabTestOrder {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testCategory: 'Hematology' | 'Parasitology' | 'Biochemistry' | 'Microbiology' | 'Serology' | 'Urinalysis';
  testName: string;
  sampleType: 'Whole Blood' | 'Serum' | 'Urine' | 'Stool' | 'Sputum' | 'Swab';
  urgency: 'Routine' | 'Urgent' | 'STAT (Immediate)';
  status: 'Requested' | 'Sample Collected' | 'In Analysis' | 'Completed' | 'Verified';
  requestedDate: string;
  completedDate?: string;
  technicianId?: string;
  technicianName?: string;
  verifiedBy?: string;
  results: LabTestParameter[];
  clinicalNotes?: string;
}

export interface RadiologyOrder {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  modality: 'X-Ray' | 'Ultrasound' | 'CT Scan' | 'MRI' | 'Mammography';
  bodyPart: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Requested' | 'Scheduled' | 'Completed' | 'Reported';
  requestedDate: string;
  radiologistName?: string;
  reportText?: string;
  impression?: string;
  imageThumbnailUrl?: string;
}

export interface Bed {
  id: string;
  bedNumber: string;
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  patientId?: string;
  patientName?: string;
  admissionDate?: string;
}

export interface Ward {
  id: string;
  name: string;
  department: string;
  floor: string;
  nurseInCharge: string;
  totalBeds: number;
  beds: Bed[];
}

export interface InvoiceItem {
  description: string;
  category: 'Consultation' | 'Pharmacy' | 'Laboratory' | 'Radiology' | 'Bed & Ward' | 'Nursing / Procedure';
  quantity: number;
  unitPriceRWF: number;
  totalRWF: number;
  insuranceCoveredPercentage: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  dueDate: string;
  insuranceProvider: InsuranceProvider;
  items: InvoiceItem[];
  subtotalRWF: number;
  insuranceCoveredRWF: number;
  patientPayableRWF: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Insurance Claim Pending';
  paymentMethod?: 'MTN Mobile Money' | 'Airtel Money' | 'Visa/Mastercard' | 'Bank Transfer' | 'Cash';
  transactionReference?: string;
  paidAt?: string;
}

export interface EmergencyCase {
  id: string;
  code: 'Red (Resuscitation)' | 'Orange (Emergent)' | 'Yellow (Urgent)' | 'Green (Standard)';
  patientName: string;
  age: number;
  gender: 'Male' | 'Female';
  arrivalMode: 'Ambulance 912' | 'Walk-In' | 'Private Transfer';
  arrivalTime: string;
  chiefComplaint: string;
  triageVitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
  };
  triageNurse: string;
  attendingPhysician?: string;
  status: 'Triage Waiting' | 'Resuscitation Room' | 'Bedside Care' | 'Transferred to ICU' | 'Admitted to Ward' | 'Discharged';
}

export interface BloodUnit {
  group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  unitsAvailable: number;
  unitsReserved: number;
  nearExpiry: number;
}

export interface SurgerySchedule {
  id: string;
  theatreRoom: 'OT 1 (Laparoscopy & Minimally Invasive)' | 'OT 2 (Orthopedics & Trauma)' | 'OT 3 (General Surgery)' | 'OT 4 (Obstetrics & C-Section)';
  procedureName: string;
  patientName: string;
  patientId: string;
  leadSurgeon: string;
  anesthesiologist: string;
  scheduledTime: string;
  estimatedDurationMins: number;
  status: 'Scheduled' | 'Patient Prepped' | 'In Theatre' | 'Recovery (PACU)' | 'Completed';
}

export type SupportedLanguage = 'en' | 'fr' | 'rw';
