import { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Mail, User, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updatePreferences } from '../api/axios';

function ToggleSwitch({ enabled, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${enabled ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${enabled ? 'bg-primary-600' : 'bg-slate-200'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, updatePreferences: updateUserPrefs } = useAuth();
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [emailDigest, setEmailDigest] = useState(user?.emailDigestEnabled !== false);

  const handleToggle = async (key, value) => {
    setSaving(true);
    try {
      if (key === 'darkMode') {
        setDarkMode(value);
        await updatePreferences({ darkMode: value });
      } else if (key === 'emailDigestEnabled') {
        setEmailDigest(value);
        await updatePreferences({ emailDigestEnabled: value });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your preferences and account</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-primary-600" /> Profile Information
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-2xl font-display font-bold">
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-display text-lg font-bold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                <Shield size={10} /> {user?.role}
              </span>
              {user?.team && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{user.team}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <SettingsIcon size={16} className="text-primary-600" /> Preferences
        </h3>

        <ToggleSwitch
          enabled={darkMode}
          onChange={() => handleToggle('darkMode', !darkMode)}
          label="Dark Mode"
          description="Switch between light and dark theme"
          icon={darkMode ? Moon : Sun}
        />

        <ToggleSwitch
          enabled={emailDigest}
          onChange={() => handleToggle('emailDigestEnabled', !emailDigest)}
          label="Weekly Email Digest"
          description="Receive performance summary every Monday at 8am"
          icon={Mail}
        />

        <ToggleSwitch
          enabled={true}
          onChange={() => {}}
          label="In-App Notifications"
          description="Get alerts for deal movements and target updates"
          icon={Bell}
        />
      </div>

      {/* Account Info */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Account Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">User ID</p>
            <p className="text-slate-600 font-mono text-xs bg-slate-50 px-2 py-1.5 rounded-lg">{user?._id}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Account Created</p>
            <p className="text-slate-600">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
