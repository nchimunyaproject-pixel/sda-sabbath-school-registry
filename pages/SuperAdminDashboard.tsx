import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, MapPin, Plus, UserPlus, Users, 
  Layers, ChevronRight, Globe, Phone, Mail, CheckCircle2,
  Lock, Eye, EyeOff, Search, ArrowRight, BarChart3, Landmark,
  Download, Database
} from 'lucide-react';
import { Conference, District, ChurchStation, User, Role } from '../types';

interface SuperAdminDashboardProps {
  user: User;
  conferences: Conference[];
  districts: District[];
  churches: ChurchStation[];
  churchMembers: any[];
  onAddConference: (conference: Conference, presidentUser: User) => void;
  onNavigateToConference?: (conferenceId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  conferences,
  districts,
  churches,
  churchMembers,
  onAddConference,
  onNavigateToConference
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Conference Form State
  const [confName, setConfName] = useState('');
  const [unionName, setUnionName] = useState('Southern Zambia Union Conference (SZUC)');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [confPhone, setConfPhone] = useState('');
  const [confEmail, setConfEmail] = useState('');
  const [presidentName, setPresidentName] = useState('');
  const [presidentEmail, setPresidentEmail] = useState('');
  const [presidentPhone, setPresidentPhone] = useState('');
  const [presidentPassword, setPresidentPassword] = useState('president123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentCreated, setRecentCreated] = useState<{ conf: Conference; pres: User } | null>(null);

  const totalMembers = churchMembers.length;
  const filteredConferences = conferences.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.presidentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.headquartersCity && c.headquartersCity.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportBackup = () => {
    const backupData = {
      version: '2026.1-enterprise',
      denominationalStandard: 'SDA Church Manual 2025 Edition',
      generatedAt: new Date().toISOString(),
      conferences,
      districts,
      churches,
      totalMembers: churchMembers.length
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sda-management-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateConference = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!confName.trim()) {
      setErrorMsg('Please specify the Conference Name.');
      return;
    }
    if (!presidentName.trim()) {
      setErrorMsg('Please enter the Conference President Full Name.');
      return;
    }
    if (!presidentEmail.trim()) {
      setErrorMsg('Please provide the official email for the Conference President.');
      return;
    }

    const confId = `conf-${confName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const newConf: Conference = {
      id: confId,
      name: confName.trim(),
      presidentName: presidentName.trim(),
      presidentEmail: presidentEmail.trim().toLowerCase(),
      presidentPhone: presidentPhone.trim() || confPhone.trim(),
      headquartersCity: city.trim(),
      unionName: unionName.trim(),
      address: address.trim(),
      phone: confPhone.trim(),
      email: confEmail.trim() || presidentEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    };

    const newPresidentUser: User = {
      id: `pres-${Date.now().toString(36)}`,
      name: presidentName.trim(),
      email: presidentEmail.trim().toLowerCase(),
      password: presidentPassword.trim() || 'president123',
      role: Role.CONFERENCE_PRESIDENT,
      conferenceId: confId,
      conferenceName: confName.trim(),
      title: 'Conference President (Executive Overseer)',
      phone: presidentPhone.trim() || confPhone.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    onAddConference(newConf, newPresidentUser);
    setRecentCreated({ conf: newConf, pres: newPresidentUser });

    // Reset Form
    setConfName('');
    setCity('');
    setAddress('');
    setConfPhone('');
    setConfEmail('');
    setPresidentName('');
    setPresidentEmail('');
    setPresidentPhone('');
    setPresidentPassword('president123');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* SUPER ADMIN OVERSEER HEADER */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-purple-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/40 rounded-xl text-purple-300 text-[10px] font-black uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              General Conference & Union Administration Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              System Super Admin Portal
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed">
              Welcome, <span className="text-white font-bold">{user.name}</span>. As System Super Admin, you oversee the multi-tier hierarchy: creating <span className="text-purple-300 underline font-bold">Local Conferences</span>, authorizing <span className="text-white font-bold">Conference Presidents</span>, and maintaining structural alignment with the Seventh-day Adventist Church Organization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-white/20 active:scale-95"
            >
              <Download className="w-4 h-4 text-purple-300" /> Export Registry Backup
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 active:scale-95 border-b-2 border-purple-800"
            >
              <Plus className="w-4 h-4" /> Create Local Conference
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Conferences</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-300">{conferences.length}</span>
              <span className="text-xs text-slate-400 font-bold">fields/territories</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Church Districts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{districts.length}</span>
              <span className="text-xs text-slate-400 font-bold">pastoral units</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Organized Churches</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{churches.length}</span>
              <span className="text-xs text-slate-400 font-bold">stations</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Believers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{totalMembers}</span>
              <span className="text-xs text-slate-400 font-bold">baptized souls</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENTLY CREATED NOTIFICATION */}
      {recentCreated && (
        <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-purple-950 text-sm">
                Conference Created: {recentCreated.conf.name}
              </h4>
              <p className="text-xs text-purple-800 mt-0.5">
                President Account Appointed: <strong>{recentCreated.pres.name}</strong> ({recentCreated.pres.email}) with default key <code>president123</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRecentCreated(null)}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CONFERENCES SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-purple-600" />
              Conferences in System ({conferences.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Each conference president administers their conference territory and creates districts.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conferences or presidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConferences.map((conf) => {
            const confDistricts = districts.filter(d => d.conferenceId === conf.id || d.conferenceName === conf.name);
            const confChurches = churches.filter(c => c.conferenceId === conf.id || c.conference === conf.name);

            return (
              <div 
                key={conf.id}
                className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-5 border border-slate-200 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                        Local Conference
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1.5">{conf.name}</h3>
                      {conf.headquartersCity && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {conf.headquartersCity} • {conf.unionName || 'SZUC'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Conference President</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      {conf.presidentName}
                    </p>
                    <p className="text-slate-500 font-mono text-[11px] truncate">{conf.presidentEmail}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white rounded-xl p-2.5 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Districts</span>
                      <span className="text-lg font-black text-purple-900">{confDistricts.length}</span>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Churches</span>
                      <span className="text-lg font-black text-purple-900">{confChurches.length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    ID: <code>{conf.id}</code>
                  </span>
                  {onNavigateToConference && (
                    <button
                      onClick={() => onNavigateToConference(conf.id)}
                      className="text-xs font-black text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      View Territory <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE CONFERENCE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Create New Local Conference</h3>
                  <p className="text-xs text-slate-500 font-medium">Add field territory & appoint presiding Conference President</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateConference} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                  Conference Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. South Zambia Conference"
                  value={confName}
                  onChange={(e) => setConfName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                    Headquarters City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Choma"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                    Supervising Union
                  </label>
                  <input
                    type="text"
                    value={unionName}
                    onChange={(e) => setUnionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
                <span className="text-[10px] font-black uppercase text-purple-900 tracking-wider block">
                  Presiding Officer Account (Conference President)
                </span>
                
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">President Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Pastor Dr. Hamilton Simooya"
                    value={presidentName}
                    onChange={(e) => setPresidentName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">President Email *</label>
                    <input
                      type="email"
                      placeholder="president@southzambia.org"
                      value={presidentEmail}
                      onChange={(e) => setPresidentEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">President Phone</label>
                    <input
                      type="tel"
                      placeholder="+260 977 000000"
                      value={presidentPhone}
                      onChange={(e) => setPresidentPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">President Initial Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={presidentPassword}
                      onChange={(e) => setPresidentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Create Conference & Appoint President
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
