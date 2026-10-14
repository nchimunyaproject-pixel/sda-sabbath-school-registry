import React, { useState } from 'react';
import { LogOut, User, ChurchIcon, Bell, Check, Globe, Map } from 'lucide-react';
import { User as UserType, Role, Notification } from '../types.ts';
import sdaLogoImg from '../sda.png';

interface NavigationProps {
  user: UserType;
  notifications: Notification[];
  onLogout: () => void;
  onProfileClick: () => void;
  onMarkNotificationRead: (id: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  user,
  notifications,
  onLogout,
  onProfileClick,
  onMarkNotificationRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getRoleLabel = () => {
    switch (user.role) {
      case Role.CONFERENCE_ADMIN:
        return { label: 'Conference Admin', color: 'bg-indigo-600 text-white', icon: Globe };
      case Role.DISTRICT_ADMIN:
        return { label: 'District Admin', color: 'bg-blue-600 text-white', icon: Map };
      case Role.CLERK:
        return { label: 'Church Admin / Clerk', color: 'bg-amber-500 text-blue-950', icon: ChurchIcon };
      case Role.TEACHER:
        return { label: 'SS Teacher', color: 'bg-emerald-600 text-white', icon: User };
      default:
        return { label: 'Viewer', color: 'bg-slate-500 text-white', icon: User };
    }
  };

  const roleInfo = getRoleLabel();
  const RoleIcon = roleInfo.icon;

  return (
    <nav className="bg-blue-950 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1 flex items-center justify-center">
              <img src={sdaLogoImg} alt="SDA Logo" className="h-10 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
                SDA Sabbath School
              </p>
              <p className="text-xs font-semibold text-white opacity-85">
                {user.role === Role.CONFERENCE_ADMIN
                  ? 'Zambia Union Conference'
                  : user.role === Role.DISTRICT_ADMIN
                  ? 'District Management'
                  : user.churchName || 'Digital Register'}
              </p>
            </div>
          </div>

          {/* Role Badge + Controls */}
          <div className="flex items-center gap-3 relative">
            
            {/* Role Badge */}
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleInfo.color}`}
            >
              <RoleIcon className="w-3 h-3" />
              {roleInfo.label}
            </span>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-blue-900/60 border border-blue-700/50 hover:bg-blue-800 transition-colors rounded-xl text-blue-300 hover:text-white relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-500">Notifications</span>
                    {unreadCount > 0 && <span className="text-[10px] font-bold text-red-500">{unreadCount} unread</span>}
                  </div>

                  <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 text-xs transition-colors hover:bg-slate-50 ${n.isRead ? 'opacity-60' : 'bg-blue-50/20'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-slate-900">{n.title}</p>
                          {!n.isRead && (
                            <button
                              onClick={() => {
                                onMarkNotificationRead(n.id);
                              }}
                              className="text-emerald-600 hover:text-emerald-800 p-0.5 border border-emerald-200 hover:border-emerald-400 rounded bg-white transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-600 mt-1">{n.message}</p>
                        <span className="text-[9px] text-slate-400 block mt-2">Sender: {n.senderName}</span>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <p className="text-slate-400 italic text-center py-8 text-xs">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Settings */}
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 bg-blue-900/60 hover:bg-blue-800 transition-colors rounded-xl px-3 py-2 text-sm font-semibold border border-blue-700/50"
              title="Profile Settings"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-blue-950 font-black text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-650 hover:bg-red-750 transition-colors rounded-xl px-3 py-2 text-sm font-semibold border border-red-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navigation;
