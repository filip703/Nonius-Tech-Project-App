
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NoniusLogo } from '../App';
import { ShieldCheck, LogIn, Globe, UserCheck, LayoutDashboard, Wrench, HardHat } from 'lucide-react';
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
                  Select your role to access the project environment.
                </p>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleTechLogin}
                  className="w-full py-5 bg-[#87A237] text-white rounded-[2rem] font-bold shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <LogIn size={20} />
                    Log in with Nonius SSO
                </button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <Link 
                    to="/installer"
                    className="w-full py-4 bg-[#E9F2F8] text-[#171844] rounded-[2rem] text-xs font-bold hover:bg-white transition-all flex flex-col items-center justify-center gap-2 shadow-lg"
                   >
                      <HardHat size={20} className="text-[#0070C0]" />
                      On-Site Installer
                   </Link>

                   <button 
                    onClick={handleClientLogin}
                    className="w-full py-4 bg-[#171844]/50 text-white border border-white/10 rounded-[2rem] text-xs font-bold hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2"
                   >
                      <LayoutDashboard size={20} />
                      Client View
                   </button>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-slate-500">
             <div className="flex items-center gap-6">
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
    </div>
  );
};

export default Login;
