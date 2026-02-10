
import React, { useState } from 'react';
import { Settings, Network, ShieldAlert, Zap, Plus, Trash2, Globe, Server, Lock, ClipboardCheck, ArrowRightLeft, UploadCloud, Info, Smartphone } from 'lucide-react';
import { Project, CastModuleConfig, PhysicalPort, VlanInterface, StaticRoute, PortForward, UserRole } from '../types';
import DongleInventory from './DongleInventory';

interface CastConfigurationProps {
  project: Project;
  onUpdate: (config: CastModuleConfig) => void;
  role: UserRole;
}

const CastConfiguration: React.FC<CastConfigurationProps> = ({ project, onUpdate, role }) => {
  const [activeTab, setActiveTab] = useState<'System' | 'Network' | 'Routing' | 'Inventory' | 'UX'>('System');
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const config: CastModuleConfig = project.castConfig || {
    system: {
      machineType: 'Physical Unit',
      serialNumber: '',
      vpnUrl: '',
      vpnCreds: '',
      localCredsConfig: 'admin / admin',
      localCredsMgmt: 'root / root'
    },
    responsibilities: { owner: '', setupBy: '', testsDone: '' },
    network: {
      physicalPorts: Array.from({ length: 8 }).map((_, i) => ({
        id: `lan${i + 1}`,
        label: `LAN${i + 1}`,
        role: i === 0 ? 'WAN' : i === 1 ? 'HOTSPOT' : 'Disabled',
        ip: i === 1 ? '10.125.0.1' : '',
        mask: i === 1 ? '255.255.128.0' : '',
        gateway: '',
        dns1: '',
        dns2: '',
        dhcpRange: i === 1 ? '10.125.0.2 - 10.125.127.254' : '',
        notes: ''
      })),
      vlanInterfaces: []
    },
    routing: {
      staticRoutes: [],
      portForwards: [],
      customRules: ''
    },
    integrations: {
      pmsBrand: 'None',
      pmsIp: '',
      pmsPort: '5001'
    },
    dongleInventory: {
      stock: { homatics4k: 0, homaticsSpares: 0, ethAdapters: 0, remotes: 0, remoteSpares: 0, coverBoxes: 0 },
      globalConfig: { ssid: '', security: 'WPA2', password: '', timezone: 'UTC (GMT+0)', language: 'English', timeFormat: '24h' },
      roomRows: []
    }
  };

  const handleUpdate = (updates: Partial<CastModuleConfig>) => {
    if (isViewOnly) return;
    onUpdate({ ...config, ...updates });
  };

  const updateSystem = (updates: Partial<typeof config.system>) => handleUpdate({ system: { ...config.system, ...updates } });
  const updateResp = (updates: Partial<typeof config.responsibilities>) => handleUpdate({ responsibilities: { ...config.responsibilities, ...updates } });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Module Navigation */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit overflow-x-auto max-w-full scrollbar-hide">
        {(['System', 'Network', 'Routing', 'Inventory', 'UX'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-[#171844] text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'Inventory' ? 'DONGLE INVENTORY' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'System' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Server size={20} className="text-[#0070C0]" />
              Hardware & Auth
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Machine Type</label>
                <select 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={config.system.machineType}
                  onChange={e => updateSystem({ machineType: e.target.value as any })}
                >
                  <option>Physical Unit</option>
                  <option>Cloud Instance</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serial Number</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  value={config.system.serialNumber}
                  onChange={e => updateSystem({ serialNumber: e.target.value })}
                  placeholder="SN-CAST-XXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VPN URL</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={config.system.vpnUrl}
                  onChange={e => updateSystem({ vpnUrl: e.target.value })}
                  placeholder="vpn.cast.nonius.site"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Config Creds</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={config.system.localCredsConfig}
                  onChange={e => updateSystem({ localCredsConfig: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OS Management Creds</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={config.system.localCredsMgmt}
                  onChange={e => updateSystem({ localCredsMgmt: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <ClipboardCheck size={20} className="text-[#87A237]" />
              Responsibilities & QA
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Owner</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={config.responsibilities.owner}
                  onChange={e => updateResp({ owner: e.target.value })}
                  placeholder="Name of customer rep"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Setup By</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={config.responsibilities.setupBy}
                  onChange={e => updateResp({ setupBy: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QA Tests Performed</label>
                <textarea 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[80px]"
                  value={config.responsibilities.testsDone}
                  onChange={e => updateResp({ testsDone: e.target.value })}
                  placeholder="Describe pairing tests, latency checks..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Network' && (
        <div className="space-y-12">
          {/* Physical Ports */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 bg-[#171844] text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                <Network size={18} /> Physical Interface Mapping (LAN1 - LAN8)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-400">PORT</th>
                    <th className="px-6 py-4 font-bold text-slate-400">ROLE</th>
                    <th className="px-6 py-4 font-bold text-slate-400">IP ADDRESS</th>
                    <th className="px-6 py-4 font-bold text-slate-400">DHCP RANGE</th>
                    <th className="px-6 py-4 font-bold text-slate-400">NOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.network.physicalPorts.map((port, idx) => (
                    <tr key={port.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-[#171844]">{port.label}</td>
                      <td className="px-6 py-4">
                        <select 
                          disabled={isViewOnly}
                          className="bg-transparent border-b border-slate-200 focus:border-[#0070C0] outline-none"
                          value={port.role}
                          onChange={e => {
                            const newPorts = [...config.network.physicalPorts];
                            newPorts[idx].role = e.target.value;
                            handleUpdate({ network: { ...config.network, physicalPorts: newPorts } });
                          }}
                        >
                          <option>WAN</option>
                          <option>HOTSPOT</option>
                          <option>LAN/Mgmt</option>
                          <option>Disabled</option>
                          <option>Trunk/VLAN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono"
                          value={port.ip}
                          onChange={e => {
                            const newPorts = [...config.network.physicalPorts];
                            newPorts[idx].ip = e.target.value;
                            handleUpdate({ network: { ...config.network, physicalPorts: newPorts } });
                          }}
                          placeholder="0.0.0.0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono"
                          value={port.dhcpRange}
                          onChange={e => {
                            const newPorts = [...config.network.physicalPorts];
                            newPorts[idx].dhcpRange = e.target.value;
                            handleUpdate({ network: { ...config.network, physicalPorts: newPorts } });
                          }}
                          placeholder="None"
                        />
                      </td>
                      <td className="px-6 py-4 italic text-slate-400">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent outline-none"
                          value={port.notes}
                          onChange={e => {
                            const newPorts = [...config.network.physicalPorts];
                            newPorts[idx].notes = e.target.value;
                            handleUpdate({ network: { ...config.network, physicalPorts: newPorts } });
                          }}
                          placeholder="Rack patch..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* VLAN Trunking */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-[#87A237]" /> Virtual Interface Mapping (VLAN Trunking)
              </h4>
              {!isViewOnly && (
                <button 
                  onClick={() => {
                    const newVlan: VlanInterface = {
                      id: `vlan-${Date.now()}`, phyPort: 'LAN1', vlanId: '10', role: 'HOTSPOT', ip: '', mask: '255.255.255.0', dhcpRange: ''
                    };
                    handleUpdate({ network: { ...config.network, vlanInterfaces: [...config.network.vlanInterfaces, newVlan] } });
                  }}
                  className="px-4 py-2 bg-[#87A237] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 flex items-center gap-2"
                >
                  <Plus size={14} /> Add VLAN Interface
                </button>
              )}
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase">Phy Port</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase">VLAN ID</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase">Role</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase">IP Info</th>
                    {!isViewOnly && <th className="px-6 py-4"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.network.vlanInterfaces.map((vlan, idx) => (
                    <tr key={vlan.id} className="hover:bg-slate-50/30">
                      <td className="px-6 py-4">
                        <select 
                          disabled={isViewOnly}
                          className="bg-transparent border-b border-slate-100 outline-none"
                          value={vlan.phyPort}
                          onChange={e => {
                            const newVlans = [...config.network.vlanInterfaces];
                            newVlans[idx].phyPort = e.target.value;
                            handleUpdate({ network: { ...config.network, vlanInterfaces: newVlans } });
                          }}
                        >
                          {config.network.physicalPorts.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          disabled={isViewOnly}
                          className="w-16 bg-transparent border-b border-slate-100 outline-none font-bold"
                          value={vlan.vlanId}
                          onChange={e => {
                            const newVlans = [...config.network.vlanInterfaces];
                            newVlans[idx].vlanId = e.target.value;
                            handleUpdate({ network: { ...config.network, vlanInterfaces: newVlans } });
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          disabled={isViewOnly}
                          className="bg-transparent border-b border-slate-100 outline-none"
                          value={vlan.role}
                          onChange={e => {
                            const newVlans = [...config.network.vlanInterfaces];
                            newVlans[idx].role = e.target.value;
                            handleUpdate({ network: { ...config.network, vlanInterfaces: newVlans } });
                          }}
                        >
                          <option>HOTSPOT</option>
                          <option>Guest LAN</option>
                          <option>Cast Traffic</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <input disabled={isViewOnly} className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono text-[10px]" value={vlan.ip} placeholder="IP Address" onChange={e => {
                             const newVlans = [...config.network.vlanInterfaces];
                             newVlans[idx].ip = e.target.value;
                             handleUpdate({ network: { ...config.network, vlanInterfaces: newVlans } });
                          }} />
                          <input disabled={isViewOnly} className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono text-[10px]" value={vlan.dhcpRange} placeholder="DHCP Range" onChange={e => {
                             const newVlans = [...config.network.vlanInterfaces];
                             newVlans[idx].dhcpRange = e.target.value;
                             handleUpdate({ network: { ...config.network, vlanInterfaces: newVlans } });
                          }} />
                        </div>
                      </td>
                      {!isViewOnly && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleUpdate({ network: { ...config.network, vlanInterfaces: config.network.vlanInterfaces.filter(v => v.id !== vlan.id) } })}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {config.network.vlanInterfaces.length === 0 && (
                <div className="p-10 text-center text-slate-400 italic text-xs">No virtual interfaces defined.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Routing' && (
        <div className="space-y-12">
          {/* Static Routes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe size={14} /> Global & Static Routing
              </h4>
              {!isViewOnly && (
                <button 
                  onClick={() => {
                    const newRoute: StaticRoute = { id: `route-${Date.now()}`, name: 'Route A', destNetwork: '', destMask: '', gateway: '', notes: '' };
                    handleUpdate({ routing: { ...config.routing, staticRoutes: [...config.routing.staticRoutes, newRoute] } });
                  }}
                  className="px-4 py-2 bg-[#87A237] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={14} /> Add Static Route
                </button>
              )}
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left text-xs">
                 <thead className="bg-[#171844] text-white">
                   <tr>
                     <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Route Label</th>
                     <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Dest Network</th>
                     <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Dest Mask</th>
                     <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Next Hop</th>
                     {!isViewOnly && <th></th>}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {config.routing.staticRoutes.map((route, idx) => (
                     <tr key={route.id} className="hover:bg-slate-50/50">
                       <td className="px-6 py-4">
                         <input disabled={isViewOnly} className="bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-bold" value={route.name} onChange={e => {
                           const newRoutes = [...config.routing.staticRoutes];
                           newRoutes[idx].name = e.target.value;
                           handleUpdate({ routing: { ...config.routing, staticRoutes: newRoutes } });
                         }} />
                       </td>
                       <td className="px-6 py-4">
                         <input disabled={isViewOnly} className="bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono" value={route.destNetwork} placeholder="192.168.0.0" onChange={e => {
                           const newRoutes = [...config.routing.staticRoutes];
                           newRoutes[idx].destNetwork = e.target.value;
                           handleUpdate({ routing: { ...config.routing, staticRoutes: newRoutes } });
                         }} />
                       </td>
                       <td className="px-6 py-4">
                         <input disabled={isViewOnly} className="bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono" value={route.destMask} placeholder="255.255.0.0" onChange={e => {
                           const newRoutes = [...config.routing.staticRoutes];
                           newRoutes[idx].destMask = e.target.value;
                           handleUpdate({ routing: { ...config.routing, staticRoutes: newRoutes } });
                         }} />
                       </td>
                       <td className="px-6 py-4">
                         <input disabled={isViewOnly} className="bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono" value={route.gateway} placeholder="10.125.0.1" onChange={e => {
                           const newRoutes = [...config.routing.staticRoutes];
                           newRoutes[idx].gateway = e.target.value;
                           handleUpdate({ routing: { ...config.routing, staticRoutes: newRoutes } });
                         }} />
                       </td>
                       {!isViewOnly && (
                         <td className="px-4">
                            <button onClick={() => handleUpdate({ routing: { ...config.routing, staticRoutes: config.routing.staticRoutes.filter(r => r.id !== route.id) } })} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                         </td>
                       )}
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

          {/* Port Forwarding */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ArrowRightLeft size={14} /> Port Forwarding (NAT Rules)
            </h4>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left text-xs">
                 <thead className="bg-[#171844] text-white">
                   <tr>
                     <th className="px-6 py-4 font-bold text-[10px]">SOURCE</th>
                     <th className="px-6 py-4 font-bold text-[10px]">PROTO</th>
                     <th className="px-6 py-4 font-bold text-[10px]">PUBLIC PORT</th>
                     <th className="px-6 py-4 font-bold text-[10px]">INTERNAL DEST</th>
                     <th className="px-6 py-4 font-bold text-[10px]">INTERNAL PORT</th>
                     {!isViewOnly && <th></th>}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {config.routing.portForwards.map((forward, idx) => (
                      <tr key={forward.id}>
                        <td className="px-6 py-4">
                          <select disabled={isViewOnly} className="bg-transparent outline-none" value={forward.iface} onChange={e => {
                             const newFw = [...config.routing.portForwards];
                             newFw[idx].iface = e.target.value;
                             handleUpdate({ routing: { ...config.routing, portForwards: newFw } });
                          }}>
                            <option>LAN1 (WAN)</option>
                            <option>LAN2 (HOTSPOT)</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                           <select disabled={isViewOnly} className="bg-transparent outline-none font-bold" value={forward.protocol} onChange={e => {
                              const newFw = [...config.routing.portForwards];
                              newFw[idx].protocol = e.target.value as any;
                              handleUpdate({ routing: { ...config.routing, portForwards: newFw } });
                           }}>
                             <option>TCP</option>
                             <option>UDP</option>
                             <option>BOTH</option>
                           </select>
                        </td>
                        <td className="px-6 py-4">
                          <input disabled={isViewOnly} className="w-16 bg-transparent outline-none font-mono" value={forward.sourcePort} onChange={e => {
                              const newFw = [...config.routing.portForwards];
                              newFw[idx].sourcePort = e.target.value;
                              handleUpdate({ routing: { ...config.routing, portForwards: newFw } });
                           }} />
                        </td>
                        <td className="px-6 py-4">
                          <input disabled={isViewOnly} className="bg-transparent outline-none font-mono" value={forward.destIp} placeholder="10.125.x.x" onChange={e => {
                              const newFw = [...config.routing.portForwards];
                              newFw[idx].destIp = e.target.value;
                              handleUpdate({ routing: { ...config.routing, portForwards: newFw } });
                           }} />
                        </td>
                        <td className="px-6 py-4">
                          <input disabled={isViewOnly} className="w-16 bg-transparent outline-none font-mono" value={forward.destPort} onChange={e => {
                              const newFw = [...config.routing.portForwards];
                              newFw[idx].destPort = e.target.value;
                              handleUpdate({ routing: { ...config.routing, portForwards: newFw } });
                           }} />
                        </td>
                        {!isViewOnly && (
                          <td className="px-4">
                             <button onClick={() => handleUpdate({ routing: { ...config.routing, portForwards: config.routing.portForwards.filter(f => f.id !== forward.id) } })} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                 </tbody>
               </table>
               {!isViewOnly && (
                 <button 
                  onClick={() => {
                    const newFw: PortForward = { id: `fw-${Date.now()}`, iface: 'LAN1 (WAN)', protocol: 'TCP', sourceIp: 'Any', sourcePort: '', destIp: '', destPort: '', notes: '' };
                    handleUpdate({ routing: { ...config.routing, portForwards: [...config.routing.portForwards, newFw] } });
                  }}
                  className="w-full py-4 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 border-t border-slate-100"
                 >
                   + Add NAT Entry
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Inventory' && (
        <DongleInventory 
          data={config.dongleInventory}
          onUpdate={(updatedInv) => handleUpdate({ dongleInventory: updatedInv })}
          role={role}
        />
      )}

      {activeTab === 'UX' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PMS Integration */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Settings size={20} className="text-[#0070C0]" />
              PMS Integration Detail
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PMS Brand / Model</label>
                <select 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={config.integrations.pmsBrand}
                  onChange={e => handleUpdate({ integrations: { ...config.integrations, pmsBrand: e.target.value } })}
                >
                  <option>None</option>
                  <option>Oracle Opera (IFC8)</option>
                  <option>Protel Air</option>
                  <option>Mews</option>
                  <option>Visbook</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interface IP</label>
                  <input 
                    disabled={isViewOnly}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                    value={config.integrations.pmsIp}
                    placeholder="0.0.0.0"
                    onChange={e => handleUpdate({ integrations: { ...config.integrations, pmsIp: e.target.value } })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TCP Port</label>
                  <input 
                    disabled={isViewOnly}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                    value={config.integrations.pmsPort}
                    onChange={e => handleUpdate({ integrations: { ...config.integrations, pmsPort: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pairing Page UX */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <ShieldAlert size={20} className="text-[#87A237]" />
              Guest UX & Landing Page
            </h3>
            <div className="space-y-6">
               <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-white transition-all cursor-pointer">
                  <UploadCloud size={32} className="text-slate-300" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#171844] uppercase tracking-widest">Upload Pairing Page Photo</p>
                    <p className="text-[10px] text-slate-400 mt-1">Recommended: 1920x1080px JPEG/PNG</p>
                  </div>
                  {isViewOnly && <div className="absolute inset-0 bg-white/40 z-10"></div>}
               </div>

               <div className="bg-[#E9F2F8] p-6 rounded-2xl flex items-start gap-4 border border-blue-100">
                  <Info size={20} className="text-[#0070C0] shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-[#171844] uppercase tracking-widest mb-1">Pairing Logic</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      By default, the pairing page uses the 10.125.x.x network range to identify guest devices. Ensure the client's firewall allows DNS and HTTP(S) traffic to the Cast Proxy.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CastConfiguration;
