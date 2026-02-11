
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Activity, Calendar } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';

const ClientHub: React.FC = () => {
  const { projects } = useProjects();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-[#171844] tracking-tight">Active Projects</h1>
        <p className="text-slate-500 mt-2 font-medium">Select a property to view deployment highlights and real-time status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((p) => (
          <button 
            key={p.id}
            onClick={() => navigate(`/client/${p.id}`)}
            className="group text-left bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] bg-[#E9F2F8] flex items-center justify-center text-[#0070C0] shadow-sm">
                <Building2 size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#171844] group-hover:text-[#0070C0] transition-colors">{p.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{p.siteId}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-[#171844] group-hover:text-white flex items-center justify-center transition-all">
              <ChevronRight size={24} />
            </div>
          </button>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Activity size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">No active deployments linked to this account.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHub;
