
import React, { useState } from 'react';
import { LayoutGrid, Server, Shield, Network, Settings, CircleCheck, ListChecks, Smartphone, Trash2, Plus, Info, Lock, Radio, Wand2 } from 'lucide-react';
import { Project, TvModuleConfig, DeploymentStatus, Device, UserRole, TvStreamer, TvOttStream } from '../types';
import { IP_REGEX, HARDWARE_MODELS } from '../constants';
import StreamerHeadend from './StreamerHeadend';

const FEATURE_LIST = [
  'Nonius TV+ Standard Package',
  'Cloud Analytics',
  'Embedded Streaming Apps (Netflix, YouTube, etc.)',
  'OTT TV Channels',
  'Cast (Google Cast/AirPlay)',
  'PMS Integration (Simphony/Visbook)',
  'Guest Web App / Dining',
  'Video Content Caching'
];

interface TvConfigurationProps {
  project: Project;
  onUpdate: (config: TvModuleConfig) => void;
  role: UserRole;
}

const TvConfiguration: React.FC<TvConfigurationProps> = ({ project, onUpdate, role }) => {
  const [activeSubTab, setActiveSubTab] = useState<'Infrastructure' | 'Features' | 'Inventory' | 'Headend'>('Infrastructure');
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const config: TvModuleConfig = project.tvConfig || {
    infrastructure: {
      serverMain: 'Nonius Cloud', serverMainSN: '',
      serverSpare: 'None', serverSpareSN: '',
      vpnManagement: '', vpnContent: '',
      credsConfig: '', credsMgmt: '',
      network: { ip: '', mask: '', dns1: '', dns2: '', gateway: '', vlan: '' }
    },
    features: FEATURE_LIST.map(name => ({ name, contracted: false, status: DeploymentStatus.PENDING, comments: '' })),
    inventory: [],
    streamers: [],
    ottStreams: []
  };

  const handleInfraChange = (field: string, value: string) => {
    if (isViewOnly) return;
    const newConfig = { ...config };
    if (field in newConfig.infrastructure.network) {
      (newConfig.infrastructure.network as any)[field] = value;
    } else {
      (newConfig.infrastructure as any)[field] = value;
    }
    onUpdate(newConfig);
  };

  const handleFeatureToggle = (index: number) => {
    if (isViewOnly) return;
    const newFeatures = [...config.features];
    newFeatures[index].contracted = !newFeatures[index].contracted;
    onUpdate({ ...config, features: newFeatures });
  };

  const handleFeatureStatus = (index: number, status: DeploymentStatus) => {
    if (isViewOnly) return;
    const newFeatures = [...config.features];
    newFeatures[index].status = status;
    onUpdate({ ...config, features: newFeatures });
  };

  const handleUpdateStreamers = (newStreamers: TvStreamer[]) => {
    if (isViewOnly) return;
    onUpdate({ ...config, streamers: newStreamers });
  };

  const handleUpdateOtt = (newOtt: TvOttStream[]) => {
    if (isViewOnly) return;
    onUpdate({ ...config, ottStreams: newOtt });
  };

  const handleBulkGenerate = () => {
    if (isViewOnly) return;
    if (!window.confirm("This will generate TV devices for all rooms defined in the Floor Plan configuration. Existing devices will be kept. Continue?")) return;

    const newInventory = [...config.inventory];
    const existingRooms = new Set(newInventory.map(d => d.room));
    
    const generate = (room: string) => {
        if (existingRooms.has(room)) return;
        newInventory.push({
            id: `tv-${room}-${Date.now()}`,
            name: `TV ${room}`,
            brand: 'Samsung',
            model: 'HG Series',
            macAddress: '',
            serialNumber: '',
            room: room,
            ipAddress: '',
            installed: false,
            notes: '[Type:TV]'
        });
    };

    if (project.floorPlanConfig && project.floorPlanConfig.totalFloors > 0) {
        const { totalFloors, roomsPerFloor, startingRoomNumber } = project.floorPlanConfig;
        for (let f = 0; f < totalFloors; f++) {
            const floorStart = startingRoomNumber + (f * 100);
            for (let r = 0; r < roomsPerFloor; r++) {
                generate((floorStart + r).toString());
            }
        }
    } else {
        // Fallback to simple 1..N
        for (let i = 0; i < (project.rooms || 0); i++) {
            generate((101 + i).toString());
        }
    }

    onUpdate({ ...config, inventory: newInventory.sort((a,b) => a.room.localeCompare(b.room, undefined, {numeric: true})) });
  };

  const validateIp = (ip: string) => IP_REGEX.test(ip);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Sub-Tabs */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        {(['Infrastructure', 'Features', 'Inventory', 'Headend'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab 
                ? 'bg-white text-[#171844] shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeSubTab === 'Infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Server Hardware */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Server size={20} className="text-[#0070C0]" />
              Backend Hardware
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Unit</label>
                <select 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={config.infrastructure.serverMain}
                  onChange={e => handleInfraChange('serverMain', e.target.value)}
                >
                  <option>Nonius Cloud</option>
                  <option>Nonius Rack Unit</option>
                  <option>External Hardware</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main SN</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-sm"
                  value={config.infrastructure.serverMainSN}
                  onChange={e => handleInfraChange('serverMainSN', e.target.value)}
                  placeholder="SN-XXXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cold Spare</label>
                <select 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={config.infrastructure.serverSpare}
                  onChange={e => handleInfraChange('serverSpare', e.target.value)}
                >
                  <option>None</option>
                  <option>Hardware Unit</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spare SN</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-sm"
                  value={config.infrastructure.serverSpareSN}
                  onChange={e => handleInfraChange('serverSpareSN', e.target.value)}
                  placeholder="SN-XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Network eth0 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Network size={20} className="text-[#87A237]" />
              Management Network (eth0)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(config.infrastructure.network) as Array<keyof typeof config.infrastructure.network>).map(key => (
                <div key={key as string} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key as string}</label>
                  <input 
                    disabled={isViewOnly}
                    className={`w-full px-4 py-2.5 bg-slate-50 border ${key !== 'vlan' && config.infrastructure.network[key] && !validateIp(config.infrastructure.network[key]) ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none font-mono text-xs`}
                    value={config.infrastructure.network[key]}
                    onChange={e => handleInfraChange(key as string, e.target.value)}
                    placeholder="0.0.0.0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* VPN & Access */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Shield size={20} className="text-[#0070C0]" />
              Remote Access & VPN
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management VPN (L2TP/Wireguard)</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  value={config.infrastructure.vpnManagement}
                  onChange={e => handleInfraChange('vpnManagement', e.target.value)}
                  placeholder="vpn.mgmt.nonius.site"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content VPN (IPSec)</label>
                <input 
                  disabled={isViewOnly}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  value={config.infrastructure.vpnContent}
                  onChange={e => handleInfraChange('vpnContent', e.target.value)}
                  placeholder="content-tunnel.nonius.site"
                />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#171844]">
              <Lock size={20} className="text-[#171844]" />
              System Credentials
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration Console Pass</label>
                <input 
                  disabled={isViewOnly}
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={config.infrastructure.credsConfig}
                  onChange={e => handleInfraChange('credsConfig', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">OS Management Pass</label>
                <input 
                  disabled={isViewOnly}
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={config.infrastructure.credsMgmt}
                  onChange={e => handleInfraChange('credsMgmt', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'Features' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Contracted</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Feature Name</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Deployment Status</th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Technical Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.features.map((feature, idx) => (
                <tr key={feature.name} className="hover:bg-slate-50/50">
                  <td className="px-8 py-4">
                    <input 
                      type="checkbox" 
                      disabled={isViewOnly}
                      checked={feature.contracted} 
                      onChange={() => handleFeatureToggle(idx)}
                      className="w-5 h-5 rounded-lg accent-[#87A237]"
                    />
                  </td>
                  <td className="px-8 py-4 font-bold text-[#171844]">{feature.name}</td>
                  <td className="px-8 py-4">
                    <select 
                      disabled={isViewOnly}
                      className="px-3 py-1.5 bg-slate-100 border-none rounded-lg text-xs font-bold"
                      value={feature.status}
                      onChange={e => handleFeatureStatus(idx, e.target.value as DeploymentStatus)}
                    >
                      {Object.values(DeploymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-4 text-slate-500 italic text-xs">
                    {isViewOnly ? feature.comments : (
                       <input 
                        className="bg-transparent border-b border-transparent focus:border-slate-200 outline-none w-full"
                        placeholder="Add note..."
                        value={feature.comments}
                        onChange={e => {
                          const newFeatures = [...config.features];
                          newFeatures[idx].comments = e.target.value;
                          onUpdate({ ...config, features: newFeatures });
                        }}
                       />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'Inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#171844]">Endpoint Inventory</h3>
            {!isViewOnly && (
              <div className="flex gap-2">
                <button 
                  onClick={handleBulkGenerate}
                  className="px-6 py-2 bg-white border border-slate-200 text-[#171844] rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50"
                >
                  <Wand2 size={16} /> Bulk Generate from Rooms
                </button>
                <button 
                  onClick={() => {
                    const newDev: Device = {
                      id: Math.random().toString(), name: 'Room TV', brand: 'Samsung', model: '',
                      macAddress: '', serialNumber: '', room: '', ipAddress: '', installed: false
                    };
                    onUpdate({ ...config, inventory: [newDev, ...config.inventory] });
                  }}
                  className="px-6 py-2 bg-[#171844] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Plus size={16} /> Add Single TV
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 border-b border-slate-100">
                 <tr>
                   <th className="px-6 py-4 font-bold text-[10px] text-slate-400">Room</th>
                   <th className="px-6 py-4 font-bold text-[10px] text-slate-400">Hardware</th>
                   <th className="px-6 py-4 font-bold text-[10px] text-slate-400">Identities</th>
                   <th className="px-6 py-4 font-bold text-[10px] text-slate-400">Status</th>
                   {!isViewOnly && <th className="px-6 py-4"></th>}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {config.inventory.map((dev, idx) => (
                   <tr key={dev.id} className="hover:bg-slate-50/50">
                     <td className="px-6 py-4 font-bold"># {dev.room || '---'}</td>
                     <td className="px-6 py-4">
                        <p className="font-bold text-xs">{dev.brand} {dev.model}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{dev.serialNumber || 'No SN'}</p>
                     </td>
                     <td className="px-6 py-4">
                        <p className="font-mono text-[10px] text-slate-600">IP: {dev.ipAddress || '0.0.0.0'}</p>
                        <p className="font-mono text-[10px] text-slate-600">MAC: {dev.macAddress || '---'}</p>
                     </td>
                     <td className="px-6 py-4">
                        <button 
                          disabled={isViewOnly}
                          onClick={() => {
                            const newInv = [...config.inventory];
                            newInv[idx].installed = !newInv[idx].installed;
                            onUpdate({ ...config, inventory: newInv });
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${dev.installed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {dev.installed ? 'Installed' : 'Pending'}
                        </button>
                     </td>
                     {!isViewOnly && (
                       <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onUpdate({ ...config, inventory: config.inventory.filter(d => d.id !== dev.id) })}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                       </td>
                     )}
                   </tr>
                 ))}
               </tbody>
             </table>
             {config.inventory.length === 0 && (
               <div className="p-12 text-center text-slate-400 italic text-sm">No devices registered.</div>
             )}
          </div>
        </div>
      )}

      {activeSubTab === 'Headend' && (
        <StreamerHeadend 
          streamers={config.streamers || []} 
          ottStreams={config.ottStreams || []}
          onUpdate={handleUpdateStreamers} 
          onUpdateOtt={handleUpdateOtt}
          role={role} 
        />
      )}
    </div>
  );
};

export default TvConfiguration;
