
import React, { useState, useEffect } from 'react';
import { Layout, Plus, Trash2, Settings, Server, Printer, Monitor, Activity, Shield, Battery, ChevronRight, Hash, Edit3, X, Box } from 'lucide-react';
import { Project, Rack, RackDevice, UserRole } from '../types';

const DEVICE_TEMPLATES = [
  { type: 'cable_guide', label: 'Cable Guide', height: 1, color: 'bg-slate-200 text-slate-500' },
  { type: 'patch_panel_24p', label: 'Patch Panel 24P', height: 1, color: 'bg-slate-300 text-slate-600' },
  { type: 'switch_core', label: 'Core Switch', height: 1, color: 'bg-[#171844] text-white' },
  { type: 'switch_access', label: 'Access Switch', height: 1, color: 'bg-[#0070C0] text-white' },
  { type: 'fortigate', label: 'Security GW', height: 1, color: 'bg-red-600 text-white' },
  { type: 'nonius_tv', label: 'IPTV Server', height: 1, color: 'bg-[#171844] text-white', isNonius: true },
  { type: 'nonius_cast', label: 'Cast Server', height: 1, color: 'bg-[#171844] text-white', isNonius: true },
  { type: 'ups', label: 'UPS Unit', height: 2, color: 'bg-orange-500 text-white' },
  { type: 'generic_1u', label: 'Generic Device', height: 1, color: 'bg-slate-500 text-white' },
  { type: 'generic_2u', label: 'Generic Device (2U)', height: 2, color: 'bg-slate-500 text-white' },
  { type: 'generic_4u', label: 'Generic Device (4U)', height: 4, color: 'bg-slate-500 text-white' },
];

interface RackBuilderProps {
  project: Project;
  onUpdate: (config: { racks: Rack[] }) => void;
  role: UserRole;
  initialRackId?: string;
}

