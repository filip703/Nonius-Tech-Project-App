
import React, { useState } from 'react';
import { Printer, Tag, Network, Phone, Tv, Search, FileDown, Layers } from 'lucide-react';
import { Project, ModuleType } from '../types';

interface LabelGeneratorProps {
  project: Project;
}

const LabelGenerator: React.FC<LabelGeneratorProps> = ({ project }) => {
  const [selectedSwitch, setSelectedSwitch] = useState('All');
  
  // Mock data representing ports linked to rooms
  const labels = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    source: `SW1-P${i + 1}`,
    dest: `RM-${101 + i}`,
    type: i % 3 === 0 ? 'IPTV' : i % 3 === 1 ? 'VoIP' : 'DATA',
    switchId: 'SW-CORE-01'
  }));

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'IPTV': return { bg: 'bg-cyan-500', icon: Tv };
      case 'VoIP': return { bg: 'bg-emerald-500', icon: Phone };
      default: return { bg: 'bg-[#0070C0]', icon: Network };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Control Panel */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 print:hidden">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-[#171844] text-white flex items-center justify-center shadow-lg">
             <Tag size={28} className="text-[#87A237]" />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-[#171844]">Cable Marker Generator</h2>
             <p className="text-slate-500 text-sm font-medium italic">Standard A4 / 30-up Label Sheet (70mm x 29.7mm)</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-10 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0070C0] outline-none"
              value={selectedSwitch}
              onChange={e => setSelectedSwitch(e.target.value)}
            >
              <option>All Hardware</option>
              {project.switchingPlan?.switches.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#171844] text-white rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-indigo-100"
          >
            <Printer size={16} /> Print Sheet
          </button>
        </div>
      </div>

      {/* Sheet Preview */}
      <div className="flex justify-center">
         <div className="bg-white shadow-2xl border border-slate-300 w-[210mm] min-h-[297mm] p-[10mm] print:shadow-none print:border-0 print:p-0">
            <div className="grid grid-cols-3 gap-[2mm]">
               {labels.map(label => {
                 const Style = getTypeStyles(label.type);
                 return (
                   <div key={label.id} className="h-[29.7mm] w-full border border-slate-100 rounded-lg p-3 flex flex-col justify-between hover:border-[#0070C0] transition-colors relative group overflow-hidden">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Source</p>
                            <p className="text-sm font-black text-[#171844]">{label.source}</p>
                         </div>
                         <div className={`p-1.5 rounded-lg ${Style.bg} text-white`}>
                            <Style.icon size={12} />
                         </div>
                      </div>

                      <div className="h-[1px] w-full bg-slate-50 my-1" />

                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Dest</p>
                            <p className="text-sm font-black text-[#171844]">{label.dest}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[7px] font-bold text-slate-300 uppercase leading-none">{label.type}</p>
                            <p className="text-[7px] font-bold text-slate-300 uppercase leading-none mt-1">NONIUS</p>
                         </div>
                      </div>
                      
                      {/* Vertical side color bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${Style.bg}`} />
                   </div>
                 );
               })}
            </div>
         </div>
      </div>
      
      <p className="text-center text-slate-400 text-xs font-medium italic print:hidden">
        Adjust printer settings to "Actual Size" and "100% Scale" for correct adhesive alignment.
      </p>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 210mm; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default LabelGenerator;
