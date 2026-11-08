import React from 'react';
import { X, Printer, Download, ShieldCheck, QrCode } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const MedicalDocumentPrintModal: React.FC = () => {
  const { activeDocumentPrint, setActiveDocumentPrint, formatCurrency } = useHospital();

  if (!activeDocumentPrint) return null;

  const { type, data } = activeDocumentPrint;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Action bar (hidden on print) */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Official Document Preview
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-mono">
              SmartCare HMS Verifiable
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={() => setActiveDocumentPrint(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 max-h-[80vh] overflow-y-auto font-serif text-slate-900 bg-white">
          {/* Hospital Official Header */}
          <div className="border-b-2 border-blue-900 pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-sans font-bold text-xl shadow-xs">
                SC
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-blue-950 font-sans">
                  SMARTCARE HOSPITAL KIGALI
                </h1>
                <p className="text-xs text-slate-600 font-sans tracking-wide">
                  CENTRAL MEDICAL & SURGICAL REFERRAL COMPLEX
                </p>
                <p className="text-[11px] text-slate-500 font-sans">
                  KN 3 Rd, Nyarugenge / Gasabo, Kigali, Rwanda · Tel: +250 788 000 111 · info@smartcare.rw
                </p>
              </div>
            </div>
            <div className="text-right font-sans">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> MoH Certified #RW-HMS-2026
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* INVOICE VIEW */}
          {type === 'invoice' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start font-sans">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Billed To</span>
                  <div className="font-bold text-base text-slate-900">{data.patientName}</div>
                  <div className="text-xs text-slate-600">ID: {data.patientId} · Phone: {data.patientPhone}</div>
                  <div className="text-xs text-blue-700 font-medium mt-1">
                    Coverage: {data.insuranceProvider}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 font-mono">{data.invoiceNo}</div>
                  <div className="text-xs text-slate-500">Issued: {data.date}</div>
                  <div className="mt-1">
                    <span
                      className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        data.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="py-2.5 px-3 text-left">Description</th>
                    <th className="py-2.5 px-3 text-center">Category</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{item.category}</td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitPriceRWF)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">{formatCurrency(item.totalRWF)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end font-sans">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(data.subtotalRWF)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 font-medium">
                    <span>Insurance Paid ({data.insuranceProvider}):</span>
                    <span className="font-mono">- {formatCurrency(data.insuranceCoveredRWF)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                    <span>Patient Payable Balance:</span>
                    <span className="font-mono text-blue-900">{formatCurrency(data.patientPayableRWF)}</span>
                  </div>
                  {data.transactionReference && (
                    <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600 border border-slate-200">
                      Payment Ref: <span className="font-mono font-semibold">{data.transactionReference}</span> ({data.paymentMethod})
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRESCRIPTION VIEW */}
          {type === 'prescription' && (
            <div className="space-y-6 font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-black text-blue-900 font-serif">Rx</div>
                  <div className="text-sm font-bold mt-1">Prescription #: {data.prescriptionNo}</div>
                  <div className="text-xs text-slate-600">Patient: <span className="font-semibold text-slate-900">{data.patientName}</span></div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-800">Prescribing Physician:</div>
                  <div>{data.doctorName}</div>
                  <div className="text-slate-500">Date: {data.date}</div>
                </div>
              </div>

              <div className="divide-y divide-slate-200 border rounded-xl overflow-hidden">
                {data.items?.map((item: any, i: number) => (
                  <div key={i} className="p-4 bg-white text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-blue-950">{i + 1}. {item.medicineName}</span>
                      <span className="font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                    </div>
                    <div className="text-slate-700 font-medium">Dosage & Frequency: {item.dosage} — {item.frequency} for {item.duration}</div>
                    <div className="text-slate-500 italic">Instructions: {item.instructions}</div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t flex items-end justify-between text-xs text-slate-500">
                <div>
                  <p>Dispensing Pharmacist: {data.dispensedBy || 'Pending Dispensation'}</p>
                  <p>SmartCare Central Dispensary Kigali</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span>Physician Digital Signature & Stamp</span>
                </div>
              </div>
            </div>
          )}

          {/* LAB REPORT VIEW */}
          {type === 'lab' && (
            <div className="space-y-5 font-sans">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{data.testName}</h2>
                  <p className="text-slate-500">Order Ref: {data.orderNo} · Category: {data.testCategory}</p>
                  <p className="text-slate-800 font-medium">Patient: {data.patientName} ({data.patientId})</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Sample: <span className="font-semibold">{data.sampleType}</span></p>
                  <p className="text-slate-500">Technician: {data.technicianName || 'Aline Umutoni, MLS'}</p>
                  <p className="text-slate-500">Verified By: {data.verifiedBy || 'Pending Doctor Verification'}</p>
                </div>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="py-2 px-3 text-left">Analyte / Parameter</th>
                    <th className="py-2 px-3 text-center">Observed Value</th>
                    <th className="py-2 px-3 text-center">Unit</th>
                    <th className="py-2 px-3 text-center">Reference Range</th>
                    <th className="py-2 px-3 text-right">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.results?.map((res: any, idx: number) => (
                    <tr key={idx} className={res.status === 'High' || res.status === 'Critical' ? 'bg-rose-50/50' : ''}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{res.name}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{res.value}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{res.unit}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{res.referenceRange}</td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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

              {data.clinicalNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800">Laboratory Specialist Remarks: </span>
                  <span className="text-slate-600">{data.clinicalNotes}</span>
                </div>
              )}
            </div>
          )}

          {/* DISCHARGE CERTIFICATE & SICK LEAVE */}
          {type === 'dischargeCertificate' && (
            <div className="space-y-6 font-sans">
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wider text-blue-950">
                  Medical Certificate & Discharge Summary
                </h2>
                <p className="text-xs text-slate-500">Issued pursuant to Rwanda Ministry of Health Medical Practice Code</p>
              </div>

              <div className="text-xs space-y-4 leading-relaxed text-slate-800">
                <p>
                  This is to certify that <span className="font-bold text-slate-900">{data.patientName}</span>, aged{' '}
                  <span className="font-bold">{data.age || '32'}</span>, registered under Hospital ID{' '}
                  <span className="font-mono font-bold text-blue-900">{data.hospitalId || 'SC-KGL-0482'}</span>, was examined and managed at SmartCare Hospital.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                  <p><span className="font-bold text-slate-700">Clinical Diagnosis:</span> {data.diagnosis || 'Acute Uncomplicated Presentation, Managed to Resolution'}</p>
                  <p><span className="font-bold text-slate-700">Treatment Received:</span> {data.treatment || 'Intravenous hydration, targeted pharmacotherapy, supportive clinical care'}</p>
                  <p><span className="font-bold text-slate-700">Recommended Medical Rest:</span> 5 days from discharge date</p>
                  <p><span className="font-bold text-slate-700">Fit to resume duties:</span> After scheduled follow-up clearance</p>
                </div>

                <p className="text-slate-600 italic">
                  Patient has been counseled on adherence to prescribed therapy and given 24/7 hotline contacts.
                </p>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs">
                <div>
                  <div className="w-16 h-16 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                    Official Stamp
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-slate-500 mb-1"></div>
                  <p className="font-bold text-slate-900">{data.doctorName || 'Dr. David Mugisha, MD, FCP'}</p>
                  <p className="text-slate-500">Attending Physician / Senior Consultant</p>
                  <p className="text-slate-400 font-mono text-[10px]">Licence: RMC-2016-1402</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer watermark & QR */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-slate-700" />
              <span>Scan QR code to verify authenticity on SmartCare Rwanda Patient Portal</span>
            </div>
            <div>Generated by SmartCare HMS · Secure Medical Record</div>
          </div>
        </div>
      </div>
    </div>
  );
};
