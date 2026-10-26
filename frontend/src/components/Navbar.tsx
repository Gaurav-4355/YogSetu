import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n';
import { AlarmModal, playChime } from './AlarmModal';
import { Bell, LogOut, Stethoscope, UserCheck, Globe, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [alarmOpen, setAlarmOpen] = useState(false);

  // In-page Alarm ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const enabled = localStorage.getItem('yogsetu_alarm_enabled') === 'true';
      const targetTime = localStorage.getItem('yogsetu_alarm_time');
      if (enabled && targetTime) {
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const hasChimedMinute = sessionStorage.getItem('yogsetu_chimed_minute');
        if (currentHHMM === targetTime && hasChimedMinute !== currentHHMM) {
          sessionStorage.setItem('yogsetu_chimed_minute', currentHHMM);
          playChime();
          alert('🔔 YogSetu Daily Reminder: Time for your guided yoga routine!');
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-sand-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={user?.role === 'doctor' ? '/doctor' : '/assigned'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-teal-700 group-hover:bg-teal-800 text-white flex items-center justify-center transition shadow-md shadow-teal-700/20">
                <Activity className="w-5 h-5 text-sand-100" />
              </div>
              <div>
                <span className="text-xl font-serif font-black tracking-tight text-teal-900 block leading-tight">
                  YogSetu
                </span>
                <span className="text-[10px] font-sans font-medium text-slate-500 uppercase tracking-widest block -mt-0.5">
                  योगसेतु Bridge
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative flex items-center bg-sand-100 rounded-xl p-1 border border-sand-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {(['hinglish', 'hi', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                    language === lang
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'hinglish' ? 'Hinglish' : lang === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>

            {/* Daily In-tab Alarm Button */}
            <button
              onClick={() => setAlarmOpen(true)}
              title={t.navAlarm}
              className="p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl border border-transparent hover:border-teal-200 transition"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Role Badge and User info */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-sand-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user.identifier}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    user.role === 'doctor'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-sand-100 text-slate-700 border-sand-200'
                  }`}
                >
                  {user.role === 'doctor' ? (
                    <>
                      <Stethoscope className="w-3 h-3 text-teal-600" />
                      Doctor
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      Patient
                    </>
                  )}
                </span>

                <button
                  onClick={handleLogout}
                  title={t.navLogout}
                  className="p-2 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <AlarmModal isOpen={alarmOpen} onClose={() => setAlarmOpen(false)} />
    </>
  );
};
