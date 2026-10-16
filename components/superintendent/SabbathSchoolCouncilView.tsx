import React, { useState } from 'react';
import { 
  SSCouncilMember, SSAuxiliaryOfficer, SSTeacherCandidate, 
  SSTeachersMeeting, ChurchMember, User, Class 
} from '../../types';
import { ADULT_LANGUAGES } from '../../constants';
import { 
  Users, UserPlus, CheckCircle2, AlertCircle, ShieldCheck, 
  Calendar, Award, BookOpen, Clock, Plus, X, Search, 
  Filter, Check, ChevronRight, FileCheck, HelpCircle,
  Edit2, Trash2, Printer, MapPin, Mail, Phone, LayoutGrid,
  Table as TableIcon, Shield, UserCheck, Sparkles, Key,
  FileDown, Copy, Eye, EyeOff, Book, Lock, RefreshCw, Settings
} from 'lucide-react';

interface SabbathSchoolCouncilViewProps {
  councilMembers: SSCouncilMember[];
  auxiliaryOfficers: SSAuxiliaryOfficer[];
  onAddAuxiliaryOfficer: (officer: Omit<SSAuxiliaryOfficer, 'id'>) => void;
  teacherCandidates: SSTeacherCandidate[];
  onUpdateTeacherCandidate: (id: string, updates: Partial<SSTeacherCandidate>) => void;
  onAddTeacherCandidate: (candidate: Omit<SSTeacherCandidate, 'id'>) => void;
  onDeleteTeacherCandidate?: (id: string) => void;
  teachersMeetings: SSTeachersMeeting[];
  onAddTeachersMeeting: (meeting: Omit<SSTeachersMeeting, 'id'>) => void;
  churchMembers: ChurchMember[];
  teachers?: User[];
  classes?: Class[];
  onAddTeacher?: (name: string, email: string, password: string, classId: string, language?: string) => void;
  onUpdateTeacher?: (teacherId: string, updates: Partial<User>) => void;
  onDeleteTeacher?: (teacherId: string) => void;
  onUpdatePassword?: (userId: string, newPassword: string) => void;
}

