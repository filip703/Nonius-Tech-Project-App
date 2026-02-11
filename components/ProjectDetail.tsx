
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Info, FileText, LayoutGrid, Eye, CircleUser, Globe, Users, Briefcase, FileCheck, Tag, PackageX, Mail, Phone, ExternalLink, Hotel, UserCog, Building2 } from 'lucide-react';
import { IP_REGEX } from '../constants';
import { ModuleType, UserRole, ProjectDocument, Device, Project, TvModuleConfig } from '../types';
import DocumentManager from './DocumentManager';
import NetworkVisualizer from './NetworkVisualizer';
import TvConfiguration from './TvConfiguration';
import CastConfiguration from './CastConfiguration';
import WifiConfiguration from './WifiConfiguration';
import RackBuilder from './RackBuilder';
import NetworkSolutions from './NetworkSolutions';
import SwitchingPlan from './SwitchingPlan';
import VoiceConfiguration from './VoiceConfiguration';
import MobileAppConfig from './MobileAppConfig';
import BackupManager from './BackupManager';
import PhotoDocumentation from './PhotoDocumentation';
import HandoverManager from './HandoverManager';
import LabelGenerator from './LabelGenerator';
import RmaManager from './RmaManager';
import { useProjects } from '../contexts/ProjectContext';

