import React, { useState } from 'react';
import { Sparkles, X, Check, Copy, AlertCircle, RefreshCw, Stethoscope } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplySoap?: (soap: { subjective: string; objective: string; assessment: string; plan: string }) => void;
  prefillPatientId?: string;
}

export const AiClinicalAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplySoap,
  prefillPatientId,
}) => {
  const { patients, vitals } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState(prefillPatientId || (patients[0]?.id ?? ''));
  const [symptoms, setSymptoms] = useState('Persistent fever for 4 days, chills, joint pain, loss of appetite, occasional nausea.');
  const [examFindings, setExamFindings] = useState('Febrile, mild pallor. Heart sounds dual, chest clear to auscultation. Abdomen soft, mild splenomegaly tip palpable.');
  const [preliminaryImpression, setPreliminaryImpression] = useState('Acute febrile syndrome, suspecting Malaria vs Typhoid enteric fever');

  const [loading, setLoading] = useState(false);
  const [generatedSoap, setGeneratedSoap] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    disclaimer?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientVitals = vitals.find((v) => v.patientId === selectedPatientId);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedSoap(null);
    try {
      const response = await fetch('/api/ai/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientInfo: {
            name: activePatient?.fullName,
            age: activePatient?.dob ? new Date().getFullYear() - new Date(activePatient.dob).getFullYear() : 30,
            gender: activePatient?.gender,
            allergies: activePatient?.allergies,
            conditions: activePatient?.chronicConditions,
          },
          symptoms,
          vitals: {
            bp: patientVitals ? `${patientVitals.bpSystolic}/${patientVitals.bpDiastolic} mmHg` : '125/82 mmHg',
            hr: patientVitals?.heartRate || 88,
            temp: patientVitals?.temperature || 38.6,
            spo2: patientVitals?.spo2 || 97,
          },
          examFindings,
          preliminaryPlan: preliminaryImpression,
        }),
      });

      const data = await response.json();
      if (data.success && data.notes) {
        setGeneratedSoap(data.notes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedSoap) return;
    const text = `SOAP CLINICAL NOTE\n\nS (Subjective):\n${generatedSoap.subjective}\n\nO (Objective):\n${generatedSoap.objective}\n\nA (Assessment):\n${generatedSoap.assessment}\n\nP (Plan):\n${generatedSoap.plan}\n\n[${generatedSoap.disclaimer || 'Requires Physician Sign-off'}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                AI Clinical Documentation Assistant
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-400/25 border border-teal-300/40 text-teal-100 font-mono">
                  Gemini 3.8
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Synthesizes patient presentation & vitals into structured SOAP clinical notes
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
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Clinical safety banner */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Clinical Responsibility Guardrail: </span>
              In accordance with Rwanda Ministry of Health & international medical ethics guidelines, AI outputs are supportive drafts only and MUST be reviewed, validated, and signed off by the attending medical officer before entry into legal medical records.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-300 border px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.hospitalId}) - {p.gender}, {p.dob}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Preliminary Impression / Focus
              </label>
              <input
                type="text"
                value={preliminaryImpression}
                onChange={(e) => setPreliminaryImpression(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-300 border px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="e.g. Acute febrile illness, suspecting malaria"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Chief Complaints & Patient Narrative (Subjective Input)
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full text-sm rounded-lg border-slate-300 border px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="Describe symptoms, duration, triggers, aggravating and relieving factors..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Physical Exam Findings (Objective Input)
            </label>
            <textarea
              rows={2}
              value={examFindings}
              onChange={(e) => setExamFindings(e.target.value)}
              className="w-full text-sm rounded-lg border-slate-300 border px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="Clinical signs, chest auscultation, abdominal palpation, neurological exam..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synthesizing Clinical Record with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate Structured SOAP Note
              </>
            )}
          </button>

          {/* Generated SOAP Result */}
          {generatedSoap && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Synthesized Clinical Note
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                  {onApplySoap && (
                    <button
                      onClick={() => {
                        onApplySoap(generatedSoap);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply to Consultation Form
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-700 block text-[11px] uppercase tracking-wider">
                    S - Subjective
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedSoap.subjective}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-teal-700 block text-[11px] uppercase tracking-wider">
                    O - Objective
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedSoap.objective}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-purple-700 block text-[11px] uppercase tracking-wider">
                    A - Assessment & Differential
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedSoap.assessment}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-700 block text-[11px] uppercase tracking-wider">
                    P - Plan & Management
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedSoap.plan}</p>
                </div>
              </div>

              {generatedSoap.disclaimer && (
                <div className="text-[11px] text-slate-400 italic text-center">
                  {generatedSoap.disclaimer}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
