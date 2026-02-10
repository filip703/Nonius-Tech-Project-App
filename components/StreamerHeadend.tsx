
import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Cpu, Network, Radio, Lock, List, Settings, Save, CircleAlert, Globe, Video } from 'lucide-react';
import { TvStreamer, TvTuner, TvChannel, UserRole, NetworkInterface, TvOttStream } from '../types';

const MULTICAST_REGEX = /^(22[4-9]|23[0-9])(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

const STREAMER_TYPES = [
  "CASWELL DVB/IP Gateway 8T",
  "CASWELL DVB/IP Gateway 8S (CI)",
  "CASWELL DVB/IP Gateway 8C",
  "Nonius Virtual Headend Instance"
];

interface StreamerHeadendProps {
  streamers: TvStreamer[];
  ottStreams: TvOttStream[];
  onUpdate: (streamers: TvStreamer[]) => void;
  onUpdateOtt: (ott: TvOttStream[]) => void;
  role: UserRole;
}

const StreamerHeadend: React.FC<StreamerHeadendProps> = ({ streamers, ottStreams, onUpdate, onUpdateOtt, role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [showOtt, setShowOtt] = useState(true);

  const toggleExpand = (id: string) => {
    setExpandedUnits(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const addStreamer = () => {
    if (isViewOnly) return;
    const newId = `streamer-${Date.now()}`;
    const newStreamer: TvStreamer = {
      id: newId,
      type: STREAMER_TYPES[0],
      serialNumber: '',
      vpn: '',
      credsUser: 'admin',
      credsPass: 'maia',
      interfaces: {
        management: { ip: '', mask: '', gateway: '', iface: 'eth0', notes: '' },
        streaming: { ip: '', mask: '', gateway: '', iface: 'bond0', notes: '' },
        auxiliary: { ip: '', mask: '', gateway: '', iface: 'eth3', notes: '' },
      },
      tuners: []
    };
    onUpdate([...streamers, newStreamer]);
    setExpandedUnits([newId, ...expandedUnits]);
  };

  const addOttStream = () => {
    if (isViewOnly) return;
    const newOtt: TvOttStream = {
      id: `ott-${Date.now()}`,
      name: '',
      sourceUrl: 'http://',
      type: 'HLS',
      multicastIp: '239.192.10.1',
      port: '5000',
      notes: ''
    };
    onUpdateOtt([...ottStreams, newOtt]);
  };

  const updateStreamer = (id: string, updates: Partial<TvStreamer>) => {
    onUpdate(streamers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updateOtt = (id: string, updates: Partial<TvOttStream>) => {
    onUpdateOtt(ottStreams.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const removeStreamer = (id: string) => {
    if (window.confirm("Delete this Streamer unit and all its tuner configs?")) {
      onUpdate(streamers.filter(s => s.id !== id));
    }
  };

  const removeOtt = (id: string) => {
    onUpdateOtt(ottStreams.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* OTT Streams Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#171844] flex items-center gap-2">
              <Globe size={24} className="text-[#0070C0]" />
              OTT & Actual TV Streams
            </h2>
            <p className="text-slate-500 font-medium text-sm">External web streams and virtual channel mappings (HLS/DASH)</p>
          </div>
          {!isViewOnly && (
            <button 
              onClick={addOttStream}
              className="flex items-center gap-2 px-6 py-3 bg-[#0070C0] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:scale-105 transition-all"
            >
              <Plus size={20} />
              Add OTT Stream
            </button>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#171844] text-white">
              <tr className="text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Stream Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Source URL (Actual Stream)</th>
                <th className="px-6 py-4">Multicast Target</th>
                {!isViewOnly && <th className="px-6 py-4 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ottStreams.map((ott) => (
                <tr key={ott.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      disabled={isViewOnly}
                      className="w-full bg-transparent font-bold text-[#171844] outline-none"
                      value={ott.name}
                      onChange={e => updateOtt(ott.id, { name: e.target.value })}
                      placeholder="CNN International (OTT)"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      disabled={isViewOnly}
                      className="bg-transparent font-bold outline-none text-xs"
                      value={ott.type}
                      onChange={e => updateOtt(ott.id, { type: e.target.value as any })}
                    >
                      <option>HLS</option>
                      <option>DASH</option>
                      <option>MP4</option>
                      <option>OTHER</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      disabled={isViewOnly}
                      className="w-full bg-transparent text-xs font-mono text-[#0070C0] outline-none"
                      value={ott.sourceUrl}
                      onChange={e => updateOtt(ott.id, { sourceUrl: e.target.value })}
                      placeholder="http://server.com/playlist.m3u8"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        disabled={isViewOnly}
                        className="w-24 bg-transparent text-xs font-mono outline-none"
                        value={ott.multicastIp}
                        onChange={e => updateOtt(ott.id, { multicastIp: e.target.value })}
                      />
                      <span className="text-slate-300">:</span>
                      <input 
                        disabled={isViewOnly}
                        className="w-12 bg-transparent text-xs font-mono outline-none"
                        value={ott.port}
                        onChange={e => updateOtt(ott.id, { port: e.target.value })}
                      />
                    </div>
                  </td>
                  {!isViewOnly && (
                    <td className="px-6 py-4">
                      <button onClick={() => removeOtt(ott.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {ottStreams.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic text-sm">
                    No OTT streams configured for this site.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* Physical Streamers Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#171844] flex items-center gap-2">
              <Cpu size={24} className="text-[#87A237]" />
              Physical Streamer Gateways
            </h2>
            <p className="text-slate-500 font-medium text-sm">RF-to-IP decryption mapping for site-local hardware</p>
          </div>
          {!isViewOnly && (
            <button 
              onClick={addStreamer}
              className="flex items-center gap-2 px-6 py-3 bg-[#87A237] text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-100 hover:scale-105 transition-all"
            >
              <Plus size={20} />
              Add Streamer Unit
            </button>
          )}
        </div>

        <div className="space-y-6">
          {streamers.map((streamer, index) => (
            <StreamerUnitCard 
              key={streamer.id}
              streamer={streamer}
              onUpdate={(updates) => updateStreamer(streamer.id, updates)}
              onRemove={() => removeStreamer(streamer.id)}
              isExpanded={expandedUnits.includes(streamer.id)}
              onToggle={() => toggleExpand(streamer.id)}
              isViewOnly={isViewOnly}
              unitIndex={index + 1}
            />
          ))}

          {streamers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <Radio size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Physical Streamers Provisioned</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StreamerUnitCard = ({ streamer, onUpdate, onRemove, isExpanded, onToggle, isViewOnly, unitIndex }: any) => {
  const handleIfaceChange = (type: keyof typeof streamer.interfaces, field: keyof NetworkInterface, value: string) => {
    const updatedInterfaces = { ...streamer.interfaces };
    updatedInterfaces[type] = { ...updatedInterfaces[type], [field]: value };
    onUpdate({ interfaces: updatedInterfaces });
  };

  const addTuner = () => {
    const newTuner: TvTuner = {
      id: `tuner-${Date.now()}`,
      source: 'Astra 19.2E',
      frequency: '',
      polarity: 'H',
      symbolRate: '27500',
      diseqc: 'None',
      camSlot: 'None',
      smartCardId: '',
      channels: []
    };
    onUpdate({ tuners: [...streamer.tuners, newTuner] });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div 
        className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-[#171844] text-white' : 'hover:bg-slate-50'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isExpanded ? 'bg-white/10' : 'bg-[#E9F2F8] text-[#0070C0]'}`}>
            <Cpu size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Unit #{unitIndex}: {streamer.type}</h3>
            <p className={`text-xs font-bold uppercase tracking-widest ${isExpanded ? 'text-slate-400' : 'text-slate-400'}`}>
              SN: {streamer.serialNumber || 'PENDING'} • {streamer.tuners.length} Tuners Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isViewOnly && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className={`p-2 rounded-lg transition-colors ${isExpanded ? 'text-slate-400 hover:text-red-400 hover:bg-white/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
            >
              <Trash2 size={20} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 space-y-10 animate-in fade-in duration-300">
          {/* Section 1: Hardware & Auth */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6 lg:col-span-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Settings size={14} /> Basic Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hardware Model</label>
                  <select 
                    disabled={isViewOnly}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    value={streamer.type}
                    onChange={e => onUpdate({ type: e.target.value })}
                  >
                    {STREAMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Serial Number</label>
                  <input 
                    disabled={isViewOnly}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-sm"
                    value={streamer.serialNumber}
                    onChange={e => onUpdate({ serialNumber: e.target.value })}
                    placeholder="S/N: 2024-XXXX"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Streamer Management VPN</label>
                  <input 
                    disabled={isViewOnly}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    value={streamer.vpn}
                    onChange={e => onUpdate({ vpn: e.target.value })}
                    placeholder="ovpn-gateway-de-berlin.nonius.site"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Lock size={14} /> Authentication
              </h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gateway User</label>
                  <input disabled={isViewOnly} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" value={streamer.credsUser} onChange={e => onUpdate({credsUser: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gateway Password</label>
                  <input disabled={isViewOnly} type="password" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" value={streamer.credsPass} onChange={e => onUpdate({credsPass: e.target.value})} />
                 </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Network Interfaces */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Network size={14} /> Port Mapping & IP Interfaces
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase">Interface</th>
                    <th className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase">Address</th>
                    <th className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase">Netmask</th>
                    <th className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase">Gateway</th>
                    <th className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase">Mapping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(['management', 'streaming', 'auxiliary'] as const).map(ifaceKey => (
                    <tr key={ifaceKey} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#171844] capitalize">{ifaceKey}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <input 
                            disabled={isViewOnly}
                            className="bg-slate-100 border-none rounded px-2 py-0.5 text-[10px] font-mono w-16"
                            value={streamer.interfaces[ifaceKey].iface}
                            onChange={e => handleIfaceChange(ifaceKey, 'iface', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono text-xs"
                          value={streamer.interfaces[ifaceKey].ip}
                          onChange={e => handleIfaceChange(ifaceKey, 'ip', e.target.value)}
                          placeholder="0.0.0.0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono text-xs"
                          value={streamer.interfaces[ifaceKey].mask}
                          onChange={e => handleIfaceChange(ifaceKey, 'mask', e.target.value)}
                          placeholder="255.255.255.0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none font-mono text-xs"
                          value={streamer.interfaces[ifaceKey].gateway}
                          onChange={e => handleIfaceChange(ifaceKey, 'gateway', e.target.value)}
                          placeholder="0.0.0.0"
                        />
                      </td>
                      <td className="px-6 py-4 italic text-slate-400 text-xs">
                        <input 
                          disabled={isViewOnly}
                          className="w-full bg-transparent outline-none"
                          value={streamer.interfaces[ifaceKey].notes}
                          onChange={e => handleIfaceChange(ifaceKey, 'notes', e.target.value)}
                          placeholder="Patch panel A14..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Tuners */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Radio size={14} /> Tuner & Signal Mapping
              </h4>
              {!isViewOnly && (
                <button 
                  onClick={addTuner}
                  className="px-4 py-2 bg-[#0070C0] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add Tuner Slot
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {streamer.tuners.map((tuner: TvTuner, tIdx: number) => (
                <TunerConfigPanel 
                  key={tuner.id}
                  tuner={tuner}
                  onUpdate={(updates: Partial<TvTuner>) => {
                    const newTuners = [...streamer.tuners];
                    newTuners[tIdx] = { ...newTuners[tIdx], ...updates };
                    onUpdate({ tuners: newTuners });
                  }}
                  onRemove={() => {
                    onUpdate({ tuners: streamer.tuners.filter((t: TvTuner) => t.id !== tuner.id) });
                  }}
                  isViewOnly={isViewOnly}
                  tunerIndex={tIdx}
                />
              ))}
              {streamer.tuners.length === 0 && (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Tuners Defined</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TunerConfigPanel = ({ tuner, onUpdate, onRemove, isViewOnly, tunerIndex }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addChannel = () => {
    const newChannel: TvChannel = {
      id: `chan-${Date.now()}`,
      name: '',
      multicastIp: '239.192.1.' + (tunerIndex + 1),
      port: '5000',
      scrambled: false
    };
    onUpdate({ channels: [...tuner.channels, newChannel] });
  };

  const updateChannel = (cId: string, updates: Partial<TvChannel>) => {
    onUpdate({
      channels: tuner.channels.map((c: TvChannel) => c.id === cId ? { ...c, ...updates } : c)
    });
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <div 
        className="px-6 py-4 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#171844] font-black text-xs">
            {tunerIndex}
          </div>
          <span className="font-bold text-sm text-[#171844]">Tuner {tunerIndex}: {tuner.source} ({tuner.frequency || 'No Freq'})</span>
        </div>
        <div className="flex items-center gap-3">
           {!isViewOnly && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
            </button>
           )}
           {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Frequency (MHz)</label>
              <input disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={tuner.frequency} onChange={e => onUpdate({frequency: e.target.value})} placeholder="11362" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Polarity</label>
              <select disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={tuner.polarity} onChange={e => onUpdate({polarity: e.target.value})}>
                <option value="H">Horizontal</option>
                <option value="V">Vertical</option>
                <option value="L">Left Circle</option>
                <option value="R">Right Circle</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Symbol Rate</label>
              <input disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={tuner.symbolRate} onChange={e => onUpdate({symbolRate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">CAM Slot</label>
              <select disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={tuner.camSlot} onChange={e => onUpdate({camSlot: e.target.value})}>
                <option>None</option>
                <option>Viaccess Module</option>
                <option>Conax Module</option>
                <option>Nagravision Module</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <List size={12} /> Channel Mapping
                </h5>
                {!isViewOnly && (
                  <button 
                    onClick={addChannel}
                    className="text-[10px] font-bold text-[#0070C0] hover:underline"
                  >
                    + Add Multicast Map
                  </button>
                )}
             </div>

             <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-400 uppercase">Channel Name</th>
                      <th className="px-4 py-2 font-bold text-slate-400 uppercase">Multicast IP</th>
                      <th className="px-4 py-2 font-bold text-slate-400 uppercase text-center w-20">Port</th>
                      <th className="px-4 py-2 font-bold text-slate-400 uppercase text-center w-20">Encrypted</th>
                      {!isViewOnly && <th className="w-10"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tuner.channels.map((chan: TvChannel) => {
                      const isValidIp = MULTICAST_REGEX.test(chan.multicastIp);
                      return (
                        <tr key={chan.id} className="hover:bg-slate-50/30">
                          <td className="px-4 py-2">
                            <input 
                              disabled={isViewOnly}
                              className="w-full bg-transparent outline-none font-bold text-[#171844]"
                              value={chan.name}
                              onChange={e => updateChannel(chan.id, { name: e.target.value })}
                              placeholder="e.g. CNN International"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <input 
                                disabled={isViewOnly}
                                className={`w-full bg-transparent outline-none font-mono ${isValidIp ? 'text-slate-600' : 'text-red-500 bg-red-50'}`}
                                value={chan.multicastIp}
                                onChange={e => updateChannel(chan.id, { multicastIp: e.target.value })}
                              />
                              {!isValidIp && (
                                <span title="Invalid Multicast Range (224-239)">
                                  <CircleAlert size={14} className="text-red-500" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input 
                              disabled={isViewOnly}
                              className="w-full bg-transparent outline-none text-center font-mono"
                              value={chan.port}
                              onChange={e => updateChannel(chan.id, { port: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input 
                              disabled={isViewOnly}
                              type="checkbox" 
                              className="accent-[#0070C0]"
                              checked={chan.scrambled}
                              onChange={e => updateChannel(chan.id, { scrambled: e.target.checked })}
                            />
                          </td>
                          {!isViewOnly && (
                            <td className="px-2">
                              <button 
                                onClick={() => onUpdate({ channels: tuner.channels.filter((c: TvChannel) => c.id !== chan.id) })}
                                className="p-1 text-slate-200 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {tuner.channels.length === 0 && (
                  <div className="p-6 text-center text-slate-300 italic text-[10px]">No channels mapped yet.</div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamerHeadend;
