
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
/* Updated icon names for lucide-react compatibility */
import { LayoutDashboard, Network, Users, Search, Bell, Menu, X, Activity, HardDrive, CircleCheck, Tv, Share2, Mic, Phone, Wifi, MonitorPlay, ChevronDown, CircleUser, Save, FolderOpen, Plus, Check, RefreshCw, Server, ShieldCheck, Camera, FileCheck, Tag, PackageX, ExternalLink, UserCog, Building2, Smartphone, Globe } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import ProjectHub from './components/ProjectHub';
import ProjectSetupWizard from './components/ProjectSetupWizard';
import GeminiAssistant from './components/GeminiAssistant';
import NetworkToolkit from './components/NetworkToolkit';
import ActivityFeed from './components/ActivityFeed';
import ClientDashboard from './components/ClientDashboard';
import { ProjectProvider, useProjects } from './contexts/ProjectContext';
import { UserRole, Project, ModuleType, SiteActivity, Technician } from './types';

export const NoniusLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  const dots = [
    'bg-[#171844]', 'bg-[#87A237]', 'bg-[#87A237]', 'bg-[#171844]',
    'bg-[#171844]', 'bg-[#171844]', 'bg-[#87A237]', 'bg-[#171844]',
    'bg-[#171844]', 'bg-[#87A237]', 'bg-[#171844]', 'bg-[#171844]',
    'bg-[#171844]', 'bg-[#87A237]', 'bg-[#87A237]', 'bg-[#171844]'
  ];

  return (
    <div className={`${className} grid grid-cols-4 gap-0.5 p-1 bg-white rounded-xl shadow-sm shrink-0 items-center justify-items-center`}>
      {dots.map((color, i) => (
        <div key={i} className={`w-full aspect-square rounded-full ${color}`} />
      ))}
    </div>
  );
};

const MODULE_ICONS = {
  [ModuleType.TV]: Tv,
  [ModuleType.CAST]: Share2,
  [ModuleType.SIGNAGE]: MonitorPlay,
  [ModuleType.VOICE]: Phone,
  [ModuleType.MOBILE]: Smartphone,
  [ModuleType.WEBAPP]: Globe,
  [ModuleType.INTERNET]: Wifi,
  [ModuleType.RACK]: Server,
  [ModuleType.VLAN]: ShieldCheck,
  [ModuleType.SWITCHING]: Network,
  [ModuleType.PHOTOS]: Camera,
  [ModuleType.HANDOVER]: FileCheck,
  [ModuleType.LABELS]: Tag,
  [ModuleType.RMA]: PackageX,
};

