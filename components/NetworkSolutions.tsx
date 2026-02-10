
import React, { useState } from 'react';
import { ShieldCheck, Network, Info, Plus, Trash2, Globe, Server, Check, CircleHelp, Activity, LayoutGrid } from 'lucide-react';
import { Project, DeploymentStatus, ServiceAudit, VlanConfig, UserRole } from '../types';

const INITIAL_SERVICES: ServiceAudit[] = [
  { name: 'Monitoring Dashboard Access Tool', description: 'Monitoring for 1000+ Devices across entire network ecosystem.', contracted: false, status: DeploymentStatus.PENDING, comment: '' },
  { name: 'Wi-Fi Predictive Wi-Fi Survey', description: 'Includes Wireless Desktop Site Survey & Hardware Quote.', contracted: false, status: DeploymentStatus.PENDING, comment: '' },
  { name: 'Internet - Wi-Fi Site Auditing', description: 'Site Survey, Heatmap, Analysis of coverage problems.', contracted: false, status: DeploymentStatus.PENDING, comment: '' },
  { name: 'Internet - Wi-Fi + Network Site Auditing', description: 'Wireless Survey, Heatmap, High-Level Network Survey, Analysis.', contracted: false, status: DeploymentStatus.PENDING, comment: '' },
  { name: 'Internet - Full Site Survey + Site Planning', description: 'Full package: Survey, Heatmap, Planning Report, BOM, Low-level design.', contracted: false, status: DeploymentStatus.PENDING, comment: '' },
];

interface NetworkSolutionsProps {
  project: Project;
  onUpdate: (config: { services: ServiceAudit[], vlans: VlanConfig[] }) => void;
  role: UserRole;
}

const CIDR_REGEX = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;

