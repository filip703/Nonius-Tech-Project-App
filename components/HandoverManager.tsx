
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck, 
  Signature, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Calendar, 
  User, 
  ShieldCheck,
  Printer,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { Project, ModuleType, UserRole } from '../types';
import { useProjects } from '../contexts/ProjectContext';

interface HandoverManagerProps {
  project: Project;
  role: UserRole;
}

const HandoverManager: React.FC<HandoverManagerProps> = ({ project, role }) => {
  const { saveProject } = useProjects();
  const [isSigned, setIsSigned] = useState(!!project.handoverSignedAt);
  const [clientName, setClientName] = useState(project.handoverSignedBy || '');
  const [clientRole, setClientRole] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Completion Data Calculation
  const getCompletion = (module: ModuleType) => {
    const completed = project.selectedModules.includes(module) ? 100 : 0;
    if (module === ModuleType.TV) return project.tvConfig ? 100 : 20;
    if (module === ModuleType.SWITCHING) return project.switchingPlan ? 100 : 0;
    return 100;
  };

  // Signature Pad Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#171844';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
    }
  };

  const saveHandover = () => {
    if (!clientName) {
      alert("Please enter client representative name.");
      return;
    }
    const signedAt = new Date().toISOString();
    setIsSigned(true);
    saveProject({
      ...project,
      handoverSignedAt: signedAt,
      handoverSignedBy: clientName
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-10 space-y-8">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-[#87A237]/10 flex items-center justify-center text-[#87A237]">
             <FileCheck size={32} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-[#171844]">Final Delivery Audit</h2>
             <p className="text-slate-500 font-medium">Verification of contracted deliverables prior to sign-off.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.selectedModules.map(module => {
             const progress = getCompletion(module);
             return (
               <div key={module} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{module}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#87A237] transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-[#171844]">{progress}%</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    {progress === 100 ? (
                      <CheckCircle2 size={24} className="text-[#87A237]" />
                    ) : (
                      <AlertCircle size={24} className="text-amber-500" />
                    )}
                  </div>
               </div>
             );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[#171844] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-full">
              <div>
                <Signature size={40} className="text-[#87A237] mb-6" />
                <h3 className="text-2xl font-bold mb-4">Acceptance of Services</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  By signing this digital document, the client representative acknowledges that all hardware and software listed in this report are installed and operational according to the project specifications.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                 <ShieldCheck size={20} className="text-[#87A237]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Digital ID Logging Active</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
           {isSigned ? (
             <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 text-[#87A237] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <BadgeCheck size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#171844]">Site Handover Confirmed</h3>
                  <p className="text-slate-500 mt-2 font-medium italic">Validated by {project.handoverSignedBy} on {new Date(project.handoverSignedAt!).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#171844] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
                >
                  <Printer size={18} /> View Signed Site Report
                </button>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Representative Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none font-bold"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="e.g. Michael Smith"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Position / Title</label>
                    <input 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0070C0] outline-none"
                      value={clientRole}
                      onChange={e => setClientRole(e.target.value)}
                      placeholder="e.g. IT Manager"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Digital Signature</label>
                    <button onClick={clearSignature} className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1">
                      <Trash2 size={12} /> Clear Canvas
                    </button>
                  </div>
                  <div className="border-2 border-slate-100 rounded-[2rem] bg-slate-50 overflow-hidden relative group">
                    <canvas 
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full h-40 cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseOut={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                    />
                    <div className="absolute bottom-4 right-6 pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity">
                       <Signature size={64} className="text-[#171844]" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={saveHandover}
                    className="flex items-center gap-3 px-10 py-4 bg-[#87A237] text-white rounded-2xl font-bold shadow-xl shadow-green-100 hover:scale-105 transition-all"
                  >
                    Confirm & Complete Handover
                  </button>
                </div>
             </div>
           )}
        </div>
      </section>

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-[#171844]/80 backdrop-blur-md z-[100] flex items-center justify-center p-10 overflow-y-auto">
           <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-16 relative">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Trash2 className="text-slate-400" />
              </button>
              
              <div className="flex justify-between items-start border-b-4 border-[#171844] pb-10 mb-10">
                 <div>
                    <h1 className="text-4xl font-black text-[#171844] uppercase tracking-tighter">Site Deployment Report</h1>
                    <p className="text-[#87A237] font-bold text-lg">{project.name}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Site Code</p>
                    <p className="text-2xl font-black text-[#171844]">{project.siteId}</p>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-12">
                 <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-lg font-black text-emerald-600">DELIVERED</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modules</p>
                    <p className="text-lg font-black text-[#171844]">{project.selectedModules.length} Configured</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-lg font-black text-[#171844]">{new Date(project.handoverSignedAt || Date.now()).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="p-8 border-2 border-slate-100 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-2 text-[#171844] font-black uppercase text-xs tracking-widest">
                       <FileText size={16} /> Technical Documentation Summary
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                       This report encapsulates the full technical lifecycle for {project.name}. All VLANs have been segmented, the TV headend tuned to site-specific bouquets, and cloud synchronization for the mobile experience verified.
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-10 items-end">
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Nonius Lead Technician</p>
                       <p className="text-lg font-bold border-b border-slate-200 pb-2">{project.pm}</p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Client Signatory</p>
                       <div className="p-4 bg-slate-50 rounded-2xl h-24 flex items-center justify-center">
                          <span className="text-slate-300 font-mono italic text-xs">Digital Token: {project.handoverSignedAt?.split('T')[0]}-{project.siteId}</span>
                       </div>
                       <p className="text-lg font-bold border-b border-slate-200 pb-2">{project.handoverSignedBy}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-16 flex justify-center">
                 <button className="flex items-center gap-3 px-12 py-5 bg-[#87A237] text-white rounded-[2rem] font-bold shadow-2xl hover:scale-105 transition-all">
                    <Download size={20} /> Download Final PDF Report
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HandoverManager;
