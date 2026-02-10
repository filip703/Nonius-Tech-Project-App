
import React, { useState } from 'react';
import { Camera, Upload, Trash2, Maximize2, MessageSquare, Plus } from 'lucide-react';
import { UserRole } from '../types';

interface PhotoDocumentationProps {
  role: UserRole;
}

const PhotoDocumentation: React.FC<PhotoDocumentationProps> = ({ role }) => {
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=300', caption: 'Main Rack MDF - Labelled cables' },
    { id: 2, url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=300', caption: 'AP-Room 101 Installation' },
  ]);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos([...photos, { id: Date.now(), url, caption: 'New Capture' }]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-[#171844]">Site Documentation Gallery</h2>
           <p className="text-slate-500 font-medium mt-1 italic text-sm">Visual evidence of hardware mounting, cable management, and room setup.</p>
        </div>
        {!isViewOnly && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 px-6 py-2.5 bg-[#87A237] text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer hover:bg-opacity-90 transition-all">
              <Camera size={16} /> Take Photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
            </label>
            <label className="flex items-center gap-2 px-6 py-2.5 bg-[#171844] text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer hover:bg-opacity-90 transition-all">
              <Upload size={16} /> Upload Batch
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleCapture} />
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {photos.map(p => (
          <div key={p.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all">
             <div className="relative aspect-video overflow-hidden">
                <img src={p.url} alt="Site" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button className="p-3 bg-white/20 backdrop-blur rounded-2xl text-white hover:bg-white/40"><Maximize2 size={20} /></button>
                   {!isViewOnly && <button onClick={() => setPhotos(photos.filter(x => x.id !== p.id))} className="p-3 bg-red-500/20 backdrop-blur rounded-2xl text-red-500 hover:bg-red-500 hover:text-white"><Trash2 size={20} /></button>}
                </div>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                   <MessageSquare size={16} className="text-[#0070C0] mt-1 shrink-0" />
                   <textarea 
                    disabled={isViewOnly}
                    className="w-full bg-slate-50 border-none rounded-xl text-xs p-3 font-medium outline-none focus:ring-2 focus:ring-[#0070C0] resize-none"
                    rows={2}
                    value={p.caption}
                    onChange={(e) => {
                      const next = [...photos];
                      const idx = next.findIndex(x => x.id === p.id);
                      next[idx].caption = e.target.value;
                      setPhotos(next);
                    }}
                    placeholder="Describe this photo..."
                   />
                </div>
             </div>
          </div>
        ))}
        {!isViewOnly && (
          <button className="h-full min-h-[250px] bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-[#0070C0] hover:text-[#0070C0] transition-all">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                <Plus size={32} />
             </div>
             <span className="font-black uppercase tracking-widest text-[10px]">Add Photo Slot</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoDocumentation;
