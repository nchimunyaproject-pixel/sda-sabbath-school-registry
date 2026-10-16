import React, { useState } from 'react';
import { 
  User, Role, Class, ChurchMember, FamilyUnit, TransferRequest, 
  ChurchMeeting, ChurchOfficer, AttendanceRecord
} from '../types';
import { 
  ShieldCheck, UserPlus, Users, KeyRound, Copy, Check, Eye, EyeOff, 
  Trash2, Edit3, BookOpen, Landmark, FileText, ChevronRight, Search, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Printer, Download,
  Layers, School, ShieldAlert, Award, Phone, Mail, Building
} from 'lucide-react';
import SDALogo from '../components/SDALogo';

interface ChurchAdminDashboardProps {
  user: User;
  clerks: User[];
  superintendents: User[];
  treasurers: User[];
  teachers: User[];
  classes: Class[];
  churchMembers: ChurchMember[];
  familyUnits: FamilyUnit[];
  transferRequests: TransferRequest[];
  meetings: ChurchMeeting[];
  officers: ChurchOfficer[];
  attendanceRecords: AttendanceRecord[];
  onAddOfficer: (officerData: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    assignedClass?: string;
    language?: string;
    title?: string;
    churchName?: string;
  }) => void;
  onUpdateOfficer: (userId: string, updates: Partial<User>) => void;
  onDeleteOfficer: (userId: string) => void;
  onNavigateToView?: (view: Role) => void;
}

type TabType = 'officers' | 'clerk_summary' | 'ss_summary' | 'treasury_summary' | 'system_health';

