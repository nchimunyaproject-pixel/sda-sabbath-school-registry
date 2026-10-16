
import React, { useState } from 'react';
import { User, Role } from '../types';
import { X, ShieldPlus, GraduationCap, CheckCircle } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  updatePassword: (userId: string, newPassword: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, updatePassword }) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassword(user.id, newPassword);
    setNewPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border-8 border-white animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">
            {user.role === Role.CLERK ? 'Admin Profile' : 'Teacher Profile'}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all border border-slate-100 active:scale-90">
            <X className="w-8 h-8 text-slate-950" />
          </button>
        </div>
        
        <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-900/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-slate-900 text-xl leading-none tracking-tight">{user.name}</p>
              <p className="text-xs text-slate-400 font-bold mt-1.5">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {user.role === Role.CLERK ? (
              <>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Church Station</span>
                  <span className="text-xs font-black text-slate-900">{user.churchName || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Role</span>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <ShieldPlus className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Conference Clerk</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Role</span>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <GraduationCap className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Authorized Teacher</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Security Key</label>
            <input 
              type="password" 
              required 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-8 py-5 bg-slate-50 border-4 border-slate-100 rounded-3xl focus:ring-8 focus:ring-blue-50 focus:border-blue-900 transition-all font-black text-2xl text-slate-900 placeholder:text-slate-400 outline-none" 
              placeholder="••••••••" 
              autoFocus 
            />
          </div>
          <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl border-b-8 border-emerald-950 uppercase tracking-widest text-xs hover:bg-emerald-800 transition-all active:scale-95">
            Update Security Key
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
