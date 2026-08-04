import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Users, BookOpen, Bell, Calendar, DollarSign, Plus, Trash2, Edit3, CheckCircle, XCircle, ChevronDown, ChevronRight, LayoutDashboard, Send, MapPin, Eye, FileText, Settings, ShieldCheck, ToggleLeft, ToggleRight, Search, Lock, UserCheck, X, Save } from 'lucide-react';
import { User, Class, Announcement, AttendanceRecord, Offerings, District, Church, Role, PendingDistrictRegistration } from '../types.ts';

interface ConferenceDashboardProps {
  user: User;
  districts: District[];
  churches: Church[];
  teachers: User[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];
  pendingDistrictRegs: PendingDistrictRegistration[];
  onCreateDistrict: (name: string) => void;
  onUpdateDistrict: (id: string, name: string, is_active: boolean) => void;
  onApproveChurch: (id: string) => void;
  onApproveDistrictReg: (id: string) => void;
  onPublishAnnouncement: (announcementData: any) => void;
  onAdminUpdateUser: (userId: string, data: Partial<User> & { password?: string }) => void;
  onLogout: () => void;
}

const ConferenceDashboard: React.FC<ConferenceDashboardProps> = ({
  user,
  districts,
  churches,
  teachers,
  attendanceRecords,
  announcements,
  pendingDistrictRegs,
  onCreateDistrict,
  onUpdateDistrict,
  onApproveChurch,
  onApproveDistrictReg,
  onPublishAnnouncement,
  onAdminUpdateUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'churches' | 'approvals' | 'announcements' | 'users'>('overview');

  // User Management States
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [approvalSubTab, setApprovalSubTab] = useState<'churches' | 'districts'>('churches');

  // My Profile States
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const allUsers = useMemo(() => [...teachers].filter(u => u.id !== user.id), [teachers, user.id]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const s = userSearch.toLowerCase();
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
    );
  }, [allUsers, userSearch]);

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword('');
    setEditIsActive(u.is_active !== false);
    setShowEditModal(true);
  };

  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    onAdminUpdateUser(editingUser.id, {
      name: editName,
      email: editEmail,
      password: editPassword || undefined,
      is_active: editIsActive
    });
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSaveProfile = () => {
    onAdminUpdateUser(user.id, {
      name: profileName,
      email: profileEmail,
      password: profilePassword || undefined
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };
  
  // District Management States
  const [newDistrictName, setNewDistrictName] = useState('');
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [editingDistrictName, setEditingDistrictName] = useState('');

  // Announcement States
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceTargetType, setAnnounceTargetType] = useState<'CONFERENCE' | 'DISTRICT' | 'CHURCH'>('CONFERENCE');
  const [announceTargetId, setAnnounceTargetId] = useState('ALL');
  const [announcePriority, setAnnouncePriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');

  // Search/Collapse States for Discovery
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});

  // 1. STATS CALCULATION
  const totalChurches = churches.filter(c => c.status === 'approved').length;
  const pendingChurches = churches.filter(c => c.status === 'pending');
  const totalMembers = churches.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.membership || 0), 0);
  
  // Weekly Attendance calculations
  const totalPresent = attendanceRecords.reduce((sum, r) => sum + r.presentCount, 0);
  const totalAbsent = attendanceRecords.reduce((sum, r) => sum + r.absentCount, 0);
  const totalTracked = totalPresent + totalAbsent;
  const attendanceRate = totalTracked > 0 ? Math.round((totalPresent / totalTracked) * 100) : 0;
  const totalVisitors = attendanceRecords.reduce((sum, r) => sum + r.visitorCount, 0);

  // Toggle District Collapse
  const toggleDistrict = (id: string) => {
    setExpandedDistricts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group churches by district
  const churchesByDistrict = useMemo(() => {
    const map: Record<string, Church[]> = {};
    districts.forEach(d => {
      map[d.id] = churches.filter(c => c.districtId === d.id && c.status === 'approved');
    });
    return map;
  }, [districts, churches]);

  // Handle Create District
  const handleCreateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim()) return;
    onCreateDistrict(newDistrictName.trim());
    setNewDistrictName('');
  };

  // Handle Edit District Save
  const handleSaveDistrictEdit = (id: string) => {
    if (!editingDistrictName.trim()) return;
    const current = districts.find(d => d.id === id);
    if (current) {
      onUpdateDistrict(id, editingDistrictName.trim(), current.is_active);
    }
    setEditingDistrictId(null);
  };

  // Handle Toggle District Active Status
  const handleToggleDistrictActive = (id: string) => {
    const current = districts.find(d => d.id === id);
    if (current) {
      onUpdateDistrict(id, current.name, !current.is_active);
    }
  };

  // Handle Publish Announcement
  const handlePublishAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceContent.trim()) return;

    onPublishAnnouncement({
      id: `ann_conf_${Date.now()}`,
      title: announceTitle.trim() || 'Conference Announcement',
      content: announceContent.trim(),
      targetType: announceTargetType,
      targetId: announceTargetId,
      priority: announcePriority,
      teacherId: user.id,
      teacherName: user.name,
      className: 'Conference Administration',
      timestamp: new Date().toISOString(),
      status: 'compiled'
    });

    setAnnounceTitle('');
    setAnnounceContent('');
    alert('Announcement published successfully!');
  };

  // Filtered Churches for Discovery
  const filteredDiscoveryChurches = useMemo(() => {
    if (!discoverySearch.trim()) return churches.filter(c => c.status === 'approved');
    const s = discoverySearch.toLowerCase();
    return churches.filter(c => 
      c.status === 'approved' &&
      (c.church_name.toLowerCase().includes(s) ||
       c.province.toLowerCase().includes(s) ||
       (c.pastor_name || '').toLowerCase().includes(s) ||
       c.clerkName.toLowerCase().includes(s))
    );
  }, [churches, discoverySearch]);

  // Offerings Summary
  const offeringsData = useMemo(() => {
    return [
      { name: 'Weekly Mission', amount: 4500 },
      { name: '13th Sabbath', amount: 3200 },
      { name: 'Birthday/Thank', amount: 1500 },
      { name: 'Investment', amount: 2000 }
    ];
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-amber-500 text-blue-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Conference Administration</span>
            <h1 className="text-3xl font-black mt-2">Zambia Union Conference</h1>
            <p className="text-blue-300 text-sm mt-1">Hello, {user.name} • System Overview &amp; Regional Church Registry</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('approvals')}
              className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-black px-5 py-3 rounded-2xl transition-all text-sm flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Approvals Queue ({pendingChurches.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        {[
          { id: 'overview', label: 'Union Overview', icon: LayoutDashboard },
          { id: 'districts', label: 'Districts Manager', icon: Settings },
          { id: 'churches', label: 'Church Discovery', icon: Search },
          { id: 'approvals', label: `Approvals (${pendingChurches.length + pendingDistrictRegs.length})`, icon: ShieldCheck },
          { id: 'announcements', label: 'Bulletins', icon: Bell },
          { id: 'users', label: 'User Management', icon: UserCheck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Districts', value: districts.length, color: 'bg-blue-950 text-white', icon: '🗺️' },
              { label: 'Total Churches', value: totalChurches, color: 'bg-amber-500 text-blue-950', icon: '🏫' },
              { label: 'Union Members', value: totalMembers, color: 'bg-white border text-slate-800', icon: '👥' },
              { label: 'Avg Attendance', value: `${attendanceRate}%`, color: 'bg-emerald-600 text-white', icon: '📈' },
              { label: 'Total Visitors', value: totalVisitors, color: 'bg-indigo-600 text-white', icon: '🤝' }
            ].map((stat, i) => (
              <div key={i} className={`rounded-3xl p-5 shadow-sm ${stat.color}`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-wider opacity-85 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Graphical Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Offerings Summary */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-amber-500" />
                Union Financial summary
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={offeringsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#1e3a8a" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Union Announcements */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Bell className="text-amber-500" />
                  Recent Bulletins &amp; Announcements
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {announcements.filter(a => a.targetType === 'CONFERENCE').slice(0, 4).map(a => (
                    <div key={a.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-900">{a.teacherName}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{a.priority || 'NORMAL'}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{a.content}</p>
                    </div>
                  ))}
                  {announcements.filter(a => a.targetType === 'CONFERENCE').length === 0 && (
                    <p className="text-slate-400 text-sm italic text-center py-8">No conference bulletins issued.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DISTRICTS MANAGER TAB */}
      {activeTab === 'districts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create District */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="text-amber-500" />
              Create New District
            </h3>
            <form onSubmit={handleCreateDistrict} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">District Name</label>
                <input
                  type="text"
                  value={newDistrictName}
                  onChange={e => setNewDistrictName(e.target.value)}
                  placeholder="e.g. Copperbelt South District"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-900">
                Create District
              </button>
            </form>
          </div>

          {/* Districts List */}
          <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4">Union Districts</h3>
            <div className="space-y-3">
              {districts.map(d => (
                <div key={d.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50/50">
                  <div className="flex-1 mr-4">
                    {editingDistrictId === d.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingDistrictName}
                          onChange={e => setEditingDistrictName(e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-1 text-sm flex-grow"
                        />
                        <button onClick={() => handleSaveDistrictEdit(d.id)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Save</button>
                        <button onClick={() => setEditingDistrictId(null)} className="bg-slate-300 text-slate-700 px-3 py-1 rounded-lg text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-800">{d.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">District ID: {d.id}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleDistrictActive(d.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        d.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {d.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {d.is_active ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDistrictId(d.id);
                        setEditingDistrictName(d.name);
                      }}
                      className="text-slate-500 hover:text-blue-900 p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CHURCH DISCOVERY TAB */}
      {activeTab === 'churches' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={discoverySearch}
                onChange={e => setDiscoverySearch(e.target.value)}
                placeholder="Search by church name, district, pastor, or clerk..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>
            {discoverySearch && (
              <button onClick={() => setDiscoverySearch('')} className="text-red-500 text-sm font-bold">
                Clear Filters
              </button>
            )}
          </div>

          {/* Discovery Tree */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Hierarchy Registry Map</h3>
            <div className="space-y-4">
              {districts.map(d => {
                const subChurches = churchesByDistrict[d.id] || [];
                const matchedChurches = subChurches.filter(c => 
                  filteredDiscoveryChurches.some(fc => fc.id === c.id)
                );
                
                // If searching and no churches match in this district, skip district
                if (discoverySearch.trim() && matchedChurches.length === 0) return null;

                const isExpanded = !!expandedDistricts[d.id];

                return (
                  <div key={d.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                    <button
                      onClick={() => toggleDistrict(d.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-100/50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                        <span className="font-bold text-slate-800">{d.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                          {matchedChurches.length} Approved Churches
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                        {matchedChurches.map(c => (
                          <div key={c.id} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-amber-500" />
                                {c.church_name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Clerk: {c.clerkName} ({c.clerkEmail}) • Pastor: {c.pastor_name || 'None'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                                {c.membership} Members
                              </span>
                            </div>
                          </div>
                        ))}
                        {matchedChurches.length === 0 && (
                          <p className="text-slate-400 text-xs italic text-center py-4">No churches registered in this district.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. APPROVALS TAB */}
      {activeTab === 'approvals' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" />
            Registration Approvals Queue
          </h3>
          {/* Sub-tab toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setApprovalSubTab('churches')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${approvalSubTab === 'churches' ? 'bg-blue-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              ⛪ Churches ({pendingChurches.length})
            </button>
            <button
              onClick={() => setApprovalSubTab('districts')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${approvalSubTab === 'districts' ? 'bg-blue-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              🏛️ District Admins ({pendingDistrictRegs.length})
            </button>
          </div>

          {/* Church Approvals */}
          {approvalSubTab === 'churches' && (
            <div className="space-y-4">
              {pendingChurches.map(c => (
                <div key={c.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Pending</span>
                      <h4 className="font-bold text-lg text-slate-900">{c.church_name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600">
                      <p><strong>District:</strong> {districts.find(d => d.id === c.districtId)?.name || 'Unknown'}</p>
                      <p><strong>Province:</strong> {c.province}</p>
                      <p><strong>Location:</strong> {c.location}</p>
                      <p><strong>Contact:</strong> {c.phone_number} / {c.email}</p>
                      <p><strong>Clerk:</strong> {c.clerkName} ({c.clerkEmail})</p>
                      <p><strong>Password Set:</strong> {c.clerkPassword ? '✅ Custom Password' : '⚠️ Auto-generated'}</p>
                      <p><strong>Pastor:</strong> {c.pastor_name || 'N/A'}</p>
                      <p><strong>Membership Estimate:</strong> {c.membership}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveChurch(c.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              ))}
              {pendingChurches.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-5xl mb-4">🎉</div>
                  <h4 className="font-bold text-slate-700">No Pending Church Registrations</h4>
                </div>
              )}
            </div>
          )}

          {/* District Admin Approvals */}
          {approvalSubTab === 'districts' && (
            <div className="space-y-4">
              {pendingDistrictRegs.map(r => (
                <div key={r.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">District Admin Request</span>
                      <h4 className="font-bold text-lg text-slate-900">{r.districtName}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600">
                      <p><strong>Admin Name:</strong> {r.adminName}</p>
                      <p><strong>Admin Email:</strong> {r.adminEmail}</p>
                      <p><strong>Phone:</strong> {r.phone_number || 'N/A'}</p>
                      <p><strong>Conference:</strong> {r.conferenceId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveDistrictReg(r.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve District
                    </button>
                  </div>
                </div>
              ))}
              {pendingDistrictRegs.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="font-bold text-slate-700">No Pending District Registrations</h4>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create announcement */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Send className="text-amber-500" />
              Publish Union Bulletin
            </h3>
            <form onSubmit={handlePublishAnnounce} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Target Audience</label>
                <select
                  value={announceTargetType}
                  onChange={e => {
                    setAnnounceTargetType(e.target.value as any);
                    setAnnounceTargetId('ALL');
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="CONFERENCE">Entire Conference (Union)</option>
                  <option value="DISTRICT">Specific District</option>
                  <option value="CHURCH">Specific Church</option>
                </select>
              </div>

              {announceTargetType === 'DISTRICT' && (
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Select District</label>
                  <select
                    value={announceTargetId}
                    onChange={e => setAnnounceTargetId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option value="ALL">All Districts</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {announceTargetType === 'CHURCH' && (
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Select Church</label>
                  <select
                    value={announceTargetId}
                    onChange={e => setAnnounceTargetId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    {churches.filter(c => c.status === 'approved').map(c => (
                      <option key={c.id} value={c.id}>{c.church_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Priority</label>
                <select
                  value={announcePriority}
                  onChange={e => setAnnouncePriority(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="IMPORTANT">Important Notice</option>
                  <option value="URGENT">Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Bulletin Title</label>
                <input
                  type="text"
                  value={announceTitle}
                  onChange={e => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. Union Camp Meeting Notice"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Message Content</label>
                <textarea
                  value={announceContent}
                  onChange={e => setAnnounceContent(e.target.value)}
                  rows={5}
                  placeholder="Write the message here..."
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-900 transition-all flex justify-center items-center gap-2">
                <Send className="w-4 h-4" /> Publish Announcement
              </button>
            </form>
          </div>

          {/* Past Announcements */}
          <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Published Bulletin Feed</h3>
            <div className="space-y-4">
              {announcements.map(a => (
                <div key={a.id} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{a.teacherName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      a.priority === 'URGENT' ? 'bg-red-100 text-red-800' : a.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {a.priority || 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.content}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    Target: {a.targetType} ({a.targetId})
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-slate-400 text-sm italic text-center py-12">No announcements in history.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* My Profile Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <UserCheck className="text-amber-500" /> My Profile (Transition of Power)
            </h3>
            <p className="text-slate-500 text-xs mb-4">Update your own account details here. Use this section when handing over Conference Admin credentials to a new administrator.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Full Name</label>
                <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Email Address</label>
                <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <button onClick={handleSaveProfile}
              className="mt-4 bg-blue-950 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {profileSaved ? '✅ Saved!' : 'Save Profile'}
            </button>
          </div>

          {/* All Users Table */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-lg font-black text-slate-800">All Users — Transition of Power</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 w-64" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-3 text-slate-500 font-bold text-xs uppercase">Name</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-bold text-xs uppercase">Email</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-bold text-xs uppercase">Role</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-bold text-xs uppercase">Status</th>
                    <th className="text-right py-3 px-3 text-slate-500 font-bold text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{u.name}</td>
                      <td className="py-3 px-3 text-slate-500">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          u.role === 'DISTRICT_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'CLERK' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'TEACHER' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          u.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        }`}>{u.is_active !== false ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button onClick={() => openEditModal(u)}
                          className="bg-blue-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-800 flex items-center gap-1 ml-auto">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-xs italic">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Edit User — {editingUser.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Full Name *</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Email Address *</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditIsActive(!editIsActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${editIsActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editIsActive ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm font-semibold text-slate-700">{editIsActive ? 'Account Active' : 'Account Inactive'}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleSaveUserEdit}
                className="flex-1 bg-blue-950 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-900 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceDashboard;
