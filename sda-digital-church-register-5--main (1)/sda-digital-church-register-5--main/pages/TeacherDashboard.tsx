import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, ClipboardList, Bell, History, User, Plus, Trash2, Edit3, X, Save, Send, Eye, EyeOff, Lock, CheckCircle, ChevronDown, ChevronUp, Calendar, Phone, MapPin, BookOpen, UserPlus } from 'lucide-react';
import { User as UserType, Class, Announcement, AttendanceRecord, Student, Visitor } from '../types.ts';

interface TeacherDashboardProps {
  user: UserType;
  churchClass: Class;
  submitAnnouncement: (announcement: Announcement) => void;
  submitAttendance: (record: AttendanceRecord) => void;
  addStudent: (classId: string, studentData: Omit<Student, 'id' | 'classId'>) => void;
  removeStudent: (classId: string, studentId: string) => void;
  updateStudent: (classId: string, student: Student) => void;
  attendanceRecords: AttendanceRecord[];
  updatePassword: (teacherId: string, newPassword: string) => void;
  isProfileOpen: boolean;
  onCloseProfile: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user, churchClass, submitAnnouncement, submitAttendance, addStudent, removeStudent,
  updateStudent, attendanceRecords, updatePassword, isProfileOpen, onCloseProfile
}) => {
  const [activeTab, setActiveTab] = useState<'attendance'|'announcements'|'roster'|'history'>('attendance');
  const [announcementText, setAnnouncementText] = useState('');
  
  // Basic student attendance state
  const [attendanceState, setAttendanceState] = useState<Record<string, Student['attendanceStatus']>>({});
  
  const handleMark = (id: string, status: Student['attendanceStatus']) => {
    setAttendanceState(prev => ({ ...prev, [id]: status }));
  };

  const handleAttendanceSubmit = () => {
     const record: AttendanceRecord = {
        id: `att_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        classId: churchClass.id,
        className: churchClass.name,
        teacherId: user.id,
        teacherName: user.name,
        totalStudents: churchClass.students.length,
        presentCount: Object.values(attendanceState).filter(s => s === 'present').length,
        absentCount: Object.values(attendanceState).filter(s => s === 'absent').length,
        visitorCount: 0,
        lessonStudyCount: 0,
        records: churchClass.students.map(s => ({ ...s, attendanceStatus: attendanceState[s.id] || 'unmarked' })),
        visitors: []
     };
     submitAttendance(record);
     alert("Attendance submitted successfully!");
  };

  const handleAnnounceSubmit = () => {
    if (!announcementText.trim()) return;
    submitAnnouncement({
      id: `ann_${Date.now()}`,
      teacherId: user.id,
      teacherName: user.name,
      className: churchClass.name,
      content: announcementText,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    setAnnouncementText('');
    alert("Announcement submitted!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-blue-950 text-white rounded-3xl p-6 mb-8 shadow-lg flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-black">Welcome, {user.name}</h1>
            <p className="text-blue-300 text-sm mt-1">Class: {churchClass.name} | Language: {churchClass.language}</p>
         </div>
         <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-amber-400">{new Date().toDateString()}</p>
            <p className="text-xs text-blue-300">Total Students: {churchClass.students.length}</p>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        {(['attendance', 'announcements', 'roster', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-blue-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'attendance' && (
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ClipboardList className="text-amber-500" /> Mark Attendance</h2>
            
            <div className="space-y-4 mb-8">
               {churchClass.students.map(student => (
                 <div key={student.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-xl bg-slate-50 gap-4">
                    <div className="font-bold">{student.name}</div>
                    <div className="flex gap-2 flex-wrap">
                       <button onClick={() => handleMark(student.id, 'present')} className={`px-3 py-1 rounded-full text-xs font-bold ${attendanceState[student.id] === 'present' ? 'bg-emerald-500 text-white' : 'bg-white border text-slate-500'}`}>Present</button>
                       <button onClick={() => handleMark(student.id, 'absent')} className={`px-3 py-1 rounded-full text-xs font-bold ${attendanceState[student.id] === 'absent' ? 'bg-red-500 text-white' : 'bg-white border text-slate-500'}`}>Absent</button>
                       <button onClick={() => handleMark(student.id, 'sick')} className={`px-3 py-1 rounded-full text-xs font-bold ${attendanceState[student.id] === 'sick' ? 'bg-amber-500 text-white' : 'bg-white border text-slate-500'}`}>Sick</button>
                    </div>
                 </div>
               ))}
               {churchClass.students.length === 0 && <p className="text-slate-500 text-sm">No students in roster.</p>}
            </div>

            <button onClick={handleAttendanceSubmit} disabled={churchClass.students.length === 0} className="w-full bg-blue-950 hover:bg-blue-900 text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-all">
               <Save size={20} /> SUBMIT ATTENDANCE
            </button>
         </div>
      )}

      {activeTab === 'announcements' && (
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="text-amber-500" /> Submit Report / Announcement</h2>
            <textarea
               value={announcementText}
               onChange={e => setAnnouncementText(e.target.value)}
               className="w-full border-2 border-slate-200 rounded-xl p-4 min-h-[150px] mb-4 outline-none focus:border-blue-500 transition-colors"
               placeholder="Write your class report, prayer request, or announcement here..."
            />
            <button onClick={handleAnnounceSubmit} className="bg-amber-500 hover:bg-amber-600 text-blue-950 font-black py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
               <Send size={18} /> Submit to Clerk
            </button>
         </div>
      )}

      {activeTab === 'roster' && (
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-amber-500" /> Class Roster</h2>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase"><th className="p-3">Name</th><th className="p-3">Contact</th><th className="p-3">Age/Gender</th><th className="p-3">Baptized</th><th className="p-3">Actions</th></tr></thead>
                  <tbody>
                     {churchClass.students.map(s => (
                        <tr key={s.id} className="border-b border-slate-100 last:border-0">
                           <td className="p-3 font-bold">{s.name}</td>
                           <td className="p-3 text-sm text-slate-600">{s.phone || s.email || 'N/A'}</td>
                           <td className="p-3 text-sm text-slate-600">{s.age || '?'} / {s.gender || '?'}</td>
                           <td className="p-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.baptized ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                 {s.baptized ? 'Yes' : 'No'}
                              </span>
                           </td>
                           <td className="p-3">
                              <button onClick={() => removeStudent(churchClass.id, s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                           </td>
                        </tr>
                     ))}
                     {churchClass.students.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">No students added yet.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'history' && (
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><History className="text-amber-500" /> My Attendance History</h2>
            {attendanceRecords.filter(r => r.teacherId === user.id).length > 0 ? (
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase"><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Present</th><th className="p-3">Absent</th></tr></thead>
                     <tbody>
                        {attendanceRecords.filter(r => r.teacherId === user.id).map(r => (
                           <tr key={r.id} className="border-b border-slate-100 last:border-0">
                              <td className="p-3 font-bold">{r.date}</td>
                              <td className="p-3">{r.totalStudents}</td>
                              <td className="p-3 text-emerald-600 font-bold">{r.presentCount}</td>
                              <td className="p-3 text-red-600">{r.absentCount}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : <p className="text-slate-500">No past records found.</p>}
         </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
               <button onClick={onCloseProfile} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
               <h2 className="text-2xl font-black mb-6">My Profile</h2>
               <div className="space-y-4 mb-6 text-sm">
                  <div><span className="text-slate-500 font-bold block text-xs">NAME</span>{user.name}</div>
                  <div><span className="text-slate-500 font-bold block text-xs">EMAIL</span>{user.email}</div>
                  <div><span className="text-slate-500 font-bold block text-xs">CLASS</span>{churchClass.name}</div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
