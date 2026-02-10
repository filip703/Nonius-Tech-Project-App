
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  LayoutDashboard,
  ShieldCheck,
  Star,
  Activity
} from 'lucide-react';
import { Project, ModuleType, DeploymentStatus } from '../types';
import { useProjects } from '../contexts/ProjectContext';

const ProgressRing = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64" cy="64" r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="64" cy="64" r={radius}
            className={`${color} fill-none transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-[#171844]">{percentage}%</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const { id } = useParams();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === id);

  if (!project) return (
    <div className="flex items-center justify-center h-screen bg-[#E9F2F8]">
      <div className="text-center animate-in fade-in zoom-in-95">
        <Building2 size={64} className="mx-auto text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-[#171844]">Dashboard Not Found</h2>
        <p className="text-slate-500 mt-2">The shared project link may have expired.</p>
        <Link to="/" className="mt-8 inline-block px-8 py-3 bg-[#171844] text-white rounded-2xl font-bold">Return Home</Link>
      </div>
    </div>
  );

  const mockMilestones = [
    { title: 'Project Kickoff', date: 'Oct 12', status: 'done' },
    { title: 'Hardware Staging', date: 'Nov 05', status: 'done' },
    { title: 'On-site Installation', date: 'Nov 20', status: 'active' },
    { title: 'Final QA & Acceptance', date: 'Dec 05', status: 'pending' },
  ];

  const mockPublicFeed = [
    { user: 'Alex Tech', action: 'Certified 20 Set-Top Boxes on Floor 2', time: '2h ago' },
    { user: 'Sarah L', action: 'Finalized Digital Signage Content Loop', time: '5h ago' },
    { user: 'System', action: 'Remote Cloud Sync Successful', time: 'Yesterday' },
  ];

  return (
    <div className="min-h-screen bg-[#E9F2F8] pb-20">
      {/* Client Header */}
      <header className="bg-[#171844] text-white py-12 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-[#87A237] flex items-center justify-center shadow-lg">
              <Building2 size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#87A237] uppercase tracking-[0.3em] mb-1">Project Visibility Portal</p>
              <h1 className="text-4xl font-black tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-4 mt-3 text-slate-400 text-xs font-bold">
                 <span className="flex items-center gap-1.5"><Calendar size={14} /> Est. Completion: Dec 15, 2024</span>
                 <span className="w-1 h-1 rounded-full bg-slate-700" />
                 <span className="flex items-center gap-1.5"><Users size={14} /> PM: {project.pm}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Readiness</p>
                <p className="text-2xl font-black text-[#87A237]">74%</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 -mt-10 space-y-10">
        {/* Module Progress */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProgressRing percentage={85} color="stroke-[#0070C0]" label="TV SYSTEM" />
          <ProgressRing percentage={100} color="stroke-[#87A237]" label="WIFI NETWORK" />
          <ProgressRing percentage={40} color="stroke-amber-500" label="CASTING" />
          <ProgressRing percentage={0} color="stroke-slate-200" label="MOBILE APP" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Milestone Timeline */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-[#171844] flex items-center gap-3">
              <Star size={28} className="text-amber-500" />
              Project Roadmap
            </h3>
            <div className="space-y-6">
              {mockMilestones.map((m, idx) => (
                <div key={m.title} className="flex items-center gap-6 group">
                   <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        m.status === 'done' ? 'bg-[#87A237] text-white' : 
                        m.status === 'active' ? 'bg-[#171844] text-white ring-4 ring-indigo-100 scale-110' : 
                        'bg-slate-50 text-slate-300 border border-slate-200'
                      }`}>
                         {m.status === 'done' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                      </div>
                      {idx < mockMilestones.length - 1 && (
                        <div className="w-0.5 h-10 bg-slate-100 mt-2" />
                      )}
                   </div>
                   <div className="flex-1 pb-6 border-b border-slate-50 group-last:border-0">
                      <div className="flex justify-between items-center">
                        <h4 className={`font-bold ${m.status === 'active' ? 'text-[#171844] text-lg' : 'text-slate-500'}`}>
                          {m.title}
                        </h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{m.date}</span>
                      </div>
                      {m.status === 'active' && (
                        <p className="text-sm text-[#0070C0] font-medium mt-1">Current Focus: Finishing hardware mountings on guest floors.</p>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public Activity Feed */}
          <div className="space-y-8">
            <div className="bg-[#171844] rounded-[2.5rem] p-8 text-white shadow-xl">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Activity size={20} className="text-[#87A237]" />
                  Recent Updates
               </h3>
               <div className="space-y-6">
                  {mockPublicFeed.map(item => (
                    <div key={item.action} className="space-y-1">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.user}</p>
                          <span className="text-[9px] text-slate-600 font-bold uppercase">{item.time}</span>
                       </div>
                       <p className="text-sm text-slate-300 font-medium leading-relaxed">{item.action}</p>
                    </div>
                  ))}
               </div>
               <div className="mt-10 pt-6 border-t border-white/10">
                  <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                     Download Weekly Summary
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 text-[#0070C0] rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-[#171844]">Secure Client View</p>
                  <p className="text-[10px] text-slate-400 font-medium">Technical credentials and configuration details are strictly hidden.</p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
