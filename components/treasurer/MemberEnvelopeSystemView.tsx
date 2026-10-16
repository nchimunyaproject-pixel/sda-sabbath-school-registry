import React, { useState } from 'react';
import { 
  OfferingEnvelope, LooseOfferingRecord, LiteratureOrder, ChurchMember, 
  FundCategory, OfferingEnvelopeItem 
} from '../../types';
import { 
  Mail, Users2, BookOpen, Receipt, Plus, CheckCircle2, ShieldCheck, 
  Printer, DollarSign, Calculator, FileText, Sparkles, ExternalLink, 
  Coins, Banknote, HelpCircle, Lock, UserCheck
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../../utils/currency';

interface MemberEnvelopeSystemViewProps {
  envelopes: OfferingEnvelope[];
  looseOfferings: LooseOfferingRecord[];
  literatureOrders: LiteratureOrder[];
  churchMembers: ChurchMember[];
  currentChurchUser: { name: string; churchName?: string; id: string };
  onAddEnvelope: (envelope: Omit<OfferingEnvelope, 'id' | 'churchId' | 'receiptNumber'>) => void;
  onAddLooseOffering: (loose: Omit<LooseOfferingRecord, 'id' | 'churchId' | 'receiptNumber'>) => void;
  onAddLiteratureOrder: (order: Omit<LiteratureOrder, 'id' | 'churchId' | 'orderNumber'>) => void;
  onUpdateLiteratureStatus: (id: string, status: 'collected' | 'remitted_to_abc' | 'delivered', ref?: string) => void;
}

export const MemberEnvelopeSystemView: React.FC<MemberEnvelopeSystemViewProps> = ({
  envelopes,
  looseOfferings,
  literatureOrders,
  churchMembers,
  currentChurchUser,
  onAddEnvelope,
  onAddLooseOffering,
  onAddLiteratureOrder,
  onUpdateLiteratureStatus
}) => {
  const [activeTab, setActiveTab] = useState<'envelopes' | 'loose' | 'literature'>('envelopes');
  const [isAddingEnvelope, setIsAddingEnvelope] = useState(false);
  const [isAddingLoose, setIsAddingLoose] = useState(false);
  const [isAddingLitOrder, setIsAddingLitOrder] = useState(false);

  // Selected for print receipts
  const [selectedEnvelopeForReceipt, setSelectedEnvelopeForReceipt] = useState<OfferingEnvelope | null>(null);
  const [selectedLooseForReceipt, setSelectedLooseForReceipt] = useState<LooseOfferingRecord | null>(null);

  // Envelope Form state
  const [donorType, setDonorType] = useState<'member' | 'visitor' | 'anonymous'>('member');
  const [selectedMemberId, setSelectedMemberId] = useState(churchMembers[0]?.id || '');
  const [customDonorName, setCustomDonorName] = useState('');
  const [envelopeNumber, setEnvelopeNumber] = useState(`ENV-${Math.floor(100 + Math.random() * 900)}`);
  const [paymentMethod, setPaymentMethod] = useState<'cash_envelope' | 'check' | 'conference_egiving' | 'bank_transfer'>('cash_envelope');
  const [checkOrRef, setCheckOrRef] = useState('');
  const [envelopeItems, setEnvelopeItems] = useState<Array<{ category: FundCategory; fundName: string; amount: number }>>([
    { category: 'conference_trust', fundName: 'Tithe (Conference Trust 10%)', amount: 0 },
    { category: 'conference_trust', fundName: 'World Mission Offering', amount: 0 },
    { category: 'local_church', fundName: 'Local Church Operating Budget', amount: 0 }
  ]);

  // Dual-count loose offering form state
  const [serviceType, setServiceType] = useState<'Divine Service' | 'Sabbath School' | 'AY Service' | 'Midweek Prayer'>('Divine Service');
  const [secondOfficerName, setSecondOfficerName] = useState('Deacon Charles Zulu');
  const [secondOfficerRole, setSecondOfficerRole] = useState<'Deacon' | 'Deaconess' | 'Elder'>('Deacon');
  const [targetFund, setTargetFund] = useState('Local Church Budget (Combined Offering Plan)');
  const [denominations, setDenominations] = useState({
    b100: 0,
    b50: 0,
    b20: 0,
    b10: 0,
    b5: 0,
    coins: 0
  });

  // Literature order form state
  const [litCustomer, setLitCustomer] = useState('');
  const [litItems, setLitItems] = useState('');
  const [litAmount, setLitAmount] = useState('');
  const [litMethod, setLitMethod] = useState<'cash' | 'transfer'>('cash');

  // Calculations
  const calculatedEnvelopeTotal = envelopeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const calculatedLooseTotal = 
    (denominations.b100 * 100) +
    (denominations.b50 * 50) +
    (denominations.b20 * 20) +
    (denominations.b10 * 10) +
    (denominations.b5 * 5) +
    (denominations.coins);

  const handleEnvelopeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedEnvelopeTotal <= 0) {
      alert("Please enter a contribution amount.");
      return;
    }

    const donorName = donorType === 'member'
      ? (churchMembers.find(m => m.id === selectedMemberId)?.name || 'Church Member')
      : customDonorName.trim() || 'Anonymous Contributor';

    const itemsWithIds: OfferingEnvelopeItem[] = envelopeItems
      .filter(item => item.amount > 0)
      .map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        category: item.category,
        fundName: item.fundName,
        amount: Number(item.amount)
      }));

    onAddEnvelope({
      envelopeNumber: envelopeNumber.trim() || undefined,
      donorType,
      memberId: donorType === 'member' ? selectedMemberId : undefined,
      donorName,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      checkOrRefNumber: checkOrRef.trim() || undefined,
      items: itemsWithIds,
      totalAmount: calculatedEnvelopeTotal,
      isConfidential: true,
      issuedReceipt: true,
      receivedBy: currentChurchUser.name
    });

    setIsAddingEnvelope(false);
  };

  const handleLooseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedLooseTotal <= 0) {
      alert("Total loose offering must be greater than 0.");
      return;
    }

    onAddLooseOffering({
      date: new Date().toISOString().split('T')[0],
      serviceType,
      treasurerName: currentChurchUser.name,
      secondOfficerName: secondOfficerName.trim(),
      secondOfficerRole,
      denominationBreakdown: {
        bills100: denominations.b100,
        bills50: denominations.b50,
        bills20: denominations.b20,
        bills10: denominations.b10,
        bills5: denominations.b5,
        coins: denominations.coins
      },
      totalAmount: calculatedLooseTotal,
      targetFund,
      isSignedByBoth: true,
      deaconReceiptIssued: true,
      notes: `Dual counted by ${currentChurchUser.name} (Treasurer) and ${secondOfficerName} (${secondOfficerRole}).`
    });

    setIsAddingLoose(false);
  };

  const handleLitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(litAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    onAddLiteratureOrder({
      orderDate: new Date().toISOString().split('T')[0],
      memberOrDepartmentName: litCustomer.trim(),
      itemsDescription: litItems.trim(),
      amountCollected: parsed,
      paymentMethod: litMethod,
      status: 'collected'
    });

    setIsAddingLitOrder(false);
    setLitCustomer('');
    setLitItems('');
    setLitAmount('');
  };

  return (
    <div className="space-y-10">
      {/* Section 5 Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Receipt className="w-3.5 h-3.5" /> Church Manual Section 5: Contributions & Dual Counting
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Envelope System, Prompt Receipts & Dual Counting
            </h2>
            <p className="text-cyan-200 text-xs sm:text-sm font-medium leading-relaxed">
              The envelope system provides essential vouchers for the conference audit. The treasurer must promptly issue written receipts to members for every contribution received, regardless of how small. All loose offerings not received in envelopes <strong>must be counted by the treasurer in the presence of another officer (preferably a deacon or deaconess)</strong> with an official receipt issued to that officer.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setIsAddingLoose(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
            >
              <Calculator className="w-4 h-4 text-amber-400" /> Dual Count Loose Offering
            </button>
            <button
              onClick={() => setIsAddingEnvelope(true)}
              className="px-6 py-3.5 bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Enter Tithe Envelope
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('envelopes')}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'envelopes'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" /> Member Envelopes & e-Giving ({envelopes.length})
        </button>
        <button
          onClick={() => setActiveTab('loose')}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'loose'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4" /> Dual-Count Loose Offerings ({looseOfferings.length})
        </button>
        <button
          onClick={() => setActiveTab('literature')}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'literature'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Adventist Book Center Orders ({literatureOrders.length})
        </button>
      </div>

      {/* TAB 1: ENVELOPES */}
      {activeTab === 'envelopes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <Mail className="w-6 h-6 text-cyan-700" />
                Member Tithe & Offering Envelope Registry
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Preserved vouchers for annual conference audit • Individual receipts issued
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total Envelopes: {envelopes.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 px-4">Receipt # & Date</th>
                  <th className="pb-3 px-4">Envelope #</th>
                  <th className="pb-3 px-4">Contributor (Confidential)</th>
                  <th className="pb-3 px-4">Payment Method</th>
                  <th className="pb-3 px-4">Itemized Breakdown</th>
                  <th className="pb-3 px-4 text-right">Total Amount</th>
                  <th className="pb-3 px-4 text-center">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {envelopes.map((env) => (
                  <tr key={env.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-black text-slate-900 text-sm">{env.receiptNumber}</span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{env.date}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-600">
                      {env.envelopeNumber || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {env.donorName}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {env.donorType === 'member' ? 'Church Member' : 'Visitor / Friend'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {env.paymentMethod === 'conference_egiving' ? 'Conference e-Giving' :
                         env.paymentMethod === 'cash_envelope' ? 'Envelope Cash' : env.paymentMethod}
                      </span>
                      {env.checkOrRefNumber && (
                        <span className="text-[9px] font-mono text-slate-400 block mt-1">{env.checkOrRefNumber}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        {env.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between gap-4 text-slate-600">
                            <span className="truncate max-w-[180px]">• {it.fundName}:</span>
                            <span className="font-bold text-slate-900">{formatKwacha(it.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                      {formatKwacha(env.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedEnvelopeForReceipt(env)}
                        className="p-2 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-slate-600 transition-colors inline-block"
                        title="Print Official Member Receipt"
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

      {/* TAB 2: DUAL COUNT LOOSE OFFERINGS */}
      {activeTab === 'loose' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <Coins className="w-6 h-6 text-amber-600" />
                Loose Offering Dual Counting Verification Sheets
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Counted jointly by Treasurer + Deacon/Deaconess immediately after service
              </p>
            </div>
            <button
              onClick={() => setIsAddingLoose(true)}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Record New Dual Count
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 px-4">Receipt # & Date</th>
                  <th className="pb-3 px-4">Service Type</th>
                  <th className="pb-3 px-4">Joint Counters (Dual Officers)</th>
                  <th className="pb-3 px-4">Target Church Fund</th>
                  <th className="pb-3 px-4 text-right">Total Counted ({CURRENCY_CODE})</th>
                  <th className="pb-3 px-4 text-center">Deacon Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {looseOfferings.map((loose) => (
                  <tr key={loose.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-black text-slate-900 text-sm">{loose.receiptNumber}</span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{loose.date}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {loose.serviceType}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-black text-slate-900">
                        1. {loose.treasurerName} <span className="text-[10px] font-normal text-slate-400">(Treasurer)</span>
                      </div>
                      <div className="font-black text-emerald-800 mt-0.5">
                        2. {loose.secondOfficerName} <span className="text-[10px] font-normal text-slate-400">({loose.secondOfficerRole})</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {loose.targetFund}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                      {formatKwacha(loose.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedLooseForReceipt(loose)}
                        className="p-2 bg-slate-100 hover:bg-blue-900 hover:text-white rounded-xl text-slate-600 transition-colors inline-block"
                        title="Print Deacon Joint-Count Receipt"
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

      {/* TAB 3: LITERATURE ORDERS (ABC) */}
      {activeTab === 'literature' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-indigo-700" />
                Adventist Book Center (ABC) Literature Remittance
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Church Manual Section 5: Handling publication orders where no local ABC exists
              </p>
            </div>
            <button
              onClick={() => setIsAddingLitOrder(true)}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Literature Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 px-4">Order # & Date</th>
                  <th className="pb-3 px-4">Department / Member</th>
                  <th className="pb-3 px-4">Literature Items Description</th>
                  <th className="pb-3 px-4 text-right">Amount Collected</th>
                  <th className="pb-3 px-4">ABC Invoice Ref</th>
                  <th className="pb-3 px-4 text-center">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {literatureOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{ord.orderDate}</span>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900">
                      {ord.memberOrDepartmentName}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {ord.itemsDescription}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      ${ord.amountCollected.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                      {ord.abcInvoiceRef || 'Pending ABC Invoice'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-900' :
                          ord.status === 'remitted_to_abc' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                        {ord.status === 'collected' && (
                          <button
                            onClick={() => {
                              const ref = prompt("Enter ABC Invoice Reference Number:", "INV-ABC-");
                              if (ref) onUpdateLiteratureStatus(ord.id, 'remitted_to_abc', ref);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[9px] font-bold"
                          >
                            Mark Remitted
                          </button>
                        )}
                        {ord.status === 'remitted_to_abc' && (
                          <button
                            onClick={() => onUpdateLiteratureStatus(ord.id, 'delivered')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[9px] font-bold"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ENTER ENVELOPE */}
      {isAddingEnvelope && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Record Member Tithe & Offering Envelope
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Church Manual Section 5: Itemized Allocations
                </p>
              </div>
              <button
                onClick={() => setIsAddingEnvelope(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnvelopeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Envelope Number (Voucher)
                  </label>
                  <input
                    type="text"
                    value={envelopeNumber}
                    onChange={(e) => setEnvelopeNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Contributor Category
                  </label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  >
                    <option value="member">Registered Member</option>
                    <option value="visitor">Visitor / Friend</option>
                    <option value="anonymous">Anonymous Giver</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  >
                    <option value="cash_envelope">Cash in Envelope</option>
                    <option value="conference_egiving">Conference e-Giving</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                  </select>
                </div>
              </div>

              {donorType === 'member' ? (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Select Member
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  >
                    {churchMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Donor Name
                  </label>
                  <input
                    type="text"
                    value={customDonorName}
                    onChange={(e) => setCustomDonorName(e.target.value)}
                    placeholder="Enter full name..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  />
                </div>
              )}

              {/* Itemized Allocations Table */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
                  Itemized Allocations ({CURRENCY_CODE})
                </span>

                <div className="space-y-2">
                  {envelopeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-800">{item.fundName}</span>
                        <span className="text-[9px] text-slate-400 block uppercase">
                          {item.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="w-36">
                        <input
                          type="number"
                          step="0.01"
                          value={item.amount || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...envelopeItems];
                            updated[idx].amount = val;
                            setEnvelopeItems(updated);
                          }}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-right outline-none focus:border-blue-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-700">Total Envelope Contribution:</span>
                  <span className="text-blue-950 text-lg">
                    {formatKwacha(calculatedEnvelopeTotal)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-950 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                <span>An official numbered written receipt will be issued immediately upon saving.</span>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingEnvelope(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={calculatedEnvelopeTotal <= 0}
                  className="flex-1 py-3.5 bg-blue-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                >
                  Save & Issue Written Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DUAL COUNT LOOSE OFFERING */}
      {isAddingLoose && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Dual Counting of Loose Offerings
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Church Manual Section 5: Mandatory Deacon Sign-off
                </p>
              </div>
              <button
                onClick={() => setIsAddingLoose(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLooseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  >
                    <option value="Divine Service">Divine Service</option>
                    <option value="Sabbath School">Sabbath School</option>
                    <option value="AY Service">Adventist Youth (AY)</option>
                    <option value="Midweek Prayer">Midweek Prayer Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Target Church Fund
                  </label>
                  <input
                    type="text"
                    required
                    value={targetFund}
                    onChange={(e) => setTargetFund(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  />
                </div>
              </div>

              {/* Second Officer */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-900 block">
                  Second Officer Present (Deacon / Deaconess)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={secondOfficerName}
                    onChange={(e) => setSecondOfficerName(e.target.value)}
                    placeholder="Officer Full Name"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-xs"
                  />
                  <select
                    value={secondOfficerRole}
                    onChange={(e) => setSecondOfficerRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-xs"
                  >
                    <option value="Deacon">Deacon</option>
                    <option value="Deaconess">Deaconess</option>
                    <option value="Elder">Church Elder</option>
                  </select>
                </div>
              </div>

              {/* Denomination Counter */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
                  Denomination Breakdown Counter
                </span>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">$100 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={denominations.b100 || ''}
                      onChange={(e) => setDenominations({ ...denominations, b100: parseInt(e.target.value) || 0 })}
                      placeholder="Qty"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">$50 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={denominations.b50 || ''}
                      onChange={(e) => setDenominations({ ...denominations, b50: parseInt(e.target.value) || 0 })}
                      placeholder="Qty"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">$20 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={denominations.b20 || ''}
                      onChange={(e) => setDenominations({ ...denominations, b20: parseInt(e.target.value) || 0 })}
                      placeholder="Qty"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">$10 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={denominations.b10 || ''}
                      onChange={(e) => setDenominations({ ...denominations, b10: parseInt(e.target.value) || 0 })}
                      placeholder="Qty"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">$5 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={denominations.b5 || ''}
                      onChange={(e) => setDenominations({ ...denominations, b5: parseInt(e.target.value) || 0 })}
                      placeholder="Qty"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Coins ($ Total)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={denominations.coins || ''}
                      onChange={(e) => setDenominations({ ...denominations, coins: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-700">Calculated Loose Total:</span>
                  <span className="text-amber-950 text-xl font-black">
                    {formatKwacha(calculatedLooseTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingLoose(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={calculatedLooseTotal <= 0}
                  className="flex-1 py-3.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  Confirm & Issue Deacon Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW LITERATURE ORDER */}
      {isAddingLitOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Record Literature Order (ABC)
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  Church Manual Section 5: Book Center Service
                </p>
              </div>
              <button
                onClick={() => setIsAddingLitOrder(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLitSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Ordering Member / Department
                </label>
                <input
                  type="text"
                  required
                  value={litCustomer}
                  onChange={(e) => setLitCustomer(e.target.value)}
                  placeholder="e.g. Sabbath School Dept / Sister Banda"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Books / Quarterlies Ordered
                </label>
                <textarea
                  rows={2}
                  required
                  value={litItems}
                  onChange={(e) => setLitItems(e.target.value)}
                  placeholder="e.g. 20x Adult Lesson Quarterlies, 2x Great Controversy"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Amount Collected ({CURRENCY_CODE})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={litAmount}
                    onChange={(e) => setLitAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={litMethod}
                    onChange={(e) => setLitMethod(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-900 text-xs"
                  >
                    <option value="cash">Cash</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLitOrder(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT ENVELOPE RECEIPT MODAL */}
      {selectedEnvelopeForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-950 text-white rounded-xl flex items-center justify-center font-black">
                  SDA
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                    Official Written Contributor Receipt
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {currentChurchUser.churchName || 'Local Seventh-day Adventist Church'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEnvelopeForReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Official Receipt #:</span>
                <span className="font-mono font-bold text-slate-900">{selectedEnvelopeForReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Envelope Voucher #:</span>
                <span className="font-mono font-bold text-slate-900">{selectedEnvelopeForReceipt.envelopeNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Received:</span>
                <span className="font-bold text-slate-900">{selectedEnvelopeForReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Received From (Member):</span>
                <span className="font-bold text-slate-900">{selectedEnvelopeForReceipt.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedEnvelopeForReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs divide-y divide-slate-100">
              {selectedEnvelopeForReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1.5">
                  <span className="text-slate-700">{it.fundName}</span>
                  <span className="font-bold text-slate-900">{formatKwacha(it.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2.5 text-sm font-black text-slate-900 border-t-2 border-slate-900">
                <span>Total Contribution Received:</span>
                <span className="text-blue-950">{formatKwacha(selectedEnvelopeForReceipt.totalAmount)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center italic">
              "Bring ye all the tithes into the storehouse... and prove me now herewith, saith the Lord of hosts." — Malachi 3:10
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Written Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT LOOSE OFFERING DEACON RECEIPT MODAL */}
      {selectedLooseForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-black">
                  SDA
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                    Dual Count Verification Receipt
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Loose Offering Joint Co-Sign
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLooseForReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLooseForReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sabbath Service:</span>
                <span className="font-bold text-slate-900">{selectedLooseForReceipt.serviceType} • {selectedLooseForReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Designated Offering Fund:</span>
                <span className="font-bold text-slate-900">{selectedLooseForReceipt.targetFund}</span>
              </div>
            </div>

            {/* Denominations breakdown */}
            <div className="p-4 border border-slate-100 rounded-2xl text-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Denomination Tally</span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>$100 Bills: <strong className="text-slate-900">{selectedLooseForReceipt.denominationBreakdown.bills100 || 0}</strong></div>
                <div>$50 Bills: <strong className="text-slate-900">{selectedLooseForReceipt.denominationBreakdown.bills50 || 0}</strong></div>
                <div>$20 Bills: <strong className="text-slate-900">{selectedLooseForReceipt.denominationBreakdown.bills20 || 0}</strong></div>
                <div>$10 Bills: <strong className="text-slate-900">{selectedLooseForReceipt.denominationBreakdown.bills10 || 0}</strong></div>
                <div>$5 Bills: <strong className="text-slate-900">{selectedLooseForReceipt.denominationBreakdown.bills5 || 0}</strong></div>
                <div>Coins Total: <strong className="text-slate-900">${(selectedLooseForReceipt.denominationBreakdown.coins || 0).toFixed(2)}</strong></div>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between font-black text-sm text-slate-900">
                <span>Joint Tally Total:</span>
                <span className="text-amber-900">{formatKwacha(selectedLooseForReceipt.totalAmount)}</span>
              </div>
            </div>

            {/* Dual Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                  Counted By Treasurer:
                </span>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {selectedLooseForReceipt.treasurerName}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                  Witnessed By Deacon / Deaconess:
                </span>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {selectedLooseForReceipt.secondOfficerName} ({selectedLooseForReceipt.secondOfficerRole})
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Dual Count Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
