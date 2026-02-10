
import React from 'react';
import { Clock, User, X, Zap, Server, ShieldCheck, Activity, Terminal, AlertCircle } from 'lucide-react';
import { SiteActivity, ModuleType } from '../types';

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
  activities: SiteActivity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isOpen, onClose, activities }) => {
  return (
    <div className={`fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white shadow-2xl transition-transform duration-500 flex flex-col border-l border-slate-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#171844] flex items-center justify-center text-[#87A237]">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171844]">Team Collaboration</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Site Audit Trail</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={24} className="text-slate-400" />
        </button>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
        {activities.map((item, idx) => (
          <div key={item.id} className="relative pl-10">
            {/* Timeline Line */}
            {idx < activities.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-[-40px] w-[2px] bg-slate-100" />
            )}
            
            {/* Icon Circle */}
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10 ${
              item.isError ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-[#0070C0]'
            }`}>
              {item.isError ? <AlertCircle size={18} /> : <Terminal size={18} />}
            </div>

            <div className="space-y-1">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.user}</p>
                  <p className="text-[9px] font-bold text-slate-300 flex items-center gap-1">
                    <Clock size={10} /> {item.timestamp}
                  </p>
               </div>
               <p className={`text-sm leading-relaxed ${item.isError ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'}`}>
                  {item.action}
               </p>
               {item.module && (
                 <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-[#E9F2F8] rounded-md text-[9px] font-black text-[#0070C0] uppercase border border-blue-100">
                    <div className="w-1 h-1 rounded-full bg-[#0070C0]" />
                    {item.module}
                 </div>
               )}
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-20 opacity-40">
             <Zap size={48} className="mx-auto mb-4" />
             <p className="text-sm font-bold uppercase tracking-widest">No activity recorded</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync: Global Cluster Ready</p>
      </div>
    </div>
  );
};

export default ActivityFeed;
