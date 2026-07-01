import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, BookOpen, Bell, Calendar, DollarSign, Mail, Plus, Trash2, Edit3, Sparkles, CheckCircle, XCircle, ChevronDown, LayoutDashboard, Eye, X, Save, RefreshCw, Send, Lock, ChurchIcon, AlertCircle, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { User, Class, Announcement, AttendanceRecord, Offerings, Role } from '../types.ts';

interface ClerkDashboardProps {
  teachers: User[];
  classes: Class[];
  announcements: Announcement[];
  attendanceRecords: AttendanceRecord[];
  addTeacher: (name: string, email: string, password: string, classId: string, language?: string) => void;
  addClass: (name: string, language: string) => void;
  notifyTeachersNextSabbath: (message: string, sabbathDate: string, recipients?: string[]) => Promise<boolean>;
  isManageOpen: boolean;
  onCloseManage: () => void;
  updateTeacherPassword: (teacherId: string, newPassword: string) => void;
  assignTeacherToClass: (teacherId: string, classId: string, language?: string) => void;
  removeTeacher: (teacherId: string) => void;
  resetRequests: { id: string; name: string; email: string; requestedAt: string }[];
  resolveResetRequest: (id: string) => void;
  offerings: Offerings;
  onOfferingsChange: (offerings: Offerings) => void;
}

const ADULT_LANGUAGES = ['English', 'Bemba', 'Tonga', 'Nyanja', 'Lozi'];

