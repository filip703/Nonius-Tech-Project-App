
import React, { useState } from 'react';
import { Network, Database, Shield, Radio, Plus, Trash2, Copy, Eye, EyeOff, CircleCheck, TriangleAlert, CloudDownload, MapPin, Hash, Settings2, Camera } from 'lucide-react';
import { Project, SwitchEntry, UserRole } from '../types';
import { IP_REGEX, MAC_REGEX } from '../constants';
import SwitchPortConfig from './SwitchPortConfig';
import BarcodeScanner from './BarcodeScanner';

interface SwitchingPlanProps {
  project: Project;
  onUpdate: (config: { switches: SwitchEntry[] }) => void;
  role: UserRole;
}

const SwitchingPlan: React.FC<SwitchingPlanProps> = ({ project, onUpdate, role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const [showPasswords, setShowPasswords] = useState<string[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [scannerConfig, setScannerConfig] = useState<{ id: string, type: 'MAC' | 'SN' } | null>(null);
  
  const config = project.switchingPlan || { switches: [] };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const updateSwitch = (id: string, updates: Partial<SwitchEntry>) => {
    if (isViewOnly) return;
    const newSwitches = config.switches.map(s => s.id === id ? { ...s, ...updates } : s);
    onUpdate({ switches: newSwitches });
  };

  const addRow = () => {
    if (isViewOnly) return;
    const newSwitch: SwitchEntry = {
      id: `sw-${Date.now()}`, location: '', name: '', label: '', ipMng: '', ipIptv: '', mac: '', user: 'admin', pass: '', brandModel: 'ICX8200-48P', partNumber: '', serialNumber: '', firmware: '', backupStatus: 'Pending'
    };
    onUpdate({ switches: [newSwitch, ...config.switches] });
  };

  const cloneRow = (row: SwitchEntry) => {
    if (isViewOnly) return;
    const cloned: SwitchEntry = {
      ...row,
      id: `sw-${Date.now()}`,
      name: `${row.name} (Copy)`,
      serialNumber: '',
      mac: '',
      ipMng: '',
      ipIptv: '',
    };
    onUpdate({ switches: [cloned, ...config.switches] });
  };

  const removeRow = (id: string) => {
    if (isViewOnly) return;
    onUpdate({ switches: config.switches.filter(s => s.id !== id) });
  };

  const activeSwitch = config.switches.find(s => s.id === activeConfigId);

  if (activeConfigId && activeSwitch) {
    return <SwitchPortConfig switchData={activeSwitch} onBack={() => setActiveConfigId(null)} role={role} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Scanner Modal Overlay */}
      {scannerConfig && (
        <BarcodeScanner 
          type={scannerConfig.type}
          onClose={() => setScannerConfig(null)}
          onScan={(val) => {
            const updates = scannerConfig.type === 'MAC' ? { mac: val } : { serialNumber: val };
            updateSwitch(scannerConfig.id, updates);
          }}
        />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
         <div>
            <h2 className="text-2xl font-bold text-[#171844]">Switching Infrastructure Plan</h2>
            <p className="text-sm text-slate-500 font-medium">Physical hardware inventory and L2 management addressing</p>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
               <CloudDownload size={16} /> <span className="hidden lg:inline">Bulk Import</span>
            </button>
            {!isViewOnly && (
              <button 
                onClick={addRow}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[#0070C0] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100"
              >
                <Plus size={18} /> Add Switch
              </button>
            )}
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-[11px] table-fixed min-w-[2100px]">
            <thead className="bg-[#171844] text-white">
              <tr className="font-black uppercase tracking-[0.1em]">
                <th className="px-6 py-5 w-48 sticky left-0 z-20 bg-[#171844]">Switch Name</th>
                <th className="px-6 py-5 w-24">Config</th>
                <th className="px-6 py-5 w-40">Location</th>
                <th className="px-6 py-5 w-40">Device Label</th>
                <th className="px-6 py-5 w-40">IP Management</th>
                <th className="px-6 py-5 w-40">IP IPTV</th>
                <th className="px-6 py-5 w-48">MAC Address</th>
                <th className="px-6 py-5 w-32">Username</th>
                <th className="px-6 py-5 w-40">Password</th>
                <th className="px-6 py-5 w-48">Brand & Model</th>
                <th className="px-6 py-5 w-40">Part Number</th>
                <th className="px-6 py-5 w-48">Serial Number</th>
                <th className="px-6 py-5 w-32">Firmware</th>
                <th className="px-6 py-5 w-32 text-center">Backup</th>
                {!isViewOnly && <th className="px-6 py-5 w-24 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.switches.map((sw) => {
                const isIpValid = IP_REGEX.test(sw.ipMng);
                const isMacValid = MAC_REGEX.test(sw.mac);
                const pwVisible = showPasswords.includes(sw.id);

                return (
                  <tr key={sw.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                      <input disabled={isViewOnly} className="w-full bg-transparent font-black text-[#171844] outline-none text-xs" value={sw.name} placeholder="SW-CORE-01" onChange={e => updateSwitch(sw.id, { name: e.target.value })} />
                    </td>
                    <td className="px-6 py-3">
                      <button 
                        onClick={() => setActiveConfigId(sw.id)}
                        className="p-2 bg-blue-50 text-[#0070C0] rounded-lg hover:bg-[#0070C0] hover:text-white transition-all shadow-sm group/btn"
                        title="Configure Ports"
                      >
                         <Settings2 size={16} className="group-hover/btn:rotate-90 transition-transform" />
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                         <MapPin size={12} className="shrink-0" />
                         <input disabled={isViewOnly} className="w-full bg-transparent outline-none" value={sw.location} placeholder="Rack A" onChange={e => updateSwitch(sw.id, { location: e.target.value })} />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <input disabled={isViewOnly} className="w-full bg-transparent outline-none font-bold" value={sw.label} placeholder="Label ID" onChange={e => updateSwitch(sw.id, { label: e.target.value })} />
                    </td>
                    <td className="px-6 py-3">
                      <input 
                        disabled={isViewOnly} 
                        className={`w-full bg-transparent outline-none font-mono text-[10px] ${isIpValid ? 'text-[#0070C0]' : 'text-red-500 font-bold'}`} 
                        value={sw.ipMng} 
                        placeholder="10.10.x.x" 
                        onChange={e => updateSwitch(sw.id, { ipMng: e.target.value })} 
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input disabled={isViewOnly} className="w-full bg-transparent outline-none font-mono text-[10px]" value={sw.ipIptv} placeholder="10.20.x.x" onChange={e => updateSwitch(sw.id, { ipIptv: e.target.value })} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 group/field">
                        <input 
                          disabled={isViewOnly} 
                          className={`w-full bg-transparent outline-none font-mono text-[10px] ${isMacValid ? 'text-slate-600' : 'text-red-500 font-bold'}`} 
                          value={sw.mac} 
                          placeholder="XX:XX:XX:XX:XX:XX" 
                          onChange={e => updateSwitch(sw.id, { mac: e.target.value })} 
                        />
                        {!isViewOnly && (
                          <button onClick={() => setScannerConfig({ id: sw.id, type: 'MAC' })} className="text-slate-300 hover:text-[#0070C0] opacity-0 group-hover/field:opacity-100 transition-opacity">
                            <Camera size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      <input disabled={isViewOnly} className="w-full bg-transparent outline-none font-bold" value={sw.user} onChange={e => updateSwitch(sw.id, { user: e.target.value })} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 group/pw">
                         <input 
                          disabled={isViewOnly}
                          type={pwVisible ? 'text' : 'password'}
                          className="w-full bg-transparent outline-none font-mono"
                          value={sw.pass}
                          onChange={e => updateSwitch(sw.id, { pass: e.target.value })}
                          placeholder="••••••••"
                         />
                         <button onClick={() => togglePassword(sw.id)} className="opacity-0 group-hover/pw:opacity-100 text-slate-300 hover:text-[#0070C0] transition-opacity">
                            {pwVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                         </button>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <select disabled={isViewOnly} className="w-full bg-transparent outline-none font-bold" value={sw.brandModel} onChange={e => updateSwitch(sw.id, { brandModel: e.target.value })}>
                        <option>ICX8200-48P</option>
                        <option>ICX8200-24P</option>
                        <option>ICX7150-48P</option>
                        <option>ICX7150-C12P</option>
                        <option>Catalyst 9200L</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      <input disabled={isViewOnly} className="w-full bg-transparent outline-none" value={sw.partNumber} onChange={e => updateSwitch(sw.id, { partNumber: e.target.value })} />
                    </td>
                    <td className="px-6 py-3 font-mono">
                      <div className="flex items-center gap-2 group/field">
                        <input disabled={isViewOnly} className="w-full bg-transparent outline-none" value={sw.serialNumber} placeholder="SN-XXXXX" onChange={e => updateSwitch(sw.id, { serialNumber: e.target.value })} />
                        {!isViewOnly && (
                          <button onClick={() => setScannerConfig({ id: sw.id, type: 'SN' })} className="text-slate-300 hover:text-[#0070C0] opacity-0 group-hover/field:opacity-100 transition-opacity">
                            <Camera size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      <input disabled={isViewOnly} className="w-full bg-transparent outline-none" value={sw.firmware} placeholder="8.0.x" onChange={e => updateSwitch(sw.id, { firmware: e.target.value })} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {sw.backupStatus === 'Success' ? <CircleCheck size={14} className="text-[#87A237]" /> : sw.backupStatus === 'Failed' ? <TriangleAlert size={14} className="text-red-500" /> : null}
                        <select disabled={isViewOnly} className={`bg-transparent outline-none font-bold text-center ${sw.backupStatus === 'Success' ? 'text-[#87A237]' : sw.backupStatus === 'Failed' ? 'text-red-500' : 'text-slate-400'}`} value={sw.backupStatus} onChange={e => updateSwitch(sw.id, { backupStatus: e.target.value as any })}>
                           <option>Pending</option>
                           <option>Success</option>
                           <option>Failed</option>
                           <option>N/A</option>
                        </select>
                      </div>
                    </td>
                    {!isViewOnly && (
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => cloneRow(sw)} className="p-1.5 text-slate-300 hover:text-[#0070C0] hover:bg-blue-50 rounded transition-colors" title="Duplicate Switch">
                             <Copy size={16} />
                          </button>
                          <button onClick={() => removeRow(sw.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Remove Entry">
                             <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {config.switches.length === 0 && (
        <div className="p-20 text-center flex flex-col items-center gap-4 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
           <Network size={48} className="text-slate-200" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Provisioning log empty</p>
           {!isViewOnly && <button onClick={addRow} className="text-[#0070C0] font-bold text-xs hover:underline decoration-dotted underline-offset-4">Click to initialize first switch unit</button>}
        </div>
      )}
    </div>
  );
};

export default SwitchingPlan;
