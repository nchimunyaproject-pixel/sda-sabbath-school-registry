import React, { useState } from 'react';
import { TransferRequest, TransferStatus, User, ChurchMember } from '../../types';
import { 
  ArrowRightLeft, Send, CheckCircle2, Clock, Check, X, FileText, 
  Printer, AlertCircle, Plus, ChevronRight, Building2, User as UserIcon, Calendar, CheckSquare
} from 'lucide-react';
import SDALogo from '../SDALogo';

interface TransfersPipelineViewProps {
  requests: TransferRequest[];
  currentChurchUser: User;
  allChurches: User[];
  members: ChurchMember[];
  onInitiateTransfer: (transfer: Omit<TransferRequest, 'id' | 'requestDate' | 'status'>) => void;
  onUpdateTransferStage: (id: string, stage: TransferStatus, metadata?: {
    boardVoteDate?: string;
    boardResolutionNo?: string;
    firstReadingDate?: string;
    secondReadingDate?: string;
    approvalDate?: string;
    eAdventistSynced?: boolean;
    clerkNotes?: string;
  }) => void;
  onRejectTransfer: (id: string, reason?: string) => void;
}

export const TransfersPipelineView: React.FC<TransfersPipelineViewProps> = ({
  requests,
  currentChurchUser,
  allChurches,
  members,
  onInitiateTransfer,
  onUpdateTransferStage,
  onRejectTransfer
}) => {
  const [directionFilter, setDirectionFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [selectedRequestForPrint, setSelectedRequestForPrint] = useState<TransferRequest | null>(null);
  const [printDocType, setPrintDocType] = useState<'request' | 'recommendation' | 'acknowledgement'>('recommendation');

  // Intake Form
  const [transferType, setTransferType] = useState<'incoming' | 'outgoing'>('incoming');
  const [studentName, setStudentName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [otherChurchName, setOtherChurchName] = useState('');
  const [otherChurchId, setOtherChurchId] = useState('');
  const [reason, setReason] = useState('');
  const [clerkNotes, setClerkNotes] = useState('');

  // Active stage update dialog
  const [activeStageUpdateReq, setActiveStageUpdateReq] = useState<TransferRequest | null>(null);
  const [targetStage, setTargetStage] = useState<TransferStatus>('first_reading');
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [resolutionNumber, setResolutionNumber] = useState('RES-2026-');
  const [stageNotes, setStageNotes] = useState('');

  const filteredRequests = requests.filter(r => {
    const isIncoming = r.toChurchId === currentChurchUser.id || r.transferType === 'incoming';
    const isOutgoing = r.fromChurchId === currentChurchUser.id || r.transferType === 'outgoing';
    if (directionFilter === 'incoming') return isIncoming;
    if (directionFilter === 'outgoing') return isOutgoing;
    return true;
  });

  const handleOpenStageUpdate = (req: TransferRequest, nextStage: TransferStatus) => {
    setActiveStageUpdateReq(req);
    setTargetStage(nextStage);
    setActionDate(new Date().toISOString().split('T')[0]);
    if (nextStage === 'first_reading') {
      setResolutionNumber(req.boardResolutionNo || `RES-${new Date().getFullYear()}-0${Math.floor(Math.random() * 80 + 20)}`);
    }
    setStageNotes('');
  };

  const handleConfirmStageUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStageUpdateReq) return;

    const metadata: any = { clerkNotes: stageNotes || activeStageUpdateReq.clerkNotes };
    if (targetStage === 'first_reading') {
      metadata.boardVoteDate = actionDate;
      metadata.boardResolutionNo = resolutionNumber;
    } else if (targetStage === 'second_reading') {
      metadata.firstReadingDate = actionDate;
    } else if (targetStage === 'approved') {
      metadata.secondReadingDate = actionDate;
      metadata.approvalDate = actionDate;
      metadata.eAdventistSynced = true;
    }

    onUpdateTransferStage(activeStageUpdateReq.id, targetStage, metadata);
    setActiveStageUpdateReq(null);
  };

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromId = transferType === 'outgoing' ? currentChurchUser.id : (otherChurchId || 'external-church');
    const fromName = transferType === 'outgoing' ? (currentChurchUser.churchName || currentChurchUser.name) : otherChurchName;
    const toId = transferType === 'incoming' ? currentChurchUser.id : (otherChurchId || 'external-church');
    const toName = transferType === 'incoming' ? (currentChurchUser.churchName || currentChurchUser.name) : otherChurchName;

    onInitiateTransfer({
      studentName,
      memberId: memberId || undefined,
      transferType,
      fromChurchId: fromId,
      fromChurchName: fromName,
      toChurchId: toId,
      toChurchName: toName,
      reason,
      clerkNotes
    });

    setIsInitiateModalOpen(false);
    setStudentName('');
    setMemberId('');
    setOtherChurchName('');
    setOtherChurchId('');
    setReason('');
    setClerkNotes('');
  };

  // Pipeline Stage Helpers
  const getStageIndex = (status: TransferStatus) => {
    switch (status) {
      case 'pending':
      case 'pending_board':
        return 0; // Board Recommendation
      case 'first_reading':
        return 1; // 1st Reading
      case 'second_reading':
        return 2; // 2nd Reading & Congregational Vote
      case 'approved':
        return 3; // eAdventist Sync & Complete
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const stages = [
    { label: 'Board Recommendation', short: 'Board Vote' },
    { label: 'First Reading', short: '1st Reading' },
    { label: 'Second Reading & Vote', short: '2nd Reading' },
    { label: 'eAdventist Sync & Complete', short: 'Completed' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Intake Button */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-blue-900" /> SDA Membership Transfer Pipeline
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Automated 4-Stage Church Manual Process: Board Vote → 1st Reading → 2nd Reading & Vote → eAdventist Sync
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setDirectionFilter('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                directionFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setDirectionFilter('incoming')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                directionFilter === 'incoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Incoming
            </button>
            <button
              onClick={() => setDirectionFilter('outgoing')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                directionFilter === 'outgoing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Outgoing
            </button>
          </div>

          <button
            onClick={() => setIsInitiateModalOpen(true)}
            className="px-6 py-3.5 bg-blue-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Initiate Transfer
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
            <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight">No Transfer Requests in Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1">Initiate an incoming or outgoing letter request to track the 4-stage approval workflow.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isIncoming = req.toChurchId === currentChurchUser.id || req.transferType === 'incoming';
            const currentStageIdx = getStageIndex(req.status);

            return (
              <div 
                key={req.id} 
                className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                      isIncoming ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'
                    }`}>
                      {isIncoming ? <ArrowRightLeft className="w-6 h-6 rotate-180" /> : <Send className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">{req.studentName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isIncoming ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isIncoming ? 'Incoming Transfer' : 'Outgoing Transfer'}
                        </span>
                        {req.eAdventistSynced && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[9px] font-black uppercase tracking-wider">
                            eAdventist Synced
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 mt-1.5">
                        <span>From: <strong className="text-slate-700">{req.fromChurchName}</strong></span>
                        <span>→</span>
                        <span>To: <strong className="text-slate-700">{req.toChurchName}</strong></span>
                        <span>•</span>
                        <span>Requested: {new Date(req.requestDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Print Certificate */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequestForPrint(req);
                        setPrintDocType('recommendation');
                      }}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all border border-slate-200"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-800" /> Official Form
                    </button>
                    {req.status !== 'approved' && req.status !== 'rejected' && (
                      <button
                        onClick={() => onRejectTransfer(req.id, 'Disapproved by church action')}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* 4-Stage Stepper Progress Bar */}
                <div className="py-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stages.map((stage, idx) => {
                      const isCompleted = currentStageIdx > idx || req.status === 'approved';
                      const isCurrent = currentStageIdx === idx && req.status !== 'approved';
                      const isUpcoming = currentStageIdx < idx && req.status !== 'approved';

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            isCompleted ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' :
                            isCurrent ? 'bg-blue-900 text-white border-blue-950 shadow-md shadow-blue-900/10' :
                            'bg-slate-50 border-slate-100 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">
                              Step {idx + 1}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isCurrent ? (
                              <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-slate-300" />
                            )}
                          </div>
                          <p className={`font-black text-xs leading-snug ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                            {stage.label}
                          </p>

                          {/* Specific date badge */}
                          {idx === 0 && req.boardVoteDate && (
                            <p className="text-[9px] mt-1 opacity-90 font-bold">Voted: {req.boardVoteDate}</p>
                          )}
                          {idx === 1 && req.firstReadingDate && (
                            <p className="text-[9px] mt-1 opacity-90 font-bold">Read: {req.firstReadingDate}</p>
                          )}
                          {idx === 2 && req.secondReadingDate && (
                            <p className="text-[9px] mt-1 opacity-90 font-bold">Voted: {req.secondReadingDate}</p>
                          )}
                          {idx === 3 && req.approvalDate && (
                            <p className="text-[9px] mt-1 opacity-90 font-bold">Finalized: {req.approvalDate}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stage Advancement Controls */}
                {req.status !== 'approved' && req.status !== 'rejected' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="text-xs font-bold text-slate-600">
                      {req.reason && <p><span className="text-slate-400">Reason:</span> {req.reason}</p>}
                      {req.boardResolutionNo && <p className="text-[10px] text-blue-900 mt-0.5">Resolution: {req.boardResolutionNo}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {currentStageIdx === 0 && (
                        <button
                          onClick={() => handleOpenStageUpdate(req, 'first_reading')}
                          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                        >
                          Record Board Vote & Advance →
                        </button>
                      )}

                      {currentStageIdx === 1 && (
                        <button
                          onClick={() => handleOpenStageUpdate(req, 'second_reading')}
                          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                        >
                          Confirm 1st Reading & Schedule 2nd →
                        </button>
                      )}

                      {currentStageIdx === 2 && (
                        <button
                          onClick={() => handleOpenStageUpdate(req, 'approved')}
                          className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                          <CheckSquare className="w-4 h-4" /> 2nd Reading Voted • Finalize & Sync
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Intake Modal: Initiate Transfer */}
      {isInitiateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-2xl w-full shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Initiate Membership Transfer</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Official Letter of Transfer Intake Form</p>
              </div>
              <button 
                onClick={() => setIsInitiateModalOpen(false)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInitiateSubmit} className="space-y-6">
              {/* Transfer Direction */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Transfer Direction</label>
                <div className="grid grid-cols-2 gap-4 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setTransferType('incoming')}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                      transferType === 'incoming' ? 'bg-blue-900 text-white border-blue-950 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Incoming (Receiving Member)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferType('outgoing')}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                      transferType === 'outgoing' ? 'bg-blue-900 text-white border-blue-950 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Outgoing (Granting Letter)
                  </button>
                </div>
              </div>

              {/* Member Selection or Name */}
              {transferType === 'outgoing' ? (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Select Local Member *</label>
                  <select
                    required
                    value={memberId}
                    onChange={(e) => {
                      const sel = members.find(m => m.id === e.target.value);
                      setMemberId(e.target.value);
                      if (sel) setStudentName(sel.name);
                    }}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="">-- Choose Member from Church Register --</option>
                    {members.filter(m => m.status === 'active' || m.status === 'transferring').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.address || 'Member'})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Full Name of Transferring Person *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Priscilla Chimuka"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
              )}

              {/* Other Church Details */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">
                  {transferType === 'incoming' ? 'Source / Transferring Church & City *' : 'Destination Church & City *'}
                </label>
                <input
                  type="text"
                  required
                  value={otherChurchName}
                  onChange={(e) => setOtherChurchName(e.target.value)}
                  placeholder="e.g. Riverside SDA Church, Kitwe / Lusaka Central"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Reason for Transfer</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Relocated residence for work/studies, marriage, closer proximity"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Clerk Secretariat Notes</label>
                <textarea
                  rows={2}
                  value={clerkNotes}
                  onChange={(e) => setClerkNotes(e.target.value)}
                  placeholder="e.g. Letter requested via Conference Secretariat; confirmed good standing"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInitiateModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Create Intake Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stage Advance Modal */}
      {activeStageUpdateReq && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Stage Action</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                  {activeStageUpdateReq.studentName}
                </p>
              </div>
              <button 
                onClick={() => setActiveStageUpdateReq(null)}
                className="p-2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStageUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Date of Action / Sabbath *</label>
                <input
                  type="date"
                  required
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              {targetStage === 'first_reading' && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Board Resolution Number</label>
                  <input
                    type="text"
                    value={resolutionNumber}
                    onChange={(e) => setResolutionNumber(e.target.value)}
                    placeholder="RES-2026-021"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Minute / Vote Notes</label>
                <textarea
                  rows={2}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Record outcome of congregational reading or vote..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStageUpdateReq(null)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Confirm & Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Form Preview Modal */}
      {selectedRequestForPrint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 sm:p-12 max-w-3xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6 no-print">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintDocType('recommendation')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                    printDocType === 'recommendation' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Letter of Transfer
                </button>
                <button
                  onClick={() => setPrintDocType('acknowledgement')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                    printDocType === 'acknowledgement' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Acknowledgement Form
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-black"
                >
                  <Printer className="w-4 h-4" /> Print Form
                </button>
                <button
                  onClick={() => setSelectedRequestForPrint(null)}
                  className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Official Seventh-day Adventist Document Template */}
            <div className="p-8 sm:p-12 border-2 border-slate-900 rounded-2xl bg-white text-slate-900 space-y-8 font-serif">
              {/* Header */}
              <div className="text-center space-y-2 pb-6 border-b-2 border-slate-900">
                <div className="flex justify-center mb-2">
                  <SDALogo className="w-32 h-16" />
                </div>
                <h1 className="text-xl font-black tracking-wider uppercase font-sans">
                  Seventh-day Adventist Church
                </h1>
                <p className="text-xs uppercase font-sans font-bold tracking-[0.2em] text-slate-600">
                  {currentChurchUser.churchName || 'Woodlands SDA Church'} • Secretariat Division
                </p>
                <p className="text-sm font-sans font-black uppercase text-blue-900 mt-2">
                  {printDocType === 'recommendation' ? 'Official Certificate of Transfer & Recommendation' : 'Transfer Acknowledgement Receipt'}
                </p>
              </div>

              {/* Document Body */}
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="flex justify-between text-xs font-sans font-bold text-slate-500">
                  <span>Reference: {selectedRequestForPrint.boardResolutionNo || 'TR-2026-CONF'}</span>
                  <span>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <p>
                  To the Church Clerk and Church Board of: <br />
                  <strong className="text-base font-sans font-black">{selectedRequestForPrint.toChurchName}</strong>
                </p>

                <p>Christian Greetings in the blessed name of our Lord and Saviour Jesus Christ.</p>

                {printDocType === 'recommendation' ? (
                  <>
                    <p>
                      This is to certify that <strong>{selectedRequestForPrint.studentName}</strong> is a member in regular standing
                      of the <strong>{selectedRequestForPrint.fromChurchName}</strong>, fellowshipping in peace and communion with the brethren.
                    </p>
                    <p>
                      At their request, and following due procedure as stipulated in the <em>Seventh-day Adventist Church Manual</em>,
                      the Church Board recommended on <strong>{selectedRequestForPrint.boardVoteDate || 'recent date'}</strong>, and
                      public readings were conducted before the congregation.
                    </p>
                    <p>
                      We therefore warmly recommend this brother/sister to your spiritual care and fellowship. When received by your vote,
                      please detach and return the bottom acknowledgement certificate to our church secretariat.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      This certifies that the recommendation for the transfer of <strong>{selectedRequestForPrint.studentName}</strong> has been
                      read before our congregation, duly voted in regular business session, and their name has been inscribed on our Church Register.
                    </p>
                    <p>
                      Their membership in your church record may now be officially closed, and the Conference Secretariat notification processed.
                    </p>
                  </>
                )}

                {selectedRequestForPrint.reason && (
                  <p className="text-xs italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    Reason recorded: {selectedRequestForPrint.reason}
                  </p>
                )}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-12 border-t border-slate-300 font-sans">
                <div>
                  <div className="border-b border-slate-900 pb-1 h-12 flex items-end">
                    <span className="font-bold text-xs uppercase">{currentChurchUser.name}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">Church Clerk</p>
                </div>

                <div>
                  <div className="border-b border-slate-900 pb-1 h-12 flex items-end">
                    <span className="font-bold text-xs uppercase">Pastor / First Elder</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">Presiding Minister / Elder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
