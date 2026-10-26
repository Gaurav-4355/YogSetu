import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, Pose, PlanItem } from '../api/client';
import { PoseCard } from '../components/PoseCard';
import {
  Sparkles,
  Upload,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hasDoctorPlan, setHasDoctorPlan] = useState(false);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [personalPlan, setPersonalPlan] = useState<PlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('yogsetu_self_plan');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promptText, setPromptText] = useState('');
  const [minutesAvailable, setMinutesAvailable] = useState(20);
  const [ageGroup, setAgeGroup] = useState('adult');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getPoses().then(setPoses);
    api.getAssignments(user.identifier).then((assigns) => {
      setHasDoctorPlan(assigns && assigns.length > 0);
    });
  }, [user]);

  const handleGenerateTextPlan = async () => {
    if (!promptText.trim()) {
      setError('Please describe your goal or concern (e.g., homemaker, only 30 minutes in morning).');
      return;
    }
    setError(null);
    setSafetyAlert(null);
    setLoadingAi(true);
    try {
      const resp = await api.createSelfPlan({
        goal_or_concern: promptText,
        minutes_available: minutesAvailable,
        age_group: ageGroup,
      });

      if (resp.needs_doctor) {
        setSafetyAlert(resp.summary);
      } else {
        setPersonalPlan(resp.plan);
        setAiSummary(resp.summary);
        localStorage.setItem('yogsetu_self_plan', JSON.stringify(resp.plan));
      }
    } catch (err: any) {
      setError(err?.message || 'Plan generation failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleGeneratePhotoPlan = async () => {
    if (!selectedPhoto) {
      setError('Please select an exercise sheet photo.');
      return;
    }
    setError(null);
    setSafetyAlert(null);
    setLoadingAi(true);
    try {
      const formData = new FormData();
      formData.append('note_image', selectedPhoto);
      formData.append('minutes_available', String(minutesAvailable));
      formData.append('age_group', ageGroup);

      const resp = await api.createPlanFromNote(formData);
      if (resp.needs_doctor) {
        setSafetyAlert(resp.summary);
      } else {
        setPersonalPlan(resp.plan);
        setAiSummary(resp.summary);
        localStorage.setItem('yogsetu_self_plan', JSON.stringify(resp.plan));
      }
    } catch (err: any) {
      setError(err?.message || 'Image processing failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleStartPose = (poseId: string) => {
    // source='self' guarantees privacy isolation!
    navigate(`/session/${poseId}?source=self`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Switch to Doctor Plan Banner (if doctor assignment exists) */}
      {hasDoctorPlan && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-teal-900 font-medium">
            <span>You have an active routine prescribed by your doctor.</span>
          </div>
          <Link
            to="/assigned"
            className="text-xs font-bold text-teal-800 hover:text-teal-950 underline flex items-center gap-1"
          >
            Back to Doctor&apos;s Plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Normal User Header with Privacy Isolation Label */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-serif font-black text-slate-850">
              Personal Yoga Practice
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Build your customized routine with Gemma 4 AI.
            </p>
          </div>

          {/* Privacy Guarantee Badge (Section 2) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 text-slate-700 text-xs font-bold border border-sand-200">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            Only you can see this
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-coral-50 border border-coral-200 text-coral-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-coral-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {safetyAlert && (
        <div className="p-5 rounded-2xl bg-coral-50 border border-coral-200 text-coral-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-coral-700">
            <AlertCircle className="w-4 h-4 text-coral-600" />
            Medical Precaution Required
          </div>
          <p className="text-xs leading-relaxed">{safetyAlert}</p>
        </div>
      )}

      {/* Routine Generator Card */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft space-y-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-teal-700" />
          <h2 className="text-xl font-serif font-bold text-slate-850">
            Ask Gemma 4 for a Plan
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Goal or Concern
            </label>
            <textarea
              rows={2}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., homemaker, only 30 minutes in the morning, mild shoulder tightness..."
              className="w-full p-3 rounded-xl border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-sand-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minutes Available
              </label>
              <select
                value={minutesAvailable}
                onChange={(e) => setMinutesAvailable(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-sand-200 text-xs text-slate-850"
              >
                <option value={10}>10 Minutes (Quick Morning Stretch)</option>
                <option value={15}>15 Minutes (Balanced Mobility)</option>
                <option value={20}>20 Minutes (Gentle Flow)</option>
                <option value={30}>30 Minutes (Deep Hold Routine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age Group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-sand-200 text-xs text-slate-850"
              >
                <option value="adult">Adult (18-59)</option>
                <option value="senior">Senior Citizen (60+)</option>
                <option value="child">Child (Under 18)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Optional note photo upload */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                id="self-note-file"
                className="hidden"
                onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="self-note-file"
                className="px-3.5 py-2 rounded-xl border border-sand-300 text-xs text-slate-600 hover:bg-sand-100 cursor-pointer flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-teal-700" />
                {selectedPhoto ? selectedPhoto.name : 'Or upload note photo'}
              </label>
              {selectedPhoto && (
                <button
                  type="button"
                  onClick={handleGeneratePhotoPlan}
                  disabled={loadingAi}
                  className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  Parse Photo
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleGenerateTextPlan}
              disabled={loadingAi}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Sparkles className="w-4 h-4" />
              {loadingAi ? 'Gemma is creating your plan...' : 'Draft Plan for My Goal'}
            </button>
          </div>
        </div>
      </div>

      {aiSummary && (
        <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-slate-700 leading-relaxed">
          <strong>Gemma 4 Recommendation:</strong> {aiSummary}
        </div>
      )}

      {/* Routine Pose Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-slate-850">
            {personalPlan.length > 0 ? 'Your Active Routine' : 'Explore Starter Poses'}
          </h2>
          <span className="text-xs text-slate-500">Live AI camera feedback</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(personalPlan.length > 0 ? personalPlan : poses.slice(0, 4).map((p) => ({
            pose_id: p.id,
            hold_seconds: p.default_hold_seconds,
            sets: 2,
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            tip: p.how_to[0],
          }))).map((item, idx) => {
            const poseObj = poses.find((p) => p.id === item.pose_id);
            return (
              <PoseCard
                key={`${item.pose_id}-${idx}`}
                id={item.pose_id}
                englishName={poseObj?.english_name || item.pose_id}
                hindiName={poseObj?.hindi_name || ''}
                holdSeconds={item.hold_seconds}
                sets={item.sets}
                cameraSupported={poseObj?.camera_supported || false}
                tip={item.tip}
                caution={poseObj?.caution}
                onStart={() => handleStartPose(item.pose_id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
