import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Camera, Stethoscope, ArrowRight, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            Hackathon Edition • Powered by Gemma 4 Vision
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-black text-teal-950 tracking-tight leading-[1.15]">
            We do not replace the therapist.{' '}
            <span className="text-teal-700 underline decoration-sand-300 decoration-wavy decoration-2">
              We show the therapist what happens at home.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-sans leading-relaxed">
            YogSetu connects doctors with patients during home rehabilitation. Assign routines from prescription photos, track hold times with on-device camera feedback, and see real 14-day adherence.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base shadow-lift transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              Try Demo Accounts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface rounded-3xl p-7 border border-sand-200 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-850">1. Doctor Assigns</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload a prescription note or enter clinical concerns. Gemma 4 drafts a personalized routine. Doctors fine-tune holds and sets before assigning to Gmail or Phone.
            </p>
          </div>

          <div className="bg-surface rounded-3xl p-7 border border-sand-200 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 text-teal-800 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-850">2. Patient Does at Home</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time MediaPipe AI tracks posture angles. The hold timer ticks only when the pose is aligned. A friendly Hinglish voice coach guides corrections in real time.
            </p>
          </div>

          <div className="bg-surface rounded-3xl p-7 border border-sand-200 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-850">3. Closed-Loop Progress</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              At the next appointment, the doctor sees verified facts: days done, skipped, pain reports, angle improvements, and a factual Gemma summary.
            </p>
          </div>
        </div>

        {/* Traditional vs YogSetu Table */}
        <div className="mt-16 bg-surface rounded-3xl p-8 border border-sand-200 shadow-soft">
          <h2 className="text-2xl font-serif font-bold text-teal-950 text-center mb-6">
            The Missing Bridge in Home Therapy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Without YogSetu
              </span>
              <p className="text-sm text-slate-600">
                Doctor asks: <em>&ldquo;Did you do your exercises?&rdquo;</em> Patient nods yes. Neither knows if the angle was correct, if pain occurred, or which days were skipped.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                With YogSetu
              </span>
              <p className="text-sm text-teal-900 font-medium">
                Doctor opens verified 14-day logs: 82% adherence, Tadasana spine angle improved from 166° to 176°, one pain stoppage on Day 9. Clinical decisions backed by truth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