const NetworkSolutions: React.FC<NetworkSolutionsProps> = ({ project, onUpdate, role }) => {
  const [activeTab, setActiveTab] = useState<'Services' | 'VLANs'>('Services');
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const config = project.networkSolutions || { 
    services: INITIAL_SERVICES, 
    vlans: [
      { id: '1', vlanId: '10', name: 'Management', network: '10.10.10.0/24', gateway: '10.10.10.1', physGateway: 'Firewall', dhcp: true, internet: true, layer7: '', description: 'Nonius MGMT VLAN' }
    ] 
  };

  const handleServiceChange = (idx: number, field: keyof ServiceAudit, value: any) => {
    if (isViewOnly) return;
    const newServices = [...config.services];
    newServices[idx] = { ...newServices[idx], [field]: value };
    onUpdate({ ...config, services: newServices });
  };

  const updateVlan = (id: string, updates: Partial<VlanConfig>) => {
    if (isViewOnly) return;
    const newVlans = config.vlans.map(v => v.id === id ? { ...v, ...updates } : v);
    onUpdate({ ...config, vlans: newVlans });
  };

  const addVlan = () => {
    if (isViewOnly) return;
    const newVlan: VlanConfig = {
      id: `vlan-${Date.now()}`, vlanId: '', name: '', network: '', gateway: '', physGateway: 'Core Switch', dhcp: true, internet: true, layer7: '', description: ''
    };
    onUpdate({ ...config, vlans: [...config.vlans, newVlan] });
  };

  const removeVlan = (id: string) => {
    if (isViewOnly) return;
    onUpdate({ ...config, vlans: config.vlans.filter(v => v.id !== id) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        {(['Services', 'VLANs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? 'bg-[#171844] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'Services' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#171844] text-white">
              <tr className="text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5 w-20 text-center">Contracted</th>
                <th className="px-8 py-5">Service Module / Scope</th>
                <th className="px-8 py-5 w-64">Status</th>
                <th className="px-8 py-5">Internal Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.services.map((service, idx) => (
                <tr key={service.name} className={`transition-opacity duration-300 ${!service.contracted ? 'opacity-40 grayscale-[0.5]' : 'bg-white'}`}>
                  <td className="px-8 py-6 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg accent-[#87A237]"
                      checked={service.contracted}
                      disabled={isViewOnly}
                      onChange={(e) => handleServiceChange(idx, 'contracted', e.target.checked)}
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 group relative">
                       <span className="font-bold text-[#171844]">{service.name}</span>
                       <div className="group/tip">
                          <CircleHelp size={14} className="text-slate-300 cursor-help" />
                          <div className="invisible group-hover/tip:visible absolute bottom-full left-0 mb-2 w-72 p-4 bg-[#171844] text-white text-[10px] leading-relaxed rounded-2xl shadow-2xl z-20">
                             <p className="font-bold mb-1 uppercase tracking-widest text-[#87A237]">Scope Detail</p>
                             {service.description}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                      value={service.status}
                      disabled={isViewOnly || !service.contracted}
                      onChange={(e) => handleServiceChange(idx, 'status', e.target.value as DeploymentStatus)}
                    >
                      {Object.values(DeploymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <input 
                      className="w-full bg-transparent border-b border-transparent focus:border-blue-200 outline-none text-xs italic"
                      placeholder="Add coordination note..."
                      value={service.comment}
                      disabled={isViewOnly || !service.contracted}
                      onChange={(e) => handleServiceChange(idx, 'comment', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'VLANs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div>
                <h3 className="text-xl font-bold text-[#171844]">VLAN Segmentation Plan</h3>
                <p className="text-xs text-slate-500 font-medium italic">Logical infrastructure mapping and subnet assignments</p>
             </div>
             {!isViewOnly && (
               <button 
                onClick={addVlan}
                className="flex items-center gap-2 px-6 py-2 bg-[#87A237] text-white rounded-xl text-xs font-bold shadow-lg shadow-green-100"
               >
                 <Plus size={16} /> Add VLAN Network
               </button>
             )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
             <table className="w-full text-left text-xs min-w-[1000px]">
                <thead className="bg-[#171844] text-white">
                  <tr className="font-bold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4 w-20">ID</th>
                    <th className="px-6 py-4 w-40">Alias/Name</th>
                    <th className="px-6 py-4 w-48">Subnet (CIDR)</th>
                    <th className="px-6 py-4 w-40">Gateway</th>
                    <th className="px-6 py-4 w-40">Phy Source</th>
                    <th className="px-6 py-4 w-20 text-center">DHCP</th>
                    <th className="px-6 py-4 w-20 text-center">INET</th>
                    <th className="px-6 py-4">Description</th>
                    {!isViewOnly && <th className="px-6 py-4 w-12"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.vlans.map((vlan) => {
                    const isNetworkValid = CIDR_REGEX.test(vlan.network);
                    return (
                      <tr key={vlan.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3">
                          <input disabled={isViewOnly} className="w-12 font-bold text-[#0070C0] outline-none bg-transparent" placeholder="--" value={vlan.vlanId} onChange={e => updateVlan(vlan.id, { vlanId: e.target.value })} />
                        </td>
                        <td className="px-6 py-3">
                          <input disabled={isViewOnly} className="w-full font-bold outline-none bg-transparent" placeholder="Network Name" value={vlan.name} onChange={e => updateVlan(vlan.id, { name: e.target.value })} />
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            disabled={isViewOnly} 
                            className={`w-full font-mono outline-none bg-transparent ${isNetworkValid ? 'text-slate-600' : 'text-red-500 font-bold'}`} 
                            placeholder="192.168.1.0/24" 
                            value={vlan.network} 
                            onChange={e => updateVlan(vlan.id, { network: e.target.value })} 
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input disabled={isViewOnly} className="w-full font-mono outline-none bg-transparent" placeholder="192.168.1.1" value={vlan.gateway} onChange={e => updateVlan(vlan.id, { gateway: e.target.value })} />
                        </td>
                        <td className="px-6 py-3">
                          <select disabled={isViewOnly} className="bg-transparent outline-none font-medium" value={vlan.physGateway} onChange={e => updateVlan(vlan.id, { physGateway: e.target.value as any })}>
                            <option>Core Switch</option>
                            <option>Firewall</option>
                            <option>Other</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input disabled={isViewOnly} type="checkbox" className="w-4 h-4 accent-[#0070C0]" checked={vlan.dhcp} onChange={e => updateVlan(vlan.id, { dhcp: e.target.checked })} />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input disabled={isViewOnly} type="checkbox" className="w-4 h-4 accent-[#87A237]" checked={vlan.internet} onChange={e => updateVlan(vlan.id, { internet: e.target.checked })} />
                        </td>
                        <td className="px-6 py-3 italic text-slate-400">
                          <input disabled={isViewOnly} className="w-full bg-transparent outline-none" placeholder="..." value={vlan.description} onChange={e => updateVlan(vlan.id, { description: e.target.value })} />
                        </td>
                        {!isViewOnly && (
                          <td className="px-6 py-3">
                             <button onClick={() => removeVlan(vlan.id)} className="text-slate-200 hover:text-red-500"><Trash2 size={14} /></button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSolutions;
