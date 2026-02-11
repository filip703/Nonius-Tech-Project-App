
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, UserRole, Technician } from '../types';

const FIELD_TECHS: Technician[] = [
  { id: 't1', name: 'Alex Tech', role: 'Senior Lead' },
  { id: 't2', name: 'Marcus G', role: 'Network Specialist' },
  { id: 't3', name: 'Johan V', role: 'On-site Support' },
  { id: 't4', name: 'Sarah L', role: 'QA Lead' },
];

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  role: UserRole;
  currentUser: Technician;
  fieldTechs: Technician[];
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  setRole: (role: UserRole) => void;
  setCurrentUser: (tech: Technician) => void;
  setActiveProject: (project: Project | null) => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  createNewProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.TECHNICIAN);
  const [currentUser, setCurrentUser] = useState<Technician>(FIELD_TECHS[0]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Load from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('nonius_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse projects', e);
      }
    }
  }, []);

  // Save to localStorage when projects change
  useEffect(() => {
    localStorage.setItem('nonius_projects', JSON.stringify(projects));
  }, [projects]);

  const createNewProject = (project: Project) => {
    const initializedProject = { ...project, isLocked: false };
    setProjects(prev => [...prev, initializedProject]);
    setActiveProject(initializedProject);
    setIsWizardOpen(false);
  };

  const saveProject = (updated: Project) => {
    // If handover is being signed for the first time, auto-lock
    const shouldLock = updated.handoverSignedAt && updated.isLocked === undefined;
    const finalUpdate = shouldLock ? { ...updated, isLocked: true } : updated;

    setProjects(prev => prev.map(p => p.id === updated.id ? finalUpdate : p));
    if (activeProject?.id === updated.id) {
      setActiveProject(finalUpdate);
    }
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) setActiveProject(null);
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      activeProject, 
      role, 
      currentUser,
      fieldTechs: FIELD_TECHS,
      isWizardOpen,
      setIsWizardOpen,
      setRole,
      setCurrentUser,
      setActiveProject, 
      saveProject, 
      deleteProject,
      createNewProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
};
