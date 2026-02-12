
import React, { useState } from 'react';
import { 
  Hotel, MapPin, Hash, User, ChevronRight, Check, Tv, Share2, 
  Phone, Wifi, MonitorPlay, Server, ShieldCheck, Network, 
  Mail, Users, UserPlus, Trash2, Briefcase, Wrench, ShieldAlert, Building2, Globe, Smartphone, HardHat
} from 'lucide-react';
import { ModuleType, Project, ProjectContact } from '../types';
import { NoniusLogo } from '../App';

interface ProjectSetupWizardProps {
  onComplete: (project: Project) => void;
  onCancel: () => void;
}

const SELECTABLE_SOLUTIONS = [
  { type: ModuleType.TV, icon: Tv, label: 'NTV+', desc: 'Next-gen IPTV & Headend system' },
  { type: ModuleType.CAST, icon: Share2, label: 'Nonius Cast', desc: 'Seamless mobile-to-TV streaming' },
  { type: ModuleType.SIGNAGE, icon: MonitorPlay, label: 'Digital Signage', desc: 'Hotel-wide communication screens' },
  { type: ModuleType.VOICE, icon: Phone, label: 'Voice/VoIP', desc: 'Unified telephony & Guest services' },
  { type: ModuleType.MOBILE, icon: Smartphone, label: 'Mobile App', desc: 'Native iOS/Android guest portal' },
  { type: ModuleType.WEBAPP, icon: Globe, label: 'Webapp', desc: 'Zero-install guest browser app' },
  { type: ModuleType.INTERNET, icon: Wifi, label: 'Internet Access', desc: 'Guest WiFi & Bandwidth management' },
  { type: ModuleType.NETWORK, icon: Network, label: 'Nonius Network', desc: 'Includes Rack, VLANs & Switch Plan' },
];

