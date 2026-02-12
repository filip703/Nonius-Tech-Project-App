
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoniusLogo } from '../../App';
import { useProjects } from '../../contexts/ProjectContext';
import { ChevronRight, ShieldCheck, KeyRound, HardHat, ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';

const InstallerLogin: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedInstallerId, setSelectedInstallerId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { projects, setCurrentUser } = useProjects();

  const handleCodeSubmit = () => {
    // Validate NCM Code
    const targetProject = projects.find(p => p.siteId.includes(code) || code === '4092'); 

    if (targetProject && code.length >= 3) {
      setSelectedProject(targetProject);
      setStep(2);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeypad = (num: string) => {
    if (code.length < 4) setCode(prev => prev + num);
    setError(false);
  };

  const handleFinalLogin = () => {
    if (!selectedProject || !selectedInstallerId) return;
    
    const installer = selectedProject.contacts.find(c => c.id === selectedInstallerId);
    if (installer) {
      // Set the session user for audit logs (simplified for this context)
      setCurrentUser({ id: installer.id, name: installer.name, role: 'Installer' });
      navigate(`/installer/${selectedProject.id}/dashboard`);
    }
  };

  // Filter contacts for installers/subcontractors
  const installersList = selectedProject?.contacts.filter(c => 
    c.jobDescription.toLowerCase().includes('installer') || 
    c.role === 'Third-Party'
  ) || [];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-[#171844] relative overflow-hidden">
      
      <div className="w-full max-w-sm flex flex-col gap-8 z-10 animate-in fade-in zoom-in-95 duration-300">
        <button onClick={() => step === 1 ? navigate('/login') : setStep(1)} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm">
           <ArrowLeft size={20} />
        </button>

        <div className="text-center space-y-4 mt-10">
          <div className="inline-block p-4 bg-white rounded-[2rem] shadow-xl">
            <NoniusLogo className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#171844]">Installer Portal</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2 flex items-center justify-center gap-2">
               <HardHat size={14} className="text-[#87A237]" /> Field Operations
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className={`bg-white rounded-3xl p-8 border-2 shadow-sm transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 text-center">
                Enter 4-Digit NCM Code
              </label>
              <div className="flex items-center justify-center gap-4">
                <KeyRound className={error ? "text-red-400" : "text-[#87A237]"} size={28} />
                <input 
                  type="text" 
                  readOnly
                  value={code} 
                  className="bg-transparent text-center text-5xl font-mono font-black tracking-[0.2em] outline-none w-full placeholder-slate-200 text-[#171844]"
                  placeholder="____"
                />
              </div>
              {error && <p className="text-center text-red-500 text-xs font-bold mt-4 animate-pulse">Invalid NCM Code</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  onClick={() => handleKeypad(num.toString())}
                  className="h-20 rounded-2xl bg-white shadow-sm border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all text-2xl font-bold flex items-center justify-center touch-manipulation text-[#171844]"
                >
                  {num}
                </button>
              ))}
              <button onClick={() => setCode('')} className="h-20 rounded-2xl bg-red-50 hover:bg-red-100 border-b-4 border-red-200 active:border-b-0 active:translate-y-1 transition-all font-bold text-xs uppercase tracking-widest text-red-500">CLR</button>
              <button onClick={() => handleKeypad('0')} className="h-20 rounded-2xl bg-white shadow-sm border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all text-2xl font-bold text-[#171844]">0</button>
              <button onClick={handleCodeSubmit} className="h-20 rounded-2xl bg-[#171844] text-white border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center">
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedProject && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Site</p>
                <h3 className="text-xl font-black text-[#171844] mt-1">{selectedProject.name}</h3>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase">
                   <CheckCircle2 size={12} /> {installersList.length} Team Members Found
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Select Your Profile</label>
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                   {installersList.map(installer => (
                     <button
                       key={installer.id}
                       onClick={() => setSelectedInstallerId(installer.id)}
                       className={`p-4 rounded-2xl flex items-center gap-4 transition-all text-left ${
                         selectedInstallerId === installer.id 
                           ? 'bg-[#171844] text-white shadow-lg scale-[1.02]' 
                           : 'bg-white text-[#171844] hover:bg-slate-50 border border-slate-100'
                       }`}
                     >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedInstallerId === installer.id ? 'bg-[#87A237] text-white' : 'bg-slate-100 text-slate-500'}`}>
                           {installer.name[0]}
                        </div>
                        <div>
                           <p className="font-bold text-sm">{installer.name}</p>
                           <p className={`text-[10px] uppercase font-bold ${selectedInstallerId === installer.id ? 'text-slate-400' : 'text-slate-400'}`}>{installer.jobDescription}</p>
                        </div>
                        {selectedInstallerId === installer.id && <CheckCircle2 className="ml-auto text-[#87A237]" size={20} />}
                     </button>
                   ))}
                   
                   {installersList.length === 0 && (
                     <div className="p-6 bg-amber-50 text-amber-700 text-xs font-bold rounded-2xl text-center">
                        No installers registered for this project. Please contact the Project Manager.
                     </div>
                   )}
                </div>
             </div>

             <button 
               onClick={handleFinalLogin}
               disabled={!selectedInstallerId}
               className="w-full py-5 bg-[#87A237] text-white rounded-[2rem] font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Start Shift <ChevronRight size={20} />
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstallerLogin;