const ProjectDetail: React.FC<{ role: UserRole }> = ({ role }) => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, saveProject } = useProjects();
  
  const project = projects.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<string>('Overview');

  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
    else setActiveTab('Overview');
  }, [searchParams]);

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
        <LayoutGrid className="text-slate-400" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-[#171844]">Project Not Found</h2>
      <p className="text-slate-500 mt-2 font-medium">Please return to the hub and select an active project.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-[#171844] text-white rounded-2xl font-bold hover:scale-105 transition-all">Return to Hub</Link>
    </div>
  );

  const availableModules = project.selectedModules || [];

  const tabs = ['Overview', ...availableModules, 'Network Topology', 'Documents'];

  const handleSave = (updatedFields: Partial<Project>) => {
    if (isViewOnly) return;
    saveProject({ ...project, ...updatedFields, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Detail Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
            <ChevronLeft size={24} className="text-[#171844]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#171844]">{project.name}</h1>
              {isViewOnly && (
                <span className="text-[10px] font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-lg uppercase flex items-center gap-1.5 shadow-sm">
                  <Eye size={14} /> VIEW ONLY
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">{project.address}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide mb-10 sticky top-16 bg-[#E9F2F8]/90 backdrop-blur-md z-30 pt-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (availableModules.includes(tab as ModuleType)) setSearchParams({ tab });
              else setSearchParams({});
            }}
            className={`px-8 py-3.5 text-xs font-bold whitespace-nowrap transition-all rounded-2xl border ${
              activeTab === tab 
                ? 'bg-[#171844] text-white border-[#171844] shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
          {activeTab === 'Overview' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-[#171844]">
                      <Building2 size={28} className="text-[#0070C0]" />
                      Site Profile & Governance
                    </h3>
                    <div className="flex gap-4">
                       <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Inventory Size</p>
                          <p className="text-sm font-black text-[#171844]">{project.rooms} Rooms</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nonius Country Manager (NCM)</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-bold" 
                        value={project.countryManager} 
                        onChange={e => handleSave({ countryManager: e.target.value })}
                        disabled={isViewOnly} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hotel General Manager (GM)</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-bold" 
                        value={project.generalManager} 
                        onChange={e => handleSave({ generalManager: e.target.value })}
                        disabled={isViewOnly} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client IT Manager / Director</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0] font-bold" 
                        value={project.itManager} 
                        onChange={e => handleSave({ itManager: e.target.value })}
                        disabled={isViewOnly} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hotel Category / Brand</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0]" 
                        value={project.category} 
                        onChange={e => handleSave({ category: e.target.value })}
                        disabled={isViewOnly} 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Address</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0]" value={project.address} onChange={e => handleSave({ address: e.target.value })} disabled={isViewOnly} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Public Website</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0]" value={project.clientInfo.website} disabled={isViewOnly} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Room Count</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070C0]" 
                        value={project.rooms} 
                        onChange={e => handleSave({ rooms: parseInt(e.target.value) })}
                        disabled={isViewOnly} 
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'Network Topology' && <NetworkVisualizer />}
          {activeTab === 'Documents' && <DocumentManager documents={project.documents} projectId={project.id} onUpload={(doc) => handleSave({ documents: [...project.documents, doc] })} onDelete={(id) => handleSave({ documents: project.documents.filter(d => d.id !== id) })} isViewOnly={isViewOnly} />}

          {activeTab === ModuleType.TV && <TvConfiguration project={project} onUpdate={(tvConfig) => handleSave({ tvConfig })} role={role} />}
          {activeTab === ModuleType.CAST && <CastConfiguration project={project} onUpdate={(castConfig) => handleSave({ castConfig })} role={role} />}
          {activeTab === ModuleType.INTERNET && <WifiConfiguration project={project} onUpdate={(wifiConfig) => handleSave({ wifiConfig })} role={role} />}
          {activeTab === ModuleType.RACK && <RackBuilder project={project} onUpdate={(rackConfig) => handleSave({ rackConfig })} role={role} />}
          {activeTab === ModuleType.VLAN && <NetworkSolutions project={project} onUpdate={(networkSolutions) => handleSave({ networkSolutions })} role={role} />}
          {activeTab === ModuleType.SWITCHING && <SwitchingPlan project={project} onUpdate={(switchingPlan) => handleSave({ switchingPlan })} role={role} />}
          {activeTab === ModuleType.VOICE && <VoiceConfiguration project={project} onUpdate={(voiceConfig) => handleSave({ voiceConfig })} role={role} />}
          {activeTab === ModuleType.MOBILE && <MobileAppConfig project={project} onUpdate={(mobileConfig) => handleSave({ mobileConfig })} role={role} />}
          {activeTab === ModuleType.WEBAPP && <div className="p-20 text-center"><Globe size={64} className="mx-auto text-slate-200 mb-4" /><p className="font-bold text-slate-400 uppercase tracking-widest">Webapp Configuration Coming Soon</p></div>}
          {activeTab === ModuleType.PHOTOS && <PhotoDocumentation role={role} />}
          {activeTab === ModuleType.HANDOVER && <HandoverManager project={project} role={role} />}
          
          {activeTab === ModuleType.LABELS && <LabelGenerator project={project} />}
          {activeTab === ModuleType.RMA && <RmaManager role={role} />}
        </div>

        {/* Sidebar: Stakeholders */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Users size={14} /> Site Stakeholders
            </h4>
            <div className="space-y-4">
              {project.contacts.map(c => (
                <div key={c.id} className="group p-4 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg ${c.role === 'Nonius' ? 'bg-[#171844] text-[#87A237]' : 'bg-[#87A237] text-white'}`}>
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-[#171844] truncate">{c.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 leading-tight">{c.jobDescription}</p>
                      
                      <div className="flex items-center gap-2">
                         <a 
                           href={`mailto:${c.email}`} 
                           className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0070C0] hover:border-[#0070C0] transition-all shadow-sm group/icon"
                           title={`Email ${c.name}`}
                         >
                            <Mail size={14} className="group-hover/icon:scale-110 transition-transform" />
                         </a>
                         <a 
                           href={`tel:${c.mobile.replace(/\s/g, '')}`} 
                           className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#87A237] hover:border-[#87A237] transition-all shadow-sm group/icon"
                           title={`Call ${c.name}`}
                         >
                            <Phone size={14} className="group-hover/icon:scale-110 transition-transform" />
                         </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
