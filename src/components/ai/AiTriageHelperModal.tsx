import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, RefreshCw, HeartPulse, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyTriage?: (triageData: any) => void;
}

export const AiTriageHelperModal: React.FC<Props> = ({ isOpen, onClose, onApplyTriage }) => {
  const [age, setAge] = useState<number>(38);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [symptoms, setSymptoms] = useState('Severe crushing retrosternal chest pain radiating to left jaw, diaphoresis, dyspnea for 45 minutes.');
  const [bp, setBp] = useState('88/54');
  const [hr, setHr] = useState(118);
  const [temp, setTemp] = useState(36.4);
  const [spo2, setSpo2] = useState(91);
  const [medicalHistory, setMedicalHistory] = useState('Type 2 Diabetes, heavy smoker (15 pack-years)');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    triageLevel: string;
    rationale: string;
    redFlags: string[];
    recommendedTests: string[];
    differentialSuggestions: string[];
    safetyWarning: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/ai/triage-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          gender,
          symptoms,
          vitals: { bp, hr, temp, spo2 },
          medicalHistory,
        }),
      });
      const data = await response.json();
      if (data.success && data.support) {
        setResult(data.support);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTriageBadgeColor = (level: string) => {
    if (level.includes('Red')) return 'bg-rose-600 text-white border-rose-700';
    if (level.includes('Orange')) return 'bg-amber-500 text-white border-amber-600';
    if (level.includes('Yellow')) return 'bg-yellow-400 text-slate-900 border-yellow-500';
    if (level.includes('Green')) return 'bg-emerald-600 text-white border-emerald-700';
    return 'bg-blue-600 text-white border-blue-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Emergency & Triage AI Clinical Decision Support
              </h3>
              <p className="text-xs text-rose-100">
                Rapid evidence-based triage stratification & red flag surveillance
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">BP (mmHg)</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-700 block mb-1">
              Acute Symptoms & Onset
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Chest pain, difficulty breathing, altered mental status..."
            />
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-700 block mb-1">
              Relevant Medical History / Comorbidities
            </label>
            <input
              type="text"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Hypertension, previous stroke, asthma..."
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-medium rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Triage Urgency & Protocol...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Run AI Triage Evaluation
              </>
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Recommended Triage Priority</span>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${getTriageBadgeColor(
                      result.triageLevel
                    )}`}
                  >
                    {result.triageLevel}
                  </div>
                </div>
                {onApplyTriage && (
                  <button
                    onClick={() => {
                      onApplyTriage(result);
                      onClose();
                    }}
                    className="text-xs px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-xs"
                  >
                    Adopt in Emergency Queue
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-2">
                <div>
                  <span className="font-semibold text-slate-800">Clinical Rationale: </span>
                  <span className="text-slate-600">{result.rationale}</span>
                </div>

                {result.redFlags?.length > 0 && (
                  <div>
                    <span className="font-semibold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Risk Red Flags:
                    </span>
                    <ul className="list-disc list-inside text-rose-900 mt-1 pl-1 space-y-0.5">
                      {result.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" /> Recommended Diagnostics:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 mt-1 pl-1 space-y-0.5">
                      {result.recommendedTests?.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-amber-700">Differential Suggestions:</span>
                    <ul className="list-disc list-inside text-slate-600 mt-1 pl-1 space-y-0.5">
                      {result.differentialSuggestions?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ {result.safetyWarning || 'Clinician approval required. AI does not autonomously discharge or admit.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
