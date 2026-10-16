import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, MapPin, Plus, UserPlus, Users, 
  Layers, ChevronRight, Phone, Mail, CheckCircle2,
  Lock, Eye, EyeOff, Search, ArrowRight, BarChart3, Landmark,
  BookOpen, DollarSign, Calendar, Activity, School, FileText,
  Clock, AlertTriangle, RefreshCw, Printer, Award, Check, FileCheck
} from 'lucide-react';
import { 
  Conference, District, ChurchStation, User, Role, 
  ConferenceRemittance, MinisterialCredential, 
  StatisticalComplianceReport, ConstituencyDelegateQuota 
} from '../types';
import { 
  INITIAL_MINISTERIAL_CREDENTIALS, 
  INITIAL_STATISTICAL_COMPLIANCE, 
  INITIAL_DELEGATE_QUOTAS 
} from '../constants';
import MinisterialCredentialModal from '../components/MinisterialCredentialModal';

interface ConferenceDashboardProps {
  user: User;
  conference: Conference;
  districts: District[];
  churches: ChurchStation[];
  churchMembers: any[];
  remittances?: any[];
  credentials?: MinisterialCredential[];
  statisticalReports?: StatisticalComplianceReport[];
  delegateQuotas?: ConstituencyDelegateQuota[];
  onAddDistrict: (district: District, pastorUser: User) => void;
  onNavigateToDistrict?: (districtId: string) => void;
}

