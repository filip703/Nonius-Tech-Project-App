
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Settings2, 
  CheckSquare, 
  Square, 
  Zap, 
  Info, 
  ShieldCheck, 
  Network,
  ChevronDown,
  LayoutGrid,
  Save,
  MousePointer2,
  Terminal,
  Camera
} from 'lucide-react';
import { UserRole, SwitchEntry } from '../types';
import ConfigGenerator from './ConfigGenerator';
import BarcodeScanner from './BarcodeScanner';

// VLAN Configuration Registry
const VLAN_REGISTRY = [
  { id: 500, name: 'Hotspot', color: 'bg-yellow-400', textColor: 'text-black' },
  { id: 501, name: 'IPTV', color: 'bg-cyan-400', textColor: 'text-black' },
  { id: 502, name: 'VoIP', color: 'bg-emerald-400', textColor: 'text-white' },
  { id: 503, name: 'Management', color: 'bg-purple-500', textColor: 'text-white' },
  { id: 507, name: 'CCTV', color: 'bg-orange-500', textColor: 'text-white' },
  { id: 999, name: 'TRUNK', color: 'bg-red-600', textColor: 'text-white' },
];

const PORT_TYPES = ['Access', 'Trunk'];
const SNOOP_MODES = ['TRUST', 'UNTRUST'];
const STP_MODES = ['802-1w admin-pt2pt', 'admin-edge', 'disabled'];

interface PortConfig {
  id: string;
  label: string;
  description: string;
  snoop: string;
  stp: string;
  type: string;
  untaggedVlan: number;
  taggedVlans: number[];
}

interface SwitchPortConfigProps {
  switchData: SwitchEntry;
  onBack: () => void;
  role: UserRole;
}

