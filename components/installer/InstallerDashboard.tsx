
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { Device, ModuleType } from '../../types';
import { Filter, CheckCircle2, AlertCircle, Clock, MapPin, Search, ArrowLeft, MoreVertical, LogOut, LayoutGrid, CheckSquare, AlertTriangle, Ban, Server } from 'lucide-react';
import RoomInstallWizard from './RoomInstallWizard';
import RackInstallWizard from './RackInstallWizard';

interface RoomSummary {
  room: string;
  floor: string;
  type: 'GUEST' | 'INFRA';
  status: 'Pending' | 'In Progress' | 'Complete' | 'Warning' | 'Issue';
  devices: Device[];
  rackId?: string; // For Infra rooms
}

const InstallerDashboard: React.FC = () => {
  const { id } = useParams();
  const { projects, currentUser } = useProjects();
  const project = projects.find(p => p.id === id);
  
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterFloor, setFilterFloor] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<RoomSummary | null>(null);

  // --- Data Aggregation Logic ---
  const roomsData = useMemo(() => {
    if (!project) return [];
    
    const roomMap = new Map<string, Device[]>();

    const addDevices = (devices?: Device[], type?: string) => {
      devices?.forEach(d => {
        if (!d.room) return;
        const list = roomMap.get(d.room) || [];
        if (type && !d.name.includes(type)) {
             d.notes = d.notes ? d.notes : `[Type:${type}]`;
        }
        list.push(d);
        roomMap.set(d.room, list);
      });
    };

    if (project.selectedModules.includes(ModuleType.TV)) addDevices(project.tvConfig?.inventory, 'TV');
    if (project.selectedModules.includes(ModuleType.INTERNET)) {
        if (project.wifiConfig?.inventory) {
            const wifiAsDevices: Device[] = project.wifiConfig.inventory.map(ap => ({
                id: ap.id,
                name: ap.name || 'Access Point',
                brand: ap.brand,
                model: 'WiFi AP',
                macAddress: ap.mac,
                ipAddress: ap.ip,
                serialNumber: 'N/A', 
                room: ap.location,
                installed: ap.installed !== undefined ? ap.installed : !!(ap.ip && ap.ip !== '0.0.0.0'),
                notes: ap.notes || ''
            }));
            addDevices(wifiAsDevices, 'AP');
        }
    }
    if (project.selectedModules.includes(ModuleType.CAST)) {
        addDevices(project.castConfig?.dongleInventory.roomRows.map(r => ({
            id: r.id,
            name: 'Cast Dongle',
            brand: 'Nonius',
            model: 'Homatics',
            macAddress: r.mac,
            ipAddress: '',
            serialNumber: r.sn,
            room: r.room,
            installed: r.state === 'Online',
            notes: r.notes
        } as Device)), 'CAST');
    }

    const definedRoomCount = project.rooms || 0;
    
    for (let i = 0; i < definedRoomCount; i++) {
        const roomNum = (101 + i).toString();
        if (!roomMap.has(roomNum)) {
            roomMap.set(roomNum, []);
        }
    }

    const result: RoomSummary[] = [];
    
    // Process Guest Rooms
    roomMap.forEach((devices, room) => {
      let status: RoomSummary['status'] = 'Pending';
      
      const notesString = devices.map(d => d.notes || '').join(' ').toLowerCase();
      const hasBlocker = notesString.includes('blocked') || notesString.includes('dnd') || notesString.includes('no power');
      const hasIssue = notesString.includes('issue') || notesString.includes('broken') || notesString.includes('missing') || notesString.includes('no tv');
      
      const isStarted = devices.some(d => d.installed);
      const allInstalled = devices.length > 0 && devices.every(d => d.installed);

      if (hasBlocker) status = 'Issue'; 
      else if (allInstalled) status = hasIssue ? 'Warning' : 'Complete';
      else if (hasIssue) status = 'Issue';
      else if (isStarted) status = 'In Progress';

      const floor = room.length >= 3 ? room.substring(0, room.length - 2) : 'G';
      result.push({ room, floor, type: 'GUEST', status, devices });
    });

    const sortedGuestRooms = result.sort((a, b) => {
        if (a.floor !== b.floor) return a.floor.localeCompare(b.floor);
        return a.room.localeCompare(b.room);
    });

    // --- INFRASTRUCTURE ROOMS (MDF & IDFs) ---
    // Generate distinct floors from the guest rooms
    const uniqueFloors = Array.from(new Set(sortedGuestRooms.map(r => r.floor))).sort();
    
    // Add MDF (Main Rack) - Usually on Floor 0 or G
    // Check if rack exists in config to determine status
    const mdfId = 'rack-mdf';
    const mdfExists = project.rackConfig?.racks.some(r => r.id === mdfId);
    // Simple logic: if rack has devices, it's 'In Progress' or 'Complete'
    const mdfDevicesCount = project.rackConfig?.racks.find(r => r.id === mdfId)?.devices.length || 0;
    
    sortedGuestRooms.unshift({
        room: 'MDF',
        floor: 'INFRA',
        type: 'INFRA',
        status: mdfDevicesCount > 0 ? 'In Progress' : 'Pending', // Simplified status for Infra
        devices: [],
        rackId: mdfId
    });

    // Add IDFs for each floor
    uniqueFloors.forEach(floor => {
        const idfId = `rack-idf-${floor}`;
        const idfCount = project.rackConfig?.racks.find(r => r.id === idfId)?.devices.length || 0;
        sortedGuestRooms.push({
            room: `IDF-${floor}`,
            floor: floor,
            type: 'INFRA',
            status: idfCount > 0 ? 'In Progress' : 'Pending',
            devices: [],
            rackId: idfId
        });
    });

    return sortedGuestRooms;
  }, [project]);

  // --- Filtering ---
  const floors = Array.from(new Set(roomsData.filter(r => r.floor !== 'INFRA').map(r => r.floor))).sort();
  
  const filteredRooms = roomsData.filter(r => {
    // Always show MDF/Infra if no floor filter, or show specific IDF if floor matches
    if (r.type === 'INFRA' && r.room === 'MDF' && filterFloor === 'All') return true;
    
    if (filterStatus !== 'All') {
        if (filterStatus === 'Issue' && (r.status === 'Issue' || r.status === 'Warning')) return true;
        if (r.status !== filterStatus) return false;
    }
    if (filterFloor !== 'All' && r.floor !== filterFloor) return false;
    return true;
  });

  const progress = Math.round((roomsData.filter(r => (r.status === 'Complete' || r.status === 'Warning') && r.type === 'GUEST').length / (roomsData.filter(r => r.type === 'GUEST').length || 1)) * 100) || 0;

  if (!project) return <div>Project not found</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      {/* Dynamic Wizard Loader */}
      {selectedRoom && selectedRoom.type === 'INFRA' && selectedRoom.rackId ? (
         <RackInstallWizard 
            project={project}
            rackId={selectedRoom.rackId}
            rackName={selectedRoom.room}
            onClose={() => setSelectedRoom(null)}
         />
      ) : selectedRoom && (
        <RoomInstallWizard 
          project={project} 
          roomData={selectedRoom}
          allRooms={filteredRooms.filter(r => r.type === 'GUEST')} // Only nav through guest rooms
          onClose={() => setSelectedRoom(null)}
          onSwitchRoom={setSelectedRoom}
        />
      )}

      {/* Header */}
      <header className="bg-[#171844] text-white p-6 rounded-b-[2.5rem] shadow-xl sticky top-0 z-20">
        <div className="flex items-center justify-between mb-6">
          <Link to="/installer" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all">
            <LogOut size={20} />
          </Link>
          <div className="flex flex-col items-center">
             <h1 className="font-bold text-lg">{project.name}</h1>
             <div className="flex items-center gap-2 text-[10px] font-bold text-[#87A237] uppercase tracking-widest">
                <span>NCM: {project.siteId.split('-').pop()}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Tech: {currentUser.name}</span>
             </div>
          </div>
          <button className="p-2 bg-white/10 rounded-xl">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/5">
           <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Installation Progress</span>
              <span className="text-2xl font-black text-[#87A237]">{progress}%</span>
           </div>
           <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <div className="h-full bg-[#87A237] transition-all duration-1000" style={{ width: `${progress}%` }} />
           </div>
           <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
              <span>{roomsData.filter(r => (r.status === 'Complete' || r.status === 'Warning') && r.type === 'GUEST').length} Rooms Done</span>
              <span>{roomsData.filter(r => r.type === 'GUEST').length} Total</span>
           </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-6 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-3 sticky top-[180px] z-10 bg-[#F3F4F6]/95 backdrop-blur-sm">
         <button 
           onClick={() => setFilterStatus('All')} 
           className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${filterStatus === 'All' ? 'bg-[#171844] text-white' : 'bg-white text-slate-500'}`}
         >
           All
         </button>
         <button 
           onClick={() => setFilterStatus('Issue')} 
           className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${filterStatus === 'Issue' ? 'bg-red-500 text-white' : 'bg-white text-slate-500'}`}
         >
           <AlertCircle size={14} /> Issues / Warnings
         </button>
         <div className="w-[1px] h-8 bg-slate-300 mx-2" />
         {floors.map(f => (
           <button
             key={f}
             onClick={() => setFilterFloor(filterFloor === f ? 'All' : f)}
             className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${filterFloor === f ? 'bg-[#0070C0] text-white border-[#0070C0]' : 'bg-white text-slate-500 border-slate-200'}`}
           >
             Floor {f}
           </button>
         ))}
      </div>

      {/* Room Grid */}
      <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredRooms.map(room => {
          let statusColor = 'bg-white border-slate-200';
          let icon = <Clock className="text-slate-300" size={20} />;
          
          if (room.status === 'Complete') {
            statusColor = 'bg-green-100 border-green-500 shadow-green-100'; 
            icon = <CheckCircle2 className="text-green-600" size={24} />;
          } else if (room.status === 'Warning') {
            statusColor = 'bg-orange-50 border-orange-400 shadow-orange-100'; 
            icon = <AlertTriangle className="text-orange-500" size={24} />;
          } else if (room.status === 'Issue') {
            statusColor = 'bg-red-100 border-red-500 shadow-red-100'; 
            icon = <Ban className="text-red-600" size={24} />;
          } else if (room.status === 'In Progress') {
            statusColor = 'bg-blue-50 border-blue-300'; 
            icon = <Clock className="text-blue-500" size={24} />;
          }

          // Override for INFRA
          if (room.type === 'INFRA') {
             icon = <Server className="text-[#171844]" size={24} />;
             if (room.status === 'In Progress') statusColor = 'bg-[#E9F2F8] border-[#171844]'; // Distinct look
          }

          const hasTv = room.devices.some(d => d.name.includes('TV') || d.notes?.includes('Type:TV'));
          const hasAp = room.devices.some(d => d.model.includes('AP') || d.notes?.includes('Type:AP'));
          const hasCast = room.devices.some(d => d.name.includes('Cast') || d.notes?.includes('Type:CAST'));

          return (
            <button
              key={room.room}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded-3xl border-2 shadow-sm flex flex-col items-center justify-between gap-3 active:scale-95 transition-all min-h-[140px] ${statusColor}`}
            >
              <div className="text-center w-full">
                <div className="flex justify-between items-start w-full">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{room.type === 'INFRA' ? 'RACK' : 'RM'}</span>
                   {room.type === 'GUEST' && room.devices.length === 0 && <span className="text-[8px] px-2 py-0.5 bg-slate-100 rounded text-slate-400 font-bold uppercase">New</span>}
                </div>
                <p className={`font-black text-[#171844] leading-none mt-2 ${room.type === 'INFRA' ? 'text-lg uppercase' : 'text-3xl'}`}>{room.room}</p>
                {room.type === 'INFRA' && <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Infrastructure</p>}
              </div>
              
              {/* Module Indicators (Only for Guest Rooms) */}
              {room.type === 'GUEST' && (
                <div className="flex gap-1.5 justify-center w-full">
                   {project.selectedModules.includes(ModuleType.TV) && (
                      <div className={`w-2 h-2 rounded-full ${hasTv ? 'bg-blue-500' : 'bg-slate-300/50'}`} />
                   )}
                   {project.selectedModules.includes(ModuleType.INTERNET) && (
                      <div className={`w-2 h-2 rounded-full ${hasAp ? 'bg-amber-500' : 'bg-slate-300/50'}`} />
                   )}
                   {project.selectedModules.includes(ModuleType.CAST) && (
                      <div className={`w-2 h-2 rounded-full ${hasCast ? 'bg-emerald-500' : 'bg-slate-300/50'}`} />
                   )}
                </div>
              )}
              
              <div className="mt-auto">
                {icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InstallerDashboard;
