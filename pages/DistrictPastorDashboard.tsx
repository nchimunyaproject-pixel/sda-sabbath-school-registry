import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, MapPin, Plus, UserPlus, Users, 
  Layers, ChevronRight, Phone, Mail, CheckCircle2,
  Lock, Eye, EyeOff, Search, ArrowRight, BarChart3, Landmark,
  BookOpen, DollarSign, Calendar, Activity, School, Clock, Megaphone,
  Sparkles, FileText, ArrowUpRight, Share2, Award, UserCheck, AlertCircle
} from 'lucide-react';
import { District, ChurchStation, User, Role, CompanyPlantingProject } from '../types';
import { INITIAL_COMPANY_PROJECTS } from '../constants';

interface DistrictEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  type: 'communion' | 'evangelism' | 'council' | 'baptism' | 'fellowship';
  description: string;
}

interface DistrictDashboardProps {
  user: User;
  district: District;
  churches: ChurchStation[];
  churchMembers: any[];
  attendanceRecords?: any[];
  companyProjects?: CompanyPlantingProject[];
  onSelectChurchForPastoralCare?: (churchId: string) => void;
}

export const DistrictPastorDashboard: React.FC<DistrictDashboardProps> = ({
  user,
  district,
  churches,
  churchMembers,
  attendanceRecords = [],
  companyProjects = INITIAL_COMPANY_PROJECTS,
  onSelectChurchForPastoralCare
}) => {
  const [activeTab, setActiveTab] = useState<'churches' | 'planting' | 'events' | 'telemetry' | 'referrals'>('churches');
  const [searchTerm, setSearchTerm] = useState('');
  
  // District Events / Joint Activities
  const [districtEvents, setDistrictEvents] = useState<DistrictEvent[]>([
    {
      id: 'de-1',
      title: 'Joint District Holy Communion & Foot Washing',
      date: '2026-09-26',
      time: '09:00 AM',
      location: 'Woodlands Main Sanctuary',
      type: 'communion',
      description: 'Presided by District Pastor. All district elders, deacons, and congregations attending.'
    },
    {
      id: 'de-2',
      title: 'District Harvest Ingathering & Evangelism Rally',
      date: '2026-10-10',
      time: '02:30 PM',
      location: 'District Central Grounds',
      type: 'evangelism',
      description: 'Mobilizing all churches, branches, and youth for the upcoming territorial evangelistic campaign.'
    },
    {
      id: 'de-3',
      title: 'Quarterly District Council of Elders & Clerks',
      date: '2026-10-18',
      time: '08:30 AM',
      location: 'Woodlands Boardroom',
      type: 'council',
      description: 'Pastoral review of church records, baptismal candidates, membership roll audits, and ACMS sync.'
    }
  ]);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00 AM');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventType, setNewEventType] = useState<'communion' | 'evangelism' | 'council' | 'baptism' | 'fellowship'>('communion');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Company Planting State
  const [plantingList, setPlantingList] = useState<CompanyPlantingProject[]>(
    companyProjects.filter(p => p.districtId === district.id || !p.districtId)
  );
  const [isAddPlantingModalOpen, setIsAddPlantingModalOpen] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantLocation, setNewPlantLocation] = useState('');
  const [newPlantType, setNewPlantType] = useState<CompanyPlantingProject['type']>('BRANCH_SABBATH_SCHOOL');
  const [newPlantMembers, setNewPlantMembers] = useState(15);
  const [newPlantMotherChurch, setNewPlantMotherChurch] = useState('Woodlands SDA Church');
  const [newPlantLeader, setNewPlantLeader] = useState('');
  const [newPlantClerk, setNewPlantClerk] = useState('');
  const [newPlantTreasurer, setNewPlantTreasurer] = useState('');

  // Inter-Church Referral List
  const [referrals, setReferrals] = useState<any[]>([
    {
      id: 'ref-1',
      candidateName: 'Brother Mwamba Chilufya',
      sourceChurch: 'Woodlands SDA Church',
      destinationChurch: 'Libala SDA Church',
      type: 'membership_transfer',
      status: 'pastor_approved',
      notes: 'Relocated residence to Libala South. Fast-track approval granted for first board reading.'
    },
    {
      id: 'ref-2',
      candidateName: 'Sister Patricia Mwansa (Visitor Interest)',
      sourceChurch: 'Woodlands SDA Church',
      destinationChurch: 'State Lodge Branch',
      type: 'evangelistic_interest',
      status: 'assigned_bible_study',
      notes: 'Attended Evangelism Rally. Expressed interest in baptism. State Lodge Bible worker assigned.'
    }
  ]);

  // Scoped churches in this district
  const districtChurches = churches.filter(c => 
    c.districtId === district.id || 
    c.district?.toLowerCase() === district.name.toLowerCase()
  );

  // Scoped members across district churches
  const districtMembers = churchMembers.filter(m => 
    districtChurches.some(c => c.id === m.churchId)
  );

  const filteredChurches = districtChurches.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.elderName && c.elderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate || !newEventLocation) return;

    const newEv: DistrictEvent = {
      id: `de-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime.trim(),
      location: newEventLocation.trim(),
      type: newEventType,
      description: newEventDesc.trim()
    };

    setDistrictEvents(prev => [newEv, ...prev]);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventLocation('');
    setNewEventDesc('');
    setIsAddEventOpen(false);
  };

  const handleAddPlanting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName || !newPlantLocation || !newPlantLeader) return;

    const newPlant: CompanyPlantingProject = {
      id: `plant-${Date.now()}`,
      districtId: district.id,
      conferenceId: district.conferenceId,
      name: newPlantName.trim(),
      location: newPlantLocation.trim(),
      type: newPlantType,
      currentActiveMembers: Number(newPlantMembers),
      motherChurchName: newPlantMotherChurch,
      appointedLeaderName: newPlantLeader.trim(),
      appointedClerkName: newPlantClerk.trim() || 'Clerk Designate',
      appointedTreasurerName: newPlantTreasurer.trim() || 'Treasurer Designate',
      targetOrganizationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pastorRecommendationStatus: 'recommended'
    };

    setPlantingList(prev => [newPlant, ...prev]);
    setIsAddPlantingModalOpen(false);
    setNewPlantName('');
    setNewPlantLocation('');
    setNewPlantLeader('');
    setNewPlantClerk('');
    setNewPlantTreasurer('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* DISTRICT PASTOR OVERSEER BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-teal-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 border border-teal-400/40 rounded-xl text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <School className="w-3.5 h-3.5 text-teal-400" />
              District Pastoral Care & Coordination • {district.name}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              District Overseer Portal
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed">
              Welcome, <span className="text-white font-bold">{user.name}</span>. As District Pastor for <span className="text-teal-300 font-bold">{district.name}</span> in <span className="text-white underline font-bold">{district.conferenceName || 'Lusaka Conference'}</span>, you coordinate all congregations in your circuit, collaborate with Local Church First Elders, and preside over district ordinances, company plants, and telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="px-5 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-teal-600/30 active:scale-95 border-b-2 border-teal-800"
            >
              <Plus className="w-4 h-4" /> Schedule District Activity
            </button>
            <button
              onClick={() => setIsAddPlantingModalOpen(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-white/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Plant New Company / Branch
            </button>
          </div>
        </div>

        {/* OVERSEER TELEMETRY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Churches & Companies</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-teal-300">{districtChurches.length}</span>
              <span className="text-xs text-slate-400 font-bold">congregations</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Believers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{districtMembers.length || 365}</span>
              <span className="text-xs text-slate-400 font-bold">active souls</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sabbath Attendance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">321</span>
              <span className="text-xs text-slate-400 font-bold">avg weekly</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">District Tithe Flow</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">ZK 25,500</span>
              <span className="text-xs text-slate-400 font-bold">this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider border-b border-slate-200">
        <button
          onClick={() => setActiveTab('churches')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'churches'
              ? 'bg-teal-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-400" />
          Congregations Under Circuit ({districtChurches.length})
        </button>

        <button
          onClick={() => setActiveTab('planting')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'planting'
              ? 'bg-teal-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Company Planting & Leadership ({plantingList.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'events'
              ? 'bg-teal-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-teal-400" />
          Joint Activities & Ordinances ({districtEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-teal-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          District Aggregated Telemetry
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'referrals'
              ? 'bg-teal-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
          Inter-Church Transfers & Referrals ({referrals.length})
        </button>
      </div>

      {/* TAB CONTENT: CHURCHES */}
      {activeTab === 'churches' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Congregations Under {district.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Each church is managed locally by its First Elder. As District Pastor, you can switch into any church station below to review records, conduct pastoral visits, or assist church officers.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search churches, elders, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church) => {
              const churchMembersList = districtMembers.filter(m => m.churchId === church.id);

              return (
                <div 
                  key={church.id}
                  className="bg-slate-50 hover:bg-slate-100/70 rounded-2xl p-5 border border-slate-200 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                        {church.isDemo ? 'Master Demonstration Station' : 'Organized Church'}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1.5">{church.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {church.city || 'District Station'} • {church.address || 'Church Grounds'}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Presiding Church First Elder
                      </span>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        {church.elderName || 'Assigned Pastor Managing Directly'}
                      </p>
                      {church.elderEmail && (
                        <p className="text-slate-500 font-mono text-[11px] truncate">{church.elderEmail}</p>
                      )}
                      {church.phone && (
                        <p className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {church.phone}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Church Roll</span>
                        <span className="text-lg font-black text-teal-900">
                          {churchMembersList.length > 0 ? churchMembersList.length : (church.isDemo ? 320 : 45)}
                        </span>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                        <span className="text-xs font-black text-emerald-600 uppercase">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      ID: <code>{church.id}</code>
                    </span>
                    {onSelectChurchForPastoralCare && (
                      <button
                        onClick={() => onSelectChurchForPastoralCare(church.id)}
                        className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs"
                      >
                        Enter Church Station <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMPANY PLANTING WORKFLOW (CHURCH MANUAL CH. 4) */}
      {activeTab === 'planting' && (
        <div className="space-y-6">
          <div className="bg-amber-950 text-white p-6 rounded-3xl border border-amber-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                SDA Church Manual 2025 Chapter 4 Guidelines
              </span>
              <h3 className="text-xl font-black uppercase">
                Company Planting & Mission Group Leadership Engine
              </h3>
              <p className="text-xs text-amber-200 max-w-xl">
                When a Branch Sabbath School grows, the District Pastor guides it into an official Company by appointing an initial Leader, Clerk, and Treasurer, subsequently recommending it to the Conference Executive Committee.
              </p>
            </div>

            <button
              onClick={() => setIsAddPlantingModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" /> Plant New Company / Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantingList.map(plant => (
              <div 
                key={plant.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-900 font-black text-[10px] uppercase tracking-wider">
                      {plant.type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                      {plant.pastorRecommendationStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">{plant.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {plant.location}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Mother Church:</span>
                      <span className="font-bold text-slate-900">{plant.motherChurchName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Active Members:</span>
                      <span className="font-bold text-emerald-700">{plant.currentActiveMembers} Souls</span>
                    </div>
                    <div className="border-t border-slate-200/60 pt-2 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Company Leader:</span>
                        <span className="font-bold text-slate-800">{plant.appointedLeaderName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Company Clerk:</span>
                        <span className="font-bold text-slate-800">{plant.appointedClerkName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Company Treasurer:</span>
                        <span className="font-bold text-slate-800">{plant.appointedTreasurerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Target Org: {plant.targetOrganizationDate}</span>
                  <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
                    Pastor Endorsed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                District Joint Activities & Ordinances
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Scheduled district communion services, rallies, evangelistic crusades, and joint meetings across all churches.
              </p>
            </div>

            <button
              onClick={() => setIsAddEventOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Joint Activity
            </button>
          </div>

          <div className="space-y-4">
            {districtEvents.map(ev => (
              <div 
                key={ev.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      ev.type === 'communion' ? 'bg-amber-100 text-amber-800' :
                      ev.type === 'evangelism' ? 'bg-emerald-100 text-emerald-800' :
                      ev.type === 'council' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-teal-100 text-teal-800'
                    }`}>
                      {ev.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {ev.date} {ev.time && `• ${ev.time}`}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-600 max-w-2xl">{ev.description}</p>
                </div>

                <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs shrink-0 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Host Venue</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600" /> {ev.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              District Operational Telemetry Overview
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Field reports, sacred trust fund remittances, and attendance trends for pastoral council reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">Sacred Trust Remittance</span>
              <div className="text-2xl font-black text-slate-900">ZK 25,500.00</div>
              <p className="text-xs text-slate-500">Transmitted from {districtChurches.length} churches to Conference Treasury.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">Sabbath School Lesson Study</span>
              <div className="text-2xl font-black text-teal-700">78.4%</div>
              <p className="text-xs text-slate-500">Average daily lesson study participation across district classes.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">Active Visitor Interests</span>
              <div className="text-2xl font-black text-amber-600">34 Souls</div>
              <p className="text-xs text-slate-500">Prospective candidates undergoing pastoral bible studies.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INTER-CHURCH TRANSFERS & REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                Inter-Church Transfers & Referrals Engine
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Expedited transfers and pastoral referrals between sister congregations within {district.name}.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Source Congregation</th>
                  <th className="p-3.5">Destination Church</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Pastoral Notes</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{ref.candidateName}</td>
                    <td className="p-3.5 text-slate-700">{ref.sourceChurch}</td>
                    <td className="p-3.5 font-bold text-indigo-900">{ref.destinationChurch}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                        {ref.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{ref.notes}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE ACTIVITY MODAL */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Schedule District Activity</h3>
                  <p className="text-xs text-slate-500 font-medium">{district.name} Joint Calendar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddEventOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. District Elders & Deacons Seminar"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Host Venue / Church Station *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Woodlands Main Sanctuary"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Activity Type
                </label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                >
                  <option value="communion">Communion & Ordinance Service</option>
                  <option value="evangelism">District Evangelism / Campaign</option>
                  <option value="council">District Council / Officers Meeting</option>
                  <option value="baptism">District Joint Baptismal Service</option>
                  <option value="fellowship">Music & Fellowship Festival</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Description / Pastoral Instructions
                </label>
                <textarea
                  rows={3}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Details for all district congregations..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Post Activity to District
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLANT NEW COMPANY / BRANCH MODAL */}
      {isAddPlantingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Plant New Company / Branch</h3>
                  <p className="text-xs text-slate-500 font-medium">SDA Church Manual 2025 Chapter 4 Workflow</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddPlantingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlanting} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Congregation / Branch Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Lodge Branch Sabbath School"
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Location / Area *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Lodge Community"
                    value={newPlantLocation}
                    onChange={(e) => setNewPlantLocation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Entity Type
                  </label>
                  <select
                    value={newPlantType}
                    onChange={(e) => setNewPlantType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="BRANCH_SABBATH_SCHOOL">Branch Sabbath School</option>
                    <option value="COMPANY">Company (Voted Officers)</option>
                    <option value="MISSION_GROUP">Mission Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Mother Church *
                  </label>
                  <select
                    value={newPlantMotherChurch}
                    onChange={(e) => setNewPlantMotherChurch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {districtChurches.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Active Members
                  </label>
                  <input
                    type="number"
                    value={newPlantMembers}
                    onChange={(e) => setNewPlantMembers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                  Initial Appointed Officers (Church Manual Ch. 4)
                </span>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Appointed Leader *</label>
                  <input
                    type="text"
                    placeholder="e.g. Elder M. Kalenga"
                    value={newPlantLeader}
                    onChange={(e) => setNewPlantLeader(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Appointed Clerk</label>
                    <input
                      type="text"
                      placeholder="e.g. Sister F. Mutale"
                      value={newPlantClerk}
                      onChange={(e) => setNewPlantClerk(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Appointed Treasurer</label>
                    <input
                      type="text"
                      placeholder="e.g. Brother D. Chola"
                      value={newPlantTreasurer}
                      onChange={(e) => setNewPlantTreasurer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPlantingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Endorse & Submit to Conference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DistrictPastorDashboard;
