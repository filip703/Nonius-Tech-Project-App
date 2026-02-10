
import React, { useState } from 'react';
import { Smartphone, ShieldCheck, Globe, Apple, PlayCircle, AppWindow, Settings } from 'lucide-react';
import { UserRole } from '../types';

interface MobileConfigurationProps {
  role: UserRole;
}

const MobileConfiguration: React.FC<MobileConfigurationProps> = ({ role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const features = [
    { name: 'Native Guest App', status: 'Live', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Mobile Key (HID/Assa)', status: 'Deploying', color: 'bg-blue-100 text-blue-700' },
    { name: 'Express Check-in', status: 'Live', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Loyalty Portal Integration', status: 'Hold', color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Status */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-[#171844] flex items-center gap-2">
            <AppWindow size={24} className="text-[#87A237]" /> Solution Modules Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(f => (
              <div key={f.name} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <span className="font-bold text-[#171844]">{f.name}</span>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${f.color}`}>
                   {f.status}
                 </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-[#171844] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
           <div>
              <Smartphone size={40} className="text-[#87A237] mb-6" />
              <h3 className="text-2xl font-bold mb-2">Nonius Mobile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ensure all bundle IDs are strictly matched with the store listing to avoid push notification failures.
              </p>
           </div>
           <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#87A237]">
                <ShieldCheck size={16} /> GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#87A237]">
                <Globe size={16} /> Multi-language Ready
              </div>
           </div>
        </div>

        {/* Identity Inputs */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-xl font-bold text-[#171844] flex items-center gap-2">
             <Settings size={24} className="text-[#0070C0]" /> Application Store Identity
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                   <Apple size={16} className="text-slate-400" />
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apple App Store ID</label>
                </div>
                <input 
                  disabled={isViewOnly} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-mono text-sm" 
                  placeholder="e.g. 123456789"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                   <PlayCircle size={16} className="text-slate-400" />
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Play ID</label>
                </div>
                <input 
                  disabled={isViewOnly} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-mono text-sm" 
                  placeholder="com.nonius.guestapp"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                   <ShieldCheck size={16} className="text-slate-400" />
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unified Bundle ID</label>
                </div>
                <input 
                  disabled={isViewOnly} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-mono text-sm" 
                  placeholder="nonius.hotel.bundle"
                />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MobileConfiguration;
