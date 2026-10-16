import React from 'react';
import { MinisterialCredential } from '../types';
import { X, Printer, ShieldCheck, Award, Calendar, UserCheck } from 'lucide-react';
import SDALogo from './SDALogo';

interface MinisterialCredentialModalProps {
  credential: MinisterialCredential | null;
  isOpen: boolean;
  onClose: () => void;
  conferenceName?: string;
  presidentName?: string;
}

export const MinisterialCredentialModal: React.FC<MinisterialCredentialModalProps> = ({
  credential,
  isOpen,
  onClose,
  conferenceName = 'Lusaka Conference',
  presidentName = 'Pastor Dr. Harrington Simpasa'
}) => {
  if (!isOpen || !credential) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCredentialTitle = (type: string) => {
    switch (type) {
      case 'ORDAINED_MINISTER': return 'Ministerial Credential (Ordained)';
      case 'COMMISSIONED_MINISTER': return 'Commissioned Minister Credential';
      case 'LICENSED_PASTOR': return 'Ministerial License';
      case 'BIBLE_INSTRUCTOR': return 'Bible Instructor Credential';
      case 'COMMISSIONED_HEALING_MINISTER': return 'Commissioned Ministry of Healing Credential';
      default: return 'Official Conference Credential';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-200">
              Official Conference Ministerial Certificate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Parchment Styled) */}
        <div className="p-8 sm:p-12 bg-amber-50/40 relative">
          
          {/* Certificate Ornate Border */}
          <div className="border-4 border-double border-amber-900/40 p-6 sm:p-10 rounded-2xl bg-white relative shadow-sm">
            
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <SDALogo className="w-96 h-96" />
            </div>

            {/* Header */}
            <div className="text-center space-y-2 relative z-10">
              <div className="flex justify-center mb-2">
                <SDALogo className="w-28 h-14" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-900/80">
                General Conference of Seventh-day Adventists
              </h4>
              <h3 className="text-sm font-bold text-slate-700 tracking-wider uppercase">
                Southern Africa-Indian Ocean Division • {conferenceName}
              </h3>
              <div className="w-24 h-0.5 bg-amber-600 mx-auto my-3" />
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-slate-900 uppercase">
                {getCredentialTitle(credential.type)}
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                Registry ID: {credential.credentialNumber}
              </p>
            </div>

            {/* Text Body */}
            <div className="mt-8 text-center space-y-4 relative z-10 max-w-xl mx-auto">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                This is to officially certify that
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-950 border-b border-slate-300 pb-2 inline-block px-8">
                {credential.ministerName}
              </h2>
              <p className="text-xs leading-relaxed text-slate-700 font-serif italic px-4">
                Has been duly examined, approved, and granted this official ministerial credential by vote of the Executive Committee of the {conferenceName}, authorizing them to perform all the duties and spiritual ministries pertaining to this sacred calling according to the Seventh-day Adventist Church Manual.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 text-left max-w-md mx-auto text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Territory</span>
                  <span className="font-bold text-slate-800">{credential.districtName || 'Conference-at-Large'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Station Congregation</span>
                  <span className="font-bold text-slate-800">{credential.assignedChurchName || 'Circuit Pastor'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Issued</span>
                  <span className="font-bold text-slate-800">{credential.issueDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Valid Until</span>
                  <span className="font-bold text-slate-800">{credential.expiryDate}</span>
                </div>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 items-end gap-4 text-center relative z-10">
              <div>
                <div className="font-serif italic text-sm text-slate-800 mb-1">
                  {presidentName}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">President</span>
                  <span className="text-[9px] text-slate-400">{conferenceName}</span>
                </div>
              </div>

              {/* Official Seal Emblem */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-600/60 bg-amber-50 flex items-center justify-center p-2 text-center shadow-inner">
                  <div className="border border-amber-600/40 w-full h-full rounded-full flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-tighter text-amber-900">Official</span>
                    <span className="text-[6px] font-bold text-amber-700">SEAL</span>
                  </div>
                </div>
                <span className="text-[8px] uppercase tracking-widest text-amber-800 font-bold mt-1">
                  Exec. Voted: {credential.votedByExecutiveCommitteeDate}
                </span>
              </div>

              <div>
                <div className="font-serif italic text-sm text-slate-800 mb-1">
                  Pastor M. K. Chinyama
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">Executive Secretary</span>
                  <span className="text-[9px] text-slate-400">{conferenceName}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Verified Credential in Conference Active Registry</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default MinisterialCredentialModal;
