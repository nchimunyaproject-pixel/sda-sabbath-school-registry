import React, { useState } from 'react';
import { ChurchMember, FamilyUnit, TransferRequest, User } from '../../types';
import { 
  Building2, Download, Printer, FileSpreadsheet, Users, 
  CheckCircle2, ArrowRightLeft, ShieldAlert, HeartHandshake, Eye, Search, AlertTriangle, FileText
} from 'lucide-react';
import SDALogo from '../SDALogo';

interface ConferenceSyncViewProps {
  members: ChurchMember[];
  familyUnits: FamilyUnit[];
  transfers: TransferRequest[];
  currentChurchUser: User;
}

export const ConferenceSyncView: React.FC<ConferenceSyncViewProps> = ({
  members,
  familyUnits,
  transfers,
  currentChurchUser
}) => {
  const [activeTab, setActiveTab] = useState<'statistical_report' | 'directory_export' | 'eadventist_csv'>('statistical_report');
  const [reportQuarter, setReportQuarter] = useState('Q3 2026');
  const [reportYear, setReportYear] = useState('2026');
  const [directorySearch, setDirectorySearch] = useState('');

  // Statistical calculations
  const totalListed = members.length;
  const activeMembers = members.filter(m => m.status === 'active' && m.memberType === 'baptized').length;
  const missingMembers = members.filter(m => m.status === 'missing').length;
  const inTransfer = members.filter(m => m.status === 'transferring').length;
  const censured = members.filter(m => m.status === 'censured').length;
  const disfellowshipped = members.filter(m => m.status === 'disfellowshipped').length;
  const deceased = members.filter(m => m.status === 'deceased').length;
  const unbaptizedChildren = members.filter(m => m.memberType === 'unbaptized_child').length;
  const nonMemberSpouses = members.filter(m => m.memberType === 'non_member_spouse').length;

  // Additions and Reductions in current quarter
  const incomingApproved = transfers.filter(t => t.status === 'approved' && (t.transferType === 'incoming' || t.toChurchId === currentChurchUser.id)).length;
  const outgoingApproved = transfers.filter(t => t.status === 'approved' && (t.transferType === 'outgoing' || t.fromChurchId === currentChurchUser.id)).length;
  
  // Hypothetical baseline
  const beginningMembership = activeMembers + inTransfer + missingMembers - incomingApproved + outgoingApproved;
  const totalAdditions = incomingApproved;
  const totalReductions = outgoingApproved + deceased + disfellowshipped;
  const netEndingMembership = beginningMembership + totalAdditions - totalReductions;

  // eAdventist CSV Generation
  const handleExportEAdventistCSV = () => {
    const headers = [
      'MemberID',
      'PrimarySurname',
      'SecondarySurname',
      'GivenNames',
      'Gender',
      'DateOfBirth',
      'BaptismDate',
      'MembershipStatus',
      'MemberType',
      'HouseholdName',
      'RelationshipToHead',
      'ContactPhone',
      'Email',
      'Address',
      'ChurchCode'
    ];

    const rows = members.map(m => {
      const fam = familyUnits.find(f => f.id === m.familyUnitId);
      return [
        m.id,
        `"${m.primarySurname || m.name.split(' ').slice(1).join(' ') || ''}"`,
        `"${m.secondarySurname || ''}"`,
        `"${m.givenNames || m.name.split(' ')[0] || ''}"`,
        m.gender || 'unspecified',
        m.dob || '',
        m.baptismDate || '',
        m.status,
        m.memberType || 'baptized',
        `"${fam?.familyName || ''}"`,
        m.relationshipToHead || '',
        `"${m.contact || ''}"`,
        `"${m.email || ''}"`,
        `"${(m.address || fam?.address || '').replace(/"/g, '""')}"`,
        `"${currentChurchUser.id}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eAdventist_Sync_${reportYear}_${reportQuarter.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredFamilies = familyUnits.filter(f => {
    const matchName = f.familyName.toLowerCase().includes(directorySearch.toLowerCase());
    const matchAddress = f.address.toLowerCase().includes(directorySearch.toLowerCase());
    const famMembers = members.filter(m => m.familyUnitId === f.id);
    const matchMember = famMembers.some(m => m.name.toLowerCase().includes(directorySearch.toLowerCase()));
    return matchName || matchAddress || matchMember;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-900" /> Conference Reporting & Directory Sync
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Official Quarterly Conference Statistical Report, eAdventist CSV Export & Household Fellowship Directory
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('statistical_report')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'statistical_report' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Statistical Report
          </button>
          <button
            onClick={() => setActiveTab('eadventist_csv')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'eadventist_csv' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> eAdventist CSV
          </button>
          <button
            onClick={() => setActiveTab('directory_export')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'directory_export' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Church Directory
          </button>
        </div>
      </div>

      {/* Tab 1: Official Statistical Report to the Conference */}
      {activeTab === 'statistical_report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <select
                value={reportQuarter}
                onChange={(e) => setReportQuarter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none"
              >
                <option value="Q1 2026">Q1 2026 (Jan - Mar)</option>
                <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
                <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
                <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
              </select>

              <span className="text-xs font-bold text-slate-400">
                Conference: <strong>Midlands Conference of Seventh-day Adventists</strong>
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-md"
            >
              <Printer className="w-4 h-4" /> Print Official Report
            </button>
          </div>

          {/* Printable Official Conference Form */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-14 border border-slate-200 shadow-xl max-w-4xl mx-auto printable-doc font-serif text-slate-900 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 pb-6 border-b-2 border-slate-900 font-sans">
              <div className="flex justify-center mb-2">
                <SDALogo className="w-32 h-16" />
              </div>
              <h1 className="text-xl font-black tracking-wider uppercase">
                General Conference of Seventh-day Adventists
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                Quarterly Church Clerk Statistical Report to Local Conference
              </p>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                <span>Church: <strong>{currentChurchUser.churchName || 'Woodlands SDA Church'}</strong></span>
                <span>Reporting Period: <strong>{reportQuarter}</strong></span>
                <span>Clerk: <strong>{currentChurchUser.name}</strong></span>
              </div>
            </div>

            {/* Statistical Table */}
            <div className="space-y-6 font-sans">
              {/* Section 1: Membership Reconciliation */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-blue-950 pb-2 border-b border-slate-300">
                  1. Membership Reconciliation (Official Church Roll)
                </h3>
                <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center font-bold">
                    <span>Beginning Membership Roll:</span>
                    <span className="text-base font-black text-slate-900">{beginningMembership}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl flex justify-between items-center font-bold">
                    <span>Total Additions in Period:</span>
                    <span className="text-base font-black">+{totalAdditions}</span>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-900 rounded-xl flex justify-between items-center font-bold">
                    <span>Total Reductions in Period:</span>
                    <span className="text-base font-black">-{totalReductions}</span>
                  </div>
                  <div className="p-3 bg-blue-900 text-white rounded-xl flex justify-between items-center font-bold shadow-md">
                    <span>Net Ending Church Roll:</span>
                    <span className="text-base font-black">{netEndingMembership}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Breakdown of Additions & Reductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Additions */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="font-black text-emerald-900 uppercase text-[10px] tracking-wider">
                    Additions Breakdown
                  </p>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Baptisms:</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Profession of Faith:</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Received by Letter (Transfers In):</span>
                    <span className="font-bold">{incomingApproved}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-emerald-800">
                    <span>Total Additions:</span>
                    <span>{totalAdditions}</span>
                  </div>
                </div>

                {/* Reductions */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="font-black text-rose-900 uppercase text-[10px] tracking-wider">
                    Reductions Breakdown
                  </p>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Granted Letter (Transfers Out):</span>
                    <span className="font-bold">{outgoingApproved}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Deceased:</span>
                    <span className="font-bold">{deceased}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Disfellowshipped (By Business Vote):</span>
                    <span className="font-bold">{disfellowshipped}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-rose-800">
                    <span>Total Reductions:</span>
                    <span>{totalReductions}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Roll Status & Pastoral Demographics */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider">
                  Roll Categorization & Pastoral Care Summary
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Active Resident</p>
                    <p className="text-xl font-black text-emerald-700">{activeMembers}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Missing / Inactive</p>
                    <p className="text-xl font-black text-amber-700">{missingMembers}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Under Censure</p>
                    <p className="text-xl font-black text-rose-700">{censured}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Unbaptized Children</p>
                    <p className="text-xl font-black text-sky-700">{unbaptizedChildren}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certification Signatures */}
            <div className="grid grid-cols-2 gap-12 pt-10 border-t-2 border-slate-900 font-sans text-xs">
              <div>
                <p className="font-bold text-slate-800 uppercase">{currentChurchUser.name}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5">Church Clerk Signature</p>
                <p className="text-[9px] text-slate-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 uppercase">Pastor H. Chisenga</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5">District Pastor Signature</p>
                <p className="text-[9px] text-slate-400 mt-1">Confirmed for Conference Secretariat</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: eAdventist CSV Export */}
      {activeTab === 'eadventist_csv' && (
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-slate-100 shadow-sm space-y-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center font-black">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Standardized eAdventist Data Sync</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                Official General Conference / NAD Schema Export
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-600">
            <p className="font-black text-slate-900 text-sm">Automated Fields Included in eAdventist Export:</p>
            <ul className="list-disc pl-5 space-y-1 font-medium">
              <li>Individual Full Names with separated given names, primary surname, and secondary surname.</li>
              <li>Official Member Status (Active, In Transition, Missing, Censured, Deceased).</li>
              <li>Member Category (Baptized, Unbaptized Child, Non-Member Spouse).</li>
              <li>Family Unit / Household binding with Designated Relationship to Head.</li>
              <li>Contact details, phone, email, residential address, and unique church identification code.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-xs font-bold text-slate-500">
              Ready to export: <strong>{members.length} member records</strong> across <strong>{familyUnits.length} family units</strong>.
            </span>

            <button
              onClick={handleExportEAdventistCSV}
              className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Download eAdventist CSV
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Church Directory Export */}
      {activeTab === 'directory_export' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search households..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none"
              />
            </div>

            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-md"
            >
              <Printer className="w-4 h-4" /> Print Fellowship Directory
            </button>
          </div>

          {/* Directory Printable View */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-14 border border-slate-200 shadow-xl max-w-4xl mx-auto printable-doc text-slate-900 space-y-8 font-sans">
            {/* Disclaimer & Header */}
            <div className="text-center space-y-2 pb-6 border-b-2 border-slate-900">
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {currentChurchUser.churchName || 'Woodlands Seventh-day Adventist Church'}
              </h1>
              <p className="text-xs uppercase font-bold tracking-[0.2em] text-slate-500">
                Fellowship Church Directory • {reportYear}
              </p>

              {/* Required Prominent Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-center mt-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                  ⚠️ CONFIDENTIAL CHURCH DIRECTORY — FOR FELLOWSHIP USE ONLY
                </p>
                <p className="text-[9px] text-amber-800 mt-0.5">
                  This document is compiled strictly for church fellowship, pastoral care, and communication between brethren.
                  It does NOT constitute an official membership list or church roll. Commercial or unauthorized distribution is strictly prohibited.
                </p>
              </div>
            </div>

            {/* Households List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFamilies.map(fam => {
                const famMembers = members.filter(m => m.familyUnitId === fam.id);
                return (
                  <div key={fam.id} className="p-5 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/50 break-inside-avoid">
                    <div>
                      <h4 className="font-black text-base text-slate-900">{fam.familyName}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{fam.address}</p>
                      <p className="text-xs font-bold text-blue-900 mt-0.5">Primary Phone: {fam.contactPhone}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Members of Household:</p>
                      {famMembers.map(m => (
                        <div key={m.id} className="flex items-center justify-between text-slate-700">
                          <span className="font-bold">
                            {m.name} {m.relationshipToHead ? `(${m.relationshipToHead})` : ''}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {m.memberType?.replace('_', ' ') || 'Member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
