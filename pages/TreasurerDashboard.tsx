import React, { useState } from 'react';
import { 
  User, ChurchMember, ChurchBankAccount, OfferingEnvelope, LooseOfferingRecord, 
  SabbathSchoolTransmission, DisbursementRecord, AuxiliaryDepartment, 
  ConferenceRemittance, LiteratureOrder, AuditRecord 
} from '../types';
import { 
  Landmark, ShieldAlert, Send, BookOpen, Receipt, Scale, 
  FileText, Users, DollarSign, Lock, AlertOctagon, CheckCircle2,
  Calendar, ArrowUpRight, TrendingUp, Sparkles, Building2, Coins, Mail,
  KeyRound, FileSpreadsheet
} from 'lucide-react';
import { LocalSabbathTreasurerView } from '../components/treasurer/LocalSabbathTreasurerView';
import { BankingAndCustodyView } from '../components/treasurer/BankingAndCustodyView';
import { TrustRemittancesView } from '../components/treasurer/TrustRemittancesView';
import { SabbathSchoolOfferingsView } from '../components/treasurer/SabbathSchoolOfferingsView';
import { DisbursementsAndAuxiliaryView } from '../components/treasurer/DisbursementsAndAuxiliaryView';
import { MemberEnvelopeSystemView } from '../components/treasurer/MemberEnvelopeSystemView';
import { AuditingAndConfidentialityView } from '../components/treasurer/AuditingAndConfidentialityView';
import { MemberStatementGeneratorView } from '../components/treasurer/MemberStatementGeneratorView';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../utils/currency';

interface TreasurerDashboardProps {
  user: User;
  churchMembers: ChurchMember[];
  bankAccounts: ChurchBankAccount[];
  onAddBankAccount: (acc: Omit<ChurchBankAccount, 'id' | 'churchId'>) => void;
  onReconcileAccount: (id: string, date: string, statementBal: number) => void;
  remittances: ConferenceRemittance[];
  onCompileRemittance: (remittance: Omit<ConferenceRemittance, 'id' | 'churchId'>) => void;
  onAcknowledgeReceipt: (id: string, conferenceReceiptNo: string) => void;
  ssTransmissions: SabbathSchoolTransmission[];
  onRecordSSTransmission: (data: Omit<SabbathSchoolTransmission, 'id' | 'churchId' | 'receiptNumber'>) => void;
  disbursements: DisbursementRecord[];
  auxiliaryDepartments: AuxiliaryDepartment[];
  onAddDisbursement: (disbursement: Omit<DisbursementRecord, 'id' | 'churchId' | 'voucherNumber'>) => void;
  onReceiveAuxiliaryFunds: (auxId: string, amount: number, donorNote: string) => void;
  envelopes: OfferingEnvelope[];
  looseOfferings: LooseOfferingRecord[];
  literatureOrders: LiteratureOrder[];
  onAddEnvelope: (envelope: Omit<OfferingEnvelope, 'id' | 'churchId' | 'receiptNumber'>) => void;
  onAddLooseOffering: (loose: Omit<LooseOfferingRecord, 'id' | 'churchId' | 'receiptNumber'>) => void;
  onAddLiteratureOrder: (order: Omit<LiteratureOrder, 'id' | 'churchId' | 'orderNumber'>) => void;
  onUpdateLiteratureStatus: (id: string, status: 'collected' | 'remitted_to_abc' | 'delivered', ref?: string) => void;
  auditRecords: AuditRecord[];
  onAddNewAudit: (audit: Omit<AuditRecord, 'id' | 'churchId'>) => void;
}

export type TreasurerTab = 
  | 'sabbath_collection' 
  | 'member_envelopes'
  | 'member_statements'
  | 'banking' 
  | 'trust_remittances' 
  | 'ss_offerings' 
  | 'disbursements' 
  | 'auditing';

