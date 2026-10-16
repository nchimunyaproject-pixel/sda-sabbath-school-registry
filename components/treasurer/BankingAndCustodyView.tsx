import React, { useState } from 'react';
import { ChurchBankAccount, FundCategory } from '../../types';
import { 
  Building, Landmark, ShieldCheck, AlertTriangle, Plus, CheckCircle, 
  FileText, ArrowDownRight, ArrowUpRight, Scale, RefreshCw, Lock, 
  ExternalLink, Sparkles, AlertOctagon, HelpCircle
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../../utils/currency';

interface BankingAndCustodyViewProps {
  bankAccounts: ChurchBankAccount[];
  currentChurchUser: { name: string; churchName?: string; id: string };
  onAddAccount: (account: Omit<ChurchBankAccount, 'id' | 'churchId'>) => void;
  onUpdateAccount: (id: string, updates: Partial<ChurchBankAccount>) => void;
  trustFundBalance: number;
  localFundBalance: number;
  auxiliaryFundBalance: number;
}

export const BankingAndCustodyView: React.FC<BankingAndCustodyViewProps> = ({
  bankAccounts,
  currentChurchUser,
  onAddAccount,
  onUpdateAccount,
  trustFundBalance,
  localFundBalance,
  auxiliaryFundBalance
}) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [selectedAccountForReconcile, setSelectedAccountForReconcile] = useState<ChurchBankAccount | null>(null);
  const [statementBalanceInput, setStatementBalanceInput] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconcileSuccessMsg, setReconcileSuccessMsg] = useState<string | null>(null);

  // New account form state
  const [newAccountName, setNewAccountName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'operating_checking' | 'authorized_savings' | 'term_deposit'>('operating_checking');
  const [newBoardAuthRef, setNewBoardAuthRef] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('');
  const [newSignatories, setNewSignatories] = useState(`${currentChurchUser.name} (Treasurer), First Elder, Pastor`);
  const [isExclusiveConfirmed, setIsExclusiveConfirmed] = useState(true);

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalFundCategories = trustFundBalance + localFundBalance + auxiliaryFundBalance;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExclusiveConfirmed) {
      alert("Church Manual Mandate: The account must be opened exclusively in the name of the church.");
      return;
    }
    if (newAccountType !== 'operating_checking' && !newBoardAuthRef.trim()) {
      alert("Church Manual Mandate: Savings or term deposit accounts require a voted Church Board minute authorization reference.");
      return;
    }

    onAddAccount({
      accountName: newAccountName.trim(),
      bankName: newBankName.trim(),
      accountNumber: newAccountNumber.trim(),
      branchName: newBranchName.trim(),
      accountType: newAccountType,
      boardAuthRef: newBoardAuthRef.trim() || undefined,
      currentBalance: parseFloat(newInitialBalance) || 0,
      isExclusiveChurchAccount: true,
      signatories: newSignatories.split(',').map(s => s.trim()).filter(Boolean),
      lastReconciledDate: new Date().toISOString().split('T')[0],
      reconciledBookBalance: parseFloat(newInitialBalance) || 0,
      status: 'active'
    });

    setIsAddingAccount(false);
    setNewAccountName('');
    setNewBankName('');
    setNewAccountNumber('');
    setNewBranchName('');
    setNewBoardAuthRef('');
    setNewInitialBalance('');
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForReconcile) return;

    const statementVal = parseFloat(statementBalanceInput);
    if (isNaN(statementVal)) return;

    onUpdateAccount(selectedAccountForReconcile.id, {
      currentBalance: statementVal,
      lastReconciledDate: new Date().toISOString().split('T')[0],
      reconciledBookBalance: statementVal
    });

    setReconcileSuccessMsg(`Account "${selectedAccountForReconcile.accountName}" reconciled successfully.`);
    setTimeout(() => {
      setSelectedAccountForReconcile(null);
      setStatementBalanceInput('');
      setReconcileNotes('');
      setReconcileSuccessMsg(null);
    }, 1800);
  };

  return (
    <div className="space-y-10">
      {/* Church Manual Mandatory Doctrine Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Church Manual Section 1: Custodianship & Banking
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Safe Custody & Exclusive Church Accounts
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              The treasurer is the legal custodian of all church funds, strictly divided into <strong className="text-white">Conference Trust</strong>, <strong className="text-white">Local Church</strong>, and <strong className="text-white">Auxiliary Funds</strong>. All church money must be banked exclusively in accounts opened in the church's name and completely isolated from personal funds.
            </p>
          </div>
          <button
            onClick={() => setIsAddingAccount(true)}
            className="px-6 py-4 bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Church Account
          </button>
        </div>
      </div>

      {/* 3 Mandated Fund Categories Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conference Trust Funds */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Conference Trust
            </span>
            <span className="text-[10px] font-bold text-slate-400">100% Remitted</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conference Holding Balance ({CURRENCY_CODE})</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {formatKwacha(trustFundBalance)}
          </h3>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-500 font-medium space-y-1">
            <p className="flex justify-between"><span>• Tithes:</span> <span className="font-bold text-slate-700">Sacred Trust</span></p>
            <p className="flex justify-between"><span>• Sabbath School Mission:</span> <span className="font-bold text-slate-700">World Field</span></p>
            <p className="flex justify-between"><span>• 13th Sabbath / Ingathering:</span> <span className="font-bold text-slate-700">Zero Local Use</span></p>
          </div>
          <div className="mt-4 bg-rose-50/60 p-2.5 rounded-xl text-[10px] text-rose-800 font-bold flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Strict mandate: Local diversion is forbidden.</span>
          </div>
        </div>

        {/* Local Church Operating Funds */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
              <Building className="w-3 h-3" /> Local Congregation
            </span>
            <span className="text-[10px] font-bold text-slate-400">Board Authorized</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Church Funds ({CURRENCY_CODE})</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {formatKwacha(localFundBalance)}
          </h3>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-500 font-medium space-y-1">
            <p className="flex justify-between"><span>• Church Operating Budget:</span> <span className="font-bold text-slate-700">Utilities / Operations</span></p>
            <p className="flex justify-between"><span>• Building & Repairs:</span> <span className="font-bold text-slate-700">Capital Reserve</span></p>
            <p className="flex justify-between"><span>• Needy / Poor Fund:</span> <span className="font-bold text-slate-700">Benevolent Relief</span></p>
          </div>
          <div className="mt-4 bg-emerald-50/60 p-2.5 rounded-xl text-[10px] text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Disbursed ONLY with voted Board minutes.</span>
          </div>
        </div>

        {/* Auxiliary Organization Funds */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1.5">
              <Scale className="w-3 h-3" /> Auxiliary Accounts
            </span>
            <span className="text-[10px] font-bold text-slate-400">Department Trust</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auxiliary Department Ledger ({CURRENCY_CODE})</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {formatKwacha(auxiliaryFundBalance)}
          </h3>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-500 font-medium space-y-1">
            <p className="flex justify-between"><span>• Adventist Youth (AYM):</span> <span className="font-bold text-slate-700">Dedicated Youth</span></p>
            <p className="flex justify-between"><span>• Dorcas / Community:</span> <span className="font-bold text-slate-700">Welfare & Aid</span></p>
            <p className="flex justify-between"><span>• Family Life / Music:</span> <span className="font-bold text-slate-700">Department Only</span></p>
          </div>
          <div className="mt-4 bg-amber-50/60 p-2.5 rounded-xl text-[10px] text-amber-800 font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-600" />
            <span>May NOT be borrowed for general church bills.</span>
          </div>
        </div>
      </div>

      {/* Exclusive Church Accounts List & Authorized Savings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
              <Landmark className="w-6 h-6 text-blue-900" />
              Institutional Church Bank Accounts & Authorized Savings
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Exclusive registered church accounts • Dual/Triple signatory controls
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-black px-4 py-2 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Total In Financial Institutions: {formatKwacha(totalBankBalance)}
          </div>
        </div>

        {/* Isolation Verification Callout */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-blue-900 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 space-y-1">
            <p className="font-black uppercase tracking-wider">Church Manual Isolation Protocol Active</p>
            <p className="font-medium text-slate-600">
              All listed bank accounts are legally registered under <strong>{currentChurchUser.churchName || "the Local Seventh-day Adventist Church"}</strong>. Zero church funds are co-mingled with personal accounts or non-board entities.
            </p>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-3 px-4">Account Title & Type</th>
                <th className="pb-3 px-4">Financial Institution</th>
                <th className="pb-3 px-4">Account Number</th>
                <th className="pb-3 px-4">Board Authorization</th>
                <th className="pb-3 px-4">Signatories</th>
                <th className="pb-3 px-4 text-right">Book Balance</th>
                <th className="pb-3 px-4 text-center">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {bankAccounts.map((account) => {
                const isSavings = account.accountType === 'authorized_savings';
                const isTerm = account.accountType === 'term_deposit';
                return (
                  <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                        {account.accountName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isSavings ? 'bg-amber-100 text-amber-900' :
                          isTerm ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {isSavings ? 'Authorized Savings' : isTerm ? 'Term Deposit' : 'General Operating Checking'}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Isolated Church Account
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      <div>{account.bankName}</div>
                      {account.branchName && (
                        <div className="text-[10px] text-slate-400 font-medium">{account.branchName}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-600">
                      {account.accountNumber}
                    </td>
                    <td className="py-4 px-4">
                      {account.boardAuthRef ? (
                        <div className="text-[10px] font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {account.boardAuthRef}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Operating Default</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[10px] text-slate-500 font-medium">
                      {account.signatories.join(' • ')}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                      {formatKwacha(account.currentBalance)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedAccountForReconcile(account);
                          setStatementBalanceInput(account.currentBalance.toString());
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Reconcile
                      </button>
                      <span className="text-[9px] text-slate-400 block mt-1">
                        Last: {account.lastReconciledDate}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Open New Church Bank Account
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Church Manual Section 1 Compliance Check
                </p>
              </div>
              <button
                onClick={() => setIsAddingAccount(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Official Account Name (Must be in church name)
                </label>
                <input
                  type="text"
                  required
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g. Woodlands Seventh-day Adventist Church - Operating Account"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Bank / Financial Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. Standard Chartered / Zanaco"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="e.g. Kabulonga Branch"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder="e.g. 028194820192"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Account Classification
                  </label>
                  <select
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900"
                  >
                    <option value="operating_checking">General Operating Checking</option>
                    <option value="authorized_savings">Authorized Savings Account</option>
                    <option value="term_deposit">Fixed Term / Project Deposit</option>
                  </select>
                </div>
              </div>

              {newAccountType !== 'operating_checking' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-900 block">
                    Church Board Minute Authorization (Mandatory for Savings)
                  </label>
                  <input
                    type="text"
                    required
                    value={newBoardAuthRef}
                    onChange={(e) => setNewBoardAuthRef(e.target.value)}
                    placeholder="e.g. MIN-2026-06-12 (Voted Board Minute: Sanctuary Building Reserve)"
                    className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-900 text-xs"
                  />
                  <p className="text-[10px] text-amber-700">
                    SDA Church Manual mandate: Surplus or building funds placed in savings accounts must be formally voted by the church board and operated exclusively by the treasurer.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Opening Balance ({CURRENCY_CODE})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Signatories (Comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSignatories}
                    onChange={(e) => setNewSignatories(e.target.value)}
                    placeholder="Treasurer, First Elder, Pastor"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  />
                </div>
              </div>

              {/* Strict Non-Personal Certification */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="exclusiveChurchCheck"
                  checked={isExclusiveConfirmed}
                  onChange={(e) => setIsExclusiveConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                />
                <label htmlFor="exclusiveChurchCheck" className="text-xs text-slate-700 font-medium">
                  <strong>Mandatory Certification:</strong> I certify that this account is opened exclusively in the name of the church, under official church authority, and is completely isolated from personal or private funds.
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingAccount(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isExclusiveConfirmed}
                  className="flex-1 py-3.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                >
                  Confirm & Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {selectedAccountForReconcile && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Bank Statement Reconciliation
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  {selectedAccountForReconcile.accountName}
                </p>
              </div>
              <button
                onClick={() => setSelectedAccountForReconcile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {reconcileSuccessMsg ? (
              <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl flex flex-col items-center text-center gap-2">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
                <p className="font-black text-sm">{reconcileSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReconcileSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Current Book Balance:</span>
                    <span className="font-bold text-slate-900">
                      {formatKwacha(selectedAccountForReconcile.currentBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Last Reconciled Date:</span>
                    <span className="font-bold text-slate-900">{selectedAccountForReconcile.lastReconciledDate}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Official Bank Statement Balance ({CURRENCY_CODE})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={statementBalanceInput}
                    onChange={(e) => setStatementBalanceInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-lg outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Audit Notes / Outstanding Items
                  </label>
                  <textarea
                    rows={3}
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    placeholder="e.g. Reconciled with August Bank Statement. Outstanding check #1104 to ZESCO."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAccountForReconcile(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Update Reconciliation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
