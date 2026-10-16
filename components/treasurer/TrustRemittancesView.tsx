import React, { useState } from 'react';
import { ConferenceRemittance } from '../../types';
import { 
  ShieldAlert, Lock, Send, CheckCircle2, AlertTriangle, FileDown, 
  Printer, ArrowUpRight, DollarSign, Calendar, Clock, Landmark, 
  ExternalLink, Sparkles, Building, AlertOctagon
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../../utils/currency';

interface TrustRemittancesViewProps {
  remittances: ConferenceRemittance[];
  currentChurchUser: { name: string; churchName?: string; id: string };
  onCompileRemittance: (remittance: Omit<ConferenceRemittance, 'id' | 'churchId'>) => void;
  onAcknowledgeReceipt: (id: string, conferenceReceiptNo: string) => void;
  unremittedTithe: number;
  unremittedMission: number;
  unremittedThirteenthSabbath: number;
  unremittedBirthdayThank: number;
  unremittedInvestment: number;
  unremittedSpecialProjects: number;
}

export const TrustRemittancesView: React.FC<TrustRemittancesViewProps> = ({
  remittances,
  currentChurchUser,
  onCompileRemittance,
  onAcknowledgeReceipt,
  unremittedTithe,
  unremittedMission,
  unremittedThirteenthSabbath,
  unremittedBirthdayThank,
  unremittedInvestment,
  unremittedSpecialProjects
}) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedRemittanceForPrint, setSelectedRemittanceForPrint] = useState<ConferenceRemittance | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [conferenceReceiptInput, setConferenceReceiptInput] = useState('');

  // Compilation form state
  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [titheInput, setTitheInput] = useState(unremittedTithe.toString());
  const [missionInput, setMissionInput] = useState(unremittedMission.toString());
  const [thirteenthInput, setThirteenthInput] = useState(unremittedThirteenthSabbath.toString());
  const [birthdayInput, setBirthdayInput] = useState(unremittedBirthdayThank.toString());
  const [investmentInput, setInvestmentInput] = useState(unremittedInvestment.toString());
  const [specialProjectsInput, setSpecialProjectsInput] = useState(unremittedSpecialProjects.toString());
  const [confTreasurerName, setConfTreasurerName] = useState('Elder M. S. Katulwende (Conference Treasurer)');
  const [bankTransferRef, setBankTransferRef] = useState(`EFT-CONF-${Date.now().toString().slice(-6)}`);
  const [isPledgeConfirmed, setIsPledgeConfirmed] = useState(false);

  const totalCompiled = 
    (parseFloat(titheInput) || 0) +
    (parseFloat(missionInput) || 0) +
    (parseFloat(thirteenthInput) || 0) +
    (parseFloat(birthdayInput) || 0) +
    (parseFloat(investmentInput) || 0) +
    (parseFloat(specialProjectsInput) || 0);

  const totalUnremittedTrust = 
    unremittedTithe + unremittedMission + unremittedThirteenthSabbath + 
    unremittedBirthdayThank + unremittedInvestment + unremittedSpecialProjects;

  const handleCompileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPledgeConfirmed) {
      alert("Church Manual Mandate: You must sign the Non-Diversion Pledge confirming that zero sacred trust funds are retained or borrowed locally.");
      return;
    }

    onCompileRemittance({
      monthYear,
      remittanceNumber: `REM-CONF-${monthYear}-${Date.now().toString().slice(-4)}`,
      dateRemitted: new Date().toISOString().split('T')[0],
      titheAmount: parseFloat(titheInput) || 0,
      regularMissionAmount: parseFloat(missionInput) || 0,
      thirteenthSabbathAmount: parseFloat(thirteenthInput) || 0,
      birthdayThankAmount: parseFloat(birthdayInput) || 0,
      missionInvestmentAmount: parseFloat(investmentInput) || 0,
      specialConferenceProjectsAmount: parseFloat(specialProjectsInput) || 0,
      totalRemittance: totalCompiled,
      conferenceTreasurerName: confTreasurerName.trim(),
      bankTransferRef: bankTransferRef.trim(),
      nonDiversionPledgeConfirmed: true,
      status: 'pending_remittance'
    });

    setIsCompiling(false);
    setIsPledgeConfirmed(false);
  };

  const handleAcknowledgeSubmit = (id: string) => {
    if (!conferenceReceiptInput.trim()) return;
    onAcknowledgeReceipt(id, conferenceReceiptInput.trim());
    setAcknowledgingId(null);
    setConferenceReceiptInput('');
  };

  return (
    <div className="space-y-10">
      {/* Strict Non-Diversion Rule Hero */}
      <div className="bg-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" /> Church Manual Section 2: Strict Monthly Remittance
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Sacred Trust Funds & Zero Local Diversion
            </h2>
            <p className="text-rose-200 text-xs sm:text-sm font-medium leading-relaxed">
              Conference funds—including <strong>Tithe</strong>, <strong>World Mission</strong>, and <strong>Special Conference Offerings</strong>—are sacred trust. Under no circumstances may the treasurer or the church board borrow, withhold, or use conference trust funds for local church expenses, debt payments, or any other unauthorized purpose. <strong>100% must be remitted monthly to the Conference Treasurer.</strong>
            </p>
          </div>
          <button
            onClick={() => {
              setTitheInput(unremittedTithe.toString());
              setMissionInput(unremittedMission.toString());
              setThirteenthInput(unremittedThirteenthSabbath.toString());
              setBirthdayInput(unremittedBirthdayThank.toString());
              setInvestmentInput(unremittedInvestment.toString());
              setSpecialProjectsInput(unremittedSpecialProjects.toString());
              setIsCompiling(true);
            }}
            className="px-6 py-4 bg-white text-rose-950 hover:bg-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4 text-rose-700" /> Compile Monthly Remittance
          </button>
        </div>
      </div>

      {/* Current Month Unremitted Trust Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
              <Lock className="w-6 h-6 text-rose-600" />
              Accumulated Trust Funds Awaiting Conference Remittance
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Held in trust • Transmitted in entirety at end of current monthly cycle
            </p>
          </div>
          <div className="px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">Total Due to Conference ({CURRENCY_CODE})</span>
            <span className="text-2xl font-black text-rose-950">
              {formatKwacha(totalUnremittedTrust)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tithe (10%)</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {formatKwacha(unremittedTithe)}
            </span>
            <span className="text-[9px] text-rose-600 font-bold uppercase mt-1 block">Conference Ministry</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">World Mission</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {formatKwacha(unremittedMission)}
            </span>
            <span className="text-[9px] text-blue-600 font-bold uppercase mt-1 block">Global Mission Fields</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">13th Sabbath</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {formatKwacha(unremittedThirteenthSabbath)}
            </span>
            <span className="text-[9px] text-amber-600 font-bold uppercase mt-1 block">Division Projects</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Birthday-Thank</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {formatKwacha(unremittedBirthdayThank)}
            </span>
            <span className="text-[9px] text-purple-600 font-bold uppercase mt-1 block">Global Evangelism</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mission Invest</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {formatKwacha(unremittedInvestment)}
            </span>
            <span className="text-[9px] text-emerald-600 font-bold uppercase mt-1 block">SS Investment</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Special Projects</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {formatKwacha(unremittedSpecialProjects)}
            </span>
            <span className="text-[9px] text-indigo-600 font-bold uppercase mt-1 block">Conference Projects</span>
          </div>
        </div>
      </div>

      {/* Historical Conference Remittances Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
              <Landmark className="w-6 h-6 text-blue-900" />
              Conference Remittance Archive & Acknowledgment Log
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Permanent audit trail of end-of-month transmissions to the Conference Treasury
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {remittances.length} Monthly Remittances Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-3 px-4">Period / Voucher #</th>
                <th className="pb-3 px-4">Remittance Date</th>
                <th className="pb-3 px-4 text-right">Tithe</th>
                <th className="pb-3 px-4 text-right">World Mission</th>
                <th className="pb-3 px-4 text-right">Total Remitted</th>
                <th className="pb-3 px-4">Transfer Ref</th>
                <th className="pb-3 px-4">Conf. Receipt #</th>
                <th className="pb-3 px-4 text-center">Status & Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {remittances.map((remit) => {
                const isAcknowledged = remit.status === 'remitted_acknowledged';
                return (
                  <tr key={remit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-black text-slate-900 text-sm">{remit.monthYear}</span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{remit.remittanceNumber}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-600">
                      {remit.dateRemitted}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      {formatKwacha(remit.titheAmount)}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      {formatKwacha(remit.regularMissionAmount + remit.thirteenthSabbathAmount)}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-rose-900 text-sm">
                      {formatKwacha(remit.totalRemittance)}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                      {remit.bankTransferRef}
                    </td>
                    <td className="py-4 px-4">
                      {remit.conferenceReceiptNumber ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-mono font-bold rounded-lg border border-emerald-200 text-[10px]">
                          {remit.conferenceReceiptNumber}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setAcknowledgingId(remit.id);
                            setConferenceReceiptInput('');
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px] border border-amber-200"
                        >
                          + Record Receipt
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedRemittanceForPrint(remit)}
                          className="p-2 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-slate-600 transition-colors"
                          title="Print Conference Remittance Statement"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isAcknowledged ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isAcknowledged ? 'Acknowledged' : 'Pending Receipt'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compile Monthly Remittance Modal */}
      {isCompiling && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Compile Monthly Conference Remittance
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Compilation of 100% of Sacred Trust Funds
                </p>
              </div>
              <button
                onClick={() => setIsCompiling(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Remittance Period (Month/Year)
                  </label>
                  <input
                    type="month"
                    required
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    EFT / Bank Transfer Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={bankTransferRef}
                    onChange={(e) => setBankTransferRef(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Conference Treasurer Recipient
                </label>
                <input
                  type="text"
                  required
                  value={confTreasurerName}
                  onChange={(e) => setConfTreasurerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                />
              </div>

              {/* Itemized Trust Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
                  Itemized Sacred Trust Sums ({CURRENCY_CODE})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tithe (100% Remitted)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={titheInput}
                      onChange={(e) => setTitheInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Regular World Mission</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={missionInput}
                      onChange={(e) => setMissionInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Thirteenth Sabbath</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={thirteenthInput}
                      onChange={(e) => setThirteenthInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Birthday-Thank Offering</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={birthdayInput}
                      onChange={(e) => setBirthdayInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Mission Investment</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={investmentInput}
                      onChange={(e) => setInvestmentInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Special Conference Projects</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={specialProjectsInput}
                      onChange={(e) => setSpecialProjectsInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Grand Total Remittance to Conference:</span>
                  <span className="text-xl text-rose-950 font-black">
                    {formatKwacha(totalCompiled)}
                  </span>
                </div>
              </div>

              {/* Mandatory Non-Diversion Pledge */}
              <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="nonDiversionPledgeCheck"
                  checked={isPledgeConfirmed}
                  onChange={(e) => setIsPledgeConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-rose-900 focus:ring-rose-900"
                />
                <label htmlFor="nonDiversionPledgeCheck" className="text-xs text-rose-950 font-medium">
                  <strong>Non-Diversion Pledge (Church Manual Mandate):</strong> I solemnly attest as church treasurer that this represents 100% of sacred tithes and conference mission funds collected, and that no portion has been borrowed, diverted, or withheld for local operating bills, construction, or debt.
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompiling(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPledgeConfirmed || totalCompiled <= 0}
                  className="flex-1 py-3.5 bg-rose-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit & Generate Remittance Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Conference Receipt Modal */}
      {acknowledgingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-100">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Record Conference Official Receipt
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Enter the official receipt number returned by the local Conference Treasury upon receiving this bank transfer.
            </p>
            <input
              type="text"
              required
              placeholder="e.g. CR-LUS-2026-9142"
              value={conferenceReceiptInput}
              onChange={(e) => setConferenceReceiptInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-900"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAcknowledgingId(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcknowledgeSubmit(acknowledgingId)}
                className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all"
              >
                Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Official Conference Remittance Statement Modal */}
      {selectedRemittanceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 sm:p-12 space-y-8 border border-slate-100 max-h-[90vh] overflow-y-auto print:max-h-none">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-950 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                  SDA
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    Seventh-day Adventist Church
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {currentChurchUser.churchName || 'Local Congregation'} • Conference Remittance Statement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRemittanceForPrint(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Voucher Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Period</span>
                <span className="font-black text-slate-900 text-sm">{selectedRemittanceForPrint.monthYear}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Remittance Voucher</span>
                <span className="font-mono font-bold text-slate-900">{selectedRemittanceForPrint.remittanceNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Transfer Ref</span>
                <span className="font-mono font-bold text-slate-900">{selectedRemittanceForPrint.bankTransferRef}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Conf. Receipt #</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedRemittanceForPrint.conferenceReceiptNumber || 'Pending Confirmation'}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-wider text-slate-700">
                    <th className="py-2">Account Code & Sacred Trust Description</th>
                    <th className="py-2 text-right">Fund Type</th>
                    <th className="py-2 text-right">Amount ({CURRENCY_CODE})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-bold text-slate-900">101 - Tithe (Sacred Holy to the Lord)</td>
                    <td className="py-3 text-right text-slate-500 font-medium">Conference Ministry</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatKwacha(selectedRemittanceForPrint.titheAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">201 - Regular Sabbath School World Mission Offering</td>
                    <td className="py-3 text-right text-slate-500 font-medium">Global Mission Fields</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatKwacha(selectedRemittanceForPrint.regularMissionAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">202 - Thirteenth Sabbath Offering</td>
                    <td className="py-3 text-right text-slate-500 font-medium">Division Mission Projects</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatKwacha(selectedRemittanceForPrint.thirteenthSabbathAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">203 - Birthday-Thank Offering</td>
                    <td className="py-3 text-right text-slate-500 font-medium">World Evangelism</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatKwacha(selectedRemittanceForPrint.birthdayThankAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">204 - Mission Investment Funds</td>
                    <td className="py-3 text-right text-slate-500 font-medium">SS Investment Projects</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatKwacha(selectedRemittanceForPrint.missionInvestmentAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">301 - Special Conference Projects & Evangelism</td>
                    <td className="py-3 text-right text-slate-500 font-medium">Local Conference Evangelism</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatKwacha(selectedRemittanceForPrint.specialConferenceProjectsAmount)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 text-sm font-black">
                    <td colSpan={2} className="py-4 uppercase tracking-wider text-slate-900">
                      Total Remittance Handed Over to Conference:
                    </td>
                    <td className="py-4 text-right text-rose-950 font-black text-base">
                      {formatKwacha(selectedRemittanceForPrint.totalRemittance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">
                  Remitted By Local Church Treasurer:
                </span>
                <div className="border-b border-slate-900 pb-1 font-black text-slate-900">
                  {currentChurchUser.name}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Church Treasurer • Date: {selectedRemittanceForPrint.dateRemitted}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">
                  Acknowledged By Conference Treasurer:
                </span>
                <div className="border-b border-slate-900 pb-1 font-black text-slate-900">
                  {selectedRemittanceForPrint.conferenceTreasurerName}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Conference Treasury Department</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Remittance Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