export const TreasurerDashboard: React.FC<TreasurerDashboardProps> = ({
  user,
  churchMembers,
  bankAccounts,
  onAddBankAccount,
  onReconcileAccount,
  remittances,
  onCompileRemittance,
  onAcknowledgeReceipt,
  ssTransmissions,
  onRecordSSTransmission,
  disbursements,
  auxiliaryDepartments,
  onAddDisbursement,
  onReceiveAuxiliaryFunds,
  envelopes,
  looseOfferings,
  literatureOrders,
  onAddEnvelope,
  onAddLooseOffering,
  onAddLiteratureOrder,
  onUpdateLiteratureStatus,
  auditRecords,
  onAddNewAudit
}) => {
  // Default to Sabbath Collection & Instant Digital Receipts
  const [activeTab, setActiveTab] = useState<TreasurerTab>('sabbath_collection');

  // Compute key totals
  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

  // Trust computations
  const totalTitheFromEnvelopes = envelopes.reduce((sum, env) => {
    const titheItems = env.items.filter(it => it.fundName.toLowerCase().includes('tithe'));
    return sum + titheItems.reduce((s, it) => s + it.amount, 0);
  }, 0);

  const totalMissionFromSS = ssTransmissions.reduce((sum, t) => sum + t.totalMissionAmount, 0);
  const totalRemittedToConference = remittances.reduce((sum, r) => sum + r.totalRemittance, 0);

  // Unremitted estimates for active cycle
  const unremittedTithe = Math.max(0, totalTitheFromEnvelopes * 0.45); // Active cycle share
  const unremittedMission = Math.max(0, totalMissionFromSS * 0.4);
  const unremittedThirteenthSabbath = 650.00;
  const unremittedBirthdayThank = 120.00;
  const unremittedInvestment = 310.00;
  const unremittedSpecialProjects = 250.00;

  const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);
  const totalEnvelopesAmount = envelopes.reduce((sum, e) => sum + e.totalAmount, 0);
  const { formatCurrency } = useCurrency();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-md font-black">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Local Church Treasury
                  </h1>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-950 font-black rounded-full text-[10px] border border-amber-300 uppercase tracking-wider">
                    Sabbath Collection & Receipts
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-600 font-medium">
                    {user.churchName || 'Woodlands SDA Church'} • Treasurer: <strong>{user.name}</strong>
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono font-bold">
                    <KeyRound className="w-2.5 h-2.5 text-amber-600" />
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Quick Status Pill */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 block">Total Tithe Received</span>
                <span className="text-base font-black text-amber-950 font-mono">
                  {formatCurrency(totalTitheFromEnvelopes)}
                </span>
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-2xl text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Total Treasury Cash ({CURRENCY_CODE})</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {formatCurrency(totalBankBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('sabbath_collection')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'sabbath_collection'
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              1. Sabbath Figures & Receipts
            </button>

            <button
              onClick={() => setActiveTab('member_envelopes')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'member_envelopes'
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              2. All Envelopes & Loose Archive
            </button>

            <button
              onClick={() => setActiveTab('member_statements')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'member_statements'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'member_statements' ? 'text-slate-950' : 'text-amber-600'}`} />
              3. Member Statements (Confidential)
            </button>

            <button
              onClick={() => setActiveTab('banking')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'banking'
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Landmark className="w-4 h-4 text-amber-400" />
              4. Custody & Bank Accounts
            </button>

            <button
              onClick={() => setActiveTab('trust_remittances')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'trust_remittances'
                  ? 'bg-rose-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-4 h-4 text-rose-400" />
              5. Sacred Trust Remittances
            </button>

            <button
              onClick={() => setActiveTab('ss_offerings')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'ss_offerings'
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              6. SS & Mission Offerings
            </button>

            <button
              onClick={() => setActiveTab('disbursements')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'disbursements'
                  ? 'bg-emerald-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              7. Local & Auxiliary Funds
            </button>

            <button
              onClick={() => setActiveTab('auditing')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'auditing'
                  ? 'bg-indigo-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-400" />
              8. Audit & Confidentiality
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'sabbath_collection' && (
          <LocalSabbathTreasurerView
            envelopes={envelopes}
            looseOfferings={looseOfferings}
            churchMembers={churchMembers}
            currentTreasurer={user}
            onAddEnvelope={onAddEnvelope}
            onAddLooseOffering={onAddLooseOffering}
            onNavigateToStatements={() => setActiveTab('member_statements')}
          />
        )}

        {activeTab === 'member_envelopes' && (
          <MemberEnvelopeSystemView
            envelopes={envelopes}
            looseOfferings={looseOfferings}
            literatureOrders={literatureOrders}
            churchMembers={churchMembers}
            currentChurchUser={{ name: user.name, churchName: user.churchName, id: user.id }}
            onAddEnvelope={onAddEnvelope}
            onAddLooseOffering={onAddLooseOffering}
            onAddLiteratureOrder={onAddLiteratureOrder}
            onUpdateLiteratureStatus={onUpdateLiteratureStatus}
          />
        )}

        {activeTab === 'member_statements' && (
          <MemberStatementGeneratorView
            envelopes={envelopes}
            churchMembers={churchMembers}
            currentTreasurer={user}
          />
        )}

        {activeTab === 'banking' && (
          <BankingAndCustodyView
            bankAccounts={bankAccounts}
            currentChurchUser={{ name: user.name, churchName: user.churchName, id: user.id }}
            onAddAccount={onAddBankAccount}
            onUpdateAccount={(id, updates) => {
              if (updates.lastReconciledDate && updates.currentBalance !== undefined) {
                onReconcileAccount(id, updates.lastReconciledDate, updates.currentBalance);
              }
            }}
            trustFundBalance={unremittedTithe + unremittedMission + unremittedThirteenthSabbath}
            localFundBalance={totalEnvelopesAmount * 0.45}
            auxiliaryFundBalance={auxiliaryDepartments.reduce((sum, d) => sum + d.currentBalance, 0)}
          />
        )}

        {activeTab === 'trust_remittances' && (
          <TrustRemittancesView
            remittances={remittances}
            currentChurchUser={{ name: user.name, churchName: user.churchName, id: user.id }}
            onCompileRemittance={onCompileRemittance}
            onAcknowledgeReceipt={onAcknowledgeReceipt}
            unremittedTithe={unremittedTithe}
            unremittedMission={unremittedMission}
            unremittedThirteenthSabbath={unremittedThirteenthSabbath}
            unremittedBirthdayThank={unremittedBirthdayThank}
            unremittedInvestment={unremittedInvestment}
            unremittedSpecialProjects={unremittedSpecialProjects}
          />
        )}

        {activeTab === 'ss_offerings' && (
          <SabbathSchoolOfferingsView
            transmissions={ssTransmissions}
            currentChurchUser={{ name: user.name, churchName: user.churchName, id: user.id }}
            onRecordTransmission={onRecordSSTransmission}
          />
        )}

        {activeTab === 'disbursements' && (
          <DisbursementsAndAuxiliaryView
            disbursements={disbursements}
            auxiliaryDepartments={auxiliaryDepartments}
            currentChurchUser={{ name: user.name, churchName: user.churchName, id: user.id }}
            onAddDisbursement={onAddDisbursement}
            onReceiveAuxiliaryFunds={onReceiveAuxiliaryFunds}
          />
        )}

        {activeTab === 'auditing' && (
          <AuditingAndConfidentialityView
            auditRecords={auditRecords}
            currentChurchUser={{ name: user.name, churchName: user.churchName, id: user.id }}
            bankAccounts={bankAccounts}
            onAddNewAudit={onAddNewAudit}
            monthlyReceiptsTotal={totalEnvelopesAmount}
            monthlyDisbursementsTotal={totalDisbursed}
            conferenceRemittedTotal={totalRemittedToConference}
          />
        )}
      </main>
    </div>
  );
};

