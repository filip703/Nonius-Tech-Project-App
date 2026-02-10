
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
/* Updated icon names */
import { CircleCheck, Clock, TriangleAlert, ArrowUpRight, Plus, ChevronRight } from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';
import { UserRole, DeploymentStatus } from '../types';

const data = [
  { name: 'TV', complete: 85, pending: 15 },
  { name: 'Voice', complete: 40, pending: 60 },
  { name: 'Internet', complete: 100, pending: 0 },
  { name: 'Cast', complete: 60, pending: 40 },
  { name: 'Mobile', complete: 30, pending: 70 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC<{ role: UserRole }> = ({ role }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operational Overview</h1>
          <p className="text-slate-500 mt-1">Real-time status of all active hotel deployments.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus size={20} />
          Create New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Deployments" value="24" icon={Clock} color="bg-blue-500" trend="+12%" />
        <StatCard title="Ready for QA" value="8" icon={CircleCheck} color="bg-emerald-500" />
        <StatCard title="Critical Issues" value="3" icon={TriangleAlert} color="bg-amber-500" />
        <StatCard title="Completed (MTD)" value="152" icon={CircleCheck} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Module Deployment Progress (%)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} font-family="'Source Sans 3', sans-serif" tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} font-family="'Source Sans 3', sans-serif" tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="complete" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            {MOCK_PROJECTS.map(p => (
              <Link key={p.id} to={`/project/${p.id}`} className="group block">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {p.siteId}
                      </span>
                      <span className="text-xs text-slate-400">Updated 2h ago</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 mt-2" />
                </div>
              </Link>
            ))}
          </div>
          <button className="mt-8 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">
            View All Sites
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
