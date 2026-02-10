
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, MapPin, ChevronRight, Trash2, Clock, Search, BadgeCheck } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { Project } from '../types';

const ProjectHub: React.FC = () => {
  const { projects, setActiveProject, deleteProject, setIsWizardOpen } = useProjects();
  const navigate = useNavigate();

  const handleResume = (p: Project) => {
    setActiveProject(p);
    navigate(`/project/${p.id}`);
  };

  const handleNewProject = () => {
    setActiveProject(null);
    setIsWizardOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#171844] tracking-tight">Project Hub</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and resume all technical deployments across the global network.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-64 outline-none focus:ring-2 focus:ring-[#0070C0] transition-all" placeholder="Filter projects..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* New Project Card */}
        <button 
          onClick={handleNewProject}
          className="group h-[320px] bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[#0070C0] hover:bg-blue-50/50 transition-all w-full"
        >
          <div className="w-16 h-16 rounded-3xl bg-slate-100 group-hover:bg-[#0070C0] group-hover:text-white transition-all flex items-center justify-center text-slate-400">
            <Plus size={32} />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">Start New Project</p>
            <p className="text-slate-400 text-sm mt-1">Initialize technical deployment wizard</p>
          </div>
        </button>

        {projects.map((p) => (
          <div key={p.id} className="group h-[320px] bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col overflow-hidden relative">
            
            {/* Validated Stamp Overlay */}
            {p.handoverSignedAt && (
              <div className="absolute top-10 right-[-30px] rotate-[25deg] z-10 pointer-events-none animate-in zoom-in-50 duration-700">
                <div className="px-6 py-2 border-[5px] border-[#87A237] rounded-xl bg-white/90 backdrop-blur shadow-xl flex flex-col items-center">
                   <div className="flex items-center gap-2">
                      <BadgeCheck size={28} className="text-[#87A237]" />
                      <span className="text-2xl font-black text-[#87A237] tracking-tighter">VALIDATED</span>
                   </div>
                   <span className="text-[9px] font-black text-[#87A237] uppercase tracking-widest mt-[-2px]">Site Certified: {new Date(p.handoverSignedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E9F2F8] flex items-center justify-center text-[#0070C0] font-black text-xl">
                  {p.name[0]}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[#171844] mb-2 truncate pr-16">{p.name}</h3>
              <p className="text-[10px] font-bold text-[#87A237] uppercase tracking-widest mb-4">{p.siteId}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{p.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Clock size={14} className="shrink-0" />
                  <span>Last update: {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleResume(p)}
              className="w-full py-5 bg-slate-50 group-hover:bg-[#171844] group-hover:text-white transition-all text-[#171844] font-bold text-sm flex items-center justify-center gap-2 border-t border-slate-100"
            >
              {p.handoverSignedAt ? 'VIEW FINAL ARCHIVE' : 'RESUME PROJECT'}
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="py-24 text-center">
          <LayoutGrid size={80} className="mx-auto text-slate-200 mb-6" />
          <h2 className="text-2xl font-bold text-slate-400">No Projects Found</h2>
          <p className="text-slate-500">Your local project library is empty. Click the button above to begin.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectHub;
