import React, { useState } from 'react';
import { ChurchMeeting, MeetingResolution, ChurchOfficer } from '../../types';
import { 
  Building2, Users, FileText, CheckCircle2, Clock, Plus, 
  Calendar, Check, X, ShieldAlert, Award, ChevronRight, Edit2, 
  Trash2, AlertTriangle, Scale, Search, Phone, Mail, FileCheck
} from 'lucide-react';

interface GovernanceMeetingsViewProps {
  meetings: ChurchMeeting[];
  officers: ChurchOfficer[];
  onAddMeeting: (meeting: Omit<ChurchMeeting, 'id' | 'churchId'>) => void;
  onUpdateMeeting: (id: string, updates: Partial<ChurchMeeting>) => void;
  onDeleteMeeting: (id: string) => void;
  onAddOfficer: (officer: Omit<ChurchOfficer, 'id' | 'churchId'>) => void;
  onUpdateOfficer: (id: string, updates: Partial<ChurchOfficer>) => void;
  onDeleteOfficer: (id: string) => void;
}

export const GovernanceMeetingsView: React.FC<GovernanceMeetingsViewProps> = ({
  meetings,
  officers,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onAddOfficer,
  onUpdateOfficer,
  onDeleteOfficer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'meetings' | 'resolutions' | 'officers'>('meetings');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<'ALL' | 'BOARD' | 'BUSINESS'>('ALL');
  
  // Meeting Modal
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<ChurchMeeting | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'BOARD' | 'BUSINESS'>('BOARD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:30 - 20:30');
  const [location, setLocation] = useState('Church Boardroom / Sanctuary');
  const [quorumConfirmed, setQuorumConfirmed] = useState(true);
  const [quorumCount, setQuorumCount] = useState(12);
  const [attendeesRaw, setAttendeesRaw] = useState('');
  const [absenteesRaw, setAbsenteesRaw] = useState('');
  const [agendaRaw, setAgendaRaw] = useState('');
  const [minutes, setMinutes] = useState('');
  
  // Resolution Modal inside Meeting
  const [selectedMeetingForRes, setSelectedMeetingForRes] = useState<ChurchMeeting | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resMotion, setResMotion] = useState('');
  const [resMover, setResMover] = useState('');
  const [resSeconder, setResSeconder] = useState('');
  const [resTag, setResTag] = useState<MeetingResolution['tag']>('Membership Action');
  const [resStatus, setResStatus] = useState<MeetingResolution['status']>('Carried');
  const [resRequiresBusiness, setResRequiresBusiness] = useState(false);

  // Officer Modal
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<ChurchOfficer | null>(null);
  const [offTitle, setOffTitle] = useState('');
  const [offDepartment, setOffDepartment] = useState('Pastoral & Elders');
  const [offName, setOffName] = useState('');
  const [offContact, setOffContact] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [offTerm, setOffTerm] = useState('2026 - 2027');
  const [offIsChair, setOffIsChair] = useState(false);
  const [offCommittee, setOffCommittee] = useState('');

  const filteredMeetings = meetings.filter(m => {
    if (meetingTypeFilter === 'ALL') return true;
    return m.type === meetingTypeFilter;
  });

  // Extract all resolutions across meetings
  const allResolutions: { res: MeetingResolution; meeting: ChurchMeeting }[] = [];
  meetings.forEach(m => {
    (m.resolutions || []).forEach(r => {
      allResolutions.push({ res: r, meeting: m });
    });
  });

  const openAddMeetingModal = () => {
    setEditingMeeting(null);
    setTitle('');
    setType('BOARD');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('18:30 - 20:30');
    setLocation('Church Boardroom / Sanctuary');
    setQuorumConfirmed(true);
    setQuorumCount(10);
    setAttendeesRaw('');
    setAbsenteesRaw('');
    setAgendaRaw('1. Devotion & Opening Prayer\n2. Minutes of Previous Meeting\n3. Clerk Membership Report\n4. Treasury & Finance\n5. Departmental Reports\n6. Adjournment & Closing Prayer');
    setMinutes('');
    setIsMeetingModalOpen(true);
  };

  const openEditMeetingModal = (meeting: ChurchMeeting) => {
    setEditingMeeting(meeting);
    setTitle(meeting.title);
    setType(meeting.type);
    setDate(meeting.date);
    setTime(meeting.time);
    setLocation(meeting.location);
    setQuorumConfirmed(meeting.quorumConfirmed);
    setQuorumCount(meeting.quorumCount);
    setAttendeesRaw((meeting.attendees || []).join('\n'));
    setAbsenteesRaw((meeting.absentees || []).join('\n'));
    setAgendaRaw((meeting.agenda || []).join('\n'));
    setMinutes(meeting.minutes);
    setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const attendees = attendeesRaw.split('\n').map(s => s.trim()).filter(Boolean);
    const absentees = absenteesRaw.split('\n').map(s => s.trim()).filter(Boolean);
    const agenda = agendaRaw.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingMeeting) {
      onUpdateMeeting(editingMeeting.id, {
        title,
        type,
        date,
        time,
        location,
        quorumConfirmed,
        quorumCount,
        attendees,
        absentees,
        agenda,
        minutes
      });
    } else {
      onAddMeeting({
        title,
        type,
        date,
        time,
        location,
        quorumConfirmed,
        quorumCount,
        attendees,
        absentees,
        agenda,
        minutes,
        resolutions: []
      });
    }
    setIsMeetingModalOpen(false);
  };

  const openAddResolution = (meeting: ChurchMeeting) => {
    setSelectedMeetingForRes(meeting);
    setResMotion('');
    setResMover('');
    setResSeconder('');
    setResTag('Membership Action');
    setResStatus('Carried');
    setResRequiresBusiness(false);
    setIsResolutionModalOpen(true);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingForRes) return;

    // Generate unique resolution number
    const resCount = allResolutions.length + 1;
    const year = new Date(selectedMeetingForRes.date).getFullYear();
    const resNo = `RES-${year}-${String(resCount).padStart(3, '0')}`;

    const newRes: MeetingResolution = {
      id: `res-${Date.now()}`,
      meetingId: selectedMeetingForRes.id,
      resolutionNumber: resNo,
      motion: resMotion,
      mover: resMover,
      seconder: resSeconder,
      tag: resTag,
      status: resStatus,
      requiresBusinessMeeting: resRequiresBusiness,
      votedDate: selectedMeetingForRes.date
    };

    const updatedResolutions = [...(selectedMeetingForRes.resolutions || []), newRes];
    onUpdateMeeting(selectedMeetingForRes.id, { resolutions: updatedResolutions });
    setIsResolutionModalOpen(false);
  };

  const openAddOfficerModal = () => {
    setEditingOfficer(null);
    setOffTitle('');
    setOffDepartment('Pastoral & Elders');
    setOffName('');
    setOffContact('');
    setOffEmail('');
    setOffTerm('2026 - 2027');
    setOffIsChair(false);
    setOffCommittee('');
    setIsOfficerModalOpen(true);
  };

  const openEditOfficerModal = (officer: ChurchOfficer) => {
    setEditingOfficer(officer);
    setOffTitle(officer.title);
    setOffDepartment(officer.department);
    setOffName(officer.officerName);
    setOffContact(officer.contact || '');
    setOffEmail(officer.email || '');
    setOffTerm(officer.termYear);
    setOffIsChair(officer.isChair);
    setOffCommittee(officer.committeeName || '');
    setIsOfficerModalOpen(true);
  };

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOfficer) {
      onUpdateOfficer(editingOfficer.id, {
        title: offTitle,
        department: offDepartment,
        officerName: offName,
        contact: offContact,
        email: offEmail,
        termYear: offTerm,
        isChair: offIsChair,
        committeeName: offCommittee
      });
    } else {
      onAddOfficer({
        title: offTitle,
        department: offDepartment,
        officerName: offName,
        contact: offContact,
        email: offEmail,
        termYear: offTerm,
        isChair: offIsChair,
        committeeName: offCommittee
      });
    }
    setIsOfficerModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Nav Pill Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-900" /> Church Governance & Board Management
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Official Minutes, Formal Resolutions, Business Meeting Mandate Enforcement & Elected Officer Directory
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('meetings')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'meetings' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" /> Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('resolutions')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'resolutions' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Voted Resolutions ({allResolutions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('officers')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'officers' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" /> Officer Directory ({officers.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: Meetings Manager */}
      {activeSubTab === 'meetings' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMeetingTypeFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  meetingTypeFilter === 'ALL' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                All Meetings
              </button>
              <button
                onClick={() => setMeetingTypeFilter('BOARD')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  meetingTypeFilter === 'BOARD' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Church Board Meetings
              </button>
              <button
                onClick={() => setMeetingTypeFilter('BUSINESS')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  meetingTypeFilter === 'BUSINESS' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Church Business Meetings
              </button>
            </div>

            <button
              onClick={openAddMeetingModal}
              className="px-6 py-3 bg-blue-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Record New Meeting
            </button>
          </div>

          {/* Meetings List */}
          <div className="space-y-6">
            {filteredMeetings.map(meeting => (
              <div 
                key={meeting.id}
                className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
              >
                {/* Meeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                      meeting.type === 'BUSINESS' ? 'bg-purple-100 text-purple-900' : 'bg-blue-50 text-blue-900'
                    }`}>
                      {meeting.type === 'BUSINESS' ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">{meeting.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          meeting.type === 'BUSINESS' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {meeting.type === 'BUSINESS' ? 'Church Business Meeting' : 'Church Board'}
                        </span>
                        {meeting.quorumConfirmed && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-black uppercase tracking-wider border border-emerald-200">
                            Quorum Confirmed ({meeting.quorumCount})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 mt-2">
                        <span>Date: <strong className="text-slate-700">{meeting.date}</strong></span>
                        <span>•</span>
                        <span>Time: {meeting.time}</span>
                        <span>•</span>
                        <span>Location: {meeting.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddResolution(meeting)}
                      className="px-4 py-2 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Voted Motion
                    </button>
                    <button
                      onClick={() => openEditMeetingModal(meeting)}
                      className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-50 rounded-xl"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMeeting(meeting.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Agenda & Minutes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Agenda List */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meeting Agenda</p>
                    <ul className="space-y-1.5 text-xs font-bold text-slate-700">
                      {meeting.agenda.map((ag, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-700 font-black">•</span> {ag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Minutes summary */}
                  <div className="lg:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Minutes & Proceedings</p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {meeting.minutes || 'Minutes in recording process...'}
                    </p>
                  </div>
                </div>

                {/* Resolutions in this meeting */}
                {meeting.resolutions && meeting.resolutions.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Formal Resolutions Voted at this Meeting ({meeting.resolutions.length})
                    </p>
                    <div className="space-y-2">
                      {meeting.resolutions.map(res => (
                        <div key={res.id} className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-blue-900">{res.resolutionNumber}</span>
                              <span className="px-2 py-0.5 bg-white border border-blue-200 text-blue-800 rounded text-[9px] font-black uppercase tracking-wider">
                                {res.tag}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase tracking-wider">
                                {res.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 mt-1">{res.motion}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                              Moved by: {res.mover} • Seconded by: {res.seconder}
                            </p>
                          </div>

                          {res.requiresBusinessMeeting && (
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                              Requires Business Meeting Ratification
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Voted Resolutions Tracker with SDA Church Manual Enforcement */}
      {activeSubTab === 'resolutions' && (
        <div className="space-y-6">
          {/* SDA Church Manual Enforcement Notice Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white p-6 rounded-[2rem] shadow-lg flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-sm uppercase tracking-wider">
                SDA Church Manual Governance Mandate
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Notice: Disciplinary membership actions (such as dropping or disfellowshipping members) 
                <strong> CANNOT be finalized by the Church Board alone</strong>. According to Chapter 7 of the 
                <em> Seventh-day Adventist Church Manual</em>, all final membership deletions or disciplinary votes 
                MUST be submitted to and voted by the church in a duly called <strong>Church Business Meeting</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="pb-4 px-4">Resolution #</th>
                    <th className="pb-4 px-4">Category</th>
                    <th className="pb-4 px-4">Motion Text</th>
                    <th className="pb-4 px-4">Mover / Seconder</th>
                    <th className="pb-4 px-4">Status & Meeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {allResolutions.map(({ res, meeting }) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-black text-blue-900 text-sm">{res.resolutionNumber}</span>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{res.votedDate}</p>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {res.tag}
                        </span>
                        {res.tag === 'Discipline' && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-600 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Business Voted
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 max-w-md">
                        <p className="text-slate-900">{res.motion}</p>
                        {res.requiresBusinessMeeting && (
                          <p className="text-[10px] text-purple-700 font-black mt-1">
                            ⚠️ Mandatory Church Business Meeting Action
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 text-[11px] text-slate-500">
                        <p>Mover: <strong className="text-slate-800">{res.mover}</strong></p>
                        <p>Seconder: <strong className="text-slate-800">{res.seconder}</strong></p>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {res.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{meeting.title}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Officers & Committees Directory */}
      {activeSubTab === 'officers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              Elected Church Officers & Specialized Committees
            </h3>
            <button
              onClick={openAddOfficerModal}
              className="px-6 py-3 bg-blue-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Add Officer / Committee
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officers.map(officer => (
              <div 
                key={officer.id}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center font-black text-base shadow-sm">
                      {officer.officerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base leading-tight">{officer.title}</h4>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-800 mt-0.5">
                        {officer.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditOfficerModal(officer)}
                      className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-slate-50 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteOfficer(officer.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <p className="font-black text-slate-900 text-sm">{officer.officerName}</p>
                  {officer.contact && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {officer.contact}
                    </p>
                  )}
                  {officer.email && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {officer.email}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <span>Term: {officer.termYear}</span>
                    {officer.isChair && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black">
                        Chairperson
                      </span>
                    )}
                  </div>
                  {officer.committeeName && (
                    <p className="text-[10px] text-blue-900 font-bold">Committee: {officer.committeeName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-2xl w-full shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {editingMeeting ? 'Edit Meeting Details' : 'Record New Meeting'}
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                  Church Board & Business Meeting Minutes
                </p>
              </div>
              <button 
                onClick={() => setIsMeetingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Meeting Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Monthly Church Board Meeting"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Meeting Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="BOARD">Church Board Meeting</option>
                    <option value="BUSINESS">Church Business Meeting (Full Membership)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="18:30 - 20:30"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Boardroom / Sanctuary"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quorumConfirmed}
                    onChange={(e) => setQuorumConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-900"
                  />
                  <span className="font-black text-xs uppercase tracking-wider text-slate-800">
                    Quorum Confirmed & Established
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Count:</span>
                  <input
                    type="number"
                    value={quorumCount}
                    onChange={(e) => setQuorumCount(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-black text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Agenda Items (One per line)</label>
                <textarea
                  rows={3}
                  value={agendaRaw}
                  onChange={(e) => setAgendaRaw(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Minutes & Summary of Discussions</label>
                <textarea
                  rows={4}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="Record summary of reports, discussions, and pastoral announcements..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Save Meeting Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {isResolutionModalOpen && selectedMeetingForRes && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Formal Voted Motion</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                  Meeting: {selectedMeetingForRes.title} ({selectedMeetingForRes.date})
                </p>
              </div>
              <button 
                onClick={() => setIsResolutionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Motion Text *</label>
                <textarea
                  required
                  rows={3}
                  value={resMotion}
                  onChange={(e) => setResMotion(e.target.value)}
                  placeholder="VOTED: To approve..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Mover *</label>
                  <input
                    type="text"
                    required
                    value={resMover}
                    onChange={(e) => setResMover(e.target.value)}
                    placeholder="e.g. Sister Chanda (Clerk)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Seconder *</label>
                  <input
                    type="text"
                    required
                    value={resSeconder}
                    onChange={(e) => setResSeconder(e.target.value)}
                    placeholder="e.g. Elder Musonda"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Resolution Category</label>
                  <select
                    value={resTag}
                    onChange={(e) => setResTag(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  >
                    <option value="Membership Action">Membership Action</option>
                    <option value="Financial/Building">Financial / Building</option>
                    <option value="Elections">Elections & Appointments</option>
                    <option value="Discipline">Discipline / Censures</option>
                    <option value="General Policy">General Church Policy</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Vote Outcome</label>
                  <select
                    value={resStatus}
                    onChange={(e) => setResStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  >
                    <option value="Carried">Carried (Affirmed)</option>
                    <option value="Defeated">Defeated</option>
                    <option value="Tabled">Tabled for Review</option>
                  </select>
                </div>
              </div>

              {/* Mandate Checkbox */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resRequiresBusiness}
                    onChange={(e) => setResRequiresBusiness(e.target.checked)}
                    className="w-5 h-5 rounded text-purple-900"
                  />
                  <span className="font-bold text-xs text-purple-900">
                    Mandatory Church Business Meeting Ratification (e.g. Disciplinary actions, property sale)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResolutionModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Record Motion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Officer Modal */}
      {isOfficerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {editingOfficer ? 'Edit Church Officer' : 'Add Church Officer'}
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                  Church Officer Directory
                </p>
              </div>
              <button 
                onClick={() => setIsOfficerModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOfficer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Office / Title *</label>
                  <input
                    type="text"
                    required
                    value={offTitle}
                    onChange={(e) => setOffTitle(e.target.value)}
                    placeholder="e.g. Head Elder, Deacon, Clerk"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Department *</label>
                  <input
                    type="text"
                    required
                    value={offDepartment}
                    onChange={(e) => setOffDepartment(e.target.value)}
                    placeholder="e.g. Pastoral, Treasury, Youth"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Elected Officer Name *</label>
                <input
                  type="text"
                  required
                  value={offName}
                  onChange={(e) => setOffName(e.target.value)}
                  placeholder="e.g. Elder Musonda"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Phone</label>
                  <input
                    type="text"
                    value={offContact}
                    onChange={(e) => setOffContact(e.target.value)}
                    placeholder="+260 977 000000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Email</label>
                  <input
                    type="email"
                    value={offEmail}
                    onChange={(e) => setOffEmail(e.target.value)}
                    placeholder="officer@church.org"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Term Year</label>
                  <input
                    type="text"
                    value={offTerm}
                    onChange={(e) => setOffTerm(e.target.value)}
                    placeholder="2026 - 2027"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Committee (Optional)</label>
                  <input
                    type="text"
                    value={offCommittee}
                    onChange={(e) => setOffCommittee(e.target.value)}
                    placeholder="e.g. Finance Committee"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offIsChair}
                    onChange={(e) => setOffIsChair(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="font-bold text-xs text-slate-700">Committee Chairperson / Department Head</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOfficerModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
