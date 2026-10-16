import React, { useState, useRef } from 'react';
import { 
  FileText, Printer, Download, CheckCircle2, X, Award, 
  Send, Landmark, ShieldCheck, Calendar, User as UserIcon, Building2
} from 'lucide-react';
import { ChurchMember, ChurchStation, TransferRequest, User } from '../types';
import SDALogo from './SDALogo';

export type DocumentType = 'baptism_cert' | 'transfer_letter' | 'tithe_statement' | 'remittance_voucher';

interface OfficialDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchStation: ChurchStation;
  selectedMember?: ChurchMember | null;
  churchMembers: ChurchMember[];
  transferRequests?: TransferRequest[];
  currentTreasurer?: User;
}

export const OfficialDocumentsModal: React.FC<OfficialDocumentsModalProps> = ({
  isOpen,
  onClose,
  churchStation,
  selectedMember,
  churchMembers,
  transferRequests = [],
  currentTreasurer
}) => {
  const [docType, setDocType] = useState<DocumentType>('baptism_cert');
  const [activeMemberId, setActiveMemberId] = useState<string>(
    selectedMember?.id || churchMembers[0]?.id || ''
  );
  const [officiatingPastor, setOfficiatingPastor] = useState('Pastor Kelvin Mwale');
  const [selectedTransferId, setSelectedTransferId] = useState<string>(
    transferRequests[0]?.id || ''
  );
  const [taxYear, setTaxYear] = useState('2026');

  const activeMember = churchMembers.find(m => m.id === activeMemberId) || selectedMember || churchMembers[0];
  const activeTransfer = transferRequests.find(t => t.id === selectedTransferId) || transferRequests[0];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* MODAL HEADER - Screen Only */}
        <div className="p-4 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                Official SDA Document & Certificate Generator
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                Church Manual 2025 compliant • Printable & PDF ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOCUMENT TYPE SELECTOR & CONTROLS - Screen Only */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 print:hidden shrink-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDocType('baptism_cert')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                docType === 'baptism_cert'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" /> Certificate of Baptism
            </button>
            <button
              onClick={() => setDocType('transfer_letter')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                docType === 'transfer_letter'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-blue-400" /> Letter of Transfer (2-Readings)
            </button>
            <button
              onClick={() => setDocType('tithe_statement')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                docType === 'tithe_statement'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-400" /> Member Tithe & Offering Statement
            </button>
            <button
              onClick={() => setDocType('remittance_voucher')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                docType === 'remittance_voucher'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Conference Remittance Voucher
            </button>
          </div>

          {/* Sub-controls based on document */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            {(docType === 'baptism_cert' || docType === 'tithe_statement') && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Select Member:</span>
                <select
                  value={activeMember?.id || ''}
                  onChange={(e) => setActiveMemberId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-900 outline-none"
                >
                  {churchMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.memberNumber || 'Roll No.'})</option>
                  ))}
                </select>
              </div>
            )}

            {docType === 'baptism_cert' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Officiating Minister:</span>
                <input
                  type="text"
                  value={officiatingPastor}
                  onChange={(e) => setOfficiatingPastor(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-900 outline-none w-48"
                  placeholder="Pastor's Name"
                />
              </div>
            )}

            {docType === 'transfer_letter' && transferRequests.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Select Transfer Request:</span>
                <select
                  value={activeTransfer?.id || ''}
                  onChange={(e) => setSelectedTransferId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-900 outline-none"
                >
                  {transferRequests.map(tr => (
                    <option key={tr.id} value={tr.id}>
                      {tr.studentName} → {tr.toChurchName} ({tr.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {docType === 'tithe_statement' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Calendar Year:</span>
                <input
                  type="number"
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-900 outline-none w-24"
                />
              </div>
            )}
          </div>
        </div>

        {/* DOCUMENT PREVIEW CONTAINER - PRINTABLE */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-slate-200/50 flex-grow flex justify-center items-start">
          
          {/* ==================================================== */}
          {/* 1. CERTIFICATE OF BAPTISM & PROFESSION OF FAITH       */}
          {/* ==================================================== */}
          {docType === 'baptism_cert' && (
            <div className="bg-white w-full max-w-3xl p-8 sm:p-12 rounded-2xl shadow-xl border-8 border-double border-amber-600 relative overflow-hidden text-slate-900 print:shadow-none print:border-8 print:p-8">
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <SDALogo className="w-96 h-96" />
              </div>

              {/* Decorative Corner Ornaments */}
              <div className="text-center space-y-4 relative z-10">
                <div className="flex justify-center mb-2">
                  <SDALogo className="w-24 h-12 text-blue-950" />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-800">
                    SEVENTH-DAY ADVENTIST CHURCH
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {churchStation.conference} • {churchStation.name}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-serif font-black text-blue-950 tracking-wide pt-2">
                    Certificate of Baptism
                  </h1>
                  <p className="text-xs italic text-slate-600 font-serif">
                    “Buried with Him in baptism, wherein also ye are risen with Him through the faith of the operation of God.” — Colossians 2:12
                  </p>
                </div>

                <div className="py-6 space-y-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">This certifies that</p>
                  <h2 className="text-2xl sm:text-3xl font-black font-serif text-blue-950 border-b-2 border-slate-300 pb-2 inline-block px-8">
                    {activeMember?.name || 'Brother / Sister in Christ'}
                  </h2>
                  <p className="text-xs leading-relaxed max-w-xl mx-auto text-slate-700">
                    Having confessed repentance toward God and faith in our Lord Jesus Christ, was buried with Him by baptism in the name of the Father, and of the Son, and of the Holy Ghost, and was received into the fellowship of the Seventh-day Adventist Church.
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
                  <div className="text-left space-y-1 border-t border-slate-300 pt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Baptism</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {activeMember?.baptismDate || '12th September 2026'}
                    </span>
                  </div>
                  <div className="text-left space-y-1 border-t border-slate-300 pt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Place of Baptism</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {churchStation.name}, {churchStation.city || 'Lusaka'}
                    </span>
                  </div>
                </div>

                {/* Signature Lines */}
                <div className="grid grid-cols-2 gap-10 pt-12 text-xs">
                  <div className="text-center space-y-1">
                    <div className="border-b-2 border-slate-400 h-8 flex items-end justify-center pb-1 font-serif italic text-sm text-blue-950 font-bold">
                      {officiatingPastor}
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 block">
                      Officiating Ordained Minister
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="border-b-2 border-slate-400 h-8 flex items-end justify-center pb-1 font-serif italic text-sm text-blue-950 font-bold">
                      {churchStation.elderName || 'Presiding Elder'}
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 block">
                      Church Clerk / Presiding Elder
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Certificate ID: CERT-BAP-{activeMember?.id?.toUpperCase() || '2026-001'}</span>
                  <span>Registered in Local Roll & ACMS Archive</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. OFFICIAL SDA 3-PART LETTER OF TRANSFER            */}
          {/* ==================================================== */}
          {docType === 'transfer_letter' && (
            <div className="bg-white w-full max-w-3xl p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-300 space-y-6 text-slate-900 print:shadow-none print:border print:p-6 text-xs">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-900">
                    SDA Church Manual Transfer Form • 2025 Edition
                  </span>
                  <h2 className="text-lg font-black uppercase text-slate-900">
                    Official Letter of Church Membership Transfer
                  </h2>
                </div>
                <div className="bg-white p-1 rounded-lg">
                  <SDALogo className="w-16 h-8 text-blue-950" />
                </div>
              </div>

              {/* PART 1 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-black text-blue-950 uppercase text-[10px] tracking-wider block">
                  Part 1 • Application by Receiving Church
                </span>
                <p className="leading-relaxed">
                  To the Church Clerk of: <strong>{activeTransfer?.fromChurchName || churchStation.name}</strong><br />
                  Dear Fellow Clerk: <strong>{activeTransfer?.studentName || activeMember?.name}</strong> has applied for membership in the <strong>{activeTransfer?.toChurchName || 'Riverside SDA Church'}</strong> by letter from your church. Please present this request to your Church Board and congregation.
                </p>
                <div className="flex justify-between pt-2 text-[10px] text-slate-500 font-mono">
                  <span>Application Date: {activeTransfer?.requestDate || new Date().toISOString().split('T')[0]}</span>
                  <span>Clerk Signature: _________________________</span>
                </div>
              </div>

              {/* PART 2 */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                <span className="font-black text-amber-950 uppercase text-[10px] tracking-wider block">
                  Part 2 • Certificate of Grant by Sending Church (Church Manual Protocol)
                </span>
                <p className="leading-relaxed">
                  This certifies that <strong>{activeTransfer?.studentName || activeMember?.name}</strong> is a member in regular standing of <strong>{activeTransfer?.fromChurchName || churchStation.name}</strong>, and at their request was recommended for transfer to <strong>{activeTransfer?.toChurchName || 'Riverside SDA Church'}</strong>.
                </p>
                
                <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-amber-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">First Reading to Congregation:</span>
                    <span className="font-mono font-bold text-slate-900">{activeTransfer?.firstReadingDate || 'Pending reading'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">Second Reading & Final Vote:</span>
                    <span className="font-mono font-bold text-slate-900">{activeTransfer?.secondReadingDate || 'Pending final vote'}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2 text-[10px] text-slate-600">
                  <span>Voted Action No: <strong>BRD-2026-TR-{activeTransfer?.id?.slice(-4) || '042'}</strong></span>
                  <span>Sending Church Clerk Seal: [ SEAL ]</span>
                </div>
              </div>

              {/* PART 3 */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-black text-emerald-950 uppercase text-[10px] tracking-wider block">
                  Part 3 • Return Coupon (To be returned to Sending Church)
                </span>
                <p className="leading-relaxed">
                  This is to certify that <strong>{activeTransfer?.studentName || activeMember?.name}</strong> was voted into the fellowship of <strong>{activeTransfer?.toChurchName || 'Riverside SDA Church'}</strong> on second reading on: ____________ and has been duly enrolled on our Church Register.
                </p>
                <div className="flex justify-between pt-2 text-[10px] text-slate-500">
                  <span>Receiving Clerk: ________________________</span>
                  <span>Date: ____________</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 3. ANNUAL MEMBER TITHE & GIVING STATEMENT            */}
          {/* ==================================================== */}
          {docType === 'tithe_statement' && (
            <div className="bg-white w-full max-w-3xl p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-300 space-y-6 text-slate-900 print:shadow-none print:border print:p-6 text-xs">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-base font-black uppercase text-slate-900">
                    Annual Sacred Trust & Contribution Statement
                  </h2>
                  <p className="text-slate-500 font-bold text-[11px]">
                    {churchStation.name} • {churchStation.conference}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Tax / Contribution Period: January 1, {taxYear} – December 31, {taxYear}
                  </p>
                </div>
                <div className="text-right">
                  <SDALogo className="w-16 h-8 text-blue-950 ml-auto" />
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    Receipt Ref: STMT-{taxYear}-{activeMember?.id?.slice(-4) || '001'}
                  </span>
                </div>
              </div>

              {/* Contributor Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Member Name</span>
                  <span className="font-bold text-sm text-slate-900">{activeMember?.name}</span>
                  <span className="text-slate-500 block text-[11px]">Roll ID: {activeMember?.memberNumber || 'MEM-2026-088'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Contact & Address</span>
                  <span className="text-slate-700 block">{activeMember?.contact || '+260 977 100 200'}</span>
                  <span className="text-slate-500 block">{activeMember?.address || churchStation.city || 'Lusaka, Zambia'}</span>
                </div>
              </div>

              {/* Giving Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[10px] uppercase font-black text-slate-500">
                    <th className="py-2">Category Fund</th>
                    <th className="py-2">Designation Type</th>
                    <th className="py-2 text-right">Total Contributed ({taxYear})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Tithe (10%)</td>
                    <td className="py-2.5 text-slate-500">Conference Sacred Trust Fund</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">ZK 14,400.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Combined Church Budget</td>
                    <td className="py-2.5 text-slate-500">Local Church Operating & Evangelism</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">ZK 3,600.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Sabbath School Mission Offering</td>
                    <td className="py-2.5 text-slate-500">General Conference World Mission</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">ZK 1,200.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Camp Meeting Offering</td>
                    <td className="py-2.5 text-slate-500">Annual Camp Meeting Special Fund</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">ZK 800.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-black text-sm">
                    <td colSpan={2} className="py-3 uppercase text-blue-950">Total Certified Sacred Funds:</td>
                    <td className="py-3 text-right font-mono text-emerald-700">ZK 20,000.00</td>
                  </tr>
                </tfoot>
              </table>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700">Church Treasury Certificate:</p>
                  <p className="text-[10px]">Certified accurate as recorded in {churchStation.name} Treasury books.</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-400 w-48 h-6 flex items-end justify-center pb-0.5 font-serif italic text-blue-950">
                    {currentTreasurer?.name || 'Elder Joseph Banda'}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Church Treasurer Signature</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 4. CONFERENCE SACRED TRUST REMITTANCE VOUCHER        */}
          {/* ==================================================== */}
          {docType === 'remittance_voucher' && (
            <div className="bg-white w-full max-w-3xl p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-300 space-y-6 text-slate-900 print:shadow-none print:border print:p-6 text-xs">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 block">
                    Financial Form TF-101 • SDA Treasury Standards
                  </span>
                  <h2 className="text-base font-black uppercase text-slate-900">
                    Conference Trust Funds Remittance Voucher
                  </h2>
                  <p className="text-slate-500 font-bold text-[11px]">
                    Remitted by: {churchStation.name} → {churchStation.conference}
                  </p>
                </div>
                <div className="text-right">
                  <SDALogo className="w-16 h-8 text-blue-950 ml-auto" />
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    Voucher No: REM-2026-Q3-09
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Remittance Month</span>
                  <span className="font-bold text-slate-900">September 2026</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Bank Deposit Ref</span>
                  <span className="font-mono font-bold text-slate-900">STAN-TX-998822</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Conference Bank</span>
                  <span className="font-bold text-slate-900">ZANACO Trust A/C</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[10px] uppercase font-black text-slate-500">
                    <th className="py-2">Line Item</th>
                    <th className="py-2">GC Fund Code</th>
                    <th className="py-2 text-right">Amount (ZK)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Conference Tithe (100% Remitted)</td>
                    <td className="py-2 font-mono text-slate-400">TF-01</td>
                    <td className="py-2 text-right font-mono font-bold">58,400.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Sabbath School Mission Offering (100%)</td>
                    <td className="py-2 font-mono text-slate-400">TF-02</td>
                    <td className="py-2 text-right font-mono font-bold">12,650.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Thirteenth Sabbath Special Offering</td>
                    <td className="py-2 font-mono text-slate-400">TF-03</td>
                    <td className="py-2 text-right font-mono font-bold">8,200.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Camp Meeting Trust Offering</td>
                    <td className="py-2 font-mono text-slate-400">TF-04</td>
                    <td className="py-2 text-right font-mono font-bold">5,950.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-black text-sm">
                    <td colSpan={2} className="py-3 uppercase text-blue-950">Total Conference Sacred Trust:</td>
                    <td className="py-3 text-right font-mono text-emerald-700">ZK 85,200.00</td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t text-xs">
                <div className="space-y-1">
                  <div className="border-b border-slate-400 h-6 flex items-end justify-center pb-0.5 font-serif italic text-blue-950">
                    {currentTreasurer?.name || 'Elder Joseph Banda'}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block text-center">Local Church Treasurer</span>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-slate-400 h-6 flex items-end justify-center pb-0.5 font-serif italic text-blue-950">
                    {churchStation.elderName || 'Elder M. S. Banda'}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block text-center">First Elder (Internal Auditor)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden shrink-0">
          <span>Tip: Press <strong>Ctrl + P</strong> (or <strong>Cmd + P</strong>) to print or export directly as a PDF document.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl uppercase tracking-wider text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default OfficialDocumentsModal;
