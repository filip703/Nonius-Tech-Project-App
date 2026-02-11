
import React, { useMemo } from 'react';
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
  Activity,
  ArrowLeft,
  Tv,
  Wifi,
  Smartphone,
  Phone,
  Server
} from 'lucide-react';
import { Project, ModuleType, DeploymentStatus } from '../types';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

const ProgressRing = ({ percentage, color, label, icon: Icon }: { percentage: number, color: string, label: string, icon: any }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-[#0070C0] transition-all">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="72" cy="72" r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth="10"
          />
          <circle
            cx="72" cy="72" r={radius}
            className={`${color} fill-none transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-1 group-hover:bg-[#E9F2F8] group-hover:text-[#0070C0] transition-colors">
            <Icon size={20} className="text-slate-400 group-hover:text-[#0070C0]" />
          </div>
          <span className="text-2xl font-black text-[#171844]">{percentage}%</span>
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const { id } = useParams();
  const { projects } = useProjects();
  const { user } = useAuth();
  const project = projects.find(p => p.id === id);

  const stats = useMemo(() => {
    if (!project) return null;

    const calcPercent = (items: any[], checkFn: (item: any) => boolean) => {
      if (!items || items.length === 0) return 0;
      const count = items.filter(checkFn).length;
      return Math.round((count / items.length) * 100);
    };

    return {
      tv: calcPercent(project.tvConfig?.inventory || [], d => !!d.installed),
      wifi: calcPercent(project.wifiConfig?.inventory || [], d => !!d.ip && d.ip !== '0.0.0.0'),
      network: calcPercent(project.switchingPlan?.switches || [], s => s.backupStatus === 'Success'),
      overall: project.handoverSignedAt ? 100 : (project.updatedAt ? 75 : 10)
    };
  }, [project]);

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
    { title: 'On-site Installation', date: 'Nov 20', status: project.handoverSignedAt ? 'done' : 'active' },
    { title: 'Final QA & Acceptance', date: 'Dec 05', status: project.handoverSignedAt ? 'done' : 'pending' },
  ];

  return (
    <div className="min-h-screen bg-[#E9F2F8] pb-20">
      {/* Client Header */}
      <header className="bg-[#171844] text-white py-16 px-10">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#87A237] text-xs font-black uppercase tracking-widest mb-10 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2.5rem] bg-[#87A237] flex items-center justify-center shadow-2xl animate-pulse">
                <Building2 size={40} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#87A237] uppercase tracking-[0.4em] mb-2">Stakeholder Oversight</p>
                <h1 className="text-5xl font-black tracking-tighter">{project.name}</h1>
                <div className="flex flex-wrap items-center gap-6 mt-4 text-slate-400 text-sm font-bold">
                   <span className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10"><Calendar size={16} className="text-[#87A237]" /> Est. Handover: Q4 2024</span>
                   <span className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10"><Users size={16} className="text-[#87A237]" /> Lead PM: {project.pm}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="px-8 py-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md text-center min-w-[180px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Site Readiness</p>
                  <p className="text-4xl font-black text-[#87A237]">{stats?.overall}%</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 -mt-12 space-y-12">
        {/* Module Progress Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProgressRing percentage={stats?.tv || 0} color="stroke-[#0070C0]" label="Guest TV Units" icon={Tv} />
          <ProgressRing percentage={stats?.wifi || 0} color="stroke-[#87A237]" label="WiFi Network" icon={Wifi} />
          <ProgressRing percentage={stats?.network || 0} color="stroke-indigo-500" label="Core Infra" icon={Server} />
          <ProgressRing percentage={project.voiceConfig ? 100 : 0} color="stroke-amber-500" label="Guest Voice" icon={Phone} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Milestone Timeline */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-10">
            <h3 className="text-2xl font-black text-[#171844] flex items-center gap-3">
              <Star size={32} className="text-[#87A237]" />
              Property Roadmap & Milestones
            </h3>
            <div className="space-y-8">
              {mockMilestones.map((m, idx) => (
                <div key={m.title} className="flex items-start gap-8 group">
                   <div className="flex flex-col items-center shrink-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                        m.status === 'done' ? 'bg-[#87A237] text-white shadow-green-100' : 
                        m.status === 'active' ? 'bg-[#171844] text-white ring-8 ring-indigo-50 scale-110' : 
                        'bg-slate-50 text-slate-300 border border-slate-200'
                      }`}>
                         {m.status === 'done' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                      </div>
                      {idx < mockMilestones.length - 1 && (
                        <div className="w-[2px] h-12 bg-slate-100 mt-4" />
                      )}
                   </div>
                   <div className="flex-1 pb-10 border-b border-slate-50 group-last:border-0 pt-2">
                      <div className="flex justify-between items-center">
                        <h4 className={`font-black tracking-tight ${m.status === 'active' ? 'text-[#171844] text-2xl' : 'text-slate-400 text-lg'}`}>
                          {m.title}
                        </h4>
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{m.date}</span>
                      </div>
                      {m.status === 'active' && (
                        <p className="text-sm text-[#0070C0] font-bold mt-2 flex items-center gap-2">
                           <Activity size={14} className="animate-pulse" /> 
                           Technicians are currently validating final configuration on guest floors.
                        </p>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Site Highlights / Side Info */}
          <div className="space-y-8">
            <div className="bg-[#171844] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#87A237]/10 rounded-full blur-3xl -mr-16 -mt-16" />
               <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <Activity size={24} className="text-[#87A237]" />
                  Site Highlights
               </h3>
               <div className="space-y-8">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-[#87A237]" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-[#87A237] uppercase tracking-widest">Inventory Log</p>
                        <p className="text-sm text-slate-300 mt-1 font-medium">{project.rooms} rooms certified for TV & WiFi.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <ShieldCheck size={18} className="text-[#87A237]" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-[#87A237] uppercase tracking-widest">Security Audit</p>
                        <p className="text-sm text-slate-300 mt-1 font-medium">All VLANs segmented according to brand standard.</p>
                     </div>
                  </div>
               </div>
               
               <div className="mt-12 pt-8 border-t border-white/10">
                  <button className="w-full py-5 bg-[#87A237] text-[#171844] rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl">
                     Export Property Status Report
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-[#0070C0] rounded-2xl flex items-center justify-center shrink-0">
                     <Users size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Need Assistance?</p>
                     <p className="text-sm font-bold text-[#171844]">Contact Your Nonius PM</p>
                  </div>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                  "We are committed to ensuring a seamless guest experience. This dashboard provides you with direct transparency into our installation progress."
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
