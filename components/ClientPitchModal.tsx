import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Award, Landmark, 
  Users, DollarSign, Database, FileSpreadsheet, Lock, 
  Globe, Sparkles, X, ChevronRight, Download, Check
} from 'lucide-react';
import SDALogo from './SDALogo';

interface ClientPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleDemo?: (role: string) => void;
}

export const ClientPitchModal: React.FC<ClientPitchModalProps> = ({
  isOpen,
  onClose,
  onSelectRoleDemo
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'manual' | 'treasury' | 'architecture'>('matrix');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-md shrink-0">
                <SDALogo className="w-20 h-10" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Enterprise Executive Briefing & Competitive Analysis
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Why SDA Pro Suite Outclasses the Competition
                </h2>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  Full 2025 General Conference Church Manual alignment, multi-tier live telemetry & sacred trust governance.
                </p>
              </div>
            </div>

            {/* Quick Pitch Pill */}
            <div className="hidden lg:flex flex-col items-end text-right border-l border-white/10 pl-6">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Global GC Standard</span>
              <span className="text-sm font-black text-white">2025 Edition Compliant</span>
              <span className="text-[10px] text-slate-300">Zero-Loss Trust Fund Architecture</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'matrix' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Competitor Benchmark Matrix
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'manual' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              SDA Church Manual 2025 Alignment
            </button>
            <button
              onClick={() => setActiveTab('treasury')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'treasury' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Two-Witness Sacred Trust Controls
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'architecture' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              4-Tier Multi-Tenant Architecture
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 text-sm">
          
          {/* TAB 1: COMPETITOR BENCHMARK MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong className="font-black text-sm block mb-1">Executive Summary for Church Leadership & Procurement Committees:</strong>
                  General church management systems (Planning Center, Breeze, Church Community Builder) do not support denominational Adventist polity (Tithe & Offering split, ACMS quarterly reports, 2-Witness offering counts, multi-class Sabbath School divisions, and Conference sacred trust remittances). eAdventist and legacy tools are siloed and lack real-time local church officer collaboration. <strong>SDA Pro Suite bridges all administrative tiers seamlessly.</strong>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Key Capability</th>
                      <th className="p-3.5 bg-blue-900 text-amber-300 text-center">SDA Pro Suite (This App)</th>
                      <th className="p-3.5 text-center text-slate-300">eAdventist / ACMS</th>
                      <th className="p-3.5 text-center text-slate-300">Planning Center / Breeze</th>
                      <th className="p-3.5 text-center text-slate-300">Paper Ledgers / Excel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        2025 SDA Church Manual Compliance
                        <span className="block text-[10px] text-slate-500 font-normal">Quorum voting, transfer procedures, auxiliary departments</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        100% Native
                      </td>
                      <td className="p-3.5 text-center text-amber-700">Partial (Stats Only)</td>
                      <td className="p-3.5 text-center text-rose-600">
                        <XCircle className="w-4 h-4 mx-auto text-rose-500" />
                      </td>
                      <td className="p-3.5 text-center text-rose-600">Manual / Fragmented</td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        Two-Witness Sacred Trust Controls
                        <span className="block text-[10px] text-slate-500 font-normal">Dual counting, counter-signing, deacon verification</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        Built-in Dual Custody
                      </td>
                      <td className="p-3.5 text-center text-rose-600">
                        <XCircle className="w-4 h-4 mx-auto text-rose-500" />
                      </td>
                      <td className="p-3.5 text-center text-rose-600">
                        <XCircle className="w-4 h-4 mx-auto text-rose-500" />
                      </td>
                      <td className="p-3.5 text-center text-rose-600">High Fraud Risk</td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        Multi-Tier Real-Time Telemetry
                        <span className="block text-[10px] text-slate-500 font-normal">Conference &rarr; District &rarr; Church &rarr; SS Class in 1 view</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        Instant Aggregation
                      </td>
                      <td className="p-3.5 text-center text-amber-700">Delayed Monthly Sync</td>
                      <td className="p-3.5 text-center text-rose-600">Single Church Only</td>
                      <td className="p-3.5 text-center text-rose-600">None (Months Delay)</td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        Sabbath School Daily Study & Transmission
                        <span className="block text-[10px] text-slate-500 font-normal">Lesson study percentages, 13th Sabbath mission offering, superintendent run-sheet</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        Native GC Standard
                      </td>
                      <td className="p-3.5 text-center text-rose-600">
                        <XCircle className="w-4 h-4 mx-auto text-rose-500" />
                      </td>
                      <td className="p-3.5 text-center text-rose-600">Generic Sunday School</td>
                      <td className="p-3.5 text-center text-slate-500">Card & Pencil</td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        Conference Sacred Trust Remittances
                        <span className="block text-[10px] text-slate-500 font-normal">Automated 10th of the month Tithe & Mission transmission</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        Direct Reconciliation
                      </td>
                      <td className="p-3.5 text-center text-amber-700">Separate Web Portal</td>
                      <td className="p-3.5 text-center text-rose-600">Unsupported</td>
                      <td className="p-3.5 text-center text-rose-600">Physical Bank Slips</td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        Ministerial Credentials & Licensing
                        <span className="block text-[10px] text-slate-500 font-normal">Tracking ordained, commissioned, and licensed workers with auto-renewal alerts</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        Full Registry
                      </td>
                      <td className="p-3.5 text-center text-amber-700">Conference Internal Only</td>
                      <td className="p-3.5 text-center text-rose-600">
                        <XCircle className="w-4 h-4 mx-auto text-rose-500" />
                      </td>
                      <td className="p-3.5 text-center text-rose-600">Paper Card Folders</td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">
                        Offline Capability & Relational Backup
                        <span className="block text-[10px] text-slate-500 font-normal">Operates smoothly in low-bandwidth mission fields with MySQL sync</span>
                      </td>
                      <td className="p-3.5 text-center bg-blue-50/50 text-emerald-700 font-black">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 inline mr-1" />
                        Dual Engine (Local + SQL)
                      </td>
                      <td className="p-3.5 text-center text-rose-600">Web-Only (Fails Offline)</td>
                      <td className="p-3.5 text-center text-amber-700">Web-Only</td>
                      <td className="p-3.5 text-center text-rose-600">Prone to Data Loss</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SDA CHURCH MANUAL 2025 ALIGNMENT */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-blue-900 font-black text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Chapter 7 & 8: Church Officers & Elders
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    In accordance with the 2025 Church Manual, the First Elder acts as the spiritual coordinator and executive overseer in the absence of the pastor. Our Church Admin dashboard empowers the Elder to conduct supervisory inspections across Clerks, Treasurers, Superintendents, and Teachers without modifying their private records.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-800 bg-blue-100/60 px-2.5 py-1 rounded-lg w-fit">
                    <Check className="w-3 h-3 text-blue-700" />
                    Elder Supervisory Role-Inspection Engine
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-indigo-900 font-black text-sm">
                    <Users className="w-4 h-4 text-indigo-700" />
                    Chapter 6: Membership & Letter of Transfer
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Membership is sacred. Transfers require two readings before the congregation (First & Second Reading), vote by the church board, and formal issuance of the Church Manual Certificate of Transfer. Our Clerk module enforces this multi-step workflow with zero shortcutting.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-800 bg-indigo-100/60 px-2.5 py-1 rounded-lg w-fit">
                    <Check className="w-3 h-3 text-indigo-700" />
                    2-Reading Formal Transfer Compliance
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-amber-900 font-black text-sm">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                    Chapter 10: Financial Integrity & Sacred Trust
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    "Tithe belongs to the Lord and is to be placed in the sacred storehouse." Treasurers must remit tithes and mission funds promptly by the 10th of each month. Church budget funds cannot be co-mingled with Trust funds. Our Treasury module strictly segments trust vs local budgets.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-lg w-fit">
                    <Check className="w-3 h-3 text-amber-700" />
                    Strict Sacred Trust Non-Commingling Enforcement
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-teal-900 font-black text-sm">
                    <Landmark className="w-4 h-4 text-teal-700" />
                    Chapter 4: Organizing Churches & Companies
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Branch Sabbath Schools transition to Companies and then to Organized Churches under the presiding care of the District Pastor and Conference Executive Committee. Our District and Conference modules coordinate this church planting workflow end-to-end.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-teal-800 bg-teal-100/60 px-2.5 py-1 rounded-lg w-fit">
                    <Check className="w-3 h-3 text-teal-700" />
                    Church Planting & Organization Ledger
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: TWO-WITNESS SACRED TRUST CONTROLS */}
          {activeTab === 'treasury' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h4 className="font-black text-sm text-amber-950 mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  Dual-Custodianship Count Protocol (SDA Church Manual 2025 Edition)
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  The Church Manual explicitly forbids a treasurer from counting loose church offerings alone. At least two authorized officers (the Treasurer and a designated Deacon or Elder) must jointly open the offering plates, count the currency, record denominations, and counter-sign the Official Offering Verification Slip before funds are banked.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center mx-auto mb-2 text-sm">1</div>
                  <h5 className="font-bold text-slate-900 text-xs mb-1">Dual-Officer Opening</h5>
                  <p className="text-[11px] text-slate-600">Offering envelopes & plates unlocked only in the presence of two witnesses.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mx-auto mb-2 text-sm">2</div>
                  <h5 className="font-bold text-slate-900 text-xs mb-1">Denomination Audit</h5>
                  <p className="text-[11px] text-slate-600">Cash, cheques, mobile money, and direct deposits itemized into the dual audit ledger.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center mx-auto mb-2 text-sm">3</div>
                  <h5 className="font-bold text-slate-900 text-xs mb-1">Signed Storehouse Receipt</h5>
                  <p className="text-[11px] text-slate-600">Immutable digital count slip generated, locked, and preserved for conference auditors.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 4-TIER MULTI-TENANT ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest">
                  Enterprise Denominational Hierarchy
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase shrink-0 mt-0.5">Tier 1</span>
                    <div>
                      <strong className="text-white text-xs block">Super Admin (Division / General Administration)</strong>
                      <span className="text-[11px] text-slate-300">Creates Conference entities, provisions President credentials, system-wide telemetry.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase shrink-0 mt-0.5">Tier 2</span>
                    <div>
                      <strong className="text-white text-xs block">Conference President & Officers (Local Conference)</strong>
                      <span className="text-[11px] text-slate-300">Creates Church Districts, assigns District Pastors, audits monthly sacred trust remittances, tracks ACMS deadlines, and manages ministerial credentials.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-black uppercase shrink-0 mt-0.5">Tier 3</span>
                    <div>
                      <strong className="text-white text-xs block">District Pastor (Pastoral Circuit)</strong>
                      <span className="text-[11px] text-slate-300">Coordinates sister churches in the district, oversees company planting, conducts joint communion/ordinances, and exercises pastoral care across congregations.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase shrink-0 mt-0.5">Tier 4</span>
                    <div>
                      <strong className="text-white text-xs block">Local Church Officers (First Elder, Clerk, Treasurer, Superintendent, Teachers)</strong>
                      <span className="text-[11px] text-slate-300">Complete day-to-day operations: membership registers, Sabbath School class attendance, tithe envelope records, board meetings, and auxiliary departments.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for Conference-wide Pilot or Union Deployment</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Close Briefing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientPitchModal;
