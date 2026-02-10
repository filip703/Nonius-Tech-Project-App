
import React, { useState } from 'react';
import { PackageX, Plus, Camera, Search, Trash2, CheckCircle2, AlertTriangle, Truck, Clock, Filter, FileText } from 'lucide-react';
import { RmaTicket, RmaStatus, UserRole } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface RmaManagerProps {
  role: UserRole;
}

const RmaManager: React.FC<RmaManagerProps> = ({ role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const [isAdding, setIsAdding] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  const [tickets, setTickets] = useState<RmaTicket[]>([
    { id: 'RMA-102', sn: 'SN-998122', deviceType: 'Samsung HG43AU', issueType: 'Screen Broken', status: RmaStatus.REPORTED, date: '2023-11-15', tech: 'Alex Tech' },
    { id: 'RMA-105', sn: 'SN-102293', deviceType: 'Nonius STB-500', issueType: 'No Power', status: RmaStatus.SHIPPED, date: '2023-11-18', tech: 'Alex Tech' },
    { id: 'RMA-101', sn: 'SN-443211', deviceType: 'Mitel 6920', issueType: 'Software Fail', status: RmaStatus.CLOSED, date: '2023-11-10', tech: 'Marcus G' },
  ]);

  const getStatusStyle = (status: RmaStatus) => {
    switch (status) {
      case RmaStatus.REPORTED: return 'bg-red-100 text-red-700 border-red-200';
      case RmaStatus.APPROVED: return 'bg-amber-100 text-amber-700 border-amber-200';
      case RmaStatus.SHIPPED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case RmaStatus.CLOSED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusIcon = (status: RmaStatus) => {
    switch (status) {
      case RmaStatus.REPORTED: return AlertTriangle;
      case RmaStatus.APPROVED: return CheckCircle2;
      case RmaStatus.SHIPPED: return Truck;
      case RmaStatus.CLOSED: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {scannerOpen && (
        <BarcodeScanner type="SN" onClose={() => setScannerOpen(false)} onScan={(val) => { console.log(val); setScannerOpen(false); }} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#171844]">RMA & Defect Manager</h2>
          <p className="text-slate-500 font-medium">Tracking lifecycle of defective site hardware from report to replacement.</p>
        </div>
        {!isViewOnly && (
           <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#171844] text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
           >
             <Plus size={20} className="text-[#87A237]" /> Create RMA Ticket
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Kanban-ish Column Stats */}
        {[RmaStatus.REPORTED, RmaStatus.APPROVED, RmaStatus.SHIPPED, RmaStatus.CLOSED].map(status => {
          const count = tickets.filter(t => t.status === status).length;
          return (
            <div key={status} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</p>
                <p className="text-2xl font-black text-[#171844]">{count}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusStyle(status)} border`}>
                {React.createElement(getStatusIcon(status), { size: 24 })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070C0]" placeholder="Search SN or Ticket..." />
              </div>
              <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#171844]">
                <Filter size={14} /> Filters
              </button>
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active: {tickets.length}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#171844] text-white">
              <tr className="text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Ticket ID</th>
                <th className="px-8 py-4">Serial Number</th>
                <th className="px-8 py-4">Device / Model</th>
                <th className="px-8 py-4">Issue</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Technician</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 font-black text-[#171844]">{ticket.id}</td>
                  <td className="px-8 py-5 font-mono text-xs text-[#0070C0] font-bold">{ticket.sn}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-700">{ticket.deviceType}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Reported {ticket.date}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase">{ticket.issueType}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                       {React.createElement(getStatusIcon(ticket.status), { size: 14 })}
                       {ticket.status}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{ticket.tech[0]}</div>
                       <span className="text-xs font-bold text-slate-600">{ticket.tech}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 text-slate-400 hover:text-[#171844] hover:bg-slate-100 rounded-lg transition-all" title="View Label"><FileText size={18}/></button>
                       <button className="p-2 text-slate-400 hover:text-[#0070C0] hover:bg-blue-50 rounded-lg transition-all"><Camera size={18}/></button>
                       {!isViewOnly && <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isAdding && (
        <div className="fixed inset-0 bg-[#171844]/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 bg-[#171844] text-white">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold uppercase tracking-tight">New Defect Report</h3>
                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Trash2 size={24}/></button>
                 </div>
                 <p className="text-slate-400 text-sm italic">Immediate coordination with Nonius Logistics Hub.</p>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hardware Serial Number</label>
                    <div className="flex gap-2">
                      <input className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-mono text-sm" placeholder="SN-XXXX-XXXX" />
                      <button onClick={() => setScannerOpen(true)} className="p-4 bg-[#87A237] text-white rounded-2xl hover:bg-opacity-90 transition-all"><Camera size={20}/></button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Category</label>
                       <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] text-sm">
                          <option>Screen Broken</option>
                          <option>No Power</option>
                          <option>Software Fail</option>
                          <option>Cosmetic / Damaged</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Impact Level</label>
                       <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] text-sm font-bold text-red-500">
                          <option>Non-Operational</option>
                          <option>Degraded</option>
                          <option>Cosmetic Only</option>
                       </select>
                    </div>
                 </div>
                 <button className="w-full py-5 bg-[#171844] text-white rounded-3xl font-bold shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} className="text-[#87A237]" /> Submit Ticket to Hub
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RmaManager;