const ClerkDashboard: React.FC<ClerkDashboardProps> = ({
  teachers,
  classes,
  announcements,
  attendanceRecords,
  addTeacher,
  addClass,
  notifyTeachersNextSabbath,
  isManageOpen,
  onCloseManage,
  updateTeacherPassword,
  assignTeacherToClass,
  removeTeacher,
  resetRequests,
  resolveResetRequest,
  offerings,
  onOfferingsChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'classes' | 'announcements' | 'attendance' | 'offerings' | 'notify'>('overview');
  
  // AI compiling states
  const [aiSummary, setAiSummary] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // Modal display states
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);

  // Add Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newTeacherClassId, setNewTeacherClassId] = useState('');
  const [newTeacherLang, setNewTeacherLang] = useState('English');

  // Add Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassLang, setNewClassLang] = useState('English');

  // Reassignment Form State
  const [reassignTeacherId, setReassignTeacherId] = useState('');
  const [reassignClassId, setReassignClassId] = useState('');
  const [reassignLang, setReassignLang] = useState('English');

  // Offerings Inputs State
  const [weeklyMissionInput, setWeeklyMissionInput] = useState(offerings.weeklyMission.toString());
  const [thirteenthSabbathInput, setThirteenthSabbathInput] = useState(offerings.thirteenthSabbath.toString());
  const [birthdayThankInput, setBirthdayThankInput] = useState(offerings.birthdayThank.toString());
  const [investmentFundInput, setInvestmentFundInput] = useState(offerings.investmentFund.toString());
  const [offeringsSavedMsg, setOfferingsSavedMsg] = useState('');

  // Email Notification States
  const [notifyMessage, setNotifyMessage] = useState('Happy Preparation Day! Please remember to update your class attendance registry tomorrow morning.');
  const [notifySabbathDate, setNotifySabbathDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 6 ? 0 : 6 - day); // Next Saturday
    const nextSabbath = new Date(today.setDate(diff));
    return nextSabbath.toISOString().split('T')[0];
  });
  const [notifyStatus, setNotifyStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Password Update Modal for Admin manage
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // 1. STATS CALCULATION
  const totalStudents = useMemo(() => classes.reduce((sum, c) => sum + (c.students?.length || 0), 0), [classes]);
  const pendingAnnouncementsCount = useMemo(() => announcements.filter(a => a.status === 'pending').length, [announcements]);

  // Determine last Saturday (Sabbath) date
  const lastSabbathStr = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    // Go back to the previous Saturday
    const diff = today.getDate() - day + (day === 6 ? 0 : -6 - (day === 0 ? 7 : 0));
    const lastSabbath = new Date(today.setDate(diff));
    return lastSabbath.toISOString().split('T')[0];
  }, []);

  // Calculate reporting status for each class for the last Sabbath
  const classReportingStatus = useMemo(() => {
    const reportedClassIds = new Set(
      attendanceRecords
        .filter(r => r.date === lastSabbathStr)
        .map(r => r.classId)
    );

    return classes.map(c => ({
      ...c,
      submitted: reportedClassIds.has(c.id),
      date: lastSabbathStr
    }));
  }, [classes, attendanceRecords, lastSabbathStr]);

  const missingReportsCount = useMemo(() => classReportingStatus.filter(c => !c.submitted).length, [classReportingStatus]);

  // AI Summary generator
  const compileAnnouncements = async () => {
    setIsCompiling(true);
    setAiSummary('');
    try {
      const pendingText = announcements
        .filter(a => a.status === 'pending')
        .map(a => `${a.className} (Teacher: ${a.teacherName}): ${a.content}`)
        .join('\n\n');

      if (!pendingText) {
        setAiSummary("No pending announcements to compile.");
        setIsCompiling(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are an expert SDA church bulletin clerk compiling the Sabbath school announcements for the main church service announcement block. Synthesize and summarize the following announcements from the Sabbath School classes into a professional, concise, bulleted bulletin ready for reading. Do not add placeholders:\n\n${pendingText}`
      });

      setAiSummary(response.text || 'Failed to generate summary.');
    } catch (e) {
      console.error(e);
      setAiSummary("Unable to compile summary. Please verify that VITE_GEMINI_API_KEY is configured in your environmental settings.");
    }
    setIsCompiling(false);
  };

  // Submit forms handlers
  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim() || !newTeacherPassword.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    addTeacher(
      newTeacherName.trim(),
      newTeacherEmail.trim().toLowerCase(),
      newTeacherPassword,
      newTeacherClassId,
      newTeacherLang
    );
    // Reset Form
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPassword('');
    setNewTeacherClassId('');
    setShowAddTeacherModal(false);
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      alert('Please enter a class name.');
      return;
    }
    addClass(newClassName.trim(), newClassLang);
    setNewClassName('');
    setShowAddClassModal(false);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTeacherId || !reassignClassId) return;
    assignTeacherToClass(reassignTeacherId, reassignClassId, reassignLang);
    setShowReassignModal(false);
  };

  const handleSaveOfferings = (e: React.FormEvent) => {
    e.preventDefault();
    onOfferingsChange({
      weeklyMission: Number(weeklyMissionInput) || 0,
      thirteenthSabbath: Number(thirteenthSabbathInput) || 0,
      birthdayThank: Number(birthdayThankInput) || 0,
      investmentFund: Number(investmentFundInput) || 0
    });
    setOfferingsSavedMsg('Offerings saved successfully!');
    setTimeout(() => setOfferingsSavedMsg(''), 3000);
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyMessage.trim() || !notifySabbathDate) return;
    setIsSendingNotif(true);
    setNotifyStatus(null);

    const ok = await notifyTeachersNextSabbath(notifyMessage, notifySabbathDate);
    if (ok) {
      setNotifyStatus({ type: 'success', text: 'Email notification broadcast successfully sent to all teachers.' });
      setNotifyMessage('');
    } else {
      setNotifyStatus({ type: 'error', text: 'Broadcast failed. Please check backend SMTP connection configurations.' });
    }
    setIsSendingNotif(false);
  };

  const handleSaveTeacherPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacherId || !newPasswordValue.trim()) return;
    updateTeacherPassword(editingTeacherId, newPasswordValue);
    setEditingTeacherId(null);
    setNewPasswordValue('');
    alert('Password updated successfully.');
  };

  // Chart Data preparation
  const chartData = useMemo(() => {
    // Map records to date sums
    const dateMap: Record<string, number> = {};
    attendanceRecords.slice(0, 10).forEach(r => {
      dateMap[r.date] = (dateMap[r.date] || 0) + r.presentCount;
    });
    return Object.entries(dateMap).map(([date, val]) => ({ date, present: val })).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceRecords]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-amber-500 text-blue-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Church Clerk Office</span>
            <h1 className="text-3xl font-black mt-2">Local Sabbath School Portal</h1>
            <p className="text-blue-300 text-sm mt-1">Manage classes, teachers, offerings, and compile weekly attendance reports</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-black px-4 py-3 rounded-2xl transition-all text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Teacher
            </button>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-4 py-3 rounded-2xl transition-all text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Class
            </button>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        {[
          { id: 'overview', label: 'Summary', icon: LayoutDashboard },
          { id: 'teachers', label: 'Teachers', icon: Users },
          { id: 'classes', label: 'Classes', icon: BookOpen },
          { id: 'announcements', label: 'Announcements Feed', icon: Bell },
          { id: 'attendance', label: 'Attendance Records', icon: Calendar },
          { id: 'offerings', label: 'Financial Offerings', icon: DollarSign },
          { id: 'notify', label: 'Broadcaster', icon: Mail }
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

      {/* 1. OVERVIEW / SUMMARY TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Classes', value: classes.length, color: 'bg-blue-950 text-white', icon: '🏫' },
              { label: 'Active Teachers', value: teachers.length, color: 'bg-amber-500 text-blue-950', icon: '👨‍🏫' },
              { label: 'Total Students', value: totalStudents, color: 'bg-white border text-slate-800', icon: '👥' },
              { label: 'Offerings Saved', value: `$${Object.values(offerings).reduce((sum, v) => sum + v, 0).toFixed(0)}`, color: 'bg-emerald-600 text-white', icon: '💰' },
              { label: 'Missing Reports', value: missingReportsCount, color: missingReportsCount > 0 ? 'bg-red-500 text-white' : 'bg-emerald-700 text-white', icon: '📝' }
            ].map((stat, i) => (
              <div key={i} className={`rounded-3xl p-5 shadow-sm ${stat.color}`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-wider opacity-85 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sabbath School Class Report Status (Reports showing missing) */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <AlertCircle className="text-amber-500" />
                  Sabbath School Class Report Status
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Sabbath Date: {lastSabbathStr}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Monitors which classes have submitted or missed their weekly attendance record sheet.
              </p>
              <div className="space-y-3">
                {classReportingStatus.map(cls => {
                  const teacher = teachers.find(t => t.id === cls.teacherId);
                  return (
                    <div key={cls.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <div>
                        <p className="font-bold text-slate-800">{cls.name}</p>
                        <p className="text-xs text-slate-500">Teacher: {teacher?.name || 'Unassigned'} ({cls.language})</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                        cls.submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cls.submitted ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Submitted
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Missing Report
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
                {classes.length === 0 && (
                  <p className="text-slate-400 text-sm italic text-center py-6">No classes registered. Click "Add Class" to create one.</p>
                )}
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-md font-black text-slate-800 mb-4">Attendance Trend</h3>
                <div className="h-48">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="present" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                      No attendance submissions recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEACHERS DIRECTORY TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Teachers Directory</h3>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="bg-blue-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-blue-900 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Teacher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(t => {
              const assigned = classes.find(c => c.id === t.assignedClass);
              return (
                <div key={t.id} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex justify-between items-center hover:bg-slate-50 transition-all">
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.email} • {t.language || 'English'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                        Class: {assigned?.name || 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setReassignTeacherId(t.id);
                        setReassignClassId(t.assignedClass || '');
                        setReassignLang(t.language || 'English');
                        setShowReassignModal(true);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-950"
                      title="Reassign Class"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTeacherId(t.id);
                        setNewPasswordValue('');
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-amber-500"
                      title="Change Password"
                    >
                      <Lock className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete teacher ${t.name}?`)) {
                          removeTeacher(t.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                      title="Remove Teacher"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {teachers.length === 0 && (
              <p className="text-slate-400 text-sm italic py-12 text-center col-span-2">No teachers registered yet.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. CLASSES LIST TAB */}
      {activeTab === 'classes' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Classes Registry</h3>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="bg-blue-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-blue-900 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Class
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map(c => {
              const teacherObj = teachers.find(t => t.id === c.teacherId);
              return (
                <div key={c.id} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col justify-between h-40">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{c.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Language: {c.language}</p>
                    <p className="text-xs text-slate-600 font-semibold mt-2">
                      Teacher: {teacherObj?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400">
                      {c.students?.length || 0} Students
                    </span>
                  </div>
                </div>
              );
            })}
            {classes.length === 0 && (
              <p className="text-slate-400 text-sm italic py-12 text-center col-span-3">No classes registered yet.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="text-amber-500 animate-pulse" />
                  AI Compiled Service Bulletin
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Auto-summarizes all weekly class reports using Google Gemini AI</p>
              </div>
              <button
                onClick={compileAnnouncements}
                disabled={isCompiling}
                className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/10"
              >
                <Sparkles className="w-4 h-4" /> {isCompiling ? 'Generating bulletin...' : 'Compile Bulletins with AI'}
              </button>
            </div>

            {aiSummary && (
              <div className="bg-blue-50 border border-blue-200/50 rounded-2xl p-5 text-sm text-blue-900 whitespace-pre-wrap leading-relaxed shadow-inner mb-6">
                <p className="font-bold mb-2 text-[10px] text-blue-800 uppercase tracking-widest">Compiled Bulletin Output:</p>
                {aiSummary}
              </div>
            )}

            <h3 className="font-black text-slate-800 text-md mb-4 mt-8">Recent Submissions Feed</h3>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-blue-900">{a.teacherName} • {a.className}</span>
                    <span className="text-[10px] text-slate-400">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-slate-700 text-sm">{a.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-slate-400 text-sm italic text-center py-12">No announcements submitted by teachers this week.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ATTENDANCE HISTORY TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">Sabbath Attendance Sheets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b">
                  <th className="p-4">Date</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4 text-center">Roster size</th>
                  <th className="p-4 text-center">Present</th>
                  <th className="p-4 text-center">Absent</th>
                  <th className="p-4 text-center">Visitors</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {attendanceRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-850">{r.date}</td>
                    <td className="p-4 text-slate-700">{r.className}</td>
                    <td className="p-4 text-slate-700">{r.teacherName}</td>
                    <td className="p-4 text-center font-semibold">{r.totalStudents}</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">{r.presentCount}</td>
                    <td className="p-4 text-center text-red-500 font-bold">{r.absentCount}</td>
                    <td className="p-4 text-center text-blue-600 font-bold">{r.visitorCount}</td>
                  </tr>
                ))}
                {attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 italic">No attendance records submitted.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. FINANCIAL OFFERINGS TAB */}
      {activeTab === 'offerings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Form */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-amber-500" /> Save Offering Record
            </h3>
            <form onSubmit={handleSaveOfferings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Weekly Mission Offering</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weeklyMissionInput}
                    onChange={e => setWeeklyMissionInput(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">13th Sabbath Offering</label>
                  <input
                    type="number"
                    step="0.01"
                    value={thirteenthSabbathInput}
                    onChange={e => setThirteenthSabbathInput(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Birthday / Thank Offering</label>
                  <input
                    type="number"
                    step="0.01"
                    value={birthdayThankInput}
                    onChange={e => setBirthdayThankInput(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Sabbath School Investment</label>
                  <input
                    type="number"
                    step="0.01"
                    value={investmentFundInput}
                    onChange={e => setInvestmentFundInput(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {offeringsSavedMsg && (
                <p className="text-xs text-emerald-600 font-bold">{offeringsSavedMsg}</p>
              )}

              <button type="submit" className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all">
                <Save className="w-4 h-4" /> Save Financial Offerings
              </button>
            </form>
          </div>

          {/* Running Totals Overview */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-4">Financial summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Weekly Mission', val: offerings.weeklyMission },
                  { label: '13th Sabbath', val: offerings.thirteenthSabbath },
                  { label: 'Birthday & Thank Offering', val: offerings.birthdayThank },
                  { label: 'Sabbath School Investment', val: offerings.investmentFund }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                    <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                    <span className="font-mono text-lg font-black text-blue-950">${item.val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t mt-6 flex justify-between items-center bg-blue-950 text-white rounded-2xl p-4">
              <span className="text-xs uppercase font-black tracking-wider opacity-80">Total SS Funds</span>
              <span className="text-2xl font-mono font-black">
                ${Object.values(offerings).reduce((sum, v) => sum + v, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. NOTIFY TEACHERS BROADCAST TAB */}
      {activeTab === 'notify' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm max-w-xl mx-auto">
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <Mail className="text-amber-500" /> Broadcaster Reminder
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Broadcast an email notification to all teachers reminding them to complete their class registry files for the upcoming Sabbath.
          </p>
          <form onSubmit={handleSendEmails} className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1">Target Sabbath Date</label>
              <input
                type="date"
                value={notifySabbathDate}
                onChange={e => setNotifySabbathDate(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1">Email message content</label>
              <textarea
                value={notifyMessage}
                onChange={e => setNotifyMessage(e.target.value)}
                rows={4}
                required
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {notifyStatus && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                notifyStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {notifyStatus.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingNotif}
              className="w-full bg-blue-950 hover:bg-blue-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-4 h-4" /> {isSendingNotif ? 'Sending emails...' : 'Broadcast Reminder'}
            </button>
          </form>
        </div>
      )}

      {/* ==================================== MODALS ==================================== */}

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddTeacherModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="text-amber-500" /> Add New Teacher
            </h3>
            <form onSubmit={handleAddTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newTeacherEmail}
                  onChange={e => setNewTeacherEmail(e.target.value)}
                  placeholder="e.g. teacher@church.com"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Temporary Password *</label>
                <input
                  type="password"
                  value={newTeacherPassword}
                  onChange={e => setNewTeacherPassword(e.target.value)}
                  placeholder="e.g. pass123"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Class Assignment</label>
                <select
                  value={newTeacherClassId}
                  onChange={e => setNewTeacherClassId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">-- No Class Assignment --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Language</label>
                <select
                  value={newTeacherLang}
                  onChange={e => setNewTeacherLang(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  {ADULT_LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl text-sm mt-4 hover:bg-blue-900 transition-colors">
                Save Teacher Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="text-amber-500" /> Create New Class
            </h3>
            <form onSubmit={handleAddClassSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Class Name *</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="e.g. Youth Class B"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Instruction Language</label>
                <select
                  value={newClassLang}
                  onChange={e => setNewClassLang(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  {ADULT_LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl text-sm mt-4 hover:bg-blue-900 transition-colors">
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Teacher Class Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowReassignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Edit3 className="text-amber-500" /> Reassign Class &amp; Language
            </h3>
            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Select Class</label>
                <select
                  value={reassignClassId}
                  onChange={e => setReassignClassId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">-- No Class (Unassigned) --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">Instruction Language</label>
                <select
                  value={reassignLang}
                  onChange={e => setReassignLang(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  {ADULT_LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl text-sm mt-4 hover:bg-blue-900 transition-colors">
                Save Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual password change for clerk to reset teacher passwords */}
      {editingTeacherId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingTeacherId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="text-amber-500" /> Reset Teacher Password
            </h3>
            <form onSubmit={handleSaveTeacherPassword} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1">New Password *</label>
                <input
                  type="password"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl text-sm mt-4 hover:bg-blue-900 transition-colors">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Clerk Settings Modal */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={onCloseManage}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black mb-6">Clerk Settings</h2>
            
            <div className="mb-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Lock size={18} /> Reset Password Requests</h3>
              {resetRequests.length === 0 ? (
                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center">No pending reset requests.</p>
              ) : (
                <ul className="space-y-3">
                  {resetRequests.map(req => (
                    <li key={req.id} className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <p className="font-bold text-amber-900 text-sm">{req.name}</p>
                      <p className="text-xs text-amber-700 mb-3">{req.email}</p>
                      <button
                        onClick={() => {
                          const newP = prompt(`Set new password for ${req.name}:`);
                          if (newP) {
                            updateTeacherPassword(req.id, newP);
                            resolveResetRequest(req.id);
                          }
                        }}
                        className="w-full bg-amber-500 text-blue-950 font-black py-2 rounded-lg text-sm hover:bg-amber-600 transition-all"
                      >
                        Resolve &amp; Set Password
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkDashboard;
