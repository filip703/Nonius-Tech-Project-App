
import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  X, 
  Calculator, 
  Search, 
  Cpu, 
  Network, 
  Copy, 
  ChevronRight,
  Info
} from 'lucide-react';

const MAC_DICTIONARY: Record<string, string> = {
  '00:1A:2B': 'Nonius Software / Gateway',
  '00:0B:82': 'Grandstream Networks',
  '00:26:BB': 'Samsung Electronics',
  'BC:D1:D3': 'LG Electronics',
  '00:19:92': 'Ruckus Wireless',
  '2C:33:11': 'Cisco Systems',
  'E4:E4:AB': 'Apple Inc.',
  '74:AC:B9': 'TP-Link Corporation',
  '00:1B:17': 'HPE / Aruba Networking'
};

const CIDR_MAP: Record<number, string> = {
  32: '255.255.255.255',
  31: '255.255.255.254',
  30: '255.255.255.252',
  29: '255.255.255.248',
  28: '255.255.255.240',
  27: '255.255.255.224',
  26: '255.255.255.192',
  25: '255.255.255.128',
  24: '255.255.255.0',
  23: '255.255.254.0',
  22: '255.255.252.0',
  21: '255.255.248.0',
  20: '255.255.240.0',
  16: '255.255.0.0',
  8: '255.0.0.0'
};

const NetworkToolkit: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'subnet' | 'mac'>('subnet');

  // Subnet Calc State
  const [ip, setIp] = useState('192.168.1.1');
  const [cidr, setCidr] = useState(24);

  // MAC State
  const [macQuery, setMacQuery] = useState('');

  const subnetResult = useMemo(() => {
    // Simplified logic for calculation presentation
    const mask = CIDR_MAP[cidr] || '255.255.255.0';
    const hosts = Math.pow(2, 32 - cidr) - 2;
    const baseIp = ip.split('.').slice(0, 3).join('.');
    return {
      mask,
      network: `${baseIp}.0`,
      broadcast: `${baseIp}.255`,
      hosts: hosts < 0 ? 0 : hosts,
      range: `${baseIp}.1 - ${baseIp}.${254}`
    };
  }, [ip, cidr]);

  const macResult = useMemo(() => {
    if (macQuery.length < 8) return null;
    const prefix = macQuery.substring(0, 8).toUpperCase().replace(/-/g, ':');
    return MAC_DICTIONARY[prefix] || 'Vendor Not Found';
  }, [macQuery]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 w-14 h-14 bg-[#171844] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40 border-2 border-white/20 group"
      >
        <Wrench size={24} className="group-hover:rotate-45 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#87A237] rounded-full border-2 border-[#171844]"></div>
      </button>

      {/* Drawer Overlay */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        
        <aside className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#171844] text-white shadow-2xl transition-transform duration-500 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-[#87A237] flex items-center justify-center">
                    <Wrench size={20} />
                 </div>
                 <h2 className="text-xl font-bold uppercase tracking-tight">Technical Toolkit</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Tab Selector */}
              <div className="flex p-1 bg-white/5 rounded-2xl">
                 <button 
                   onClick={() => setActiveTab('subnet')}
                   className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'subnet' ? 'bg-white text-[#171844] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                 >
                   SUBNET CALC
                 </button>
                 <button 
                   onClick={() => setActiveTab('mac')}
                   className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'mac' ? 'bg-white text-[#171844] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                 >
                   MAC LOOKUP
                 </button>
              </div>

              {activeTab === 'subnet' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base IP Address</label>
                         <input 
                           className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#87A237] font-mono text-sm"
                           value={ip}
                           onChange={e => setIp(e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CIDR</label>
                         <select 
                           className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#87A237] text-sm"
                           value={cidr}
                           onChange={e => setCidr(parseInt(e.target.value))}
                         >
                           {[32, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 16, 8].map(c => <option key={c} value={c} className="text-black">/{c}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-3 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#87A237]/30 transition-colors">
                         <div className="flex items-center gap-3">
                            <Network size={16} className="text-[#87A237]" />
                            <span className="text-xs font-bold text-slate-400">Netmask</span>
                         </div>
                         <span className="font-mono text-sm font-bold">{subnetResult.mask}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3">
                            <Network size={16} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-400">Network ID</span>
                         </div>
                         <span className="font-mono text-sm">{subnetResult.network}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3">
                            <Network size={16} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-400">Broadcast</span>
                         </div>
                         <span className="font-mono text-sm">{subnetResult.broadcast}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#87A237]/10 rounded-2xl border border-[#87A237]/20">
                         <div className="flex items-center gap-3">
                            <Calculator size={16} className="text-[#87A237]" />
                            <span className="text-xs font-bold text-[#87A237]">Usable Hosts</span>
                         </div>
                         <span className="font-bold text-sm">{subnetResult.hosts.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'mac' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MAC Address / OUI</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#87A237] font-mono text-sm tracking-wider uppercase"
                          value={macQuery}
                          onChange={e => setMacQuery(e.target.value)}
                          placeholder="00:1A:2B:..."
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 italic pl-1">Supports formats: 00:00:00 or 00-00-00</p>
                   </div>

                   {macResult && (
                     <div className="p-8 bg-[#87A237] text-[#171844] rounded-[2rem] shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-[#171844]/10 flex items-center justify-center">
                              <Cpu size={24} />
                           </div>
                           <h4 className="font-black text-xs uppercase tracking-[0.2em]">OUI Identified</h4>
                        </div>
                        <p className="text-2xl font-black leading-tight">{macResult}</p>
                        <div className="pt-4 border-t border-[#171844]/10 flex justify-between items-center">
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Database: Nonius Global v2.4</span>
                           <button className="p-2 hover:bg-white/20 rounded-lg transition-colors"><Copy size={16}/></button>
                        </div>
                     </div>
                   )}

                   {!macResult && macQuery.length >= 8 && (
                      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
                         <Info size={20} />
                         <p className="text-xs font-bold">Prefix not in local high-density cache.</p>
                      </div>
                   )}
                </div>
              )}
           </div>

           <div className="p-8 bg-white/5 border-t border-white/10 flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <span>Nonius TechOps Helper</span>
              <span className="flex items-center gap-1">v4.0.2 <ChevronRight size={10} /></span>
           </div>
        </aside>
      </div>
    </>
  );
};

export default NetworkToolkit;
