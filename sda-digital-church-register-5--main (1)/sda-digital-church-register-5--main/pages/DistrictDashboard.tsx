import React, { useState, useMemo } from 'react';
import { Users, BookOpen, Bell, Calendar, Plus, CheckCircle, XCircle, LayoutDashboard, Send, MapPin, Eye, FileText, ChevronRight, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { User, Class, Announcement, AttendanceRecord, Offerings, District, Church, Role } from '../types.ts';

interface DistrictDashboardProps {
  user: User;
  district: District;
  churches: Church[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];
  onApproveChurch: (id: string) => void;
  onPublishAnnouncement: (announcementData: any) => void;
  onLogout: () => void;
}

const DistrictDashboard: React.FC<DistrictDashboardProps> = ({
  user,
  district,
  churches,
  attendanceRecords,
  announcements,
  onApproveChurch,
  onPublishAnnouncement,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'churches' | 'approvals' | 'announcements'>('overview');
  
  // Announcement States
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announcePriority, setAnnouncePriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');

  // Filter objects belonging to this district
  const districtChurches = useMemo(() => {
    return churches.filter(c => c.districtId === district.id && c.status === 'approved');
  }, [churches, district]);

  const pendingChurches = useMemo(() => {
    return churches.filter(c => c.districtId === district.id && c.status === 'pending');
  }, [churches, district]);

  // Aggregate stats
  const totalMembers = useMemo(() => {
    return districtChurches.reduce((sum, c) => sum + (c.membership || 0), 0);
  }, [districtChurches]);

  const totalVisitors = useMemo(() => {
    // Attendance records submitted by churches in this district
    const churchIds = districtChurches.map(c => c.id);
    return attendanceRecords
      .filter(r => churchIds.includes(r.churchId))
      .reduce((sum, r) => sum + r.visitorCount, 0);
  }, [attendanceRecords, districtChurches]);

  // Calculate reporting status for latest Sabbath
  const reportingStatus = useMemo(() => {
    // Determine last Saturday (Sabbath) date
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 6 ? 0 : -6 - (day === 0 ? 7 : 0)); // Saturday
    const lastSabbath = new Date(today.setDate(diff));
    const lastSabbathStr = lastSabbath.toISOString().split('T')[0];

    const reportedChurchIds = new Set(
      attendanceRecords
        .filter(r => r.date === lastSabbathStr)
        .map(r => r.churchId)
    );

    return districtChurches.map(c => ({
      ...c,
      submitted: reportedChurchIds.has(c.id),
      date: lastSabbathStr
    }));
  }, [districtChurches, attendanceRecords]);

  const missingReportsCount = reportingStatus.filter(c => !c.submitted).length;

  const handlePublishAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceContent.trim()) return;

    onPublishAnnouncement({
      id: `ann_dist_${Date.now()}`,
      title: announceTitle.trim() || 'District Notice',
      content: announceContent.trim(),
      targetType: 'DISTRICT',
      targetId: district.id,
      priority: announcePriority,
      teacherId: user.id,
      teacherName: user.name,
      className: 'District Office',
      timestamp: new Date().toISOString(),
      status: 'compiled'
    });

    setAnnounceTitle('');
    setAnnounceContent('');
    alert('Announcement published to all churches in the district!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-amber-500 text-blue-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">District leadership</span>
            <h1 className="text-3xl font-black mt-2">{district.name}</h1>
            <p className="text-blue-300 text-sm mt-1">Hello, {user.name} • Local District Dashboard &amp; Church Overseer</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('approvals')}
              className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-black px-5 py-3 rounded-2xl transition-all text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Registration Queue ({pendingChurches.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        {[
          { id: 'overview', label: 'District Overview', icon: LayoutDashboard },
          { id: 'churches', label: 'Churches List', icon: BookOpen },
          { id: 'approvals', label: `Pending Approvals (${pendingChurches.length})`, icon: CheckCircle },
          { id: 'announcements', label: 'District Announcements', icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
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

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Churches', value: districtChurches.length, color: 'bg-blue-950 text-white', icon: '🏫' },
              { label: 'Total Members', value: totalMembers, color: 'bg-amber-500 text-blue-950', icon: '👥' },
              { label: 'Total Visitors', value: totalVisitors, color: 'bg-indigo-600 text-white', icon: '🤝' },
              { label: 'Missing Reports', value: missingReportsCount, color: missingReportsCount > 0 ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white', icon: '📝' }
            ].map((stat, i) => (
              <div key={i} className={`rounded-3xl p-5 shadow-sm ${stat.color}`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-wider opacity-85 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Reporting Status Tracker & Bulletins */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reporting status */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="text-amber-500" />
                Latest Sabbath Reporting Tracker
              </h3>
              <p className="text-xs text-slate-500 mb-4">Report status for Sabbath Date: <strong>{reportingStatus[0]?.date || 'None'}</strong></p>
              <div className="space-y-3">
                {reportingStatus.map(rc => (
                  <div key={rc.id} className="flex justify-between items-center p-3 border border-slate-50 rounded-xl bg-slate-50/50">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{rc.church_name}</p>
                      <p className="text-[10px] text-slate-400">Pastor: {rc.pastor_name || 'N/A'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      rc.submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 flex items-center gap-1'
                    }`}>
                      {!rc.submitted && <AlertCircle className="w-3 h-3" />}
                      {rc.submitted ? 'Submitted' : 'Missing'}
                    </span>
                  </div>
                ))}
                {reportingStatus.length === 0 && (
                  <p className="text-slate-400 text-sm italic text-center py-6">No churches configured in this district.</p>
                )}
              </div>
            </div>

            {/* Bulletins Feed */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Bell className="text-amber-500" />
                  District &amp; Conference Bulletins
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {announcements.filter(a => a.targetType === 'CONFERENCE' || (a.targetType === 'DISTRICT' && a.targetId === district.id)).map(a => (
                    <div key={a.id} className={`p-3 border rounded-xl text-xs ${
                      a.targetType === 'CONFERENCE' ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-200'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-900">{a.targetType === 'CONFERENCE' ? 'Zambia Union' : 'District'} Bulletin</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">{a.priority || 'NORMAL'}</span>
                      </div>
                      <p className="text-slate-700 font-semibold mb-1">{a.title}</p>
                      <p className="text-slate-600 line-clamp-2">{a.content}</p>
                    </div>
                  ))}
                  {announcements.filter(a => a.targetType === 'CONFERENCE' || (a.targetType === 'DISTRICT' && a.targetId === district.id)).length === 0 && (
                    <p className="text-slate-400 text-sm italic text-center py-8">No hierarchical bulletins received.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CHURCHES LIST */}
      {activeTab === 'churches' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">Churches Registry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {districtChurches.map(c => (
              <div key={c.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    {c.church_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Province: {c.province} • Location: {c.location}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    Clerk: {c.clerkName} ({c.clerkEmail}) • Pastor: {c.pastor_name || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full">
                    {c.membership} Members
                  </span>
                </div>
              </div>
            ))}
            {districtChurches.length === 0 && (
              <p className="text-slate-400 text-sm italic text-center col-span-2 py-12">No approved churches in this district.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="text-amber-500" />
            District Church Registration Queue
          </h3>
          <div className="space-y-4">
            {pendingChurches.map(c => (
              <div key={c.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Pending Approval</span>
                    <h4 className="font-bold text-lg text-slate-900">{c.church_name}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600">
                    <p><strong>Province:</strong> {c.province}</p>
                    <p><strong>Location:</strong> {c.location}</p>
                    <p><strong>Contact:</strong> {c.phone_number} / {c.email}</p>
                    <p><strong>Clerk:</strong> {c.clerkName} ({c.clerkEmail})</p>
                    <p><strong>Pastor:</strong> {c.pastor_name || 'N/A'}</p>
                    <p><strong>Membership Estimate:</strong> {c.membership}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApproveChurch(c.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Registration
                  </button>
                </div>
              </div>
            ))}
            {pendingChurches.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <div className="text-5xl mb-4">🎉</div>
                <h4 className="font-bold text-slate-700">Approval Queue is Clear</h4>
                <p className="text-xs">No pending church registrations require action in this district.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Write announcement */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Send className="text-amber-500" />
              Publish District Notice
            </h3>
            <form onSubmit={handlePublishAnnounce} className="space-y-4">
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
                <label className="block text-slate-500 text-xs font-bold mb-1">Notice Title</label>
                <input
                  type="text"
                  value={announceTitle}
                  onChange={e => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. District Fellowship Meeting"
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
                  placeholder="Write details for the churches..."
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-900 transition-all flex justify-center items-center gap-2">
                <Send className="w-4 h-4" /> Publish Announcement
              </button>
            </form>
          </div>

          {/* District bulletins */}
          <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">District Bulletins History</h3>
            <div className="space-y-4">
              {announcements
                .filter(a => a.targetType === 'DISTRICT' && a.targetId === district.id)
                .map(a => (
                  <div key={a.id} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{a.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        a.priority === 'URGENT' ? 'bg-red-100 text-red-800' : a.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {a.priority || 'NORMAL'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.content}</p>
                  </div>
                ))}
              {announcements.filter(a => a.targetType === 'DISTRICT' && a.targetId === district.id).length === 0 && (
                <p className="text-slate-400 text-sm italic text-center py-12">No notices published by this district office.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictDashboard;
