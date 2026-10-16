import React, { useState } from 'react';
import { 
  MobilisationPlanItem, ConferenceEmphases, SSCurriculumItem, 
  SSProgramRunSheet, SSProgramSegment, StudyGuideOrder, ChurchMember 
} from '../../types';
import { StudyGuideOrdersView } from './StudyGuideOrdersView';
import { 
  Compass, CheckCircle2, Clock, Calendar, BookOpen, AlertCircle, 
  Plus, Printer, Sparkles, Check, FileText, ArrowRight, 
  ShieldCheck, Award, Layers, ChevronRight, X, ShoppingCart
} from 'lucide-react';

interface ExecutiveLeadershipViewProps {
  mobilisationPlan: MobilisationPlanItem[];
  onToggleMobilisationItem: (id: string) => void;
  onAddMobilisationItem: (item: Omit<MobilisationPlanItem, 'id'>) => void;
  conferenceEmphases: ConferenceEmphases;
  curriculumInventory: SSCurriculumItem[];
  onUpdateCurriculum: (id: string, updates: Partial<SSCurriculumItem>) => void;
  programRunSheet: SSProgramRunSheet;
  onUpdateRunSheet: (updated: SSProgramRunSheet) => void;
  studyGuideOrders?: StudyGuideOrder[];
  onAddStudyGuideOrder?: (order: Omit<StudyGuideOrder, 'id' | 'churchId' | 'orderNumber'>) => void;
  onUpdateStudyGuideOrder?: (id: string, updates: Partial<StudyGuideOrder>) => void;
  onDeleteStudyGuideOrder?: (id: string) => void;
  churchMembers?: ChurchMember[];
  superintendentName?: string;
  initialSubSection?: 'mobilisation' | 'conference' | 'curriculum' | 'orders' | 'runsheet';
}

