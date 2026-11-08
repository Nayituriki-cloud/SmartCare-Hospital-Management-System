import React, { useState } from 'react';
import {
  Smartphone,
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  PhoneCall,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Star,
  Plus
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const PatientPortalView: React.FC = () => {
  const {
    patients,
    appointments,
    bookAppointment,
    prescriptions,
    labOrders,
    invoices,
    payInvoice,
    staffList,
    formatCurrency,
    setActiveDocumentPrint,
  } = useHospital();

  const [activePatientId, setActivePatientId] = useState<string>(patients[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'labs' | 'bills' | 'feedback'>('appointments');
  const [showBookAptModal, setShowBookAptModal] = useState(false);
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);

  // New Appointment Form
  const [selectedDoctorId, setSelectedDoctorId] = useState('USR-003');
  const [aptDate, setAptDate] = useState('2026-11-12');
  const [aptTime, setAptTime] = useState('10:00');
  const [aptReason, setAptReason] = useState('Routine review and follow-up consultation');
  const [aptType, setAptType] = useState<any>('In-person Consultation');

  // Feedback form
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('The nursing staff and medical attention at SmartCare were swift and compassionate.');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Bill payment state
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [momoPhone, setMomoPhone] = useState('+250 788 901 234');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const myAppointments = appointments.filter((a) => a.patientId === activePatient?.id);
  const myPrescriptions = prescriptions.filter((p) => p.patientId === activePatient?.id);
  const myLabOrders = labOrders.filter((l) => l.patientId === activePatient?.id && l.status === 'Verified');
  const myInvoices = invoices.filter((i) => i.patientId === activePatient?.id);

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = staffList.find((s) => s.id === selectedDoctorId) || staffList[2];
    bookAppointment({
      patientId: activePatient.id,
      patientName: activePatient.fullName,
      patientPhone: activePatient.phone,
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.department || 'Internal Medicine',
      date: aptDate,
      time: aptTime,
      type: aptType,
      status: 'Scheduled',
      reason: aptReason,
    });
    setShowBookAptModal(false);
    alert(`Appointment successfully confirmed with ${doc.name} for ${aptDate} at ${aptTime}. An SMS notification has been dispatched.`);
  };

  const handlePayMomo = (invoiceId: string) => {
    setPayingBillId(invoiceId);
    setTimeout(() => {
      payInvoice(invoiceId, 'MTN Mobile Money', `MTN-RW-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setPayingBillId(null);
      }, 2500);
    }, 1500);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            SmartCare Patient Mobile App & Self-Service Portal
          </h2>
          <p className="text-xs text-slate-500">
            Real-time patient self-service: Appointments, e-Prescriptions, Verified Diagnostics & MoMo Payments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Active Patient */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Logged in as:</span>
            <select
              value={activePatientId}
              onChange={(e) => setActivePatientId(e.target.value)}
              className="border rounded-xl px-3 py-1.5 bg-white font-bold text-blue-900"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.hospitalId})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsMobileFrameView(!isMobileFrameView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isMobileFrameView
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isMobileFrameView ? 'Standard View' : 'Phone Simulator Frame'}
          </button>
        </div>
      </div>

      {/* Main Container (Either Phone Mockup or Expanded Portal) */}
      <div className={isMobileFrameView ? 'flex justify-center py-4' : ''}>
        <div
          className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all ${
            isMobileFrameView ? 'max-w-sm w-full border-4 border-slate-800' : 'w-full'
          }`}
        >
          {/* Mobile Top Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-teal-700 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-sm">
                  {activePatient?.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{activePatient?.fullName}</h3>
                  <span className="text-[11px] text-blue-100 font-mono">{activePatient?.hospitalId}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block">Insurance</span>
                <span className="text-xs font-semibold">{activePatient?.insuranceProvider}</span>
              </div>
            </div>

            {/* Quick Balance or Next Appointment Banner */}
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-xs rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-blue-100 block">Upcoming Appointment</span>
                <span className="font-semibold text-white">
                  {myAppointments[0] ? `${myAppointments[0].date} at ${myAppointments[0].time}` : 'No scheduled visits'}
                </span>
              </div>
              <button
                onClick={() => setShowBookAptModal(true)}
                className="px-2.5 py-1 bg-white text-blue-900 rounded-lg text-[11px] font-bold shadow-xs hover:bg-blue-50 transition"
              >
                + Book Visit
              </button>
            </div>
          </div>

          {/* Navigation Pill Bar */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1 overflow-x-auto">
            {[
              { id: 'appointments', label: 'Visits', icon: Calendar },
              { id: 'prescriptions', label: 'e-Prescriptions', icon: Pill },
              { id: 'labs', label: 'Lab Results', icon: FlaskConical },
              { id: 'bills', label: 'Bills & MoMo', icon: Receipt },
              { id: 'feedback', label: 'Feedback', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
                    isSel
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Portal Body Content */}
          <div className="p-5 max-h-[600px] overflow-y-auto space-y-4">
            {/* 1. APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    My Scheduled Doctor Consultations
                  </h4>
                  <button
                    onClick={() => setShowBookAptModal(true)}
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Book Consultation
                  </button>
                </div>

                {myAppointments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                    No active appointments scheduled. Click "Book Consultation" to select your specialist.
                  </div>
                ) : (
                  myAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs hover:border-slate-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{apt.doctorName}</div>
                          <div className="text-[11px] text-blue-700 font-medium">{apt.department}</div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            apt.status === 'Completed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.time}
                        </span>
                        <span>{apt.type}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        Reason: {apt.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Active Digital Prescriptions & Medications
                </h4>

                {myPrescriptions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                    No active prescriptions currently on file.
                  </div>
                ) : (
                  myPrescriptions.map((prx) => (
                    <div
                      key={prx.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-sm text-slate-900 font-mono">
                            {prx.prescriptionNo}
                          </span>
                          <div className="text-[11px] text-slate-500">
                            Dr. {prx.doctorName} · Issued on {prx.date}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                          {prx.status}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        {prx.items.map((item, i) => (
                          <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <div className="flex justify-between font-bold text-slate-900">
                              <span>{item.medicineName}</span>
                              <span className="font-mono text-teal-700">Qty: {item.quantity}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {item.dosage} — {item.frequency} for {item.duration}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                              Instructions: {item.instructions}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveDocumentPrint({ type: 'prescription', data: prx })}
                        className="text-[11px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Download / Print Official Rx
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. LAB RESULTS TAB */}
            {activeTab === 'labs' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Verified Diagnostic Laboratory Results
                </h4>

                {myLabOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                    No verified laboratory results ready for portal release.
                  </div>
                ) : (
                  myLabOrders.map((lab) => (
                    <div key={lab.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{lab.testName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Ref: {lab.orderNo} · Verified on {lab.completedDate}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Certified
                        </span>
                      </div>

                      <div className="overflow-x-auto border rounded-xl bg-white">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-100 text-slate-600 border-b">
                            <tr>
                              <th className="p-2">Parameter</th>
                              <th className="p-2 text-center">Value</th>
                              <th className="p-2 text-center">Normal Range</th>
                              <th className="p-2 text-right">Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {lab.results.map((res, i) => (
                              <tr key={i}>
                                <td className="p-2 font-medium">{res.name}</td>
                                <td className="p-2 text-center font-bold font-mono">{res.value} {res.unit}</td>
                                <td className="p-2 text-center text-slate-400">{res.referenceRange}</td>
                                <td className="p-2 text-right">
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      res.status === 'Normal'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {res.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-500">Verified by: {lab.verifiedBy || 'Consultant'}</span>
                        <button
                          onClick={() => setActiveDocumentPrint({ type: 'lab', data: lab })}
                          className="text-[11px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> View Full Certificate
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. BILLS & MOMO TAB */}
            {activeTab === 'bills' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Hospital Invoices & MTN MoMo Settlement
                </h4>

                {paymentSuccess && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Mobile Money payment confirmed! Receipt updated.
                  </div>
                )}

                {myInvoices.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                    No hospital invoices found for this patient account.
                  </div>
                ) : (
                  myInvoices.map((inv) => {
                    const isPaid = inv.status === 'Paid';
                    return (
                      <div
                        key={inv.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-slate-900 font-mono">
                              {inv.invoiceNo}
                            </span>
                            <div className="text-[11px] text-slate-500">
                              Issued: {inv.date} · Insurance: {inv.insuranceProvider}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>Gross Medical Charges:</span>
                            <span className="font-mono">{formatCurrency(inv.subtotalRWF)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-medium text-[11px]">
                            <span>Insurance Subsidy Paid:</span>
                            <span className="font-mono">- {formatCurrency(inv.insuranceCoveredRWF)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t text-sm">
                            <span>Your Co-Pay Balance:</span>
                            <span className="font-mono text-blue-900">{formatCurrency(inv.patientPayableRWF)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setActiveDocumentPrint({ type: 'invoice', data: inv })}
                            className="text-[11px] text-slate-600 hover:text-blue-600 font-semibold inline-flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> Official Receipt
                          </button>

                          {!isPaid ? (
                            <button
                              onClick={() => handlePayMomo(inv.id)}
                              disabled={payingBillId === inv.id}
                              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition inline-flex items-center gap-1.5"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              {payingBillId === inv.id ? 'USSD Prompt Sent...' : 'Pay via MTN MoMo'}
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[11px]">
                              Paid Ref: {inv.transactionReference}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 5. FEEDBACK TAB */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Patient Experience & Hospital Feedback
                </h4>

                <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Overall Hospital Care Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className={`p-1.5 rounded-lg ${
                            star <= feedbackRating ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Your Comments or Suggestions</label>
                    <textarea
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white text-xs"
                      placeholder="Tell us about doctor attention, wait time, cleanliness..."
                    />
                  </div>

                  {feedbackSubmitted && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900">
                      Murakoze cyane! Thank you for helping us improve SmartCare healthcare quality.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition"
                  >
                    Submit Patient Feedback
                  </button>
                </form>

                {/* Hospital 24/7 Hotline Support Card */}
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2 text-xs text-teal-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-teal-700" />
                    24/7 SmartCare Kigali Patient Helpline
                  </div>
                  <p className="text-teal-800 text-[11px]">
                    Emergency Triage: <span className="font-bold font-mono">912</span> or{' '}
                    <span className="font-bold font-mono">+250 788 000 111</span>. Our bilingual team assists in Kinyarwanda, English, and French.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showBookAptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Book Doctor Consultation</h3>
              <button onClick={() => setShowBookAptModal(false)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Specialist / Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {staffList
                    .filter((s) => s.role === 'Doctor')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Consultation Mode</label>
                <select
                  value={aptType}
                  onChange={(e) => setAptType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="In-person Consultation">In-person Hospital Consultation</option>
                  <option value="Teleconsultation">Teleconsultation (Video / Call)</option>
                  <option value="Follow-up">Post-Discharge Follow-up</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Consultation</label>
                <textarea
                  rows={2}
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowBookAptModal(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