export const ChurchAdminDashboard: React.FC<ChurchAdminDashboardProps> = ({
  user,
  clerks,
  superintendents,
  treasurers,
  teachers,
  classes,
  churchMembers,
  familyUnits,
  transferRequests,
  meetings,
  officers,
  attendanceRecords,
  onAddOfficer,
  onUpdateOfficer,
  onDeleteOfficer,
  onNavigateToView
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('officers');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<User | null>(null);
  
  // Show/Hide passwords state
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Officer Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.CLERK as Role,
    phone: '',
    title: '',
    assignedClass: classes[0]?.id || '',
    language: 'English',
    churchName: user.churchName || 'Woodlands SDA Church'
  });

  // Success message after creating account
  const [recentSlip, setRecentSlip] = useState<{
    name: string;
    role: Role;
    email: string;
    pass: string;
  } | null>(null);

  // Combine all officers into a unified list
  const allOfficers: User[] = [
    ...clerks.map(c => ({ ...c, role: Role.CLERK })),
    ...superintendents.map(s => ({ ...s, role: Role.SUPERINTENDENT })),
    ...treasurers.map(t => ({ ...t, role: Role.TREASURER })),
    ...teachers.map(t => ({ ...t, role: Role.TEACHER }))
  ];

  const filteredOfficers = allOfficers.filter(officer => {
    const matchesRole = roleFilter === 'all' || officer.role === roleFilter;
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (officer.phone && officer.phone.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  const handleOpenAddModal = (targetRole: Role = Role.CLERK) => {
    const defaultPassword = targetRole === Role.CLERK ? 'clerk123' 
      : targetRole === Role.SUPERINTENDENT ? 'superintendent123'
      : targetRole === Role.TREASURER ? 'treasurer123'
      : 'password123';

    setFormData({
      name: '',
      email: '',
      password: defaultPassword,
      role: targetRole,
      phone: '',
      title: targetRole === Role.CLERK ? 'Church Clerk (Secretariat)'
        : targetRole === Role.SUPERINTENDENT ? 'Sabbath School Superintendent'
        : targetRole === Role.TREASURER ? 'Church Treasurer'
        : 'SS Class Teacher',
      assignedClass: classes[0]?.id || '',
      language: 'English',
      churchName: user.churchName || 'Woodlands SDA Church'
    });
    setEditingOfficer(null);
    setIsAddModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: res }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    if (editingOfficer) {
      onUpdateOfficer(editingOfficer.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        title: formData.title,
        assignedClass: formData.role === Role.TEACHER ? formData.assignedClass : undefined,
        language: formData.role === Role.TEACHER ? formData.language : undefined
      });
      setEditingOfficer(null);
    } else {
      onAddOfficer(formData);
      setRecentSlip({
        name: formData.name,
        role: formData.role,
        email: formData.email,
        pass: formData.password
      });
    }

    setIsAddModalOpen(false);
  };

  const handleCopyCredentials = (officer: User) => {
    const text = `SDA Church Registry Credentials\nRole: ${getRoleBadgeTitle(officer.role)}\nName: ${officer.name}\nEmail: ${officer.email}\nPassword: ${officer.password || 'password123'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(officer.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getRoleBadgeTitle = (role: Role) => {
    switch (role) {
      case Role.CHURCH_ADMIN: return 'Church Admin Elder';
      case Role.CLERK: return 'Church Clerk';
      case Role.SUPERINTENDENT: return 'SS Superintendent';
      case Role.TREASURER: return 'Church Treasurer';
      case Role.TEACHER: return 'SS Teacher';
      default: return role;
    }
  };

  const getRoleTheme = (role: Role) => {
    switch (role) {
      case Role.CLERK:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-900',
          border: 'border-blue-200',
          badge: 'bg-blue-600 text-white'
        };
      case Role.SUPERINTENDENT:
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-900',
          border: 'border-indigo-200',
          badge: 'bg-indigo-600 text-white'
        };
      case Role.TREASURER:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-950',
          border: 'border-amber-200',
          badge: 'bg-amber-500 text-slate-950'
        };
      case Role.TEACHER:
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-950',
          border: 'border-emerald-200',
          badge: 'bg-emerald-600 text-white'
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-900',
          border: 'border-slate-200',
          badge: 'bg-slate-900 text-white'
        };
    }
  };

  // Quick statistics
  const totalBaptized = churchMembers.filter(m => m.memberType === 'baptized' || m.status === 'active').length;
  const pendingTransfersCount = transferRequests.filter(r => r.status === 'pending' || r.status === 'pending_board').length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* ELDER'S EXECUTIVE TOP BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-blue-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Chief Executive & Board Administration
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              Church Admin Elder Portal
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed">
              Welcome, <span className="text-white font-bold">{user.name}</span>. As First Elder and Portal Administrator for <span className="text-amber-400 font-bold">{user.churchName || 'Woodlands SDA Church'}</span>, you have full authority to appoint and manage accounts for the <span className="text-white underline decoration-blue-400 font-bold">Church Clerk</span>, <span className="text-white underline decoration-indigo-400 font-bold">SS Superintendent</span>, <span className="text-white underline decoration-amber-400 font-bold">Treasurer</span>, and <span className="text-white underline decoration-emerald-400 font-bold">Teachers</span>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenAddModal(Role.CLERK)}
              className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95 border-b-2 border-blue-800"
            >
              <UserPlus className="w-4 h-4" /> Add Church Clerk
            </button>
            <button
              onClick={() => handleOpenAddModal(Role.SUPERINTENDENT)}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-95 border-b-2 border-indigo-800"
            >
              <UserPlus className="w-4 h-4" /> Add Superintendent
            </button>
            <button
              onClick={() => handleOpenAddModal(Role.TEACHER)}
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-slate-700"
            >
              <UserPlus className="w-4 h-4" /> Add Teacher
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Appointed Officers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{allOfficers.length}</span>
              <span className="text-xs text-slate-400 font-bold">across 4 departments</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Church Roll</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{totalBaptized}</span>
              <span className="text-xs text-slate-400 font-bold">members ({familyUnits.length} families)</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sabbath School</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{classes.length}</span>
              <span className="text-xs text-slate-400 font-bold">classes ({totalStudents} pupils)</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Actions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-400">{pendingTransfersCount}</span>
              <span className="text-xs text-slate-400 font-bold">transfers awaiting reading</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT CREDENTIALS SLIP NOTIFICATION */}
      {recentSlip && (
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl shadow-sm animate-in slide-in-from-top-4 duration-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-lg">
                  Account Successfully Appointed
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {recentSlip.name} • {getRoleBadgeTitle(recentSlip.role)}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Login Email: <span className="font-mono font-bold text-slate-900">{recentSlip.email}</span> • Security Key: <span className="font-mono font-bold text-slate-900">{recentSlip.pass}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Seventh-day Adventist Church Portal Credentials\nOfficer: ${recentSlip.name}\nRole: ${getRoleBadgeTitle(recentSlip.role)}\nEmail: ${recentSlip.email}\nSecurity Password: ${recentSlip.pass}\nLogin Link: ${window.location.origin}`);
                  alert('Officer login credentials copied to clipboard!');
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Login Slip
              </button>
              <button
                onClick={() => setRecentSlip(null)}
                className="px-3 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('officers')}
          className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'officers'
              ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/20'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Appointed Officers & Accounts ({allOfficers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clerk_summary')}
          className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'clerk_summary'
              ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/20'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Secretariat & Membership Roll</span>
        </button>

        <button
          onClick={() => setActiveTab('ss_summary')}
          className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'ss_summary'
              ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/20'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Sabbath School Division</span>
        </button>

        <button
          onClick={() => setActiveTab('treasury_summary')}
          className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'treasury_summary'
              ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/20'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Treasury Oversight</span>
        </button>
      </div>

      {/* TAB 1: APPOINTED OFFICERS & PORTAL ACCOUNTS (THE MAIN REQUEST) */}
      {activeTab === 'officers' && (
        <div className="space-y-6">
          
          {/* FILTER & CONTROLS BAR */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by officer name, email, or phone..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  roleFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                All ({allOfficers.length})
              </button>
              <button
                onClick={() => setRoleFilter(Role.CLERK)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  roleFilter === Role.CLERK ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Clerks ({clerks.length})
              </button>
              <button
                onClick={() => setRoleFilter(Role.SUPERINTENDENT)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  roleFilter === Role.SUPERINTENDENT ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Superintendents ({superintendents.length})
              </button>
              <button
                onClick={() => setRoleFilter(Role.TEACHER)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  roleFilter === Role.TEACHER ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Teachers ({teachers.length})
              </button>
              <button
                onClick={() => setRoleFilter(Role.TREASURER)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  roleFilter === Role.TREASURER ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Treasurers ({treasurers.length})
              </button>
            </div>

            {/* Add New Officer CTA */}
            <button
              onClick={() => handleOpenAddModal(Role.CLERK)}
              className="px-5 py-3 bg-blue-950 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-400" /> Appoint Officer
            </button>
          </div>

          {/* OFFICERS DIRECTORY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfficers.map((officer) => {
              const theme = getRoleTheme(officer.role);
              const isShowingPass = showPasswords[officer.id];
              const isCopied = copiedId === officer.id;

              return (
                <div
                  key={officer.id}
                  className={`rounded-3xl p-6 border ${theme.border} bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center font-black text-lg border ${theme.border}`}>
                          {officer.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-base leading-tight">
                            {officer.name}
                          </h4>
                          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${theme.badge}`}>
                            {getRoleBadgeTitle(officer.role)}
                          </span>
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingOfficer(officer);
                            setFormData({
                              name: officer.name,
                              email: officer.email,
                              password: officer.password || 'password123',
                              role: officer.role,
                              phone: officer.phone || '',
                              title: officer.title || '',
                              assignedClass: officer.assignedClass || classes[0]?.id || '',
                              language: officer.language || 'English',
                              churchName: officer.churchName || user.churchName || ''
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Officer Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Revoke portal access for ${officer.name} (${getRoleBadgeTitle(officer.role)})?`)) {
                              onDeleteOfficer(officer.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Revoke / Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Portal Email
                        </span>
                        <span className="font-mono font-bold text-slate-800 select-all truncate max-w-[180px]">
                          {officer.email}
                        </span>
                      </div>

                      {officer.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Phone
                          </span>
                          <span className="font-bold text-slate-700">
                            {officer.phone}
                          </span>
                        </div>
                      )}

                      {officer.role === Role.TEACHER && officer.assignedClass && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            Assigned Class
                          </span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                            {classes.find(c => c.id === officer.assignedClass)?.name || 'Class assigned'}
                          </span>
                        </div>
                      )}

                      {/* Password Key */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" /> Security Key
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {isShowingPass ? (officer.password || 'password123') : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, [officer.id]: !prev[officer.id] }))}
                            className="text-slate-400 hover:text-slate-700"
                            title={isShowingPass ? "Hide Password" : "Show Password"}
                          >
                            {isShowingPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(officer)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Credentials Copied!' : 'Copy Login Details'}
                    </button>

                    {onNavigateToView && (
                      <button
                        type="button"
                        onClick={() => onNavigateToView(officer.role)}
                        className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
                        title={`Inspect ${getRoleBadgeTitle(officer.role)} Dashboard`}
                      >
                        Inspect View <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOfficers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No Officers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No accounts match the current filter. Click "Appoint Officer" above to register a new Church Clerk, Superintendent, or Teacher.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLERK SECRETARIAT SUMMARY */}
      {activeTab === 'clerk_summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Church Clerk Secretariat Executive Summary
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Oversight of church membership rolls, transfers between sister churches, and church board minutes.
                </p>
              </div>
              {onNavigateToView && (
                <button
                  onClick={() => onNavigateToView(Role.CLERK)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shrink-0"
                >
                  Open Full Secretariat Portal <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest block">Total Membership</span>
                <span className="text-3xl font-black text-blue-950 mt-1 block">{churchMembers.length}</span>
                <span className="text-[10px] text-blue-700 font-bold">{totalBaptized} baptized members</span>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Family Households</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">{familyUnits.length}</span>
                <span className="text-[10px] text-slate-500 font-bold">Registered family units</span>
              </div>
              <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest block">Pending Transfers</span>
                <span className="text-3xl font-black text-amber-950 mt-1 block">{pendingTransfersCount}</span>
                <span className="text-[10px] text-amber-800 font-bold">Requires board action</span>
              </div>
              <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block">Board Meetings</span>
                <span className="text-3xl font-black text-emerald-950 mt-1 block">{meetings.length}</span>
                <span className="text-[10px] text-emerald-800 font-bold">Recorded sessions</span>
              </div>
            </div>

            {/* Recent Members Sample */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="pb-3 px-4">Member Name</th>
                    <th className="pb-3 px-4">Member No.</th>
                    <th className="pb-3 px-4">Baptism Date</th>
                    <th className="pb-3 px-4">Contact</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {churchMembers.slice(0, 5).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 font-mono">{m.memberNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{m.baptismDate || 'Unrecorded'}</td>
                      <td className="py-3 px-4">{m.contact || m.email || 'None'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black uppercase">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SABBATH SCHOOL SUMMARY */}
      {activeTab === 'ss_summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <School className="w-6 h-6 text-indigo-600" />
                  Sabbath School Directorate Summary
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Superintendent programs, class attendance, curriculum distribution, and missionary mobilization.
                </p>
              </div>
              {onNavigateToView && (
                <button
                  onClick={() => onNavigateToView(Role.SUPERINTENDENT)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shrink-0"
                >
                  Open Superintendent Division <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classes.map(c => {
                const assignedTeacher = teachers.find(t => t.id === c.teacherId);
                return (
                  <div key={c.id} className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-slate-900 text-sm">{c.name}</h4>
                      <span className="text-[10px] bg-indigo-100 text-indigo-900 font-black px-2 py-0.5 rounded">
                        {c.students?.length || 0} enrolled
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Teacher: <span className="font-bold text-slate-900">{assignedTeacher?.name || 'Unassigned'}</span>
                    </p>
                    {c.language && (
                      <span className="inline-block text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                        Language: {c.language}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TREASURY SUMMARY */}
      {activeTab === 'treasury_summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-amber-600" />
                  Church Treasury Financial Oversight
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Custodianship of tithes, combined offerings, and Conference monthly remittances under SDA Church Manual guidelines.
                </p>
              </div>
              {onNavigateToView && (
                <button
                  onClick={() => onNavigateToView(Role.TREASURER)}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shrink-0"
                >
                  Open Treasury Dashboard <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-1 rounded">
                Church Manual Policy
              </span>
              <p className="text-xs font-medium leading-relaxed">
                The church elder exercises general spiritual and administrative oversight over church financial management, reviewing regular reports from the church treasurer before presentation to the church board.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPOINT / EDIT OFFICER ACCOUNT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-8 sm:p-10 shadow-2xl border border-white space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                  Church Portal Credentials
                </span>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {editingOfficer ? `Edit Officer: ${editingOfficer.name}` : 'Appoint Church Officer'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Role Selector Pills */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Select Officer Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { role: Role.CLERK, label: 'Church Clerk', color: 'blue' },
                    { role: Role.SUPERINTENDENT, label: 'Superintendent', color: 'indigo' },
                    { role: Role.TEACHER, label: 'SS Teacher', color: 'emerald' },
                    { role: Role.TREASURER, label: 'Treasurer', color: 'amber' }
                  ].map(item => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        role: item.role,
                        title: item.role === Role.CLERK ? 'Church Clerk (Secretariat)'
                          : item.role === Role.SUPERINTENDENT ? 'Sabbath School Superintendent'
                          : item.role === Role.TREASURER ? 'Church Treasurer'
                          : 'SS Class Teacher'
                      }))}
                      className={`py-3 px-2 rounded-2xl border-2 text-center transition-all ${
                        formData.role === item.role
                          ? 'border-blue-600 bg-blue-50 text-blue-950 font-black shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 font-bold'
                      }`}
                    >
                      <span className="text-[11px] block">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={
                    formData.role === Role.CLERK ? "Sister P. Tembo" 
                    : formData.role === Role.SUPERINTENDENT ? "Sister R. Simpasa"
                    : formData.role === Role.TREASURER ? "Elder Joseph Banda"
                    : "Elder Musonda"
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Official Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Official Email Address (Sign-In Username)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={
                    formData.role === Role.CLERK ? "clerk@church.org" 
                    : formData.role === Role.SUPERINTENDENT ? "superintendent@church.org"
                    : formData.role === Role.TREASURER ? "treasurer@church.org"
                    : "teacher@church.org"
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Password Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Portal Security Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[9px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-generate strong key
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Phone & Station */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Phone Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+260 977 123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Church Station
                  </label>
                  <input
                    type="text"
                    value={formData.churchName}
                    onChange={(e) => setFormData(prev => ({ ...prev, churchName: e.target.value }))}
                    placeholder="Woodlands SDA Church"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Special options if Teacher */}
              {formData.role === Role.TEACHER && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                      Assign to Sabbath School Class
                    </label>
                    <select
                      value={formData.assignedClass}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedClass: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                      Class Language (Adult Division)
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="English">English</option>
                      <option value="Bemba">Bemba</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Nyanja">Nyanja</option>
                      <option value="Lozi">Lozi</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 text-slate-500 hover:text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-blue-950 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  {editingOfficer ? 'Save Officer Updates' : 'Authorize & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ChurchAdminDashboard;
