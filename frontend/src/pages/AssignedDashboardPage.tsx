import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, AssignmentItem, Pose } from '../api/client';
import { PoseCard } from '../components/PoseCard';
import {
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AssignedDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([api.getAssignments(user.identifier), api.getPoses()])
      .then(([assignData, poseList]) => {
        setAssignments(assignData);
        setPoses(poseList);
      })
      .catch((err) => console.error('Failed to load assigned dashboard:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const activeAssignment = assignments.find((a) => a.status === 'active') || assignments[0];

  const handleStartPose = (poseId: string) => {
    navigate(
      `/session/${poseId}?assignmentId=${activeAssignment?.id || ''}&source=doctor`
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading doctor-prescribed routine...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Switch to Normal User Banner */}
      <div className="bg-sand-100 rounded-2xl p-4 border border-sand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping"></span>
          <span>
            You are viewing <strong>Doctor-Assigned Care Mode</strong>.
          </span>
        </div>
        <Link
          to="/home"
          className="text-xs font-bold text-teal-800 hover:text-teal-900 underline flex items-center gap-1"
        >
          Use as normal user (my own plan) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!activeAssignment ? (
        <div className="bg-surface rounded-3xl p-10 border border-sand-200 shadow-soft text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-sand-100 text-slate-400 flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-850">
              No Doctor Assignments Found
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your therapist has not assigned a routine to {user?.identifier} yet. You can build your own routine anytime in normal user mode.
            </p>
          </div>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-md transition"
          >
            Go to Normal User Home
          </Link>
        </div>
      ) : (
        <>
          {/* Active Doctor Prescription Card */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-teal-200/80 shadow-soft space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  Prescribed by {activeAssignment.doctor_name}
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-850">
                  Today&apos;s Prescribed Routine
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Start Date: {activeAssignment.start_date} • {activeAssignment.weeks_left} week(s) remaining
                </p>
              </div>

              {/* Shared with Doctor Badge (Section 2) */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Shared with your doctor
              </div>
            </div>

            {activeAssignment.plan?.summary && (
              <p className="text-xs text-slate-600 bg-sand-50 p-3 rounded-xl border border-sand-100 leading-relaxed">
                <strong>Doctor Notes:</strong> {activeAssignment.plan.summary}
              </p>
            )}
          </div>

          {/* Routine Pose Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-slate-850">
                Prescribed Poses ({activeAssignment.plan?.plan?.length || 0})
              </h2>
              <span className="text-xs text-slate-500">Camera guides postures live</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAssignment.plan?.plan?.map((item, idx) => {
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
        </>
      )}
    </div>
  );
};
