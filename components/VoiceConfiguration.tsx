
import React, { useState } from 'react';
import { Phone, Server, Network, Activity, Plus, Trash2, Cpu, FileCode, CheckSquare } from 'lucide-react';
import { Project, UserRole } from '../types';

interface VoiceConfigurationProps {
  project: Project;
  onUpdate: (config: any) => void;
  role: UserRole;
}

const VoiceConfiguration: React.FC<VoiceConfigurationProps> = ({ project, role }) => {
  const [activeTab, setActiveTab] = useState<'licensing' | 'network' | 'ops' | 'gateway'>('licensing');
  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const [licensing, setLicensing] = useState([
    { id: 1, name: 'Cloud vs On-Prem', status: 'Live' },
    { id: 2, name: 'Extensions (100+)', status: 'Pending' },
    { id: 3, name: 'Call Recording', status: 'Pending' },
    { id: 4, name: 'AI Receptionist', status: 'Canceled' },
    { id: 5, name: 'Teams Integration', status: 'Live' },
    { id: 6, name: 'Technician Training', status: 'Pending' },
  ]);

  const [gateways, setGateways] = useState({
    mac: '00:0B:82:91:A2:BC',
    ip: '10.50.10.25',
    user: 'admin',
    pass: 'password123'
  });

  const trunkTemplate = `host=192.168.191.253
context=from-trunk
insecure=port,invite
dtmfmode=rfc2833
disallow=all
allow=g729`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Module Tabs */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: 'licensing', label: 'LICENSING' },
          { id: 'network', label: 'NETWORK & TRUNKS' },
          { id: 'ops', label: 'OPERATIONS' },
          { id: 'gateway', label: 'ANALOG GATEWAYS' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-[#171844] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'licensing' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
          <h3 className="text-xl font-bold text-[#171844] mb-6 flex items-center gap-2">
            <CheckSquare size={20} className="text-[#87A237]" /> License Fulfillment Checklist
          </h3>
          <div className="space-y-4">
            {licensing.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-[#171844]">{item.name}</span>
                <select
                  disabled={isViewOnly}
                  value={item.status}
                  onChange={(e) => {
                    const next = [...licensing];
                    next[idx].status = e.target.value;
                    setLicensing(next);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border-none outline-none focus:ring-2 focus:ring-[#0070C0] ${
                    item.status === 'Live' ? 'bg-green-100 text-green-700' :
                    item.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-200 text-slate-500'
                  }`}
                >
                  <option>Pending</option>
                  <option>Live</option>
                  <option>Canceled</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#171844] flex items-center gap-2">
              <Network size={20} className="text-[#0070C0]" /> Interface Assignment
            </h3>
            <div className="space-y-4">
              {['Management (LAN1)', 'VoIP Traffic (LAN2)'].map(label => (
                <div key={label} className="grid grid-cols-3 gap-2">
                  <div className="col-span-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label></div>
                  <input disabled={isViewOnly} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono" placeholder="IP: 0.0.0.0" />
                  <input disabled={isViewOnly} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono" placeholder="Mask: /24" />
                  <input disabled={isViewOnly} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono" placeholder="GW: 0.0.0.0" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#171844] flex items-center gap-2">
              <FileCode size={20} className="text-[#87A237]" /> PSTN / SIP Trunk Peer
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Provider</label><input disabled={isViewOnly} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="BT / AT&T" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Channels</label><input disabled={isViewOnly} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="30" /></div>
              <div className="space-y-1 col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">DDI Range</label><input disabled={isViewOnly} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="+44 207..." /></div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Peer Config Template</label>
                <textarea disabled={isViewOnly} className="w-full px-4 py-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl h-32" defaultValue={trunkTemplate}></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ops' && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-[#171844] text-sm">System Operations (Groups & PINs)</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171844] text-white">
                  <tr className="uppercase tracking-widest text-[10px]">
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Number/ID</th>
                    <th className="px-6 py-4">Members / Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="px-6 py-3 font-bold">Ring Group</td><td className="px-6 py-3">600</td><td className="px-6 py-3">Reception (Ext 101, 102)</td></tr>
                  <tr><td className="px-6 py-3 font-bold">Pickup Group</td><td className="px-6 py-3">1</td><td className="px-6 py-3">Back Office Cluster</td></tr>
                  <tr><td className="px-6 py-3 font-bold">Manager PIN</td><td className="px-6 py-3">*99</td><td className="px-6 py-3">9921# (International Access)</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-[#171844] text-sm">Terminal Inventory (IP Phones)</h3>
              {!isViewOnly && <button className="text-[#0070C0] font-bold text-xs">+ Add Terminal</button>}
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171844] text-white uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-6 py-4">Brand/Model</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Extension</th>
                  <th className="px-6 py-4">User / Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {['Reception 1', 'Bar Master', 'Spa Desk'].map(loc => (
                  <tr key={loc}>
                    <td className="px-6 py-3">Mitel 6920</td>
                    <td className="px-6 py-3 font-bold">{loc}</td>
                    <td className="px-6 py-3 text-[#0070C0] font-mono">10{Math.floor(Math.random()*90)}</td>
                    <td className="px-6 py-3 text-slate-400">admin / *******</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gateway' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-blue-50 text-[#0070C0] rounded-3xl flex items-center justify-center shrink-0">
               <Cpu size={40} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">MAC Address</label><p className="font-mono font-bold">{gateways.mac}</p></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Management IP</label><p className="font-mono font-bold text-[#0070C0]">{gateways.ip}</p></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Username</label><p className="font-bold">{gateways.user}</p></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Password</label><p className="font-bold">••••••••</p></div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-8 py-5 bg-[#171844] text-white">
                <h3 className="font-bold text-sm uppercase tracking-[0.2em]">32 FXS Analog Port Mapping</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-slate-100">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{i + 1}</span>
                      <div>
                        <input disabled={isViewOnly} className="bg-transparent border-none p-0 text-xs font-bold text-[#171844] outline-none w-20" placeholder="Ext. ---" />
                        <p className="text-[9px] text-slate-400 uppercase font-black">Port Mapping</p>
                      </div>
                    </div>
                    <input disabled={isViewOnly} className="bg-slate-50 rounded px-2 py-1 text-[10px] w-12 font-mono text-center border-none" placeholder="P-01" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceConfiguration;
