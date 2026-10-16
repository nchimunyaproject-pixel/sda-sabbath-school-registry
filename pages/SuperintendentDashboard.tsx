import React, { useState } from 'react';
import { 
  User, MobilisationPlanItem, ConferenceEmphases, SSCurriculumItem, 
  SSProgramRunSheet, SSCouncilMember, SSAuxiliaryOfficer, SSTeacherCandidate, 
  SSTeachersMeeting, SSEvangelismProject, SSGreetingSchedule, SSQuarterlyReport, 
  ChurchMember, FinancialTransmission, SSClassSession, Class, StudyGuideOrder 
} from '../types';
import { ExecutiveLeadershipView } from '../components/superintendent/ExecutiveLeadershipView';
import { SabbathSchoolCouncilView } from '../components/superintendent/SabbathSchoolCouncilView';
import { FourSpiritualPurposesView } from '../components/superintendent/FourSpiritualPurposesView';
import { BoardAndConferenceCollaborationView } from '../components/superintendent/BoardAndConferenceCollaborationView';
import { StudyGuideOrdersView } from '../components/superintendent/StudyGuideOrdersView';
import { 
  Compass, Users, Heart, FileText, CheckCircle2, 
  Shield, Award, Clock, BookOpen, Sparkles, Building2, Flame, Coins, ShoppingBag
} from 'lucide-react';
import { useCurrency } from '../utils/currency';

interface SuperintendentDashboardProps {
  user: User;
  mobilisationPlan: MobilisationPlanItem[];
  onToggleMobilisationItem: (id: string) => void;
  onAddMobilisationItem: (item: Omit<MobilisationPlanItem, 'id'>) => void;
  conferenceEmphases: ConferenceEmphases;
  curriculumInventory: SSCurriculumItem[];
  onUpdateCurriculum: (id: string, updates: Partial<SSCurriculumItem>) => void;
  programRunSheet: SSProgramRunSheet;
  onUpdateRunSheet: (updated: SSProgramRunSheet) => void;
  councilMembers: SSCouncilMember[];
  auxiliaryOfficers: SSAuxiliaryOfficer[];
  onAddAuxiliaryOfficer: (officer: Omit<SSAuxiliaryOfficer, 'id'>) => void;
  teacherCandidates: SSTeacherCandidate[];
  onUpdateTeacherCandidate: (id: string, updates: Partial<SSTeacherCandidate>) => void;
  onAddTeacherCandidate: (candidate: Omit<SSTeacherCandidate, 'id'>) => void;
  teachersMeetings: SSTeachersMeeting[];
  onAddTeachersMeeting: (meeting: Omit<SSTeachersMeeting, 'id'>) => void;
  evangelismProjects: SSEvangelismProject[];
  onAddEvangelismProject: (project: Omit<SSEvangelismProject, 'id'>) => void;
  onUpdateEvangelismProject: (id: string, updates: Partial<SSEvangelismProject>) => void;
  greetingSchedules: SSGreetingSchedule[];
  onAddGreetingSchedule: (item: Omit<SSGreetingSchedule, 'id'>) => void;
  quarterlyReport: SSQuarterlyReport;
  onUpdateQuarterlyReport: (updated: Partial<SSQuarterlyReport>) => void;
  churchMembers: ChurchMember[];
  financialTransmissions: FinancialTransmission[];
  classSessions: SSClassSession[];
  teachers?: User[];
  classes?: Class[];
  onAddTeacher?: (name: string, email: string, password: string, classId: string, language?: string) => void;
  onUpdateTeacher?: (teacherId: string, updates: Partial<User>) => void;
  onDeleteTeacher?: (teacherId: string) => void;
  onUpdatePassword?: (userId: string, newPassword: string) => void;
  studyGuideOrders?: StudyGuideOrder[];
  onAddStudyGuideOrder?: (order: Omit<StudyGuideOrder, 'id' | 'churchId' | 'orderNumber'>) => void;
  onUpdateStudyGuideOrder?: (id: string, updates: Partial<StudyGuideOrder>) => void;
  onDeleteStudyGuideOrder?: (id: string) => void;
}