export const SabbathSchoolCouncilView: React.FC<SabbathSchoolCouncilViewProps> = ({
  councilMembers,
  auxiliaryOfficers,
  onAddAuxiliaryOfficer,
  teacherCandidates,
  onUpdateTeacherCandidate,
  onAddTeacherCandidate,
  onDeleteTeacherCandidate,
  teachersMeetings,
  onAddTeachersMeeting,
  churchMembers,
  teachers = [],
  classes = [],
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onUpdatePassword
}) => {
  const [activeTab, setActiveTab] = useState<'council' | 'auxiliary' | 'teachers' | 'meetings' | 'credentials'>('teachers');

  // Modals state
  const [isAddAuxModalOpen, setIsAddAuxModalOpen] = useState(false);
  const [auxName, setAuxName] = useState('');
  const [auxRole, setAuxRole] = useState<SSAuxiliaryOfficer['roleTitle']>('Pianist');
  const [auxDivision, setAuxDivision] = useState<SSAuxiliaryOfficer['division']>('General Sabbath School');
  const [auxContact, setAuxContact] = useState('');

  // Add Teacher Modal state
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [teacherDivision, setTeacherDivision] = useState<SSTeacherCandidate['division']>('Adult');
  const [teacherClass, setTeacherClass] = useState('');
  const [teacherLocation, setTeacherLocation] = useState('');
  const [teacherAssistant, setTeacherAssistant] = useState('');
  const [isStandingVerified, setIsStandingVerified] = useState(true);
  const [isDivisionConsulted, setIsDivisionConsulted] = useState(true);
  const [teacherContact, setTeacherContact] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherStudyGuide, setTeacherStudyGuide] = useState('Adult Teachers Edition');
  const [teacherSafetyCertified, setTeacherSafetyCertified] = useState(false);
  const [teacherSafetyExpiry, setTeacherSafetyExpiry] = useState('');
  const [teacherYearsOfService, setTeacherYearsOfService] = useState(1);
  const [teacherNotes, setTeacherNotes] = useState('');

  // Edit Teacher Modal State
  const [teacherToEdit, setTeacherToEdit] = useState<SSTeacherCandidate | null>(null);
  const [editName, setEditName] = useState('');
  const [editDivision, setEditDivision] = useState<SSTeacherCandidate['division']>('Adult');
  const [editClass, setEditClass] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAssistant, setEditAssistant] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStanding, setEditStanding] = useState(true);
  const [editDivisionConsulted, setEditDivisionConsulted] = useState(true);
  const [editBoardStatus, setEditBoardStatus] = useState<SSTeacherCandidate['boardApprovalStatus']>('council_recommended');
  const [editBoardResolution, setEditBoardResolution] = useState('');
  const [editBoardDate, setEditBoardDate] = useState('');
  const [editAttendanceRate, setEditAttendanceRate] = useState(90);
  const [editSafetyCertified, setEditSafetyCertified] = useState(false);
  const [editSafetyExpiry, setEditSafetyExpiry] = useState('');
  const [editYearsOfService, setEditYearsOfService] = useState(1);
  const [editStudyGuideAssigned, setEditStudyGuideAssigned] = useState('Adult Teachers Edition');
  const [editStatus, setEditStatus] = useState<NonNullable<SSTeacherCandidate['status']>>('active');
  const [editNotes, setEditNotes] = useState('');

  // Delete Teacher State
  const [teacherToDelete, setTeacherToDelete] = useState<SSTeacherCandidate | null>(null);
  const [isTeacherDirectoryModalOpen, setIsTeacherDirectoryModalOpen] = useState(false);

  // Add Teachers Meeting Modal state
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [tmLessonNo, setTmLessonNo] = useState(11);
  const [tmLessonTitle, setTmLessonTitle] = useState('');
  const [tmLeader, setTmLeader] = useState('Sister R. Simpasa (Superintendent)');
  const [tmDoctrinalFocus, setTmDoctrinalFocus] = useState('');
  const [tmPedagogy, setTmPedagogy] = useState('');
  const [tmAttendees, setTmAttendees] = useState<string[]>([]);

  // Board Approval Modal
  const [selectedForBoard, setSelectedForBoard] = useState<SSTeacherCandidate | null>(null);
  const [boardResolutionNo, setBoardResolutionNo] = useState('RES-2026-');
  const [boardVoteDate, setBoardVoteDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters & View Mode
  const [teacherSearch, setTeacherSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teacherViewMode, setTeacherViewMode] = useState<'cards' | 'table'>('cards');

  const filteredTeachers = teacherCandidates.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
      (t.assignedClassName && t.assignedClassName.toLowerCase().includes(teacherSearch.toLowerCase())) ||
      (t.classroomLocation && t.classroomLocation.toLowerCase().includes(teacherSearch.toLowerCase())) ||
      (t.assistantTeacherName && t.assistantTeacherName.toLowerCase().includes(teacherSearch.toLowerCase()));
    
    const matchesDiv = divisionFilter === 'all' || t.division === divisionFilter;
    const matchesStatus = statusFilter === 'all' || (t.status || 'active') === statusFilter;
    return matchesSearch && matchesDiv && matchesStatus;
  });

  // Teacher Portal credentials management state
  const [portalSearch, setPortalSearch] = useState('');
  const [portalClassFilter, setPortalClassFilter] = useState('all');
  const [showPortalPasswords, setShowPortalPasswords] = useState<Record<string, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState<Record<string, boolean>>({});

  // Authorize Teacher Portal Access Modal
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);
  const [authTeacherName, setAuthTeacherName] = useState('');
  const [authTeacherEmail, setAuthTeacherEmail] = useState('');
  const [authTeacherPassword, setAuthTeacherPassword] = useState('');
  const [authClassId, setAuthClassId] = useState('');
  const [authLanguage, setAuthLanguage] = useState('English');
  const [selectedCandidateIdForAuth, setSelectedCandidateIdForAuth] = useState('');

  // Edit Portal Credentials Modal
  const [isEditPortalModalOpen, setIsEditPortalModalOpen] = useState(false);
  const [editingPortalTeacher, setEditingPortalTeacher] = useState<User | null>(null);
  const [editPortalName, setEditPortalName] = useState('');
  const [editPortalEmail, setEditPortalEmail] = useState('');
  const [editPortalPassword, setEditPortalPassword] = useState('');
  const [editPortalClassId, setEditPortalClassId] = useState('');
  const [editPortalLanguage, setEditPortalLanguage] = useState('English');

  // Revoke Portal Access Modal
  const [deletingPortalTeacher, setDeletingPortalTeacher] = useState<User | null>(null);

  const filteredPortalTeachers = (teachers || []).filter(t => {
    const assignedClass = classes.find(c => c.id === t.assignedClass);
    const matchesSearch = 
      t.name.toLowerCase().includes(portalSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(portalSearch.toLowerCase()) ||
      (assignedClass && assignedClass.name.toLowerCase().includes(portalSearch.toLowerCase()));
    const matchesClass = portalClassFilter === 'all' || t.assignedClass === portalClassFilter;
    return matchesSearch && matchesClass;
  });

  const handleExportCredentialsCsv = () => {
    const headers = 'Teacher Name,Email / Username,Database Security Key (Password),Assigned Class,Language Hub\n';
    const rows = (teachers || []).map(t => {
      const cls = classes.find(c => c.id === t.assignedClass);
      return `"${t.name}","${t.email}","${t.password || ''}","${cls?.name || 'Unassigned'}","${t.language || 'English'}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabbath_school_teacher_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleAutoCreateEmail = (name: string) => {
    if (!name.trim()) return '';
    const clean = name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '.');
    return `${clean}@church.org`;
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = 'Tch!';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleOpenAuthorizeForCandidate = (candidate: SSTeacherCandidate) => {
    setAuthTeacherName(candidate.name);
    const member = churchMembers.find(m => m.id === candidate.memberId);
    const existingEmail = candidate.email || member?.email;
    const autoEmail = handleAutoCreateEmail(candidate.name);
    setAuthTeacherEmail(existingEmail || autoEmail);
    setAuthTeacherPassword(handleGeneratePassword());

    const matchedClass = classes.find(c => 
      (candidate.assignedClassName && c.name.toLowerCase().includes(candidate.assignedClassName.toLowerCase())) ||
      c.name.toLowerCase().includes(candidate.division.toLowerCase())
    ) || classes[0];

    if (matchedClass) {
      setAuthClassId(matchedClass.id);
      setAuthLanguage(matchedClass.language || 'English');
    } else if (classes.length > 0) {
      setAuthClassId(classes[0].id);
      setAuthLanguage(classes[0].language || 'English');
    }
    setSelectedCandidateIdForAuth(candidate.id);
    setIsAuthorizeModalOpen(true);
  };

  const handleAuthorizeTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authTeacherName.trim() || !authTeacherEmail.trim() || !authTeacherPassword.trim() || !authClassId) return;
    if (onAddTeacher) {
      onAddTeacher(authTeacherName.trim(), authTeacherEmail.trim(), authTeacherPassword.trim(), authClassId, authLanguage || undefined);
    }
    setAuthTeacherName('');
    setAuthTeacherEmail('');
    setAuthTeacherPassword('');
    setAuthClassId('');
    setAuthLanguage('English');
    setSelectedCandidateIdForAuth('');
    setIsAuthorizeModalOpen(false);
  };

  const handleOpenEditPortal = (t: User) => {
    setEditingPortalTeacher(t);
    setEditPortalName(t.name);
    setEditPortalEmail(t.email);
    setEditPortalPassword(t.password || '');
    setEditPortalClassId(t.assignedClass || (classes[0]?.id || ''));
    setEditPortalLanguage(t.language || 'English');
    setIsEditPortalModalOpen(true);
  };

  const handleSavePortalEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPortalTeacher) return;
    if (onUpdateTeacher) {
      onUpdateTeacher(editingPortalTeacher.id, {
        name: editPortalName.trim(),
        email: editPortalEmail.trim(),
        password: editPortalPassword.trim(),
        assignedClass: editPortalClassId,
        language: editPortalLanguage || undefined
      });
    }
    if (onUpdatePassword && editPortalPassword.trim() !== editingPortalTeacher.password) {
      onUpdatePassword(editingPortalTeacher.id, editPortalPassword.trim());
    }
    setIsEditPortalModalOpen(false);
    setEditingPortalTeacher(null);
  };

  const handleConfirmRevoke = () => {
    if (!deletingPortalTeacher) return;
    if (onDeleteTeacher) {
      onDeleteTeacher(deletingPortalTeacher.id);
    }
    setDeletingPortalTeacher(null);
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopyFeedback(prev => ({ ...prev, [key]: false })), 2000);
  };

  const handleOpenEditTeacher = (teacher: SSTeacherCandidate) => {
    setTeacherToEdit(teacher);
    setEditName(teacher.name);
    setEditDivision(teacher.division);
    setEditClass(teacher.assignedClassName || '');
    setEditLocation(teacher.classroomLocation || '');
    setEditAssistant(teacher.assistantTeacherName || '');
    setEditPhone(teacher.contact || '');
    setEditEmail(teacher.email || '');
    setEditStanding(teacher.isMemberInRegularStanding);
    setEditDivisionConsulted(teacher.divisionLeaderConsulted);
    setEditBoardStatus(teacher.boardApprovalStatus);
    setEditBoardResolution(teacher.boardResolutionNumber || '');
    setEditBoardDate(teacher.boardVoteDate || '');
    setEditAttendanceRate(teacher.teachersMeetingAttendanceRate);
    setEditSafetyCertified(teacher.childSafetyCertified ?? false);
    setEditSafetyExpiry(teacher.childSafetyExpiryDate || '');
    setEditYearsOfService(teacher.yearsOfService ?? 1);
    setEditStudyGuideAssigned(teacher.studyGuideAssigned || 'Adult Teachers Edition');
    setEditStatus(teacher.status || 'active');
    setEditNotes(teacher.notes || '');
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherToEdit || !editName.trim()) return;

    onUpdateTeacherCandidate(teacherToEdit.id, {
      name: editName.trim(),
      division: editDivision,
      assignedClassName: editClass.trim() || `${editDivision} Sabbath School Unit`,
      classroomLocation: editLocation.trim() || undefined,
      assistantTeacherName: editAssistant.trim() || undefined,
      contact: editPhone.trim(),
      email: editEmail.trim() || undefined,
      isMemberInRegularStanding: editStanding,
      divisionLeaderConsulted: editDivisionConsulted,
      boardApprovalStatus: editBoardStatus,
      boardResolutionNumber: editBoardResolution.trim() || undefined,
      boardVoteDate: editBoardDate || undefined,
      teachersMeetingAttendanceRate: editAttendanceRate,
      childSafetyCertified: editSafetyCertified,
      childSafetyExpiryDate: editSafetyExpiry || undefined,
      yearsOfService: editYearsOfService,
      studyGuideAssigned: editStudyGuideAssigned.trim() || undefined,
      status: editStatus,
      notes: editNotes.trim() || undefined
    });

    setTeacherToEdit(null);
  };

  const handleCreateAuxiliary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auxName.trim()) return;
    onAddAuxiliaryOfficer({
      churchId: 'admin-initial',
      name: auxName.trim(),
      roleTitle: auxRole,
      division: auxDivision,
      contact: auxContact.trim() || '+260',
      councilAppointedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setAuxName('');
    setAuxContact('');
    setIsAddAuxModalOpen(false);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const member = churchMembers.find(m => m.id === selectedMemberId);
    if (!member) return;

    onAddTeacherCandidate({
      churchId: 'admin-initial',
      memberId: member.id,
      name: member.name,
      division: teacherDivision,
      assignedClassName: teacherClass.trim() || `${teacherDivision} Sabbath School Unit`,
      classroomLocation: teacherLocation.trim() || undefined,
      assistantTeacherName: teacherAssistant.trim() || undefined,
      isMemberInRegularStanding: member.status === 'active' && isStandingVerified,
      divisionLeaderConsulted: isDivisionConsulted,
      boardApprovalStatus: 'council_recommended',
      teachersMeetingAttendanceRate: 85,
      contact: teacherContact.trim() || member.contact || '+260',
      email: teacherEmail.trim() || member.email || undefined,
      childSafetyCertified: teacherSafetyCertified,
      childSafetyExpiryDate: teacherSafetyCertified && teacherSafetyExpiry ? teacherSafetyExpiry : undefined,
      yearsOfService: teacherYearsOfService,
      studyGuideAssigned: teacherStudyGuide.trim() || undefined,
      status: 'active',
      notes: teacherNotes.trim()
    });

    setSelectedMemberId('');
    setTeacherClass('');
    setTeacherLocation('');
    setTeacherAssistant('');
    setTeacherContact('');
    setTeacherEmail('');
    setTeacherSafetyCertified(false);
    setTeacherSafetyExpiry('');
    setTeacherYearsOfService(1);
    setTeacherNotes('');
    setIsAddTeacherModalOpen(false);
  };

  const handleConfirmBoardApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForBoard) return;
    onUpdateTeacherCandidate(selectedForBoard.id, {
      boardApprovalStatus: 'board_approved',
      boardResolutionNumber: boardResolutionNo.trim(),
      boardVoteDate: boardVoteDate
    });
    setSelectedForBoard(null);
  };

  const handleCreateTeachersMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmLessonTitle.trim()) return;
    onAddTeachersMeeting({
      churchId: 'admin-initial',
      date: new Date().toISOString().split('T')[0],
      lessonNumber: tmLessonNo,
      lessonTitle: tmLessonTitle.trim(),
      leaderName: tmLeader.trim(),
      attendees: tmAttendees.length > 0 ? tmAttendees : teacherCandidates.filter(t => t.boardApprovalStatus === 'board_approved').map(t => t.name),
      doctrinalFocus: tmDoctrinalFocus.trim(),
      teachingPedagogyHelps: tmPedagogy.trim()
    });
    setTmLessonTitle('');
    setTmDoctrinalFocus('');
    setTmPedagogy('');
    setIsAddMeetingModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Teacher Selection & Quality Control ({teacherCandidates.length})
        </button>

        <button
          onClick={() => setActiveTab('council')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'council'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          Sabbath School Council ({councilMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('auxiliary')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'auxiliary'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Auxiliary Officer Appointments ({auxiliaryOfficers.length})
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'meetings'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          Weekly Teachers' Preparation Meetings ({teachersMeetings.length})
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'credentials'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4 text-amber-400" />
          Teacher Portal Access & Credentials ({teachers.length})
        </button>
      </div>

      {/* TAB 1: TEACHER SELECTION & QUALITY CONTROL */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                SDA Church Manual Mandate
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Teacher Selection & Quality Control</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent leads the council in carefully choosing Sabbath School teachers. 
                Because teaching quality is vital to maintaining curriculum integrity, the superintendent must ensure that teachers are church members in regular standing. 
                These names are then submitted to the church board for final approval. When choosing teachers for children’s divisions, the superintendent and council must specifically consult with the division leaders."
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsTeacherDirectoryModalOpen(true)}
                className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-black rounded-2xl flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                Print Teacher Directory
              </button>
              <button
                onClick={() => setIsAddTeacherModalOpen(true)}
                className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                Vet & Add Teacher Candidate
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Teachers</span>
              <span className="text-xl font-black text-slate-900">{teacherCandidates.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Standing Verified</span>
              <span className="text-xl font-black text-emerald-700">
                {teacherCandidates.filter(t => t.isMemberInRegularStanding).length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Board Approved</span>
              <span className="text-xl font-black text-blue-950">
                {teacherCandidates.filter(t => t.boardApprovalStatus === 'board_approved').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Pending Board</span>
              <span className="text-xl font-black text-amber-600">
                {teacherCandidates.filter(t => t.boardApprovalStatus === 'council_recommended').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Safety Certified</span>
              <span className="text-xl font-black text-purple-700">
                {teacherCandidates.filter(t => t.childSafetyCertified).length}
              </span>
            </div>
          </div>

          {/* Filters, Search & View Switcher */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Search by name, class, room location, or assistant..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-900"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Div:</span>
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="all">All Divisions</option>
                  <option value="Adult">Adult</option>
                  <option value="Youth">Youth</option>
                  <option value="Earliteen">Earliteen</option>
                  <option value="Junior">Junior</option>
                  <option value="Primary">Primary</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Cradle Roll">Cradle Roll</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="substitute">Substitute</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 ml-auto md:ml-2">
                <button
                  onClick={() => setTeacherViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all ${
                    teacherViewMode === 'cards' ? 'bg-white shadow-xs text-blue-950 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTeacherViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    teacherViewMode === 'table' ? 'bg-white shadow-xs text-blue-950 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TABLE VIEW MODE */}
          {teacherViewMode === 'table' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Teacher</th>
                      <th className="py-3 px-4">Division & Class</th>
                      <th className="py-3 px-4">Classroom Location</th>
                      <th className="py-3 px-4">Assistant</th>
                      <th className="py-3 px-4 text-center">Standing</th>
                      <th className="py-3 px-4 text-center">Safety Cert</th>
                      <th className="py-3 px-4 text-center">Attendance</th>
                      <th className="py-3 px-4 text-center">Board Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{teacher.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {teacher.contact && <span>{teacher.contact}</span>}
                            {teacher.status && (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                teacher.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                teacher.status === 'on_leave' ? 'bg-amber-100 text-amber-800' :
                                teacher.status === 'substitute' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {teacher.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{teacher.assignedClassName || 'Unit Pending'}</span>
                          <span className="text-[10px] font-medium text-slate-500">{teacher.division}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {teacher.classroomLocation ? (
                            <span className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {teacher.classroomLocation}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not set</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {teacher.assistantTeacherName ? (
                            <span className="text-[11px] font-medium text-slate-700">
                              {teacher.assistantTeacherName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {teacher.isMemberInRegularStanding ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Regular
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {teacher.childSafetyCertified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full" title={teacher.childSafetyExpiryDate ? `Exp: ${teacher.childSafetyExpiryDate}` : 'Certified'}>
                              <Shield className="w-3 h-3 text-purple-600" />
                              Certified
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {teacher.teachersMeetingAttendanceRate}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          {teacher.boardApprovalStatus === 'board_approved' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          ) : teacher.boardApprovalStatus === 'council_recommended' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Recommended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {teachers.some(t => t.email.toLowerCase() === (teacher.email || '').toLowerCase() || t.name.toLowerCase() === teacher.name.toLowerCase()) ? (
                              <button
                                onClick={() => {
                                  setPortalSearch(teacher.name);
                                  setActiveTab('credentials');
                                }}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors"
                                title="Portal Active - Click to View Credentials"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAuthorizeForCandidate(teacher)}
                                className="p-1.5 hover:bg-amber-100 bg-amber-50 text-amber-900 rounded-lg transition-colors"
                                title="Grant Teacher Portal Access"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditTeacher(teacher)}
                              className="p-1.5 hover:bg-blue-50 text-blue-900 rounded-lg transition-colors"
                              title="Edit Teacher Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteTeacherCandidate && (
                              <button
                                onClick={() => setTeacherToDelete(teacher)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                title="Remove Teacher"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Teacher Roster Cards */}
          {teacherViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-blue-200 transition-all space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {teacher.division} Division
                        </span>
                        {teacher.status && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            teacher.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            teacher.status === 'on_leave' ? 'bg-amber-100 text-amber-800' :
                            teacher.status === 'substitute' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {teacher.status.replace('_', ' ')}
                          </span>
                        )}
                        {teacher.yearsOfService && (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                            <Award className="w-3 h-3 text-amber-500" />
                            {teacher.yearsOfService}y exp
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">{teacher.name}</h3>
                      <p className="text-xs text-slate-600 font-bold">{teacher.assignedClassName || 'Class Assignment Pending'}</p>
                    </div>

                    <div className="text-right">
                      {teacher.boardApprovalStatus === 'board_approved' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Board Voted
                        </span>
                      ) : teacher.boardApprovalStatus === 'council_recommended' ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Council Recommended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                          Draft Candidate
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Details Grid: Classroom, Assistant, Contact, Study Guide */}
                  <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-slate-500">Room:</span>
                      <span className="font-bold text-slate-800 truncate">
                        {teacher.classroomLocation || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="text-slate-500">Assistant:</span>
                      <span className="font-bold text-slate-800 truncate">
                        {teacher.assistantTeacherName || 'None'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-500">Contact:</span>
                      <span className="font-bold text-slate-800 truncate">
                        {teacher.contact || 'No phone'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-slate-500">Guide:</span>
                      <span className="font-bold text-slate-800 truncate" title={teacher.studyGuideAssigned}>
                        {teacher.studyGuideAssigned || 'Adult Teachers Edition'}
                      </span>
                    </div>
                  </div>

                  {/* Mandate Compliance & Safety Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-xl flex items-center gap-2 ${
                      teacher.isMemberInRegularStanding ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                    }`}>
                      {teacher.isMemberInRegularStanding ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold">
                        {teacher.isMemberInRegularStanding ? 'Member in Regular Standing' : 'Standing Not Confirmed'}
                      </span>
                    </div>

                    <div className={`p-2 rounded-xl flex items-center gap-2 ${
                      teacher.divisionLeaderConsulted ? 'bg-blue-50 text-blue-900' : 'bg-amber-50 text-amber-900'
                    }`}>
                      <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-[11px] font-bold">
                        {teacher.divisionLeaderConsulted ? 'Division Leader Consulted' : 'Consultation Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Child Safety Certification if applicable */}
                  {teacher.childSafetyCertified && (
                    <div className="p-2 bg-purple-50 text-purple-900 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-bold text-[11px]">Child Safety Protection Certified</span>
                      </div>
                      {teacher.childSafetyExpiryDate && (
                        <span className="text-[10px] text-purple-700 font-semibold">
                          Exp: {teacher.childSafetyExpiryDate}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Teachers Meeting Attendance */}
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-bold">Teachers Prep Meeting Attendance:</span>
                    <span className="font-black text-slate-900">{teacher.teachersMeetingAttendanceRate}%</span>
                  </div>

                  {teacher.boardResolutionNumber && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex justify-between items-center">
                      <span>Minute Vote: <strong className="text-slate-800">{teacher.boardResolutionNumber}</strong></span>
                      <span>Date: {teacher.boardVoteDate}</span>
                    </div>
                  )}

                  {teacher.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-xl">
                      "{teacher.notes}"
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditTeacher(teacher)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-950 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Details
                      </button>
                      {onDeleteTeacherCandidate && (
                        <button
                          onClick={() => setTeacherToDelete(teacher)}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                          title="Remove Teacher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {teacher.boardApprovalStatus === 'council_recommended' && (
                        <button
                          onClick={() => {
                            setSelectedForBoard(teacher);
                            setBoardResolutionNo(`RES-2026-0${Math.floor(10 + Math.random() * 80)}`);
                          }}
                          className="px-3 py-1.5 bg-blue-950 text-white rounded-xl text-xs font-black hover:bg-black transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          Record Board Approval Vote
                        </button>
                      )}

                      {teacher.boardApprovalStatus === 'draft_selection' && teacher.isMemberInRegularStanding && (
                        <button
                          onClick={() => onUpdateTeacherCandidate(teacher.id, { boardApprovalStatus: 'council_recommended' })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-950 hover:text-white rounded-xl text-xs font-black transition-all"
                        >
                          Recommend to Church Board
                        </button>
                      )}

                      {teachers.some(t => t.email.toLowerCase() === (teacher.email || '').toLowerCase() || t.name.toLowerCase() === teacher.name.toLowerCase()) ? (
                        <button
                          onClick={() => {
                            setPortalSearch(teacher.name);
                            setActiveTab('credentials');
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                          title="View Portal Credentials"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          Portal Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAuthorizeForCandidate(teacher)}
                          className="px-3 py-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
                          title="Grant Portal Login & Security Key"
                        >
                          <Key className="w-3.5 h-3.5" />
                          Grant Portal Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SABBATH SCHOOL COUNCIL */}
      {activeTab === 'council' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Chief Administrative Body
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Sabbath School Council Coordination</h2>
            <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
              "The superintendent coordinates a diverse council consisting of assistant superintendents, the secretary and assistant secretaries, division leaders, the Investment secretary, the Personal Ministries leader, the Children’s Ministries coordinator (or VBS director), an appointed elder, and the local pastor."
            </p>
          </div>

          {/* Council Members Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Council Roster (Voting Members)</span>
              <span className="text-xs font-bold text-slate-500">Term: 2026 - 2027</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Mandated Council Role</th>
                    <th className="py-3 px-4">Departmental Scope</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {councilMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        {member.name}
                        {member.roleTitle === 'Superintendent' && (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                            Chair
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-950">{member.roleTitle}</td>
                      <td className="py-3.5 px-4 text-slate-600">{member.divisionScope || 'General'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{member.contact}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                          Voting Member
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

      {/* TAB 3: AUXILIARY APPOINTMENTS */}
      {activeTab === 'auxiliary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Council Staffing Authority
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Non-Council Auxiliary Officers</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "As soon as possible after election, the superintendent must call a council meeting to appoint auxiliary officers who do not sit on the council. 
                These include assistant division leaders, division secretaries, music directors, pianists, organists, and greeters."
              </p>
            </div>
            <button
              onClick={() => setIsAddAuxModalOpen(true)}
              className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Appoint Auxiliary Officer
            </button>
          </div>

          {/* Auxiliary Officers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {auxiliaryOfficers.map((officer) => (
              <div key={officer.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                    {officer.roleTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Appointed {officer.councilAppointedDate}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{officer.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{officer.division}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-mono text-[11px] text-slate-600">{officer.contact}</span>
                  <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                    Council Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEEKLY TEACHERS' PREPARATION MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                Scripture & Doctrinal Unity
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Weekly Teachers' Preparation Meetings</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent strongly encourages weekly teachers' meetings and the daily use of age-level Sabbath School Bible study guides to maintain unity of doctrine."
              </p>
            </div>
            <button
              onClick={() => setIsAddMeetingModalOpen(true)}
              className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Log Teachers' Meeting
            </button>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {teachersMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-100 text-purple-900 font-black rounded-2xl flex items-center justify-center text-sm">
                      #{meeting.lessonNumber}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{meeting.lessonTitle}</h3>
                      <p className="text-xs text-slate-500 font-medium">Conducted on {meeting.date} • Led by {meeting.leaderName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-purple-50 text-purple-900 px-3 py-1 rounded-full">
                    {meeting.attendees.length} Teachers in Attendance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Doctrinal Focus & Theological Alignment</span>
                    <p className="text-slate-800 font-medium leading-relaxed">{meeting.doctrinalFocus}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Teaching Pedagogy & Class Interaction Helps</span>
                    <p className="text-slate-800 font-medium leading-relaxed">{meeting.teachingPedagogyHelps}</p>
                  </div>
                </div>

                {/* Attendees list */}
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Verified Teachers Present:</span>
                  <div className="flex flex-wrap gap-2">
                    {meeting.attendees.map((attendee, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TEACHER PORTAL ACCESS & CREDENTIALS (SUPERINTENDENT EXCLUSIVE AUTHORITY) */}
      {activeTab === 'credentials' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Official Authority Notice */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SDA Church Manual Exclusive Authority (pp. 98–99)
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Teacher Appointments & Digital Register Access
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The appointment of Sabbath School teachers and issuance of portal credentials is the sole prerogative of the Sabbath School Superintendent and Council. The Church Clerk maintains general church registers, while teacher portal access is administered directly here.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportCredentialsCsv}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-2 backdrop-blur-sm transition-all"
                >
                  <FileDown className="w-4 h-4 text-amber-400" />
                  Export Credentials CSV
                </button>
                <button
                  onClick={() => {
                    setAuthTeacherName('');
                    setAuthTeacherEmail('');
                    setAuthTeacherPassword(handleGeneratePassword());
                    setAuthClassId(classes[0]?.id || '');
                    setAuthLanguage(classes[0]?.language || 'English');
                    setSelectedCandidateIdForAuth('');
                    setIsAuthorizeModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Authorize New Teacher
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Authorized Teachers</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{teachers.length}</span>
                <span className="text-[11px] font-bold text-emerald-600">Active</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Sabbath School Classes</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-950">{classes.length}</span>
                <span className="text-[11px] font-medium text-slate-500">Units</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Language Hubs</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-900">
                  {Array.from(new Set(teachers.map(t => t.language || 'English'))).length}
                </span>
                <span className="text-[11px] font-medium text-slate-500">Dialects</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Security Keys Synced</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {teachers.filter(t => !!t.password).length}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">Encrypted</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={portalSearch}
                onChange={(e) => setPortalSearch(e.target.value)}
                placeholder="Search teacher by name, email, or unit..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={portalClassFilter}
                onChange={(e) => setPortalClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Sabbath School Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Credentials Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Authorized Teacher</th>
                    <th className="py-3.5 px-4">Institutional Login / Email</th>
                    <th className="py-3.5 px-4">Database Security Key</th>
                    <th className="py-3.5 px-4">Class Registry Assignment</th>
                    <th className="py-3.5 px-4">Language Hub</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Superintendent Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPortalTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Key className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold">No authorized teachers found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPortalTeachers.map((teacher) => {
                      const assignedCls = classes.find(c => c.id === teacher.assignedClass);
                      const isPwdShown = showPortalPasswords[teacher.id];
                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {teacher.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900">{teacher.name}</p>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {teacher.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              <span className="font-mono text-slate-800 text-xs">{teacher.email}</span>
                              <button
                                onClick={() => copyToClipboard(teacher.id + '-email', teacher.email)}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                                title="Copy Email"
                              >
                                {copyFeedback[teacher.id + '-email'] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-2 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <span className="font-mono text-amber-950 text-xs">
                                {isPwdShown ? (teacher.password || '••••••••') : '••••••••'}
                              </span>
                              <button
                                onClick={() => setShowPortalPasswords(prev => ({ ...prev, [teacher.id]: !prev[teacher.id] }))}
                                className="text-amber-700 hover:text-amber-900 transition-colors"
                                title={isPwdShown ? "Hide Password" : "Show Password"}
                              >
                                {isPwdShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(teacher.id + '-pwd', teacher.password || '')}
                                className="text-amber-700 hover:text-amber-900 transition-colors"
                                title="Copy Password"
                              >
                                {copyFeedback[teacher.id + '-pwd'] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {assignedCls ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold text-xs">
                                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                                {assignedCls.name}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-medium">Unassigned</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {teacher.language || 'English'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Authorized
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditPortal(teacher)}
                                className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                                title="Edit Teacher Credentials & Class Assignment"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingPortalTeacher(teacher)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                title="Revoke Teacher Portal Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD AUXILIARY OFFICER */}
      {isAddAuxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Appoint Auxiliary Officer</h3>
              <button 
                onClick={() => setIsAddAuxModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuxiliary} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Officer Name
                </label>
                <input
                  type="text"
                  required
                  value={auxName}
                  onChange={(e) => setAuxName(e.target.value)}
                  placeholder="e.g. Sister Grace Mwila"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Auxiliary Role (Church Manual pg 99)
                </label>
                <select
                  value={auxRole}
                  onChange={(e) => setAuxRole(e.target.value as SSAuxiliaryOfficer['roleTitle'])}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="Pianist">Pianist</option>
                  <option value="Organist">Organist</option>
                  <option value="Music Director">Music Director</option>
                  <option value="Greeter / Hostess">Greeter / Hostess</option>
                  <option value="Hospitality Coordinator">Hospitality Coordinator</option>
                  <option value="Assistant Division Leader">Assistant Division Leader</option>
                  <option value="Division Secretary">Division Secretary</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Assigned Division
                </label>
                <select
                  value={auxDivision}
                  onChange={(e) => setAuxDivision(e.target.value as SSAuxiliaryOfficer['division'])}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="General Sabbath School">General Sabbath School</option>
                  <option value="Adult Division">Adult Division</option>
                  <option value="Youth Division">Youth Division</option>
                  <option value="Earliteen">Earliteen</option>
                  <option value="Junior">Junior</option>
                  <option value="Primary">Primary</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Cradle Roll">Cradle Roll</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Phone / Contact
                </label>
                <input
                  type="text"
                  value={auxContact}
                  onChange={(e) => setAuxContact(e.target.value)}
                  placeholder="+260 977 000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAuxModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black"
                >
                  Appoint Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/VET TEACHER CANDIDATE */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Vet & Appoint Sabbath School Teacher</h3>
                <p className="text-xs text-slate-500 font-medium">Record and manage complete teacher candidate details</p>
              </div>
              <button 
                onClick={() => setIsAddTeacherModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Select Church Member (Standing Audit) *
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    const m = churchMembers.find(mem => mem.id === e.target.value);
                    if (m) {
                      setIsStandingVerified(m.status === 'active');
                      setTeacherContact(m.contact || '');
                      setTeacherEmail(m.email || '');
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">-- Choose Member from Church Register --</option>
                  {churchMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.status.toUpperCase()}) {m.memberType ? `• ${m.memberType}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Teaching Division
                  </label>
                  <select
                    value={teacherDivision}
                    onChange={(e) => {
                      const div = e.target.value as SSTeacherCandidate['division'];
                      setTeacherDivision(div);
                      if (div === 'Adult') setTeacherStudyGuide('Adult Teachers Edition');
                      else if (div === 'Youth') setTeacherStudyGuide('Cornerstone Connections (Youth)');
                      else if (div === 'Earliteen') setTeacherStudyGuide('Real-Time Faith (Earliteen)');
                      else if (div === 'Junior') setTeacherStudyGuide('PowerPoints (Junior)');
                      else if (div === 'Primary') setTeacherStudyGuide('Primary Bible Study Guide');
                      else if (div === 'Kindergarten') setTeacherStudyGuide('Kindergarten Leader Guide');
                      else if (div === 'Cradle Roll') setTeacherStudyGuide('Beginner / Cradle Roll Leader');
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Adult">Adult Division</option>
                    <option value="Youth">Youth Division</option>
                    <option value="Earliteen">Earliteen</option>
                    <option value="Junior">Junior</option>
                    <option value="Primary">Primary</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Cradle Roll">Cradle Roll</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assigned Class Name
                  </label>
                  <input
                    type="text"
                    value={teacherClass}
                    onChange={(e) => setTeacherClass(e.target.value)}
                    placeholder="e.g. Class 4 (Bemba) / Youth Unit A"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Classroom Location & Assistant */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Classroom / Meeting Location
                  </label>
                  <input
                    type="text"
                    value={teacherLocation}
                    onChange={(e) => setTeacherLocation(e.target.value)}
                    placeholder="e.g. North Balcony, Rows 1-4"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assistant / Co-Teacher Name
                  </label>
                  <input
                    type="text"
                    value={teacherAssistant}
                    onChange={(e) => setTeacherAssistant(e.target.value)}
                    placeholder="e.g. Brother E. Mwape"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Contact Info & Assigned Study Guide */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={teacherContact}
                    onChange={(e) => setTeacherContact(e.target.value)}
                    placeholder="+260 977 000000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="teacher@example.org"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assigned Study Guide Edition
                  </label>
                  <input
                    type="text"
                    value={teacherStudyGuide}
                    onChange={(e) => setTeacherStudyGuide(e.target.value)}
                    placeholder="e.g. Adult Teachers Edition"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Teaching Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={teacherYearsOfService}
                    onChange={(e) => setTeacherYearsOfService(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Child Safety Certification */}
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherSafetyCertified}
                      onChange={(e) => setTeacherSafetyCertified(e.target.checked)}
                      className="rounded text-purple-700 focus:ring-purple-700"
                    />
                    <Shield className="w-4 h-4 text-purple-700" />
                    <span>Child Safety & Protection Certified</span>
                  </label>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">GC Safe Church</span>
                </div>
                {teacherSafetyCertified && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-purple-800 block mb-1">
                      Certification Expiry Date
                    </label>
                    <input
                      type="date"
                      value={teacherSafetyExpiry}
                      onChange={(e) => setTeacherSafetyExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Church Manual Rules Verification Checks */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                  Mandatory Church Manual Qualifications Check:
                </span>
                
                <label className="flex items-start gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStandingVerified}
                    onChange={(e) => setIsStandingVerified(e.target.checked)}
                    className="mt-0.5 rounded text-blue-900"
                  />
                  <span>
                    Church Member in Regular Standing (Baptized & active membership roll)
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDivisionConsulted}
                    onChange={(e) => setIsDivisionConsulted(e.target.checked)}
                    className="mt-0.5 rounded text-blue-900"
                  />
                  <span>
                    Division Leader Specifically Consulted (Mandated especially for children divisions)
                  </span>
                </label>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Superintendent Assessment & Notes
                </label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Notes on pedagogy, spiritual gift, doctrinal maturity, attendance..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black"
                >
                  Submit to Council Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD CHURCH BOARD VOTE */}
      {selectedForBoard && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Record Church Board Approval</h3>
            <p className="text-xs text-slate-500 mb-4">
              Confirm official Church Board minute action voting <strong>{selectedForBoard.name}</strong> as Sabbath School Teacher.
            </p>

            <form onSubmit={handleConfirmBoardApproval} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Church Board Resolution / Minute Number
                </label>
                <input
                  type="text"
                  required
                  value={boardResolutionNo}
                  onChange={(e) => setBoardResolutionNo(e.target.value)}
                  placeholder="e.g. RES-2026-024"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Voted Date
                </label>
                <input
                  type="date"
                  required
                  value={boardVoteDate}
                  onChange={(e) => setBoardVoteDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForBoard(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black hover:bg-emerald-800"
                >
                  Record Official Vote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG TEACHERS' MEETING */}
      {isAddMeetingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Log Weekly Teachers' Preparation Meeting</h3>
              <button 
                onClick={() => setIsAddMeetingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeachersMeeting} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Lesson No.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={tmLessonNo}
                    onChange={(e) => setTmLessonNo(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    required
                    value={tmLessonTitle}
                    onChange={(e) => setTmLessonTitle(e.target.value)}
                    placeholder="e.g. Taking the Cross Daily"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Meeting Leader
                </label>
                <input
                  type="text"
                  value={tmLeader}
                  onChange={(e) => setTmLeader(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Doctrinal Focus & Scripture Unity Points
                </label>
                <textarea
                  rows={2}
                  value={tmDoctrinalFocus}
                  onChange={(e) => setTmDoctrinalFocus(e.target.value)}
                  placeholder="Key doctrines addressed, theological questions clarified..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Teaching Pedagogy Helps & Group Dynamic Methods
                </label>
                <textarea
                  rows={2}
                  value={tmPedagogy}
                  onChange={(e) => setTmPedagogy(e.target.value)}
                  placeholder="Encouraging student interaction, 10-min action unit segment..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-900 text-white text-xs font-black hover:bg-purple-950"
                >
                  Log Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TEACHER DETAILS (SUPERINTENDENT MANAGEMENT) */}
      {teacherToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Superintendent Management
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Edit Teacher Details & Assignments</h3>
                <p className="text-xs text-slate-500 font-medium">Update classroom, assistant, qualifications, and governance status</p>
              </div>
              <button 
                onClick={() => setTeacherToEdit(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Teacher Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Active Operational Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as NonNullable<SSTeacherCandidate['status']>)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="active">Active Teacher</option>
                    <option value="on_leave">On Leave / Sabbatical</option>
                    <option value="substitute">Substitute Teacher</option>
                    <option value="inactive">Inactive / Relieved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Teaching Division
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value as SSTeacherCandidate['division'])}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Adult">Adult Division</option>
                    <option value="Youth">Youth Division</option>
                    <option value="Earliteen">Earliteen</option>
                    <option value="Junior">Junior</option>
                    <option value="Primary">Primary</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Cradle Roll">Cradle Roll</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assigned Class Name / Unit
                  </label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    placeholder="e.g. Adult Class 3 / Youth Unit B"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Classroom Location & Assistant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Classroom / Meeting Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. North Balcony, Rows 1-4 / Room 102"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assistant / Co-Teacher Name
                  </label>
                  <input
                    type="text"
                    value={editAssistant}
                    onChange={(e) => setEditAssistant(e.target.value)}
                    placeholder="e.g. Brother E. Mwape"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Phone / Contact Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+260 977 000000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="teacher@example.org"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Study Guide & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assigned Study Guide Edition
                  </label>
                  <input
                    type="text"
                    value={editStudyGuideAssigned}
                    onChange={(e) => setEditStudyGuideAssigned(e.target.value)}
                    placeholder="e.g. Adult Teachers Edition"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Years of Service
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editYearsOfService}
                    onChange={(e) => setEditYearsOfService(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Child Safety Certification */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSafetyCertified}
                      onChange={(e) => setEditSafetyCertified(e.target.checked)}
                      className="rounded text-purple-700 focus:ring-purple-700"
                    />
                    <Shield className="w-4 h-4 text-purple-700" />
                    <span>Child Safety & Protection Certified</span>
                  </label>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">GC Safe Church</span>
                </div>
                {editSafetyCertified && (
                  <div className="pt-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-purple-800 block mb-1">
                      Certification Expiry Date
                    </label>
                    <input
                      type="date"
                      value={editSafetyExpiry}
                      onChange={(e) => setEditSafetyExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Governance & Board Approval */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                  Church Governance & Qualifications (Church Manual pg 98-99):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-start gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editStanding}
                      onChange={(e) => setEditStanding(e.target.checked)}
                      className="mt-0.5 rounded text-blue-900"
                    />
                    <span>Member in Regular Standing</span>
                  </label>

                  <label className="flex items-start gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editDivisionConsulted}
                      onChange={(e) => setEditDivisionConsulted(e.target.checked)}
                      className="mt-0.5 rounded text-blue-900"
                    />
                    <span>Division Leader Consulted</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Board Approval Status
                    </label>
                    <select
                      value={editBoardStatus}
                      onChange={(e) => setEditBoardStatus(e.target.value as SSTeacherCandidate['boardApprovalStatus'])}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="draft_selection">Draft Selection</option>
                      <option value="council_recommended">Council Recommended</option>
                      <option value="board_approved">Board Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Board Resolution No.
                    </label>
                    <input
                      type="text"
                      value={editBoardResolution}
                      onChange={(e) => setEditBoardResolution(e.target.value)}
                      placeholder="e.g. RES-2026-018"
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Board Vote Date
                    </label>
                    <input
                      type="date"
                      value={editBoardDate}
                      onChange={(e) => setEditBoardDate(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Teachers' Prep Meeting Attendance Rate
                    </label>
                    <span className="text-xs font-black text-slate-900">{editAttendanceRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editAttendanceRate}
                    onChange={(e) => setEditAttendanceRate(parseInt(e.target.value) || 0)}
                    className="w-full accent-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Superintendent Assessment & Pedagogy Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes on teaching quality, spiritual gifts, class dynamics..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTeacherToEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black transition-colors"
                >
                  Save Teacher Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE TEACHER CONFIRMATION */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Remove Teacher from Roster?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to remove <strong>{teacherToDelete.name}</strong> ({teacherToDelete.division} Division) from the teacher roster? This action can be reversed by re-adding the member.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTeacherCandidate) {
                    onDeleteTeacherCandidate(teacherToDelete.id);
                  }
                  setTeacherToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition-colors"
              >
                Remove Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE TEACHER DIRECTORY ROSTER */}
      {isTeacherDirectoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seventh-day Adventist Church</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Sabbath School Teachers Master Directory</h3>
                <p className="text-xs text-slate-500">Official Roster • Lusaka Central SDA Church • Q3 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-blue-950 hover:bg-black text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Roster
                </button>
                <button
                  onClick={() => setIsTeacherDirectoryModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Teacher Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Assigned Class</th>
                    <th className="py-2.5 px-3">Room Location</th>
                    <th className="py-2.5 px-3">Assistant</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Safety Cert</th>
                    <th className="py-2.5 px-3">Board Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherCandidates.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.name}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{t.division}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{t.assignedClassName || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.classroomLocation || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.assistantTeacherName || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{t.contact || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {t.childSafetyCertified ? 'Certified' : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold uppercase">
                          {t.boardApprovalStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>Total Active Sabbath School Faculty: {teacherCandidates.length}</span>
              <button
                onClick={() => setIsTeacherDirectoryModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUTHORIZE NEW TEACHER PORTAL ACCESS */}
      {isAuthorizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Superintendent Authorization</span>
                <h3 className="text-lg font-black text-slate-900">Grant Teacher Portal Access</h3>
              </div>
              <button
                onClick={() => setIsAuthorizeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Sabbath School Council Authority
              </div>
              Authorizing a teacher generates database login credentials granting direct access to the digital class register and attendance records.
            </div>

            <form onSubmit={handleAuthorizeTeacherSubmit} className="space-y-4">
              {/* Optional Quick Pick from Candidates / Members */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Quick-Select From Sabbath School Candidate / Church Member (Optional)
                </label>
                <select
                  value={selectedCandidateIdForAuth}
                  onChange={(e) => {
                    const candId = e.target.value;
                    setSelectedCandidateIdForAuth(candId);
                    if (candId.startsWith('mem-')) {
                      const actualMemId = candId.replace('mem-', '');
                      const member = churchMembers.find(m => m.id === actualMemId);
                      if (member) {
                        setAuthTeacherName(member.name);
                        setAuthTeacherEmail(member.email || handleAutoCreateEmail(member.name));
                        if (!authTeacherPassword) {
                          setAuthTeacherPassword(handleGeneratePassword());
                        }
                      }
                    } else {
                      const candidate = teacherCandidates.find(c => c.id === candId);
                      if (candidate) {
                        setAuthTeacherName(candidate.name);
                        const member = churchMembers.find(m => m.id === candidate.memberId);
                        const existingEmail = candidate.email || member?.email;
                        const autoEmail = handleAutoCreateEmail(candidate.name);
                        setAuthTeacherEmail(existingEmail || autoEmail);
                        if (!authTeacherPassword) {
                          setAuthTeacherPassword(handleGeneratePassword());
                        }
                        const matchedClass = classes.find(c => 
                          (candidate.assignedClassName && c.name.toLowerCase().includes(candidate.assignedClassName.toLowerCase())) ||
                          c.name.toLowerCase().includes(candidate.division.toLowerCase())
                        );
                        if (matchedClass) {
                          setAuthClassId(matchedClass.id);
                          if (matchedClass.language) setAuthLanguage(matchedClass.language);
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="">-- Choose Candidate or Member to Pre-fill --</option>
                  <optgroup label="Sabbath School Teacher Candidates">
                    {teacherCandidates.map(tc => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} ({tc.division} - {tc.boardApprovalStatus.replace('_', ' ')})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Church Members in Regular Standing">
                    {churchMembers.filter(m => m.status === 'active').map(m => (
                      <option key={m.id} value={`mem-${m.id}`}>
                        {m.name} {m.memberNumber ? `(${m.memberNumber})` : ''} - Regular Standing
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Teacher Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={authTeacherName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setAuthTeacherName(name);
                    if (!authTeacherEmail || authTeacherEmail.endsWith('@church.org')) {
                      setAuthTeacherEmail(handleAutoCreateEmail(name));
                    }
                  }}
                  placeholder="e.g. Elder Musonda / Sister Mwila"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Institutional Email / Login Username *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthTeacherEmail(handleAutoCreateEmail(authTeacherName))}
                    className="text-[10px] font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="email"
                  required
                  value={authTeacherEmail}
                  onChange={(e) => setAuthTeacherEmail(e.target.value)}
                  placeholder="teacher@church.org"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Database Security Key (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthTeacherPassword(handleGeneratePassword())}
                    className="text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Generate Key
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={authTeacherPassword}
                  onChange={(e) => setAuthTeacherPassword(e.target.value)}
                  placeholder="Enter initial password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Assign Sabbath School Class *
                  </label>
                  <select
                    required
                    value={authClassId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setAuthClassId(cid);
                      const cls = classes.find(c => c.id === cid);
                      if (cls?.language) setAuthLanguage(cls.language);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Language Specialization
                  </label>
                  <select
                    value={authLanguage}
                    onChange={(e) => setAuthLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {ADULT_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAuthorizeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black shadow-md flex items-center gap-2"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  Grant Teacher Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TEACHER PORTAL CREDENTIALS */}
      {isEditPortalModalOpen && editingPortalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Superintendent Management</span>
                <h3 className="text-lg font-black text-slate-900">Edit Teacher Credentials</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditPortalModalOpen(false);
                  setEditingPortalTeacher(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortalEdit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Teacher Name *
                </label>
                <input
                  type="text"
                  required
                  value={editPortalName}
                  onChange={(e) => setEditPortalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Institutional Email / Username *
                </label>
                <input
                  type="email"
                  required
                  value={editPortalEmail}
                  onChange={(e) => setEditPortalEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Security Key (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPortalPassword(handleGeneratePassword())}
                    className="text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Generate New Key
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editPortalPassword}
                  onChange={(e) => setEditPortalPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Class Assignment
                  </label>
                  <select
                    value={editPortalClassId}
                    onChange={(e) => setEditPortalClassId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Language Specialization
                  </label>
                  <select
                    value={editPortalLanguage}
                    onChange={(e) => setEditPortalLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {ADULT_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPortalModalOpen(false);
                    setEditingPortalTeacher(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black shadow-md"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVOKE TEACHER PORTAL ACCESS */}
      {deletingPortalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Revoke Teacher Portal Access?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to revoke portal credentials for <strong>{deletingPortalTeacher.name}</strong> ({deletingPortalTeacher.email})? They will no longer be able to log in or access their assigned class register.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingPortalTeacher(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 shadow-md"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SabbathSchoolCouncilView;