const ProjectSetupWizard: React.FC<ProjectSetupWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  
  // State for Step 1
  const [siteData, setSiteData] = useState({
    name: '',
    siteId: '',
    address: '',
    rooms: 0,
    pmName: '',
    pmEmail: '',
    pmPhone: '',
    leadTechName: '',
    leadTechPhone: '',
  });
  
  // Installers state with subcontractor flag
  const [installers, setInstallers] = useState<{name: string, isSubcontractor: boolean}[]>([{ name: '', isSubcontractor: false }]);

  // State for Step 2
  const [clientData, setClientData] = useState({
    gm: { name: '', email: '', phone: '' },
    it: { name: '', email: '', phone: '' },
    maintenance: { name: '', email: '', phone: '' },
    onsite: { name: '', email: '', phone: '' },
  });

  // State for Step 3
  const [selectedSolutionTypes, setSelectedSolutionTypes] = useState<ModuleType[]>([]);

  const handleAddInstaller = () => setInstallers([...installers, { name: '', isSubcontractor: false }]);
  const handleRemoveInstaller = (index: number) => setInstallers(installers.filter((_, i) => i !== index));
  const handleInstallerNameChange = (index: number, value: string) => {
    const next = [...installers];
    next[index].name = value;
    setInstallers(next);
  };
  const handleInstallerTypeChange = (index: number, isSub: boolean) => {
    const next = [...installers];
    next[index].isSubcontractor = isSub;
    setInstallers(next);
  };

  const toggleSolution = (type: ModuleType) => {
    setSelectedSolutionTypes(prev => 
      prev.includes(type) ? prev.filter(m => m !== type) : [...prev, type]
    );
  };

  const isStep1Valid = siteData.name && siteData.siteId && siteData.pmName;

  const handleFinish = () => {
    const contacts: ProjectContact[] = [
      { id: 'pm', name: siteData.pmName, email: siteData.pmEmail, mobile: siteData.pmPhone, role: 'Nonius', jobDescription: 'Project Manager' },
      { id: 'lt', name: siteData.leadTechName, email: '', mobile: siteData.leadTechPhone, role: 'Nonius', jobDescription: 'Lead Technician' },
      { id: 'gm', name: clientData.gm.name, email: clientData.gm.email, mobile: clientData.gm.phone, role: 'Client', jobDescription: 'General Manager' },
      { id: 'it', name: clientData.it.name, email: clientData.it.email, mobile: clientData.it.phone, role: 'Client', jobDescription: 'IT Manager' },
      { id: 'mc', name: clientData.maintenance.name, email: clientData.maintenance.email, mobile: clientData.maintenance.phone, role: 'Client', jobDescription: 'Maintenance Chief' },
    ];

    installers.filter(i => i.name).forEach((inst, i) => {
      contacts.push({ 
        id: `inst-${i}`, 
        name: inst.name, 
        email: '', 
        mobile: '', 
        role: inst.isSubcontractor ? 'Third-Party' : 'Nonius', 
        jobDescription: inst.isSubcontractor ? 'Subcontractor Installer' : 'Field Installer' 
      });
    });

    const finalModules: ModuleType[] = [];
    selectedSolutionTypes.forEach(sol => {
      if (sol === ModuleType.NETWORK) {
        finalModules.push(ModuleType.RACK, ModuleType.VLAN, ModuleType.SWITCHING);
      } else {
        finalModules.push(sol);
      }
    });

    finalModules.push(ModuleType.PHOTOS, ModuleType.LABELS, ModuleType.RMA, ModuleType.HANDOVER);

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: siteData.name,
      siteId: siteData.siteId,
      address: siteData.address,
      pm: siteData.pmName,
      countryManager: 'TBD',
      generalManager: clientData.gm.name,
      itManager: clientData.it.name,
      rooms: siteData.rooms,
      category: 'Standard',
      updatedAt: new Date().toISOString(),
      selectedModules: finalModules,
      clientInfo: {
        socialDesignation: siteData.name,
        address: siteData.address,
        website: ''
      },
      contacts,
      documents: []
    };
    onComplete(newProject);
  };

  const steps = [
    { id: 1, label: 'SITE & TEAM', desc: 'Define location & personnel' },
    { id: 2, label: 'CLIENT CONTACTS', desc: 'Key hotel stakeholders' },
    { id: 3, label: 'NONIUS SOLUTIONS', desc: 'Selected products' },
  ];

  return (
    <div className="fixed inset-0 bg-[#171844]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-0 md:p-8 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl md:h-[90vh] rounded-none md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-screen md:min-h-0 animate-in zoom-in-95 duration-300">
        
        {/* SIDEBAR - TOP ON MOBILE */}
        <div className="w-full md:w-80 lg:w-96 bg-[#171844] p-8 md:p-12 text-white flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-white/5">
          <div className="mb-8 md:mb-16 flex justify-between items-center md:block">
            <div className="flex items-center gap-4">
              <NoniusLogo className="w-10 h-10 md:w-12 md:h-12" />
              <div>
                <span className="block font-bold text-lg md:text-xl tracking-tighter leading-none">NONIUS</span>
                <span className="text-[7px] font-bold tracking-[0.2em] text-[#87A237] uppercase">Hospitality Tech</span>
              </div>
            </div>
            <button onClick={onCancel} className="md:hidden text-slate-400 p-2"><Trash2 size={20}/></button>
          </div>

          <div className="flex flex-row md:flex-col justify-between md:justify-center md:space-y-12 mb-8 md:mb-0">
            {steps.map((s, idx) => (
              <div key={s.id} className="relative flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6 group">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs transition-all duration-300 border-2 ${
                  step === s.id 
                    ? 'bg-[#87A237] border-[#87A237] text-white shadow-lg' 
                    : step > s.id 
                    ? 'bg-[#87A237] border-[#87A237] text-white' 
                    : 'bg-transparent border-white/20 text-white/40'
                }`}>
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <div className="text-center md:text-left hidden md:block">
                  <h3 className={`font-black text-xs tracking-widest ${step === s.id ? 'text-white' : 'text-white/40'}`}>{s.label}</h3>
                  <p className={`text-[10px] font-medium mt-1 ${step === s.id ? 'text-slate-400' : 'text-white/20'}`}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto hidden md:block">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                <ShieldAlert className="text-[#87A237] shrink-0" size={20} />
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Site management core modules (Photos, RMA, Labels, Handover) are auto-enabled.
                </p>
             </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-[#F3F4F6] flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-16">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="max-w-3xl mx-auto space-y-6 md:space-y-10 animate-in slide-in-from-right-8 duration-500">
                <section className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200">
                  <h2 className="text-lg md:text-xl font-black text-[#171844] mb-6 flex items-center gap-2">
                    <Building2 className="text-[#0070C0]" size={20} /> Site Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Property Name</label>
                      <input 
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-bold"
                        value={siteData.name}
                        onChange={e => setSiteData({...siteData, name: e.target.value})}
                        placeholder="e.g. Ritz-Carlton Berlin"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NCM ID</label>
                      <input 
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-mono text-sm uppercase"
                        value={siteData.siteId}
                        onChange={e => setSiteData({...siteData, siteId: e.target.value})}
                        placeholder="DE-BER-01"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Count</label>
                      <input 
                        type="number"
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-bold"
                        value={siteData.rooms}
                        onChange={e => setSiteData({...siteData, rooms: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                      <input 
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0]"
                        value={siteData.address}
                        onChange={e => setSiteData({...siteData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200">
                  <h2 className="text-lg md:text-xl font-black text-[#171844] mb-6 flex items-center gap-2">
                    <Users className="text-[#87A237]" size={20} /> Internal Team
                  </h2>
                  <div className="space-y-6">
                    {/* Project Manager */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Manager</label>
                         <input className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Name" value={siteData.pmName} onChange={e => setSiteData({...siteData, pmName: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PM Email</label>
                         <input className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Email" value={siteData.pmEmail} onChange={e => setSiteData({...siteData, pmEmail: e.target.value})} />
                      </div>
                    </div>

                    {/* Tech Lead */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tech Lead</label>
                         <input className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Name" value={siteData.leadTechName} onChange={e => setSiteData({...siteData, leadTechName: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Phone</label>
                         <input className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Phone" value={siteData.leadTechPhone} onChange={e => setSiteData({...siteData, leadTechPhone: e.target.value})} />
                      </div>
                    </div>

                    {/* Installers List */}
                    <div className="pt-4 border-t border-slate-100">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Installers & Subcontractors</label>
                       <div className="space-y-3">
                          {installers.map((inst, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                               <input 
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" 
                                placeholder="Installer Name" 
                                value={inst.name}
                                onChange={e => handleInstallerNameChange(idx, e.target.value)}
                               />
                               <label className={`flex items-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition-all ${inst.isSubcontractor ? 'bg-[#E9F2F8] border-[#0070C0] text-[#0070C0]' : 'bg-white border-slate-200 text-slate-400'}`}>
                                  <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={inst.isSubcontractor} 
                                    onChange={e => handleInstallerTypeChange(idx, e.target.checked)}
                                  />
                                  <HardHat size={16} />
                                  <span className="text-[10px] font-bold uppercase whitespace-nowrap">Subcontractor</span>
                               </label>
                               {installers.length > 1 && (
                                 <button onClick={() => handleRemoveInstaller(idx)} className="p-3 text-slate-300 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all">
                                   <Trash2 size={18} />
                                 </button>
                               )}
                            </div>
                          ))}
                          <button onClick={handleAddInstaller} className="text-[#0070C0] text-xs font-bold flex items-center gap-2 hover:underline p-2">
                             <UserPlus size={16} /> Add Installer
                          </button>
                       </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="max-w-3xl mx-auto space-y-4 md:space-y-8 animate-in slide-in-from-right-8 duration-500">
                {[
                  { id: 'gm' as const, label: 'General Manager', icon: User },
                  { id: 'it' as const, label: 'IT Manager', icon: Network },
                  { id: 'maintenance' as const, label: 'Maintenance Chief', icon: Wrench },
                ].map(contact => (
                  <div key={contact.id} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-[#171844] uppercase tracking-widest mb-4 flex items-center gap-2">
                       <contact.icon className="text-[#0070C0]" size={16} /> {contact.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                         <input 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          value={clientData[contact.id].name}
                          onChange={e => setClientData({...clientData, [contact.id]: {...clientData[contact.id], name: e.target.value}})}
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                         <input 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          value={clientData[contact.id].email}
                          onChange={e => setClientData({...clientData, [contact.id]: {...clientData[contact.id], email: e.target.value}})}
                         />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2">
                   <h2 className="text-2xl md:text-3xl font-black text-[#171844]">Selected Solutions</h2>
                   <p className="text-slate-500 font-medium text-sm md:text-base italic">Initialize technical services scope.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {SELECTABLE_SOLUTIONS.map((sol) => {
                    const Icon = sol.icon;
                    const isSelected = selectedSolutionTypes.includes(sol.type);
                    return (
                      <button
                        key={sol.type}
                        onClick={() => toggleSolution(sol.type)}
                        className={`group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 text-left transition-all duration-300 relative overflow-hidden ${
                          isSelected 
                            ? 'bg-[#171844] border-[#171844] shadow-2xl scale-[1.02]' 
                            : 'bg-white border-slate-200 hover:border-[#87A237]'
                        }`}
                      >
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                          isSelected ? 'bg-[#87A237] text-white' : 'bg-slate-50 text-slate-400'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <p className={`font-black text-base md:text-lg ${isSelected ? 'text-white' : 'text-[#171844]'}`}>{sol.label}</p>
                        <div className={`absolute top-4 right-4 md:top-6 md:right-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#87A237] border-[#87A237] text-[#171844]' : 'border-slate-100 text-transparent'
                        }`}>
                           <Check size={12} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ACTION FOOTER */}
          <div className="h-20 md:h-24 bg-white border-t border-slate-200 px-6 md:px-12 flex items-center justify-between shrink-0 sticky bottom-0">
            <button 
              onClick={step === 1 ? onCancel : () => setStep(step - 1)}
              className="px-4 md:px-8 py-3 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:text-[#171844]"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button 
              onClick={step === 3 ? handleFinish : () => setStep(step + 1)}
              disabled={step === 1 && !isStep1Valid}
              className={`flex items-center gap-3 px-6 md:px-10 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest transition-all ${
                step === 3 ? 'bg-[#87A237] text-white' : 'bg-[#171844] text-white'
              } disabled:opacity-30`}
            >
              {step === 3 ? 'Initialize' : 'Next'}
              {step < 3 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetupWizard;
