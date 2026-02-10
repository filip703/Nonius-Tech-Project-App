
import React from 'react';
import { HardDrive, CircleCheck, TriangleAlert, Clock, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';

interface BackupManagerProps {
  role: UserRole;
}

const BackupManager: React.FC<BackupManagerProps> = ({ role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const backups = [
    { name: 'Core Switch (ICX-8200)', date: '2023-11-20 14:05', status: 'Success', tech: 'Alex Tech' },
    { name: 'Firewall (FortiGate)', date: '2023-11-20 13:40', status: 'Success', tech: 'Alex Tech' },
    { name: 'VoIP PBX Instance', date: '2023-11-19 09:12', status: 'Fail', tech: 'John Senior' },
    { name: 'TV Gateway 01', date: '2023-11-20 15:30', status: 'Pending', tech: 'Alex Tech' },
    { name: 'Access Switch #12', date: '2023-11-18 10:00', status: 'Success', tech: 'M. Silva' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-[#171844]">Backup Validation Log</h2>
           <p className="text-slate-500 font-medium mt-1 italic text-sm">Critical task: Verify remote storage sync after every configuration change.</p>
        </div>
        {!isViewOnly && (
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#171844] text-white rounded-xl text-xs font-bold shadow-lg">
            <RefreshCw size={16} /> Trigger Bulk Sync
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-8 py-5">Equipment Name</th>
              <th className="px-8 py-5">Last Backup Date</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Technician</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backups.map((b, idx) => (
              <tr key={idx} className={`transition-colors ${b.status === 'Fail' ? 'bg-red-50' : 'hover:bg-slate-50/50'}`}>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                      <HardDrive size={18} className="text-slate-300" />
                      <span className="font-bold text-[#171844]">{b.name}</span>
                   </div>
                </td>
                <td className="px-8 py-5 text-slate-500 font-medium font-mono text-xs">{b.date}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    {b.status === 'Success' && <CircleCheck size={16} className="text-[#87A237]" />}
                    {b.status === 'Fail' && <TriangleAlert size={16} className="text-red-500" />}
                    {b.status === 'Pending' && <Clock size={16} className="text-amber-500" />}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      b.status === 'Success' ? 'text-[#87A237]' : 
                      b.status === 'Fail' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-slate-500 font-bold text-xs">{b.tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BackupManager;