export const ExecutiveLeadershipView: React.FC<ExecutiveLeadershipViewProps> = ({
  mobilisationPlan,
  onToggleMobilisationItem,
  onAddMobilisationItem,
  conferenceEmphases,
  curriculumInventory,
  onUpdateCurriculum,
  programRunSheet,
  onUpdateRunSheet,
  studyGuideOrders = [],
  onAddStudyGuideOrder = () => {},
  onUpdateStudyGuideOrder = () => {},
  onDeleteStudyGuideOrder = () => {},
  churchMembers = [],
  superintendentName = 'Sister R. Simpasa',
  initialSubSection = 'mobilisation'
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'mobilisation' | 'conference' | 'curriculum' | 'orders' | 'runsheet'>(initialSubSection);
  
  // Modal states
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanPhase, setNewPlanPhase] = useState<MobilisationPlanItem['phase']>('ongoing_oversight');
  const [newPlanDeadline, setNewPlanDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newPlanMandate, setNewPlanMandate] = useState('SDA Church Manual (Executive Leadership)');

  // Run sheet editing state
  const [editingRunSheet, setEditingRunSheet] = useState<SSProgramRunSheet>(programRunSheet);
  const [isRunSheetPrintModalOpen, setIsRunSheetPrintModalOpen] = useState(false);

  // Curriculum distribution modal
  const [selectedCurriculum, setSelectedCurriculum] = useState<SSCurriculumItem | null>(null);
  const [distributeCount, setDistributeCount] = useState(1);

  // Computed metrics
  const completedMobilisation = mobilisationPlan.filter(m => m.isCompleted).length;
  const totalMobilisation = mobilisationPlan.length;
  const mobilisationPct = totalMobilisation ? Math.round((completedMobilisation / totalMobilisation) * 100) : 0;

  const totalCurriculumNeeded = curriculumInventory.reduce((acc, c) => acc + c.quantityNeeded, 0);
  const totalCurriculumReceived = curriculumInventory.reduce((acc, c) => acc + c.quantityReceived, 0);
  const totalCurriculumDistributed = curriculumInventory.reduce((acc, c) => acc + c.quantityDistributed, 0);
  const curriculumCoveragePct = totalCurriculumNeeded ? Math.round((totalCurriculumReceived / totalCurriculumNeeded) * 100) : 0;

  const handleCreatePlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    onAddMobilisationItem({
      phase: newPlanPhase,
      title: newPlanTitle.trim(),
      description: newPlanDesc.trim(),
      deadline: newPlanDeadline,
      isCompleted: false,
      mandatedBy: newPlanMandate.trim()
    });
    setNewPlanTitle('');
    setNewPlanDesc('');
    setIsAddPlanModalOpen(false);
  };

  const handleUpdateStudyMinutes = (mins: number) => {
    const updated = {
      ...editingRunSheet,
      lessonStudyDurationMinutes: mins,
      isTeachingTimeGuaranteed: mins >= 30,
      segments: editingRunSheet.segments.map(s => 
        s.purpose === 'Study' ? { ...s, durationMinutes: mins } : s
      )
    };
    setEditingRunSheet(updated);
    onUpdateRunSheet(updated);
  };

  const handlePrintRunSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveSubSection('mobilisation')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubSection === 'mobilisation'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          Immediate Mobilisation & Term Plan ({completedMobilisation}/{totalMobilisation})
        </button>

        <button
          onClick={() => setActiveSubSection('conference')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubSection === 'conference'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-blue-400" />
          Conference Department Alignment
        </button>

        <button
          onClick={() => setActiveSubSection('curriculum')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubSection === 'curriculum'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          GC Bible Study Guides Stock ({curriculumCoveragePct}%)
        </button>

        <button
          onClick={() => setActiveSubSection('orders')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubSection === 'orders'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          Member Study Guide Orders ({studyGuideOrders.length})
        </button>

        <button
          onClick={() => setActiveSubSection('runsheet')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubSection === 'runsheet'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-400" />
          Program Run-Sheet & 30-Min Study Guarantee
        </button>
      </div>

      {/* SUB-SECTION 1: IMMEDIATE MOBILISATION & TERM PLAN */}
      {activeSubSection === 'mobilisation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                SDA Church Manual Mandate
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Executive Leadership & Immediate Mobilisation</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent must begin planning for the smooth and effective operation of the Sabbath School as soon as they are elected." 
                Track milestones, council calls, auxiliary appointments, and curriculum oversight.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right pr-4 border-r border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Readiness Index</span>
                <span className="text-2xl font-black text-blue-950">{mobilisationPct}%</span>
              </div>
              <button
                onClick={() => setIsAddPlanModalOpen(true)}
                className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                Add Action Milestone
              </button>
            </div>
          </div>

          {/* Mobilisation Progress Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center text-xs font-black mb-2">
              <span className="text-slate-600 uppercase tracking-wider">Mobilisation Execution Progress</span>
              <span className="text-blue-900">{completedMobilisation} of {totalMobilisation} Milestones Fully Completed</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${mobilisationPct}%` }}
              />
            </div>
          </div>

          {/* Milestones List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mobilisationPlan.map((item) => (
              <div 
                key={item.id}
                className={`p-5 rounded-3xl border transition-all ${
                  item.isCompleted 
                    ? 'bg-white border-slate-200 shadow-xs' 
                    : 'bg-amber-50/40 border-amber-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMobilisationItem(item.id)}
                      className={`mt-0.5 p-1.5 rounded-xl transition-all ${
                        item.isCompleted 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-white border-2 border-slate-300 text-transparent hover:border-blue-900'
                      }`}
                      title={item.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className={`text-sm font-black ${item.isCompleted ? 'text-slate-800 line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Target: {item.deadline}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    {item.mandatedBy}
                  </span>
                  {item.isCompleted && item.completedDate && (
                    <span className="text-emerald-700 flex items-center gap-1 font-black">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed on {item.completedDate}
                    </span>
                  )}
                </div>
                {item.notes && (
                  <div className="mt-2 bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 italic">
                    "{item.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: CONFERENCE DEPARTMENT ALIGNMENT */}
      {activeSubSection === 'conference' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  Denominational Alignment
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">{conferenceEmphases.conferenceName}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Local Conference Sabbath School Department Plans, Emphases & Curricula Directives for {conferenceEmphases.quarter}
                </p>
              </div>
              <div className="bg-blue-950 text-white px-4 py-2.5 rounded-2xl text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-300 block">Annual Theme</span>
                <span className="text-xs font-black">{conferenceEmphases.annualTheme}</span>
              </div>
            </div>

            {/* Conference Director Note */}
            <div className="mt-6 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">Conference Department Notes</h4>
                <p className="text-xs text-blue-900 font-medium mt-1 leading-relaxed">
                  {conferenceEmphases.directorNotes}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Emphases Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Conference Priority Emphases</h3>
                  <p className="text-[11px] text-slate-500">Key focus areas mandated for Sabbath School implementation</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {conferenceEmphases.priorityEmphases.map((emphasis, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs">
                    <span className="w-5 h-5 bg-blue-950 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 leading-relaxed">{emphasis}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Curricula & Upcoming Training */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Official Curricula Materials</h3>
                    <p className="text-[11px] text-slate-500">Authorized General Conference Study Guides</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {conferenceEmphases.recommendedCurricula.map((curr, idx) => (
                    <div key={idx} className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{curr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Upcoming Conference Training</h3>
                    <p className="text-[11px] text-slate-500">Teacher and officer leadership workshops</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {conferenceEmphases.upcomingTrainingEvents.map((evt, idx) => (
                    <div key={idx} className="p-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-purple-950">{evt.title}</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">{evt.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Location: {evt.locationOrLink}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">For: {evt.targetAudience}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: GC BIBLE STUDY GUIDES INVENTORY */}
      {activeSubSection === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Operational Oversight & Helps
                </span>
                <button
                  onClick={() => setActiveSubSection('orders')}
                  className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                >
                  <ShoppingCart className="w-3 h-3" />
                  View Member Orders Desk ({studyGuideOrders.length})
                </button>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">General Conference Bible Study Guides</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "Working through the Sabbath School Council, the superintendent oversees the execution of all programs, 
                ensuring helps and materials (such as the General Conference-prepared Sabbath School Bible study guides) are supplied in sufficient quantities."
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total Needed</span>
                <span className="text-lg font-black text-slate-900">{totalCurriculumNeeded}</span>
              </div>
              <div className="text-center border-l border-slate-200 pl-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Received</span>
                <span className="text-lg font-black text-emerald-700">{totalCurriculumReceived}</span>
              </div>
              <div className="text-center border-l border-slate-200 pl-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Distributed</span>
                <span className="text-lg font-black text-blue-900">{totalCurriculumDistributed}</span>
              </div>
            </div>
          </div>

          {/* Curriculum Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">All Age Divisions & Study Guides</span>
              <span className="text-xs font-bold text-slate-500">Q3 2026 Procurement Log</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Division & Title</th>
                    <th className="py-3 px-4 text-center">Quarter</th>
                    <th className="py-3 px-4 text-center">Needed</th>
                    <th className="py-3 px-4 text-center">Received</th>
                    <th className="py-3 px-4 text-center">Distributed</th>
                    <th className="py-3 px-4 text-center">Buffer Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {curriculumInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{item.divisionLevel}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">{item.guideTitle}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.quarter}</td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-800">{item.quantityNeeded}</td>
                      <td className="py-3.5 px-4 text-center font-black text-emerald-800">{item.quantityReceived}</td>
                      <td className="py-3.5 px-4 text-center font-black text-blue-900">{item.quantityDistributed}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                          item.bufferStock > 5 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800 font-bold'
                        }`}>
                          {item.bufferStock} left
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedCurriculum(item);
                            setDistributeCount(1);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-950 hover:text-white rounded-xl text-[11px] font-black transition-all"
                        >
                          Log Distribution
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION: MEMBER STUDY GUIDE ORDERS */}
      {activeSubSection === 'orders' && (
        <StudyGuideOrdersView
          orders={studyGuideOrders}
          onAddOrder={onAddStudyGuideOrder}
          onUpdateOrder={onUpdateStudyGuideOrder}
          onDeleteOrder={onDeleteStudyGuideOrder}
          churchMembers={churchMembers}
          superintendentName={superintendentName}
        />
      )}

      {/* SUB-SECTION 4: PROGRAM RUN-SHEET & 30-MIN TEACHING GUARANTEE */}
      {activeSubSection === 'runsheet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
                Sabbath Morning Execution
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Weekly Program Run-Sheet & Timetable</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent must also ensure that teachers are given at least 30 minutes of uninterrupted teaching time."
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {editingRunSheet.lessonStudyDurationMinutes >= 30 ? (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-4 py-2.5 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block">Teaching Time Protected</span>
                    <span className="text-xs font-black">{editingRunSheet.lessonStudyDurationMinutes} Uninterrupted Mins</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-900 border border-rose-200 px-4 py-2.5 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block text-rose-700">Violation of Mandate</span>
                    <span className="text-xs font-black">{editingRunSheet.lessonStudyDurationMinutes} Mins (Min 30 required)</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsRunSheetPrintModalOpen(true)}
                className="px-4 py-2.5 bg-blue-950 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs hover:bg-black transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Print Run-Sheet
              </button>
            </div>
          </div>

          {/* Quick Study Time Slider / Adjuster */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Class Study Duration Guard</span>
              <h3 className="text-lg font-black mt-1">Uninterrupted Lesson Study Slot: {editingRunSheet.lessonStudyDurationMinutes} Minutes</h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Adjust to test timetable compliance before printing bulletins.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUpdateStudyMinutes(30)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  editingRunSheet.lessonStudyDurationMinutes === 30 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Standard (30 min)
              </button>
              <button
                onClick={() => handleUpdateStudyMinutes(35)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  editingRunSheet.lessonStudyDurationMinutes === 35 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Optimal (35 min)
              </button>
              <button
                onClick={() => handleUpdateStudyMinutes(40)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  editingRunSheet.lessonStudyDurationMinutes === 40 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Generous (40 min)
              </button>
            </div>
          </div>

          {/* Schedule Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Sabbath Date</span>
                <span className="text-sm font-black text-slate-900">{editingRunSheet.sabbathDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Superintendent on Duty</span>
                <span className="text-sm font-black text-blue-950">{editingRunSheet.superintendentOnDuty}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Song Leader & Music</span>
                <span className="text-sm font-black text-slate-800">{editingRunSheet.songLeader}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {editingRunSheet.segments.map((seg, idx) => (
                <div 
                  key={seg.id} 
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                    seg.purpose === 'Study' 
                      ? 'bg-emerald-50/50 border-l-4 border-l-emerald-600' 
                      : seg.purpose === 'World Mission'
                      ? 'bg-blue-50/30'
                      : seg.purpose === 'Community Outreach'
                      ? 'bg-purple-50/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {seg.timeRange}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{seg.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          seg.purpose === 'Study' 
                            ? 'bg-emerald-600 text-white' 
                            : seg.purpose === 'World Mission'
                            ? 'bg-blue-700 text-white'
                            : seg.purpose === 'Community Outreach'
                            ? 'bg-purple-700 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {seg.purpose}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Responsible: <span className="font-bold text-slate-800">{seg.personResponsible}</span></p>
                      {seg.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{seg.notes}</p>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900">{seg.durationMinutes} mins</span>
                    {seg.purpose === 'Study' && (
                      <span className="text-[10px] font-bold text-emerald-700 block">Guaranteed 30+ Mins</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MOBILISATION PLAN ITEM */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-900" />
                <h3 className="text-lg font-black text-slate-900">Add Mobilisation Action Item</h3>
              </div>
              <button 
                onClick={() => setIsAddPlanModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanItem} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  required
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="e.g., Procure Quarter 4 Bible Study Guides"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Description / Operational Details
                </label>
                <textarea
                  rows={3}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Details of the council action or superintendent oversight..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Phase
                  </label>
                  <select
                    value={newPlanPhase}
                    onChange={(e) => setNewPlanPhase(e.target.value as MobilisationPlanItem['phase'])}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="immediate_post_election">Immediate Post-Election</option>
                    <option value="council_convening">Council Convening</option>
                    <option value="curriculum_procurement">Curriculum Procurement</option>
                    <option value="quarterly_launch">Quarterly Launch</option>
                    <option value="ongoing_oversight">Ongoing Oversight</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={newPlanDeadline}
                    onChange={(e) => setNewPlanDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Mandated Reference (Manual / Policy)
                </label>
                <input
                  type="text"
                  value={newPlanMandate}
                  onChange={(e) => setNewPlanMandate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-black text-white text-xs font-black shadow-sm"
                >
                  Save Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG CURRICULUM DISTRIBUTION */}
      {selectedCurriculum && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Log Curriculum Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedCurriculum.divisionLevel} - {selectedCurriculum.guideTitle}</p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex justify-between">
                <span>Current Received: <strong className="text-slate-900">{selectedCurriculum.quantityReceived}</strong></span>
                <span>Distributed: <strong className="text-blue-900">{selectedCurriculum.quantityDistributed}</strong></span>
                <span>Buffer Stock: <strong className="text-emerald-900">{selectedCurriculum.bufferStock}</strong></span>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Additional Guides Distributed
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedCurriculum.bufferStock}
                  value={distributeCount}
                  onChange={(e) => setDistributeCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedCurriculum(null)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newDistributed = selectedCurriculum.quantityDistributed + distributeCount;
                    const newBuffer = Math.max(0, selectedCurriculum.quantityReceived - newDistributed);
                    onUpdateCurriculum(selectedCurriculum.id, {
                      quantityDistributed: newDistributed,
                      bufferStock: newBuffer,
                      status: newBuffer === 0 ? 'distributed' : 'partially_received'
                    });
                    setSelectedCurriculum(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black"
                >
                  Confirm Distribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL: SABBATH SCHOOL PROGRAM RUN-SHEET */}
      {isRunSheetPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">Sabbath School Program Run-Sheet</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintRunSheet}
                  className="px-4 py-2 bg-blue-950 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-black"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button
                  onClick={() => setIsRunSheetPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Layout */}
            <div className="text-slate-900 space-y-6 print:m-0 print:p-0">
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Seventh-day Adventist Church</p>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">Official Sabbath School Program Run-Sheet</h1>
                <p className="text-xs font-bold text-slate-600 mt-0.5">Date: {editingRunSheet.sabbathDate} • Theme: {editingRunSheet.quarterTheme}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Superintendent on Duty:</span>
                  <span className="font-black text-slate-900">{editingRunSheet.superintendentOnDuty}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Song Leader & Pianist:</span>
                  <span className="font-black text-slate-900">{editingRunSheet.songLeader}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Head Greeter:</span>
                  <span className="font-bold text-slate-800">{editingRunSheet.headGreeter}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Mission Feature:</span>
                  <span className="font-bold text-slate-800 truncate block">{editingRunSheet.missionSpotlightTitle}</span>
                </div>
              </div>

              {/* Verified Mandate Notice */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 flex items-center justify-between">
                <span>Class Lesson Study Time Allocation:</span>
                <span className="font-black">{editingRunSheet.lessonStudyDurationMinutes} Minutes (Church Manual &gt;= 30 min Mandate Guaranteed)</span>
              </div>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-black uppercase text-[10px]">
                    <th className="py-2">Time</th>
                    <th className="py-2">Program Segment</th>
                    <th className="py-2">Spiritual Purpose</th>
                    <th className="py-2">Leader / Responsible</th>
                    <th className="py-2 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {editingRunSheet.segments.map((seg) => (
                    <tr key={seg.id} className={seg.purpose === 'Study' ? 'font-bold bg-slate-100/50' : ''}>
                      <td className="py-2.5 font-mono text-[11px]">{seg.timeRange}</td>
                      <td className="py-2.5">{seg.title}</td>
                      <td className="py-2.5 uppercase text-[10px] text-slate-600">{seg.purpose}</td>
                      <td className="py-2.5">{seg.personResponsible}</td>
                      <td className="py-2.5 text-right font-black">{seg.durationMinutes}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <span>Prepared by Sabbath School Superintendent</span>
                <span>Church Manual Approved Run-Sheet</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExecutiveLeadershipView;
