
import React, { useState, useRef } from 'react';
/* Updated icon names */
import { FileText, Image, File, Trash2, Download, Plus, Search, Filter, EllipsisVertical, CloudUpload, LoaderCircle } from 'lucide-react';
import { ProjectDocument, DocumentCategory, ModuleType } from '../types';

interface DocumentManagerProps {
  documents: ProjectDocument[];
  projectId: string;
  onUpload: (doc: ProjectDocument) => void;
  onDelete: (docId: string) => void;
  isViewOnly?: boolean;
}

const CategoryColors: Record<string, string> = {
  [DocumentCategory.NETWORK_DIAGRAM]: 'bg-indigo-100 text-indigo-700',
  [DocumentCategory.SITE_PHOTO]: 'bg-emerald-100 text-emerald-700',
  [DocumentCategory.QA_CHECKLIST]: 'bg-amber-100 text-amber-700',
  [DocumentCategory.CONTRACT]: 'bg-blue-100 text-blue-700',
  [DocumentCategory.TECHNICAL_SPEC]: 'bg-purple-100 text-purple-700',
  [DocumentCategory.OTHER]: 'bg-slate-100 text-slate-700',
};

const FileIcon = ({ mimeType }: { mimeType: string }) => {
  if (mimeType.includes('pdf')) return <FileText className="text-red-500" />;
  if (mimeType.includes('image')) return <Image className="text-blue-500" />;
  return <File className="text-slate-400" />;
};

const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, projectId, onUpload, onDelete, isViewOnly = false }) => {
  const [filter, setFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(filter.toLowerCase()) || 
    doc.category.toLowerCase().includes(filter.toLowerCase())
  );

  const handleBrowseFiles = () => {
    if (isViewOnly) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewOnly) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files) as File[]) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        category: DocumentCategory.OTHER,
        size: file.size,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Alex Tech',
        storageUrl: `https://storage.nonius.com/${projectId}/${file.name}`,
      };

      onUpload(newDoc);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Upload Zone - Hidden for PMs */}
      {!isViewOnly && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              setUploading(true);
              for (const file of Array.from(files) as File[]) {
                await new Promise(resolve => setTimeout(resolve, 600));
                const newDoc: ProjectDocument = {
                  id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: file.name,
                  mimeType: file.type || 'application/octet-stream',
                  category: DocumentCategory.OTHER,
                  size: file.size,
                  uploadDate: new Date().toISOString(),
                  uploadedBy: 'Alex Tech',
                  storageUrl: `https://storage.nonius.com/${projectId}/${file.name}`,
                };
                onUpload(newDoc);
              }
              setUploading(false);
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging ? 'border-[#0070C0] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0070C0] flex items-center justify-center mb-2">
            {uploading ? <LoaderCircle size={32} className="animate-spin" /> : <CloudUpload size={32} />}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-900 text-lg">
              {uploading ? 'Processing Uploads...' : 'Upload Technical Documentation'}
            </p>
            <p className="text-slate-500 text-sm mt-1">Drag and drop diagrams, photos, or certifications here</p>
          </div>
          <button 
            onClick={handleBrowseFiles}
            disabled={uploading}
            className="mt-4 px-6 py-2.5 bg-[#171844] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
          >
            Browse Local Files
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search documents by name or tag..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#0070C0] outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Categories
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="group bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <FileIcon mimeType={doc.mimeType} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 truncate text-sm">{doc.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CategoryColors[doc.category]}`}>
                  {doc.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{formatSize(doc.size)}</span>
              </div>
              {doc.moduleId && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#87A237]">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#87A237]"></div>
                   Linked to {doc.moduleId} System
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-[#0070C0] hover:bg-blue-50 rounded-lg transition-all" title="Download">
                <Download size={18} />
              </button>
              {!isViewOnly && (
                <button 
                  onClick={() => onDelete(doc.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <File size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No documents found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
