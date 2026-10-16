import React, { useState, useMemo } from 'react';
import { OfferingEnvelope, ChurchMember, User } from '../../types';
import { formatKwacha, CURRENCY_SYMBOL, CURRENCY_CODE, CURRENCY_NAME } from '../../utils/currency';
import { 
  FileText, Search, Calendar, Lock, Eye, EyeOff, Printer, 
  Download, Share2, ShieldCheck, CheckCircle2, AlertCircle, 
  Send, UserCheck, Receipt, Building2, BookOpen, Coins, Sparkles,
  ArrowRight, FileSpreadsheet, Copy, Check, Filter
} from 'lucide-react';
import SDALogo from '../SDALogo';

interface MemberStatementGeneratorViewProps {
  envelopes: OfferingEnvelope[];
  churchMembers: ChurchMember[];
  currentTreasurer: User;
  onViewEnvelopeReceipt?: (envelope: OfferingEnvelope) => void;
}

export const MemberStatementGeneratorView: React.FC<MemberStatementGeneratorViewProps> = ({
  envelopes,
  churchMembers,
  currentTreasurer,
  onViewEnvelopeReceipt
}) => {
  // Member filter state
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    churchMembers[0]?.id || ''
  );
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Date range filter state
  // Default to Year to Date (current year)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [fundCategoryFilter, setFundCategoryFilter] = useState<'all' | 'tithe_only' | 'local_only' | 'mission_only'>('all');

  // Confidentiality & Privacy view toggle
  const [isPrivacyMaskActive, setIsPrivacyMaskActive] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Filtered members for dropdown search
  const filteredMemberList = useMemo(() => {
    if (!memberSearchTerm.trim()) return churchMembers;
    const term = memberSearchTerm.toLowerCase();
    return churchMembers.filter(m => 
      m.name.toLowerCase().includes(term) ||
      (m.memberNumber && m.memberNumber.toLowerCase().includes(term)) ||
      (m.contact && m.contact.includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term))
    );
  }, [churchMembers, memberSearchTerm]);

  // Selected member object
  const selectedMember = useMemo(() => {
    return churchMembers.find(m => m.id === selectedMemberId) || null;
  }, [churchMembers, selectedMemberId]);

  // Filter envelopes for the selected member and date range
  const memberEnvelopes = useMemo(() => {
    if (!selectedMember) return [];

    return envelopes.filter(env => {
      // Match by memberId, or by exact donor name if memberId is not linked
      const matchesMember = 
        (env.memberId && env.memberId === selectedMember.id) ||
        env.donorName.trim().toLowerCase() === selectedMember.name.trim().toLowerCase();

      if (!matchesMember) return false;

      // Date filtering
      if (startDate && env.date < startDate) return false;
      if (endDate && env.date > endDate) return false;

      // Fund category filter
      if (fundCategoryFilter === 'tithe_only') {
        return env.items.some(i => i.category === 'conference_trust' && i.fundName.toLowerCase().includes('tithe'));
      }
      if (fundCategoryFilter === 'local_only') {
        return env.items.some(i => i.category === 'local_church');
      }
      if (fundCategoryFilter === 'mission_only') {
        return env.items.some(i => i.category === 'conference_trust' && !i.fundName.toLowerCase().includes('tithe'));
      }

      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [envelopes, selectedMember, startDate, endDate, fundCategoryFilter]);

  // Calculate detailed financial totals in Zambian Kwacha (K)
  const statementMetrics = useMemo(() => {
    let titheTotal = 0;
    let localBudgetTotal = 0;
    let buildingFundTotal = 0;
    let worldMissionTotal = 0;
    let auxiliaryTotal = 0;
    let otherOfferingsTotal = 0;

    memberEnvelopes.forEach(env => {
      env.items.forEach(item => {
        const amt = item.amount || 0;
        const fname = item.fundName.toLowerCase();
        
        if (fname.includes('tithe')) {
          titheTotal += amt;
        } else if (fname.includes('building') || fname.includes('sanctuary')) {
          buildingFundTotal += amt;
        } else if (item.category === 'local_church' || fname.includes('budget') || fname.includes('combined')) {
          localBudgetTotal += amt;
        } else if (fname.includes('mission') || fname.includes('sabbath school') || fname.includes('thirteenth') || fname.includes('birthday') || fname.includes('investment')) {
          worldMissionTotal += amt;
        } else if (item.category === 'auxiliary') {
          auxiliaryTotal += amt;
        } else {
          otherOfferingsTotal += amt;
        }
      });
    });

    const totalOfferings = localBudgetTotal + buildingFundTotal + worldMissionTotal + auxiliaryTotal + otherOfferingsTotal;
    const grandTotal = titheTotal + totalOfferings;

    return {
      titheTotal,
      localBudgetTotal,
      buildingFundTotal,
      worldMissionTotal,
      auxiliaryTotal,
      otherOfferingsTotal,
      totalOfferings,
      grandTotal,
      count: memberEnvelopes.length,
      averagePerEnvelope: memberEnvelopes.length > 0 ? grandTotal / memberEnvelopes.length : 0
    };
  }, [memberEnvelopes]);

  // Quick Preset Date Ranges
  const handleSetPresetRange = (preset: 'ytd' | 'q3' | 'q2' | 'q1' | 'prior_year' | 'all') => {
    const y = currentYear;
    if (preset === 'ytd') {
      setStartDate(`${y}-01-01`);
      setEndDate(new Date().toISOString().split('T')[0]);
    } else if (preset === 'q3') {
      setStartDate(`${y}-07-01`);
      setEndDate(`${y}-09-30`);
    } else if (preset === 'q2') {
      setStartDate(`${y}-04-01`);
      setEndDate(`${y}-06-30`);
    } else if (preset === 'q1') {
      setStartDate(`${y}-01-01`);
      setEndDate(`${y}-03-31`);
    } else if (preset === 'prior_year') {
      setStartDate(`${y - 1}-01-01`);
      setEndDate(`${y - 1}-12-31`);
    } else if (preset === 'all') {
      setStartDate('2024-01-01');
      setEndDate(`${y + 1}-12-31`);
    }
  };

  // Statement unique verification code
  const statementVerificationNo = useMemo(() => {
    if (!selectedMember) return 'STMT-0000';
    const memberCode = selectedMember.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `STMT-ZMW-${currentYear}-${memberCode}-${memberEnvelopes.length}`;
  }, [selectedMember, currentYear, memberEnvelopes.length]);

  // Mask amount for privacy if activated
  const renderAmount = (amount: number) => {
    if (isPrivacyMaskActive) {
      return 'ZMW ••••••';
    }
    return formatKwacha(amount);
  };

  // Copy private message for WhatsApp/SMS dispatch
  const handleCopyPrivateSummary = () => {
    if (!selectedMember) return;
    const msg = `*CONFIDENTIAL GIVING STATEMENT*\n` +
      `Seventh-day Adventist Church - ${currentTreasurer.churchName || 'Woodlands SDA Church'}\n` +
      `Member: ${selectedMember.name}\n` +
      `Period: ${startDate} to ${endDate}\n` +
      `---------------------------------\n` +
      `• Sacred Tithe (Conference Trust): ${formatKwacha(statementMetrics.titheTotal)}\n` +
      `• Local Church Operating Budget: ${formatKwacha(statementMetrics.localBudgetTotal)}\n` +
      `• Sanctuary Building Fund: ${formatKwacha(statementMetrics.buildingFundTotal)}\n` +
      `• World Mission & Sabbath School: ${formatKwacha(statementMetrics.worldMissionTotal)}\n` +
      `• Auxiliary Ministries: ${formatKwacha(statementMetrics.auxiliaryTotal)}\n` +
      `---------------------------------\n` +
      `*GRAND TOTAL CONTRIBUTED: ${formatKwacha(statementMetrics.grandTotal)}*\n` +
      `Envelopes Logged: ${statementMetrics.count}\n` +
      `Statement Ref: ${statementVerificationNo}\n` +
      `Issued By: ${currentTreasurer.name} (Treasurer)\n\n` +
      `_Note: In accordance with the SDA Church Manual Section 7, individual giving records are strictly confidential and issued exclusively to the member._`;

    navigator.clipboard.writeText(msg);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // Download statement as formatted text file
  const handleDownloadStatement = () => {
    if (!selectedMember) return;
    const content = 
`================================================================================
SEVENTH-DAY ADVENTIST CHURCH
LUSAKA CONFERENCE OF SEVENTH-DAY ADVENTISTS
${(currentTreasurer.churchName || 'WOODLANDS SDA CHURCH').toUpperCase()} - TREASURY DEPARTMENT
OFFICIAL MEMBER CONTRIBUTIONS STATEMENT (CONFIDENTIAL)
================================================================================

Statement No:    ${statementVerificationNo}
Generated Date:  ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
Period Covered:  ${startDate} through ${endDate}
Currency:        ${CURRENCY_NAME} (${CURRENCY_CODE})

MEMBER INFORMATION:
--------------------------------------------------------------------------------
Full Name:       ${selectedMember.name}
Member ID:       ${selectedMember.id}
Address:         ${selectedMember.address || 'N/A'}
Contact Phone:   ${selectedMember.contact || 'N/A'}
Email:           ${selectedMember.email || 'N/A'}

FINANCIAL CONTRIBUTIONS SUMMARY:
--------------------------------------------------------------------------------
1. Sacred Tithe (10% Conference Sacred Trust) : ${formatKwacha(statementMetrics.titheTotal, { showCode: true })}
2. Local Church Operating Budget              : ${formatKwacha(statementMetrics.localBudgetTotal, { showCode: true })}
3. Sanctuary Expansion & Building Fund        : ${formatKwacha(statementMetrics.buildingFundTotal, { showCode: true })}
4. World Mission & Sabbath School Offerings    : ${formatKwacha(statementMetrics.worldMissionTotal, { showCode: true })}
5. Auxiliary Ministries (AYM, Dorcas, Music)   : ${formatKwacha(statementMetrics.auxiliaryTotal, { showCode: true })}
6. Other Designated Gifts                     : ${formatKwacha(statementMetrics.otherOfferingsTotal, { showCode: true })}
--------------------------------------------------------------------------------
TOTAL CONTRIBUTIONS IN PERIOD                 : ${formatKwacha(statementMetrics.grandTotal, { showCode: true })}
Total Envelopes Recorded                      : ${statementMetrics.count}
Average per Envelope                          : ${formatKwacha(statementMetrics.averagePerEnvelope, { showCode: true })}

ITEMIZED RECEIPT LEDGER:
--------------------------------------------------------------------------------
Date       | Receipt #      | Envelope | Channel        | Tithe (K)  | Local (K)  | Total (K)
--------------------------------------------------------------------------------
${memberEnvelopes.map(env => {
  const tithe = env.items.filter(i => i.fundName.toLowerCase().includes('tithe')).reduce((s, i) => s + i.amount, 0);
  const local = env.items.filter(i => i.category === 'local_church').reduce((s, i) => s + i.amount, 0);
  return `${env.date.padEnd(10)} | ${env.receiptNumber.padEnd(14)} | ${(env.envelopeNumber || 'Direct').padEnd(8)} | ${env.paymentMethod.replace(/_/g, ' ').slice(0, 14).padEnd(14)} | ${tithe.toFixed(2).padStart(10)} | ${local.toFixed(2).padStart(10)} | ${env.totalAmount.toFixed(2).padStart(10)}`;
}).join('\n')}
--------------------------------------------------------------------------------

CHURCH MANUAL CONFIDENTIALITY CERTIFICATION:
In accordance with Section 7 of the Seventh-day Adventist Church Manual:
"The record of personal tithes and offerings of members is strictly confidential. 
The treasurer must never disclose individual contributions to any unauthorized 
person, church board member, or nominating committee."

Issued by authorized custodian:
${currentTreasurer.name}, Church Treasurer
${currentTreasurer.churchName || 'Woodlands SDA Church'}
Official Treasury Seal Applied.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SDA_Member_Statement_${selectedMember.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5" /> Church Manual Section 7 Compliant
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-full text-[10px] font-bold">
                Currency: Zambian Kwacha ({CURRENCY_CODE})
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Member Giving Statement Generator
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Generate an official, itemized summary of individual contributions for any specific date range.
              Ensures strict compliance with the Adventist Church Manual: giving figures are sacred trust 
              records reserved solely for the member's personal stewardship and tax filing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Privacy Mask Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivacyMaskActive(!isPrivacyMaskActive)}
              className={`px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border ${
                isPrivacyMaskActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
              }`}
              title={isPrivacyMaskActive ? "Click to reveal numbers" : "Click to mask numbers on screen for desk privacy"}
            >
              {isPrivacyMaskActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPrivacyMaskActive ? "Privacy Screen ON" : "Mask Desk Screen"}
            </button>

            {/* Print Official Statement */}
            <button
              type="button"
              disabled={!selectedMember || memberEnvelopes.length === 0}
              onClick={() => setIsPrintModalOpen(true)}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Official Statement
            </button>
          </div>
        </div>
      </div>

      {/* Confidentiality Oath & Protocol Card */}
      <div className="p-4 bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 block">
              Sacred Trust Mandate: Zero Disclosure to Boards or Committees
            </span>
            <p className="text-xs text-amber-900/80 font-medium leading-tight">
              "Under no circumstances should the treasurer allow any unauthorized person to examine tithe and offering records. 
              The list of givers and amounts must never be made public." — <em>SDA Church Manual</em>
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-200/70 text-amber-900 rounded-full text-[10px] font-mono font-bold whitespace-nowrap">
          Custodian: {currentTreasurer.name}
        </span>
      </div>

      {/* Controls & Filter Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Member Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-900" />
              1. Select Church Member
            </label>

            {/* Member Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                placeholder="Search member by name, ID or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              />
            </div>

            {/* Member Dropdown / Select List */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/50 shadow-inner">
              {filteredMemberList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No church members found matching "{memberSearchTerm}"
                </div>
              ) : (
                filteredMemberList.map(member => {
                  const isSelected = member.id === selectedMemberId;
                  const memberEnvelopeCount = envelopes.filter(e => 
                    e.memberId === member.id || e.donorName.toLowerCase() === member.name.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-blue-950 text-white font-black' 
                          : 'hover:bg-slate-100/80 text-slate-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">{member.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <span className={`text-[10px] block truncate ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          {member.contact || member.email || 'Woodlands Member'} • ID: {member.id}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {memberEnvelopeCount} records
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Date Range & Presets (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                2. Contribution Date Range Filter
              </label>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetPresetRange('ytd')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  YTD 2026
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetRange('q3')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Q3
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetRange('q2')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Q2
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetRange('prior_year')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  FY 2025
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetRange('all')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  All
                </button>
              </div>
            </div>

            {/* Custom Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Start Date (From)
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-900"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  End Date (To)
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-900"
                />
              </div>
            </div>

            {/* Optional Fund Category Focus */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                Fund Focus:
              </span>
              <button
                type="button"
                onClick={() => setFundCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  fundCategoryFilter === 'all'
                    ? 'bg-blue-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Funds (Comprehensive)
              </button>
              <button
                type="button"
                onClick={() => setFundCategoryFilter('tithe_only')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  fundCategoryFilter === 'tithe_only'
                    ? 'bg-blue-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sacred Tithe Only
              </button>
              <button
                type="button"
                onClick={() => setFundCategoryFilter('local_only')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  fundCategoryFilter === 'local_only'
                    ? 'bg-blue-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Local Church Budget
              </button>
              <button
                type="button"
                onClick={() => setFundCategoryFilter('mission_only')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  fundCategoryFilter === 'mission_only'
                    ? 'bg-blue-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                World Mission Offerings
              </button>
            </div>
          </div>
        </div>

        {/* Selected Member Profile Card */}
        {selectedMember && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">{selectedMember.name}</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded-md">
                    {selectedMember.memberType || 'Baptized Member'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  ID: <span className="font-mono">{selectedMember.id}</span> • {selectedMember.address || 'Woodlands, Lusaka'} • {selectedMember.contact || 'No phone recorded'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 font-mono">
                Verification No: <strong className="text-slate-900">{statementVerificationNo}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyPrivateSummary}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                title="Copy formatted summary to paste into private message/WhatsApp"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedShareLink ? "Copied" : "Copy for Member"}
              </button>
              <button
                type="button"
                onClick={handleDownloadStatement}
                className="px-3.5 py-2 bg-blue-950 hover:bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download Statement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Figures in Zambian Kwacha (K / ZMW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sacred Tithe Card */}
        <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-950/80 block">
                Sacred Tithe (10% Trust)
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-1 font-mono tracking-tight">
                {renderAmount(statementMetrics.titheTotal)}
              </p>
            </div>
            <div className="p-2.5 bg-slate-950/10 rounded-2xl">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-amber-950/80 mt-3">
            100% Remitted to Lusaka Conference
          </p>
        </div>

        {/* Local Church Operating Budget */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Local Church Operating Budget
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-blue-950">
                {renderAmount(statementMetrics.localBudgetTotal)}
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-2xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-3">
            Retained locally for church ministries & utility operations
          </p>
        </div>

        {/* Sanctuary Expansion / Building Fund */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Sanctuary Building Fund
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-emerald-900">
                {renderAmount(statementMetrics.buildingFundTotal)}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-2xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-3">
            Restricted local capital development reserve
          </p>
        </div>

        {/* Grand Total Contributed */}
        <div className="p-6 bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block">
                Grand Total Contributed ({CURRENCY_CODE})
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-1 font-mono text-amber-400">
                {renderAmount(statementMetrics.grandTotal)}
              </p>
            </div>
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-[10px] text-blue-200 font-medium mt-3">
            {statementMetrics.count} envelopes recorded ({startDate} – {endDate})
          </p>
        </div>

      </div>

      {/* Additional Offering Breakdown Bar */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Contribution Allocations in Zambian Kwacha ({CURRENCY_SYMBOL})
            </h4>
            <p className="text-xs text-slate-500">
              Breakdown across conference trust, local church operations, and mission funds
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              Average per contribution: <strong className="font-mono text-slate-900">{renderAmount(statementMetrics.averagePerEnvelope)}</strong>
            </span>
          </div>
        </div>

        {/* Visual Multi-bar Distribution */}
        {statementMetrics.grandTotal > 0 ? (
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${(statementMetrics.titheTotal / statementMetrics.grandTotal) * 100}%` }}
                className="bg-amber-500 h-full transition-all" 
                title={`Tithe: ${formatKwacha(statementMetrics.titheTotal)}`}
              />
              <div 
                style={{ width: `${(statementMetrics.localBudgetTotal / statementMetrics.grandTotal) * 100}%` }}
                className="bg-blue-900 h-full transition-all" 
                title={`Local Budget: ${formatKwacha(statementMetrics.localBudgetTotal)}`}
              />
              <div 
                style={{ width: `${(statementMetrics.buildingFundTotal / statementMetrics.grandTotal) * 100}%` }}
                className="bg-emerald-600 h-full transition-all" 
                title={`Building: ${formatKwacha(statementMetrics.buildingFundTotal)}`}
              />
              <div 
                style={{ width: `${(statementMetrics.worldMissionTotal / statementMetrics.grandTotal) * 100}%` }}
                className="bg-cyan-500 h-full transition-all" 
                title={`Mission: ${formatKwacha(statementMetrics.worldMissionTotal)}`}
              />
              <div 
                style={{ width: `${((statementMetrics.auxiliaryTotal + statementMetrics.otherOfferingsTotal) / statementMetrics.grandTotal) * 100}%` }}
                className="bg-purple-500 h-full transition-all" 
                title={`Auxiliary: ${formatKwacha(statementMetrics.auxiliaryTotal + statementMetrics.otherOfferingsTotal)}`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Tithe: <strong className="font-mono text-slate-900">{renderAmount(statementMetrics.titheTotal)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-900 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Local Budget: <strong className="font-mono text-slate-900">{renderAmount(statementMetrics.localBudgetTotal)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Building: <strong className="font-mono text-slate-900">{renderAmount(statementMetrics.buildingFundTotal)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Mission: <strong className="font-mono text-slate-900">{renderAmount(statementMetrics.worldMissionTotal)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Auxiliary: <strong className="font-mono text-slate-900">{renderAmount(statementMetrics.auxiliaryTotal + statementMetrics.otherOfferingsTotal)}</strong>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl text-xs text-center">
            No contributions recorded for {selectedMember?.name} between {startDate} and {endDate}.
          </div>
        )}
      </div>

      {/* Itemized Chronological Ledger Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-900" />
              Itemized Contribution Receipts ({memberEnvelopes.length})
            </h3>
            <p className="text-xs text-slate-500">
              Chronological log of verified receipts issued to {selectedMember?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">
              Showing {memberEnvelopes.length} entries in Zambian Kwacha (K)
            </span>
          </div>
        </div>

        {memberEnvelopes.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">
              No Records Found in Selected Range
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No envelope records exist for <strong>{selectedMember?.name}</strong> between {startDate} and {endDate}. 
              Try clicking "All Records" or selecting a broader date range.
            </p>
            <button
              type="button"
              onClick={() => handleSetPresetRange('all')}
              className="px-4 py-2 bg-blue-950 text-white rounded-xl text-xs font-bold"
            >
              Show All Available Records
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Receipt No.</th>
                  <th className="py-3 px-3">Envelope #</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3 text-right">Sacred Tithe</th>
                  <th className="py-3 px-3 text-right">Local Budget</th>
                  <th className="py-3 px-3 text-right">Building</th>
                  <th className="py-3 px-3 text-right">Other Funds</th>
                  <th className="py-3 px-3 text-right">Total ({CURRENCY_SYMBOL})</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberEnvelopes.map(env => {
                  const tithe = env.items
                    .filter(i => i.fundName.toLowerCase().includes('tithe'))
                    .reduce((s, i) => s + i.amount, 0);
                  const localBudget = env.items
                    .filter(i => i.category === 'local_church' && !i.fundName.toLowerCase().includes('building'))
                    .reduce((s, i) => s + i.amount, 0);
                  const building = env.items
                    .filter(i => i.fundName.toLowerCase().includes('building') || i.fundName.toLowerCase().includes('sanctuary'))
                    .reduce((s, i) => s + i.amount, 0);
                  const others = env.totalAmount - (tithe + localBudget + building);

                  return (
                    <tr key={env.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {env.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {env.receiptNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {env.envelopeNumber || 'Direct'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {env.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-900">
                        {tithe > 0 ? renderAmount(tithe) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-950">
                        {localBudget > 0 ? renderAmount(localBudget) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                        {building > 0 ? renderAmount(building) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {others > 0 ? renderAmount(others) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        {renderAmount(env.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onViewEnvelopeReceipt && onViewEnvelopeReceipt(env)}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-950 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-black text-slate-900 bg-slate-50">
                  <td colSpan={4} className="py-3.5 px-3 uppercase tracking-wider text-xs">
                    Period Totals ({memberEnvelopes.length} Contributions)
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-amber-900">
                    {renderAmount(statementMetrics.titheTotal)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-blue-950">
                    {renderAmount(statementMetrics.localBudgetTotal)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-emerald-800">
                    {renderAmount(statementMetrics.buildingFundTotal)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                    {renderAmount(statementMetrics.worldMissionTotal + statementMetrics.auxiliaryTotal + statementMetrics.otherOfferingsTotal)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm text-slate-950">
                    {renderAmount(statementMetrics.grandTotal)}
                  </td>
                  <td className="py-3.5 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* PRINT OFFICIAL STATEMENT MODAL */}
      {isPrintModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Actions Bar (Top) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10 print:hidden">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Official Confidential Giving Statement
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print Statement
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Statement Canvas */}
            <div className="p-8 sm:p-12 space-y-8 print:p-0 print:space-y-6 bg-white" id="printable-member-statement">
              
              {/* Church Letterhead */}
              <div className="text-center pb-6 border-b-2 border-slate-900 relative">
                <div className="flex justify-center mb-3">
                  <SDALogo className="w-20 h-14" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                  Seventh-day Adventist Church
                </h1>
                <p className="text-xs font-black uppercase tracking-widest text-slate-600 mt-0.5">
                  Lusaka Conference of Seventh-day Adventists
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {currentTreasurer.churchName || 'Woodlands SDA Church'} • Treasury & Financial Custodianship
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Plot 412 Independence Way, Woodlands, Lusaka, Zambia
                </p>

                {/* Confidentiality Watermark Tag */}
                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-900">
                  <Lock className="w-3 h-3 text-amber-700" />
                  Strictly Confidential • Personal Giving Statement
                </div>
              </div>

              {/* Statement Identification Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Statement Issued To:
                  </span>
                  <p className="text-base font-black text-slate-900">{selectedMember.name}</p>
                  <p className="text-slate-600 font-medium">Member Registry ID: {selectedMember.id}</p>
                  <p className="text-slate-500">{selectedMember.address || 'Woodlands, Lusaka, Zambia'}</p>
                  <p className="text-slate-500">Contact: {selectedMember.contact || 'Registered Member'}</p>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Statement Details:
                  </span>
                  <p className="font-mono font-black text-blue-950 text-sm">{statementVerificationNo}</p>
                  <p className="text-slate-600">
                    Period: <strong>{startDate}</strong> to <strong>{endDate}</strong>
                  </p>
                  <p className="text-slate-500">Currency: <strong>{CURRENCY_NAME} ({CURRENCY_CODE})</strong></p>
                  <p className="text-slate-400 text-[10px]">
                    Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Financial Summary Box */}
              <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
                <div className="bg-slate-900 text-white px-4 py-2 font-black text-xs uppercase tracking-wider flex justify-between">
                  <span>Summary of Contributions by Fund</span>
                  <span>Amount in Zambian Kwacha (K)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 flex justify-between bg-amber-50/50">
                    <span className="font-bold text-amber-950">1. Sacred Tithe (10% Sacred Trust - Conference)</span>
                    <span className="font-mono font-black text-amber-950">{formatKwacha(statementMetrics.titheTotal)}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-slate-700">2. Local Church Operating Budget (Combined Plan)</span>
                    <span className="font-mono font-bold text-slate-900">{formatKwacha(statementMetrics.localBudgetTotal)}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-slate-700">3. Sanctuary Expansion & Building Fund</span>
                    <span className="font-mono font-bold text-slate-900">{formatKwacha(statementMetrics.buildingFundTotal)}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-slate-700">4. World Mission & Sabbath School Offerings</span>
                    <span className="font-mono font-bold text-slate-900">{formatKwacha(statementMetrics.worldMissionTotal)}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-slate-700">5. Auxiliary & Departmental Ministries (AYM, Dorcas, Music)</span>
                    <span className="font-mono font-bold text-slate-900">{formatKwacha(statementMetrics.auxiliaryTotal)}</span>
                  </div>
                  {statementMetrics.otherOfferingsTotal > 0 && (
                    <div className="px-4 py-2.5 flex justify-between">
                      <span className="text-slate-700">6. Other Designated Offerings</span>
                      <span className="font-mono font-bold text-slate-900">{formatKwacha(statementMetrics.otherOfferingsTotal)}</span>
                    </div>
                  )}
                  <div className="px-4 py-3 flex justify-between bg-slate-100 font-black text-sm">
                    <span className="uppercase tracking-wider">Total Contributions in Period:</span>
                    <span className="font-mono text-slate-950">{formatKwacha(statementMetrics.grandTotal, { showCode: true })}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Sequential Verified Receipts Log
                </span>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="p-2 border-b">Date</th>
                      <th className="p-2 border-b">Receipt #</th>
                      <th className="p-2 border-b">Envelope</th>
                      <th className="p-2 border-b">Payment Method</th>
                      <th className="p-2 border-b text-right">Tithe (K)</th>
                      <th className="p-2 border-b text-right">Local Budget (K)</th>
                      <th className="p-2 border-b text-right">Total (K)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberEnvelopes.map(env => {
                      const t = env.items.filter(i => i.fundName.toLowerCase().includes('tithe')).reduce((s, i) => s + i.amount, 0);
                      const l = env.items.filter(i => i.category === 'local_church').reduce((s, i) => s + i.amount, 0);
                      return (
                        <tr key={env.id} className="font-mono">
                          <td className="p-2 font-sans">{env.date}</td>
                          <td className="p-2 font-bold text-blue-900">{env.receiptNumber}</td>
                          <td className="p-2 text-slate-500">{env.envelopeNumber || 'Direct'}</td>
                          <td className="p-2 font-sans capitalize text-[10px] text-slate-600">{env.paymentMethod.replace(/_/g, ' ')}</td>
                          <td className="p-2 text-right">{t > 0 ? t.toFixed(2) : '—'}</td>
                          <td className="p-2 text-right">{l > 0 ? l.toFixed(2) : '—'}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{env.totalAmount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Church Manual Section 7 Compliance & Legal Disclaimer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1">
                <p className="font-bold uppercase tracking-wider text-slate-800">
                  Confidentiality Mandate (Seventh-day Adventist Church Manual Section 7):
                </p>
                <p>
                  "The record of personal tithes and offerings of members is strictly confidential. 
                  Under no circumstances should the treasurer allow any unauthorized person to examine tithe 
                  and offering records. The list of givers and amounts must never be made public or disclosed 
                  to church boards or nominating committees."
                </p>
                <p className="text-slate-400">
                  This document serves as an official receipt of contributions for personal stewardship records 
                  and income tax exemption purposes in the Republic of Zambia.
                </p>
              </div>

              {/* Signature & Seal Footer */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs border-t border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-8">
                    Authorized Treasury Custodian:
                  </span>
                  <div className="border-t border-slate-900 pt-1">
                    <p className="font-black text-slate-900">{currentTreasurer.name}</p>
                    <p className="text-[10px] text-slate-500">Local Church Treasurer, {currentTreasurer.churchName || 'Woodlands SDA Church'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-8">
                    Official Church Seal & Audit Archive:
                  </span>
                  <div className="border-t border-slate-900 pt-1 inline-block text-right">
                    <p className="font-mono font-bold text-slate-900">VERIFIED OFFICIAL DOCUMENT</p>
                    <p className="text-[10px] text-slate-500 font-mono">{statementVerificationNo}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MemberStatementGeneratorView;
