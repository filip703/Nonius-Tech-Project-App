
import React, { useState, useEffect } from 'react';
import { Layout, Plus, Trash2, Settings, Server, Printer, Monitor, Activity, Shield, Battery, ChevronRight, Hash } from 'lucide-react';
import { Project, Rack, RackDevice, UserRole } from '../types';

const DEVICE_TEMPLATES = [
  { type: 'cable_guide', label: 'Cable Guide', height: 1, color: 'bg-slate-200' },
  { type: 'patch_panel_fo', label: 'Patch Panel FO', height: 1, color: 'bg-slate-300' },
  { type: 'patch_panel_24p', label: 'Patch Panel 24P', height: 1, color: 'bg-slate-300' },
  { type: 'switch_core', label: 'Core Switch', height: 1, color: 'bg-[#171844] text-white' },
  { type: 'switch_access', label: 'Access Switch', height: 1, color: 'bg-[#0070C0] text-white' },
  { type: 'fortigate', label: 'Internet GW (FortiGate)', height: 1, color: 'bg-red-500 text-white' },
  { type: 'nonius_tv', label: 'IPTV Backend', height: 1, color: 'bg-[#171844] text-white', isNonius: true },
  { type: 'nonius_cast', label: 'Cast Controller', height: 1, color: 'bg-[#171844] text-white', isNonius: true },
  { type: 'ups', label: 'UPS Unit', height: 2, color: 'bg-orange-500 text-white' },
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
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Effect to set initial rack if provided
  useEffect(() => {
    if (initialRackId) {
        // If the rack exists, select it
        const exists = config.racks.find(r => r.id === initialRackId);
        if (exists) {
            setActiveRackId(initialRackId);
        } else {
            // Optional: Auto-create if it's a structural rack like MDF/IDF and doesn't exist?
            // For now, we default to the first one or let the parent handle creation
        }
    }
  }, [initialRackId]);

  const activeRack = config.racks.find(r => r.id === activeRackId) || config.racks[0];

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
    if (isViewOnly || !selectedTemplate) return;

    // Check collision
    const isOccupied = activeRack.devices.some(d => 
      uPosition <= d.uPosition && uPosition > (d.uPosition - d.height)
    );
    if (isOccupied) {
      alert("Slot occupied!");
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
  };

  const removeDevice = (deviceId: string) => {
    if (isViewOnly) return;
    const updatedRacks = config.racks.map(r => 
      r.id === activeRackId ? { ...r, devices: r.devices.filter(d => d.id !== deviceId) } : r
    );
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
                onClick={() => setActiveRackId(rack.id)}
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
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 shrink-0"
          >
            <Printer size={16} /> {isPrintMode ? 'Exit Schematic' : 'Print Mode'}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Device Palette */}
        {!isPrintMode && !isViewOnly && (
          <aside className="w-full lg:w-64 space-y-6 shrink-0 lg:sticky lg:top-24">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Equipment Library</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {DEVICE_TEMPLATES.map(temp => (
                  <button
                    key={temp.type}
                    onClick={() => setSelectedTemplate(temp)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      selectedTemplate?.type === temp.type ? 'border-[#0070C0] bg-blue-50 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${temp.color} flex items-center justify-center shrink-0`}>
                        <Server size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#171844]">{temp.label}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{temp.height}U Unit</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {selectedTemplate && (
              <div className="p-4 bg-[#87A237]/10 border border-[#87A237]/30 rounded-2xl animate-pulse">
                <p className="text-[10px] font-bold text-[#87A237] uppercase mb-1 tracking-widest">Active Tool</p>
                <p className="text-xs text-slate-700 font-medium">Click a rack slot to place <span className="font-bold">{selectedTemplate.label}</span></p>
              </div>
            )}
          </aside>
        )}

        {/* Rack Visualizer */}
        <div className="flex-1 w-full flex justify-center bg-slate-50 rounded-[3rem] p-6 lg:p-12 border border-slate-200 shadow-inner">
          <div className="relative">
             {/* Rack Frame */}
             <div className="bg-[#1e1f26] border-[8px] border-[#2d2f3b] rounded-lg shadow-2xl w-[320px] relative overflow-hidden" style={{ minHeight: '1200px' }}>
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
                            ? (deviceInSlot.isNonius ? 'bg-[#171844]' : 'bg-slate-500') 
                            : (selectedTemplate ? 'hover:bg-blue-500/20 cursor-pointer' : 'bg-transparent')
                        }`}
                      >
                        {/* Rack Numbers */}
                        <div className="absolute -left-8 text-[9px] font-black text-slate-400 select-none">{u}</div>
                        
                        {deviceInSlot ? (
                          <div className="w-full h-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                                <Server size={12} className="text-white" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter">{deviceInSlot.label}</p>
                                <p className="text-[8px] text-white/40 font-bold tracking-widest">{deviceInSlot.isNonius ? 'NONIUS TECH' : 'EXTERNAL'}</p>
                              </div>
                            </div>
                            {!isPrintMode && !isViewOnly && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeDevice(deviceInSlot.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all text-white/50 hover:text-white"
                              >
                                <Trash2 size={12} />
                              </button>
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
             
             {/* Rack Handles & Details */}
             <div className="absolute top-0 -right-24 h-full flex flex-col py-20 gap-4">
                <div className="w-1 bg-[#2d2f3b] h-full rounded-full"></div>
             </div>

             <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                   <div className="w-3 h-3 rounded bg-[#171844]"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nonius Hardware</span>
                   <div className="w-3 h-3 rounded bg-slate-500 ml-4"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3rd Party / Hotel</span>
                </div>
                <h4 className="text-xl font-bold text-[#171844]">{activeRack.name} <span className="text-slate-300 ml-2">42U Chassis</span></h4>
             </div>
          </div>
        </div>

        {/* Rack Inspector */}
        {!isPrintMode && (
          <aside className="w-full lg:w-80 space-y-6 shrink-0 bg-white p-8 rounded-[2.5rem] border border-slate-200">
             <div className="flex items-center gap-2 mb-6">
                <Settings size={18} className="text-[#0070C0]" />
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
          </aside>
        )}
      </div>
    </div>
  );
};

export default RackBuilder;