const Sidebar = ({ isOpen, setOpen }: { isOpen: boolean, setOpen: (v: boolean) => void }) => {
  const { activeProject, setActiveProject, currentUser, fieldTechs, setCurrentUser } = useProjects();
  const location = useLocation();
  const [showTechSelector, setShowTechSelector] = useState(false);

  // Group modules
  const selectableSolutions = activeProject?.selectedModules.filter(m => 
    [ModuleType.TV, ModuleType.CAST, ModuleType.SIGNAGE, ModuleType.VOICE, ModuleType.MOBILE, ModuleType.WEBAPP, ModuleType.INTERNET, ModuleType.RACK, ModuleType.VLAN, ModuleType.SWITCHING].includes(m)
  ) || [];

  const coreManagement = activeProject?.selectedModules.filter(m => 
    [ModuleType.PHOTOS, ModuleType.LABELS, ModuleType.RMA, ModuleType.HANDOVER].includes(m)
  ) || [];
  
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#171844] text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 shadow-2xl flex flex-col`}>
      <div className="flex items-center h-24 px-8 border-b border-slate-800">
        <Link to="/" onClick={() => setActiveProject(null)} className="flex items-center gap-4">
           <NoniusLogo className="w-12 h-12" />
           <div className="flex flex-col">
             <span className="font-bold text-xl leading-none tracking-[0.05em]">NONIUS</span>
             <span className="text-[7px] font-bold tracking-[0.15em] text-[#87A237] mt-1 uppercase">Hospitality Technology</span>
           </div>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 absolute right-4">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-6 py-8 space-y-8 overflow-y-auto">
        <div className="space-y-2">
          <p className="px-5 mb-2 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Core Views</p>
          <Link to="/" onClick={() => { setActiveProject(null); setOpen(false); }} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${!activeProject && location.pathname === '/' ? 'bg-[#0070C0] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <FolderOpen size={18} />
            <span className="font-bold text-[11px] tracking-[0.1em]">PROJECT HUB</span>
          </Link>
          {activeProject && (
            <Link to={`/project/${activeProject.id}`} onClick={() => setOpen(false)} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${location.pathname.includes(`/project/${activeProject.id}`) && !location.search.includes('tab') ? 'bg-[#0070C0] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
              <LayoutDashboard size={18} />
              <span className="font-bold text-[11px] tracking-[0.1em]">SITE MONITOR</span>
            </Link>
          )}
        </div>

        {activeProject && (
          <div className="space-y-6 animate-in fade-in">
            {/* TECHNICAL SOLUTIONS */}
            {selectableSolutions.length > 0 && (
              <div className="space-y-2">
                <p className="px-5 mb-2 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Nonius Solutions</p>
                {selectableSolutions.map((moduleType) => {
                  const Icon = MODULE_ICONS[moduleType as keyof typeof MODULE_ICONS];
                  const isActive = new URLSearchParams(location.search).get('tab') === moduleType;
                  return (
                    <Link key={moduleType} to={`/project/${activeProject.id}?tab=${moduleType}`} onClick={() => setOpen(false)} className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl transition-all ${isActive ? 'bg-[#87A237] text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                      {Icon && <Icon size={18} />}
                      <span className="font-bold text-[11px] tracking-[0.1em] uppercase truncate">{moduleType}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* CORE MANAGEMENT TOOLS */}
            <div className="space-y-2">
              <p className="px-5 mb-2 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Core Administration</p>
              {coreManagement.map((moduleType) => {
                const Icon = MODULE_ICONS[moduleType as keyof typeof MODULE_ICONS];
                const isActive = new URLSearchParams(location.search).get('tab') === moduleType;
                return (
                  <Link key={moduleType} to={`/project/${activeProject.id}?tab=${moduleType}`} onClick={() => setOpen(false)} className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl transition-all ${isActive ? 'bg-[#0070C0] text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                    {Icon && <Icon size={18} />}
                    <span className="font-bold text-[11px] tracking-[0.1em] uppercase truncate">{moduleType}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-white/10">
               <Link to={`/client/${activeProject.id}`} className="flex items-center gap-4 px-5 py-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
                 <ExternalLink size={18} className="text-[#87A237]" />
                 <span className="font-black text-[11px] tracking-[0.15em] uppercase">Client Portal</span>
               </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Technician Session Branding */}
      <div className="p-6 mt-auto">
        <div className="relative">
          <button onClick={() => setShowTechSelector(!showTechSelector)} className="w-full p-4 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#87A237] flex items-center justify-center text-white font-black text-sm">
                {currentUser.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate">{currentUser.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <UserCog size={16} className="text-slate-600" />
            </div>
          </button>
          
          {showTechSelector && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-2 overflow-hidden animate-in slide-in-from-bottom-2">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest p-3">Switch Session Identity</p>
              {fieldTechs.map(tech => (
                <button key={tech.id} onClick={() => { setCurrentUser(tech); setShowTechSelector(false); }} className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${currentUser.id === tech.id ? 'bg-[#87A237] text-white' : 'hover:bg-white/5 text-slate-400'}`}>
                  {tech.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const Header = ({ setOpen, onActivityToggle }: { setOpen: (v: boolean) => void, onActivityToggle: () => void }) => {
  const { role, setRole, activeProject, saveProject } = useProjects();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    if (!activeProject) return;
    setSaveStatus('saving');
    saveProject(activeProject);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-10 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button onClick={() => setOpen(true)} className="lg:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"><Menu size={28} /></button>
        {activeProject ? (
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{activeProject.siteId}</div>
             <h2 className="font-bold text-[#171844]">{activeProject.name}</h2>
          </div>
        ) : (
          <div className="relative hidden md:block w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search Site Library..." className="w-full pl-12 pr-6 py-3 bg-[#E9F2F8] border-transparent focus:bg-white focus:border-[#0070C0] focus:ring-4 focus:ring-blue-100 rounded-2xl text-sm font-medium transition-all outline-none" />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        {activeProject && (
          <button onClick={handleSave} disabled={saveStatus !== 'idle'} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-md ${saveStatus === 'saved' ? 'bg-[#87A237] text-white' : 'bg-[#0070C0] text-white'} disabled:opacity-80`}>
            {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={16} /> : <Save size={16} />}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Site'}
          </button>
        )}
        <div className="relative">
          <button onClick={() => setShowRoleSelector(!showRoleSelector)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200">
            <CircleUser size={18} className="text-[#171844]" /> {role} <ChevronDown size={14} />
          </button>
          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[60]">
              {Object.values(UserRole).map((r) => (
                <button key={r} onClick={() => { setRole(r); setShowRoleSelector(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-bold ${role === r ? 'bg-[#0070C0] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{r}</button>
              ))}
            </div>
          )}
        </div>
        <button onBlur={onActivityToggle} onClick={onActivityToggle} className="p-3 text-slate-400 relative"><Bell size={22} /><div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" /></button>
      </div>
    </header>
  );
};

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const { role, isWizardOpen, createNewProject, setIsWizardOpen } = useProjects();
  const navigate = useNavigate();

  const handleSetupComplete = (project: Project) => { createNewProject(project); navigate(`/project/${project.id}`); };

  return (
    <div className="flex min-h-screen">
      {isWizardOpen && <ProjectSetupWizard onComplete={handleSetupComplete} onCancel={() => setIsWizardOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header setOpen={setSidebarOpen} onActivityToggle={() => setActivityOpen(true)} />
        <div className="p-10 flex-1 bg-[#E9F2F8]">
          <Routes>
            <Route path="/" element={<ProjectHub />} />
            <Route path="/project/:id" element={<ProjectDetail role={role} />} />
            <Route path="/client/:id" element={<ClientDashboard />} />
            <Route path="/network" element={<div className="p-20 text-center"><Network size={64} className="mx-auto text-slate-200 mb-4" /><p className="font-bold text-slate-400 uppercase tracking-widest">Global Infrastructure View</p></div>} />
          </Routes>
        </div>
        <GeminiAssistant />
        <NetworkToolkit />
        <ActivityFeed isOpen={activityOpen} onClose={() => setActivityOpen(false)} activities={[]} />
      </main>
    </div>
  );
};

const App = () => (
  <ProjectProvider>
    <HashRouter>
      <AppContent />
    </HashRouter>
  </ProjectProvider>
);

export default App;
