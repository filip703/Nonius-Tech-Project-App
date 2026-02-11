
import React, { useState } from 'react';
import { 
  Hotel, MapPin, Hash, User, ChevronRight, Check, Tv, Share2, 
  Phone, Wifi, MonitorPlay, Server, ShieldCheck, Network, 
  Mail, Users, UserPlus, Trash2, Briefcase, Wrench, ShieldAlert, Building2, Globe, Smartphone
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
  const [installers, setInstallers] = useState<string[]>(['']);

  // State for Step 2
  const [clientData, setClientData] = useState({
    gm: { name: '', email: '', phone: '' },
    it: { name: '', email: '', phone: '' },
    maintenance: { name: '', email: '', phone: '' },
    onsite: { name: '', email: '', phone: '' },
  });

  // State for Step 3
  const [selectedSolutionTypes, setSelectedSolutionTypes] = useState<ModuleType[]>([]);

  const handleAddInstaller = () => setInstallers([...installers, '']);
  const handleRemoveInstaller = (index: number) => setInstallers(installers.filter((_, i) => i !== index));
  const handleInstallerChange = (index: number, value: string) => {
    const next = [...installers];
    next[index] = value;
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

    installers.filter(Boolean).forEach((name, i) => {
      contacts.push({ id: `inst-${i}`, name, email: '', mobile: '', role: 'Third-Party', jobDescription: 'Installer' });
    });

    // Final mapping of selected solutions to actual modules
    const finalModules: ModuleType[] = [];
    
    selectedSolutionTypes.forEach(sol => {
      if (sol === ModuleType.NETWORK) {
        finalModules.push(ModuleType.RACK, ModuleType.VLAN, ModuleType.SWITCHING);
      } else {
        finalModules.push(sol);
      }
    });

    // Always add core management tools
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
    <div className="fixed inset-0 bg-[#171844]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* LEFT PANEL (30%) */}
        <div className="w-80 md:w-96 bg-[#171844] p-12 text-white flex flex-col shrink-0 border-r border-white/5">
          <div className="mb-16">
            <div className="flex items-center gap-4">
              <NoniusLogo className="w-12 h-12" />
              <div>
                <span className="block font-bold text-xl tracking-tighter leading-none">NONIUS</span>
                <span className="text-[7px] font-bold tracking-[0.2em] text-[#87A237] uppercase">Hospitality Tech</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-12">
            {steps.map((s, idx) => (
              <div key={s.id} className="relative flex items-start gap-6 group">
                {/* Progress Line */}
                {idx < steps.length - 1 && (
                  <div className={`absolute left-[19px] top-10 w-[2px] h-12 ${step > s.id ? 'bg-[#87A237]' : 'bg-white/10'}`} />
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 border-2 ${
                  step === s.id 
                    ? 'bg-[#87A237] border-[#87A237] text-white shadow-lg shadow-green-900/20' 
                    : step > s.id 
                    ? 'bg-[#87A237] border-[#87A237] text-white' 
                    : 'bg-transparent border-white/20 text-white/40'
                }`}>
                  {step > s.id ? <Check size={18} /> : s.id}
                </div>
                
                <div>
                  <h3 className={`font-black text-xs tracking-widest ${step === s.id ? 'text-white' : 'text-white/40'}`}>{s.label}</h3>
                  <p className={`text-[10px] font-medium mt-1 ${step === s.id ? 'text-slate-400' : 'text-white/20'}`}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                <ShieldAlert className="text-[#87A237] shrink-0" size={20} />
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Site management core modules (Photos, RMA, Labels, Handover) are auto-enabled.
                </p>
             </div>
          </div>
        </div>

        {/* RIGHT PANEL (70%) */}
        <div className="flex-1 bg-[#F3F4F6] flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-8 md:p-16">
            
            {/* STEP 1: SITE & INSTALLATION TEAM */}
            {step === 1 && (
              <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-right-8 duration-500">
                <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h2 className="text-xl font-black text-[#171844] mb-6 flex items-center gap-2">
                    <Building2 className="text-[#0070C0]" size={20} /> Site Information
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Property Name</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] transition-all font-bold"
                        value={siteData.name}
                        onChange={e => setSiteData({...siteData, name: e.target.value})}
                        placeholder="e.g. Ritz-Carlton Berlin"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site ID</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-mono text-sm uppercase"
                        value={siteData.siteId}
                        onChange={e => setSiteData({...siteData, siteId: e.target.value})}
                        placeholder="DE-BER-01"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Count</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-bold"
                        value={siteData.rooms}
                        onChange={e => setSiteData({...siteData, rooms: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0]"
                        value={siteData.address}
                        onChange={e => setSiteData({...siteData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h2 className="text-xl font-black text-[#171844] mb-6 flex items-center gap-2">
                    <Users className="text-[#87A237]" size={20} /> Internal Nonius Team
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Manager</label>
                       <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Name" value={siteData.pmName} onChange={e => setSiteData({...siteData, pmName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PM Email</label>
                       <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Email" value={siteData.pmEmail} onChange={e => setSiteData({...siteData, pmEmail: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Technician</label>
                       <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Name" value={siteData.leadTechName} onChange={e => setSiteData({...siteData, leadTechName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tech Phone</label>
                       <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono" placeholder="+49..." value={siteData.leadTechPhone} onChange={e => setSiteData({...siteData, leadTechPhone: e.target.value})} />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Installers</label>
                      <button onClick={handleAddInstaller} className="text-[#0070C0] text-[10px] font-black uppercase flex items-center gap-1 hover:underline">
                        <UserPlus size={14} /> Add Installer
                      </button>
                    </div>
                    <div className="space-y-3">
                      {installers.map((inst, idx) => (
                        <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2">
                           <input 
                            className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                            placeholder="Full Name" 
                            value={inst}
                            onChange={e => handleInstallerChange(idx, e.target.value)}
                           />
                           {installers.length > 1 && (
                             <button onClick={() => handleRemoveInstaller(idx)} className="p-3 text-slate-300 hover:text-red-500">
                               <Trash2 size={18} />
                             </button>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 2: CLIENT CONTACTS */}
            {step === 2 && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl flex items-center gap-6">
                   <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                     <Briefcase size={32} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black">Hotel Stakeholders</h2>
                      <p className="text-blue-100 text-sm">Designate the primary contacts for system handovers and sign-off.</p>
                   </div>
                </div>

                {[
                  { id: 'gm' as const, label: 'General Manager', icon: User },
                  { id: 'it' as const, label: 'IT Manager', icon: Network },
                  { id: 'maintenance' as const, label: 'Maintenance Chief', icon: Wrench },
                  { id: 'onsite' as const, label: 'On-Site Primary Contact', icon: UserPlus },
                ].map(contact => (
                  <div key={contact.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-[#171844] uppercase tracking-widest mb-6 flex items-center gap-2">
                       <contact.icon className="text-[#0070C0]" size={16} /> {contact.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                         <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          value={clientData[contact.id].name}
                          onChange={e => setClientData({...clientData, [contact.id]: {...clientData[contact.id], name: e.target.value}})}
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                         <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          value={clientData[contact.id].email}
                          onChange={e => setClientData({...clientData, [contact.id]: {...clientData[contact.id], email: e.target.value}})}
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile / Extension</label>
                         <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          value={clientData[contact.id].phone}
                          onChange={e => setClientData({...clientData, [contact.id]: {...clientData[contact.id], phone: e.target.value}})}
                         />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: SOLUTION SCOPE */}
            {step === 3 && (
              <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-black text-[#171844]">Select Nonius Solutions</h2>
                   <p className="text-slate-500 font-medium italic">Configure the technical ecosystem for this property.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SELECTABLE_SOLUTIONS.map((sol) => {
                    const Icon = sol.icon;
                    const isSelected = selectedSolutionTypes.includes(sol.type);
                    return (
                      <button
                        key={sol.type}
                        onClick={() => toggleSolution(sol.type)}
                        className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all duration-300 relative overflow-hidden ${
                          isSelected 
                            ? 'bg-[#171844] border-[#171844] shadow-2xl scale-[1.02]' 
                            : 'bg-white border-slate-200 hover:border-[#87A237]'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                          isSelected ? 'bg-[#87A237] text-white' : 'bg-slate-50 text-slate-400'
                        }`}>
                          <Icon size={28} />
                        </div>
                        
                        <p className={`font-black text-lg ${isSelected ? 'text-white' : 'text-[#171844]'}`}>
                           {sol.label}
                        </p>
                        <p className={`text-[10px] mt-2 font-medium ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                           {sol.desc}
                        </p>

                        <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#87A237] border-[#87A237] text-[#171844]' : 'border-slate-100 text-transparent'
                        }`}>
                           <Check size={14} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ACTION FOOTER */}
          <div className="h-24 bg-white border-t border-slate-200 px-12 flex items-center justify-between shrink-0">
            <button 
              onClick={step === 1 ? onCancel : () => setStep(step - 1)}
              className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#171844] transition-colors"
            >
              {step === 1 ? 'Cancel Setup' : 'Back'}
            </button>
            
            <button 
              onClick={step === 3 ? handleFinish : () => setStep(step + 1)}
              disabled={step === 1 && !isStep1Valid}
              className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 ${
                step === 3 
                  ? 'bg-[#87A237] text-white hover:scale-105 active:scale-95' 
                  : 'bg-[#171844] text-white hover:opacity-95'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {step === 3 ? 'Initialize Project Hub' : 'Continue'}
              {step < 3 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetupWizard;
