
import React, { useState } from 'react';
import { Hotel, MapPin, Hash, User, ChevronRight, Check, Tv, Share2, Mic, Phone, Wifi, MonitorPlay, Briefcase, Globe, Server, ShieldCheck, Network, Building2 } from 'lucide-react';
import { ModuleType, Project } from '../types';
import { NoniusLogo } from '../App';

interface SetupWizardProps {
  onComplete: (project: Project) => void;
}

const MODULE_ICONS = {
  [ModuleType.TV]: Tv,
  [ModuleType.CAST]: Share2,
  [ModuleType.SIGNAGE]: MonitorPlay,
  [ModuleType.VOICE]: Phone,
  [ModuleType.MOBILE]: Phone,
  [ModuleType.INTERNET]: Wifi,
  [ModuleType.RACK]: Server,
  [ModuleType.VLAN]: ShieldCheck,
  [ModuleType.SWITCHING]: Network,
};

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [siteInfo, setSiteInfo] = useState({
    name: '',
    siteId: '',
    address: '',
    pm: '',
    countryManager: '',
    generalManager: '',
    itManager: '',
    rooms: 0,
    category: 'Business Hotel',
    website: ''
  });
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);

  const toggleModule = (module: ModuleType) => {
    setSelectedModules(prev => 
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const handleFinish = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: siteInfo.name,
      siteId: siteInfo.siteId,
      address: siteInfo.address,
      pm: siteInfo.pm,
      countryManager: siteInfo.countryManager,
      generalManager: siteInfo.generalManager,
      itManager: siteInfo.itManager,
      rooms: siteInfo.rooms,
      category: siteInfo.category,
      updatedAt: new Date().toISOString(),
      selectedModules,
      clientInfo: {
        socialDesignation: siteInfo.name,
        address: siteInfo.address,
        website: siteInfo.website
      },
      contacts: [
        { id: '1', name: siteInfo.pm, jobDescription: 'Project Manager', email: '', mobile: '', role: 'Nonius' },
        { id: '2', name: siteInfo.itManager, jobDescription: 'IT Contact', email: '', mobile: '', role: 'Client' }
      ],
      documents: []
    };
    onComplete(newProject);
  };

  return (
    <div className="fixed inset-0 bg-[#171844]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-80 bg-[#171844] p-10 text-white flex flex-col justify-between border-r border-white/10">
            <div>
              <div className="flex items-center gap-4 mb-12">
                <NoniusLogo className="w-12 h-12" />
                <div className="flex flex-col">
                   <span className="font-bold text-lg leading-none tracking-[0.05em]">NONIUS</span>
                   <span className="text-[6px] font-bold tracking-[0.1em] text-[#87A237] mt-0.5 uppercase">Hospitality Technology</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Project Setup</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Define site governance and technical scope to initialize the workspace.
              </p>
            </div>

            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    step === i ? 'bg-[#87A237] text-white' : step > i ? 'bg-white text-[#171844]' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {step > i ? <Check size={14} /> : i}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${step === i ? 'text-white' : 'text-slate-500'}`}>
                    {i === 1 ? 'Site Details' : 'Solutions'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-12 flex flex-col overflow-y-auto bg-white">
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-[#171844] mb-1">Site & Personnel Info</h3>
                  <p className="text-slate-500 text-sm">Define key individuals for project governance.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Property Name</label>
                    <div className="relative">
                      <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none" value={siteInfo.name} onChange={e => setSiteInfo({...siteInfo, name: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Site ID</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none" value={siteInfo.siteId} onChange={e => setSiteInfo({...siteInfo, siteId: e.target.value})} placeholder="e.g. DE-BER-01" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rooms Count</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none font-bold" value={siteInfo.rooms} onChange={e => setSiteInfo({...siteInfo, rooms: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nonius Country Mgr (NCM)</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none" value={siteInfo.countryManager} onChange={e => setSiteInfo({...siteInfo, countryManager: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IT Manager Name</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none" value={siteInfo.itManager} onChange={e => setSiteInfo({...siteInfo, itManager: e.target.value})} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hotel General Manager</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none" value={siteInfo.generalManager} onChange={e => setSiteInfo({...siteInfo, generalManager: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-[#171844] mb-1">Solution Selection</h3>
                  <p className="text-slate-500 text-sm">Select products to provision in this workspace.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.values(ModuleType).map((module) => {
                    const Icon = MODULE_ICONS[module];
                    const isSelected = selectedModules.includes(module);
                    return (
                      <button
                        key={module}
                        onClick={() => toggleModule(module)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected ? 'border-[#0070C0] bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#0070C0] text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {Icon && <Icon size={20} />}
                        </div>
                        <div>
                          <p className={`font-bold text-xs ${isSelected ? 'text-[#0070C0]' : 'text-[#171844]'}`}>
                            {module}
                          </p>
                        </div>
                        {isSelected && <Check className="ml-auto text-[#0070C0]" size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center">
              {step > 1 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-[#171844]"
                >
                  Back
                </button>
              ) : <div></div>}
              
              <button 
                onClick={step === 2 ? handleFinish : () => setStep(step + 1)}
                disabled={step === 1 && (!siteInfo.name || !siteInfo.siteId)}
                className="px-8 py-3 bg-[#171844] text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:opacity-95 disabled:opacity-30"
              >
                {step === 2 ? 'Complete Setup' : 'Continue'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
