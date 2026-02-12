
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProjectDetail from './components/ProjectDetail';
import ProjectHub from './components/ProjectHub';
import ClientDashboard from './components/ClientDashboard';
import ClientHub from './components/ClientHub';
import Login from './components/Login';
import Layout from './components/Layout';
import InstallerLogin from './components/installer/InstallerLogin';
import InstallerDashboard from './components/installer/InstallerDashboard';
import { ProjectProvider, useProjects } from './contexts/ProjectContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Network } from 'lucide-react';
import { UserRole } from './types';

export const NoniusLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  const dots = [
    'bg-[#171844]', 'bg-[#87A237]', 'bg-[#87A237]', 'bg-[#171844]',
    'bg-[#171844]', 'bg-[#171844]', 'bg-[#87A237]', 'bg-[#171844]',
    'bg-[#171844]', 'bg-[#87A237]', 'bg-[#171844]', 'bg-[#171844]',
    'bg-[#171844]', 'bg-[#87A237]', 'bg-[#87A237]', 'bg-[#171844]'
  ];

  return (
    <div className={`${className} grid grid-cols-4 gap-0.5 p-1 bg-white rounded-xl shadow-sm shrink-0 items-center justify-items-center`}>
      {dots.map((color, i) => (
        <div key={i} className={`w-full aspect-square rounded-full ${color}`} />
      ))}
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AppContent = () => {
  const { user } = useAuth();
  const { role } = useProjects();

  return (
    <Routes>
      {/* Main Auth */}
      <Route path="/login" element={<Login />} />
      
      {/* Admin/Tech Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === UserRole.CLIENT ? <ClientHub /> : <ProjectHub />}
        </ProtectedRoute>
      } />
      
      <Route path="/project/:id" element={
        <ProtectedRoute>
          <ProjectDetail role={role} />
        </ProtectedRoute>
      } />

      <Route path="/client/:id" element={
        <ProtectedRoute>
          <ClientDashboard />
        </ProtectedRoute>
      } />

      <Route path="/network" element={
        <ProtectedRoute>
          <div className="p-20 text-center">
            <Network size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest">Global Infrastructure View</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Installer Portal Routes (No Auth Context Required for Access via Code) */}
      <Route path="/installer" element={<InstallerLogin />} />
      <Route path="/installer/:id/dashboard" element={<InstallerDashboard />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <ProjectProvider>
      <NotificationProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </NotificationProvider>
    </ProjectProvider>
  </AuthProvider>
);

export default App;
