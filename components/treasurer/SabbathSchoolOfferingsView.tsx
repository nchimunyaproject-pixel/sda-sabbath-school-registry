import React, { useState } from 'react';
import { SabbathSchoolTransmission } from '../../types';
import { 
  BookOpen, Globe, ShieldAlert, CheckCircle2, Plus, Receipt, 
  Printer, ArrowUpRight, DollarSign, Calendar, HeartHandshake,
  Sparkles, Lock, AlertOctagon
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../../utils/currency';

interface SabbathSchoolOfferingsViewProps {
  transmissions: SabbathSchoolTransmission[];
  currentChurchUser: { name: string; churchName?: string; id: string };
  onRecordTransmission: (data: Omit<SabbathSchoolTransmission, 'id' | 'churchId' | 'receiptNumber'>) => void;
}

export const SabbathSchoolOfferingsView: React.FC<SabbathSchoolOfferingsViewProps> = ({
  transmissions,
  currentChurchUser,
  onRecordTransmission
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedForReceipt, setSelectedForReceipt] = useState<SabbathSchoolTransmission | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [secretaryName, setSecretaryName] = useState('Sister Mwamba (SS Secretary)');
  const [regularMissionOffering, setRegularMissionOffering] = useState('');
  const [thirteenthSabbathOffering, setThirteenthSabbathOffering] = useState('');
  const [birthdayThankOffering, setBirthdayThankOffering] = useState('');
  const [missionInvestment, setMissionInvestment] = useState('');
  const [sabbathSchoolExpense, setSabbathSchoolExpense] = useState('');
  const [nonRetentionPledge, setNonRetentionPledge] = useState(true);

  const calculatedMissionTotal = 
    (parseFloat(regularMissionOffering) || 0) +
    (parseFloat(thirteenthSabbathOffering) || 0) +
    (parseFloat(birthdayThankOffering) || 0) +
    (parseFloat(missionInvestment) || 0);

  const grandWeeklyTotal = calculatedMissionTotal + (parseFloat(sabbathSchoolExpense) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nonRetentionPledge) {
      alert("Church Manual Mandate: 100% of Sabbath School mission offerings must be allocated to world missions. None can be retained locally.");
      return;
    }

    onRecordTransmission({
      date,
      secretaryName: secretaryName.trim(),
      treasurerName: currentChurchUser.name,
      regularMissionOffering: parseFloat(regularMissionOffering) || 0,
      thirteenthSabbathOffering: parseFloat(thirteenthSabbathOffering) || 0,
      birthdayThankOffering: parseFloat(birthdayThankOffering) || 0,
      missionInvestment: parseFloat(missionInvestment) || 0,
      sabbathSchoolExpense: parseFloat(sabbathSchoolExpense) || 0,
      totalMissionAmount: calculatedMissionTotal,
      acknowledgedReceiptGiven: true,
      status: 'received'
    });

    setIsRecording(false);
    setRegularMissionOffering('');
    setThirteenthSabbathOffering('');
    setBirthdayThankOffering('');
    setMissionInvestment('');
    setSabbathSchoolExpense('');
  };

  const allTimeMissionCollected = transmissions.reduce((sum, t) => sum + t.totalMissionAmount, 0);

  return (
    <div className="space-y-10">
      {/* Church Manual Section 3 Hero */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5" /> Church Manual Section 3: Sabbath School & Mission Offerings
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              100% World Mission Allocation & Immediate Transmission
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm font-medium leading-relaxed">
              The treasurer receives all offerings collected during Sabbath School from the <strong>Sabbath School Secretary</strong> as soon as possible on Sabbath. Under the division's offering plan, all <strong>weekly Sabbath School offerings</strong>, <strong>Thirteenth Sabbath Offerings</strong>, <strong>Birthday-Thank Offerings</strong>, and <strong>Mission Investment funds</strong> must be transmitted in their entirety to the conference for global missions. <em>No mission offerings can be retained by the local church.</em>
            </p>
          </div>
          <button
            onClick={() => setIsRecording(true)}
            className="px-6 py-4 bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Receive Secretary Handover
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Mission Offerings ({CURRENCY_CODE})</span>
            <Globe className="w-5 h-5 text-blue-900" />
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {formatKwacha(allTimeMissionCollected)}
          </h3>
          <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Routed to Conference World Field
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Zero Retention Guarantee</span>
            <Lock className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-3xl font-black text-rose-950">0.00%</h3>
          <p className="text-[11px] font-bold text-rose-700 mt-2 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Local church retains zero mission dollars
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Secretary Handover Log</span>
            <Receipt className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-black text-slate-900">{transmissions.length} Sabbaths</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-2">
            Double-receipted with SS Secretary
          </p>
        </div>
      </div>

      {/* Transmission Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-900" />
              Sabbath School Secretary Weekly Transmission Records
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Offerings received immediately upon close of Sabbath School session
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-3 px-4">Receipt # & Date</th>
                <th className="pb-3 px-4">Handed Over By</th>
                <th className="pb-3 px-4 text-right">Regular Mission</th>
                <th className="pb-3 px-4 text-right">13th Sabbath</th>
                <th className="pb-3 px-4 text-right">Birthday / Thank</th>
                <th className="pb-3 px-4 text-right">Investment</th>
                <th className="pb-3 px-4 text-right">Total World Mission</th>
                <th className="pb-3 px-4 text-center">Secretary Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {transmissions.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-mono font-black text-slate-900 text-sm">{record.receiptNumber}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">{record.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{record.secretaryName}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Received by: {record.treasurerName}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900">
                    {formatKwacha(record.regularMissionOffering)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-amber-900">
                    {formatKwacha(record.thirteenthSabbathOffering)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-purple-900">
                    {formatKwacha(record.birthdayThankOffering)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-emerald-900">
                    {formatKwacha(record.missionInvestment)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-blue-950 text-sm">
                    {formatKwacha(record.totalMissionAmount)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedForReceipt(record)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <Receipt className="w-3 h-3" /> View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover Modal */}
      {isRecording && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Receive Sabbath School Secretary Handover
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Church Manual Section 3: 100% Mission Transmission
                </p>
              </div>
              <button
                onClick={() => setIsRecording(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Sabbath Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Sabbath School Secretary Name
                  </label>
                  <input
                    type="text"
                    required
                    value={secretaryName}
                    onChange={(e) => setSecretaryName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              {/* Itemized Offerings */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
                  Mission Allocations (100% Forwarded to Conference)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Regular Weekly SS Offering ({CURRENCY_SYMBOL})</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={regularMissionOffering}
                      onChange={(e) => setRegularMissionOffering(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Thirteenth Sabbath Offering ({CURRENCY_SYMBOL})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={thirteenthSabbathOffering}
                      onChange={(e) => setThirteenthSabbathOffering(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Birthday-Thank Offering ({CURRENCY_SYMBOL})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={birthdayThankOffering}
                      onChange={(e) => setBirthdayThankOffering(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Mission Investment Funds ({CURRENCY_SYMBOL})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={missionInvestment}
                      onChange={(e) => setMissionInvestment(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-black text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Local Sabbath School Expense ({CURRENCY_SYMBOL}) (If collected separately under local budget plan)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sabbathSchoolExpense}
                    onChange={(e) => setSabbathSchoolExpense(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center text-xs font-black">
                  <span className="text-slate-600">Total Transmitted to World Mission:</span>
                  <span className="text-blue-900 text-sm">
                    {formatKwacha(calculatedMissionTotal)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="nonRetentionPledgeCheck"
                  checked={nonRetentionPledge}
                  onChange={(e) => setNonRetentionPledge(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-950 focus:ring-blue-950"
                />
                <label htmlFor="nonRetentionPledgeCheck" className="text-xs text-indigo-950 font-medium">
                  <strong>Church Manual Affirmation:</strong> I confirm that all mission funds will be remitted 100% to the Conference Treasurer for global mission fields and none retained by the local congregation.
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!nonRetentionPledge || grandWeeklyTotal <= 0}
                  className="flex-1 py-3.5 bg-blue-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4 text-amber-400" /> Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Sabbath School Receipt Modal */}
      {selectedForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-950 text-white rounded-xl flex items-center justify-center font-black">
                  SDA
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                    Official Treasury Receipt
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Sabbath School Offering Handover
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedForReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedForReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Received:</span>
                <span className="font-bold text-slate-900">{selectedForReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Received From:</span>
                <span className="font-bold text-slate-900">{selectedForReceipt.secretaryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Treasurer In Custody:</span>
                <span className="font-bold text-slate-900">{selectedForReceipt.treasurerName}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Regular World Mission:</span>
                <span className="font-bold text-slate-900">{formatKwacha(selectedForReceipt.regularMissionOffering)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Thirteenth Sabbath:</span>
                <span className="font-bold text-slate-900">{formatKwacha(selectedForReceipt.thirteenthSabbathOffering)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Birthday-Thank Offering:</span>
                <span className="font-bold text-slate-900">{formatKwacha(selectedForReceipt.birthdayThankOffering)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Mission Investment:</span>
                <span className="font-bold text-slate-900">{formatKwacha(selectedForReceipt.missionInvestment)}</span>
              </div>
              {!!selectedForReceipt.sabbathSchoolExpense && (
                <div className="flex justify-between py-1.5 text-slate-500">
                  <span>Local SS Expense (Local Church):</span>
                  <span>{formatKwacha(selectedForReceipt.sabbathSchoolExpense)}</span>
                </div>
              )}
              <div className="flex justify-between py-2.5 text-sm font-black text-slate-900 border-t-2 border-slate-900">
                <span>Total Received Handover:</span>
                <span className="text-blue-950">{formatKwacha(selectedForReceipt.totalMissionAmount + (selectedForReceipt.sabbathSchoolExpense || 0))}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official copy preserved for conference auditing and SS Secretary records.</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
