import React, { useState } from 'react';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, 
  X, FileText, ArrowRight, Table, Layers, Check
} from 'lucide-react';
import { ChurchMember, MemberStatus } from '../types';

interface BulkImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchId: string;
  churchMembers: ChurchMember[];
  onImportMembers: (newMembers: ChurchMember[]) => void;
}

export const BulkImportExportModal: React.FC<BulkImportExportModalProps> = ({
  isOpen,
  onClose,
  churchId,
  churchMembers,
  onImportMembers
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Partial<ChurchMember>[]>([]);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvHeader = "Full Name,Member Number,Gender,Status,Baptism Date,Phone,Email,Address,Family Role,Member Type\n";
    const sampleRows = [
      "Elder James Mwale,MEM-2026-001,male,active,2015-08-15,+260977112233,james.mwale@church.org,Woodlands Lusaka,Head of Household,baptized\n",
      "Sister Grace Mwale,MEM-2026-002,female,active,2017-04-20,+260977445566,grace.mwale@church.org,Woodlands Lusaka,Spouse,baptized\n",
      "Ruth Mwale,MEM-2026-003,female,active,,+260977445566,,Woodlands Lusaka,Child,unbaptized_child\n"
    ].join("");

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SDA_Church_Membership_Template_${churchId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (rawText: string) => {
    setParseError(null);
    setImportSuccess(null);

    try {
      const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setParseError("The CSV file must contain a header row and at least one data row.");
        setParsedRows([]);
        return;
      }

      const rows: Partial<ChurchMember>[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts[0]) {
          rows.push({
            id: `mem-imp-${Date.now()}-${i}`,
            name: parts[0],
            memberNumber: parts[1] || `MEM-${Date.now().toString(36)}-${i}`,
            gender: (parts[2]?.toLowerCase() === 'male' || parts[2]?.toLowerCase() === 'female') ? parts[2]?.toLowerCase() as any : 'male',
            status: (parts[3] || 'active') as MemberStatus,
            baptismDate: parts[4] || undefined,
            contact: parts[5] || undefined,
            email: parts[6] || undefined,
            address: parts[7] || undefined,
            relationshipToHead: (parts[8] || 'Head of Household') as any,
            memberType: (parts[9] || 'baptized') as any,
            churchId: churchId
          });
        }
      }

      setParsedRows(rows);
    } catch (err: any) {
      setParseError(`Failed to parse CSV file: ${err.message}`);
      setParsedRows([]);
    }
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    onImportMembers(parsedRows as ChurchMember[]);
    setImportSuccess(parsedRows.length);
    setParsedRows([]);
    setCsvText('');
  };

  const handleExportACMS = () => {
    const csvHeader = "ID,Full Name,Member Number,Gender,Status,Baptism Date,Contact Phone,Email,Address,Church ID\n";
    const dataRows = churchMembers.map(m => 
      `"${m.id}","${m.name}","${m.memberNumber || ''}","${m.gender || ''}","${m.status}","${m.baptismDate || ''}","${m.contact || ''}","${m.email || ''}","${m.address || ''}","${m.churchId}"`
    ).join("\n");

    const blob = new Blob([csvHeader + dataRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ACMS_Conference_Roster_${churchId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                ACMS / eAdventist Bulk Roll Data Bridge
              </h3>
              <p className="text-xs text-blue-300 font-medium">
                Import from external spreadsheets & export standardized Conference reports
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

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 shrink-0">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Bulk CSV Import Wizard
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> ACMS Conference Export ({churchMembers.length})
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {activeTab === 'import' && (
            <div className="space-y-6">
              
              {/* Success Notification */}
              {importSuccess !== null && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-black text-sm">Import Complete!</span>
                    <span>Successfully enrolled <strong>{importSuccess}</strong> members into your church station master registry.</span>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {parseError && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Template Step */}
              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">
                    Step 1: Download Standard SDA Roll CSV Template
                  </h4>
                  <p className="text-xs text-blue-800">
                    Use our pre-formatted template with columns matching ACMS and General Conference Secretariat requirements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs shrink-0"
                >
                  <Download className="w-4 h-4" /> Download Template (.csv)
                </button>
              </div>

              {/* Upload Step */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Step 2: Upload CSV File or Paste Data
                </h4>
                
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-800 block">
                      Click to choose CSV file from computer
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Accepts UTF-8 encoded .csv files from Excel, ACMS, or eAdventist
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Or Paste Raw CSV Data Directly:
                  </label>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value);
                      parseCsv(e.target.value);
                    }}
                    placeholder="Full Name,Member Number,Gender,Status,Baptism Date,Phone..."
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Preview Step */}
              {parsedRows.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-600" />
                      Step 3: Preview Records to Import ({parsedRows.length} Valid Members)
                    </h4>
                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Confirm & Enroll All {parsedRows.length} Members
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 sticky top-0 font-black text-[10px] uppercase text-slate-600">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Full Name</th>
                          <th className="p-2.5">Member No.</th>
                          <th className="p-2.5">Gender</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Baptism Date</th>
                          <th className="p-2.5">Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedRows.slice(0, 50).map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{r.name}</td>
                            <td className="p-2.5 font-mono text-slate-600">{r.memberNumber}</td>
                            <td className="p-2.5 capitalize text-slate-600">{r.gender}</td>
                            <td className="p-2.5 text-emerald-700 font-bold capitalize">{r.status}</td>
                            <td className="p-2.5 text-slate-500">{r.baptismDate || '—'}</td>
                            <td className="p-2.5 text-slate-500">{r.contact || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 50 && (
                    <span className="text-[10px] text-slate-400 italic block">
                      Showing first 50 of {parsedRows.length} records.
                    </span>
                  )}
                </div>
              )}

            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">
                      Official Conference Secretariat Export
                    </h4>
                    <p className="text-xs text-slate-500">
                      Export currently registered {churchMembers.length} baptized & active members formatted for Conference Secretariat ACMS ingestion.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Export Data Summary:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-600">
                    <div>• Total Records: <strong>{churchMembers.length}</strong></div>
                    <div>• Baptized Souls: <strong>{churchMembers.filter(m => m.status === 'active').length}</strong></div>
                    <div>• Church Station: <strong>{churchId}</strong></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportACMS}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download ACMS CSV Roster
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl uppercase tracking-wider text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default BulkImportExportModal;
