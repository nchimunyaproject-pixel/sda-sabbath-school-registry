import React, { useState } from 'react';
import { DisbursementRecord, AuxiliaryDepartment } from '../../types';
import { 
  Building2, Users, Receipt, FileText, CheckCircle2, Plus, 
  ArrowUpRight, ArrowDownRight, ShieldCheck, Lock, AlertTriangle, 
  Printer, DollarSign, Scale, ExternalLink, Sparkles
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../../utils/currency';

interface DisbursementsAndAuxiliaryViewProps {
  disbursements: DisbursementRecord[];
  auxiliaryDepartments: AuxiliaryDepartment[];
  currentChurchUser: { name: string; churchName?: string; id: string };
  onAddDisbursement: (disbursement: Omit<DisbursementRecord, 'id' | 'churchId' | 'voucherNumber'>) => void;
  onReceiveAuxiliaryFunds: (auxId: string, amount: number, donorNote: string) => void;
}

export const DisbursementsAndAuxiliaryView: React.FC<DisbursementsAndAuxiliaryViewProps> = ({
  disbursements,
  auxiliaryDepartments,
  currentChurchUser,
  onAddDisbursement,
  onReceiveAuxiliaryFunds
}) => {
  const [activeTab, setActiveTab] = useState<'disbursements' | 'auxiliary'>('disbursements');
  const [isAddingDisbursement, setIsAddingDisbursement] = useState(false);
  const [isReceivingAuxFunds, setIsReceivingAuxFunds] = useState(false);
  const [selectedDisbursementForPrint, setSelectedDisbursementForPrint] = useState<DisbursementRecord | null>(null);

  // New disbursement state
  const [payee, setPayee] = useState('');
  const [fundCategory, setFundCategory] = useState<'local_church' | 'auxiliary'>('local_church');
  const [fundName, setFundName] = useState('Church Operating Budget - General Expense');
  const [amount, setAmount] = useState('');
  const [boardMinuteRef, setBoardMinuteRef] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Dr. Hastings Phiri (Board Chair)');
  const [paymentMethod, setPaymentMethod] = useState<'check' | 'bank_transfer' | 'petty_cash'>('bank_transfer');
  const [checkOrRefNumber, setCheckOrRefNumber] = useState('');
  const [description, setDescription] = useState('');
  const [billVoucherAttached, setBillVoucherAttached] = useState(true);
  const [auxiliaryOrderSigned, setAuxiliaryOrderSigned] = useState(false);
  const [receiptIssuedToDepartment, setReceiptIssuedToDepartment] = useState(false);

  // Receive auxiliary funds state
  const [selectedAuxId, setSelectedAuxId] = useState(auxiliaryDepartments[0]?.id || '');
  const [auxAmount, setAuxAmount] = useState('');
  const [auxNote, setAuxNote] = useState('');
  const [receivedSecretaryReceiptGiven, setReceivedSecretaryReceiptGiven] = useState(true);

  const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);
  const totalAuxiliaryHeld = auxiliaryDepartments.reduce((sum, a) => sum + a.currentBalance, 0);

  const handleDisbursementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundCategory === 'local_church' && !boardMinuteRef.trim()) {
      alert("Church Manual Mandate: Local church disbursements require a valid Church Board minute vote or Business Meeting resolution reference.");
      return;
    }
    if (fundCategory === 'auxiliary' && !auxiliaryOrderSigned) {
      alert("Church Manual Mandate: Auxiliary funds can ONLY be disbursed upon the direct written order of the auxiliary department head.");
      return;
    }

    onAddDisbursement({
      date: new Date().toISOString().split('T')[0],
      payee: payee.trim(),
      fundCategory,
      fundName: fundName.trim(),
      amount: parseFloat(amount) || 0,
      boardMinuteRef: boardMinuteRef.trim(),
      authorizedBy: authorizedBy.trim(),
      auxiliaryOrderSigned: fundCategory === 'auxiliary' ? auxiliaryOrderSigned : undefined,
      billVoucherAttached,
      receiptIssuedToDepartment: fundCategory === 'auxiliary' ? receiptIssuedToDepartment : undefined,
      paymentMethod,
      checkOrRefNumber: checkOrRefNumber.trim() || undefined,
      description: description.trim(),
      status: billVoucherAttached ? 'receipt_attached' : 'disbursed'
    });

    setIsAddingDisbursement(false);
    setPayee('');
    setAmount('');
    setDescription('');
    setBoardMinuteRef('');
  };

  const handleReceiveAuxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(auxAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    onReceiveAuxiliaryFunds(selectedAuxId, parsedAmt, auxNote.trim());
    setIsReceivingAuxFunds(false);
    setAuxAmount('');
    setAuxNote('');
  };

  return (
    <div className="space-y-10">
      {/* Church Manual Mandate Section 4 Hero */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Church Manual Section 4: Local & Auxiliary Funds
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Board-Voted Disbursements & Auxiliary Department Oversight
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm font-medium leading-relaxed">
              Local church funds belong to the local congregation and may be disbursed <strong>only when authorized by the church board or a business meeting</strong>. Funds raised by auxiliary organizations (such as Youth Ministries, Dorcas, or Family Life) are held in trust and may <strong>only be disbursed upon direct order of the auxiliary department</strong>. They cannot be borrowed or diverted for other church purposes. Double-receipting is strictly mandated.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setIsReceivingAuxFunds(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4 text-emerald-400" /> Intake Auxiliary Funds
            </button>
            <button
              onClick={() => setIsAddingDisbursement(true)}
              className="px-6 py-3.5 bg-emerald-400 text-slate-950 hover:bg-emerald-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Authorized Disbursement
            </button>
          </div>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('disbursements')}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'disbursements'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Board-Voted Disbursements ({disbursements.length})
        </button>
        <button
          onClick={() => setActiveTab('auxiliary')}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'auxiliary'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Auxiliary Department Ledgers ({auxiliaryDepartments.length})
        </button>
      </div>

      {/* TAB 1: DISBURSEMENTS TABLE */}
      {activeTab === 'disbursements' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-700" />
                Authorized Church Disbursement Vouchers
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Every payout verified by voted minute reference • Attached receipted bills
              </p>
            </div>
            <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Disbursed ({CURRENCY_CODE})</span>
              <span className="text-xl font-black text-slate-900">
                {formatKwacha(totalDisbursed)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 px-4">Voucher # & Date</th>
                  <th className="pb-3 px-4">Payee & Purpose</th>
                  <th className="pb-3 px-4">Fund Classification</th>
                  <th className="pb-3 px-4">Authority Minute / Order</th>
                  <th className="pb-3 px-4 text-right">Amount ({CURRENCY_CODE})</th>
                  <th className="pb-3 px-4 text-center">Receipted Bill</th>
                  <th className="pb-3 px-4 text-center">Print Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {disbursements.map((disb) => (
                  <tr key={disb.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-black text-slate-900 text-sm">{disb.voucherNumber}</span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{disb.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-black text-slate-900">{disb.payee}</div>
                      <div className="text-[11px] text-slate-500 font-medium line-clamp-1">{disb.description}</div>
                      {disb.checkOrRefNumber && (
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">Ref: {disb.checkOrRefNumber}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        disb.fundCategory === 'auxiliary'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}>
                        {disb.fundCategory === 'auxiliary' ? 'Auxiliary Fund' : 'Local Church Fund'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 block mt-1">{disb.fundName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                        {disb.boardMinuteRef}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium mt-0.5">By: {disb.authorizedBy}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                      {formatKwacha(disb.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {disb.billVoucherAttached ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Pending Bill
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedDisbursementForPrint(disb)}
                        className="p-2 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-slate-600 transition-colors inline-block"
                        title="Print Disbursement Voucher"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUXILIARY LEDGERS */}
      {activeTab === 'auxiliary' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <Users className="w-6 h-6 text-amber-600" />
                Auxiliary Organizations Dedicated Ledgers
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Held in sacred trust for departments • Non-diversion policy enforced
              </p>
            </div>
            <div className="px-5 py-2.5 bg-amber-50 border border-amber-100 rounded-2xl text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">Total Auxiliary Balances ({CURRENCY_CODE})</span>
              <span className="text-xl font-black text-amber-950">
                {formatKwacha(totalAuxiliaryHeld)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auxiliaryDepartments.map((dept) => (
              <div key={dept.id} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-amber-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Auxiliary Sub-Account
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Ringfenced
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{dept.name}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Leader: <strong className="text-slate-700">{dept.leaderName}</strong> • Sec: {dept.secretaryName}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Balance</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatKwacha(dept.currentBalance)}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 font-medium space-y-1">
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    May only be disbursed upon order of {dept.leaderName}.
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Double-receipting applied on all handovers.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedAuxId(dept.id);
                    setIsReceivingAuxFunds(true);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" /> Deposit Funds to {dept.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Disbursement Modal */}
      {isAddingDisbursement && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Create Authorized Disbursement Voucher
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Church Manual Section 4 Compliance
                </p>
              </div>
              <button
                onClick={() => setIsAddingDisbursement(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisbursementSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Payee Name / Vendor / Entity
                  </label>
                  <input
                    type="text"
                    required
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    placeholder="e.g. ZESCO / Ruth Bwalya (AYM) / City Cleaners"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Amount to Disburse ({CURRENCY_CODE})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-lg outline-none focus:border-blue-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Fund Category
                  </label>
                  <select
                    value={fundCategory}
                    onChange={(e) => {
                      const cat = e.target.value as 'local_church' | 'auxiliary';
                      setFundCategory(cat);
                      if (cat === 'local_church') {
                        setFundName('Church Operating Budget - Utilities');
                      } else {
                        setFundName('Adventist Youth Ministries (AYM)');
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  >
                    <option value="local_church">Local Church Fund (Board Voted)</option>
                    <option value="auxiliary">Auxiliary Department Fund (Department Ordered)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Fund Sub-Account
                  </label>
                  <input
                    type="text"
                    required
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              {/* Minute reference / order input */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
                  {fundCategory === 'local_church'
                    ? 'Church Board / Business Meeting Minute Authorization (Mandatory)'
                    : 'Auxiliary Department Executive Order (Mandatory)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={boardMinuteRef}
                    onChange={(e) => setBoardMinuteRef(e.target.value)}
                    placeholder={fundCategory === 'local_church' ? 'e.g. MIN-2026-08-04' : 'e.g. AYM Order #2026-05'}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    placeholder="Authorized Officer Name & Title"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Disbursement Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  >
                    <option value="bank_transfer">Electronic Bank Transfer (EFT)</option>
                    <option value="check">Church Bank Check</option>
                    <option value="petty_cash">Petty Cash Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Check / Transaction Reference Number
                  </label>
                  <input
                    type="text"
                    value={checkOrRefNumber}
                    onChange={(e) => setCheckOrRefNumber(e.target.value)}
                    placeholder="e.g. CHK-10492 or FT-994182"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Purpose / Expenditure Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown of goods, services, or relief provided..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 outline-none focus:border-blue-900"
                />
              </div>

              {/* Compliance Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="billVoucherCheck"
                    checked={billVoucherAttached}
                    onChange={(e) => setBillVoucherAttached(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-700"
                  />
                  <label htmlFor="billVoucherCheck" className="text-xs text-slate-700 font-medium">
                    <strong>Voucher Mandate:</strong> Receipted bill, store invoice, or cash slip is attached to this voucher.
                  </label>
                </div>

                {fundCategory === 'auxiliary' && (
                  <>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="auxOrderCheck"
                        checked={auxiliaryOrderSigned}
                        onChange={(e) => setAuxiliaryOrderSigned(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-700"
                      />
                      <label htmlFor="auxOrderCheck" className="text-xs text-slate-700 font-medium">
                        <strong>Auxiliary Trust Order:</strong> Direct written approval signed by Auxiliary Department Leader.
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="deptReceiptCheck"
                        checked={receiptIssuedToDepartment}
                        onChange={(e) => setReceiptIssuedToDepartment(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-700"
                      />
                      <label htmlFor="deptReceiptCheck" className="text-xs text-slate-700 font-medium">
                        <strong>Double-Receipting:</strong> Signed reimbursement voucher obtained from the auxiliary recipient.
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingDisbursement(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-emerald-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Disburse & Generate Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Auxiliary Funds Modal */}
      {isReceivingAuxFunds && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Intake Auxiliary Organization Funds
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  Church Manual Section 4: Prompt Turnover & Trust
                </p>
              </div>
              <button
                onClick={() => setIsReceivingAuxFunds(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReceiveAuxSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Auxiliary Department
                </label>
                <select
                  value={selectedAuxId}
                  onChange={(e) => setSelectedAuxId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                >
                  {auxiliaryDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} (Current: {formatKwacha(dept.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Amount Turned Over ({CURRENCY_CODE})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={auxAmount}
                  onChange={(e) => setAuxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-lg outline-none focus:border-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Activity Source / Notes
                </label>
                <input
                  type="text"
                  value={auxNote}
                  onChange={(e) => setAuxNote(e.target.value)}
                  placeholder="e.g. Youth bake sale proceeds / Dorcas welfare donation"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 outline-none focus:border-blue-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>An official receipt will be issued to the auxiliary secretary immediately.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReceivingAuxFunds(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Disbursement Voucher Modal */}
      {selectedDisbursementForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-950 text-white rounded-xl flex items-center justify-center font-black">
                  SDA
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                    Disbursement Voucher
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {currentChurchUser.churchName || 'Local Seventh-day Adventist Church'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDisbursementForPrint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Voucher Number</span>
                <span className="font-mono font-black text-slate-900 text-sm">{selectedDisbursementForPrint.voucherNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Disbursed</span>
                <span className="font-bold text-slate-900">{selectedDisbursementForPrint.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payee / Claimant</span>
                <span className="font-bold text-slate-900">{selectedDisbursementForPrint.payee}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Paid</span>
                <span className="font-black text-emerald-900 text-sm">
                  {formatKwacha(selectedDisbursementForPrint.amount)}
                </span>
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Fund Debited:</span>
                <span className="font-bold text-slate-900">{selectedDisbursementForPrint.fundName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Minute / Order Authorization:</span>
                <span className="font-mono font-bold text-slate-900">{selectedDisbursementForPrint.boardMinuteRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedDisbursementForPrint.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block mb-1">Expenditure Details:</span>
                <p className="font-medium text-slate-800">{selectedDisbursementForPrint.description}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                  Authorized By (Board Chair / Aux Leader):
                </span>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {selectedDisbursementForPrint.authorizedBy}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                  Disbursed By Church Treasurer:
                </span>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {currentChurchUser.name}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
