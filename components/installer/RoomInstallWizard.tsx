import React, { useState, useEffect } from 'react';
import { Device, Project, ModuleType } from '../../types';
import { useProjects } from '../../contexts/ProjectContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, Tv, Wifi, Smartphone, MonitorPlay, Share2, CheckCircle2, AlertTriangle, Save, Camera, ChevronDown, ChevronUp, AlertCircle, ListChecks, ArrowRight, Ban, ZapOff, MonitorOff, Phone } from 'lucide-react';
import BarcodeScanner from '../BarcodeScanner';

interface RoomSummary {
  room: string;
  floor: string;
  type: 'GUEST' | 'INFRA';
  status: 'Pending' | 'In Progress' | 'Complete' | 'Warning' | 'Issue';
  devices: Device[];
  rackId?: string;
}

interface RoomInstallWizardProps {
  project: Project;
  roomData: RoomSummary;
  allRooms?: RoomSummary[];
  onClose: () => void;
  onSwitchRoom?: (room: RoomSummary) => void;
}

const RoomInstallWizard: React.FC<RoomInstallWizardProps> = ({ project, roomData, allRooms, onClose, onSwitchRoom }) => {
  const { saveProject, currentUser } = useProjects();
  const { addNotification } = useNotifications();
  
  const [pendingNextRoom, setPendingNextRoom] = useState<RoomSummary | null>(null);
  
  // Local state for devices
  const initializeDevices = () => {
    if (roomData.devices.length > 0) return JSON.parse(JSON.stringify(roomData.devices));
    
    const newDevices: Device[] = [];
    
    // Auto-add devices based on active modules
    if (project.selectedModules.includes(ModuleType.TV)) {
        newDevices.push({ id: `new-tv-${Date.now()}`, name: 'Room TV', brand: 'Samsung', model: 'HG Series', macAddress: '', serialNumber: '', room: roomData.room, installed: false, ipAddress: '', notes: '[Type:TV]' });
    }
    
    if (project.selectedModules.includes(ModuleType.INTERNET)) {
        // Assume 1 AP per room if Internet module is active (as per requirements)
        newDevices.push({ id: `new-ap-${Date.now()}`, name: 'Access Point', brand: 'Ruckus', model: 'H550', macAddress: '', serialNumber: '', room: roomData.room, installed: false, ipAddress: '', notes: '[Type:WIFI]' });
    }
    
    if (project.selectedModules.includes(ModuleType.CAST)) {
        newDevices.push({ id: `new-cast-${Date.now()}`, name: 'Nonius Cast (Dongle)', brand: 'Nonius', model: 'Homatics', macAddress: '', serialNumber: '', room: roomData.room, installed: false, ipAddress: '', notes: '[Type:CAST]' });
    }

    if (project.selectedModules.includes(ModuleType.VOICE)) {
        newDevices.push({ id: `new-phone-${Date.now()}`, name: 'Nonius Voice (Phone)', brand: 'Mitel', model: '6920', macAddress: '', serialNumber: '', room: roomData.room, installed: false, ipAddress: '', notes: '[Type:VOICE]' });
    }

    return newDevices;
  };

  const [devices, setDevices] = useState<Device[]>(initializeDevices());
  const [scannerTarget, setScannerTarget] = useState<{ id: string, field: 'macAddress' | 'serialNumber' } | null>(null);
  
  // Track issues per device
  const [deviceIssues, setDeviceIssues] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
      const initialIssues: Record<string, Set<string>> = {};
      devices.forEach(d => {
          const match = d.notes?.match(/\[ISSUES?:(.*?)\]/);
          if (match) {
              const issues = match[1].split(',').map(s => s.trim()).filter(Boolean);
              initialIssues[d.id] = new Set(issues);
          } else {
              initialIssues[d.id] = new Set();
          }
      });
      setDeviceIssues(initialIssues);
  }, []);

  const [expandedSection, setExpandedSection] = useState<string | null>(
    project.selectedModules.includes(ModuleType.TV) ? 'TV' : 'WIFI'
  );

  const updateDevice = (id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const toggleIssue = (deviceId: string, issue: string) => {
      setDeviceIssues(prev => {
          const currentSet = new Set(prev[deviceId] || []);
          if (currentSet.has(issue)) {
              currentSet.delete(issue);
          } else {
              currentSet.add(issue);
          }
          return { ...prev, [deviceId]: currentSet };
      });
  };

  const performSave = () => {
    // 1. Sync Logic
    const newTvConfig = project.tvConfig ? { ...project.tvConfig } : undefined;
    const newWifiConfig = project.wifiConfig ? { ...project.wifiConfig } : undefined;
    const newCastConfig = project.castConfig ? { ...project.castConfig } : undefined;
    // Note: Voice config structure in types.ts is loose (any), so we might skip syncing specifics there for now or add basic inventory if extended.

    let totalIssues = 0;
    let criticalIssues = 0;

    devices.forEach(localDev => {
      const issuesSet = deviceIssues[localDev.id] || new Set();
      const issuesList = Array.from(issuesSet);
      totalIssues += issuesList.length;
      
      if (issuesList.some(i => ['Blocked Room', 'DND', 'No Power'].includes(i))) {
          criticalIssues++;
      }

      // Reconstruct Notes with issues tag
      let baseNotes = localDev.notes?.replace(/\[ISSUES?:.*?\]/g, '').trim() || '';
      if (issuesList.length > 0) {
          baseNotes += ` [ISSUES: ${issuesList.join(', ')}]`;
      }
      
      const installerNote = ` [Inst: ${currentUser.name}]`; 
      const finalNotes = (baseNotes + installerNote).trim();

      // Ensure 'installed' is false if blocked
      const isInstalled = issuesList.some(i => i.includes('Blocked') || i.includes('No Power')) ? false : localDev.installed;

      // Update Types
      // TV
      if (localDev.notes?.includes('Type:TV') || localDev.name.includes('TV')) {
        if (newTvConfig) {
            const idx = newTvConfig.inventory.findIndex(d => d.room === localDev.room);
            const payload = { ...localDev, installed: isInstalled, notes: finalNotes, installedBy: currentUser.name, installedAt: new Date().toISOString() };
            if (idx > -1) newTvConfig.inventory[idx] = payload;
            else newTvConfig.inventory.push({ ...payload, id: `tv-${localDev.room}` });
        }
      }
      // WIFI
      if (localDev.notes?.includes('Type:WIFI') || localDev.name.includes('Access Point')) {
        if (newWifiConfig) {
           const idx = newWifiConfig.inventory.findIndex(d => d.location === localDev.room);
           const apPayload = {
               id: idx > -1 ? newWifiConfig.inventory[idx].id : `ap-${localDev.room}`,
               name: localDev.name, location: localDev.room, brand: localDev.brand,
               mac: localDev.macAddress, ip: localDev.ipAddress, switchPort: '', vlanMgmt: '1', vlanHotspot: '10', channel: 'Auto', user: 'admin', pass: 'admin',
               installed: isInstalled, notes: finalNotes
           };
           if (idx > -1) newWifiConfig.inventory[idx] = apPayload;
           else newWifiConfig.inventory.push(apPayload);
        }
      }
      // CAST
      if (localDev.notes?.includes('Type:CAST') || localDev.name.includes('Cast') || localDev.name.includes('Dongle')) {
        if (newCastConfig) {
          const idx = newCastConfig.dongleInventory.roomRows.findIndex(d => d.room === localDev.room);
          const castPayload = {
              id: idx > -1 ? newCastConfig.dongleInventory.roomRows[idx].id : `cast-${localDev.room}`,
              room: localDev.room, sn: localDev.serialNumber, mac: localDev.macAddress,
              state: isInstalled ? 'Online' : 'Pending', signal: '-65', notes: finalNotes
          };
          if (idx > -1) newCastConfig.dongleInventory.roomRows[idx] = castPayload as any;
          else newCastConfig.dongleInventory.roomRows.push(castPayload as any);
        }
      }
      // VOICE (Logic placeholder as config structure is loose)
    });

    saveProject({
      ...project,
      tvConfig: newTvConfig,
      wifiConfig: newWifiConfig,
      castConfig: newCastConfig
    });

    if (criticalIssues > 0) {
        addNotification('ISSUE', `RED ALERT: Room ${roomData.room} marked as BLOCKED/ISSUE by ${currentUser.name}.`);
    } else if (totalIssues > 0) {
        addNotification('ISSUE', `WARNING: Room ${roomData.room} completed with issues by ${currentUser.name}.`);
    } else {
        addNotification('SUCCESS', `Room ${roomData.room} successfully commissioned by ${currentUser.name}.`);
    }
  };

  const handleSaveAndNext = () => {
    performSave();
    if (allRooms) {
        const currentIndex = allRooms.findIndex(r => r.room === roomData.room);
        if (currentIndex !== -1 && currentIndex < allRooms.length - 1) {
            setPendingNextRoom(allRooms[currentIndex + 1]);
        } else {
            onClose(); 
        }
    } else {
        onClose();
    }
  };

  const confirmNextRoom = () => {
    if (pendingNextRoom && onSwitchRoom) {
      setPendingNextRoom(null);
      onSwitchRoom(pendingNextRoom);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getDevicesByType = (type: string) => {
      if (type === 'TV') return devices.filter(d => d.name.includes('TV') || d.notes?.includes('Type:TV'));
      if (type === 'WIFI') return devices.filter(d => d.name.includes('Access Point') || d.notes?.includes('Type:WIFI'));
      if (type === 'CAST') return devices.filter(d => d.name.includes('Cast') || d.name.includes('Dongle') || d.notes?.includes('Type:CAST'));
      if (type === 'VOICE') return devices.filter(d => d.name.includes('Phone') || d.notes?.includes('Type:VOICE'));
      return [];
  };

  const renderDeviceSection = (title: string, type: string, icon: React.ReactNode, colorClass: string, checklist: string[]) => {
      const sectionDevices = getDevicesByType(type);
      if (sectionDevices.length === 0) return null;

      return (
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-200">
            <button 
              onClick={() => toggleSection(type)}
              className="w-full p-6 flex items-center justify-between bg-slate-50 border-b border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                  {icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[#171844]">{title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{sectionDevices.length} Unit(s)</p>
                </div>
              </div>
              {expandedSection === type ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSection === type && (
              <div className="p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                {sectionDevices.map(dev => {
                  const devIssues = deviceIssues[dev.id] || new Set();
                  
                  return (
                  <div key={dev.id} className="space-y-4 pb-6 border-b border-slate-100 last:border-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dev.name}</span>
                        <div className="flex items-center gap-3">
                           <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={dev.installed} 
                                    onChange={e => updateDevice(dev.id, { installed: e.target.checked })}
                                    className="w-5 h-5 rounded-md accent-[#87A237]"
                                />
                                <span className={`text-sm font-bold ${dev.installed ? 'text-[#87A237]' : 'text-slate-500'}`}>
                                    {dev.installed ? 'COMPLETED' : 'MARK DONE'}
                                </span>
                           </label>
                        </div>
                    </div>

                    {/* Data Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MAC Address</label>
                            <div className="flex gap-2">
                                <input 
                                    value={dev.macAddress}
                                    onChange={e => updateDevice(dev.id, { macAddress: e.target.value })}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm outline-none focus:ring-1 focus:ring-[#0070C0]"
                                    placeholder="00:00:00..."
                                />
                                <button 
                                    onClick={() => setScannerTarget({ id: dev.id, field: 'macAddress' })}
                                    className="p-2 bg-[#171844] text-white rounded-lg active:scale-95 transition-transform"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Serial Number</label>
                            <div className="flex gap-2">
                                <input 
                                    value={dev.serialNumber}
                                    onChange={e => updateDevice(dev.id, { serialNumber: e.target.value })}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm outline-none focus:ring-1 focus:ring-[#0070C0]"
                                    placeholder="SN..."
                                />
                                <button 
                                    onClick={() => setScannerTarget({ id: dev.id, field: 'serialNumber' })}
                                    className="p-2 bg-[#171844] text-white rounded-lg active:scale-95 transition-transform"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">IP Address</label>
                            <input 
                                value={dev.ipAddress}
                                onChange={e => updateDevice(dev.id, { ipAddress: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm outline-none focus:ring-1 focus:ring-[#0070C0]"
                                placeholder="DHCP / Static IP"
                            />
                        </div>
                    </div>

                    {/* QA Checklist */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                           <ListChecks size={14} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">QA Verification</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                           {checklist.map(item => (
                             <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                  <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-[#0070C0] checked:bg-[#0070C0]" />
                                  <CheckCircle2 size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <span className="text-xs font-medium text-slate-600 group-hover:text-[#171844] transition-colors">{item}</span>
                             </label>
                           ))}
                        </div>
                    </div>

                    {/* Multi-Issue Reporting */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-red-500">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Report Issues</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Blocked Room', 'DND', 'No Power'].map(issue => (
                                <button
                                    key={issue}
                                    onClick={() => toggleIssue(dev.id, issue)}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${
                                        devIssues.has(issue)
                                            ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'
                                    }`}
                                >
                                    {devIssues.has(issue) ? <Ban size={12} /> : <Ban size={12} className="opacity-50" />}
                                    {issue}
                                </button>
                            ))}
                            {['No Signal', 'Hardware Missing', 'Damaged', 'Wrong Mount'].map(issue => (
                                <button
                                    key={issue}
                                    onClick={() => toggleIssue(dev.id, issue)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                        devIssues.has(issue)
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-orange-300'
                                    }`}
                                >
                                    {issue}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
        </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F4F6] animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
      
      {/* Scanner Overlay */}
      {scannerTarget && (
        <BarcodeScanner 
          type={scannerTarget.field === 'macAddress' ? 'MAC' : 'SN'} 
          onClose={() => setScannerTarget(null)}
          onScan={(val) => {
            updateDevice(scannerTarget.id, { [scannerTarget.field]: val });
            setScannerTarget(null);
          }}
        />
      )}

      {/* Confirmation Modal for Next Room */}
      {pendingNextRoom && (
        <div className="absolute inset-0 z-[60] bg-[#171844]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-[#87A237] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                 <CheckCircle2 size={32} className="text-white" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-[#171844]">Room Saved!</h3>
                 <p className="text-slate-500 text-sm mt-2">Are you ready to move to the next room?</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Up</p>
                 <p className="text-3xl font-black text-[#171844]">Room {pendingNextRoom.room}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={onClose} 
                   className="py-3 text-slate-400 font-bold text-xs uppercase hover:text-[#171844]"
                 >
                   No, Stay Here
                 </button>
                 <button 
                   onClick={confirmNextRoom}
                   className="py-3 bg-[#171844] text-white rounded-xl font-bold text-xs uppercase shadow-lg hover:scale-105 transition-all"
                 >
                   Yes, Let's Go
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 shadow-sm flex items-center justify-between shrink-0">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Installation Wizard</span>
          <h2 className="text-3xl font-black text-[#171844] flex items-center gap-3">
             Room {roomData.room}
             {roomData.status === 'Issue' && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">ISSUE</span>}
          </h2>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">
          <X size={24} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {project.selectedModules.includes(ModuleType.TV) && 
            renderDeviceSection('TV System (NTV+)', 'TV', <Tv size={20} />, 'bg-blue-100 text-[#0070C0]', 
            [
              'TV Mounted & Level', 
              'Coax/Ethernet Connected', 
              'TV Channels Working (Clear Picture)', 
              'Connected to Nonius TV+ Platform', 
              'Cast Feature Working', 
              'Remote Paired & Clean'
            ])}
        
        {project.selectedModules.includes(ModuleType.INTERNET) && 
            renderDeviceSection('WiFi (AP)', 'WIFI', <Wifi size={20} />, 'bg-amber-100 text-amber-600',
            ['AP LED Solid Green', 'Cable Hidden / Drip Loop', 'MAC Address Label Applied', 'Speed Test > 50Mbps'])}
        
        {project.selectedModules.includes(ModuleType.CAST) && 
            renderDeviceSection('Cast Dongles', 'CAST', <Share2 size={20} />, 'bg-emerald-100 text-emerald-600',
            ['HDMI Secure', 'USB Power from TV (Not Wall)', 'Velcro Mounted Hidden', 'QR Code Visible on Screen'])}

        {project.selectedModules.includes(ModuleType.VOICE) && 
            renderDeviceSection('Voice / Phone', 'VOICE', <Phone size={20} />, 'bg-purple-100 text-purple-600',
            ['Dial Tone Present', 'Call Reception Verified', 'Extension Labelled'])}

      </div>

      {/* Footer Action */}
      <div className="p-6 bg-white border-t border-slate-200 shrink-0 pb-10">
        <button 
          onClick={handleSaveAndNext}
          className="w-full py-5 rounded-[2rem] font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-[#87A237] text-white shadow-green-100 hover:bg-[#7a9231]"
        >
          <CheckCircle2 size={24} /> Save & Next Room <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default RoomInstallWizard;