export const ConferencePresidentDashboard: React.FC<ConferenceDashboardProps> = ({
  user,
  conference,
  districts,
  churches,
  churchMembers,
  remittances = [],
  credentials = INITIAL_MINISTERIAL_CREDENTIALS,
  statisticalReports = INITIAL_STATISTICAL_COMPLIANCE,
  delegateQuotas = INITIAL_DELEGATE_QUOTAS,
  onAddDistrict,
  onNavigateToDistrict
}) => {
  const [activeTab, setActiveTab] = useState<'districts' | 'remittances' | 'acms' | 'credentials' | 'constituency'>('districts');
  const [districtSearch, setDistrictSearch] = useState('');
  
  // Modals
  const [isAddDistrictModalOpen, setIsAddDistrictModalOpen] = useState(false);
  const [selectedCredentialForView, setSelectedCredentialForView] = useState<MinisterialCredential | null>(null);
  const [isAddCredentialModalOpen, setIsAddCredentialModalOpen] = useState(false);

  // New District Form State
  const [distName, setDistName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [pastorEmail, setPastorEmail] = useState('');
  const [pastorPhone, setPastorPhone] = useState('');
  const [pastorPassword, setPastorPassword] = useState('pastor123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentCreated, setRecentCreated] = useState<{ dist: District; pastor: User } | null>(null);

  // Dynamic Credentials state
  const [credentialsList, setCredentialsList] = useState<MinisterialCredential[]>(credentials);
  const [newMinisterName, setNewMinisterName] = useState('');
  const [newMinisterEmail, setNewMinisterEmail] = useState('');
  const [newMinisterPhone, setNewMinisterPhone] = useState('');
  const [newMinisterType, setNewMinisterType] = useState<MinisterialCredential['type']>('ORDAINED_MINISTER');
  const [newMinisterDistrict, setNewMinisterDistrict] = useState(districts[0]?.name || 'Woodlands District');
  const [newMinisterChurch, setNewMinisterChurch] = useState('Woodlands SDA Church');

  // Remittance Reconciliation State
  const [localRemittances, setLocalRemittances] = useState<any[]>(
    remittances.length > 0 ? remittances : [
      {
        id: 'rem-conf-1',
        churchName: 'Woodlands SDA Church',
        month: 'September 2026',
        titheAmount: 21650,
        worldMissionAmount: 4330,
        conferenceDevelopmentAmount: 2165,
        totalRemitted: 28145,
        status: 'audited_reconciled',
        submissionDate: '2026-10-04',
        receiptNumber: 'CONF-REC-2026-09-001'
      },
      {
        id: 'rem-conf-2',
        churchName: 'Libala SDA Church',
        month: 'September 2026',
        titheAmount: 14200,
        worldMissionAmount: 2840,
        conferenceDevelopmentAmount: 1420,
        totalRemitted: 18460,
        status: 'audited_reconciled',
        submissionDate: '2026-10-06',
        receiptNumber: 'CONF-REC-2026-09-002'
      },
      {
        id: 'rem-conf-3',
        churchName: 'Kabulonga Mission Company',
        month: 'September 2026',
        titheAmount: 3850,
        worldMissionAmount: 770,
        conferenceDevelopmentAmount: 385,
        totalRemitted: 5005,
        status: 'pending_audit',
        submissionDate: '2026-10-09'
      },
      {
        id: 'rem-conf-4',
        churchName: 'Matero Main SDA Church',
        month: 'September 2026',
        titheAmount: 0,
        worldMissionAmount: 0,
        conferenceDevelopmentAmount: 0,
        totalRemitted: 0,
        status: 'overdue',
        submissionDate: '-'
      }
    ]
  );

  // ACMS Sync Simulation
  const [acmsReports, setAcmsReports] = useState<StatisticalComplianceReport[]>(statisticalReports);
  const [isSyncingAcms, setIsSyncingAcms] = useState(false);
  const [acmsSyncSuccessMsg, setAcmsSyncSuccessMsg] = useState('');

  // Scoped districts for this conference
  const confDistricts = districts.filter(d => 
    d.conferenceId === conference.id || 
    d.conferenceName?.toLowerCase() === conference.name.toLowerCase()
  );

  // Scoped churches for this conference
  const confChurches = churches.filter(c => 
    c.conferenceId === conference.id || 
    c.conference?.toLowerCase() === conference.name.toLowerCase()
  );

  // Scoped members
  const confMembers = churchMembers.filter(m => 
    confChurches.some(c => c.id === m.churchId)
  );

  const filteredDistricts = confDistricts.filter(d => 
    d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.pastorName.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleCreateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!distName.trim()) {
      setErrorMsg('Please specify the District Name.');
      return;
    }
    if (!pastorName.trim()) {
      setErrorMsg('Please provide the District Pastor Full Name.');
      return;
    }
    if (!pastorEmail.trim()) {
      setErrorMsg('Please provide the official email for the District Pastor.');
      return;
    }

    const distId = `dist-${distName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const newDistrict: District = {
      id: distId,
      name: distName.trim(),
      conferenceId: conference.id,
      conferenceName: conference.name,
      pastorName: pastorName.trim(),
      pastorEmail: pastorEmail.trim().toLowerCase(),
      pastorPhone: pastorPhone.trim(),
      createdAt: new Date().toISOString()
    };

    const newPastorUser: User = {
      id: `pastor-${Date.now().toString(36)}`,
      name: pastorName.trim(),
      email: pastorEmail.trim().toLowerCase(),
      password: pastorPassword.trim() || 'pastor123',
      role: Role.DISTRICT_PASTOR,
      conferenceId: conference.id,
      conferenceName: conference.name,
      districtId: distId,
      districtName: distName.trim(),
      title: 'District Pastor (Pastoral Overseer)',
      phone: pastorPhone.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    onAddDistrict(newDistrict, newPastorUser);
    setRecentCreated({ dist: newDistrict, pastor: newPastorUser });

    // Reset Form
    setDistName('');
    setPastorName('');
    setPastorEmail('');
    setPastorPhone('');
    setPastorPassword('pastor123');
    setIsAddDistrictModalOpen(false);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinisterName || !newMinisterEmail) return;

    const newCred: MinisterialCredential = {
      id: `cred-${Date.now().toString(36)}`,
      conferenceId: conference.id,
      ministerName: newMinisterName.trim(),
      email: newMinisterEmail.trim(),
      phone: newMinisterPhone.trim(),
      type: newMinisterType,
      credentialNumber: `LC-${newMinisterType.slice(0, 3)}-2026-${Math.floor(100 + Math.random() * 900)}`,
      districtName: newMinisterDistrict,
      assignedChurchName: newMinisterChurch,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      votedByExecutiveCommitteeDate: new Date().toISOString().split('T')[0]
    };

    setCredentialsList(prev => [newCred, ...prev]);
    setIsAddCredentialModalOpen(false);
    setNewMinisterName('');
    setNewMinisterEmail('');
    setNewMinisterPhone('');
  };

  const handleReconcileRemittance = (remittanceId: string) => {
    setLocalRemittances(prev => prev.map(rem => {
      if (rem.id === remittanceId) {
        return {
          ...rem,
          status: 'audited_reconciled',
          receiptNumber: `CONF-REC-2026-09-${Math.floor(100 + Math.random() * 900)}`
        };
      }
      return rem;
    }));
  };

  const handleTriggerAcmsSync = () => {
    setIsSyncingAcms(true);
    setAcmsSyncSuccessMsg('');
    setTimeout(() => {
      setIsSyncingAcms(false);
      setAcmsReports(prev => prev.map(rep => ({
        ...rep,
        acmsSyncStatus: rep.status === 'overdue' ? 'failed' : 'synced'
      })));
      setAcmsSyncSuccessMsg('General Conference ACMS synchronization complete. All submitted reports reconciled with division records.');
    }, 1500);
  };

  // Aggregated Trust Fund Statistics
  const totalTitheRemitted = localRemittances.reduce((sum, r) => sum + (r.titheAmount || 0), 0);
  const totalWorldMission = localRemittances.reduce((sum, r) => sum + (r.worldMissionAmount || 0), 0);
  const totalGrossTrustFunds = localRemittances.reduce((sum, r) => sum + (r.totalRemitted || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* CONFERENCE PRESIDENT OVERSEER BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-300 text-[10px] font-black uppercase tracking-widest">
              <Landmark className="w-3.5 h-3.5 text-indigo-400" />
              Conference Executive Directorate • {conference.name}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              Conference Overseer Portal
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed">
              Welcome, <span className="text-white font-bold">{user.name}</span>. As Conference President, you maintain high-level pastoral and operational oversight across all districts in <span className="text-indigo-300 font-bold">{conference.name}</span> in accordance with the 2025 Seventh-day Adventist Church Manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddDistrictModalOpen(true)}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-95 border-b-2 border-indigo-800"
            >
              <Plus className="w-4 h-4" /> Create Church District
            </button>
            <button
              onClick={() => setIsAddCredentialModalOpen(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-white/20 active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-400" /> Issue Ministerial Credential
            </button>
          </div>
        </div>

        {/* OVERSEER TELEMETRY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Districts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-300">{confDistricts.length}</span>
              <span className="text-xs text-slate-400 font-bold">pastoral circuits</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Local Churches</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{confChurches.length}</span>
              <span className="text-xs text-slate-400 font-bold">active stations</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Membership</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{confMembers.length || 1060}</span>
              <span className="text-xs text-slate-400 font-bold">baptized souls</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Monthly Sacred Trust</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">ZK {totalGrossTrustFunds.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-bold">tithes & mission</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE MODULE TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider border-b border-slate-200">
        <button
          onClick={() => setActiveTab('districts')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'districts'
              ? 'bg-indigo-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          Districts & Churches ({confDistricts.length})
        </button>

        <button
          onClick={() => setActiveTab('remittances')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'remittances'
              ? 'bg-indigo-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Sacred Trust Remittances & Auditing
        </button>

        <button
          onClick={() => setActiveTab('acms')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'acms'
              ? 'bg-indigo-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-400" />
          ACMS Statistical Compliance (7th Deadline)
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'credentials'
              ? 'bg-indigo-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Ministerial Credentials & Licensing ({credentialsList.length})
        </button>

        <button
          onClick={() => setActiveTab('constituency')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'constituency'
              ? 'bg-indigo-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          Constituency Session & Delegate Quotas
        </button>
      </div>

      {/* TAB 1: DISTRICTS & CHURCHES COORDINATION */}
      {activeTab === 'districts' && (
        <div className="space-y-6">
          {recentCreated && (
            <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-indigo-950 text-sm">
                    District Created: {recentCreated.dist.name}
                  </h4>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    Pastoral Account: <strong>{recentCreated.pastor.name}</strong> ({recentCreated.pastor.email}) with key <code>pastor123</code>. Churches creating profiles under {conference.name} can now select this district!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecentCreated(null)}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Conference Church Districts ({confDistricts.length})
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Churches registering in this conference pick from these districts. District pastors coordinate their pastoral care.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search districts or pastors..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDistricts.map((dist) => {
                const churchesInDist = confChurches.filter(c => 
                  c.districtId === dist.id || 
                  c.district?.toLowerCase() === dist.name.toLowerCase()
                );

                return (
                  <div 
                    key={dist.id}
                    className="bg-slate-50 hover:bg-slate-100/70 rounded-2xl p-5 border border-slate-200 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          Church District
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1.5">{dist.name}</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Landmark className="w-3 h-3 text-slate-400" />
                          {conference.name}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Assigned District Pastor</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          {dist.pastorName}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px] truncate">{dist.pastorEmail}</p>
                        {dist.pastorPhone && (
                          <p className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {dist.pastorPhone}
                          </p>
                        )}
                      </div>

                      {/* CHURCHES IN THIS DISTRICT */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Churches in District ({churchesInDist.length})
                          </span>
                        </div>

                        {churchesInDist.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No church stations enrolled yet</p>
                        ) : (
                          <div className="space-y-1.5">
                            {churchesInDist.map(c => (
                              <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                                <span className="font-bold text-slate-800 truncate">{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{c.city || 'Station'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        ID: <code>{dist.id}</code>
                      </span>
                      {onNavigateToDistrict && (
                        <button
                          onClick={() => onNavigateToDistrict(dist.id)}
                          className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                        >
                          Oversee District <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY SACRED TRUST REMITTANCES & FINANCIAL AUDITING */}
      {activeTab === 'remittances' && (
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                SDA Church Manual 2025 Chapter 10
              </span>
              <h3 className="text-xl font-black uppercase">
                Sacred Trust Storehouse Remittances & Auditing
              </h3>
              <p className="text-xs text-emerald-200 max-w-xl">
                Tithe and World Mission Offerings belong in the sacred storehouse and cannot be diverted or commingled with local church operating funds. All churches must remit by the 10th of each month.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center shrink-0">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] uppercase font-bold text-emerald-300 block">Tithe Total</span>
                <span className="text-lg font-black text-white">ZK {totalTitheRemitted.toLocaleString()}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] uppercase font-bold text-emerald-300 block">Mission Offerings</span>
                <span className="text-lg font-black text-amber-300">ZK {totalWorldMission.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 uppercase">
              September 2026 Remittance Schedule
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Church Station</th>
                    <th className="p-3.5">Submission Date</th>
                    <th className="p-3.5 text-right">Tithe (10%)</th>
                    <th className="p-3.5 text-right">Mission Funds</th>
                    <th className="p-3.5 text-right font-black">Gross Remitted</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {localRemittances.map(rem => (
                    <tr key={rem.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        {rem.churchName}
                        {rem.receiptNumber && (
                          <span className="block font-mono text-[10px] text-emerald-700 font-normal">
                            Receipt: {rem.receiptNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">{rem.submissionDate}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                        ZK {(rem.titheAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600">
                        ZK {(rem.worldMissionAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-slate-900">
                        ZK {(rem.totalRemitted || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        {rem.status === 'audited_reconciled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reconciled
                          </span>
                        ) : rem.status === 'overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Audit
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {rem.status === 'pending_audit' ? (
                          <button
                            onClick={() => handleReconcileRemittance(rem.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase transition-all shadow-xs"
                          >
                            Audit & Reconcile
                          </button>
                        ) : rem.status === 'audited_reconciled' ? (
                          <span className="text-[10px] font-bold text-slate-400">Audited by CFO</span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-600">Notice Sent to Elder</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACMS STATISTICAL SYNCHRONIZATION & DEADLINES */}
      {activeTab === 'acms' && (
        <div className="space-y-6">
          <div className="bg-blue-950 text-white p-6 rounded-3xl border border-blue-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                General Conference Statistical Reporting
              </span>
              <h3 className="text-xl font-black uppercase">
                ACMS / eAdventist Monthly Clerk Synchronization
              </h3>
              <p className="text-xs text-blue-200 max-w-xl">
                Church clerks are required by General Conference policy to transmit statistical reports by the <strong>7th of each month</strong> to synchronize additions, transfers, and Sabbath School attendance.
              </p>
            </div>

            <button
              onClick={handleTriggerAcmsSync}
              disabled={isSyncingAcms}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shrink-0 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAcms ? 'animate-spin' : ''}`} />
              {isSyncingAcms ? 'Syncing with GC ACMS...' : 'Batch Sync to ACMS Cloud'}
            </button>
          </div>

          {acmsSyncSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {acmsSyncSuccessMsg}
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 uppercase">
              September 2026 Clerk Statistical Compliance Matrix
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Church Station</th>
                    <th className="p-3.5">Submitted By</th>
                    <th className="p-3.5 text-center">Deadline</th>
                    <th className="p-3.5 text-center">Submission Status</th>
                    <th className="p-3.5 text-center">Baptisms</th>
                    <th className="p-3.5 text-center">Net Members</th>
                    <th className="p-3.5 text-center">Avg SS Attend.</th>
                    <th className="p-3.5 text-center">ACMS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {acmsReports.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{rep.churchName}</td>
                      <td className="p-3.5 text-slate-600">{rep.verifiedByClerkName}</td>
                      <td className="p-3.5 text-center font-mono text-[11px] text-slate-500">{rep.deadlineDate}</td>
                      <td className="p-3.5 text-center">
                        {rep.status === 'on_time' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            On Time ({rep.submittedDate})
                          </span>
                        ) : rep.status === 'late' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Late ({rep.submittedDate})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            Overdue (Pending)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-blue-700">+{rep.baptisms}</td>
                      <td className="p-3.5 text-center font-black text-slate-900">{rep.membershipEnd}</td>
                      <td className="p-3.5 text-center font-mono text-slate-700">{rep.ssAttendanceAverage}</td>
                      <td className="p-3.5 text-center">
                        {rep.acmsSyncStatus === 'synced' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ACMS Synced
                          </span>
                        ) : rep.acmsSyncStatus === 'pending_verification' ? (
                          <span className="font-bold text-amber-600 text-[10px]">Pending Verification</span>
                        ) : (
                          <span className="font-bold text-red-600 text-[10px]">Not Synced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MINISTERIAL CREDENTIALS & LICENSING */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Official Denominational Registry
              </span>
              <h3 className="text-xl font-black uppercase">
                Ministerial Credentials & Licensing Engine
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Official credentials issued by vote of the Conference Executive Committee. Click on any credential to generate and print the authentic framed certificate.
              </p>
            </div>

            <button
              onClick={() => setIsAddCredentialModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" /> Issue New Credential
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentialsList.map(cred => (
              <div 
                key={cred.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider">
                      {cred.type.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                      cred.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      cred.status === 'expiring_soon' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {cred.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">{cred.ministerName}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{cred.credentialNumber}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Territory:</span>
                      <span className="font-bold text-slate-900">{cred.districtName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Assigned Station:</span>
                      <span className="font-bold text-slate-900">{cred.assignedChurchName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Valid Until:</span>
                      <span className="font-bold text-indigo-700">{cred.expiryDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Voted: {cred.votedByExecutiveCommitteeDate}</span>
                  <button
                    onClick={() => setSelectedCredentialForView(cred)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black uppercase flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONSTITUENCY SESSION & DELEGATE QUOTAS */}
      {activeTab === 'constituency' && (
        <div className="space-y-6">
          <div className="bg-purple-950 text-white p-6 rounded-3xl border border-purple-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                SDA Church Manual 2025 Constituency Polity
              </span>
              <h3 className="text-xl font-black uppercase">
                Conference Constituency Session & Delegate Quotas
              </h3>
              <p className="text-xs text-purple-200 max-w-xl">
                Delegate quotas are mathematically calculated based on the Church Manual formula: <strong>1 basic delegate for the church organization + 1 additional delegate for every 50 members</strong> on the official roll.
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-purple-300 block">Total Accredited Delegates</span>
              <span className="text-2xl font-black text-amber-300">23 Delegates</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 uppercase">
              Quadrennial / Triennial Session Church Delegate Roll
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Church Congregation</th>
                    <th className="p-3.5 text-center">Official Membership</th>
                    <th className="p-3.5 text-center">Basic Quota</th>
                    <th className="p-3.5 text-center">Proportional (1/50)</th>
                    <th className="p-3.5 text-center font-black text-amber-300">Total Allocated</th>
                    <th className="p-3.5 text-center">Submitted Names</th>
                    <th className="p-3.5 text-center">Accreditation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {delegateQuotas.map(del => (
                    <tr key={del.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{del.churchName}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{del.officialMembership}</td>
                      <td className="p-3.5 text-center text-slate-500">{del.basicQuota}</td>
                      <td className="p-3.5 text-center text-slate-500">+{del.proportionalQuota}</td>
                      <td className="p-3.5 text-center font-black text-base text-indigo-900">
                        {del.totalDelegatesAllocated}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {del.delegatesSubmittedCount} / {del.totalDelegatesAllocated}
                      </td>
                      <td className="p-3.5 text-center">
                        {del.status === 'accredited' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Accredited
                          </span>
                        ) : del.status === 'provisional' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Provisional
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            Names Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DISTRICT MODAL */}
      {isAddDistrictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Create Church District</h3>
                  <p className="text-xs text-slate-500 font-medium">{conference.name} territory</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddDistrictModalOpen(false)}
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

            <form onSubmit={handleCreateDistrict} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                  District Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chelston District"
                  value={distName}
                  onChange={(e) => setDistName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Churches creating accounts will be able to select this district.
                </span>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider block">
                  Assigned District Pastor Account
                </span>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">Pastor Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Pastor John Lungu"
                    value={pastorName}
                    onChange={(e) => setPastorName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Pastor Email *</label>
                    <input
                      type="email"
                      placeholder="pastor.lungu@district.org"
                      value={pastorEmail}
                      onChange={(e) => setPastorEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Pastor Phone</label>
                    <input
                      type="tel"
                      placeholder="+260 977 123456"
                      value={pastorPhone}
                      onChange={(e) => setPastorPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">Initial Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={pastorPassword}
                      onChange={(e) => setPastorPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
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
                  onClick={() => setIsAddDistrictModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Save District & Appoint Pastor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE MINISTERIAL CREDENTIAL MODAL */}
      {isAddCredentialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Issue Ministerial Credential</h3>
                  <p className="text-xs text-slate-500 font-medium">{conference.name} Executive Committee Vote</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddCredentialModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCredential} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Minister Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pastor Samuel Banda"
                  value={newMinisterName}
                  onChange={(e) => setNewMinisterName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="pastor@conference.org"
                    value={newMinisterEmail}
                    onChange={(e) => setNewMinisterEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+260 977 ..."
                    value={newMinisterPhone}
                    onChange={(e) => setNewMinisterPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Credential Type *
                </label>
                <select
                  value={newMinisterType}
                  onChange={(e) => setNewMinisterType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ORDAINED_MINISTER">Ordained Minister Credential</option>
                  <option value="COMMISSIONED_MINISTER">Commissioned Minister Credential</option>
                  <option value="LICENSED_PASTOR">Ministerial License</option>
                  <option value="BIBLE_INSTRUCTOR">Bible Instructor Credential</option>
                  <option value="COMMISSIONED_HEALING_MINISTER">Commissioned Ministry of Healing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    District Assignment
                  </label>
                  <select
                    value={newMinisterDistrict}
                    onChange={(e) => setNewMinisterDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {confDistricts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Station Church
                  </label>
                  <input
                    type="text"
                    value={newMinisterChurch}
                    onChange={(e) => setNewMinisterChurch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCredentialModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Issue & Vote Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MINISTERIAL CREDENTIAL CERTIFICATE MODAL */}
      <MinisterialCredentialModal
        credential={selectedCredentialForView}
        isOpen={!!selectedCredentialForView}
        onClose={() => setSelectedCredentialForView(null)}
        conferenceName={conference.name}
        presidentName={conference.presidentName}
      />

    </div>
  );
};

export default ConferencePresidentDashboard;
