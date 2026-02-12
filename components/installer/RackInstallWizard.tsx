
import React from 'react';
import { Project, Rack, UserRole } from '../../types';
import { useProjects } from '../../contexts/ProjectContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, Server, Save, CheckCircle2 } from 'lucide-react';
import RackBuilder from '../RackBuilder';

interface RackInstallWizardProps {
  project: Project;
  rackId: string;
  rackName: string;
  onClose: () => void;
}

const RackInstallWizard: React.FC<RackInstallWizardProps> = ({ project, rackId, rackName, onClose }) => {
  const { saveProject, currentUser } = useProjects();
  const { addNotification } = useNotifications();

  // Helper to ensure rack exists in config
  const ensureRackExists = (currentProject: Project): Project => {
    const rackConfig = currentProject.rackConfig || { racks: [] };
    const exists = rackConfig.racks.find(r => r.id === rackId);
    
    if (!exists) {
      const newRack: Rack = {
        id: rackId,
        name: rackName,
        height: 42,
        devices: []
      };
      return {
        ...currentProject,
        rackConfig: {
          ...rackConfig,
          racks: [...rackConfig.racks, newRack]
        }
      };
    }
    return currentProject;
  };

  // Ensure rack exists on mount/render so RackBuilder doesn't crash
  const safeProject = ensureRackExists(project);

  const handleUpdate = (config: { racks: Rack[] }) => {
    saveProject({
      ...project,
      rackConfig: config
    });
  };

  const handleSaveAndClose = () => {
    addNotification('SUCCESS', `${rackName} configuration saved by ${currentUser.name}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F4F6] animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm flex items-center justify-between shrink-0">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Infrastructure Wizard</span>
          <h2 className="text-3xl font-black text-[#171844] flex items-center gap-3">
             <Server size={32} className="text-[#171844]" /> {rackName}
          </h2>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">
          <X size={24} />
        </button>
      </div>

      {/* Rack Builder Context */}
      <div className="flex-1 overflow-y-auto p-6">
         <div className="bg-white rounded-[2.5rem] p-6 shadow-sm min-h-full">
            <RackBuilder 
                project={safeProject} 
                onUpdate={handleUpdate} 
                role={UserRole.TECHNICIAN} 
                initialRackId={rackId}
            />
         </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-white border-t border-slate-200 shrink-0 pb-10">
        <button 
          onClick={handleSaveAndClose}
          className="w-full py-5 rounded-[2rem] font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-[#171844] text-white shadow-indigo-100 hover:bg-[#0f1035]"
        >
          <CheckCircle2 size={24} /> Complete & Close Rack
        </button>
      </div>
    </div>
  );
};

export default RackInstallWizard;
