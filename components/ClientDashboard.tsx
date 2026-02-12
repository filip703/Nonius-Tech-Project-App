
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
    <div className="flex flex-col items-center gap-4 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm group transition-all">
      <div className="relative w-28 h-28 md:w-36 md:h-36">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%" cy="50%" r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50%" cy="50%" r={radius}
            className={`${color} fill-none transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={16} className="text-slate-300 md:hidden mb-1" />
          <span className="text-xl md:text-2xl font-black text-[#171844]">{percentage}%</span>
        </div>
      </div>
      <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">{label}</p>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const { id } = useParams();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === id);

  const stats = useMemo(() => {
    if (!project) return null;
    const calcPercent = (items: any[], checkFn: (item: any) => boolean) => {
      if (!items || items.length === 0) return 0;
      return Math.round((items.filter(checkFn).length / items.length) * 100);
    };
    return {
      tv: calcPercent(project.tvConfig?.inventory || [], d => !!d.installed),
      wifi: calcPercent(project.wifiConfig?.inventory || [], d => !!d.ip && d.ip !== '0.0.0.0'),
      network: calcPercent(project.switchingPlan?.switches || [], s => s.backupStatus === 'Success'),
      overall: project.handoverSignedAt ? 100 : (project.updatedAt ? 75 : 10)
    };
  }, [project]);

  if (!project) return <div className="p-20 text-center">Dashboard Not Found</div>;

  const mockMilestones = [
    { title: 'Hardware Staging', date: 'Nov 05', status: 'done' },
    { title: 'On-site Installation', date: 'Nov 20', status: project.handoverSignedAt ? 'done' : 'active' },
    { title: 'Final Acceptance', date: 'Dec 05', status: project.handoverSignedAt ? 'done' : 'pending' },
  ];

  return (
    <div className="min-h-screen bg-[#E9F2F8] pb-20">
      <header className="bg-[#171844] text-white pt-10 pb-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#87A237] text-[10px] font-black uppercase tracking-widest mb-8">
            <ArrowLeft size={14} /> Back to selection
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-[#87A237] flex items-center justify-center shrink-0">
                <Building2 size={32} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-5xl font-black tracking-tight truncate">{project.name}</h1>
                <p className="text-[#87A237] text-[10px] font-bold uppercase tracking-widest mt-1">Live Deployment Status</p>
              </div>
            </div>
            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Overall Readiness</p>
               <p className="text-3xl font-black text-[#87A237] text-center">{stats?.overall}%</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 -mt-10 space-y-8">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <ProgressRing percentage={stats?.tv || 0} color="stroke-[#0070C0]" label="TVs" icon={Tv} />
          <ProgressRing percentage={stats?.wifi || 0} color="stroke-[#87A237]" label="WiFi" icon={Wifi} />
          <ProgressRing percentage={stats?.network || 0} color="stroke-indigo-500" label="Switching" icon={Server} />
          <ProgressRing percentage={100} color="stroke-amber-500" label="Voice" icon={Phone} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-sm">
            <h3 className="text-lg md:text-2xl font-black text-[#171844] mb-8 flex items-center gap-3">
              <Star size={24} className="text-[#87A237]" /> Site Roadmap
            </h3>
            <div className="space-y-6">
              {mockMilestones.map((m, idx) => (
                <div key={idx} className="flex gap-4 md:gap-8">
                   <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${m.status === 'done' ? 'bg-[#87A237] text-white' : m.status === 'active' ? 'bg-[#171844] text-white' : 'bg-slate-100 text-slate-300'}`}>
                         {m.status === 'done' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                      </div>
                      {idx < mockMilestones.length - 1 && <div className="w-[2px] h-full bg-slate-100 mt-2" />}
                   </div>
                   <div className="pb-8">
                      <h4 className={`font-black text-sm md:text-lg ${m.status === 'active' ? 'text-[#171844]' : 'text-slate-400'}`}>{m.title}</h4>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">{m.date}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171844] rounded-[1.5rem] md:rounded-[3rem] p-8 md:p-10 text-white shadow-xl flex flex-col justify-between">
             <div>
                <Activity size={32} className="text-[#87A237] mb-6" />
                <h3 className="text-xl font-black mb-4 uppercase">Site Snapshot</h3>
                <div className="space-y-4 text-sm text-slate-400">
                  <p>• {project.rooms} units validated</p>
                  <p>• VLANs fully segmented</p>
                  <p>• Final documentation pending</p>
                </div>
             </div>
             <button className="w-full mt-10 py-4 bg-[#87A237] text-[#171844] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                Export Site Report
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
