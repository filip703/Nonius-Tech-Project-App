
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { Device, ModuleType, ProjectContact } from '../../types';
import { Filter, CheckCircle2, AlertCircle, Clock, MapPin, Search, ArrowLeft, MoreVertical, LogOut, LayoutGrid, CheckSquare, AlertTriangle, Ban, Server, Phone, Tv, Wifi, Share2, Mail, User, ChevronUp, ChevronDown, Globe } from 'lucide-react';
import RoomInstallWizard from './RoomInstallWizard';
import RackInstallWizard from './RackInstallWizard';
import ProjectChat from '../ProjectChat';

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
  const { projects, currentUser, setActiveProject } = useProjects();
  const project = projects.find(p => p.id === id);
  
  // Ensure the context knows which project is active for the chat component to work
  React.useEffect(() => {
    if (project) setActiveProject(project);
  }, [project, setActiveProject]);
  
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterFloor, setFilterFloor] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<RoomSummary | null>(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

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
    if (project.selectedModules.includes(ModuleType.VOICE)) {
        addDevices(project.voiceConfig?.inventory, 'VOICE');
    }
    
    // Webapp is usually virtual, but we track it as a "device" for completion status in rooms
    if (project.selectedModules.includes(ModuleType.WEBAPP)) {
        // We look for pseudo-devices stored in TV or generic inventory tagged as Webapp
        // Or we just rely on the room install wizard to create them. 
        // For existing data, we might not have them yet, but we will process them if found.
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
    const uniqueFloors = Array.from(new Set(sortedGuestRooms.map(r => r.floor))).sort();
    
    const mdfId = 'rack-mdf';
    const mdfDevicesCount = project.rackConfig?.racks.find(r => r.id === mdfId)?.devices.length || 0;
    
    sortedGuestRooms.unshift({
        room: 'MDF',
        floor: 'INFRA',
        type: 'INFRA',
        status: mdfDevicesCount > 0 ? 'In Progress' : 'Pending', 
        devices: [],
        rackId: mdfId
    });

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

  // --- Progress Calculations ---
  const stats = useMemo(() => {
      const guestRooms = roomsData.filter(r => r.type === 'GUEST');
      const total = guestRooms.length || 1;
      const completed = guestRooms.filter(r => r.status === 'Complete' || r.status === 'Warning').length;
      
      const moduleBreakdown = {
          TV: { total: 0, done: 0 },
          WIFI: { total: 0, done: 0 },
          CAST: { total: 0, done: 0 },
          VOICE: { total: 0, done: 0 },
          WEBAPP: { total: 0, done: 0 }
      };

      guestRooms.forEach(room => {
          room.devices.forEach(dev => {
              const isDone = dev.installed;
              if (dev.name.includes('TV') || dev.notes?.includes('Type:TV')) {
                  moduleBreakdown.TV.total++;
                  if (isDone) moduleBreakdown.TV.done++;
              } else if (dev.model.includes('AP') || dev.notes?.includes('Type:AP')) {
                  moduleBreakdown.WIFI.total++;
                  if (isDone) moduleBreakdown.WIFI.done++;
              } else if (dev.name.includes('Cast') || dev.notes?.includes('Type:CAST')) {
                  moduleBreakdown.CAST.total++;
                  if (isDone) moduleBreakdown.CAST.done++;
              } else if (dev.name.includes('Phone') || dev.notes?.includes('Type:VOICE')) {
                  moduleBreakdown.VOICE.total++;
                  if (isDone) moduleBreakdown.VOICE.done++;
              } else if (dev.notes?.includes('Type:WEBAPP')) {
                  moduleBreakdown.WEBAPP.total++;
                  if (isDone) moduleBreakdown.WEBAPP.done++;
              }
          });
      });

      return { total, completed, moduleBreakdown };
  }, [roomsData]);

  if (!project) return <div>Project not found</div>;

  // Retrieve key personnel details
  const getContact = (roleOrName: string) => {
      return project.contacts.find(c => c.jobDescription === roleOrName || c.name === roleOrName) || { name: 'N/A', mobile: '', email: '' };
  };

  const techLead = getContact('Lead Technician');
  const pm = getContact(project.pm); // project.pm stores the name
  const it = getContact(project.itManager);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      {/* Dynamic Wizard Loader */}
      {selectedRoom && selectedRoom.type === 'INFRA' && selectedRoom.rackId ? (
         <RackInstallWizard 
            key={selectedRoom.room}
            project={project}
            rackId={selectedRoom.rackId}
            rackName={selectedRoom.room}
            onClose={() => setSelectedRoom(null)}
         />
      ) : selectedRoom && (
        <RoomInstallWizard 
          key={selectedRoom.room}
          project={project} 
          roomData={selectedRoom}
          allRooms={filteredRooms.filter(r => r.type === 'GUEST')} // Only nav through guest rooms
          onClose={() => setSelectedRoom(null)}
          onSwitchRoom={setSelectedRoom}
        />
      )}

      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-20 bg-[#F3F4F6]">
        {/* Header */}
        <header className="bg-[#171844] text-white p-4 md:p-6 rounded-b-[2.5rem] shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <Link to="/installer" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all">
              <LogOut size={20} />
            </Link>
            <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
               <h1 className="font-bold text-base md:text-lg leading-tight text-center truncate w-full">{project.name}</h1>
               <div className="flex items-center gap-2 text-[10px] font-bold text-[#87A237] uppercase tracking-widest mt-1">
                  <span className="shrink-0">NCM: {project.siteId.split('-').pop()}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="truncate max-w-[100px]">Tech: {currentUser.name}</span>
               </div>
            </div>
            <button 
              onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-slate-300"
            > 
              {isHeaderExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {/* Collapsible Section */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isHeaderExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
              {/* Compact Key Contacts Row */}
              <div className="flex gap-2 mb-4 bg-white/5 p-2 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
                  {[
                      { role: 'PM', ...pm }, 
                      { role: 'LEAD', ...techLead }, 
                      { role: 'IT', ...it }
                  ].map((c, i) => (
                      <div key={i} className="flex-1 min-w-[100px] flex flex-col justify-center px-3 border-r border-white/10 last:border-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{c.role}</p>
                          <p className="text-[10px] font-bold text-white truncate">{c.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                              {c.mobile && (
                                  <a href={`tel:${c.mobile}`} className="text-slate-400 hover:text-[#87A237]" title={c.mobile}>
                                      <Phone size={10} />
                                  </a>
                              )}
                              {c.email && (
                                  <a href={`mailto:${c.email}`} className="text-slate-400 hover:text-[#87A237]" title={c.email}>
                                      <Mail size={10} />
                                  </a>
                              )}
                          </div>
                      </div>
                  ))}
              </div>

              {/* Enhanced Progress Bar */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/5 space-y-4">
              <div>
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Overall Completion</span>
                      <span className="text-2xl font-black text-[#87A237]">{Math.round((stats.completed / stats.total) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                      <div className="h-full bg-[#87A237] transition-all duration-1000" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                      <span>{stats.completed} Rooms Done</span>
                      <span>{stats.total} Total</span>
                  </div>
              </div>

              {/* Module Breakdown Bars */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  {Object.entries(stats.moduleBreakdown).map(([mod, data]) => {
                      if (data.total === 0 && mod !== 'TV') return null; // Show at least one
                      if (data.total === 0) return null;
                      
                      const pct = Math.round((data.done / data.total) * 100);
                      let color = 'bg-slate-400';
                      let icon = null;
                      if (mod === 'TV') { color = 'bg-blue-500'; icon = <Tv size={10} />; }
                      if (mod === 'WIFI') { color = 'bg-amber-500'; icon = <Wifi size={10} />; }
                      if (mod === 'CAST') { color = 'bg-emerald-500'; icon = <Share2 size={10} />; }
                      if (mod === 'VOICE') { color = 'bg-purple-500'; icon = <Phone size={10} />; }
                      if (mod === 'WEBAPP') { color = 'bg-pink-500'; icon = <Globe size={10} />; }

                      return (
                          <div key={mod} className="bg-black/20 p-2 rounded-lg">
                              <div className="flex justify-between text-[9px] font-bold text-slate-300 mb-1">
                                  <span className="flex items-center gap-1">{icon} {mod}</span>
                                  <span>{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                          </div>
                      );
                  })}
              </div>
              </div>
          </div>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-3">
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
             <AlertCircle size={14} /> Issues
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
      </div>

      {/* Room Grid */}
      <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredRooms.map(room => {
          let statusColor = 'bg-white border-slate-200';
          let icon = <Clock className="text-slate-300" size={20} />;
          let statusText = '';
          
          if (room.status === 'Complete') {
            statusColor = 'bg-green-100 border-green-500 shadow-green-100'; 
            icon = <CheckCircle2 className="text-green-600" size={24} />;
            statusText = 'DONE';
          } else if (room.status === 'Warning') {
            statusColor = 'bg-orange-50 border-orange-400 shadow-orange-100'; 
            icon = <AlertTriangle className="text-orange-500" size={24} />;
            statusText = 'WARN';
          } else if (room.status === 'Issue') {
            statusColor = 'bg-red-100 border-red-500 shadow-red-100'; 
            icon = <Ban className="text-red-600" size={24} />;
            statusText = 'ISSUE';
          } else if (room.status === 'In Progress') {
            statusColor = 'bg-blue-50 border-blue-300'; 
            icon = <Clock className="text-blue-500" size={24} />;
            statusText = 'WIP';
          }

          // Override for INFRA
          if (room.type === 'INFRA') {
             icon = <Server className="text-[#171844]" size={24} />;
             if (room.status === 'In Progress') statusColor = 'bg-[#E9F2F8] border-[#171844]'; 
          }

          const hasTv = room.devices.some(d => d.name.includes('TV') || d.notes?.includes('Type:TV'));
          const hasAp = room.devices.some(d => d.model.includes('AP') || d.notes?.includes('Type:AP'));
          const hasCast = room.devices.some(d => d.name.includes('Cast') || d.notes?.includes('Type:CAST'));
          const hasVoice = room.devices.some(d => d.name.includes('Phone') || d.notes?.includes('Type:VOICE'));
          const hasWebapp = room.devices.some(d => d.notes?.includes('Type:WEBAPP'));

          return (
            <button
              key={room.room}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded-3xl border-2 shadow-sm flex flex-col items-center justify-between gap-3 active:scale-95 transition-all min-h-[140px] relative overflow-hidden ${statusColor}`}
            >
              {statusText && (
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase rounded-bl-xl ${
                      room.status === 'Complete' ? 'bg-green-500 text-white' : 
                      room.status === 'Warning' ? 'bg-orange-500 text-white' : 
                      room.status === 'Issue' ? 'bg-red-500 text-white' : 
                      'bg-blue-200 text-blue-800'
                  }`}>
                      {statusText}
                  </div>
              )}

              <div className="text-center w-full mt-2">
                <div className="flex justify-between items-start w-full">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{room.type === 'INFRA' ? 'RACK' : 'RM'}</span>
                </div>
                <p className={`font-black text-[#171844] leading-none mt-1 ${room.type === 'INFRA' ? 'text-lg uppercase' : 'text-3xl'}`}>{room.room}</p>
                {room.type === 'INFRA' && <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Infrastructure</p>}
              </div>
              
              {/* Module Indicators (Only for Guest Rooms) */}
              {room.type === 'GUEST' && (
                <div className="flex gap-1.5 justify-center w-full flex-wrap">
                   {project.selectedModules.includes(ModuleType.TV) && (
                      <div className={`w-2 h-2 rounded-full ${hasTv ? 'bg-blue-500' : 'bg-slate-300/50'}`} />
                   )}
                   {project.selectedModules.includes(ModuleType.INTERNET) && (
                      <div className={`w-2 h-2 rounded-full ${hasAp ? 'bg-amber-500' : 'bg-slate-300/50'}`} />
                   )}
                   {project.selectedModules.includes(ModuleType.CAST) && (
                      <div className={`w-2 h-2 rounded-full ${hasCast ? 'bg-emerald-500' : 'bg-slate-300/50'}`} />
                   )}
                   {project.selectedModules.includes(ModuleType.VOICE) && (
                      <div className={`w-2 h-2 rounded-full ${hasVoice ? 'bg-purple-500' : 'bg-slate-300/50'}`} />
                   )}
                   {project.selectedModules.includes(ModuleType.WEBAPP) && (
                      <div className={`w-2 h-2 rounded-full ${hasWebapp ? 'bg-pink-500' : 'bg-slate-300/50'}`} />
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

      <ProjectChat />
    </div>
  );
};

export default InstallerDashboard;
