
import React, { useState } from 'react';
/* Updated icon names */
import { Package, Globe, List, Plus, Trash2, Import, Wifi, Clock, CircleCheck, TriangleAlert, ChevronDown, ChevronUp, Save, RefreshCw, Smartphone, Settings } from 'lucide-react';
import { DongleStock, DongleGlobalConfig, DongleRoomRow, UserRole } from '../types';
import { MAC_REGEX } from '../constants';

interface DongleInventoryProps {
  data: {
    stock: DongleStock;
    globalConfig: DongleGlobalConfig;
    roomRows: DongleRoomRow[];
  };
  onUpdate: (updatedData: DongleInventoryProps['data']) => void;
  role: UserRole;
}

const DongleInventory: React.FC<DongleInventoryProps> = ({ data, onUpdate, role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const [showOverrides, setShowOverrides] = useState<string | null>(null);

  const handleStockChange = (field: keyof DongleStock, value: string) => {
    onUpdate({ ...data, stock: { ...data.stock, [field]: parseInt(value) || 0 } });
  };

  const handleGlobalChange = (field: keyof DongleGlobalConfig, value: string) => {
    onUpdate({ ...data, globalConfig: { ...data.globalConfig, [field]: value } });
  };

  const applyGlobalToAll = () => {
    if (window.confirm("This will overwrite SSID, Password, Timezone, and Language for ALL existing room rows. Continue?")) {
      const updatedRows = data.roomRows.map(row => ({
        ...row,
        ssid: undefined, // Remove overrides so they inherit
        password: undefined,
        timezone: undefined,
        language: undefined
      }));
      onUpdate({ ...data, roomRows: updatedRows });
    }
  };

  const addRow = () => {
    const newRow: DongleRoomRow = {
      id: `room-${Date.now()}`,
      room: '',
      sn: '',
      mac: '00:00:00:00:00:00',
      state: 'Pending',
      signal: '-60',
      notes: ''
    };
    onUpdate({ ...data, roomRows: [newRow, ...data.roomRows] });
  };

  const updateRow = (id: string, updates: Partial<DongleRoomRow>) => {
    onUpdate({ ...data, roomRows: data.roomRows.map(r => r.id === id ? { ...r, ...updates } : r) });
  };

  const removeRow = (id: string) => {
    onUpdate({ ...data, roomRows: data.roomRows.filter(r => r.id !== id) });
  };

  const getSignalColor = (dBm: string) => {
    const val = parseInt(dBm);
    if (val >= -60) return 'text-emerald-500';
    if (val >= -75) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Section 1: Stock & Spares */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-[#171844] text-white flex items-center gap-3">
          <Package size={20} className="text-[#87A237]" />
          <h3 className="font-bold text-sm uppercase tracking-widest">Section 1: Stock & Spares (BOM)</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Homatics 4K Units', key: 'homatics4k' },
            { label: 'Homatics SPARES', key: 'homaticsSpares' },
            { label: 'USB-C Eth Adapters', key: 'ethAdapters' },
            { label: 'BT Remotes (NR-21B)', key: 'remotes' },
            { label: 'Remote SPARES', key: 'remoteSpares' },
            { label: 'Cover Box Kits', key: 'coverBoxes' },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  disabled={isViewOnly}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#171844]"
                  value={data.stock[item.key as keyof DongleStock]}
                  onChange={(e) => handleStockChange(item.key as keyof DongleStock, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Global Configuration */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-[#171844] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-[#87A237]" />
            <h3 className="font-bold text-sm uppercase tracking-widest">Section 2: Global Configuration (Defaults)</h3>
          </div>
          {!isViewOnly && (
            <button 
              onClick={applyGlobalToAll}
              className="px-4 py-1.5 bg-[#87A237] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-opacity-90 transition-all"
            >
              <RefreshCw size={14} /> Apply Defaults to All Rows
            </button>
          )}
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Default SSID</label>
              <input disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={data.globalConfig.ssid} onChange={e => handleGlobalChange('ssid', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Security</label>
              <select disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={data.globalConfig.security} onChange={e => handleGlobalChange('security', e.target.value)}>
                <option>WPA2</option>
                <option>WPA3</option>
                <option>Open</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <input disabled={isViewOnly} type="password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={data.globalConfig.password} onChange={e => handleGlobalChange('password', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Time Zone</label>
              <select disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={data.globalConfig.timezone} onChange={e => handleGlobalChange('timezone', e.target.value)}>
                <option>UTC (GMT+0)</option>
                <option>CET (GMT+1)</option>
                <option>EET (GMT+2)</option>
                <option>EST (GMT-5)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
              <select disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={data.globalConfig.language} onChange={e => handleGlobalChange('language', e.target.value)}>
                <option>English</option>
                <option>Portuguese</option>
                <option>Spanish</option>
                <option>German</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Time Format</label>
              <select disabled={isViewOnly} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={data.globalConfig.timeFormat} onChange={e => handleGlobalChange('timeFormat', e.target.value)}>
                <option>24h</option>
                <option>12h</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Room Inventory Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-[#171844] text-white flex items-center justify-center">
                <List size={20} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-[#171844]">Room Device Inventory</h3>
                <p className="text-xs text-slate-400 font-medium">Detailed tracking per endpoint unit</p>
             </div>
          </div>
          <div className="flex gap-3">
            {!isViewOnly && (
              <>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Import size={16} /> Import CSV
                </button>
                <button 
                  onClick={addRow}
                  className="flex items-center gap-2 px-6 py-2 bg-[#87A237] text-white rounded-xl text-xs font-bold shadow-lg shadow-green-100"
                >
                  <Plus size={16} /> Add Room
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left table-fixed">
              <thead className="bg-[#171844] text-white">
                <tr className="text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4 w-24">Room #</th>
                  <th className="px-6 py-4 w-48">Serial Number</th>
                  <th className="px-6 py-4 w-48">WiFi MAC</th>
                  <th className="px-6 py-4 w-32 text-center">State</th>
                  <th className="px-6 py-4 w-24 text-center">Signal</th>
                  <th className="px-6 py-4">Observations</th>
                  {!isViewOnly && <th className="px-6 py-4 w-20 text-right"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.roomRows.map((row) => {
                  const isMacValid = MAC_REGEX.test(row.mac);
                  const activeOverrides = showOverrides === row.id;
                  
                  return (
                    <React.Fragment key={row.id}>
                      <tr className={`hover:bg-slate-50/50 group transition-colors ${activeOverrides ? 'bg-slate-50/80' : ''}`}>
                        <td className="px-6 py-3">
                          <input 
                            disabled={isViewOnly}
                            className="w-full bg-transparent font-bold text-[#171844] outline-none"
                            value={row.room}
                            onChange={e => updateRow(row.id, { room: e.target.value })}
                            placeholder="---"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            disabled={isViewOnly}
                            className="w-full bg-transparent text-xs font-mono outline-none"
                            value={row.sn}
                            onChange={e => updateRow(row.id, { sn: e.target.value })}
                            placeholder="SN-XXXX"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            disabled={isViewOnly}
                            className={`w-full bg-transparent text-xs font-mono outline-none ${isMacValid ? 'text-slate-600' : 'text-red-500 font-bold'}`}
                            value={row.mac}
                            onChange={e => updateRow(row.id, { mac: e.target.value })}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select 
                            disabled={isViewOnly}
                            className="w-full bg-transparent text-[10px] font-bold uppercase outline-none text-center"
                            value={row.state}
                            onChange={e => updateRow(row.id, { state: e.target.value as any })}
                          >
                            <option>Pending</option>
                            <option>Online</option>
                            <option>Offline</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <input 
                              disabled={isViewOnly}
                              className={`w-12 bg-transparent text-xs font-bold outline-none text-center ${getSignalColor(row.signal)}`}
                              value={row.signal}
                              onChange={e => updateRow(row.id, { signal: e.target.value })}
                            />
                            <span className="text-[8px] font-bold text-slate-300">dBm</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <input 
                              disabled={isViewOnly}
                              className="w-full bg-transparent text-xs italic text-slate-400 outline-none"
                              value={row.notes}
                              onChange={e => updateRow(row.id, { notes: e.target.value })}
                              placeholder="No issues..."
                            />
                            <button 
                              onClick={() => setShowOverrides(activeOverrides ? null : row.id)}
                              className={`p-1 rounded hover:bg-slate-200 transition-colors ${activeOverrides ? 'text-[#0070C0] bg-blue-50' : 'text-slate-300'}`}
                            >
                              <Settings size={14} />
                            </button>
                          </div>
                        </td>
                        {!isViewOnly && (
                          <td className="px-6 py-3 text-right">
                             <button onClick={() => removeRow(row.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Trash2 size={16} />
                             </button>
                          </td>
                        )}
                      </tr>
                      {activeOverrides && (
                        <tr className="bg-slate-100/50 animate-in slide-in-from-top-2 duration-200">
                          <td colSpan={7} className="px-12 py-6 border-l-4 border-[#0070C0]">
                            <div className="grid grid-cols-4 gap-8">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Override SSID</label>
                                  <input 
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                                    value={row.ssid ?? data.globalConfig.ssid}
                                    placeholder={`Inherited: ${data.globalConfig.ssid}`}
                                    onChange={e => updateRow(row.id, { ssid: e.target.value })}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Override Password</label>
                                  <input 
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                                    value={row.password ?? data.globalConfig.password}
                                    onChange={e => updateRow(row.id, { password: e.target.value })}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Room Timezone</label>
                                  <select 
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                    value={row.timezone ?? data.globalConfig.timezone}
                                    onChange={e => updateRow(row.id, { timezone: e.target.value })}
                                  >
                                    <option>UTC (GMT+0)</option>
                                    <option>CET (GMT+1)</option>
                                    <option>EST (GMT-5)</option>
                                  </select>
                               </div>
                               <div className="flex items-end">
                                  <button 
                                    onClick={() => updateRow(row.id, { ssid: undefined, password: undefined, timezone: undefined, language: undefined })}
                                    className="text-[9px] font-bold text-[#0070C0] uppercase hover:underline"
                                  >
                                    Reset to Global Defaults
                                  </button>
                               </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
           </table>
           {data.roomRows.length === 0 && (
             <div className="p-20 text-center flex flex-col items-center gap-4">
                <Smartphone size={48} className="text-slate-200" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Room Inventory Empty</p>
                <button onClick={addRow} className="text-[#0070C0] font-bold text-xs hover:underline">Click to add your first room row</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DongleInventory;
