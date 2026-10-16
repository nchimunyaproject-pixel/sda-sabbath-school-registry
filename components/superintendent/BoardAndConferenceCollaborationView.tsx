import React, { useState } from 'react';
import { 
  SSQuarterlyReport, SSTeacherCandidate, FinancialTransmission, 
  SSClassSession 
} from '../../types';
import { 
  FileText, CheckCircle2, AlertCircle, Printer, Send, 
  Award, TrendingUp, Users, DollarSign, BookOpen, ShieldCheck, 
  Check, Calendar, Download, Sparkles, X
} from 'lucide-react';
import { useCurrency } from '../../utils/currency';

interface BoardAndConferenceCollaborationViewProps {
  quarterlyReport: SSQuarterlyReport;
  onUpdateQuarterlyReport: (updated: Partial<SSQuarterlyReport>) => void;
  teacherCandidates: SSTeacherCandidate[];
  financialTransmissions: FinancialTransmission[];
  classSessions: SSClassSession[];
  churchName?: string;
}

export const BoardAndConferenceCollaborationView: React.FC<BoardAndConferenceCollaborationViewProps> = ({
  quarterlyReport,
  onUpdateQuarterlyReport,
  teacherCandidates,
  financialTransmissions,
  classSessions,
  churchName = "Lusaka Central Seventh-day Adventist Church"
}) => {
  const [activeTab, setActiveTab] = useState<'board_report' | 'conference_quarterly'>('board_report');
  const [isSubmittedSuccessModal, setIsSubmittedSuccessModal] = useState(false);
  const { formatCurrency } = useCurrency();

  // Compute live offering stats for the report
  const totalMissionOfferings = financialTransmissions.reduce((acc, t) => {
    return acc + (t.breakdown.worldMissionOffering || 0) + 
      (t.breakdown.thirteenthSabbathOffering || 0) + 
      (t.breakdown.birthdayThankOffering || 0);
  }, 0);

  const totalThirteenthSabbath = financialTransmissions.reduce((acc, t) => {
    return acc + (t.breakdown.thirteenthSabbathOffering || 0);
  }, 0);

  const recommendedTeachers = teacherCandidates.filter(t => t.boardApprovalStatus === 'council_recommended');
  const approvedTeachers = teacherCandidates.filter(t => t.boardApprovalStatus === 'board_approved');

  const handlePrintBoardReport = () => {
    window.print();
  };

  const handleToggleReportStep = (stepKey: 'isClassRegisterAudited' | 'isDailyStudyCalculated' | 'isOfferingsReconciled' | 'isSuperintendentSigned' | 'isSecretarySigned') => {
    onUpdateQuarterlyReport({
      [stepKey]: !quarterlyReport[stepKey]
    });
  };

  const handleTransmitReport = () => {
    onUpdateQuarterlyReport({
      isTransmittedToConference: true,
      conferenceSubmissionDate: new Date().toISOString().split('T')[0],
      conferenceAcknowledgementReceipt: `CONF-SS-ACK-2026-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setIsSubmittedSuccessModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('board_report')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'board_report'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          Church Board Executive Report
        </button>

        <button
          onClick={() => setActiveTab('conference_quarterly')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'conference_quarterly'
              ? 'bg-blue-950 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          Conference Quarterly Report & Secretarial Audit
        </button>
      </div>

      {/* TAB 1: CHURCH BOARD EXECUTIVE REPORT */}
      {activeTab === 'board_report' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Church Board Representation
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Church Board Sabbath School Report</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent represents the Sabbath School on the church board, presenting teacher recommendations for vote, 
                submitting requests for church facilities/budget, and presenting periodic spiritual and numerical progress evaluations."
              </p>
            </div>

            <button
              onClick={handlePrintBoardReport}
              className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Print / Export Board Report
            </button>
          </div>

          {/* Report Paper Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
            {/* Church Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block">
                Seventh-day Adventist Church • Lusaka Conference
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mt-1">
                Sabbath School Department Board Report
              </h1>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Quarter: {quarterlyReport.quarter} {quarterlyReport.year} • Presented to Church Board
              </p>
            </div>

            {/* Numerical & Spiritual KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Enrollment</span>
                <span className="text-2xl font-black text-slate-900">{quarterlyReport.totalEnrollment}</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Active SS Members</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Attendance</span>
                <span className="text-2xl font-black text-blue-950">{quarterlyReport.averageAttendance}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">88.5% of enrollment</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Lesson Study</span>
                <span className="text-2xl font-black text-emerald-800">{quarterlyReport.dailyStudyPercentage}%</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Above GC target</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mission Offerings</span>
                <span className="text-2xl font-black text-amber-700">{formatCurrency(quarterlyReport.missionOfferingsTotal)}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Reconciled with Treasurer</span>
              </div>
            </div>

            {/* Section 1: Teacher Recommendations For Church Board Vote */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-900" />
                  1. Teacher Recommendations For Church Board Vote
                </h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  {recommendedTeachers.length} Candidate(s) Awaiting Board Resolution
                </span>
              </div>

              {recommendedTeachers.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {recommendedTeachers.map(t => (
                    <div key={t.id} className="p-3.5 bg-white flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-slate-900">{t.name}</span>
                        <span className="text-slate-500 font-medium ml-2">({t.division} Division • {t.assignedClassName})</span>
                      </div>
                      <span className="bg-amber-100 text-amber-900 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                        Standing Verified • Recommended by SS Council
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All active teachers have official Church Board minutes and votes recorded.
                </div>
              )}
            </div>

            {/* Section 2: Division Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                <BookOpen className="w-4 h-4 text-blue-900" />
                2. Division Enrollment & Material Distribution
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-black text-slate-900 block">Adult Division</span>
                  <span className="text-slate-500">185 Members • 6 Units</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-black text-slate-900 block">Youth / Collegiate</span>
                  <span className="text-slate-500">42 Members • 2 Units</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-black text-slate-900 block">Junior / Earliteen</span>
                  <span className="text-slate-500">38 Members • 2 Units</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-black text-slate-900 block">Primary / Cradle Roll</span>
                  <span className="text-slate-500">55 Children • 3 Units</span>
                </div>
              </div>
            </div>

            {/* Section 3: Community Evangelism & Decisions */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                <Sparkles className="w-4 h-4 text-blue-900" />
                3. Outreach Fruitage & Soul-Winning
              </h3>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-blue-950">Branch Sabbath Schools Operating:</span>
                  <span className="font-black text-blue-900">{quarterlyReport.branchSabbathSchoolsCount} Active</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-blue-950">Decisions for Baptism Logged:</span>
                  <span className="font-black text-emerald-800">{quarterlyReport.baptismsFromSS} Souls</span>
                </div>
              </div>
            </div>

            {/* Official Signature Lines */}
            <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-2">
                <div className="border-b border-slate-400 h-10 flex items-end justify-center font-serif italic text-blue-950">
                  Sister R. Simpasa
                </div>
                <span className="font-black text-[10px] uppercase text-slate-500 block">Sabbath School Superintendent</span>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-400 h-10 flex items-end justify-center font-serif italic text-blue-950">
                  Brother C. Zulu
                </div>
                <span className="font-black text-[10px] uppercase text-slate-500 block">Sabbath School Secretary</span>
              </div>

              <div className="space-y-2">
                <div className="border-b border-slate-400 h-10 flex items-end justify-center font-serif italic text-blue-950">
                  Pastor M. Phiri
                </div>
                <span className="font-black text-[10px] uppercase text-slate-500 block">Church Pastor / Elder</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFERENCE QUARTERLY REPORT & SECRETARIAL AUDIT */}
      {activeTab === 'conference_quarterly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Secretarial Accountability
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Conference Quarterly Report Transmission</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent closely collaborates with the Sabbath School Secretary to ensure accurate and timely compilation of the quarterly report to the conference Sabbath School department."
              </p>
            </div>

            {quarterlyReport.isTransmittedToConference ? (
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl text-right">
                <span className="text-[10px] font-black uppercase text-emerald-700 block">Transmitted to Conference</span>
                <span className="text-xs font-mono font-black text-emerald-950">{quarterlyReport.conferenceAcknowledgementReceipt}</span>
              </div>
            ) : (
              <button
                onClick={handleTransmitReport}
                disabled={!quarterlyReport.isClassRegisterAudited || !quarterlyReport.isOfferingsReconciled}
                className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all ${
                  quarterlyReport.isClassRegisterAudited && quarterlyReport.isOfferingsReconciled
                    ? 'bg-blue-950 hover:bg-black text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 text-amber-400" />
                Transmit Report to Conference
              </button>
            )}
          </div>

          {/* Audit Verification Step Checklist */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Secretarial & Superintendent Pre-Transmission Audit Checklist
            </h3>

            <div className="space-y-3">
              <label 
                onClick={() => handleToggleReportStep('isClassRegisterAudited')}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors"
              >
                <div className={`p-1 rounded-lg mt-0.5 ${quarterlyReport.isClassRegisterAudited ? 'bg-emerald-600 text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">1. All 7 Class Registers Audited & Closed</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Secretary has collected all weekly records for 13 Sabbaths, verified headcount, and checked visitor attendance.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => handleToggleReportStep('isDailyStudyCalculated')}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors"
              >
                <div className={`p-1 rounded-lg mt-0.5 ${quarterlyReport.isDailyStudyCalculated ? 'bg-emerald-600 text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">2. Daily Study Percentage Mathematically Verified</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Verified against quarterly attendance cards. Current standing: {quarterlyReport.dailyStudyPercentage}%.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => handleToggleReportStep('isOfferingsReconciled')}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors"
              >
                <div className={`p-1 rounded-lg mt-0.5 ${quarterlyReport.isOfferingsReconciled ? 'bg-emerald-600 text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900">3. Mission Offerings Reconciled with Church Treasurer</h4>
                    <span className="text-[10px] font-mono font-black text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                      {formatCurrency(quarterlyReport.missionOfferingsTotal)} Confirmed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Regular SS offering, 13th Sabbath offering, Investment, and Birthday-Thank confirmed with Treasury books before remittance.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => handleToggleReportStep('isSuperintendentSigned')}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors"
              >
                <div className={`p-1 rounded-lg mt-0.5 ${quarterlyReport.isSuperintendentSigned ? 'bg-emerald-600 text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">4. Superintendent Endorsement Signed</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Superintendent reviews all figures, certifies doctrinal accuracy, and signs the document.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => handleToggleReportStep('isSecretarySigned')}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors"
              >
                <div className={`p-1 rounded-lg mt-0.5 ${quarterlyReport.isSecretarySigned ? 'bg-emerald-600 text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">5. Sabbath School Secretary Endorsement Signed</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Secretary attests to the factual compilation of the report.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION SUCCESS MODAL */}
      {isSubmittedSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Quarterly Report Transmitted</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              The Sabbath School Quarterly Report for {quarterlyReport.quarter} has been transmitted to the Lusaka Conference Sabbath School Department.
            </p>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 my-4 text-xs font-mono font-bold text-slate-700">
              Receipt: {quarterlyReport.conferenceAcknowledgementReceipt}
            </div>
            <button
              onClick={() => setIsSubmittedSuccessModal(false)}
              className="w-full py-3 bg-blue-950 text-white rounded-xl text-xs font-black hover:bg-black"
            >
              Close Confirmation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default BoardAndConferenceCollaborationView;
