
import React, { useState } from 'react';
/* Updated icon names */
import { Plus, Trash2, Pencil, CircleCheck, Clock, CircleAlert, Save, X, UserCheck } from 'lucide-react';
import { Device, UserRole } from '../types';
import { IP_REGEX, MAC_REGEX, HARDWARE_MODELS } from '../constants';
import { useProjects } from '../contexts/ProjectContext';

interface DeviceInventoryProps {
  devices: Device[];
  onUpdate: (updatedDevices: Device[]) => void;
  moduleType: string;
  role: UserRole;
}

const DeviceInventory: React.FC<DeviceInventoryProps> = ({ devices, onUpdate, moduleType, role }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Device | null>(null);
  const { currentUser } = useProjects();

  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  const validateIp = (ip: string) => IP_REGEX.test(ip);
  const validateMac = (mac: string) => MAC_REGEX.test(mac);

  const handleEdit = (device: Device) => {
    if (isViewOnly) return;
    setEditingId(device.id);
    setEditValues({ ...device });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const handleSave = () => {
    if (!editValues || isViewOnly) return;
    const newDevices = devices.map(d => d.id === editingId ? editValues : d);
    onUpdate(newDevices);
    setEditingId(null);
    setEditValues(null);
  };

  const toggleInstalled = (id: string) => {
    if (isViewOnly) return;
    const newDevices = devices.map(d => {
      if (d.id === id) {
        const becomingInstalled = !d.installed;
        return { 
          ...d, 
          installed: becomingInstalled,
          installedBy: becomingInstalled ? currentUser.name : undefined,
          installedAt: becomingInstalled ? new Date().toISOString() : undefined
        };
      }
      return d;
    });
    onUpdate(newDevices);
  };

  const removeDevice = (id: string) => {
    if (isViewOnly) return;
    onUpdate(devices.filter(d => d.id !== id));
  };

  const addDevice = () => {
    if (isViewOnly) return;
    const newId = `dev-${Date.now()}`;
    const newDevice: Device = {
      id: newId,
      name: `${moduleType} Device`,
      brand: 'Generic',
      model: HARDWARE_MODELS[moduleType as keyof typeof HARDWARE_MODELS]?.[0] || 'Unknown',
      macAddress: '00:00:00:00:00:00',
      ipAddress: '0.0.0.0',
      serialNumber: '',
      room: '',
      installed: false
    };
    onUpdate([newDevice, ...devices]);
    handleEdit(newDevice);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-xl font-bold text-[#171844]">Hardware Inventory</h3>
          <p className="text-slate-500 text-xs font-medium">Manage and validate all deployed units</p>
        </div>
        {!isViewOnly && (
          <button 
            onClick={addDevice}
            className="flex items-center gap-2 px-4 py-2 bg-[#0070C0] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-blue-100"
          >
            <Plus size={18} />
            Add Hardware
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Name / Model</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Network Details</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Room / SN</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Logistics</th>
              {!isViewOnly && <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map(device => {
              const isEditing = editingId === device.id;
              const displayDevice = isEditing ? editValues! : device;
              const isIpValid = validateIp(displayDevice.ipAddress);
              const isMacValid = validateMac(displayDevice.macAddress);

              return (
                <tr key={device.id} className="hover:bg-[#E9F2F8]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleInstalled(device.id)}
                      disabled={isEditing || isViewOnly}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        displayDevice.installed 
                          ? 'bg-[#87A237]/10 text-[#87A237] border border-[#87A237]/30' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      } ${isEditing || isViewOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {displayDevice.installed ? <CircleCheck size={14} /> : <Clock size={14} />}
                      {displayDevice.installed ? 'Installed' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                          value={editValues?.name}
                          onChange={e => setEditValues({ ...editValues!, name: e.target.value })}
                          placeholder="Device Name"
                        />
                        <select 
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          value={editValues?.model}
                          onChange={e => setEditValues({ ...editValues!, model: e.target.value })}
                        >
                          {(HARDWARE_MODELS[moduleType as keyof typeof HARDWARE_MODELS] || ['Unknown']).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-[#171844]">{device.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{device.model}</p>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-8">IP:</span>
                        {isEditing ? (
                          <div className="relative group/input flex-1">
                            <input 
                              className={`w-full px-2 py-1 bg-white border rounded font-mono text-[12px] focus:outline-none focus:ring-1 ${
                                isIpValid ? 'border-slate-200 focus:ring-[#0070C0]' : 'border-red-500 focus:ring-red-500'
                              }`}
                              value={editValues?.ipAddress}
                              onChange={e => setEditValues({ ...editValues!, ipAddress: e.target.value })}
                            />
                            {!isIpValid && (
                              <div className="absolute left-0 -bottom-4 text-[9px] text-red-500 font-bold whitespace-nowrap">
                                Invalid IP Format
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`font-mono text-[12px] ${isIpValid ? 'text-slate-600' : 'text-red-600 underline decoration-dotted'}`}>
                            {device.ipAddress}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 w-8">MAC:</span>
                        {isEditing ? (
                          <div className="relative group/input flex-1">
                            <input 
                              className={`w-full px-2 py-1 bg-white border rounded font-mono text-[12px] focus:outline-none focus:ring-1 ${
                                isMacValid ? 'border-slate-200 focus:ring-[#0070C0]' : 'border-red-500 focus:ring-red-500'
                              }`}
                              value={editValues?.macAddress}
                              onChange={e => setEditValues({ ...editValues!, macAddress: e.target.value })}
                            />
                            {!isMacValid && (
                              <div className="absolute left-0 -bottom-4 text-[9px] text-red-500 font-bold whitespace-nowrap">
                                Invalid MAC Format
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`font-mono text-[12px] ${isMacValid ? 'text-slate-600' : 'text-red-600 underline decoration-dotted'}`}>
                            {device.macAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          value={editValues?.room}
                          onChange={e => setEditValues({ ...editValues!, room: e.target.value })}
                          placeholder="Room #"
                        />
                        <input 
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          value={editValues?.serialNumber}
                          onChange={e => setEditValues({ ...editValues!, serialNumber: e.target.value })}
                          placeholder="Serial Number"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-[#171844] font-bold">Room {device.room || '---'}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{device.serialNumber || 'No SN'}</p>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {device.installedBy ? (
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#171844]">
                            <UserCheck size={12} className="text-[#87A237]" />
                            {device.installedBy}
                         </div>
                         <p className="text-[9px] text-slate-400 font-medium">{new Date(device.installedAt!).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">No install log</span>
                    )}
                  </td>
                  {!isViewOnly && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={handleSave}
                              disabled={!isIpValid || !isMacValid}
                              className={`p-2 rounded-lg transition-all ${
                                isIpValid && isMacValid ? 'text-[#87A237] hover:bg-green-50' : 'text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <Save size={18} />
                            </button>
                            <button 
                              onClick={handleCancel}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(device)}
                              className="p-2 text-slate-400 hover:text-[#0070C0] hover:bg-blue-50 rounded-lg"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => removeDevice(device.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceInventory;
