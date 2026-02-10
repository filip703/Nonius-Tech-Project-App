
import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Info, ShieldCheck, ChevronRight, X } from 'lucide-react';

interface ConfigGeneratorProps {
  switchName: string;
  ports: any[];
  onClose: () => void;
}

type Vendor = 'Aruba/HP' | 'Cisco IOS' | 'Ruckus ICX' | 'Mikrotik';

const ConfigGenerator: React.FC<ConfigGeneratorProps> = ({ switchName, ports, onClose }) => {
  const [vendor, setVendor] = useState<Vendor>('Aruba/HP');
  const [copied, setCopied] = useState(false);

  const generateScript = () => {
    let script = `! --- Nonius TechOps Deployment Script ---\n`;
    script += `! Device: ${switchName}\n`;
    script += `! Generated: ${new Date().toLocaleString()}\n`;
    script += `! Vendor Profile: ${vendor}\n\n`;

    if (vendor === 'Aruba/HP') {
      ports.forEach(p => {
        script += `interface ${p.label}\n`;
        if (p.description) script += `  name "${p.description}"\n`;
        if (p.untaggedVlan) script += `  untagged vlan ${p.untaggedVlan}\n`;
        if (p.type === 'Trunk') script += `  tagged vlan 1,500,501,502,503,507\n`;
        script += `  exit\n`;
      });
    } else if (vendor === 'Cisco IOS') {
      script += `configure terminal\n`;
      ports.forEach(p => {
        script += `interface GigabitEthernet${p.label.replace(/\//g, '/0/')}\n`;
        if (p.description) script += `  description ${p.description}\n`;
        if (p.type === 'Trunk') {
          script += `  switchport mode trunk\n`;
          script += `  switchport trunk allowed vlan all\n`;
        } else {
          script += `  switchport mode access\n`;
          script += `  switchport access vlan ${p.untaggedVlan}\n`;
        }
        if (p.snoop === 'TRUST') script += `  ip dhcp snooping trust\n`;
        script += `  spanning-tree portfast\n`;
        script += `  exit\n`;
      });
    } else if (vendor === 'Ruckus ICX') {
      ports.forEach(p => {
        script += `interface ethernet ${p.label}\n`;
        if (p.description) script += `  port-name "${p.description}"\n`;
        if (p.type === 'Access') {
          script += `  vlan-config control\n`;
          script += `  dual-mode ${p.untaggedVlan}\n`;
        } else {
          script += `  vlan-config trunk\n`;
        }
        script += `  inline power\n`;
        script += `!\n`;
      });
    } else if (vendor === 'Mikrotik') {
      script += `/interface bridge vlan\n`;
      ports.forEach(p => {
        script += `add bridge=bridge tagged=${p.label} vlan-ids=500,501,502,503\n`;
      });
    }

    return script;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171844]/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden border border-white/20">
        
        {/* Modal Header */}
        <div className="px-10 py-8 bg-[#171844] text-white flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#87A237] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                 <Terminal size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-bold uppercase tracking-tight">Automated CLI Engine</h2>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Targeting: {switchName}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
           {/* Left Sidebar: Options */}
           <div className="w-72 border-r border-slate-100 p-8 space-y-10 bg-slate-50 overflow-y-auto">
              <div>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ChevronRight size={14} className="text-[#0070C0]" /> Syntax Profile
                 </h3>
                 <div className="space-y-2">
                    {(['Aruba/HP', 'Cisco IOS', 'Ruckus ICX', 'Mikrotik'] as Vendor[]).map(v => (
                       <button
                         key={v}
                         onClick={() => setVendor(v)}
                         className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all border-2 ${
                            vendor === v 
                              ? 'bg-white border-[#0070C0] text-[#0070C0] shadow-md' 
                              : 'border-transparent text-slate-500 hover:bg-slate-200'
                         }`}
                       >
                          {v}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 bg-[#E9F2F8] rounded-3xl space-y-4 border border-blue-100">
                 <div className="flex items-center gap-2 text-[#0070C0]">
                    <ShieldCheck size={18} />
                    <span className="text-[10px] font-black uppercase">VLAN Policy Verified</span>
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Generation uses Nonius Standard VLAN definitions (IPTV: 501, MGMT: 503). Ensure management access via OOB or native VLAN is preserved.
                 </p>
              </div>
           </div>

           {/* Main Content: Script Preview */}
           <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
              <div className="px-8 py-4 bg-black/30 flex items-center justify-between shrink-0">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        copied ? 'bg-[#87A237] text-white' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                       {copied ? <Check size={16} /> : <Copy size={16} />}
                       {copied ? 'Copied CLI' : 'Copy Snippet'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#87A237] text-white rounded-xl text-xs font-bold hover:bg-[#87A237]/90 transition-all">
                       <Download size={16} /> Save .txt
                    </button>
                 </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto font-mono text-[13px] leading-relaxed text-[#87A237] scrollbar-hide">
                 <pre className="whitespace-pre-wrap">{generateScript()}</pre>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigGenerator;
