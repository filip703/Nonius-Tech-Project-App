
import React, { useState } from 'react';
import { Network, Server, Shield, Lock, Radio, Plus, Trash2, Info, ChevronDown, CircleCheck, Monitor, Globe, Activity } from 'lucide-react';
import { Project, WifiModuleConfig, WifiController, WifiZone, WifiApGroup, WifiSsid, AccessPoint, UserRole } from '../types';
import { IP_REGEX, MAC_REGEX } from '../constants';

interface WifiConfigurationProps {
  project: Project;
  onUpdate: (config: WifiModuleConfig) => void;
  role: UserRole;
}

const WifiConfiguration: React.FC<WifiConfigurationProps> = ({ project, onUpdate, role }) => {
  const [activeTab, setActiveTab] = useState<'Controller' | 'Global' | 'Inventory'>('Controller');
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const config: WifiModuleConfig = project.wifiConfig || {
    controller: {
      mode: 'Central',
      brand: 'Ruckus',
      model: 'Virtual SmartZone',
      firmware: '',
      type: 'Cloud',
      location: '',
      externalUrl: '',
      network: { internalIp: '', internalPort: '443', externalIp: '', externalPort: '443' },
      credentials: { role: 'Super Admin', user: 'admin', pass: '', notes: '' }
    },
    zones: [],
    groups: [],
    ssids: [],
    inventory: []
  };

  const updateConfig = (updates: Partial<WifiModuleConfig>) => {
    if (isViewOnly) return;
    onUpdate({ ...config, ...updates });
  };

  const handleControllerChange = (field: string, value: string) => {
    const newController = { ...config.controller };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (newController as any)[parent][child] = value;
    } else {
      (newController as any)[field] = value;
    }
    updateConfig({ controller: newController });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Module Navigation */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        {(['Controller', 'Global', 'Inventory'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab 
                ? 'bg-[#171844] text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'Controller' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
                <Monitor size={20} className="text-[#0070C0]" />
                Management Controller
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${config.controller.mode === 'Central' ? 'text-[#87A237]' : 'text-slate-400'}`}>
                  {config.controller.mode === 'Central' ? 'Central Managed' : 'Manual/Standalone'}
                </span>
                <button 
                  disabled={isViewOnly}
                  onClick={() => handleControllerChange('mode', config.controller.mode === 'Central' ? 'Manual' : 'Central')}
                  className={`w-10 h-5 rounded-full relative transition-colors ${config.controller.mode === 'Central' ? 'bg-[#87A237]' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${config.controller.mode === 'Central' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Brand / Vendor</label>
                <select disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={config.controller.brand} onChange={e => handleControllerChange('brand', e.target.value)}>
                  <option>Ruckus</option>
                  <option>Ubiquiti UniFi</option>
                  <option>Aruba HPE</option>
                  <option>Cisco Meraki</option>
                  <option>TP-Link Omada</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                <select disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={config.controller.type} onChange={e => handleControllerChange('type', e.target.value as any)}>
                  <option>Cloud</option>
                  <option>On-Premise</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Model / VM Name</label>
                <input disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={config.controller.model} onChange={e => handleControllerChange('model', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Firmware</label>
                <input disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={config.controller.firmware} onChange={e => handleControllerChange('firmware', e.target.value)} placeholder="e.g. 6.1.1.0" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">External Management URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input disabled={isViewOnly} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0070C0]" value={config.controller.externalUrl} onChange={e => handleControllerChange('externalUrl', e.target.value)} placeholder="https://sz-cloud.nonius.site:8443" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Lock size={20} className="text-[#87A237]" />
              Controller Credentials
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Management Role</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={config.controller.credentials.role} onChange={e => handleControllerChange('credentials.role', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Username</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={config.controller.credentials.user} onChange={e => handleControllerChange('credentials.user', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                <input disabled={isViewOnly} type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={config.controller.credentials.pass} onChange={e => handleControllerChange('credentials.pass', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Operational Notes</label>
                <textarea disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[80px]" value={config.controller.credentials.notes} onChange={e => handleControllerChange('credentials.notes', e.target.value)} placeholder="Access via customer VPN required..." />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 lg:col-span-2">
             <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
               <Network size={20} className="text-[#0070C0]" />
               Network Access Points (Ports & IPs)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Internal IP</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs" value={config.controller.network.internalIp} onChange={e => handleControllerChange('network.internalIp', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Internal Port</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs" value={config.controller.network.internalPort} onChange={e => handleControllerChange('network.internalPort', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">External IP</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs" value={config.controller.network.externalIp} onChange={e => handleControllerChange('network.externalIp', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">External Port</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs" value={config.controller.network.externalPort} onChange={e => handleControllerChange('network.externalPort', e.target.value)} />
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'Global' && (
        <div className="space-y-10">
          {/* Best Practices Box */}
          <div className="bg-[#F8FAF3] border-l-8 border-[#87A237] p-8 rounded-3xl flex items-start gap-6 shadow-sm">
             <div className="w-14 h-14 rounded-2xl bg-[#87A237] text-white flex items-center justify-center shrink-0 shadow-lg">
                <CircleCheck size={32} />
             </div>
             <div>
                <h4 className="text-xl font-bold text-[#171844] mb-2 uppercase tracking-tight">Nonius WiFi Standards & Best Practices</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#87A237] uppercase">Channelization</p>
                      <p className="text-sm font-bold text-slate-700">Max 40MHz BW</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#87A237] uppercase">2.4GHz Plan</p>
                      <p className="text-sm font-bold text-slate-700">Ch 1, 6, 11 Only</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#87A237] uppercase">5GHz Safety</p>
                      <p className="text-sm font-bold text-slate-700">Strictly No DFS</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#87A237] uppercase">Rates</p>
                      <p className="text-sm font-bold text-slate-700">OFDM Only, 12M Min</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zones & Groups */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-[#171844] text-white flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Wireless Zones & AP Groups</h4>
                  {!isViewOnly && <button onClick={() => updateConfig({ zones: [...config.zones, { id: Date.now().toString(), name: '', description: '' }] })} className="p-1.5 hover:bg-white/10 rounded-lg"><Plus size={16}/></button>}
               </div>
               <div className="p-6 space-y-4">
                  {config.zones.map((zone, idx) => (
                    <div key={zone.id} className="flex gap-4 items-center">
                       <input disabled={isViewOnly} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" placeholder="Zone Name" value={zone.name} onChange={e => {
                          const newZones = [...config.zones];
                          newZones[idx].name = e.target.value;
                          updateConfig({ zones: newZones });
                       }} />
                       <input disabled={isViewOnly} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" placeholder="Description" value={zone.description} onChange={e => {
                          const newZones = [...config.zones];
                          newZones[idx].description = e.target.value;
                          updateConfig({ zones: newZones });
                       }} />
                       {!isViewOnly && <button onClick={() => updateConfig({ zones: config.zones.filter(z => z.id !== zone.id) })} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>}
                    </div>
                  ))}
                  {config.zones.length === 0 && <p className="text-center text-slate-400 text-xs py-4 italic">No zones defined yet.</p>}
               </div>
            </div>

            {/* SSIDs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-[#171844] text-white flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Global SSID Broadcasts</h4>
                  {!isViewOnly && <button onClick={() => updateConfig({ ssids: [...config.ssids, { id: Date.now().toString(), name: '', encryption: 'WPA2', password: '', description: '' }] })} className="p-1.5 hover:bg-white/10 rounded-lg"><Plus size={16}/></button>}
               </div>
               <div className="p-6 space-y-4">
                  {config.ssids.map((ssid, idx) => (
                    <div key={ssid.id} className="space-y-2 pb-4 border-b border-slate-50 last:border-0">
                       <div className="flex gap-4">
                         <input disabled={isViewOnly} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" placeholder="SSID Name" value={ssid.name} onChange={e => {
                            const newSsids = [...config.ssids];
                            newSsids[idx].name = e.target.value;
                            updateConfig({ ssids: newSsids });
                         }} />
                         <select disabled={isViewOnly} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold" value={ssid.encryption} onChange={e => {
                            const newSsids = [...config.ssids];
                            newSsids[idx].encryption = e.target.value as any;
                            updateConfig({ ssids: newSsids });
                         }}>
                            <option>WPA2</option>
                            <option>WPA3</option>
                            <option>Open</option>
                         </select>
                         {!isViewOnly && <button onClick={() => updateConfig({ ssids: config.ssids.filter(s => s.id !== ssid.id) })} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>}
                       </div>
                       <input disabled={isViewOnly} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono" placeholder="Pre-shared Key" value={ssid.password} onChange={e => {
                          const newSsids = [...config.ssids];
                          newSsids[idx].password = e.target.value;
                          updateConfig({ ssids: newSsids });
                       }} />
                    </div>
                  ))}
                  {config.ssids.length === 0 && <p className="text-center text-slate-400 text-xs py-4 italic">No SSIDs configured.</p>}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#171844]">Access Point Inventory</h3>
              <p className="text-slate-500 text-xs font-medium">Physical deployment tracking and port mapping</p>
            </div>
            {!isViewOnly && (
              <button 
                onClick={() => {
                  const newAp: AccessPoint = {
                    id: Date.now().toString(), name: '', location: '', brand: 'Ruckus', mac: '00:00:00:00:00:00',
                    ip: '0.0.0.0', switchPort: '', vlanMgmt: '1', vlanHotspot: '10', channel: 'Auto', user: 'super', pass: 'sp-admin'
                  };
                  updateConfig({ inventory: [...config.inventory, newAp] });
                }}
                className="px-6 py-2 bg-[#87A237] text-white rounded-xl text-xs font-bold shadow-lg shadow-green-100 flex items-center gap-2"
              >
                <Plus size={16} /> Add AP Row
              </button>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto max-w-full">
            <table className="w-full text-left table-fixed min-w-[1200px]">
              <thead className="bg-[#171844] text-white sticky top-0 z-20">
                <tr className="text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-4 py-4 w-40">AP Name</th>
                  <th className="px-4 py-4 w-40">Location</th>
                  <th className="px-4 py-4 w-40">HW Identity (MAC)</th>
                  <th className="px-4 py-4 w-32">IP Address</th>
                  <th className="px-4 py-4 w-32">Uplink Port</th>
                  <th className="px-4 py-4 w-40 bg-slate-900/50">VLANs (Mgmt/HS)</th>
                  <th className="px-4 py-4 w-24">Radio Ch</th>
                  <th className="px-4 py-4 w-40">Local Access</th>
                  {!isViewOnly && <th className="px-4 py-4 w-12"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.inventory.map((ap, idx) => {
                  const isMacValid = MAC_REGEX.test(ap.mac);
                  const isIpValid = IP_REGEX.test(ap.ip);
                  return (
                    <tr key={ap.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2">
                        <input disabled={isViewOnly} className="w-full bg-transparent font-bold text-[#171844] outline-none text-xs" value={ap.name} onChange={e => {
                           const newInv = [...config.inventory];
                           newInv[idx].name = e.target.value;
                           updateConfig({ inventory: newInv });
                        }} placeholder="AP-R101" />
                      </td>
                      <td className="px-4 py-2">
                        <input disabled={isViewOnly} className="w-full bg-transparent text-xs outline-none" value={ap.location} onChange={e => {
                           const newInv = [...config.inventory];
                           newInv[idx].location = e.target.value;
                           updateConfig({ inventory: newInv });
                        }} placeholder="Room 101 Ceiling" />
                      </td>
                      <td className="px-4 py-2">
                         <input disabled={isViewOnly} className={`w-full bg-transparent font-mono text-[10px] outline-none ${isMacValid ? 'text-slate-600' : 'text-red-500 font-bold'}`} value={ap.mac} onChange={e => {
                            const newInv = [...config.inventory];
                            newInv[idx].mac = e.target.value;
                            updateConfig({ inventory: newInv });
                         }} />
                      </td>
                      <td className="px-4 py-2">
                         <input disabled={isViewOnly} className={`w-full bg-transparent font-mono text-[10px] outline-none ${isIpValid ? 'text-slate-600' : 'text-red-500 font-bold'}`} value={ap.ip} onChange={e => {
                            const newInv = [...config.inventory];
                            newInv[idx].ip = e.target.value;
                            updateConfig({ inventory: newInv });
                         }} />
                      </td>
                      <td className="px-4 py-2">
                         <input disabled={isViewOnly} className="w-full bg-transparent text-[10px] outline-none italic text-slate-400" value={ap.switchPort} onChange={e => {
                            const newInv = [...config.inventory];
                            newInv[idx].switchPort = e.target.value;
                            updateConfig({ inventory: newInv });
                         }} placeholder="SW1-P5" />
                      </td>
                      <td className="px-4 py-2 bg-slate-50/50">
                         <div className="flex items-center gap-2">
                            <input disabled={isViewOnly} className="w-12 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-center" value={ap.vlanMgmt} onChange={e => {
                               const newInv = [...config.inventory];
                               newInv[idx].vlanMgmt = e.target.value;
                               updateConfig({ inventory: newInv });
                            }} />
                            <span className="text-slate-300">/</span>
                            <input disabled={isViewOnly} className="w-12 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-center" value={ap.vlanHotspot} onChange={e => {
                               const newInv = [...config.inventory];
                               newInv[idx].vlanHotspot = e.target.value;
                               updateConfig({ inventory: newInv });
                            }} />
                         </div>
                      </td>
                      <td className="px-4 py-2">
                         <input disabled={isViewOnly} className="w-full bg-transparent text-center font-bold text-[#0070C0] text-[10px] outline-none" value={ap.channel} onChange={e => {
                            const newInv = [...config.inventory];
                            newInv[idx].channel = e.target.value;
                            updateConfig({ inventory: newInv });
                         }} />
                      </td>
                      <td className="px-4 py-2">
                         <div className="flex flex-col gap-0.5">
                            <input disabled={isViewOnly} className="bg-transparent outline-none text-[9px] font-bold" value={ap.user} onChange={e => {
                               const newInv = [...config.inventory];
                               newInv[idx].user = e.target.value;
                               updateConfig({ inventory: newInv });
                            }} />
                            <input disabled={isViewOnly} type="password" placeholder="••••" className="bg-transparent outline-none text-[9px]" value={ap.pass} onChange={e => {
                               const newInv = [...config.inventory];
                               newInv[idx].pass = e.target.value;
                               updateConfig({ inventory: newInv });
                            }} />
                         </div>
                      </td>
                      {!isViewOnly && (
                        <td className="px-4 py-2">
                           <button onClick={() => updateConfig({ inventory: config.inventory.filter(a => a.id !== ap.id) })} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {config.inventory.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                 <Radio size={48} className="text-slate-200" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Access Point Inventory is Empty</p>
                 {!isViewOnly && <button onClick={() => updateConfig({ inventory: [{ id: '1', name: '', location: '', brand: 'Ruckus', mac: '00:00:00:00:00:00', ip: '0.0.0.0', switchPort: '', vlanMgmt: '1', vlanHotspot: '10', channel: 'Auto', user: 'super', pass: 'sp-admin' }] })} className="text-[#0070C0] font-bold text-xs hover:underline">Provision First Access Point</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WifiConfiguration;
