import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your application preferences</p>
      </div>
      <div className="card flex flex-col items-center py-16 text-center">
        <SettingsIcon size={40} className="text-slate-200 mb-4" />
        <p className="text-slate-400 font-medium">Settings panel coming soon</p>
        <p className="text-sm text-slate-300 mt-1">User preferences, notifications, and integrations</p>
      </div>
    </div>
  );
}
