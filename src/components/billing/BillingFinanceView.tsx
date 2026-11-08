import React, { useState } from 'react';
import {
  DollarSign,
  Receipt,
  CreditCard,
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  TrendingUp,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Invoice, InvoiceItem, InsuranceProvider } from '../../types';

export const BillingFinanceView: React.FC = () => {
  const {
    currentUser,
    invoices,
    createInvoice,
    payInvoice,
    patients,
    formatCurrency,
    setActiveDocumentPrint,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // New Invoice Form state
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      description: 'Specialist Medical Consultation (Internal Medicine)',
      category: 'Consultation',
      quantity: 1,
      unitPriceRWF: 15000,
      totalRWF: 15000,
      insuranceCoveredPercentage: 85,
    },
    {
      description: 'Full Blood Count (FBC / NFS) & Parasitology',
      category: 'Laboratory',
      quantity: 1,
      unitPriceRWF: 12000,
      totalRWF: 12000,
      insuranceCoveredPercentage: 85,
    },
  ]);

  // Payment simulation state
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('MTN Mobile Money');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState('+250 788 ');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDoneMsg, setPaymentDoneMsg] = useState(false);

  const activePatientForInvoice = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.insuranceProvider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'paid' && inv.status === 'Paid') ||
      (activeTab === 'unpaid' && inv.status === 'Unpaid');

    return matchesSearch && matchesTab;
  });

  const totalRevenueRWF = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.patientPayableRWF, 0);

  const totalUnpaidRWF = invoices
    .filter((i) => i.status === 'Unpaid')
    .reduce((sum, i) => sum + i.patientPayableRWF, 0);

  const totalInsuranceClaimsRWF = invoices.reduce(
    (sum, i) => sum + i.insuranceCoveredRWF,
    0
  );

  const handleAddItemRow = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        description: 'Medication or Clinical Procedure',
        category: 'Pharmacy',
        quantity: 1,
        unitPriceRWF: 5000,
        totalRWF: 5000,
        insuranceCoveredPercentage: activePatientForInvoice?.insuranceProvider === 'Mutuelle de Santé' ? 90 : 85,
      },
    ]);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientForInvoice) return;

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.totalRWF, 0);
    const insuranceShare = invoiceItems.reduce(
      (sum, i) => sum + (i.totalRWF * i.insuranceCoveredPercentage) / 100,
      0
    );
    const patientPayable = Math.max(0, subtotal - insuranceShare);

    createInvoice({
      patientId: activePatientForInvoice.id,
      patientName: activePatientForInvoice.fullName,
      patientPhone: activePatientForInvoice.phone,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      insuranceProvider: activePatientForInvoice.insuranceProvider,
      items: invoiceItems,
      subtotalRWF: subtotal,
      insuranceCoveredRWF: insuranceShare,
      patientPayableRWF: patientPayable,
      status: 'Unpaid',
    });

    setShowNewInvoiceModal(false);
    alert(`Invoice created successfully for ${activePatientForInvoice.fullName}.`);
  };

  const handleConfirmPayment = () => {
    if (!payingInvoice) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const generatedRef =
        paymentMethod === 'MTN Mobile Money'
          ? `MTN-RW-${Math.floor(100000000 + Math.random() * 900000000)}`
          : paymentMethod === 'Airtel Money'
          ? `AIR-RW-${Math.floor(100000000 + Math.random() * 900000000)}`
          : `POS-BANK-${Math.floor(10000 + Math.random() * 90000)}`;

      payInvoice(payingInvoice.id, paymentMethod, generatedRef);
      setIsProcessingPayment(false);
      setPaymentDoneMsg(true);

      setTimeout(() => {
        setPaymentDoneMsg(false);
        setPayingInvoice(null);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Hospital Billing, Health Insurance Claims & Financial Accounts
          </h2>
          <p className="text-xs text-slate-500">
            Cashier & Accountant on duty: <span className="font-semibold text-slate-800">{currentUser.name}</span> · RSSB / Mutuelle de Santé Direct Integration
          </p>
        </div>

        <button
          onClick={() => setShowNewInvoiceModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Create New Patient Invoice
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Revenue Collected
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {formatCurrency(totalRevenueRWF)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Settled via Mobile Money, Visa & Cash
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Insurance Subsidies & Claims
          </div>
          <div className="text-2xl font-bold text-blue-800 font-mono">
            {formatCurrency(totalInsuranceClaimsRWF)}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            RSSB/RAMA (85%), Mutuelle (90%), MMI claims
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Outstanding Patient Receivables
          </div>
          <div className="text-2xl font-bold text-rose-800 font-mono">
            {formatCurrency(totalUnpaidRWF)}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Pending discharge settlement
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'unpaid' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unpaid ({invoices.filter((i) => i.status === 'Unpaid').length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Settled / Paid ({invoices.filter((i) => i.status === 'Paid').length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice #, patient, insurance..."
              className="pl-9 pr-4 py-1.5 text-xs border rounded-xl bg-white w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b">
              <tr>
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Patient Name</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Insurance Scheme</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Insurance Paid</th>
                <th className="py-3 px-3 text-right">Patient Payable</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'Paid';
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900">{inv.invoiceNo}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{inv.patientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.patientPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{inv.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {inv.insuranceProvider}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {formatCurrency(inv.subtotalRWF)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">
                      {formatCurrency(inv.insuranceCoveredRWF)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.patientPayableRWF)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {!isPaid && (
                        <button
                          onClick={() => {
                            setPayingInvoice(inv);
                            setMomoPhoneNumber(inv.patientPhone || '+250 788 ');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Receive Payment
                        </button>
                      )}
                      <button
                        onClick={() => setActiveDocumentPrint({ type: 'invoice', data: inv })}
                        className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium"
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Payment Modal (MTN MoMo / Airtel / Card Simulation) */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Process Patient Payment</h3>
                <p className="text-xs text-slate-500">{payingInvoice.patientName} — {payingInvoice.invoiceNo}</p>
              </div>
              <button onClick={() => setPayingInvoice(null)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs text-emerald-800 uppercase font-semibold">Total Patient Balance Due</span>
              <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                {formatCurrency(payingInvoice.patientPayableRWF)}
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block">
                {payingInvoice.insuranceProvider} already covered {formatCurrency(payingInvoice.insuranceCoveredRWF)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'MTN Mobile Money', label: 'MTN MoMo Pay (*182#)', icon: Smartphone },
                  { id: 'Airtel Money', label: 'Airtel Money', icon: Smartphone },
                  { id: 'Visa/Mastercard', label: 'Bank Card / Visa', icon: CreditCard },
                  { id: 'Cash', label: 'Cash at Cashier', icon: DollarSign },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-left font-semibold transition ${
                        isSel
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {(paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Airtel Money') && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Subscriber Mobile Number (for USSD push prompt)
                  </label>
                  <input
                    type="text"
                    value={momoPhoneNumber}
                    onChange={(e) => setMomoPhoneNumber(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              )}
            </div>

            {paymentDoneMsg && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Payment authorized! Transaction code generated and receipt stamped.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="px-3 py-2 border rounded-lg text-slate-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmPayment}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isProcessingPayment ? 'Dispatching MoMo USSD Prompt...' : `Confirm Payment (${formatCurrency(payingInvoice.patientPayableRWF)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Create Patient Hospital Invoice</h3>
                <p className="text-xs text-slate-500">Calculate medical procedures, bed fees & insurance split</p>
              </div>
              <button onClick={() => setShowNewInvoiceModal(false)} className="p-1 rounded text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.hospitalId}) — {p.insuranceProvider}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-slate-700">Billable Services & Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...invoiceItems];
                          updated[idx].description = e.target.value;
                          setInvoiceItems(updated);
                        }}
                        className="w-full border rounded px-2 py-1 bg-white"
                        placeholder="Service description"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...invoiceItems];
                          updated[idx].category = e.target.value as any;
                          setInvoiceItems(updated);
                        }}
                        className="w-full border rounded px-2 py-1 bg-white text-[11px]"
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Bed & Ward">Bed & Ward</option>
                        <option value="Nursing / Procedure">Procedure</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        value={item.unitPriceRWF}
                        onChange={(e) => {
                          const updated = [...invoiceItems];
                          updated[idx].unitPriceRWF = Number(e.target.value);
                          updated[idx].totalRWF = Number(e.target.value) * updated[idx].quantity;
                          setInvoiceItems(updated);
                        }}
                        className="w-full border rounded px-2 py-1 bg-white font-mono"
                        placeholder="Cost RWF"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
