import React, { useState, useMemo } from 'react';
import { 
  OfferingEnvelope, LooseOfferingRecord, ChurchMember, 
  FundCategory, OfferingEnvelopeItem, User 
} from '../../types';
import { 
  Receipt, Plus, Printer, CheckCircle2, ShieldCheck, 
  Coins, Calendar, Copy, Check, Download, Send, 
  Users, Banknote, Search, AlertCircle, Sparkles, 
  ArrowRight, FileSpreadsheet, Lock, ChevronRight
} from 'lucide-react';
import { useCurrency, formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE } from '../../utils/currency';

interface LocalSabbathTreasurerViewProps {
  envelopes: OfferingEnvelope[];
  looseOfferings: LooseOfferingRecord[];
  churchMembers: ChurchMember[];
  currentTreasurer: User;
  onAddEnvelope: (envelope: Omit<OfferingEnvelope, 'id' | 'churchId' | 'receiptNumber'>) => void;
  onAddLooseOffering: (loose: Omit<LooseOfferingRecord, 'id' | 'churchId' | 'receiptNumber'>) => void;
  onNavigateToStatements?: () => void;
}

export const LocalSabbathTreasurerView: React.FC<LocalSabbathTreasurerViewProps> = ({
  envelopes,
  looseOfferings,
  churchMembers,
  currentTreasurer,
  onAddEnvelope,
  onAddLooseOffering,
  onNavigateToStatements
}) => {
  // Determine available Sabbath dates from records or default to today's date
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find the latest existing date among records, or today
  const defaultDate = useMemo(() => {
    const dates = [...envelopes.map(e => e.date), ...looseOfferings.map(l => l.date)].filter(Boolean);
    if (dates.length > 0) {
      return dates.sort().reverse()[0];
    }
    return todayStr;
  }, [envelopes, looseOfferings, todayStr]);

  const [selectedSabbathDate, setSelectedSabbathDate] = useState<string>(defaultDate);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'tithe_envelopes' | 'loose_offerings' | 'sabbath_summary'>('all');
  
  // Modals
  const [isAddEnvelopeOpen, setIsAddEnvelopeOpen] = useState(false);
  const [isAddLooseOpen, setIsAddLooseOpen] = useState(false);
  const [selectedEnvelopeForReceipt, setSelectedEnvelopeForReceipt] = useState<OfferingEnvelope | null>(null);
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State: Envelope Entry
  const [donorType, setDonorType] = useState<'member' | 'visitor' | 'anonymous'>('member');
  const [selectedMemberId, setSelectedMemberId] = useState(churchMembers[0]?.id || '');
  const [customDonorName, setCustomDonorName] = useState('');
  const [envelopeNumber, setEnvelopeNumber] = useState(`ENV-${Math.floor(100 + Math.random() * 900)}`);
  const [paymentMethod, setPaymentMethod] = useState<'cash_envelope' | 'check' | 'conference_egiving' | 'bank_transfer'>('cash_envelope');
  const [checkOrRef, setCheckOrRef] = useState('');
  
  // Tithe & Offerings breakdown
  const [titheAmount, setTitheAmount] = useState<string>('0');
  const [churchBudgetAmount, setChurchBudgetAmount] = useState<string>('0');
  const [ssMissionAmount, setSsMissionAmount] = useState<string>('0');
  const [buildingAmount, setBuildingAmount] = useState<string>('0');
  const [dorcasAmount, setDorcasAmount] = useState<string>('0');
  const [customFundName, setCustomFundName] = useState<string>('');
  const [customFundAmount, setCustomFundAmount] = useState<string>('0');

  // Form State: Loose Offering
  const [looseServiceType, setLooseServiceType] = useState<'Divine Service' | 'Sabbath School' | 'AY Service' | 'Midweek Prayer'>('Divine Service');
  const [looseAmount, setLooseAmount] = useState<string>('');
  const [looseTargetFund, setLooseTargetFund] = useState('Local Church Budget (Combined Offering Plan)');
  const [secondOfficerName, setSecondOfficerName] = useState('Deacon Charles Zulu');
  const [secondOfficerRole, setSecondOfficerRole] = useState<'Deacon' | 'Deaconess' | 'Elder'>('Deacon');

  // Filter records for the selected Sabbath
  const sabbathEnvelopes = useMemo(() => {
    return envelopes.filter(e => e.date === selectedSabbathDate);
  }, [envelopes, selectedSabbathDate]);

  const sabbathLoose = useMemo(() => {
    return looseOfferings.filter(l => l.date === selectedSabbathDate);
  }, [looseOfferings, selectedSabbathDate]);

  // Compute Sabbath Totals
  const sabbathTitheTotal = useMemo(() => {
    return sabbathEnvelopes.reduce((sum, env) => {
      const titheItems = env.items.filter(it => it.fundName.toLowerCase().includes('tithe'));
      return sum + titheItems.reduce((s, it) => s + it.amount, 0);
    }, 0);
  }, [sabbathEnvelopes]);

  const sabbathEnvelopeOfferingTotal = useMemo(() => {
    return sabbathEnvelopes.reduce((sum, env) => {
      const nonTitheItems = env.items.filter(it => !it.fundName.toLowerCase().includes('tithe'));
      return sum + nonTitheItems.reduce((s, it) => s + it.amount, 0);
    }, 0);
  }, [sabbathEnvelopes]);

  const sabbathLooseTotal = useMemo(() => {
    return sabbathLoose.reduce((sum, l) => sum + l.totalAmount, 0);
  }, [sabbathLoose]);

  const totalSabbathOffering = sabbathEnvelopeOfferingTotal + sabbathLooseTotal;
  const grandTotalSabbath = sabbathTitheTotal + totalSabbathOffering;

  // Envelope Form Total
  const currentTitheNum = parseFloat(titheAmount) || 0;
  const currentBudgetNum = parseFloat(churchBudgetAmount) || 0;
  const currentSsNum = parseFloat(ssMissionAmount) || 0;
  const currentBuildNum = parseFloat(buildingAmount) || 0;
  const currentDorcasNum = parseFloat(dorcasAmount) || 0;
  const currentCustomNum = parseFloat(customFundAmount) || 0;
  const formCalculatedTotal = currentTitheNum + currentBudgetNum + currentSsNum + currentBuildNum + currentDorcasNum + currentCustomNum;

  // Handle Envelope Submission
  const handleEnvelopeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formCalculatedTotal <= 0) {
      alert("Please enter a tithe or offering amount.");
      return;
    }

    const donorName = donorType === 'member'
      ? (churchMembers.find(m => m.id === selectedMemberId)?.name || 'Church Member')
      : customDonorName.trim() || 'Anonymous Contributor';

    const items: OfferingEnvelopeItem[] = [];

    if (currentTitheNum > 0) {
      items.push({
        id: `item-tithe-${Date.now()}`,
        category: 'conference_trust',
        fundName: 'Tithe (Conference Sacred Trust 10%)',
        amount: currentTitheNum
      });
    }

    if (currentBudgetNum > 0) {
      items.push({
        id: `item-budget-${Date.now()}`,
        category: 'local_church',
        fundName: 'Local Church Operating Budget',
        amount: currentBudgetNum
      });
    }

    if (currentSsNum > 0) {
      items.push({
        id: `item-ss-${Date.now()}`,
        category: 'conference_trust',
        fundName: 'Sabbath School World Mission Offering',
        amount: currentSsNum
      });
    }

    if (currentBuildNum > 0) {
      items.push({
        id: `item-bld-${Date.now()}`,
        category: 'local_church',
        fundName: 'Church Sanctuary & Development Fund',
        amount: currentBuildNum
      });
    }

    if (currentDorcasNum > 0) {
      items.push({
        id: `item-drc-${Date.now()}`,
        category: 'auxiliary',
        fundName: 'Dorcas & Community Welfare Fund',
        amount: currentDorcasNum
      });
    }

    if (currentCustomNum > 0 && customFundName.trim()) {
      items.push({
        id: `item-cst-${Date.now()}`,
        category: 'local_church',
        fundName: customFundName.trim(),
        amount: currentCustomNum
      });
    }

    const newEnvelopeData: Omit<OfferingEnvelope, 'id' | 'churchId' | 'receiptNumber'> = {
      envelopeNumber: envelopeNumber.trim() || undefined,
      donorType,
      memberId: donorType === 'member' ? selectedMemberId : undefined,
      donorName,
      date: selectedSabbathDate,
      paymentMethod,
      checkOrRefNumber: checkOrRef.trim() || undefined,
      items,
      totalAmount: formCalculatedTotal,
      isConfidential: true,
      issuedReceipt: true,
      receivedBy: currentTreasurer.name
    };

    onAddEnvelope(newEnvelopeData);

    // Create a temporary object to immediately open the receipt
    const tempReceipt: OfferingEnvelope = {
      ...newEnvelopeData,
      id: `env-${Date.now()}`,
      churchId: 'current',
      receiptNumber: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    };

    setIsAddEnvelopeOpen(false);
    // Reset form
    setTitheAmount('0');
    setChurchBudgetAmount('0');
    setSsMissionAmount('0');
    setBuildingAmount('0');
    setDorcasAmount('0');
    setCustomFundName('');
    setCustomFundAmount('0');
    setCheckOrRef('');
    setEnvelopeNumber(`ENV-${Math.floor(100 + Math.random() * 900)}`);

    // Instantly show digital receipt modal
    setSelectedEnvelopeForReceipt(tempReceipt);
  };

  // Handle Loose Offering Submit
  const handleLooseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(looseAmount);
    if (!amountVal || amountVal <= 0) {
      alert("Please enter a valid loose offering amount.");
      return;
    }

    onAddLooseOffering({
      date: selectedSabbathDate,
      serviceType: looseServiceType,
      treasurerName: currentTreasurer.name,
      secondOfficerName: secondOfficerName.trim(),
      secondOfficerRole,
      denominationBreakdown: {},
      totalAmount: amountVal,
      targetFund: looseTargetFund,
      isSignedByBoth: true,
      deaconReceiptIssued: true,
      notes: `Counted and verified together on Sabbath by ${currentTreasurer.name} (Treasurer) and ${secondOfficerName} (${secondOfficerRole}).`
    });

    setIsAddLooseOpen(false);
    setLooseAmount('');
  };

  // Generate WhatsApp / SMS text for Digital Receipt
  const generateReceiptText = (receipt: OfferingEnvelope) => {
    const titheItem = receipt.items.find(it => it.fundName.toLowerCase().includes('tithe'));
    const nonTitheItems = receipt.items.filter(it => !it.fundName.toLowerCase().includes('tithe'));

    return `🏛️ SEVENTH-DAY ADVENTIST CHURCH
OFFICIAL DIGITAL STEWARDSHIP RECEIPT
------------------------------------------------
Receipt No: ${receipt.receiptNumber}
Sabbath Date: ${receipt.date}
Member: ${receipt.donorName} (${receipt.envelopeNumber || 'Direct'})
Church: ${currentTreasurer.churchName || 'Woodlands SDA Church'}
Currency: Zambian Kwacha (${CURRENCY_CODE})
------------------------------------------------
${titheItem ? `• Tithe (Sacred 10% Trust): ${formatKwacha(titheItem.amount)}\n` : ''}${nonTitheItems.map(it => `• ${it.fundName}: ${formatKwacha(it.amount)}`).join('\n')}
------------------------------------------------
TOTAL CONTRIBUTED: ${formatKwacha(receipt.totalAmount)}
Channel: ${receipt.paymentMethod.replace(/_/g, ' ').toUpperCase()}
Received By: ${receipt.receivedBy} (Treasurer)
Status: Issued & Deposited into Church Custody

"Bring ye all the tithes into the storehouse..." — Malachi 3:10
Official record preserved in Church Treasury Registry.`;
  };

  const handleCopyReceipt = (receipt: OfferingEnvelope) => {
    const text = generateReceiptText(receipt);
    navigator.clipboard.writeText(text);
    setCopiedReceiptId(receipt.receiptNumber);
    setTimeout(() => setCopiedReceiptId(null), 3000);
  };

  const handleDownloadReceipt = (receipt: OfferingEnvelope) => {
    const text = generateReceiptText(receipt);
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SDA_Digital_Receipt_${receipt.receiptNumber}_${receipt.donorName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Search filtered envelopes
  const displayedEnvelopes = useMemo(() => {
    if (!searchQuery.trim()) return sabbathEnvelopes;
    const q = searchQuery.toLowerCase();
    return sabbathEnvelopes.filter(e => 
      e.donorName.toLowerCase().includes(q) ||
      (e.envelopeNumber && e.envelopeNumber.toLowerCase().includes(q)) ||
      e.receiptNumber.toLowerCase().includes(q)
    );
  }, [sabbathEnvelopes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Sabbath Date Selection & Quick Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                Local Church Treasury Desk
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-full text-[10px] font-bold">
                {currentTreasurer.churchName || 'Woodlands SDA Church'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Sabbath Tithe & Offering Collection
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enter figures collected on Sabbath, manage envelope tithes, and issue official instant digital receipts.
            </p>
          </div>

          {/* Sabbath Date Selector */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Sabbath Date:
              </span>
            </div>
            <input
              type="date"
              value={selectedSabbathDate}
              onChange={(e) => setSelectedSabbathDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-xs text-slate-900 outline-none focus:border-blue-900 shadow-xs"
            />
            {selectedSabbathDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedSabbathDate(todayStr)}
                className="px-3 py-2 bg-blue-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all"
              >
                Go to Today
              </button>
            )}
          </div>
        </div>

        {/* 4 Big Figures Collected on this Particular Sabbath */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Total Tithe */}
          <div className="p-5 bg-gradient-to-br from-blue-950 to-indigo-950 text-white rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block">
                  Sacred Tithe Collected ({CURRENCY_CODE})
                </span>
                <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-amber-400">
                  {formatKwacha(sabbathTitheTotal)}
                </p>
              </div>
              <div className="p-2 bg-white/10 rounded-xl">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-[10px] text-blue-200 font-medium mt-3 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Conference Sacred Trust (Envelope)
            </p>
          </div>

          {/* Total Offerings */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block">
                  Total Offerings Collected
                </span>
                <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-emerald-400">
                  {formatKwacha(totalSabbathOffering)}
                </p>
              </div>
              <div className="p-2 bg-white/10 rounded-xl">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-300 font-medium mt-3">
              Envelopes: {formatKwacha(sabbathEnvelopeOfferingTotal)} • Loose: {formatKwacha(sabbathLooseTotal)}
            </p>
          </div>

          {/* Grand Sabbath Collection */}
          <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 block">
                  Grand Sabbath Total
                </span>
                <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-amber-950">
                  {formatKwacha(grandTotalSabbath)}
                </p>
              </div>
              <div className="p-2 bg-amber-200 text-amber-900 rounded-xl font-black text-xs">
                {CURRENCY_CODE}
              </div>
            </div>
            <p className="text-[10px] text-amber-800 font-bold mt-3">
              Tithe + All Sabbath Offerings Combined
            </p>
          </div>

          {/* Digital Receipts Count */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Digital Receipts Issued
                </span>
                <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-slate-900">
                  {sabbathEnvelopes.length}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Digital Receipts
            </p>
          </div>
        </div>

        {/* Action Buttons: Enter Sabbath Figures */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsAddEnvelopeOpen(true)}
            className="px-5 py-3 bg-blue-950 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Enter Tithe & Offering Envelope (Issue Digital Receipt)
          </button>

          <button
            type="button"
            onClick={() => setIsAddLooseOpen(true)}
            className="px-5 py-3 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all flex items-center gap-2 shadow-sm"
          >
            <Banknote className="w-4 h-4" />
            Enter Sabbath Loose Offering
          </button>

          {onNavigateToStatements && (
            <button
              type="button"
              onClick={onNavigateToStatements}
              className="px-4 py-3 bg-amber-500/10 text-amber-900 border border-amber-300/60 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-amber-500/20 transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              Member Giving Statements
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSubTab('sabbath_summary')}
            className="px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center gap-2 ml-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            Sabbath Balancing Sheet
          </button>
        </div>
      </div>

      {/* Main Content Area: Sub Tabs */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navigation bar for this Sabbath */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'all'
                  ? 'bg-blue-950 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Collections ({sabbathEnvelopes.length + sabbathLoose.length})
            </button>
            <button
              onClick={() => setActiveSubTab('tithe_envelopes')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeSubTab === 'tithe_envelopes'
                  ? 'bg-blue-950 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              Tithe Envelopes ({sabbathEnvelopes.length})
            </button>
            <button
              onClick={() => setActiveSubTab('loose_offerings')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'loose_offerings'
                  ? 'bg-blue-950 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Loose Offerings ({sabbathLoose.length})
            </button>
            <button
              onClick={() => setActiveSubTab('sabbath_summary')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'sabbath_summary'
                  ? 'bg-blue-950 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Balancing Report
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, envelope #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-900"
            />
          </div>
        </div>

        {/* Sub-Tab 1: Tithe Envelopes List & Digital Receipt Issuance */}
        {(activeSubTab === 'all' || activeSubTab === 'tithe_envelopes') && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Tithe Envelopes & Member Contributions
                </h3>
                <p className="text-xs text-slate-500">
                  Individual envelope submissions collected on {selectedSabbathDate}. Issue, print, or send digital receipts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEnvelopeOpen(true)}
                className="px-3.5 py-2 bg-blue-950 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Envelope
              </button>
            </div>

            {displayedEnvelopes.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                  No Tithe Envelopes Recorded for {selectedSabbathDate}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click the button below to manually enter envelope figures collected during this Sabbath service and immediately generate a digital receipt.
                </p>
                <button
                  onClick={() => setIsAddEnvelopeOpen(true)}
                  className="mt-4 px-5 py-2.5 bg-blue-950 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all"
                >
                  Enter First Envelope for {selectedSabbathDate}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-black text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Envelope #</th>
                      <th className="py-3 px-4">Contributor / Member</th>
                      <th className="py-3 px-4 text-right">Sacred Tithe</th>
                      <th className="py-3 px-4 text-right">Local Offerings</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4 text-center">Digital Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedEnvelopes.map((env) => {
                      const titheItem = env.items.find(it => it.fundName.toLowerCase().includes('tithe'));
                      const titheAmt = titheItem ? titheItem.amount : 0;
                      const offeringAmt = env.totalAmount - titheAmt;

                      return (
                        <tr key={env.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {env.envelopeNumber || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 block text-xs">
                              {env.donorName}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              {env.receiptNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-900">
                            {titheAmt > 0 ? formatKwacha(titheAmt) : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-bold">
                            {formatKwacha(offeringAmt)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-blue-950 text-sm">
                            {formatKwacha(env.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-700 uppercase">
                              {env.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedEnvelopeForReceipt(env)}
                                className="px-3 py-1.5 bg-blue-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs"
                                title="View and Issue Official Digital Receipt"
                              >
                                <Receipt className="w-3 h-3 text-amber-400" />
                                Digital Receipt
                              </button>
                              <button
                                onClick={() => handleCopyReceipt(env)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                                title="Copy Receipt for WhatsApp / SMS"
                              >
                                {copiedReceiptId === env.receiptNumber ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab 2: Loose Offerings List */}
        {(activeSubTab === 'all' || activeSubTab === 'loose_offerings') && (
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Loose Offering Collections ({selectedSabbathDate})
                </h3>
                <p className="text-xs text-slate-500">
                  Plate and bucket loose collections counted jointly with the serving Deacon / Deaconess.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLooseOpen(true)}
                className="px-3.5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Loose Offering
              </button>
            </div>

            {sabbathLoose.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Banknote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">
                  No loose offerings recorded for {selectedSabbathDate}.
                </p>
                <button
                  onClick={() => setIsAddLooseOpen(true)}
                  className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-400"
                >
                  Enter Loose Offering
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-black text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Target Offering Fund</th>
                      <th className="py-3 px-4">Dual-Counting Officers</th>
                      <th className="py-3 px-4 text-right">Amount Collected</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sabbathLoose.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {l.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {l.serviceType}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {l.targetFund}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          <strong>{l.treasurerName}</strong> & {l.secondOfficerName} ({l.secondOfficerRole})
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                          {formatKwacha(l.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Dual-Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab 3: Sabbath Balancing Report */}
        {activeSubTab === 'sabbath_summary' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Official Sabbath Treasury Balancing Sheet
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {currentTreasurer.churchName || 'Woodlands SDA Church'} • Sabbath Date: {selectedSabbathDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-950 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Balancing Slip
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receipts by Category */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 border-b border-slate-200 pb-2">
                  1. Collection Channels Summary
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Envelopes Processed:</span>
                    <span className="font-bold text-slate-900">{sabbathEnvelopes.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Total from Envelopes:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatKwacha(sabbathTitheTotal + sabbathEnvelopeOfferingTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Total Loose Collections ({sabbathLoose.length} services):</span>
                    <span className="font-mono font-bold text-slate-900">{formatKwacha(sabbathLooseTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-3 font-black text-sm text-slate-900 border-t-2 border-slate-300">
                    <span>Grand Sabbath Total:</span>
                    <span className="font-mono text-blue-950">{formatKwacha(grandTotalSabbath)}</span>
                  </div>
                </div>
              </div>

              {/* Fund Allocation Breakdown */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 border-b border-slate-200 pb-2">
                  2. Fund Allocation Breakdown ({CURRENCY_CODE})
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700 font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Conference Tithe (Sacred Trust):
                    </span>
                    <span className="font-mono font-black text-amber-900">{formatKwacha(sabbathTitheTotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Local Church Operating Budget:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatKwacha(sabbathLooseTotal + (sabbathEnvelopeOfferingTotal * 0.6))}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">World Mission / SS Offerings:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatKwacha(sabbathEnvelopeOfferingTotal * 0.25)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Church Building & Auxiliary:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatKwacha(sabbathEnvelopeOfferingTotal * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 font-black text-sm text-slate-900 border-t-2 border-slate-300">
                    <span>Total Balanced Funds:</span>
                    <span className="font-mono text-emerald-800">{formatKwacha(grandTotalSabbath)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black uppercase tracking-wider text-[10px]">
                  Church Manual Stewardship Custody
                </strong>
                <p className="text-[11px] mt-0.5">
                  All tithe is held strictly in sacred trust for the local conference. Local church offerings are preserved for voted church board appropriations. No diversion of funds is permissible.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: MANUAL ENTRY FOR ENVELOPE (TITHE & OFFERING) WITH DIGITAL RECEIPT
         ========================================================================= */}
      {isAddEnvelopeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-950 font-black text-[9px] uppercase tracking-wider rounded-md">
                  Sabbath Collection Entry
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mt-1">
                  Manual Envelope Figures & Digital Receipt
                </h3>
                <p className="text-xs text-slate-500">
                  Enter tithe and offerings from the member envelope for {selectedSabbathDate}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEnvelopeOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnvelopeSubmit} className="space-y-4">
              {/* Member Selection or Visitor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Contributor Type
                  </label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                  >
                    <option value="member">Church Member (From Roll)</option>
                    <option value="visitor">Visitor / New Contributor</option>
                    <option value="anonymous">Anonymous Giver</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Envelope Voucher #
                  </label>
                  <input
                    type="text"
                    value={envelopeNumber}
                    onChange={(e) => setEnvelopeNumber(e.target.value)}
                    placeholder="e.g. ENV-105"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900 font-mono"
                  />
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                  >
                    {churchMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : donorType === 'visitor' ? (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Visitor / Contributor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customDonorName}
                    onChange={(e) => setCustomDonorName(e.target.value)}
                    placeholder="e.g. Bro. Mwape Kaunda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              ) : null}

              {/* FIGURE BREAKDOWN: TITHE & OFFERINGS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Envelope Figures Breakdown in Zambian Kwacha ({CURRENCY_CODE})
                </span>

                {/* 1. Tithe (Sacred Trust) */}
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Sacred Tithe (10% Conference Trust)
                    </span>
                    <span className="text-[9px] text-amber-700 block">
                      Held in strict sacred trust for the Conference
                    </span>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={titheAmount}
                      onChange={(e) => setTitheAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-black text-right text-amber-950 font-mono text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* 2. Local Church Budget */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Local Church Operating Budget</span>
                    <span className="text-[9px] text-slate-400">Utilities, maintenance, evangelism</span>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={churchBudgetAmount}
                      onChange={(e) => setChurchBudgetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-right text-slate-900 font-mono text-xs outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                {/* 3. Sabbath School World Mission */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">World Mission / Sabbath School</span>
                    <span className="text-[9px] text-slate-400">General Conference World Mission fund</span>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ssMissionAmount}
                      onChange={(e) => setSsMissionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-right text-slate-900 font-mono text-xs outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                {/* 4. Sanctuary / Building Fund */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Sanctuary & Building Fund</span>
                    <span className="text-[9px] text-slate-400">Church physical infrastructure</span>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={buildingAmount}
                      onChange={(e) => setBuildingAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-right text-slate-900 font-mono text-xs outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                {/* 5. Dorcas / Welfare */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Dorcas / Benevolent Welfare</span>
                    <span className="text-[9px] text-slate-400">Poor, orphans & community aid</span>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={dorcasAmount}
                      onChange={(e) => setDorcasAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-right text-slate-900 font-mono text-xs outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                {/* Optional Custom Fund */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Other specific fund name"
                    value={customFundName}
                    onChange={(e) => setCustomFundName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount (K)"
                    value={customFundAmount}
                    onChange={(e) => setCustomFundAmount(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900 font-mono"
                  />
                </div>

                {/* CALCULATED TOTAL */}
                <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-800">Total Envelope Contribution:</span>
                  <span className="font-mono text-blue-950 text-xl">
                    {formatKwacha(formCalculatedTotal)}
                  </span>
                </div>
              </div>

              {/* Payment Channel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                  >
                    <option value="cash_envelope">Cash in Envelope</option>
                    <option value="conference_egiving">Mobile Money / e-Giving</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="check">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Transaction / Cheque Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={checkOrRef}
                    onChange={(e) => setCheckOrRef(e.target.value)}
                    placeholder="e.g. TX-98421"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEnvelopeOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formCalculatedTotal <= 0}
                  className="flex-2 py-3 bg-blue-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Save & Issue Digital Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MANUAL ENTRY FOR SABBATH LOOSE OFFERING
         ========================================================================= */}
      {isAddLooseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-950 font-black text-[9px] uppercase tracking-wider rounded-md">
                  Loose Offering Entry
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mt-1">
                  Sabbath Loose Offering Record
                </h3>
                <p className="text-xs text-slate-500">
                  Manual entry for {selectedSabbathDate} with dual-counting officer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLooseOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLooseSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Service / Gathering
                </label>
                <select
                  value={looseServiceType}
                  onChange={(e) => setLooseServiceType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                >
                  <option value="Divine Service">Divine Service (Main Congregation)</option>
                  <option value="Sabbath School">Sabbath School Loose Collection</option>
                  <option value="AY Service">Adventist Youth (AY) Afternoon Service</option>
                  <option value="Midweek Prayer">Midweek Prayer Meeting</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Amount Collected in Zambian Kwacha ({CURRENCY_CODE})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={looseAmount}
                  onChange={(e) => setLooseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-xl outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Target Offering Fund
                </label>
                <select
                  value={looseTargetFund}
                  onChange={(e) => setLooseTargetFund(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                >
                  <option value="Local Church Budget (Combined Offering Plan)">Local Church Budget (Combined Offering Plan)</option>
                  <option value="Sabbath School Expense">Sabbath School Department Expense</option>
                  <option value="Adventist Youth Ministries (AYM)">Adventist Youth Ministries (AYM)</option>
                  <option value="Sanctuary Building Fund">Sanctuary Building Fund</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Co-Counting Officer
                  </label>
                  <input
                    type="text"
                    required
                    value={secondOfficerName}
                    onChange={(e) => setSecondOfficerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Officer Role
                  </label>
                  <select
                    value={secondOfficerRole}
                    onChange={(e) => setSecondOfficerRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="Deacon">Deacon</option>
                    <option value="Deaconess">Deaconess</option>
                    <option value="Elder">First Elder</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLooseOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all font-bold"
                >
                  Save Loose Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL DIGITAL TITHE & OFFERING RECEIPT (VIEW / PRINT / COPY)
         ========================================================================= */}
      {selectedEnvelopeForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 border border-slate-100 my-8 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Brand */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-950 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-md">
                  SDA
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 leading-tight">
                    {currentTreasurer.churchName || 'Woodlands Seventh-day Adventist Church'}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-800">
                    Local Treasury & Stewardship Custody
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Official Digital Tithe & Offering Receipt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnvelopeForReceipt(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Receipt Verification Bar */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                    Verified Digital Receipt
                  </span>
                  <span className="text-[9px] text-emerald-700 font-mono">
                    ID: {selectedEnvelopeForReceipt.receiptNumber}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg">
                Issued & Logged
              </span>
            </div>

            {/* Core Member Details Card */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Received From (Member)
                </span>
                <span className="font-black text-slate-900 text-sm block">
                  {selectedEnvelopeForReceipt.donorName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Envelope Voucher #
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {selectedEnvelopeForReceipt.envelopeNumber || 'Direct Transfer'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Sabbath Date Received
                </span>
                <span className="font-bold text-slate-800">
                  {selectedEnvelopeForReceipt.date}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Payment Channel
                </span>
                <span className="font-bold text-slate-800 uppercase text-[11px]">
                  {selectedEnvelopeForReceipt.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Itemized Tithe & Offering Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Itemized Stewardship Contribution
              </span>
              <div className="divide-y divide-slate-100 border-y border-slate-200">
                {selectedEnvelopeForReceipt.items.map((it, idx) => {
                  const isTithe = it.fundName.toLowerCase().includes('tithe');
                  return (
                    <div key={idx} className="flex justify-between items-center py-2 text-xs">
                      <span className={`flex items-center gap-1.5 ${isTithe ? 'font-black text-amber-950' : 'text-slate-700'}`}>
                        {isTithe && <Lock className="w-3 h-3 text-amber-700" />}
                        {it.fundName}
                      </span>
                      <span className={`font-mono ${isTithe ? 'font-black text-amber-950 text-sm' : 'font-bold text-slate-900'}`}>
                        {formatKwacha(it.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center py-3 bg-slate-900 text-white px-4 rounded-xl font-mono text-base font-black">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-sans">
                  Total Received ({CURRENCY_CODE}):
                </span>
                <span className="text-amber-400">
                  {formatKwacha(selectedEnvelopeForReceipt.totalAmount)}
                </span>
              </div>
            </div>

            {/* Scripture & Custody Notice */}
            <div className="text-center p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="text-[10px] italic text-slate-600 font-medium">
                "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts..."
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                — Malachi 3:10
              </p>
              <p className="text-[9px] text-slate-500 font-medium pt-1">
                Authorized Custodian: <strong>{selectedEnvelopeForReceipt.receivedBy}</strong> (Church Treasurer)
              </p>
            </div>

            {/* Actions: Print, Download, Copy WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>

              <button
                type="button"
                onClick={() => handleDownloadReceipt(selectedEnvelopeForReceipt)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Save / Export
              </button>

              <button
                type="button"
                onClick={() => handleCopyReceipt(selectedEnvelopeForReceipt)}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                {copiedReceiptId === selectedEnvelopeForReceipt.receiptNumber ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to Send!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Copy for WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
