import React, { useState } from 'react';
import { AuditRecord, ChurchBankAccount } from '../../types';
import { 
  ShieldCheck, Lock, EyeOff, FileText, AlertTriangle, CheckCircle2, 
  Printer, Scale, Calendar, UserX, Award, Heart, HelpCircle,
  ExternalLink, Sparkles, FolderArchive, ArrowUpRight, BookOpen
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_CODE } from '../../utils/currency';

interface AuditingAndConfidentialityViewProps {
  auditRecords: AuditRecord[];
  currentChurchUser: { name: string; churchName?: string; id: string };
  bankAccounts: ChurchBankAccount[];
  onAddNewAudit: (audit: Omit<AuditRecord, 'id' | 'churchId'>) => void;
  monthlyReceiptsTotal: number;
  monthlyDisbursementsTotal: number;
  conferenceRemittedTotal: number;
}

export const AuditingAndConfidentialityView: React.FC<AuditingAndConfidentialityViewProps> = ({
  auditRecords,
  currentChurchUser,
  bankAccounts,
  onAddNewAudit,
  monthlyReceiptsTotal,
  monthlyDisbursementsTotal,
  conferenceRemittedTotal
}) => {
  const [activeTab, setActiveTab] = useState<'auditing' | 'confidentiality' | 'reports'>('auditing');
  const [isRecordingAudit, setIsRecordingAudit] = useState(false);
  const [selectedAuditForPrint, setSelectedAuditForPrint] = useState<AuditRecord | null>(null);

  // New Audit state
  const [year, setYear] = useState('2025');
  const [auditorName, setAuditorName] = useState('Elder C. Chilufya (Conference Appointed Auditor)');
  const [conferenceName, setConferenceName] = useState('Lusaka Conference of SDA');
  const [findings, setFindings] = useState('All tithe envelopes reconciled 100% to monthly conference remittances. Zero diversion found. Bank accounts properly titled in the church name.');
  const [auditOpinion, setAuditOpinion] = useState<'clean_unqualified' | 'qualified' | 'adverse'>('clean_unqualified');
  const [letterPreserved, setLetterPreserved] = useState(true);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNewAudit({
      year,
      auditDate: new Date().toISOString().split('T')[0],
      auditorName: auditorName.trim(),
      auditorTitle: 'Conference Appointed Auditor',
      conferenceName: conferenceName.trim(),
      auditOpinion,
      findingsSummary: findings.trim(),
      boardPresentedDate: new Date().toISOString().split('T')[0],
      officialLetterPreserved: letterPreserved,
      status: 'completed'
    });
    setIsRecordingAudit(false);
  };

  return (
    <div className="space-y-10">
      {/* Sections 6 & 7 Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" /> Church Manual Sections 6 & 7: Auditing & Confidentiality
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Conference Auditing, Record Preservation & Absolute Confidentiality
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm font-medium leading-relaxed">
              Financial records, vouchers, canceled checks, and receipts must be carefully preserved according to conference guidelines. 
              The books are subject to an annual audit by a <strong>Conference-Appointed Auditor</strong>. 
              Crucially, <strong>individual giving records are strictly confidential</strong>: under no circumstances may giving details be disclosed to unauthorized parties, and breach of this sacred trust is cause for removal from office.
            </p>
          </div>
          <button
            onClick={() => setIsRecordingAudit(true)}
            className="px-6 py-4 bg-indigo-400 text-slate-950 hover:bg-indigo-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" /> Log Conference Audit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('auditing')}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'auditing'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" /> Annual Conference Audits ({auditRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('confidentiality')}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'confidentiality'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <EyeOff className="w-4 h-4" /> Confidentiality Protocols & Oath
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Monthly Board & Business Reports
        </button>
      </div>

      {/* TAB 1: CONFERENCE AUDITS */}
      {activeTab === 'auditing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <Scale className="w-6 h-6 text-indigo-700" />
                Conference Annual Audits & Certification
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Official audit opinions issued by conference treasury examiners
              </p>
            </div>
            <button
              onClick={() => setIsRecordingAudit(true)}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Record New Audit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auditRecords.map((audit) => {
              const isClean = audit.auditOpinion === 'clean_unqualified';
              return (
                <div key={audit.id} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900">Fiscal Year {audit.year}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isClean ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {(audit.auditOpinion || 'clean_unqualified').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-600">
                      Examiner: <strong className="text-slate-900">{audit.auditorName}</strong>
                    </p>
                    <p className="text-slate-500 font-medium">
                      Entity: {audit.conferenceName} • Date: {audit.auditDate}
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Auditor Findings & Conclusion:
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed">
                      "{audit.findingsSummary}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Preserved in Church Archive
                    </span>
                    <button
                      onClick={() => setSelectedAuditForPrint(audit)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3 h-3" /> View Certificate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Readiness Checklist */}
          <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-3xl space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-indigo-700" />
              Church Manual Audit-Readiness Mandates Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-900 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All tithe and offering envelopes preserved sequentially.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Monthly conference remittance vouchers matched to receipts.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All bank statements monthly reconciled with zero unexplained drift.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Every disbursement backed by voted board minute reference.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIDENTIALITY PROTOCOLS */}
      {activeTab === 'confidentiality' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 bg-rose-900 text-white rounded-2xl flex items-center justify-center font-black">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                Church Manual Section 7: Absolute Confidentiality
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Individual Tithe & Offering Giving Records Are Sacredly Protected
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-black text-sm uppercase tracking-wide">
                <Lock className="w-4 h-4 text-rose-700" />
                The Ironclad Non-Disclosure Rule
              </div>
              <p className="text-xs text-rose-950 font-medium leading-relaxed">
                The church treasurer and assistant treasurers must strictly preserve the <strong>absolute confidentiality</strong> of each member's contributions. Under no circumstances may giving records—whether someone gives, does not give, or the amounts given—be shared with church elders, the church board, nominating committees, or members.
              </p>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-[11px] text-rose-900 font-bold">
                ⚠️ Church Manual Clause: Breaching this sacred trust is cause for immediate censure and removal from office.
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm uppercase tracking-wide">
                <Heart className="w-4 h-4 text-blue-700" />
                Spiritual Example & Leadership
              </div>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                As a spiritual officer of the church, the treasurer should be a person of prayer, unquestioned integrity, and an exemplar of faith. The treasurer must themselves be a faithful tithe payer and generous supporter of local church funds and world mission, demonstrating personal commitment to the message.
              </p>
              <div className="p-3 bg-white rounded-xl border border-blue-200 text-[11px] text-blue-900 font-bold">
                ✓ Personal compliance: Treasurer {currentChurchUser.name} is in full active standing and faithful stewardship.
              </div>
            </div>
          </div>

          {/* Confidentiality Oath Display */}
          <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
              Official Treasurer's Covenant
            </span>
            <blockquote className="text-sm font-medium text-slate-200 italic leading-relaxed">
              "I solemnly pledge before God and the church to safeguard the sacred trust committed to me. I will keep all member giving records strictly confidential, disburse local funds only upon authorized vote, and remit 100% of sacred trust conference funds to the Conference Treasurer without diversion or delay."
            </blockquote>
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="font-black text-slate-400">Signed & Voted Officer:</span>
              <span className="font-mono font-bold text-emerald-400">{currentChurchUser.name} (Church Treasurer)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY BOARD & BUSINESS REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-900" />
                Monthly Board & Business Meeting Financial Statement
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Comprehensive summary of local and trust funds (Strictly aggregated • Zero individual names)
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Board Statement
            </button>
          </div>

          {/* Statement View */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h4 className="font-black text-slate-900 text-lg">
                  {currentChurchUser.churchName || 'Seventh-day Adventist Church'}
                </h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Monthly Financial Report Presented to Church Board & Pastor
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block">Reporting Date:</span>
                <span className="text-sm font-black text-slate-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase text-slate-700">
                      <th className="py-2">Financial Fund Category</th>
                      <th className="py-2 text-right">Receipts ({CURRENCY_CODE})</th>
                      <th className="py-2 text-right">Disbursements ({CURRENCY_CODE})</th>
                      <th className="py-2 text-right">Net Balance ({CURRENCY_CODE})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 font-bold text-slate-900">
                        1. Sacred Conference Trust Funds (Tithe & World Mission)
                        <span className="text-[10px] text-rose-600 block font-normal">100% remitted to Conference • Zero retained</span>
                      </td>
                      <td className="py-3 text-right font-black text-slate-900">
                        {formatKwacha(conferenceRemittedTotal)}
                      </td>
                      <td className="py-3 text-right font-black text-rose-900">
                        {formatKwacha(conferenceRemittedTotal)}
                      </td>
                      <td className="py-3 text-right font-black text-slate-400">{formatKwacha(0)} (Cleared)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-slate-900">
                        2. Local Church Operating Budget & Utilities
                        <span className="text-[10px] text-slate-500 block font-normal">Governed by voted board budget</span>
                      </td>
                      <td className="py-3 text-right font-black text-slate-900">
                        {formatKwacha(monthlyReceiptsTotal)}
                      </td>
                      <td className="py-3 text-right font-black text-slate-900">
                        {formatKwacha(monthlyDisbursementsTotal)}
                      </td>
                      <td className="py-3 text-right font-black text-emerald-900">
                        {formatKwacha(monthlyReceiptsTotal - monthlyDisbursementsTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-slate-900">
                        3. Auxiliary Organizations (Ringfenced Departments)
                        <span className="text-[10px] text-slate-500 block font-normal">Held in trust for AYM, Dorcas, Music, Pathfinders</span>
                      </td>
                      <td className="py-3 text-right font-black text-slate-900">{formatKwacha(2450)}</td>
                      <td className="py-3 text-right font-black text-slate-900">{formatKwacha(750)}</td>
                      <td className="py-3 text-right font-black text-emerald-900">{formatKwacha(1700)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certification */}
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium">
              Submitted in prayerful stewardship by <strong>{currentChurchUser.name}</strong>, Church Treasurer. Copies delivered to Church Pastor, Church Board Chair, and Church Clerk for official preservation in minutes.
            </div>
          </div>
        </div>
      )}

      {/* RECORD AUDIT MODAL */}
      {isRecordingAudit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Log Conference Annual Audit
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  Church Manual Section 6: Official Audit Trail
                </p>
              </div>
              <button
                onClick={() => setIsRecordingAudit(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Audit Year
                  </label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Audit Opinion
                  </label>
                  <select
                    value={auditOpinion}
                    onChange={(e) => setAuditOpinion(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  >
                    <option value="clean_unqualified">Clean (Unqualified)</option>
                    <option value="qualified">Qualified (Minor Observations)</option>
                    <option value="adverse">Adverse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Conference Appointed Auditor
                </label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Local Conference Name
                </label>
                <input
                  type="text"
                  required
                  value={conferenceName}
                  onChange={(e) => setConferenceName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Auditor Findings & Recommendations
                </label>
                <textarea
                  rows={3}
                  required
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="letterPreservedCheck"
                  checked={letterPreserved}
                  onChange={(e) => setLetterPreserved(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-900 focus:ring-indigo-900"
                />
                <label htmlFor="letterPreservedCheck" className="text-xs text-slate-700 font-medium">
                  Official signed audit certificate letter received and archived.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordingAudit(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Save Audit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT AUDIT CERTIFICATE MODAL */}
      {selectedAuditForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-950 text-white rounded-xl flex items-center justify-center font-black">
                  SDA
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                    Conference Certificate of Audit
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {selectedAuditForPrint.conferenceName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditForPrint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Audited Period:</span>
                <span className="font-bold text-slate-900">Fiscal Year {selectedAuditForPrint.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Completed:</span>
                <span className="font-bold text-slate-900">{selectedAuditForPrint.auditDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Appointed Examiner:</span>
                <span className="font-bold text-slate-900">{selectedAuditForPrint.auditorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Audit Certification Opinion:</span>
                <span className="font-black text-emerald-800 uppercase">
                  {(selectedAuditForPrint.auditOpinion || 'clean_unqualified').replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-2xl text-xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Official Certification Findings:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                {selectedAuditForPrint.findingsSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                  Conference Auditor:
                </span>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {selectedAuditForPrint.auditorName}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                  Church Treasurer Custodian:
                </span>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {currentChurchUser.name}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-indigo-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
