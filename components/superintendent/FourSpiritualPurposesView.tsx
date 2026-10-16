import React, { useState } from 'react';
import { 
  SSEvangelismProject, SSGreetingSchedule, FinancialTransmission, 
  SSClassSession 
} from '../../types';
import { 
  Heart, BookOpen, Users, Globe, Plus, CheckCircle2, 
  Clock, DollarSign, Sparkles, TrendingUp, Calendar, 
  Flame, ShieldCheck, MapPin, X
} from 'lucide-react';
import { useCurrency } from '../../utils/currency';

interface FourSpiritualPurposesViewProps {
  evangelismProjects: SSEvangelismProject[];
  onAddEvangelismProject: (project: Omit<SSEvangelismProject, 'id'>) => void;
  onUpdateEvangelismProject: (id: string, updates: Partial<SSEvangelismProject>) => void;
  greetingSchedules: SSGreetingSchedule[];
  onAddGreetingSchedule: (item: Omit<SSGreetingSchedule, 'id'>) => void;
  financialTransmissions: FinancialTransmission[];
  classSessions: SSClassSession[];
}

export const FourSpiritualPurposesView: React.FC<FourSpiritualPurposesViewProps> = ({
  evangelismProjects,
  onAddEvangelismProject,
  onUpdateEvangelismProject,
  greetingSchedules,
  onAddGreetingSchedule,
  financialTransmissions,
  classSessions
}) => {
  const [activePillar, setActivePillar] = useState<'study' | 'fellowship' | 'outreach' | 'mission'>('study');
  const { formatCurrency } = useCurrency();

  // Add Evangelism Project Modal
  const [isAddProjModalOpen, setIsAddProjModalOpen] = useState(false);
  const [projType, setProjType] = useState<SSEvangelismProject['projectType']>('community_guest_day');
  const [projTitle, setProjTitle] = useState('');
  const [projCoordinator, setProjCoordinator] = useState('');
  const [projTargetDate, setProjTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [projGoals, setProjGoals] = useState('');

  // Add Greeting Schedule Modal
  const [isAddGreetingModalOpen, setIsAddGreetingModalOpen] = useState(false);
  const [greetDate, setGreetDate] = useState(new Date().toISOString().split('T')[0]);
  const [greetDivision, setGreetDivision] = useState('General Sanctuary Entrance');
  const [greetHosts, setGreetHosts] = useState('');
  const [greetTheme, setGreetTheme] = useState('Warm Christian Welcome & Fellowship');

  // Compute Mission Offering metrics from transmissions
  const totalMissionOfferings = financialTransmissions.reduce((acc, t) => {
    return acc + (t.breakdown.worldMissionOffering || 0) + 
      (t.breakdown.thirteenthSabbathOffering || 0) + 
      (t.breakdown.birthdayThankOffering || 0);
  }, 0);

  const totalThirteenthSabbath = financialTransmissions.reduce((acc, t) => {
    return acc + (t.breakdown.thirteenthSabbathOffering || 0);
  }, 0);

  const totalBirthdayThank = financialTransmissions.reduce((acc, t) => {
    return acc + (t.breakdown.birthdayThankOffering || 0);
  }, 0);

  // Compute Daily Lesson Study Average
  const totalStudents = classSessions.reduce((acc, s) => acc + s.attendanceCount, 0);
  const totalDailyStudy = classSessions.reduce((acc, s) => acc + s.dailyLessonStudyCount, 0);
  const dailyStudyPct = totalStudents > 0 ? Math.round((totalDailyStudy / totalStudents) * 100) : 74;

  const handleCreateEvangelism = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    onAddEvangelismProject({
      churchId: 'admin-initial',
      projectType: projType,
      title: projTitle.trim(),
      leadCoordinator: projCoordinator.trim() || 'Superintendent & Personal Ministries Leader',
      collaboratingDepartment: 'Personal Ministries & Sabbath School',
      targetDate: projTargetDate,
      status: 'planning',
      goalsAndObjectives: projGoals.trim(),
      participantsEnrolled: 0,
      decisionsCount: 0
    });
    setProjTitle('');
    setProjGoals('');
    setIsAddProjModalOpen(false);
  };

  const handleCreateGreeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!greetHosts.trim()) return;
    onAddGreetingSchedule({
      churchId: 'admin-initial',
      sabbathDate: greetDate,
      division: greetDivision,
      assignedHostesses: greetHosts.split(',').map(s => s.trim()).filter(Boolean),
      welcomeTheme: greetTheme.trim(),
      status: 'scheduled'
    });
    setGreetHosts('');
    setIsAddGreetingModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 Pillars Navigation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActivePillar('study')}
          className={`p-4 rounded-3xl text-left border transition-all ${
            activePillar === 'study'
              ? 'bg-blue-950 text-white border-blue-900 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className={`w-5 h-5 ${activePillar === 'study' ? 'text-amber-400' : 'text-blue-900'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activePillar === 'study' ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Pillar 1
            </span>
          </div>
          <h3 className="text-sm font-black tracking-tight">Study of Scripture</h3>
          <p className={`text-[11px] mt-0.5 font-medium ${activePillar === 'study' ? 'text-blue-200' : 'text-slate-400'}`}>
            Daily Bible Study & Teaching
          </p>
        </button>

        <button
          onClick={() => setActivePillar('fellowship')}
          className={`p-4 rounded-3xl text-left border transition-all ${
            activePillar === 'fellowship'
              ? 'bg-blue-950 text-white border-blue-900 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Heart className={`w-5 h-5 ${activePillar === 'fellowship' ? 'text-rose-400' : 'text-rose-600'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activePillar === 'fellowship' ? 'bg-blue-900 text-rose-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Pillar 2
            </span>
          </div>
          <h3 className="text-sm font-black tracking-tight">Fellowship</h3>
          <p className={`text-[11px] mt-0.5 font-medium ${activePillar === 'fellowship' ? 'text-blue-200' : 'text-slate-400'}`}>
            Hospitality & Greeter Rosters
          </p>
        </button>

        <button
          onClick={() => setActivePillar('outreach')}
          className={`p-4 rounded-3xl text-left border transition-all ${
            activePillar === 'outreach'
              ? 'bg-blue-950 text-white border-blue-900 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Flame className={`w-5 h-5 ${activePillar === 'outreach' ? 'text-amber-400' : 'text-amber-600'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activePillar === 'outreach' ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Pillar 3
            </span>
          </div>
          <h3 className="text-sm font-black tracking-tight">Community Outreach</h3>
          <p className={`text-[11px] mt-0.5 font-medium ${activePillar === 'outreach' ? 'text-blue-200' : 'text-slate-400'}`}>
            VBS, Branch SS, Guest Days
          </p>
        </button>

        <button
          onClick={() => setActivePillar('mission')}
          className={`p-4 rounded-3xl text-left border transition-all ${
            activePillar === 'mission'
              ? 'bg-blue-950 text-white border-blue-900 shadow-md ring-2 ring-blue-950/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Globe className={`w-5 h-5 ${activePillar === 'mission' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              activePillar === 'mission' ? 'bg-blue-900 text-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}>
              Pillar 4
            </span>
          </div>
          <h3 className="text-sm font-black tracking-tight">World Mission</h3>
          <p className={`text-[11px] mt-0.5 font-medium ${activePillar === 'mission' ? 'text-blue-200' : 'text-slate-400'}`}>
            4 Offering Streams & Global Focus
          </p>
        </button>
      </div>

      {/* PILLAR 1: STUDY OF SCRIPTURE */}
      {activePillar === 'study' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Core Purpose #1
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Study of the Scripture</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent strongly encourages weekly teachers' meetings and the daily use of age-level Sabbath School Bible study guides to maintain unity of doctrine. 
                The superintendent must also ensure that teachers are given at least 30 minutes of uninterrupted teaching time."
              </p>
            </div>
            <div className="bg-blue-950 text-white px-5 py-4 rounded-3xl text-center shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Daily Lesson Study Index</span>
              <span className="text-3xl font-black">{dailyStudyPct}%</span>
              <span className="text-[10px] text-blue-200 block mt-0.5">Conference Target: 70%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">30-Minute Guarantee</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Mandate enforced in weekly Sabbath morning run-sheet. Class teachers receive uninterrupted time free from platform announcements.
              </p>
              <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 100% Timetable Protection
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-2xl w-fit">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Doctrinal Unity</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Weekly Teachers' Preparation meetings ensure all 7 classes teach harmonious Seventh-day Adventist theological truth.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Friday Evening Preparation Active
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="p-3 bg-purple-50 text-purple-900 rounded-2xl w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Age-Appropriate Guides</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Every division—from Cradle Roll to Adult—supplied with General Conference-approved quarterly guides before quarter launch.
              </p>
              <div className="pt-2 text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> All 7 Divisions Supplied
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: FELLOWSHIP */}
      {activePillar === 'fellowship' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
                Core Purpose #2
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Fellowship & Welcome</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "Fostering a welcoming atmosphere through regular hospitality and greeting schedules. Greeters and hostesses ensure visitors and members feel Christlike warmth upon arrival."
              </p>
            </div>
            <button
              onClick={() => setIsAddGreetingModalOpen(true)}
              className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Schedule Greeting Team
            </button>
          </div>

          {/* Greeter Schedules Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {greetingSchedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                      {schedule.division}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-2">{schedule.welcomeTheme}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Sabbath: {schedule.sabbathDate}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-black uppercase">
                    {schedule.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Assigned Greeters & Hostesses:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {schedule.assignedHostesses.map((host: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Heart className="w-3 h-3 text-rose-500" />
                        {host}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 3: COMMUNITY OUTREACH */}
      {activePillar === 'outreach' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                Core Purpose #3
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Community Outreach Initiatives</h2>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                "The superintendent coordinates with the Personal Ministries department to plan joint outreach endeavors, 
                including Decision Days, Pastors’ Bible Classes, Community Guest Days, Vacation Bible Schools (VBS), and Branch Sabbath Schools (such as Neighborhood Bible Clubs and Story Hours)."
              </p>
            </div>
            <button
              onClick={() => setIsAddProjModalOpen(true)}
              className="px-4 py-3 bg-blue-950 hover:bg-black text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Launch Outreach Initiative
            </button>
          </div>

          {/* Evangelism Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evangelismProjects.map((proj) => (
              <div key={proj.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900">
                      {(proj.projectType || proj.type || 'Outreach').replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-2">{proj.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Target Launch: {proj.targetDate}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    proj.status === 'in_progress' ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
                  {proj.goalsAndObjectives || proj.notes || 'Community soul-winning and branch school ministry.'}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-blue-50/60 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Coordinators</span>
                    <span className="font-black text-blue-950">{proj.leadCoordinator || proj.coordinatorName || 'Superintendent'}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Enrolled / Attending</span>
                    <span className="font-black text-emerald-900">{(proj.participantsEnrolled ?? proj.participantsCount) || 'Registering'} Souls</span>
                  </div>
                </div>

                {((proj.decisionsCount ?? proj.decisionsOrBaptismsCount) ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-100/70 p-2.5 rounded-xl">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{(proj.decisionsCount ?? proj.decisionsOrBaptismsCount)} Baptism / Bible Study Decisions Logged!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 4: WORLD MISSION EMPHASIS */}
      {activePillar === 'mission' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Core Purpose #4
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">World Mission Emphasis & The Four Offering Streams</h2>
            <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
              "Promoting the four sacred mission offering avenues: Regular Weekly Sabbath School Offering, Thirteenth Sabbath Offering, 
              Sabbath School Investment, and Birthday-Thank Offering. 100% of these offerings are transmitted through the conference for global gospel advance."
            </p>
          </div>

          {/* 4 Offering Streams Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-black uppercase">
                <span>1. Weekly Mission</span>
                <Globe className="w-4 h-4 text-blue-900" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formatCurrency(totalMissionOfferings - totalThirteenthSabbath - totalBirthdayThank)}
              </div>
              <p className="text-[11px] text-slate-500">Supports general GC overseas missionaries and frontline projects.</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-black uppercase">
                <span>2. 13th Sabbath</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">
                {formatCurrency(totalThirteenthSabbath)}
              </div>
              <p className="text-[11px] text-slate-500">Targeted projects in Southern Asia-Pacific Division (SSD).</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-black uppercase">
                <span>3. SS Investment</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-800">
                {formatCurrency(1450)}
              </div>
              <p className="text-[11px] text-slate-500">Member-dedicated enterprise and harvest earnings for missions.</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-black uppercase">
                <span>4. Birthday-Thank</span>
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700">
                {formatCurrency(totalBirthdayThank)}
              </div>
              <p className="text-[11px] text-slate-500">Gratitude offerings for another year of divine preservation.</p>
            </div>
          </div>

          {/* Current Mission Spotlight Feature */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Quarterly Global Field Feature</span>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-full font-bold">Week 10 of 13</span>
            </div>
            <h3 className="text-xl font-black">Frontline Mission Spotlight: Church Planting in Metro Manila, Philippines</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-3xl">
              This quarter's Thirteenth Sabbath Offering directly aids the Southern Asia-Pacific Division in constructing an urban center of influence 
              and 3 new churches in Manila, alongside medical clinic equipment in Papua New Guinea. Ensure the Mission Spotlight is screened or read dynamically in Sabbath School.
            </p>
          </div>

          {/* Recent Transmissions Log Reconciled with Church Treasurer */}
          {financialTransmissions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">SDA Financial Reconciliation</span>
                  <h3 className="text-base font-black text-slate-900">Sabbath School Offerings Transmitted to Church Treasurer</h3>
                </div>
                <span className="text-xs font-black text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                  Total Reconciled: {formatCurrency(financialTransmissions.reduce((s, t) => s + t.totalAmount, 0))}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Transmitted By</th>
                      <th className="py-2 px-3">Received By</th>
                      <th className="py-2 px-3 text-right">Weekly Mission</th>
                      <th className="py-2 px-3 text-right">13th Sabbath</th>
                      <th className="py-2 px-3 text-right">Birthday-Thank</th>
                      <th className="py-2 px-3 text-right font-black">Total (ZMW)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financialTransmissions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 font-medium">
                        <td className="py-2.5 px-3 text-slate-700 font-bold">{t.sabbathDate}</td>
                        <td className="py-2.5 px-3 text-slate-600">{t.signedBySecretary}</td>
                        <td className="py-2.5 px-3 text-slate-600">{t.receivedByTreasurer}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(t.breakdown.worldMissionOffering || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                          {formatCurrency(t.breakdown.thirteenthSabbathOffering || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                          {formatCurrency(t.breakdown.birthdayThankOffering || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                          {formatCurrency(t.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD EVANGELISM PROJECT */}
      {isAddProjModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Plan Sabbath School Outreach Initiative</h3>
              <button 
                onClick={() => setIsAddProjModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvangelism} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Initiative Type (SDA Church Manual)
                </label>
                <select
                  value={projType}
                  onChange={(e) => setProjType(e.target.value as SSEvangelismProject['projectType'])}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="community_guest_day">Community Guest Day (Visitors Sabbath)</option>
                  <option value="decision_day">Sabbath School Decision Day</option>
                  <option value="pastors_bible_class">Pastor's Bible Class (Baptismal Prep)</option>
                  <option value="vacation_bible_school">Vacation Bible School (VBS - Children Outreach)</option>
                  <option value="branch_sabbath_school">Branch Sabbath School (Neighborhood Bible Club)</option>
                  <option value="neighborhood_bible_club">Story Hour & Youth Fellowship</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Initiative Title
                </label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Garden Compound Branch Sabbath School"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Target Sabbath / Launch Date
                  </label>
                  <input
                    type="date"
                    value={projTargetDate}
                    onChange={(e) => setProjTargetDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Lead Coordinator
                  </label>
                  <input
                    type="text"
                    value={projCoordinator}
                    onChange={(e) => setProjCoordinator(e.target.value)}
                    placeholder="e.g. Elder Banda & Sis. Simpasa"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Goals, Venue & Objectives
                </label>
                <textarea
                  rows={3}
                  value={projGoals}
                  onChange={(e) => setProjGoals(e.target.value)}
                  placeholder="e.g. Target 25 community children and 10 mothers through weekly Sabbath afternoon story hours."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white text-xs font-black hover:bg-black"
                >
                  Confirm Outreach Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GREETING SCHEDULE */}
      {isAddGreetingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Schedule Greeters & Hostesses</h3>
            <p className="text-xs text-slate-500 mb-4">Assign hospitality officers for warm Sabbath morning welcome.</p>

            <form onSubmit={handleCreateGreeting} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Sabbath Date
                </label>
                <input
                  type="date"
                  value={greetDate}
                  onChange={(e) => setGreetDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Station / Entrance
                </label>
                <input
                  type="text"
                  value={greetDivision}
                  onChange={(e) => setGreetDivision(e.target.value)}
                  placeholder="e.g. Main Sanctuary Foyer"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Assigned Greeters (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={greetHosts}
                  onChange={(e) => setGreetHosts(e.target.value)}
                  placeholder="Sister R. Zulu, Brother P. Mwila"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGreetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-700 text-white text-xs font-black hover:bg-rose-800"
                >
                  Assign Hospitality Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FourSpiritualPurposesView;
