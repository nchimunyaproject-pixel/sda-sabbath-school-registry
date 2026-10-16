import React, { useState } from 'react';
import { ChurchMember, User } from '../../types';
import { 
  FileText, Printer, Award, HeartHandshake, BookOpen, 
  Send, UserCheck, Shield, Sparkles, Download, CheckCircle2 
} from 'lucide-react';
import SDALogo from '../SDALogo';

interface DocumentGeneratorViewProps {
  members: ChurchMember[];
  currentChurchUser: User;
  preselectedMember?: ChurchMember | null;
}

type DocumentType = 
  | 'sabbath_accommodation'
  | 'recommendation_good_standing'
  | 'welcome_letter'
  | 'outreach_letter'
  | 'baptism_certificate'
  | 'obituary_memorial';

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({
  members,
  currentChurchUser,
  preselectedMember
}) => {
  const [docType, setDocType] = useState<DocumentType>(
    preselectedMember?.status === 'missing' ? 'outreach_letter' : 'sabbath_accommodation'
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(preselectedMember?.id || (members[0]?.id || ''));
  
  // Custom fields
  const [recipientName, setRecipientName] = useState('The Human Resources Director / Academic Dean');
  const [recipientOrganization, setRecipientOrganization] = useState('Lusaka University / Corporate Institution');
  const [customNotes, setCustomNotes] = useState('');
  const [officiatingPastor, setOfficiatingPastor] = useState('Pastor H. Chisenga');
  const [dateOfPassing, setDateOfPassing] = useState(new Date().toISOString().split('T')[0]);
  const [burialPlace, setBurialPlace] = useState('Leopards Hill Memorial Park, Lusaka');
  const [todayDate, setTodayDate] = useState(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  );

  const selectedMember = members.find(m => m.id === selectedMemberId) || preselectedMember || members[0];
  const churchName = currentChurchUser.churchName || 'Woodlands Seventh-day Adventist Church';
  const clerkName = currentChurchUser.name || 'Sister Chanda';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-900" /> Official Document & Certificate Generator
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            One-Click Printable SDA Secretariat Letters, Sabbath Accommodations & Official Certificates
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-3.5 bg-blue-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/15 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" /> Print / Export PDF
        </button>
      </div>

      {/* Control Panel (Member & Template Selector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Document Templates List */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
            Select Official Document Template
          </p>

          <button
            onClick={() => setDocType('sabbath_accommodation')}
            className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center gap-3 ${
              docType === 'sabbath_accommodation' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>Sabbath Accommodation Letter</p>
              <p className="text-[9px] opacity-75 lowercase font-medium">Work / Exam Friday sunset to Sabbath</p>
            </div>
          </button>

          <button
            onClick={() => setDocType('recommendation_good_standing')}
            className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center gap-3 ${
              docType === 'recommendation_good_standing' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>Letter of Good Standing</p>
              <p className="text-[9px] opacity-75 lowercase font-medium">Fellowship & travel recommendation</p>
            </div>
          </button>

          <button
            onClick={() => setDocType('welcome_letter')}
            className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center gap-3 ${
              docType === 'welcome_letter' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>New Member Welcome Letter</p>
              <p className="text-[9px] opacity-75 lowercase font-medium">For newly baptized or transferred</p>
            </div>
          </button>

          <button
            onClick={() => setDocType('outreach_letter')}
            className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center gap-3 ${
              docType === 'outreach_letter' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Send className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>Pastoral & Clerk Outreach Letter</p>
              <p className="text-[9px] opacity-75 lowercase font-medium">For missing or absent members</p>
            </div>
          </button>

          <button
            onClick={() => setDocType('baptism_certificate')}
            className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center gap-3 ${
              docType === 'baptism_certificate' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>Baptism Certificate</p>
              <p className="text-[9px] opacity-75 lowercase font-medium">Presentation certificate of baptism</p>
            </div>
          </button>

          <button
            onClick={() => setDocType('obituary_memorial')}
            className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center gap-3 ${
              docType === 'obituary_memorial' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>Memorial / Obituary Record</p>
              <p className="text-[9px] opacity-75 lowercase font-medium">Archival historical biographical record</p>
            </div>
          </button>
        </div>

        {/* Dynamic Parameter Settings */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Document Customization Parameters
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500">Select Church Member *</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500">Officiating Pastor / Minister</label>
              <input
                type="text"
                value={officiatingPastor}
                onChange={(e) => setOfficiatingPastor(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
              />
            </div>
          </div>

          {(docType === 'sabbath_accommodation' || docType === 'recommendation_good_standing') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Addressed Recipient / Title</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Dean of Examinations / HR Director"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Institution / Employer Name</label>
                <input
                  type="text"
                  value={recipientOrganization}
                  onChange={(e) => setRecipientOrganization(e.target.value)}
                  placeholder="e.g. University of Lusaka"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>
            </div>
          )}

          {docType === 'obituary_memorial' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Date of Passing</label>
                <input
                  type="date"
                  value={dateOfPassing}
                  onChange={(e) => setDateOfPassing(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Resting / Burial Place</label>
                <input
                  type="text"
                  value={burialPlace}
                  onChange={(e) => setBurialPlace(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Additional Clerk Notes / Specific Details</label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Specific course code, exam time, or pastoral message..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-blue-900"
            />
          </div>
        </div>
      </div>

      {/* Live Document Preview Display (Formatted strictly for Print) */}
      <div className="bg-white rounded-[2rem] p-8 sm:p-16 border border-slate-200 shadow-xl max-w-4xl mx-auto printable-doc text-slate-900 font-serif leading-relaxed">
        {/* Document Header & Logo */}
        <div className="text-center space-y-2 pb-6 border-b-2 border-slate-900">
          <div className="flex justify-center mb-3">
            <SDALogo className="w-36 h-20" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase font-sans">
            Seventh-day Adventist Church
          </h1>
          <p className="text-xs uppercase font-sans font-bold tracking-[0.25em] text-slate-600">
            {churchName} • Secretariat & Pastoral Office
          </p>
          <p className="text-xs font-sans text-slate-400">
            Official Church Registry Record • Established in the Faith
          </p>
        </div>

        {/* Dynamic Body Content according to Template */}
        {docType === 'sabbath_accommodation' && (
          <div className="py-8 space-y-6 text-sm">
            <div className="flex justify-between text-xs font-sans font-bold text-slate-500">
              <span>Ref: SEC-SAB-{selectedMember?.id || '01'}</span>
              <span>Date: {todayDate}</span>
            </div>

            <div className="font-sans">
              <p className="font-bold">{recipientName}</p>
              <p className="font-bold text-slate-700">{recipientOrganization}</p>
            </div>

            <p className="font-sans font-black text-base uppercase text-blue-950 underline underline-offset-4">
              RE: RELIGIOUS ACCOMMODATION REQUEST — SEVENTH-DAY SABBATH OBSERVANCE
            </p>

            <p>Dear Administrator / Official,</p>

            <p>
              This official letter is issued by the Secretariat of the <strong>{churchName}</strong> on behalf of our member,{' '}
              <strong>{selectedMember?.name}</strong>.
            </p>

            <p>
              As Seventh-day Adventists, one of our core, foundational religious tenets is the sacred observance of the
              biblical Seventh-day Sabbath (Genesis 2:1-3; Exodus 20:8-11). According to holy scripture, the Sabbath commences
              at <strong>sunset on Friday evening and concludes at sunset on Saturday evening</strong>.
            </p>

            <p>
              During this 24-hour sacred period, adherent Seventh-day Adventists conscientiously refrain from secular work,
              commercial transactions, academic examinations, and routine worldly activities to engage in worship, fellowship,
              and spiritual contemplation.
            </p>

            <p>
              We respectfully request that you extend reasonable religious accommodation to <strong>{selectedMember?.name}</strong>{' '}
              by permitting them to be excused from work shifts, lectures, or examinations scheduled between sunset Friday and sunset Saturday.
              Our church stands ready to assist in arranging alternative schedules or proctoring services before Friday sunset or after Saturday sunset.
            </p>

            {customNotes && (
              <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs italic font-sans">
                Additional Note: {customNotes}
              </p>
            )}

            <p>
              Thank you for your gracious understanding, cooperation, and support of freedom of conscience and religious freedom.
            </p>
          </div>
        )}

        {docType === 'recommendation_good_standing' && (
          <div className="py-8 space-y-6 text-sm">
            <div className="flex justify-between text-xs font-sans font-bold text-slate-500">
              <span>Ref: REC-STAND-{selectedMember?.id || '01'}</span>
              <span>Date: {todayDate}</span>
            </div>

            <p className="font-sans font-black text-base uppercase text-blue-950 underline underline-offset-4 text-center">
              CERTIFICATE OF GOOD STANDING & RECOMMENDATION
            </p>

            <p>To Whom It May Concern,</p>

            <p>
              Christian greetings in the precious name of our Lord and Saviour Jesus Christ.
            </p>

            <p>
              This is to officially certify that <strong>{selectedMember?.name}</strong> is an active baptized member in regular standing
              of the <strong>{churchName}</strong>.
            </p>

            <p>
              {selectedMember?.baptismDate ? (
                <>Our official church records confirm their baptism on <strong>{selectedMember.baptismDate}</strong>. </>
              ) : null}
              They are currently in full fellowship and communion with the church, demonstrating faithfulness to the doctrines,
              stewardship, and mission of the Seventh-day Adventist Church.
            </p>

            <p>
              We warmly recommend them to your Christian fellowship, confidence, and any spiritual or institutional responsibilities
              they may undertake.
            </p>

            {customNotes && (
              <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs italic font-sans">
                Particulars: {customNotes}
              </p>
            )}
          </div>
        )}

        {docType === 'welcome_letter' && (
          <div className="py-8 space-y-6 text-sm">
            <div className="flex justify-between text-xs font-sans font-bold text-slate-500">
              <span>Ref: WELCOME-{selectedMember?.id || '01'}</span>
              <span>Date: {todayDate}</span>
            </div>

            <p className="font-sans font-black text-base uppercase text-blue-950 underline underline-offset-4 text-center">
              WELCOME TO THE CHURCH FAMILY OF {churchName.toUpperCase()}
            </p>

            <p>Dear <strong>{selectedMember?.name}</strong>,</p>

            <p>
              Grace, mercy, and peace be multiplied unto you from God our Father and our Lord Jesus Christ!
            </p>

            <p>
              On behalf of the pastoral staff, church elders, board, and our entire congregation, it is with overflowing joy
              that we welcome you into the loving family of <strong>{churchName}</strong>. Whether you have just made your public
              covenant through baptism or transferred into our midst from a sister church, we praise God for directing your steps to us.
            </p>

            <p>
              You are now an integral part of the body of Christ. We encourage you to actively engage in our Sabbath School classes,
              prayer bands, and departments such as Personal Ministries, Youth, Music, and Community Services where your God-given
              talents can flourish for the Kingdom of God.
            </p>

            <p>
              May the Lord bless you, keep you, and cause His face to shine upon you as we await the glorious return of our Saviour.
            </p>
          </div>
        )}

        {docType === 'outreach_letter' && (
          <div className="py-8 space-y-6 text-sm">
            <div className="flex justify-between text-xs font-sans font-bold text-slate-500">
              <span>Ref: OUTREACH-CARE-{selectedMember?.id || '01'}</span>
              <span>Date: {todayDate}</span>
            </div>

            <p className="font-sans font-black text-base uppercase text-blue-950 underline underline-offset-4 text-center">
              A MESSAGE OF LOVE AND FELLOWSHIP FROM YOUR CHURCH FAMILY
            </p>

            <p>Dear <strong>{selectedMember?.name}</strong>,</p>

            <p>
              We greet you warmly in the blessed name of our Saviour, Jesus Christ.
            </p>

            <p>
              As the pastoral team and clerk secretariat of <strong>{churchName}</strong>, we are writing this personal note to let
              you know how dearly you are loved and missed in our Sabbath School and worship services. You remain an indelible member
              of our spiritual family.
            </p>

            <p>
              We understand that life brings seasons of hardship, health challenges, relocation, and discouragement. Whatever you may be
              facing right now, please know that you are not alone. Our church family is upholding you in continuous prayer.
            </p>

            <p>
              If there is any way we can pray with you, visit, or provide assistance, please reach out to our pastoral office or your
              assigned elder. The sanctuary doors and the arms of Christ are always wide open to welcome you back.
            </p>

            {customNotes && (
              <p className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs italic font-sans text-amber-900">
                Visitation Note: {customNotes}
              </p>
            )}
          </div>
        )}

        {docType === 'baptism_certificate' && (
          <div className="py-8 space-y-8 text-center">
            <div className="inline-block p-2 border-2 border-amber-600/40 rounded-full mb-2">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>

            <h2 className="text-3xl font-black uppercase font-sans tracking-wide text-blue-950">
              Certificate of Baptism
            </h2>
            <p className="text-xs font-sans uppercase font-bold tracking-[0.2em] text-slate-500">
              Seventh-day Adventist Church
            </p>

            <p className="text-sm italic font-serif max-w-lg mx-auto text-slate-600">
              "Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead
              by the glory of the Father, even so we also should walk in newness of life." — Romans 6:4
            </p>

            <div className="py-6">
              <p className="text-xs font-sans uppercase tracking-widest text-slate-400">This Certifies That</p>
              <h3 className="text-3xl font-black font-sans text-slate-900 mt-2 border-b-2 border-slate-900 inline-block px-8 pb-1">
                {selectedMember?.name}
              </h3>
            </div>

            <p className="text-sm max-w-xl mx-auto">
              having publicly confessed faith in Jesus Christ as Lord and Saviour, was baptized by immersion into the fellowship
              of the <strong>Seventh-day Adventist Church</strong> at <strong>{churchName}</strong> on this date:
            </p>

            <p className="font-sans font-black text-lg text-blue-900">
              {selectedMember?.baptismDate || todayDate}
            </p>
          </div>
        )}

        {docType === 'obituary_memorial' && (
          <div className="py-8 space-y-6 text-sm">
            <div className="flex justify-between text-xs font-sans font-bold text-slate-500">
              <span>Record Ref: MEMORIAL-{selectedMember?.id || '01'}</span>
              <span>Archived: {todayDate}</span>
            </div>

            <p className="font-sans font-black text-base uppercase text-blue-950 underline underline-offset-4 text-center">
              OFFICIAL CHURCH ARCHIVAL RECORD & BIOGRAPHICAL MEMORIAL
            </p>

            <p className="italic text-center max-w-md mx-auto text-xs text-slate-600">
              "I have fought a good fight, I have finished my course, I have kept the faith: Henceforth there is laid up for me
              a crown of righteousness..." — 2 Timothy 4:7-8
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[9px]">Full Name of Deceased Member</p>
                <p className="font-black text-slate-900 text-sm">{selectedMember?.name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[9px]">Date of Birth</p>
                <p className="font-black text-slate-900">{selectedMember?.dob || 'Historical Record'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[9px]">Date of Baptism</p>
                <p className="font-black text-slate-900">{selectedMember?.baptismDate || 'Recorded in Secretariat'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[9px]">Date of Falling Asleep in Jesus</p>
                <p className="font-black text-slate-900">{dateOfPassing}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Resting Place (Awaiting the Resurrection)</p>
                <p className="font-black text-slate-900">{burialPlace}</p>
              </div>
            </div>

            <p>
              The <strong>{churchName}</strong> records with sorrow tempered by the blessed hope of the First Resurrection
              the passing of our dear brother/sister. Their name is honorably preserved in our archives, having completed their
              earthly pilgrimage in faith and devotion.
            </p>
          </div>
        )}

        {/* Official Signatures Block */}
        <div className="grid grid-cols-2 gap-12 pt-12 border-t-2 border-slate-900 font-sans mt-12">
          <div>
            <div className="border-b border-slate-900 pb-1 h-14 flex items-end">
              <span className="font-bold text-xs uppercase text-slate-800">{clerkName}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">Church Clerk</p>
            <p className="text-[9px] text-slate-400">{churchName}</p>
          </div>

          <div>
            <div className="border-b border-slate-900 pb-1 h-14 flex items-end">
              <span className="font-bold text-xs uppercase text-slate-800">{officiatingPastor}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">
              Minister of the Gospel / First Elder
            </p>
            <p className="text-[9px] text-slate-400">Seventh-day Adventist Church</p>
          </div>
        </div>
      </div>
    </div>
  );
};
