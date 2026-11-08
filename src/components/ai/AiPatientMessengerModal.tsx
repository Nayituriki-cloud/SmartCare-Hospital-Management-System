import React, { useState } from 'react';
import { MessageSquareText, X, Copy, Check, Send, Globe2, RefreshCw } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefillPatientName?: string;
  prefillPhone?: string;
}

export const AiPatientMessengerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prefillPatientName,
  prefillPhone,
}) => {
  const { patients } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [language, setLanguage] = useState<'Kinyarwanda' | 'Français' | 'English'>('Kinyarwanda');
  const [messageType, setMessageType] = useState('Discharge Medication Instructions & Follow-up Appointment');
  const [clinicalDetails, setClinicalDetails] = useState(
    'Discharged post-malaria and bronchitis. Prescribed oral Coartem twice daily with food for 2 days remaining, and stay well hydrated. Return for review in 5 days on Nov 13, 2026.'
  );

  const [loading, setLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || {
      fullName: prefillPatientName || 'Patient',
      phone: prefillPhone || '+250 788 000 000',
    };

  const handleGenerate = async () => {
    setLoading(true);
    setSentSuccess(false);
    try {
      const response = await fetch('/api/ai/patient-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: currentPatient.fullName,
          language,
          messageType,
          details: clinicalDetails,
        }),
      });

      const data = await response.json();
      if (data.success && data.message) {
        setGeneratedMessage(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulated = () => {
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <MessageSquareText className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Multilingual AI Patient Communicator
              </h3>
              <p className="text-xs text-blue-100">
                Draft compassionate, medically accurate reminders in Kinyarwanda, English, and French
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-600" /> Target Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white font-medium text-slate-800"
              >
                <option value="Kinyarwanda">Ikinyarwanda (Kinyarwanda)</option>
                <option value="English">English</option>
                <option value="Français">Français (French)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Purpose</label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 bg-white"
            >
              <option value="Discharge Medication Instructions & Follow-up Appointment">
                Discharge Medication Instructions & Follow-up Appointment
              </option>
              <option value="Appointment Reminder & Clinic Arrival Preparation">
                Appointment Reminder & Clinic Arrival Preparation
              </option>
              <option value="Laboratory Test Results Ready Notice">Laboratory Test Results Ready Notice</option>
              <option value="Hospital Bill & MTN Mobile Money Payment Reminder">
                Hospital Bill & MTN Mobile Money Payment Reminder
              </option>
              <option value="Post-Operative Recovery Check-in">Post-Operative Recovery Check-in</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Instructions / Context to Include
            </label>
            <textarea
              rows={3}
              value={clinicalDetails}
              onChange={(e) => setClinicalDetails(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2"
              placeholder="Include medication instructions, return dates, warning signs..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Composing in {language} with Cultural Nuance...
              </>
            ) : (
              <>
                <MessageSquareText className="w-4 h-4" />
                Generate Patient Message ({language})
              </>
            )}
          </button>

          {/* Generated Message Display */}
          {generatedMessage && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  SMS & WhatsApp Notification Preview ({language})
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl relative shadow-xs">
                <div className="text-xs font-bold text-emerald-800 mb-1">
                  Recipient: {currentPatient.fullName} ({currentPatient.phone})
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {generatedMessage}
                </p>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700">
                  <span>SmartCare Hospital Kigali · Helpline: +250 788 000 111</span>
                  <span>Direct Delivery: Verified SMS Gateway</span>
                </div>
              </div>

              {sentSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  Dispatched successfully via SMS to {currentPatient.phone}!
                </div>
              )}

              <button
                onClick={handleSendSimulated}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                Dispatch SMS Notification to {currentPatient.fullName}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
