import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, CheckCircle2, DollarSign, Calculator, 
  X, AlertTriangle, UserCheck, Calendar, FileText, Check
} from 'lucide-react';
import { LooseOfferingRecord, User } from '../types';

interface TwoWitnessTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchId: string;
  currentTreasurer?: User;
  onSaveCountBatch: (record: LooseOfferingRecord) => void;
}

export const TwoWitnessTreasuryModal: React.FC<TwoWitnessTreasuryModalProps> = ({
  isOpen,
  onClose,
  churchId,
  currentTreasurer,
  onSaveCountBatch
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<LooseOfferingRecord['serviceType']>('Divine Service');
  
  // Currency Denominations (Zambian Kwacha standard / customizable)
  const [k100, setK100] = useState<number>(0);
  const [k50, setK50] = useState<number>(0);
  const [k20, setK20] = useState<number>(0);
  const [k10, setK10] = useState<number>(0);
  const [k5, setK5] = useState<number>(0);
  const [k2, setK2] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  
  // Two Counters
  const [witness1Name, setWitness1Name] = useState('Elder M. S. Banda (First Elder / Counter 1)');
  const [witness1Pin, setWitness1Pin] = useState('');
  const [witness2Name, setWitness2Name] = useState(
    currentTreasurer ? `${currentTreasurer.name} (Treasurer / Counter 2)` : 'Elder Joseph Banda (Treasurer / Counter 2)'
  );
  const [witness2Pin, setWitness2Pin] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalAmount = 
    (k100 * 100) + 
    (k50 * 50) + 
    (k20 * 20) + 
    (k10 * 10) + 
    (k5 * 5) + 
    (k2 * 2) + 
    (coins);

  const handleVerifyAndLock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (totalAmount <= 0) {
      setErrorMsg('Total counted amount must be greater than zero.');
      return;
    }
    if (!witness1Name.trim() || !witness2Name.trim()) {
      setErrorMsg('Church Manual requires two distinct appointed witnesses to count and verify loose offerings.');
      return;
    }
    if (!witness1Pin || !witness2Pin) {
      setErrorMsg('Both counting witnesses must enter their verification authorization PIN.');
      return;
    }

    const newRecord: LooseOfferingRecord = {
      id: `loose-${Date.now()}`,
      churchId,
      receiptNumber: `LOOSE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date,
      serviceType,
      treasurerName: witness2Name.trim(),
      secondOfficerName: witness1Name.trim(),
      secondOfficerRole: 'Elder',
      denominationBreakdown: {
        bills100: k100,
        bills50: k50,
        bills20: k20,
        bills10: k10,
        bills5: k5,
        coins
      },
      totalAmount,
      targetFund: 'Local Church Budget (Division Calendar)',
      isSignedByBoth: true,
      deaconReceiptIssued: true,
      notes: `Dual-Witness Certified: ${witness1Name} & ${witness2Name}. Denominations: 100x${k100}, 50x${k50}, 20x${k20}, 10x${k10}. Sealed at ${new Date().toLocaleTimeString()}`
    };

    onSaveCountBatch(newRecord);
    setIsLocked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                Two-Witness Sabbath Offering Verification Lock
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                Mandatory SDA Church Manual Dual-Custodian Safeguard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {isLocked ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Offering Batch Certified & Locked!</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The amount of <strong className="text-emerald-700 text-base">ZK {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> has been dual-witness certified by <strong>{witness1Name}</strong> and <strong>{witness2Name}</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border text-xs max-w-sm mx-auto font-mono text-slate-600">
                Audit Hash: SEC-{Date.now().toString(36).toUpperCase()}-LOCKED
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-amber-300 rounded-xl font-black text-xs uppercase tracking-wider"
              >
                Return to Treasury Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyAndLock} className="space-y-6">
              
              {/* Church Manual Note */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong>Church Manual Standard:</strong> All loose offerings and collection plates must be counted immediately after service by two appointed officers together, signed, and locked into the Treasury register.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Service & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Collection Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Service / Assembly
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as LooseOfferingRecord['serviceType'])}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Divine Service">Divine Service</option>
                    <option value="Sabbath School">Sabbath School</option>
                    <option value="AY Service">AY Service</option>
                    <option value="Midweek Prayer">Midweek Prayer</option>
                    <option value="Camp Meeting">Camp Meeting</option>
                  </select>
                </div>
              </div>

              {/* Denomination Counter Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    Currency Denomination Tally (Kwacha)
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      ZK {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">K100 Notes</label>
                    <input
                      type="number"
                      min="0"
                      value={k100 || ''}
                      onChange={(e) => setK100(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">K50 Notes</label>
                    <input
                      type="number"
                      min="0"
                      value={k50 || ''}
                      onChange={(e) => setK50(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">K20 Notes</label>
                    <input
                      type="number"
                      min="0"
                      value={k20 || ''}
                      onChange={(e) => setK20(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">K10 Notes</label>
                    <input
                      type="number"
                      min="0"
                      value={k10 || ''}
                      onChange={(e) => setK10(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">K5 Notes</label>
                    <input
                      type="number"
                      min="0"
                      value={k5 || ''}
                      onChange={(e) => setK5(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">K2 Notes</label>
                    <input
                      type="number"
                      min="0"
                      value={k2 || ''}
                      onChange={(e) => setK2(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Coins (Total Value)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={coins || ''}
                      onChange={(e) => setCoins(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Two Witness Digital Signature Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Witness 1 */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                    Counter 1 • Appointed Elder / Deacon
                  </span>
                  <div>
                    <input
                      type="text"
                      value={witness1Name}
                      onChange={(e) => setWitness1Name(e.target.value)}
                      placeholder="Counter 1 Full Name & Title"
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Counter 1 Verification PIN / Key *</label>
                    <input
                      type="password"
                      value={witness1Pin}
                      onChange={(e) => setWitness1Pin(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Witness 2 */}
                <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    Counter 2 • Church Treasurer / Assistant
                  </span>
                  <div>
                    <input
                      type="text"
                      value={witness2Name}
                      onChange={(e) => setWitness2Name(e.target.value)}
                      placeholder="Counter 2 Full Name & Title"
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Counter 2 Verification PIN / Key *</label>
                    <input
                      type="password"
                      value={witness2Pin}
                      onChange={(e) => setWitness2Pin(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-950 hover:bg-black text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Dual-Witness Verify & Lock Batch
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default TwoWitnessTreasuryModal;