const SwitchPortConfig: React.FC<SwitchPortConfigProps> = ({ switchData, onBack, role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  // Initialize 48 copper + 4 SFP ports
  const initialPorts: PortConfig[] = useMemo(() => {
    return Array.from({ length: 52 }).map((_, i) => ({
      id: `p-${i + 1}`,
      label: i < 48 ? `1/1/${i + 1}` : `1/2/${(i - 48) + 1}`,
      description: '',
      snoop: 'TRUST',
      stp: '802-1w admin-pt2pt',
      type: 'Access',
      untaggedVlan: 503,
      taggedVlans: []
    }));
  }, []);

  const [ports, setPorts] = useState<PortConfig[]>(initialPorts);
  const [selectedPortIds, setSelectedPortIds] = useState<Set<string>>(new Set());

  const togglePortSelection = (id: string) => {
    const newSelection = new Set(selectedPortIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedPortIds(newSelection);
  };

  const selectAll = () => {
    if (selectedPortIds.size === ports.length) setSelectedPortIds(new Set());
    else setSelectedPortIds(new Set(ports.map(p => p.id)));
  };

  const applyBulkUpdate = (updates: Partial<PortConfig>) => {
    if (isViewOnly) return;
    setPorts(prev => prev.map(p => 
      selectedPortIds.has(p.id) ? { ...p, ...updates } : p
    ));
  };

  const getVlanStyles = (vlanId: number) => {
    return VLAN_REGISTRY.find(v => v.id === vlanId) || { color: 'bg-slate-200', textColor: 'text-slate-400' };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* Modals */}
      {isGeneratorOpen && (
        <ConfigGenerator 
          switchName={switchData.name} 
          ports={ports} 
          onClose={() => setIsGeneratorOpen(false)} 
        />
      )}

      {/* LEFT SIDEBAR: VLAN LEGEND */}
      <aside className="w-full lg:w-64 space-y-6 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#171844] font-bold text-sm hover:translate-x-1 transition-transform"
        >
          <ArrowLeft size={18} /> Back to Provisioning
        </button>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <LayoutGrid size={14} /> VLAN Legend
          </h3>
          <div className="space-y-2">
            {VLAN_REGISTRY.map(vlan => (
              <div key={vlan.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${vlan.color} shadow-sm shrink-0`} />
                <div>
                  <p className="text-xs font-bold text-[#171844]">{vlan.name}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">ID: {vlan.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#171844] rounded-[2rem] p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Network size={16} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Active Unit</p>
                <p className="text-sm font-bold truncate">{switchData.name}</p>
             </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-white/10">
             <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 uppercase">Model</span>
                <span className="font-bold">{switchData.brandModel}</span>
             </div>
             <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 uppercase">Mng IP</span>
                <span className="font-bold font-mono">{switchData.ipMng}</span>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONFIGURATION AREA */}
      <main className="flex-1 space-y-6">
        
        {/* VISUAL FACEPLATE */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border-4 border-slate-800 overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-2">
            <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-[#87A237]" /> Interactive Hardware Faceplate
            </h4>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-white/20" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Ready</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[#0070C0] shadow-[0_0_8px_rgba(0,112,192,0.5)]" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected</span>
               </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* 48 Copper Ports (2 rows of 24) */}
            <div className="grid grid-cols-24 gap-1.5 flex-1">
              {ports.slice(0, 48).map((port) => {
                const isSelected = selectedPortIds.has(port.id);
                const vlanStyle = getVlanStyles(port.untaggedVlan);
                return (
                  <button
                    key={port.id}
                    onClick={() => togglePortSelection(port.id)}
                    className={`w-full aspect-square rounded-md border-2 relative group transition-all ${
                      isSelected 
                        ? 'border-[#0070C0] scale-110 z-10 shadow-[0_0_15px_rgba(0,112,192,0.4)]' 
                        : 'border-slate-700 hover:border-slate-500'
                    } ${vlanStyle.color}`}
                  >
                    <div className="absolute inset-0 bg-black/10 rounded-sm pointer-events-none" />
                    <span className={`text-[8px] font-black ${vlanStyle.textColor} absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {port.id.split('-')[1]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 4 SFP Ports */}
            <div className="grid grid-cols-2 gap-1.5 w-16 border-l border-slate-700 pl-8">
              {ports.slice(48).map((port) => {
                const isSelected = selectedPortIds.has(port.id);
                const vlanStyle = getVlanStyles(port.untaggedVlan);
                return (
                  <button
                    key={port.id}
                    onClick={() => togglePortSelection(port.id)}
                    className={`w-full aspect-square rounded-md border-2 border-slate-400 flex items-center justify-center relative transition-all ${
                      isSelected 
                        ? 'border-[#0070C0] scale-110 z-10' 
                        : 'hover:border-white'
                    } ${vlanStyle.color}`}
                  >
                     <div className="w-1/2 h-1/2 bg-black/40 rounded-sm" />
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-6 text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] text-center">Copper Interface (RJ45) 10/100/1000 Base-T</p>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center justify-between gap-4">
           <div className="flex gap-3">
              {!isViewOnly && (
                <button 
                  onClick={() => setIsGeneratorOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#171844] text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all"
                >
                  <Terminal size={16} className="text-[#87A237]" />
                  Generate CLI Script
                </button>
              )}
           </div>
           
           {selectedPortIds.size > 0 && !isViewOnly && (
            <div className="animate-in slide-in-from-top-4 duration-300 flex-1 max-w-2xl">
               <div className="bg-[#87A237] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between gap-4 border-2 border-white/20">
                  <div className="flex items-center gap-3 border-r border-white/20 pr-4 shrink-0">
                    <MousePointer2 size={16} />
                    <span className="text-[10px] font-black uppercase">{selectedPortIds.size} Ports Selected</span>
                  </div>

                  <div className="flex gap-3 flex-1 overflow-hidden">
                     <select 
                        className="bg-white/20 border-none rounded-lg px-3 py-1 text-[10px] font-bold focus:ring-0 outline-none w-full"
                        onChange={(e) => applyBulkUpdate({ untaggedVlan: parseInt(e.target.value) })}
                      >
                        <option value="">Set VLAN...</option>
                        {VLAN_REGISTRY.map(v => <option key={v.id} value={v.id} className="text-black">{v.id} - {v.name}</option>)}
                      </select>
                  </div>

                  <button 
                    onClick={() => setSelectedPortIds(new Set())}
                    className="px-3 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-[10px] font-black transition-colors"
                  >
                    Clear
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-hide">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-[#171844] text-white sticky top-0 z-30">
                <tr className="font-black uppercase tracking-[0.1em]">
                  <th className="px-6 py-4 w-12">
                    <button onClick={selectAll} className="text-white hover:text-[#87A237] transition-colors">
                      {selectedPortIds.size === ports.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="px-4 py-4 w-24">Port</th>
                  <th className="px-4 py-4 w-48">Description</th>
                  <th className="px-4 py-4 w-32">DHCP Snoop</th>
                  <th className="px-4 py-4 w-40">STP Protocol</th>
                  <th className="px-4 py-4 w-32">Type</th>
                  <th className="px-4 py-4 w-48">Untagged VLAN</th>
                  <th className="px-4 py-4">Tagged VLANs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ports.map((port, idx) => {
                  const isSelected = selectedPortIds.has(port.id);
                  const vlanStyle = getVlanStyles(port.untaggedVlan);

                  return (
                    <tr key={port.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-6 py-2">
                        <button onClick={() => togglePortSelection(port.id)} className={`${isSelected ? 'text-[#0070C0]' : 'text-slate-300'} transition-colors`}>
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-2 font-black text-[#171844]">{port.label}</td>
                      <td className="px-4 py-2">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-200 outline-none py-1 transition-all"
                          value={port.description}
                          onChange={(e) => {
                            const newPorts = [...ports];
                            newPorts[idx].description = e.target.value;
                            setPorts(newPorts);
                          }}
                          placeholder="Endpoint Description..."
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select 
                          disabled={isViewOnly}
                          className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 font-bold outline-none"
                          value={port.snoop}
                          onChange={(e) => {
                            const newPorts = [...ports];
                            newPorts[idx].snoop = e.target.value;
                            setPorts(newPorts);
                          }}
                        >
                          {SNOOP_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select 
                          disabled={isViewOnly}
                          className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none text-[10px]"
                          value={port.stp}
                          onChange={(e) => {
                            const newPorts = [...ports];
                            newPorts[idx].stp = e.target.value;
                            setPorts(newPorts);
                          }}
                        >
                          {STP_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select 
                          disabled={isViewOnly}
                          className={`rounded-lg px-3 py-1 font-black uppercase text-[9px] border-none outline-none ${port.type === 'Trunk' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}
                          value={port.type}
                          onChange={(e) => {
                            const newPorts = [...ports];
                            newPorts[idx].type = e.target.value;
                            setPorts(newPorts);
                          }}
                        >
                          {PORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm ${vlanStyle.color}`} />
                          <select 
                            disabled={isViewOnly}
                            className="bg-transparent font-bold outline-none"
                            value={port.untaggedVlan}
                            onChange={(e) => {
                              const newPorts = [...ports];
                              newPorts[idx].untaggedVlan = parseInt(e.target.value);
                              setPorts(newPorts);
                            }}
                          >
                            {VLAN_REGISTRY.map(v => <option key={v.id} value={v.id}>{v.id} - {v.name}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-2 italic text-slate-400">
                         {port.type === 'Trunk' ? 'All (Permit)' : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SAVE ACTIONS */}
        <div className="flex justify-end pt-4">
           <button 
             disabled={isViewOnly}
             className="flex items-center gap-3 px-10 py-4 bg-[#171844] text-white rounded-[2rem] font-bold shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
           >
              <Save size={20} /> Commit Port Mappings
           </button>
        </div>
      </main>
    </div>
  );
};

export default SwitchPortConfig;
