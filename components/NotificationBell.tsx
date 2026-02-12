
import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={16} className="text-[#87A237]" />;
      case 'ISSUE': return <AlertCircle size={16} className="text-red-500" />;
      case 'SYSTEM': return <Info size={16} className="text-blue-500" />;
    }
  };

  const getBg = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50 border-green-100';
      case 'ISSUE': return 'bg-red-50 border-red-100';
      case 'SYSTEM': return 'bg-blue-50 border-blue-100';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#171844] hover:bg-slate-100 transition-all relative border border-transparent hover:border-slate-200"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-sm text-[#171844]">Notifications</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notifications.length} Events</span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium italic">
                No recent activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((note) => (
                  <div key={note.id} className={`p-4 flex gap-3 ${getBg(note.type)} border-l-4 border-l-transparent hover:brightness-95 transition-all`}>
                    <div className="mt-0.5 shrink-0 bg-white p-1.5 rounded-lg shadow-sm h-fit">
                      {getIcon(note.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug">{note.message}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5">{formatTime(note.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
