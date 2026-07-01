import React, { useState, useMemo } from 'react';
import { Class, AttendanceRecord, Visitor } from '../types.ts';
import { Search, Users, Calendar, MapPin, Phone, Filter, Download } from 'lucide-react';

interface GuestListPageProps {
  classes: Class[];
  attendanceRecords: AttendanceRecord[];
}

interface EnrichedVisitor extends Visitor {
  date: string;
  className: string;
  teacherName: string;
}

const GuestListPage: React.FC<GuestListPageProps> = ({ classes, attendanceRecords }) => {
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Flatten all visitors from all attendance records
  const allVisitors: EnrichedVisitor[] = useMemo(() => {
    return attendanceRecords.flatMap(record =>
      (record.visitors || []).map(v => ({
        ...v,
        date: record.date,
        className: record.className,
        teacherName: record.teacherName,
      }))
    );
  }, [attendanceRecords]);

  const filtered = useMemo(() => {
    return allVisitors.filter(v => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.contact || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.location || '').toLowerCase().includes(search.toLowerCase());
      const matchClass = !filterClass || v.className === filterClass;
      const matchDate = !filterDate || v.date === filterDate;
      return matchSearch && matchClass && matchDate;
    });
  }, [allVisitors, search, filterClass, filterDate]);

  const uniqueClasses = [...new Set(attendanceRecords.map(r => r.className))].sort();

  const handleExport = () => {
    const headers = ['Name', 'Class', 'Date', 'Contact', 'Location', 'Purpose', 'Teacher'];
    const rows = filtered.map(v => [
      v.name,
      v.className,
      v.date,
      v.contact || '',
      v.location || '',
      v.purpose || '',
      v.teacherName,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-blue-950 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-950 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            Guest &amp; Visitor Registry
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-[52px]">
            All visitors recorded across Sabbath School classes
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-blue-950 hover:bg-blue-800 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-2xl transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Visitors', value: allVisitors.length, color: 'bg-blue-950 text-white', icon: '👥' },
          { label: 'Unique Names', value: new Set(allVisitors.map(v => v.name.toLowerCase())).size, color: 'bg-amber-500 text-blue-950', icon: '🧑' },
          { label: 'Classes Visited', value: new Set(allVisitors.map(v => v.className)).size, color: 'bg-indigo-600 text-white', icon: '🏫' },
          { label: 'This Search', value: filtered.length, color: 'bg-emerald-600 text-white', icon: '🔍' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4 shadow-sm`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-xs font-semibold opacity-75 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, contact, or location..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        {(search || filterClass || filterDate) && (
          <button
            onClick={() => { setSearch(''); setFilterClass(''); setFilterDate(''); }}
            className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Visitors Found</h3>
          <p className="text-slate-500 text-sm">
            {allVisitors.length === 0
              ? 'No visitor records have been submitted yet.'
              : 'No visitors match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-950 text-white">
                  {['Visitor Name', 'Class', 'Date', 'Contact / Location', 'Purpose', 'Teacher'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-black uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr
                    key={`${v.id}-${i}`}
                    className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                          {v.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {v.className}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {v.date}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {v.contact && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {v.contact}
                          </div>
                        )}
                        {v.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {v.location}
                          </div>
                        )}
                        {!v.contact && !v.location && (
                          <span className="text-xs text-slate-400 italic">Not provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-600 max-w-[180px] block truncate" title={v.purpose || ''}>
                        {v.purpose || <span className="italic text-slate-400">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-600 font-medium">{v.teacherName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {allVisitors.length} visitor records
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestListPage;
