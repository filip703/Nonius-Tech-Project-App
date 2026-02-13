
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { ChatMessage } from '../types';

const ProjectChat: React.FC = () => {
  const { activeProject, saveProject, currentUser } = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeProject?.chatMessages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeProject) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      role: currentUser.role,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    saveProject({
      ...activeProject,
      chatMessages: [...messages, msg]
    });
    setNewMessage('');
  };

  if (!activeProject) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#171844] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-[#87A237]" />
              <div>
                <h3 className="font-bold text-sm">Site Team Chat</h3>
                <p className="text-[10px] text-slate-400 font-medium">Logged as {currentUser.name}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <MessageCircle size={32} className="mb-2 opacity-50" />
                <p>No messages yet.</p>
                <p>Start the conversation with your team.</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-[#0070C0] text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold text-[#87A237] mb-1">{msg.senderName} • {msg.role}</p>}
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0070C0] outline-none"
              placeholder="Type update..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-2 bg-[#171844] text-white rounded-xl hover:bg-[#2a2c6d] disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#171844] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} />
            {messages.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#87A237] rounded-full border-2 border-[#171844]" />}
          </div>
        )}
      </button>
    </div>
  );
};

export default ProjectChat;