const RackBuilder: React.FC<RackBuilderProps> = ({ project, onUpdate, role, initialRackId }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const config = project.rackConfig || { racks: [{ id: 'rack-1', name: 'Main MDF', height: 42, devices: [] }] };
  const [activeRackId, setActiveRackId] = useState(config.racks[0].id);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    if (initialRackId) {
        const exists = config.racks.find(r => r.id === initialRackId);
        if (exists) setActiveRackId(initialRackId);
    }
  }, [initialRackId]);

  const activeRack = config.racks.find(r => r.id === activeRackId) || config.racks[0];
  const selectedDevice = activeRack.devices.find(d => d.id === selectedDeviceId);

  const addRack = () => {
    if (isViewOnly) return;
    const newRack: Rack = { id: `rack-${Date.now()}`, name: 'New IDF', height: 42, devices: [] };
    onUpdate({ racks: [...config.racks, newRack] });
    setActiveRackId(newRack.id);
  };

  const removeRack = (id: string) => {
    if (isViewOnly || config.racks.length <= 1) return;
    const newRacks = config.racks.filter(r => r.id !== id);
    onUpdate({ racks: newRacks });
    setActiveRackId(newRacks[0].id);
  };

  const placeDevice = (uPosition: number) => {
    if (isViewOnly) {
        // If clicking a device in view only, just select it
        const existing = activeRack.devices.find(d => uPosition <= d.uPosition && uPosition > (d.uPosition - d.height));
        if (existing) setSelectedDeviceId(existing.id);
        return;
    }

    if (!selectedTemplate) {
        // If no template selected, check if we clicked an existing device to select it
        const existing = activeRack.devices.find(d => uPosition <= d.uPosition && uPosition > (d.uPosition - d.height));
        if (existing) {
            setSelectedDeviceId(existing.id);
        }
        return;
    }

    // Check collision
    const isOccupied = activeRack.devices.some(d => 
      uPosition <= d.uPosition && uPosition > (d.uPosition - d.height)
    );
    
    // If occupied, maybe we want to replace or select? For now, let's select.
    if (isOccupied) {
       const existing = activeRack.devices.find(d => uPosition <= d.uPosition && uPosition > (d.uPosition - d.height));
       if (existing) setSelectedDeviceId(existing.id);
       setSelectedTemplate(null); // Deselect template to avoid confusion
       return;
    }

    // Check boundary
    if (uPosition - selectedTemplate.height < 0) {
        alert("Not enough space at bottom!");
        return;
    }

    const newDevice: RackDevice = {
      id: `dev-${Date.now()}`,
      uPosition,
      height: selectedTemplate.height,
      label: selectedTemplate.label,
      type: selectedTemplate.type,
      isNonius: !!selectedTemplate.isNonius
    };

    const updatedRacks = config.racks.map(r => 
      r.id === activeRackId ? { ...r, devices: [...r.devices, newDevice] } : r
    );
    onUpdate({ racks: updatedRacks });
    setSelectedTemplate(null);
    setSelectedDeviceId(newDevice.id); // Auto-select new device for renaming
  };

  const removeDevice = (deviceId: string) => {
    if (isViewOnly) return;
    const updatedRacks = config.racks.map(r => 
      r.id === activeRackId ? { ...r, devices: r.devices.filter(d => d.id !== deviceId) } : r
    );
    onUpdate({ racks: updatedRacks });
    setSelectedDeviceId(null);
  };

  const updateSelectedDevice = (updates: Partial<RackDevice>) => {
      if (!selectedDeviceId || isViewOnly) return;
      const updatedRacks = config.racks.map(r => {
          if (r.id === activeRackId) {
              return {
                  ...r,
                  devices: r.devices.map(d => d.id === selectedDeviceId ? { ...d, ...updates } : d)
              };
          }
          return r;
      });
      onUpdate({ racks: updatedRacks });
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isPrintMode ? 'bg-white p-10 min-h-screen' : ''}`}>
      {/* Tab Navigation */}
      {!isPrintMode && (
        <div className="flex items-center justify-between">
          <div className="flex p-1 bg-slate-200/50 rounded-2xl gap-1 overflow-x-auto max-w-[70vw] scrollbar-hide">
            {config.racks.map(rack => (
              <button
                key={rack.id}
                onClick={() => { setActiveRackId(rack.id); setSelectedDeviceId(null); }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeRackId === rack.id ? 'bg-white text-[#171844] shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                <Layout size={14} />
                {rack.name}
              </button>
            ))}
            {!isViewOnly && (
              <button onClick={addRack} className="p-2 text-slate-400 hover:text-[#171844]"><Plus size={18}/></button>
            )}
          </div>
          <button 
            onClick={() => setIsPrintMode(!isPrintMode)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 shrink-0"
          >
            <Printer size={16} /> {isPrintMode ? 'Exit Schematic' : 'Print Mode'}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Device Palette - Mobile: Horizontal Scroll, Desktop: Vertical Sticky */}
        {!isPrintMode && !isViewOnly && (
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Equipment Library</h3>
            <div className="flex lg:grid lg:grid-cols-1 gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                {DEVICE_TEMPLATES.map(temp => (
                  <button
                    key={temp.type}
                    onClick={() => { setSelectedTemplate(temp); setSelectedDeviceId(null); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all min-w-[200px] lg:min-w-0 ${
                      selectedTemplate?.type === temp.type ? 'border-[#0070C0] bg-blue-50 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${temp.color}`}>
                        <Box size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#171844] truncate">{temp.label}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{temp.height}U Unit</p>
                      </div>
                  </button>
                ))}
            </div>
            
            {selectedTemplate && (
              <div className="mt-4 p-4 bg-[#87A237]/10 border border-[#87A237]/30 rounded-2xl animate-pulse hidden lg:block">
                <p className="text-[10px] font-bold text-[#87A237] uppercase mb-1 tracking-widest">Active Tool</p>
                <p className="text-xs text-slate-700 font-medium">Click a rack slot to place <span className="font-bold">{selectedTemplate.label}</span></p>
              </div>
            )}
          </aside>
        )}

        {/* Rack Visualizer */}
        <div className="flex-1 w-full flex justify-center bg-slate-50 rounded-[3rem] p-4 lg:p-12 border border-slate-200 shadow-inner">
          <div className="relative">
             {/* Rack Frame */}
             <div className="bg-[#1e1f26] border-[8px] border-[#2d2f3b] rounded-lg shadow-2xl w-[300px] sm:w-[320px] relative overflow-hidden" style={{ minHeight: '1200px' }}>
                <div className="absolute inset-x-0 top-4 bottom-4 flex flex-col">
                  {Array.from({ length: activeRack.height }).map((_, idx) => {
                    const u = activeRack.height - idx;
                    const deviceInSlot = activeRack.devices.find(d => d.uPosition === u);
                    const isPartOfDevice = activeRack.devices.find(d => u < d.uPosition && u > (d.uPosition - d.height));

                    if (isPartOfDevice) return null; // Slot consumed by multi-U device

                    return (
                      <div 
                        key={u}
                        onClick={() => placeDevice(u)}
                        style={{ height: deviceInSlot ? `${deviceInSlot.height * 28}px` : '28px' }}
                        className={`relative w-full border-b border-white/5 transition-colors group flex items-center px-4 ${
                          deviceInSlot 
                            ? (selectedDeviceId === deviceInSlot.id ? 'bg-[#0070C0] ring-2 ring-white z-10' : deviceInSlot.isNonius ? 'bg-[#171844]' : 'bg-slate-500') 
                            : (selectedTemplate ? 'hover:bg-blue-500/20 cursor-pointer' : 'bg-transparent')
                        }`}
                      >
                        {/* Rack Numbers */}
                        <div className="absolute -left-8 text-[9px] font-black text-slate-400 select-none">{u}</div>
                        
                        {deviceInSlot ? (
                          <div className="w-full h-full flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                                <Server size={12} className="text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{deviceInSlot.label}</p>
                                <p className="text-[8px] text-white/40 font-bold tracking-widest">{deviceInSlot.isNonius ? 'NONIUS' : 'HARDWARE'}</p>
                              </div>
                            </div>
                            {selectedDeviceId === deviceInSlot.id && (
                                <div className="bg-white text-[#0070C0] p-1 rounded-full shadow-sm">
                                    <Edit3 size={10} />
                                </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <div className="h-[2px] w-4 bg-white/20 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
             </div>
             
             {/* Rack Details */}
             <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                   <div className="w-3 h-3 rounded bg-[#171844]"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nonius</span>
                   <div className="w-3 h-3 rounded bg-slate-500 ml-4"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Other</span>
                </div>
                <h4 className="text-xl font-bold text-[#171844]">{activeRack.name}</h4>
             </div>
          </div>
        </div>

        {/* Right Inspector: Rack OR Device Settings */}
        {!isPrintMode && (
          <aside className="w-full lg:w-80 space-y-6 shrink-0 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl lg:sticky lg:top-24">
             {selectedDevice ? (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#171844] uppercase tracking-widest flex items-center gap-2">
                            <Settings size={16} className="text-[#0070C0]" /> Device Config
                        </h3>
                        <button onClick={() => setSelectedDeviceId(null)} className="text-slate-300 hover:text-slate-500"><X size={18}/></button>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Position</p>
                        <p className="text-lg font-black text-[#171844]">U-{selectedDevice.uPosition} <span className="text-sm text-slate-400 font-medium">({selectedDevice.height}U Height)</span></p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Device Label</label>
                        <input 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0070C0] text-sm font-bold"
                            value={selectedDevice.label}
                            onChange={(e) => updateSelectedDevice({ label: e.target.value })}
                            placeholder="e.g. Switch 1"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type Classification</label>
                        <select 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                            value={selectedDevice.type}
                            onChange={(e) => updateSelectedDevice({ type: e.target.value })}
                        >
                            {DEVICE_TEMPLATES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex-1">
                            <input 
                                type="checkbox" 
                                checked={selectedDevice.isNonius}
                                onChange={(e) => updateSelectedDevice({ isNonius: e.target.checked })}
                                className="w-4 h-4 rounded accent-[#171844]"
                            />
                            <span className="text-xs font-bold text-slate-600">Nonius Device</span>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => removeDevice(selectedDevice.id)}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} /> Remove Device
                        </button>
                    </div>
                 </div>
             ) : (
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings size={18} className="text-slate-400" />
                        <h3 className="text-sm font-black text-[#171844] uppercase tracking-widest">Rack Settings</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rack Alias</label>
                        <input 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0070C0] text-sm font-bold"
                            value={activeRack.name}
                            onChange={(e) => {
                            const updatedRacks = config.racks.map(r => r.id === activeRackId ? { ...r, name: e.target.value } : r);
                            onUpdate({ racks: updatedRacks });
                            }}
                        />
                        </div>
                        <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Capacity (U)</label>
                        <input 
                            type="number"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0070C0] text-sm"
                            value={activeRack.height}
                            onChange={(e) => {
                            const updatedRacks = config.racks.map(r => r.id === activeRackId ? { ...r, height: parseInt(e.target.value) } : r);
                            onUpdate({ racks: updatedRacks });
                            }}
                        />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Space Utilization</h4>
                        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                        {(() => {
                            const occupied = activeRack.devices.reduce((acc, d) => acc + d.height, 0);
                            const percent = (occupied / activeRack.height) * 100;
                            return <div className="absolute inset-y-0 left-0 bg-[#87A237] transition-all" style={{ width: `${percent}%` }}></div>;
                        })()}
                        </div>
                        <p className="text-xs font-bold text-[#171844] flex justify-between">
                        <span>{activeRack.devices.reduce((acc, d) => acc + d.height, 0)} U Used</span>
                        <span className="text-slate-400">{activeRack.height} U Total</span>
                        </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-[#0070C0] text-xs font-medium text-center">
                        Select a device in the rack to edit details.
                    </div>
                 </div>
             )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default RackBuilder;
