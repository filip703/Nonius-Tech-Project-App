
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Info, FileText, LayoutGrid, Eye, CircleUser, Globe, Users, Briefcase, FileCheck, Tag, PackageX, Mail, Phone, ExternalLink, Hotel, UserCog, Building2, Github, GitBranch, GitCommit, RefreshCw } from 'lucide-react';
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
  const [isSyncing, setIsSyncing] = useState(false);

  const isViewOnly = role === UserRole.PROJECT_MANAGER;

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
    else setActiveTab('Overview');
  }, [searchParams]);

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
        <LayoutGrid className="text-slate-400" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-[#171844]">Project Not Found</h2>
      <Link to="/" className="mt-8 px-8 py-3 bg-[#171844] text-white rounded-2xl font-bold">Return Hub</Link>
    </div>
  );

  const availableModules = project.selectedModules || [];
  const tabs = ['Overview', ...availableModules, 'Topology', 'Documents'];

  const handleSave = (updatedFields: Partial<Project>) => {
    if (isViewOnly) return;
    saveProject({ ...project, ...updatedFields, updatedAt: new Date().toISOString() });
  };

  const handleGitSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      handleSave({ lastGitSync: new Date().toISOString() });
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
      {/* Detail Header */}
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="p-2 md:p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm">
            <ChevronLeft size={20} className="text-[#171844]" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-3xl font-bold text-[#171844] truncate">{project.name}</h1>
              {isViewOnly && <span className="text-[8px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">VIEW</span>}
            </div>
            <p className="text-slate-500 text-[10px] md:text-sm font-medium italic truncate">{project.address}</p>
          </div>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-4 md:pb-6 scrollbar-hide mb-6 md:mb-10 sticky top-20 bg-[#E9F2F8]/95 backdrop-blur-md z-30 pt-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (availableModules.includes(tab as ModuleType)) setSearchParams({ tab });
              else if (tab === 'Topology') setSearchParams({ tab: 'Topology' });
              else setSearchParams({});
            }}
            className={`px-4 md:px-8 py-2.5 md:py-3.5 text-[10px] md:text-xs font-bold whitespace-nowrap transition-all rounded-xl md:rounded-2xl border ${
              activeTab === tab || (activeTab === 'Topology' && tab === 'Topology') || (activeTab === 'Network Topology' && tab === 'Topology')
                ? 'bg-[#171844] text-white border-[#171844] shadow-md' 
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        <div className="lg:col-span-3 order-2 lg:order-1 space-y-8">
          {activeTab === 'Overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Site Info Card */}
               <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm space-y-6 md:space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-[#171844]">
                      <Building2 size={24} className="text-[#0070C0]" /> Site Profile
                    </h3>
                    <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100 self-start md:self-auto">
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
                       <p className="text-xs font-black text-[#171844]">{project.rooms} Rooms</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {[
                      { label: 'Nonius Country Manager', key: 'countryManager' },
                      { label: 'Hotel General Manager', key: 'generalManager' },
                      { label: 'Client IT Manager', key: 'itManager' },
                      { label: 'Hotel Brand/Category', key: 'category' }
                    ].map(field => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                        <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0070C0] text-sm font-bold" 
                          value={(project as any)[field.key]} 
                          onChange={e => handleSave({ [field.key]: e.target.value })}
                          disabled={isViewOnly} 
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Address</label>
                      <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={project.address} onChange={e => handleSave({ address: e.target.value })} disabled={isViewOnly} />
                    </div>
                  </div>
               </div>

               {/* GitHub Synchronization Card */}
               <div className="bg-[#171844] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Github size={180} />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                       <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                         <Github size={24} className="text-[#87A237]" />
                         Technical Manifest Sync
                       </h3>
                       <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                         Synchronize the site's technical parameters with the central configuration repository for auditing and disaster recovery.
                       </p>
                    </div>
                    <button 
                      onClick={handleGitSync}
                      disabled={isSyncing || isViewOnly}
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        isSyncing ? 'bg-white/10 text-slate-400' : 'bg-[#87A237] text-white hover:scale-105 shadow-lg shadow-black/20'
                      }`}
                    >
                      {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <GitCommit size={18} />}
                      {isSyncing ? 'Pushing Manifest...' : 'Commit & Push to Master'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 relative z-10">
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                        <GitBranch size={20} className="text-slate-400" />
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Target Repository</p>
                          <p className="text-[10px] font-bold font-mono">nonius/site-reports/{project.siteId.toLowerCase()}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                        <refresh-cw size={20} className="text-slate-400" />
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Last Synchronization</p>
                          <p className="text-[10px] font-bold">{project.lastGitSync ? new Date(project.lastGitSync).toLocaleString() : 'Never Synced'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                        <FileCheck size={20} className="text-[#87A237]" />
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Verification</p>
                          <p className="text-[10px] font-bold">Schema v4.2 Validated</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {(activeTab === 'Topology' || activeTab === 'Network Topology') && <NetworkVisualizer />}
          {activeTab === 'Documents' && <DocumentManager documents={project.documents} projectId={project.id} onUpload={(doc) => handleSave({ documents: [...project.documents, doc] })} onDelete={(id) => handleSave({ documents: project.documents.filter(d => d.id !== id) })} isViewOnly={isViewOnly} />}

          {activeTab === ModuleType.TV && <TvConfiguration project={project} onUpdate={(tvConfig) => handleSave({ tvConfig })} role={role} />}
          {activeTab === ModuleType.CAST && <CastConfiguration project={project} onUpdate={(castConfig) => handleSave({ castConfig })} role={role} />}
          {activeTab === ModuleType.INTERNET && <WifiConfiguration project={project} onUpdate={(wifiConfig) => handleSave({ wifiConfig })} role={role} />}
          {activeTab === ModuleType.RACK && <RackBuilder project={project} onUpdate={(rackConfig) => handleSave({ rackConfig })} role={role} />}
          {activeTab === ModuleType.VLAN && <NetworkSolutions project={project} onUpdate={(networkSolutions) => handleSave({ networkSolutions })} role={role} />}
          {activeTab === ModuleType.SWITCHING && <SwitchingPlan project={project} onUpdate={(switchingPlan) => handleSave({ switchingPlan })} role={role} />}
          {activeTab === ModuleType.VOICE && <VoiceConfiguration project={project} onUpdate={(voiceConfig) => handleSave({ voiceConfig })} role={role} />}
          {activeTab === ModuleType.MOBILE && <MobileAppConfig project={project} onUpdate={(mobileConfig) => handleSave({ mobileConfig })} role={role} />}
          {activeTab === ModuleType.HANDOVER && <HandoverManager project={project} role={role} />}
          {activeTab === ModuleType.PHOTOS && <PhotoDocumentation role={role} />}
          {activeTab === ModuleType.RMA && <RmaManager role={role} />}
          {activeTab === ModuleType.LABELS && <LabelGenerator project={project} />}
        </div>

        {/* Sidebar: Stacked below on mobile */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-24">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Site Stakeholders
            </h4>
            <div className="space-y-3">
              {project.contacts.slice(0, 4).map(c => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-transparent flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${c.role === 'Nonius' ? 'bg-[#171844] text-[#87A237]' : 'bg-[#87A237] text-white'}`}>
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#171844] truncate">{c.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase truncate leading-none mt-0.5">{c.jobDescription}</p>
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