export const SuperintendentDashboard: React.FC<SuperintendentDashboardProps> = ({
  user,
  mobilisationPlan,
  onToggleMobilisationItem,
  onAddMobilisationItem,
  conferenceEmphases,
  curriculumInventory,
  onUpdateCurriculum,
  programRunSheet,
  onUpdateRunSheet,
  councilMembers,
  auxiliaryOfficers,
  onAddAuxiliaryOfficer,
  teacherCandidates,
  onUpdateTeacherCandidate,
  onAddTeacherCandidate,
  teachersMeetings,
  onAddTeachersMeeting,
  evangelismProjects,
  onAddEvangelismProject,
  onUpdateEvangelismProject,
  greetingSchedules,
  onAddGreetingSchedule,
  quarterlyReport,
  onUpdateQuarterlyReport,
  churchMembers,
  financialTransmissions,
  classSessions,
  teachers = [],
  classes = [],
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onUpdatePassword,
  studyGuideOrders = [],
  onAddStudyGuideOrder,
  onUpdateStudyGuideOrder,
  onDeleteStudyGuideOrder
}) => {
  const [activeSection, setActiveSection] = useState<'leadership' | 'orders' | 'council' | 'purposes' | 'collaboration'>('leadership');
  const { formatCurrency } = useCurrency();

  // Quick stats
  const completedMobilisation = mobilisationPlan.filter(m => m.isCompleted).length;
  const boardApprovedTeachers = teacherCandidates.filter(t => t.boardApprovalStatus === 'board_approved').length;
  const pendingTeachers = teacherCandidates.filter(t => t.boardApprovalStatus === 'council_recommended').length;
  const activeOrdersCount = studyGuideOrders.length;
  const openOrdersCount = studyGuideOrders.filter(o => o.orderStatus !== 'distributed' && o.orderStatus !== 'cancelled').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                Executive Leadership Portal
              </span>
              <span className="px-3 py-1 bg-white/10 text-white border border-white/15 rounded-full text-[10px] font-black uppercase tracking-widest">
                SDA Church Manual Digitize
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Mission Giving: {formatCurrency(quarterlyReport.missionOfferingsTotal)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sabbath School Superintendent Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
              Serving as Chief Administrative Officer of the Sabbath School: immediate post-election mobilisation, council chairing, 
              teacher selection vetting, 30-minute uninterrupted study protection, four spiritual purposes championing, and denominational board accountability.
            </p>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-left lg:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">Superintendent in Office</span>
              <span className="text-base font-black text-white">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-slate-200">Lusaka Central SS</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5 Core Pillars Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <button
          onClick={() => setActiveSection('leadership')}
          className={`p-4 sm:p-5 rounded-3xl text-left border transition-all ${
            activeSection === 'leadership'
              ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-2xl ${activeSection === 'leadership' ? 'bg-blue-900 text-amber-400' : 'bg-blue-50 text-blue-900'}`}>
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activeSection === 'leadership' ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Area 1
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-tight">Executive Leadership</h2>
          <p className={`text-[10px] sm:text-[11px] mt-1 font-medium line-clamp-2 ${activeSection === 'leadership' ? 'text-blue-200' : 'text-slate-500'}`}>
            Mobilisation, Conference alignment & 30-min study guard.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100/20 text-[10px] font-bold flex justify-between">
            <span>Mobilisation:</span>
            <span className="font-black">{completedMobilisation}/{mobilisationPlan.length}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSection('orders')}
          className={`p-4 sm:p-5 rounded-3xl text-left border transition-all ${
            activeSection === 'orders'
              ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-2xl ${activeSection === 'orders' ? 'bg-blue-900 text-amber-400' : 'bg-amber-50 text-amber-800'}`}>
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activeSection === 'orders' ? 'bg-blue-900 text-amber-300' : 'bg-amber-100 text-amber-800'
            }`}>
              Study Guides
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-tight">Study Guide Orders</h2>
          <p className={`text-[10px] sm:text-[11px] mt-1 font-medium line-clamp-2 ${activeSection === 'orders' ? 'text-blue-200' : 'text-slate-500'}`}>
            Take member study guide orders, track payments & ABC supply.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100/20 text-[10px] font-bold flex justify-between">
            <span>Orders:</span>
            <span className="font-black">{activeOrdersCount} ({openOrdersCount} Open)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSection('council')}
          className={`p-4 sm:p-5 rounded-3xl text-left border transition-all ${
            activeSection === 'council'
              ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-2xl ${activeSection === 'council' ? 'bg-blue-900 text-amber-400' : 'bg-emerald-50 text-emerald-800'}`}>
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activeSection === 'council' ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Area 2
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-tight">Council & Teachers</h2>
          <p className={`text-[10px] sm:text-[11px] mt-1 font-medium line-clamp-2 ${activeSection === 'council' ? 'text-blue-200' : 'text-slate-500'}`}>
            Council appointments, teacher vetting & portal security keys.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100/20 text-[10px] font-bold flex justify-between">
            <span>Faculty:</span>
            <span className="font-black">{teachers.length} Active ({pendingTeachers} Rec)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSection('purposes')}
          className={`p-4 sm:p-5 rounded-3xl text-left border transition-all ${
            activeSection === 'purposes'
              ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-2xl ${activeSection === 'purposes' ? 'bg-blue-900 text-amber-400' : 'bg-rose-50 text-rose-800'}`}>
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activeSection === 'purposes' ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Area 3
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-tight">Spiritual Purposes</h2>
          <p className={`text-[10px] sm:text-[11px] mt-1 font-medium line-clamp-2 ${activeSection === 'purposes' ? 'text-blue-200' : 'text-slate-500'}`}>
            Scripture study, fellowship, community outreach & missions.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100/20 text-[10px] font-bold flex justify-between">
            <span>Outreach:</span>
            <span className="font-black">{evangelismProjects.length} Projects</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSection('collaboration')}
          className={`p-4 sm:p-5 rounded-3xl text-left border transition-all ${
            activeSection === 'collaboration'
              ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-2xl ${activeSection === 'collaboration' ? 'bg-blue-900 text-amber-400' : 'bg-purple-50 text-purple-800'}`}>
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activeSection === 'collaboration' ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Area 4
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-tight">Board & Conference</h2>
          <p className={`text-[10px] sm:text-[11px] mt-1 font-medium line-clamp-2 ${activeSection === 'collaboration' ? 'text-blue-200' : 'text-slate-500'}`}>
            Church board reports, votes & secretarial transmission.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100/20 text-[10px] font-bold flex justify-between">
            <span>Giving:</span>
            <span className="font-black">{formatCurrency(quarterlyReport.missionOfferingsTotal)}</span>
          </div>
        </button>
      </div>

      {/* Main View Area */}
      {activeSection === 'leadership' && (
        <ExecutiveLeadershipView
          mobilisationPlan={mobilisationPlan}
          onToggleMobilisationItem={onToggleMobilisationItem}
          onAddMobilisationItem={onAddMobilisationItem}
          conferenceEmphases={conferenceEmphases}
          curriculumInventory={curriculumInventory}
          onUpdateCurriculum={onUpdateCurriculum}
          programRunSheet={programRunSheet}
          onUpdateRunSheet={onUpdateRunSheet}
          studyGuideOrders={studyGuideOrders}
          onAddStudyGuideOrder={onAddStudyGuideOrder}
          onUpdateStudyGuideOrder={onUpdateStudyGuideOrder}
          onDeleteStudyGuideOrder={onDeleteStudyGuideOrder}
          churchMembers={churchMembers}
          superintendentName={user.name}
        />
      )}

      {activeSection === 'orders' && (
        <div className="space-y-6">
          <StudyGuideOrdersView
            orders={studyGuideOrders}
            onAddOrder={onAddStudyGuideOrder || (() => {})}
            onUpdateOrder={onUpdateStudyGuideOrder || (() => {})}
            onDeleteOrder={onDeleteStudyGuideOrder || (() => {})}
            churchMembers={churchMembers}
            superintendentName={user.name}
          />
        </div>
      )}

      {activeSection === 'council' && (
        <SabbathSchoolCouncilView
          councilMembers={councilMembers}
          auxiliaryOfficers={auxiliaryOfficers}
          onAddAuxiliaryOfficer={onAddAuxiliaryOfficer}
          teacherCandidates={teacherCandidates}
          onUpdateTeacherCandidate={onUpdateTeacherCandidate}
          onAddTeacherCandidate={onAddTeacherCandidate}
          teachersMeetings={teachersMeetings}
          onAddTeachersMeeting={onAddTeachersMeeting}
          churchMembers={churchMembers}
          teachers={teachers}
          classes={classes}
          onAddTeacher={onAddTeacher}
          onUpdateTeacher={onUpdateTeacher}
          onDeleteTeacher={onDeleteTeacher}
          onUpdatePassword={onUpdatePassword}
        />
      )}

      {activeSection === 'purposes' && (
        <FourSpiritualPurposesView
          evangelismProjects={evangelismProjects}
          onAddEvangelismProject={onAddEvangelismProject}
          onUpdateEvangelismProject={onUpdateEvangelismProject}
          greetingSchedules={greetingSchedules}
          onAddGreetingSchedule={onAddGreetingSchedule}
          financialTransmissions={financialTransmissions}
          classSessions={classSessions}
        />
      )}

      {activeSection === 'collaboration' && (
        <BoardAndConferenceCollaborationView
          quarterlyReport={quarterlyReport}
          onUpdateQuarterlyReport={onUpdateQuarterlyReport}
          teacherCandidates={teacherCandidates}
          financialTransmissions={financialTransmissions}
          classSessions={classSessions}
        />
      )}
    </div>
  );
};
export default SuperintendentDashboard;
