
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, FolderOpen, ExternalLink, 
  UserCog, Search, Save, RefreshCw, Check, CircleUser, 
  ChevronDown, Bell, Lock, Unlock, ShieldAlert, Github
} from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { NoniusLogo } from '../App';
import { UserRole, ModuleType, Project } from '../types';
import GeminiAssistant from './GeminiAssistant';
import NetworkToolkit from './NetworkToolkit';
import ProjectSetupWizard from './ProjectSetupWizard';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    activeProject, 
    setActiveProject, 
    saveProject, 
    role, 
    setRole, 
    isWizardOpen, 
    setIsWizardOpen, 
    createNewProject 
  } = useProjects();
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [gitStatus, setGitStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [pinInput, setPinInput] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isProjectReadOnly = activeProject?.handoverSignedAt && activeProject?.isLocked;

  const handleSave = () => {
    if (!activeProject || isProjectReadOnly) return;
    setSaveStatus('saving');
    saveProject(activeProject);
    setTimeout(() => {
      setSaveStatus('saved');
      setGitStatus('pending'); // Mark as pending sync to Git after local save
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const handleGitSync = () => {
    if (!activeProject || isProjectReadOnly) return;
    setGitStatus('syncing');
    // Simulate GitHub Push
    setTimeout(() => {
      saveProject({ ...activeProject, lastGitSync: new Date().toISOString() });
      setGitStatus('synced');
    }, 2000);
  };

  const handleUnlock = () => {
    if (pinInput === '2024') {
      if (activeProject) {
        saveProject({ ...activeProject, isLocked: false });
      }
      setShowUnlockModal(false);
      setPinInput('');
    } else {
      alert("Invalid Admin PIN");
    }
  };

  const handleSetupComplete = (project: Project) => {
    createNewProject(project);
    navigate(`/project/${project.id}`);
  };

  const selectableSolutions = activeProject?.selectedModules.filter(m => 
    ![ModuleType.PHOTOS, ModuleType.LABELS, ModuleType.RMA, ModuleType.HANDOVER].includes(m)
  ) || [];

  const coreManagement = activeProject?.selectedModules.filter(m => 
    [ModuleType.PHOTOS, ModuleType.LABELS, ModuleType.RMA, ModuleType.HANDOVER].includes(m)
  ) || [];

  return (
    <div className="flex min-h-screen bg-[#E9F2F8]">
      {/* SETUP WIZARD OVERLAY */}
      {isWizardOpen && (
        <ProjectSetupWizard 
          onComplete={handleSetupComplete} 
          onCancel={() => setIsWizardOpen(false)} 
        />
      )}

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#171844]/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[#171844] text-white transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static flex flex-col shadow-2xl
      `}>
        <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between">
           <Link to="/" onClick={() => { setActiveProject(null); setSidebarOpen(false); }} className="flex items-center gap-3">
             <NoniusLogo className="w-10 h-10" />
             <div className="flex flex-col">
               <span className="font-bold text-lg leading-none tracking-tight">NONIUS</span>
               <span className="text-[6px] font-bold text-[#87A237] uppercase tracking-widest">TechOps Hub</span>
             </div>
           </Link>
           <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
             <X size={24} />
           </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
           <div className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Navigation</p>
              <Link to="/" onClick={() => { setActiveProject(null); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs ${location.pathname === '/' ? 'bg-[#0070C0] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                <FolderOpen size={16} /> PROJECT HUB
              </Link>
           </div>

           {activeProject && (
             <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Site Solutions</p>
                  {selectableSolutions.map(m => (
                    <Link key={m} to={`/project/${activeProject.id}?tab=${m}`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase ${new URLSearchParams(location.search).get('tab') === m ? 'bg-[#87A237] text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                       <span className="w-4 h-4 rounded bg-white/10" /> {m}
                    </Link>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Administrative</p>
                  {coreManagement.map(m => (
                    <Link key={m} to={`/project/${activeProject.id}?tab=${m}`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase ${new URLSearchParams(location.search).get('tab') === m ? 'bg-[#0070C0] text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                       <span className="w-4 h-4 rounded bg-white/10" /> {m}
                    </Link>
                  ))}
                </div>
             </div>
           )}
        </nav>

        <div className="p-6 border-t border-white/5">
           <button onClick={logout} className="w-full p-4 bg-white/5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-all text-left">
              <div className="w-10 h-10 rounded-2xl bg-[#87A237] flex items-center justify-center text-white font-black">
                {user?.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-white">{user?.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Sign Out</p>
              </div>
              <UserCog size={16} className="text-slate-600" />
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-4 md:px-10 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-[#171844]">
                <Menu size={24} />
              </button>
              {activeProject ? (
                <div className="flex items-center gap-3">
                   <div className="hidden sm:block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{activeProject.siteId}</div>
                   <h2 className="font-bold text-[#171844] truncate max-w-[150px] md:max-w-none">{activeProject.name}</h2>
                   
                   {isProjectReadOnly && (
                     <button 
                      onClick={() => setShowUnlockModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-100"
                     >
                       <Lock size={12} /> Project Sealed
                     </button>
                   )}
                </div>
              ) : (
                <div className="hidden sm:flex relative w-64 md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="w-full pl-12 pr-6 py-2.5 bg-slate-50 border-transparent rounded-2xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#0070C0] transition-all" placeholder="Global Site Search..." />
                </div>
              )}
           </div>

           <div className="flex items-center gap-2 md:gap-4">
              {activeProject && !isProjectReadOnly && (
                <div className="flex items-center gap-2">
                   <button 
                    onClick={handleGitSync} 
                    disabled={gitStatus === 'syncing' || gitStatus === 'synced'}
                    title={gitStatus === 'synced' ? 'Manifest matches GitHub' : 'Push changes to GitHub'}
                    className={`p-2.5 rounded-xl transition-all ${
                      gitStatus === 'syncing' ? 'bg-slate-100 text-slate-400 animate-spin' :
                      gitStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-slate-50 text-slate-400'
                    }`}
                   >
                      <Github size={18} />
                   </button>

                   <button onClick={handleSave} disabled={saveStatus !== 'idle'} className={`hidden sm:flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-md ${saveStatus === 'saved' ? 'bg-[#87A237] text-white' : 'bg-[#0070C0] text-white'}`}>
                    {saveStatus === 'saving' ? <RefreshCw size={14} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />}
                    {saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Synced' : 'Save'}
                  </button>
                </div>
              )}

              <div className="relative">
                <button onClick={() => setShowRoleSelector(!showRoleSelector)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-[#171844] rounded-xl text-[10px] font-black uppercase border border-slate-200">
                   <CircleUser size={16} /> <span className="hidden md:inline">{role}</span> <ChevronDown size={12} />
                </button>
                {showRoleSelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[60] animate-in slide-in-from-top-2">
                    {Object.values(UserRole).map((r) => (
                      <button key={r} onClick={() => { setRole(r); setShowRoleSelector(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-bold ${role === r ? 'bg-[#0070C0] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{r}</button>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 p-4 md:p-10 overflow-x-hidden ${isProjectReadOnly ? 'pointer-events-none opacity-80 cursor-not-allowed select-none' : ''}`}>
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </main>

        <GeminiAssistant />
        <NetworkToolkit />
      </div>

      {/* UNLOCK MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171844]/90 backdrop-blur-xl p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center space-y-8">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                 <ShieldAlert size={40} />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-[#171844]">Security Bypass</h3>
                 <p className="text-slate-500 text-sm mt-2">This project is certified and delivered. Enter Admin PIN to modify technical parameters.</p>
              </div>
              <div className="space-y-4">
                 <input 
                   type="password" 
                   maxLength={4}
                   placeholder="••••"
                   className="w-full text-center text-3xl font-black tracking-[1em] py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-[#87A237] outline-none"
                   value={pinInput}
                   onChange={e => setPinInput(e.target.value)}
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowUnlockModal(false)} className="py-4 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    <button onClick={handleUnlock} className="py-4 bg-[#171844] text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">Unlock Project</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
