
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NoniusLogo } from '../App';
import { ShieldCheck, LogIn, Globe, UserCheck, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTechLogin = () => {
    login(UserRole.TECHNICIAN);
    navigate('/');
  };

  const handleClientLogin = () => {
    login(UserRole.CLIENT);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#171844] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#87A237]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#0070C0]/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-10 text-center">
          <div className="flex flex-col items-center gap-4">
             <div className="p-4 bg-white rounded-3xl shadow-xl">
               <NoniusLogo className="w-16 h-16" />
             </div>
             <div>
                <h1 className="text-white text-3xl font-black tracking-tight">Nonius TechOps</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">Deployment Platform</p>
             </div>
          </div>

          <div className="space-y-6">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-left">
                <h2 className="text-white font-bold text-lg mb-2">Access Portal</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sign in to manage deployments or view project highlights and real-time site readiness.
                </p>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleTechLogin}
                  className="w-full py-5 bg-[#87A237] text-white rounded-[2rem] font-bold shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <LogIn size={20} />
                    Sign in with Nonius SSO
                </button>

                <button 
                  onClick={handleTechLogin}
                  className="w-full py-4 bg-white/10 text-white/80 border border-white/10 rounded-[2rem] text-sm font-bold hover:bg-white/20 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <UserCheck size={18} />
                    Connect as Test Technician
                </button>

                <div className="pt-2">
                   <button 
                    onClick={handleClientLogin}
                    className="w-full py-4 bg-[#0070C0] text-white rounded-[2rem] text-sm font-bold hover:bg-[#0070C0]/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/40"
                   >
                      <LayoutDashboard size={18} />
                      Sign in as Client Viewer
                   </button>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-6 text-slate-500">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                <ShieldCheck size={14} /> Secure Terminal
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                <Globe size={14} /> Global v4.0
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
