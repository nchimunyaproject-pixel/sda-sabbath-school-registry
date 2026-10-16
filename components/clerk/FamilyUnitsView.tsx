import React, { useState } from 'react';
import { ChurchMember, FamilyUnit, MemberStatus } from '../../types';
import { 
  Users, Home, UserPlus, Search, Phone, Mail, MapPin, Calendar, 
  AlertTriangle, HeartHandshake, ShieldAlert, Edit2, Trash2, CheckCircle2,
  FileText, Sparkles, X, ChevronRight, UserCheck, Baby, Heart
} from 'lucide-react';

interface FamilyUnitsViewProps {
  members: ChurchMember[];
  familyUnits: FamilyUnit[];
  onAddMember: (member: Omit<ChurchMember, 'id' | 'churchId'>) => void;
  onUpdateMember: (id: string, updates: Partial<ChurchMember>) => void;
  onDeleteMember: (id: string) => void;
  onAddFamilyUnit: (family: Omit<FamilyUnit, 'id' | 'churchId'>) => void;
  onUpdateFamilyUnit: (id: string, updates: Partial<FamilyUnit>) => void;
  onDeleteFamilyUnit: (id: string) => void;
  onOpenOutreachLetter?: (member: ChurchMember) => void;
}

export const FamilyUnitsView: React.FC<FamilyUnitsViewProps> = ({
  members,
  familyUnits,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAddFamilyUnit,
  onUpdateFamilyUnit,
  onDeleteFamilyUnit,
  onOpenOutreachLetter
}) => {
  const [viewMode, setViewMode] = useState<'households' | 'individuals'>('households');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ChurchMember | null>(null);
  
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyUnit | null>(null);

  // Form states - Member
  const [givenNames, setGivenNames] = useState('');
  const [primarySurname, setPrimarySurname] = useState('');
  const [secondarySurname, setSecondarySurname] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [baptismDate, setBaptismDate] = useState('');
  const [status, setStatus] = useState<MemberStatus>('active');
  const [memberType, setMemberType] = useState<ChurchMember['memberType']>('baptized');
  const [familyUnitId, setFamilyUnitId] = useState('');
  const [relationshipToHead, setRelationshipToHead] = useState<ChurchMember['relationshipToHead']>('Head of Household');
  const [outreachFlag, setOutreachFlag] = useState(false);
  const [outreachNotes, setOutreachNotes] = useState('');

  // Form states - Family Unit
  const [familyName, setFamilyName] = useState('');
  const [familyAddress, setFamilyAddress] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');

  const openAddMemberModal = (preselectedFamilyId?: string) => {
    setEditingMember(null);
    setGivenNames('');
    setPrimarySurname('');
    setSecondarySurname('');
    setDob('');
    setGender('male');
    setContact('');
    setEmail('');
    setAddress(preselectedFamilyId ? familyUnits.find(f => f.id === preselectedFamilyId)?.address || '' : '');
    setBaptismDate('');
    setStatus('active');
    setMemberType('baptized');
    setFamilyUnitId(preselectedFamilyId || '');
    setRelationshipToHead(preselectedFamilyId ? 'Spouse' : 'Head of Household');
    setOutreachFlag(false);
    setOutreachNotes('');
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: ChurchMember) => {
    setEditingMember(member);
    setGivenNames(member.givenNames || member.name.split(' ')[0] || '');
    setPrimarySurname(member.primarySurname || member.name.split(' ').slice(1).join(' ') || '');
    setSecondarySurname(member.secondarySurname || '');
    setDob(member.dob || '');
    setGender(member.gender || 'male');
    setContact(member.contact || '');
    setEmail(member.email || '');
    setAddress(member.address || '');
    setBaptismDate(member.baptismDate || '');
    setStatus(member.status);
    setMemberType(member.memberType || 'baptized');
    setFamilyUnitId(member.familyUnitId || '');
    setRelationshipToHead(member.relationshipToHead || 'Head of Household');
    setOutreachFlag(!!member.outreachFlag);
    setOutreachNotes(member.outreachNotes || '');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = [givenNames, primarySurname, secondarySurname].filter(Boolean).join(' ');
    const memberPayload = {
      name: fullName,
      givenNames,
      primarySurname,
      secondarySurname: secondarySurname || undefined,
      dob: dob || undefined,
      gender,
      contact: contact || undefined,
      email: email || undefined,
      address: address || undefined,
      baptismDate: baptismDate || undefined,
      status,
      memberType,
      familyUnitId: familyUnitId || undefined,
      relationshipToHead: relationshipToHead || undefined,
      outreachFlag,
      outreachNotes: outreachNotes || undefined
    };

    if (editingMember) {
      onUpdateMember(editingMember.id, memberPayload);
    } else {
      onAddMember(memberPayload);
    }
    setIsMemberModalOpen(false);
  };

  const openAddFamilyModal = () => {
    setEditingFamily(null);
    setFamilyName('');
    setFamilyAddress('');
    setFamilyPhone('');
    setFamilyNotes('');
    setIsFamilyModalOpen(true);
  };

  const openEditFamilyModal = (family: FamilyUnit) => {
    setEditingFamily(family);
    setFamilyName(family.familyName);
    setFamilyAddress(family.address);
    setFamilyPhone(family.contactPhone);
    setFamilyNotes(family.notes || '');
    setIsFamilyModalOpen(true);
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFamily) {
      onUpdateFamilyUnit(editingFamily.id, {
        familyName,
        address: familyAddress,
        contactPhone: familyPhone,
        notes: familyNotes
      });
    } else {
      onAddFamilyUnit({
        familyName,
        primaryContactId: '',
        address: familyAddress,
        contactPhone: familyPhone,
        notes: familyNotes
      });
    }
    setIsFamilyModalOpen(false);
  };

  // Filter logic
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.contact && m.contact.includes(searchTerm)) ||
      (m.address && m.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesType = typeFilter === 'all' || m.memberType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const missingMembersCount = members.filter(m => m.status === 'missing' || m.outreachFlag).length;

  const getStatusBadge = (s: MemberStatus, flag?: boolean) => {
    switch(s) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Active</span>;
      case 'missing':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse"><AlertTriangle className="w-3 h-3" /> Missing (Outreach Needed)</span>;
      case 'transferring':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-black uppercase tracking-wider"><ChevronRight className="w-3 h-3" /> In Transfer</span>;
      case 'censured':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-black uppercase tracking-wider"><ShieldAlert className="w-3 h-3" /> Censured</span>;
      case 'disfellowshipped':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-[10px] font-black uppercase tracking-wider">Disfellowshipped</span>;
      case 'deceased':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-black uppercase tracking-wider">Deceased</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">{s}</span>;
    }
  };

  const getMemberTypeBadge = (type?: string) => {
    switch(type) {
      case 'unbaptized_child':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-[9px] font-bold uppercase tracking-wider"><Baby className="w-2.5 h-2.5" /> Child</span>;
      case 'non_member_spouse':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-[9px] font-bold uppercase tracking-wider"><Heart className="w-2.5 h-2.5" /> Non-Member Spouse</span>;
      case 'non_baptized_family':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-bold uppercase tracking-wider"><Users className="w-2.5 h-2.5" /> Non-Baptized Family</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[9px] font-bold uppercase tracking-wider"><UserCheck className="w-2.5 h-2.5" /> Baptized</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with Summary Stats & Outreach Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center font-black">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Family Households</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{familyUnits.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Listed Individuals</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{members.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-800 rounded-2xl flex items-center justify-center font-black">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baptized Members</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {members.filter(m => m.memberType === 'baptized' && m.status === 'active').length}
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 transition-all ${
          missingMembersCount > 0 ? 'bg-amber-500/10 border-amber-200' : 'bg-white border-slate-100'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
            missingMembersCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-900">Outreach Flags</p>
            <p className="text-2xl font-black text-amber-900 tracking-tight">{missingMembersCount}</p>
            {missingMembersCount > 0 && (
              <p className="text-[9px] font-bold text-amber-700 mt-0.5">Missing or inactive members</p>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: View Toggle, Search, Filters, Add Buttons */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('households')}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
              viewMode === 'households' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" /> Households ({familyUnits.length})
          </button>
          <button
            onClick={() => setViewMode('individuals')}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
              viewMode === 'individuals' ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> All Individuals ({members.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-900 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-wider text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="missing">Missing / Outreach</option>
            <option value="transferring">In Transfer</option>
            <option value="censured">Censured</option>
            <option value="disfellowshipped">Disfellowshipped</option>
            <option value="deceased">Deceased</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-wider text-slate-700 outline-none"
          >
            <option value="all">All Member Types</option>
            <option value="baptized">Baptized</option>
            <option value="unbaptized_child">Unbaptized Child</option>
            <option value="non_member_spouse">Non-Member Spouse</option>
            <option value="non_baptized_family">Non-Baptized Family</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={openAddFamilyModal}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4 text-blue-700" /> New Household
          </button>
          <button
            onClick={() => openAddMemberModal()}
            className="px-5 py-3 bg-blue-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Add Person
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'households' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {familyUnits.map(family => {
            const familyMembers = members.filter(m => m.familyUnitId === family.id);
            const primaryContact = members.find(m => m.id === family.primaryContactId) || familyMembers[0];
            const hasOutreach = familyMembers.some(m => m.status === 'missing' || m.outreachFlag);

            return (
              <div 
                key={family.id}
                className={`bg-white rounded-[2rem] p-6 sm:p-8 border transition-all shadow-sm ${
                  hasOutreach ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'
                }`}
              >
                {/* Household Header */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shadow-blue-900/20">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{family.familyName}</h3>
                        {hasOutreach && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse">
                            Outreach Flag
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {family.address}</span>
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {family.contactPhone}</span>
                      </div>
                      {family.notes && (
                        <p className="text-xs text-slate-400 mt-2 italic">{family.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditFamilyModal(family)}
                      className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-50 rounded-xl transition-all"
                      title="Edit Family"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFamilyUnit(family.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete Family"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Family Members List */}
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                    <span>Household Members ({familyMembers.length})</span>
                    <button
                      onClick={() => openAddMemberModal(family.id)}
                      className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-black"
                    >
                      <UserPlus className="w-3 h-3" /> Add Family Member
                    </button>
                  </div>

                  {familyMembers.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400">No members attached to this household yet.</p>
                    </div>
                  ) : (
                    familyMembers.map(member => (
                      <div 
                        key={member.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          member.status === 'missing' || member.outreachFlag ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 border-slate-100 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-black text-slate-800 text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-slate-900 text-sm leading-tight">{member.name}</p>
                              {member.relationshipToHead && (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-black uppercase tracking-wider">
                                  {member.relationshipToHead}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {getMemberTypeBadge(member.memberType)}
                              {getStatusBadge(member.status, member.outreachFlag)}
                              {member.baptismDate && (
                                <span className="text-[10px] text-slate-400 font-bold">
                                  Baptized: {member.baptismDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(member.status === 'missing' || member.outreachFlag) && onOpenOutreachLetter && (
                            <button
                              onClick={() => onOpenOutreachLetter(member)}
                              className="px-3 py-1.5 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-amber-600 transition-all flex items-center gap-1 shadow-sm"
                            >
                              <FileText className="w-3 h-3" /> Outreach Letter
                            </button>
                          )}
                          <button
                            onClick={() => openEditMemberModal(member)}
                            className="p-2 text-slate-400 hover:text-blue-900 hover:bg-white rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Individuals Master List Table */
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="pb-4 px-4">Full Name & Household</th>
                  <th className="pb-4 px-4">Demographics</th>
                  <th className="pb-4 px-4">Contact Details</th>
                  <th className="pb-4 px-4">Baptism / Type</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredMembers.map(member => {
                  const family = familyUnits.find(f => f.id === member.familyUnitId);
                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{member.name}</p>
                          {member.secondarySurname && (
                            <p className="text-[10px] text-slate-400 font-bold">Multi-surname: {member.primarySurname} {member.secondarySurname}</p>
                          )}
                          {family ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-800 mt-1">
                              <Home className="w-3 h-3" /> {family.familyName} ({member.relationshipToHead || 'Member'})
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Individual / Unassigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="capitalize">{member.gender || 'Not specified'}</p>
                        {member.dob && <p className="text-[10px] text-slate-400 font-bold">DOB: {member.dob}</p>}
                      </td>

                      <td className="py-4 px-4">
                        {member.contact && <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {member.contact}</p>}
                        {member.email && <p className="flex items-center gap-1 text-[10px] text-slate-400"><Mail className="w-3 h-3" /> {member.email}</p>}
                        {member.address && <p className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="w-3 h-3" /> {member.address}</p>}
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div>{getMemberTypeBadge(member.memberType)}</div>
                        {member.baptismDate ? (
                          <p className="text-[10px] text-slate-500 font-black">Baptism: {member.baptismDate}</p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Not baptized</p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(member.status, member.outreachFlag)}
                        {member.outreachNotes && (
                          <p className="text-[10px] text-amber-700 font-medium mt-1 max-w-xs truncate">{member.outreachNotes}</p>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(member.status === 'missing' || member.outreachFlag) && onOpenOutreachLetter && (
                            <button
                              onClick={() => onOpenOutreachLetter(member)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title="Generate Outreach Letter"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditMemberModal(member)}
                            className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Modal (Add / Edit) */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-3xl w-full shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {editingMember ? 'Edit Personal Record' : 'Add Person to Register'}
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                  Seventh-day Adventist Church Secretariat Record
                </p>
              </div>
              <button 
                onClick={() => setIsMemberModalOpen(false)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-6">
              {/* Naming Section (Multi-surname support) */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Full Name & Surname Structure
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500">Given / First Names *</label>
                    <input
                      type="text"
                      required
                      value={givenNames}
                      onChange={(e) => setGivenNames(e.target.value)}
                      placeholder="e.g. Carlos David"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500">Primary Surname *</label>
                    <input
                      type="text"
                      required
                      value={primarySurname}
                      onChange={(e) => setPrimarySurname(e.target.value)}
                      placeholder="e.g. Gómez / Mwale"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500">Secondary Surname (Optional)</label>
                    <input
                      type="text"
                      value={secondarySurname}
                      onChange={(e) => setSecondarySurname(e.target.value)}
                      placeholder="e.g. Morales / Santos"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Household & Family Relation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Household / Family Unit</label>
                  <select
                    value={familyUnitId}
                    onChange={(e) => setFamilyUnitId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="">-- Standalone / Unassigned --</option>
                    {familyUnits.map(f => (
                      <option key={f.id} value={f.id}>{f.familyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Relationship to Head</label>
                  <select
                    value={relationshipToHead}
                    onChange={(e) => setRelationshipToHead(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="Head of Household">Head of Household</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Dependent">Dependent</option>
                    <option value="Relative">Relative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Member Classification & Church Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Member Category</label>
                  <select
                    value={memberType}
                    onChange={(e) => setMemberType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="baptized">Baptized Church Member</option>
                    <option value="unbaptized_child">Unbaptized Child</option>
                    <option value="non_member_spouse">Non-Member Spouse</option>
                    <option value="non_baptized_family">Non-Baptized Family Member</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Official Membership Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="active">Active (Full Standing)</option>
                    <option value="missing">Missing (Unaccounted for)</option>
                    <option value="transferring">In Transition / Transfer</option>
                    <option value="censured">Censured (Disciplinary Period)</option>
                    <option value="disfellowshipped">Disfellowshipped (By Church Vote)</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>
              </div>

              {/* Demographics & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Baptism Date</label>
                  <input
                    type="date"
                    value={baptismDate}
                    onChange={(e) => setBaptismDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Phone Contact</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+260 977 123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@church.org"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot number, Street, Township, City"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              {/* Automated Outreach Flag Section */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={outreachFlag || status === 'missing'}
                    onChange={(e) => setOutreachFlag(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-black text-xs uppercase tracking-wider text-amber-900">
                    Flag for Clerk & Pastoral Outreach (Missing / Extended Absence)
                  </span>
                </label>
                {(outreachFlag || status === 'missing') && (
                  <textarea
                    value={outreachNotes}
                    onChange={(e) => setOutreachNotes(e.target.value)}
                    placeholder="Outreach notes: reason for absence, visitation notes, assigned elder or deacon..."
                    rows={2}
                    className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Family Unit Modal (Add / Edit) */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {editingFamily ? 'Edit Household Record' : 'Register Family Unit'}
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                  Family Unit Record (FUR)
                </p>
              </div>
              <button 
                onClick={() => setIsFamilyModalOpen(false)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveFamily} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Household / Family Name *</label>
                <input
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Mwale Household, Gómez Morales Family"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Primary Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={familyPhone}
                  onChange={(e) => setFamilyPhone(e.target.value)}
                  placeholder="+260 977 123456"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Household Physical Address *</label>
                <input
                  type="text"
                  required
                  value={familyAddress}
                  onChange={(e) => setFamilyAddress(e.target.value)}
                  placeholder="Plot, Street, Township, Area"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Household Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={familyNotes}
                  onChange={(e) => setFamilyNotes(e.target.value)}
                  placeholder="Special instructions, ministry involvement, language spoken at home..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-blue-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Save Household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
