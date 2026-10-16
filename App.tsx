import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Role, User, Class, Announcement, AttendanceRecord, Student, Offerings, 
  District, Church, Notification, PendingDistrictRegistration,
  ChurchMember, FamilyUnit, ChurchMeeting, ChurchOfficer, TransferRequest,
  ChurchBankAccount, OfferingEnvelope, LooseOfferingRecord, SabbathSchoolTransmission,
  DisbursementRecord, AuxiliaryDepartment, ConferenceRemittance, LiteratureOrder, AuditRecord,
  MobilisationPlanItem, ConferenceEmphases, SSCurriculumItem, SSProgramRunSheet,
  SSCouncilMember, SSAuxiliaryOfficer, SSTeacherCandidate, SSTeachersMeeting,
  SSEvangelismProject, SSGreetingSchedule, SSQuarterlyReport, SSClassSession,
  FinancialTransmission, StudyGuideOrder, ChurchStation, Conference
} from './types.ts';
import { 
  INITIAL_TEACHERS, INITIAL_CLASSES, INITIAL_FAMILY_UNITS, 
  INITIAL_MEETINGS, INITIAL_OFFICERS, INITIAL_CHURCH_MEMBERS, 
  INITIAL_TRANSFER_REQUESTS, INITIAL_TREASURER, INITIAL_BANK_ACCOUNTS,
  INITIAL_AUXILIARY_DEPARTMENTS, INITIAL_ENVELOPES, INITIAL_LOOSE_OFFERINGS,
  INITIAL_SS_TRANSMISSIONS, INITIAL_DISBURSEMENTS, INITIAL_CONFERENCE_REMITTANCES,
  INITIAL_LITERATURE_ORDERS, INITIAL_AUDIT_RECORDS,
  INITIAL_SUPERINTENDENT, INITIAL_MOBILISATION_PLAN, INITIAL_CONFERENCE_EMPHASES,
  INITIAL_CURRICULUM_INVENTORY, INITIAL_PROGRAM_RUN_SHEET, INITIAL_COUNCIL_MEMBERS,
  INITIAL_AUXILIARY_OFFICERS, INITIAL_TEACHER_CANDIDATES, INITIAL_TEACHERS_MEETINGS,
  INITIAL_EVANGELISM_PROJECTS, INITIAL_STUDY_GUIDE_ORDERS,
  INITIAL_CHURCH_ADMIN, INITIAL_CLERK, INITIAL_CHURCHES,
  INITIAL_CONFERENCES, INITIAL_DISTRICTS, INITIAL_SUPER_ADMIN,
  INITIAL_CONFERENCE_PRESIDENT, INITIAL_DISTRICT_PASTOR
} from './constants.ts';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import ClerkDashboard from './pages/ClerkDashboard.tsx';
import TeacherDashboard from './pages/TeacherDashboard.tsx';
import { ChurchAdminDashboard } from './pages/ChurchAdminDashboard.tsx';
import { TreasurerDashboard } from './pages/TreasurerDashboard.tsx';
import { SuperintendentDashboard } from './pages/SuperintendentDashboard.tsx';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import GuestListPage from './pages/GuestListPage.tsx';
import RegisterChurchPage from './pages/RegisterChurchPage.tsx';
import RegisterDistrictPage from './pages/RegisterDistrictPage.tsx';
import ConferenceDashboard from './pages/ConferenceDashboard.tsx';
import { ConferencePresidentDashboard } from './pages/ConferencePresidentDashboard.tsx';
import DistrictDashboard from './pages/DistrictDashboard.tsx';
import { DistrictPastorDashboard } from './pages/DistrictPastorDashboard.tsx';
import Navigation from './components/Navigation.tsx';
import { ClientPitchModal } from './components/ClientPitchModal.tsx';
import SDALogo from './components/SDALogo.tsx';
import { DatabaseZap } from 'lucide-react';

import { BACKEND_URL } from './config.ts';
const CHURCH_ID = (() => {
  const host = window.location.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    const parts = host.split('.');
    if (parts.length >= 3) return parts[0];
  }
  return import.meta.env.VITE_CHURCH_ID || 'demo';
})();

const withChurchHeader = (headers: Record<string, string> = {}) => ({
  ...headers,
  'x-church-id': CHURCH_ID
});

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [offerings, setOfferings] = useState<Offerings>({
    weeklyMission: 0,
    thirteenthSabbath: 0,
    birthdayThank: 0,
    investmentFund: 0
  });
  const [conferences, setConferences] = useState<Conference[]>(INITIAL_CONFERENCES);
  const [districts, setDistricts] = useState<District[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [pendingDistrictRegs, setPendingDistrictRegs] = useState<PendingDistrictRegistration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isClerkManageOpen, setIsClerkManageOpen] = useState(false);
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [resetRequests, setResetRequests] = useState<{ id: string; name: string; email: string; requestedAt: string }[]>([]);

  // -------------------------------------------------------------
  // NEW STAFF & ADVANCED MODULES STATE (from sda-mis)
  // -------------------------------------------------------------
  const [activeChurchId, setActiveChurchId] = useState<string>('church-woodlands');
  const [superAdmins, setSuperAdmins] = useState<User[]>([INITIAL_SUPER_ADMIN]);
  const [conferencePresidents, setConferencePresidents] = useState<User[]>([INITIAL_CONFERENCE_PRESIDENT]);
  const [districtPastors, setDistrictPastors] = useState<User[]>([INITIAL_DISTRICT_PASTOR]);
  const [churchAdmins, setChurchAdmins] = useState<User[]>([INITIAL_CHURCH_ADMIN]);
  const [clerks, setClerks] = useState<User[]>([INITIAL_CLERK]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(INITIAL_TRANSFER_REQUESTS);
  const [churchMembers, setChurchMembers] = useState<ChurchMember[]>(INITIAL_CHURCH_MEMBERS);
  const [familyUnits, setFamilyUnits] = useState<FamilyUnit[]>(INITIAL_FAMILY_UNITS);
  const [meetings, setMeetings] = useState<ChurchMeeting[]>(INITIAL_MEETINGS);
  const [officers, setOfficers] = useState<ChurchOfficer[]>(INITIAL_OFFICERS);

  // Treasury State
  const [treasurers, setTreasurers] = useState<User[]>([INITIAL_TREASURER]);
  const [bankAccounts, setBankAccounts] = useState<ChurchBankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [remittances, setRemittances] = useState<ConferenceRemittance[]>(INITIAL_CONFERENCE_REMITTANCES);
  const [ssTransmissions, setSsTransmissions] = useState<SabbathSchoolTransmission[]>(INITIAL_SS_TRANSMISSIONS);
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>(INITIAL_DISBURSEMENTS);
  const [auxiliaryDepartments, setAuxiliaryDepartments] = useState<AuxiliaryDepartment[]>(INITIAL_AUXILIARY_DEPARTMENTS);
  const [envelopes, setEnvelopes] = useState<OfferingEnvelope[]>(INITIAL_ENVELOPES);
  const [looseOfferings, setLooseOfferings] = useState<LooseOfferingRecord[]>(INITIAL_LOOSE_OFFERINGS);
  const [literatureOrders, setLiteratureOrders] = useState<LiteratureOrder[]>(INITIAL_LITERATURE_ORDERS);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(INITIAL_AUDIT_RECORDS);

  // Superintendent State
  const [superintendents, setSuperintendents] = useState<User[]>([INITIAL_SUPERINTENDENT]);
  const [mobilisationPlan, setMobilisationPlan] = useState<MobilisationPlanItem[]>(INITIAL_MOBILISATION_PLAN);
  const [conferenceEmphases, setConferenceEmphases] = useState<ConferenceEmphases>(INITIAL_CONFERENCE_EMPHASES);
  const [curriculumInventory, setCurriculumInventory] = useState<SSCurriculumItem[]>(INITIAL_CURRICULUM_INVENTORY);
  const [programRunSheet, setProgramRunSheet] = useState<SSProgramRunSheet>(INITIAL_PROGRAM_RUN_SHEET);
  const [councilMembers, setCouncilMembers] = useState<SSCouncilMember[]>(INITIAL_COUNCIL_MEMBERS);
  const [auxiliaryOfficers, setAuxiliaryOfficers] = useState<SSAuxiliaryOfficer[]>(INITIAL_AUXILIARY_OFFICERS);
  const [teacherCandidates, setTeacherCandidates] = useState<SSTeacherCandidate[]>(INITIAL_TEACHER_CANDIDATES);
  const [teachersMeetings, setTeachersMeetings] = useState<SSTeachersMeeting[]>(INITIAL_TEACHERS_MEETINGS);
  const [evangelismProjects, setEvangelismProjects] = useState<SSEvangelismProject[]>(INITIAL_EVANGELISM_PROJECTS);
  const [greetingSchedules, setGreetingSchedules] = useState<SSGreetingSchedule[]>([
    {
      id: 'gs-1',
      churchId: 'admin-initial',
      sabbathDate: '2026-09-12',
      division: 'Main Sanctuary Foyer',
      assignedHostesses: ['Sister M. Kalunga (Head Greeter)', 'Brother B. Zulu', 'Sister S. Jenkins'],
      welcomeTheme: 'Rooted in Christ’s Love: A Warm Sabbath Welcome to All Guests',
      status: 'scheduled'
    },
    {
      id: 'gs-2',
      churchId: 'admin-initial',
      sabbathDate: '2026-09-19',
      division: 'Children & Youth Wing Entrance',
      assignedHostesses: ['Sister Alice Walker', 'Brother T. Silwimba'],
      welcomeTheme: 'Youth & Children Welcome with Memory Verse Cards',
      status: 'scheduled'
    }
  ]);
  const [quarterlyReport, setQuarterlyReport] = useState<SSQuarterlyReport>({
    id: 'rep-q3-2026',
    churchId: 'admin-initial',
    quarter: 'Q3',
    year: 2026,
    totalEnrollment: 320,
    averageAttendance: 283,
    dailyStudyPercentage: 78,
    missionOfferingsTotal: 28450,
    branchSabbathSchoolsCount: 2,
    baptismsFromSS: 14,
    isClassRegisterAudited: true,
    isDailyStudyCalculated: true,
    isOfferingsReconciled: true,
    isSuperintendentSigned: true,
    isSecretarySigned: true,
    isTransmittedToConference: false,
  });
  const [classSessions, setClassSessions] = useState<SSClassSession[]>([
    {
      id: 'cs-1',
      classId: 'c1',
      className: 'Adult Sabbath School',
      date: '2026-09-05',
      attendanceCount: 45,
      dailyLessonStudyCount: 36,
      missionOfferingAmount: 850,
      teacherName: 'Elder Musonda'
    },
    {
      id: 'cs-2',
      classId: 'c2',
      className: 'Youth Ministry',
      date: '2026-09-05',
      attendanceCount: 28,
      dailyLessonStudyCount: 22,
      missionOfferingAmount: 420,
      teacherName: 'Sister Chanda'
    },
    {
      id: 'cs-3',
      classId: 'c3',
      className: 'Primary Class',
      date: '2026-09-05',
      attendanceCount: 22,
      dailyLessonStudyCount: 19,
      missionOfferingAmount: 260,
      teacherName: 'Brother Mwale'
    }
  ]);
  const [studyGuideOrders, setStudyGuideOrders] = useState<StudyGuideOrder[]>(INITIAL_STUDY_GUIDE_ORDERS);

  // Initial Data Load from Database
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      try {
        // Check backend connection
        const healthResponse = await fetch(`${BACKEND_URL}/health`, {
          headers: withChurchHeader()
        });
        if (healthResponse.ok) {
          setIsBackendConnected(true);
          setDbError(null);
          
          // Load users (teachers) from database
          const usersResponse = await fetch(`${BACKEND_URL}/users`, {
            headers: withChurchHeader()
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const teachersData = usersData.filter((user: User) => user.role === Role.TEACHER);
            const adminsData = usersData.filter((user: User) => user.role === Role.CLERK);
            setAdmins(adminsData);
            setTeachers(teachersData.length > 0 ? teachersData : INITIAL_TEACHERS);
          }
          
          // Load classes from database (with students)
          const classesResponse = await fetch(`${BACKEND_URL}/classes`, {
            headers: withChurchHeader()
          });
          if (classesResponse.ok) {
            const classesData = await classesResponse.json();
            if (Array.isArray(classesData) && classesData.length > 0) {
              setClasses(classesData);
            } else {
              setClasses(INITIAL_CLASSES);
            }
          }
          
          // Load announcements from database (hierarchical feed)
          const savedUserRaw = localStorage.getItem('sda_current_user');
          let scopedFeedUrl = `${BACKEND_URL}/announcements/my-feed`;
          let scopedNotifUrl = `${BACKEND_URL}/notifications`;
          if (savedUserRaw) {
            try {
              const uObj = JSON.parse(savedUserRaw);
              scopedFeedUrl += `?churchId=${uObj.churchId || ''}&districtId=${uObj.districtId || ''}&conferenceId=${uObj.conferenceId || ''}`;
              scopedNotifUrl += `?churchId=${uObj.churchId || ''}&districtId=${uObj.districtId || ''}&conferenceId=${uObj.conferenceId || ''}&userId=${uObj.id}`;
            } catch (e) {}
          }
          
          const announcementsResponse = await fetch(scopedFeedUrl, {
            headers: withChurchHeader()
          });
          if (announcementsResponse.ok) {
            const announcementsData = await announcementsResponse.json();
            setAnnouncements(announcementsData);
          }

          // Load notifications from database
          const notificationsResponse = await fetch(scopedNotifUrl, {
            headers: withChurchHeader()
          });
          if (notificationsResponse.ok) {
            const notifsData = await notificationsResponse.json();
            setNotifications(notifsData);
          }

          // Load districts and churches
          const districtsResponse = await fetch(`${BACKEND_URL}/admin/districts`, {
            headers: withChurchHeader()
          });
          if (districtsResponse.ok) {
            const districtsData = await districtsResponse.json();
            setDistricts(districtsData);
            const allChurches = districtsData.flatMap((d: any) => d.churches || []);
            setChurches(allChurches.length > 0 ? allChurches : (INITIAL_CHURCHES as any));
          } else {
            setDistricts(INITIAL_DISTRICTS);
            setChurches(INITIAL_CHURCHES as any);
          }

          // Load pending district registrations
          try {
            const distRegRes = await fetch(`${BACKEND_URL}/admin/district-registrations/pending`, {
              headers: withChurchHeader()
            });
            if (distRegRes.ok) {
              setPendingDistrictRegs(await distRegRes.json());
            }
          } catch (e) {}

          // Load offerings from database
          const offeringsResponse = await fetch(`${BACKEND_URL}/offerings`, {
            headers: withChurchHeader()
          });
          if (offeringsResponse.ok) {
            const offeringsData = await offeringsResponse.json();
            setOfferings(offeringsData);
          }
          
          // Load attendance records
          const attendanceResponse = await fetch(`${BACKEND_URL}/attendance`, {
            headers: withChurchHeader()
          });
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            setAttendanceRecords(attendanceData);
          }
        } else {
          // Fallback to local storage if backend is not available
          setIsBackendConnected(false);
          loadFromLocalStorage();
        }
      } catch (err: any) {
        console.warn("Backend not accessible, loading from local storage:", err.message);
        setIsBackendConnected(false);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem('sda_registry_full_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setAdmins(parsed.admins || []);
          setTeachers(parsed.teachers || INITIAL_TEACHERS);
          setClasses(parsed.classes || INITIAL_CLASSES);
          setAnnouncements(parsed.announcements || []);
          setAttendanceRecords(parsed.attendanceRecords || []);
          setOfferings(parsed.offerings || {
            weeklyMission: 0,
            thirteenthSabbath: 0,
            birthdayThank: 0,
            investmentFund: 0
          });
          setDistricts(parsed.districts || INITIAL_DISTRICTS);
          setChurches(parsed.churches || (INITIAL_CHURCHES as any));
          if (parsed.churchMembers) setChurchMembers(parsed.churchMembers);
          if (parsed.familyUnits) setFamilyUnits(parsed.familyUnits);
          if (parsed.transferRequests) setTransferRequests(parsed.transferRequests);
          if (parsed.meetings) setMeetings(parsed.meetings);
          if (parsed.officers) setOfficers(parsed.officers);
          if (parsed.bankAccounts) setBankAccounts(parsed.bankAccounts);
          if (parsed.remittances) setRemittances(parsed.remittances);
          if (parsed.disbursements) setDisbursements(parsed.disbursements);
          if (parsed.envelopes) setEnvelopes(parsed.envelopes);
          if (parsed.looseOfferings) setLooseOfferings(parsed.looseOfferings);
          if (parsed.studyGuideOrders) setStudyGuideOrders(parsed.studyGuideOrders);
        } else {
          setTeachers(INITIAL_TEACHERS);
          setClasses(INITIAL_CLASSES);
          setDistricts(INITIAL_DISTRICTS);
          setChurches(INITIAL_CHURCHES as any);
        }

        const savedUser = localStorage.getItem('sda_current_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          setCurrentUser(u);
          if (u.churchId) setActiveChurchId(u.churchId);
        }

        const savedReqs = localStorage.getItem('sda_reset_requests');
        if (savedReqs) {
          setResetRequests(JSON.parse(savedReqs));
        }
      } catch (e) {
        console.error("Local storage load error:", e);
      }
    };

    initializeApp();
  }, []);

  // Save to LocalStorage Backup
  useEffect(() => {
    if (!isLoading) {
      const fullData = {
        admins,
        teachers,
        classes,
        announcements,
        attendanceRecords,
        offerings,
        districts,
        churches,
        churchMembers,
        familyUnits,
        transferRequests,
        meetings,
        officers,
        bankAccounts,
        remittances,
        disbursements,
        envelopes,
        looseOfferings,
        studyGuideOrders
      };
      localStorage.setItem('sda_registry_full_data', JSON.stringify(fullData));
    }
  }, [
    admins, teachers, classes, announcements, attendanceRecords, offerings, 
    districts, churches, churchMembers, familyUnits, transferRequests, 
    meetings, officers, bankAccounts, remittances, disbursements, 
    envelopes, looseOfferings, studyGuideOrders, isLoading
  ]);

  // Sync Data Effect (backend)
  useEffect(() => {
    if (isLoading || dbError || !isBackendConnected) return;

    const syncData = async () => {
      const dataToSync = { 
        admins,
        teachers,
        classes,
        announcements,
        attendanceRecords,
        offerings
      };

      if (isBackendConnected) {
        try {
          const res = await fetch(`${BACKEND_URL}/sync`, {
            method: 'POST',
            headers: withChurchHeader({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(dataToSync),
          });

          if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.message || "Sync failed");
          }

          setDbError(null);
        } catch (err: any) {
          console.error("❌ SYNC FAILURE:", err);
          setDbError("Sync failed: " + err.message);
        }
      }
    };

    const debounceSync = setTimeout(syncData, 1000);
    return () => clearTimeout(debounceSync);
  }, [admins, teachers, classes, announcements, attendanceRecords, offerings, isBackendConnected, isLoading, dbError]);

  const handleSignup = async (user: User) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/users/register`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...user, churchId: CHURCH_ID }),
        });
        if (response.ok) {
          setAdmins(prev => [...prev, user]);
        }
      } catch (err) {
        console.error('Registration failed:', err);
        setAdmins(prev => [...prev, user]);
      }
    } else {
      setAdmins(prev => [...prev, user]);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sda_current_user', JSON.stringify(user));
    if (user.churchId) {
      setActiveChurchId(user.churchId);
    }
    
    if (isBackendConnected) {
      fetch(`${BACKEND_URL}/users/${user.id}/last-login`, {
        method: 'PUT',
        headers: withChurchHeader()
      }).catch(err => console.error('Failed to update last login:', err));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sda_current_user');
    setIsClerkManageOpen(false);
    setIsTeacherProfileOpen(false);
  };

  const requestTeacherReset = (email: string) => {
    const teacher = teachers.find(t => t.email?.toLowerCase() === email.toLowerCase());
    if (!teacher) return false;

    const newRequest = {
      id: `req-${Date.now()}`,
      name: teacher.name,
      email: teacher.email,
      requestedAt: new Date().toISOString()
    };

    setResetRequests(prev => {
      const next = [newRequest, ...prev];
      localStorage.setItem('sda_reset_requests', JSON.stringify(next));
      return next;
    });
    return true;
  };

  const resolveResetRequest = (id: string) => {
    setResetRequests(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('sda_reset_requests', JSON.stringify(next));
      return next;
    });
  };

  const requestClerkResetEmail = async (email: string) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ email }),
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to request clerk reset email:', err);
        return false;
      }
    }
    return false;
  };

  const handleRegisterChurch = async (churchData: any) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/churches/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(churchData)
        });
        if (response.ok) {
          setChurches(prev => [...prev, { ...churchData, status: 'pending', membership: Number(churchData.membership) || 0 }]);
          return true;
        }
      } catch (err) {
        console.error('Failed to register church:', err);
      }
      return false;
    }
    setChurches(prev => [...prev, { ...churchData, status: 'pending', membership: Number(churchData.membership) || 0 }]);
    return true;
  };

  const handleCreateDistrict = async (districtData: { name: string; conferenceId: string }) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/districts`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(districtData),
        });
        if (response.ok) {
          const newDistrict = await response.json();
          setDistricts(prev => [...prev, newDistrict]);
          return true;
        }
      } catch (err) {
        console.error('Failed to create district:', err);
      }
      return false;
    }
    const newDistrict: District = {
      id: `dist_${Date.now()}`,
      name: districtData.name,
      conferenceId: districtData.conferenceId,
      is_active: true,
      created_at: new Date().toISOString()
    };
    setDistricts(prev => [...prev, newDistrict]);
    return true;
  };

  const handleUpdateDistrict = async (districtId: string, updates: Partial<District>) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/districts/${districtId}`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(updates),
        });
        if (response.ok) {
          setDistricts(prev => prev.map(d => d.id === districtId ? { ...d, ...updates } : d));
          return true;
        }
      } catch (err) {
        console.error('Failed to update district:', err);
      }
      return false;
    }
    setDistricts(prev => prev.map(d => d.id === districtId ? { ...d, ...updates } : d));
    return true;
  };

  const handleApproveChurch = async (churchId: string) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/churches/${churchId}/approve`, {
          method: 'POST',
          headers: withChurchHeader()
        });
        if (response.ok) {
          setChurches(prev => prev.map(c => c.id === churchId ? { ...c, status: 'approved' } : c));
          return true;
        }
      } catch (err) {
        console.error('Failed to approve church:', err);
      }
      return false;
    }
    setChurches(prev => prev.map(c => c.id === churchId ? { ...c, status: 'approved' } : c));
    return true;
  };

  const handleApproveDistrictReg = async (registrationId: string) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/district-registrations/${registrationId}/approve`, {
          method: 'POST',
          headers: withChurchHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setPendingDistrictRegs(prev => prev.filter(r => r.id !== registrationId));
          if (data.district) {
            setDistricts(prev => [...prev, data.district]);
          }
          return true;
        }
      } catch (err) {
        console.error('Failed to approve district registration:', err);
      }
      return false;
    }
    const reg = pendingDistrictRegs.find(r => r.id === registrationId);
    if (reg) {
      setPendingDistrictRegs(prev => prev.filter(r => r.id !== registrationId));
      const newDist: District = {
        id: `dist_${Date.now()}`,
        name: reg.districtName,
        conferenceId: reg.conferenceId,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setDistricts(prev => [...prev, newDist]);
    }
    return true;
  };

  const handlePublishAnnouncement = async (announcementData: {
    content: string;
    targetType: 'CONFERENCE' | 'DISTRICT' | 'CHURCH';
    targetId: string;
    priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
    expiryDate?: string;
  }) => {
    if (!currentUser) return false;

    const payload = {
      ...announcementData,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role
    };

    if (isBackendConnected) {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/announcements`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newAnn = await res.json();
          setAnnouncements(prev => [newAnn, ...prev]);
          return true;
        }
      } catch (err) {
        console.error('Failed to publish announcement:', err);
      }
      return false;
    }

    const localAnn: Announcement = {
      id: `ann_${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      className: currentUser.role,
      content: announcementData.content,
      timestamp: new Date().toISOString(),
      status: 'pending',
      targetType: announcementData.targetType,
      targetId: announcementData.targetId,
      priority: announcementData.priority || 'NORMAL',
      expiryDate: announcementData.expiryDate
    };
    setAnnouncements(prev => [localAnn, ...prev]);
    return true;
  };

  const handleAdminUpdateUser = async (userId: string, updates: Partial<User>) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/users/${userId}`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          setTeachers(prev => prev.map(t => t.id === userId ? { ...t, ...updates } : t));
          setAdmins(prev => prev.map(a => a.id === userId ? { ...a, ...updates } : a));
          return true;
        }
      } catch (err) {
        console.error('Failed to update user via admin:', err);
      }
      return false;
    }
    setTeachers(prev => prev.map(t => t.id === userId ? { ...t, ...updates } : t));
    setAdmins(prev => prev.map(a => a.id === userId ? { ...a, ...updates } : a));
    return true;
  };

  const handleForceChangePassword = async (userId: string, newPass: string) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${BACKEND_URL}/users/change-password-force`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newPassword: newPass })
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    }
    return true;
  };

  const handleMarkNotificationRead = async (id: string) => {
    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
          method: 'PUT',
          headers: withChurchHeader()
        });
      } catch (e) {}
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addTeacher = async (name: string, email: string, password: string, classId: string, language?: string) => {
    const newId = `t${Date.now()}`;
    const newTeacher: User = {
      id: newId,
      name,
      email,
      password,
      role: Role.TEACHER,
      assignedClass: classId,
      language: language || 'English',
      churchName: currentUser?.churchName || 'Woodlands SDA Church',
      churchId: currentUser?.churchId || activeChurchId
    };

    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/users/create-teacher`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            name,
            email,
            password,
            classId,
            language: language || 'English',
            churchId: currentUser?.churchId || CHURCH_ID
          }),
        });

        if (response.ok) {
          const createdTeacher = await response.json();
          setTeachers(prev => [...prev, createdTeacher]);
          setClasses(prev => prev.map(c => {
            if (c.id === classId) {
              return { 
                ...c, 
                teacherId: createdTeacher.id, 
                language: language || c.language, 
                churchId: currentUser?.churchId || CHURCH_ID 
              };
            }
            return c;
          }));
          return;
        }
      } catch (err) {
        console.error('Failed to create teacher in database:', err);
      }
    }

    setTeachers(prev => [...prev, newTeacher]);
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const isAdult = c.name.toLowerCase().includes('adult');
        const baseName = c.name.split(' (')[0];
        const newName = (isAdult && language) ? `${baseName} (${language})` : c.name;
        return { 
          ...c, 
          name: newName,
          teacherId: newId, 
          language: language || c.language, 
          churchId: currentUser?.id 
        };
      }
      return c;
    }));
  };

  const addClass = async (name: string, language: string) => {
    const newId = `c${Date.now()}`;
    const newClass: Class = {
      id: newId,
      name,
      teacherId: '',
      students: [],
      language: language || 'English',
      churchId: currentUser?.churchId || CHURCH_ID
    };

    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/classes`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...newClass, churchId: CHURCH_ID }),
        });
        if (response.ok) {
          const savedClass = await response.json();
          setClasses(prev => [...prev, savedClass]);
          return;
        }
      } catch (err) {
        console.error('Failed to save class to database:', err);
      }
    }
    setClasses(prev => [...prev, newClass]);
  };

  const notifyTeachersNextSabbath = async (message: string, sabbathDate: string, recipients?: string[]): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/notifications/next-sabbath`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ message, sabbathDate, recipients }),
        });
        return response.ok;
      } catch (err) {
        console.error('Failed to send broadcast emails:', err);
        return false;
      }
    }
    return true;
  };

  const updateTeacherPassword = async (teacherId: string, newPassword: string) => {
    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/users/${teacherId}/password`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ password: newPassword }),
        });
      } catch (err) {
        console.error('Failed to update password:', err);
      }
    }
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, password: newPassword } : t));
    setAdmins(prev => prev.map(a => a.id === teacherId ? { ...a, password: newPassword } : a));
    
    if (currentUser?.id === teacherId) {
      const updated = { ...currentUser, password: newPassword } as User;
      setCurrentUser(updated);
      localStorage.setItem('sda_current_user', JSON.stringify(updated));
    }
  };

  const removeTeacher = async (teacherId: string) => {
    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/users/${teacherId}`, {
          method: 'DELETE',
          headers: withChurchHeader()
        });
      } catch (err) {
        console.error('Failed to delete teacher from database:', err);
      }
    }
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    setClasses(prev => prev.map(c => c.teacherId === teacherId ? { ...c, teacherId: '' } : c));
  };

  const assignTeacherToClass = async (teacherId: string, classId: string, language?: string) => {
    const targetClass = classes.find(c => c.id === classId);
    const nextLanguage = language || targetClass?.language || 'English';

    setClasses(prev => prev.map(c => {
      if (c.teacherId === teacherId) {
        return { ...c, teacherId: '' };
      }
      if (c.id === classId) {
        return { ...c, teacherId: teacherId, language: nextLanguage };
      }
      return c;
    }));

    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        return { ...t, assignedClass: classId, language: nextLanguage };
      }
      return t;
    }));

    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/classes/${classId}/teacher`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ teacherId, language: nextLanguage }),
        });
        await fetch(`${BACKEND_URL}/users/${teacherId}/assignment`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ assignedClass: classId, language: nextLanguage }),
        });
      } catch (err) {
        console.error('Failed to assign teacher to class:', err);
      }
    }
  };

  const addStudentToClass = async (classId: string, studentData: Omit<Student, 'id' | 'classId'>) => {
    const newStudent: Student = {
      id: `s${Date.now()}`,
      name: studentData.name,
      classId: classId,
      attendanceStatus: studentData.attendanceStatus || 'unmarked',
      lessonStudied: studentData.lessonStudied || false,
      attendanceNote: studentData.attendanceNote || undefined,
      email: studentData.email,
      phone: studentData.phone,
      address: studentData.address,
      age: studentData.age,
      gender: studentData.gender,
      baptized: studentData.baptized,
      member_since: studentData.member_since,
      emergency_contact: studentData.emergency_contact,
      medical_notes: studentData.medical_notes
    };
    
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/students`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...newStudent, churchId: CHURCH_ID }),
        });
        if (response.ok) {
          const savedStudent = await response.json();
          setClasses(prev => prev.map(c => {
            if (c.id === classId) {
              return { ...c, students: [...c.students, savedStudent] };
            }
            return c;
          }));
          return;
        }
      } catch (err) {
        console.error('Failed to add student to database:', err);
      }
    }

    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, students: [...c.students, newStudent] };
      }
      return c;
    }));
  };

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/students/${studentId}`, {
          method: 'DELETE',
          headers: withChurchHeader()
        });
      } catch (err) {
        console.error('Failed to delete student from database:', err);
      }
    }

    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, students: c.students.filter(s => s.id !== studentId) };
      }
      return c;
    }));
  };

  const updateStudentDetails = async (classId: string, student: Student) => {
    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/students/${student.id}`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            name: student.name,
            email: student.email,
            phone: student.phone,
            address: student.address,
            age: student.age,
            gender: student.gender,
            baptized: student.baptized,
            member_since: student.member_since,
            emergency_contact: student.emergency_contact,
            medical_notes: student.medical_notes
          })
        });
      } catch (err) {
        console.error('Failed to update student in database:', err);
      }
    }

    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          students: c.students.map(s => (s.id === student.id ? { ...s, ...student } : s))
        };
      }
      return c;
    }));
  };

  const submitAnnouncement = async (announcement: Announcement) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/announcements`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...announcement, churchId: CHURCH_ID }),
        });
        if (response.ok) {
          const savedAnnouncement = await response.json();
          setAnnouncements(prev => [savedAnnouncement, ...prev]);
          return;
        }
      } catch (err) {
        console.error('Failed to save announcement to database:', err);
      }
    }
    
    setAnnouncements(prev => [announcement, ...prev]);
  };

  const submitAttendance = async (record: AttendanceRecord) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/attendance`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...record, churchId: CHURCH_ID }),
        });
        if (response.ok) {
          const savedRecord = await response.json();
          setAttendanceRecords(prev => [savedRecord, ...prev]);
          
          await fetch(`${BACKEND_URL}/students/attendance`, {
            method: 'PUT',
            headers: withChurchHeader({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ 
              classId: record.classId, 
              students: record.records 
            }),
          });
          
          const classesResponse = await fetch(`${BACKEND_URL}/classes`, {
            headers: withChurchHeader()
          });
          if (classesResponse.ok) {
            const classesData = await classesResponse.json();
            setClasses(classesData);
          }
          return;
        }
      } catch (err) {
        console.error('Failed to save attendance to database:', err);
      }
    }

    setAttendanceRecords(prev => [record, ...prev]);
    setClasses(prev => prev.map(c => {
      if (c.id === record.classId) {
        return { ...c, students: record.records };
      }
      return c;
    }));
  };

  // -------------------------------------------------------------
  // HANDLERS FOR NEW FEATURES & STAFF
  // -------------------------------------------------------------
  
  // Super Admin
  const handleAddConference = (newConf: Conference, newPres: User) => {
    setConferences(prev => {
      const exists = prev.some(c => c.id === newConf.id);
      return exists ? prev.map(c => c.id === newConf.id ? newConf : c) : [...prev, newConf];
    });
    setConferencePresidents(prev => [...prev.filter(p => p.id !== newPres.id), newPres]);
  };

  // Church Admin (First Elder)
  const handleAddOfficerByElder = (officerData: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    assignedClass?: string;
    language?: string;
    title?: string;
    churchName?: string;
  }) => {
    const newId = `${officerData.role.toLowerCase()}-${Date.now()}`;
    const newOfficer: User = {
      id: newId,
      name: officerData.name,
      email: officerData.email,
      password: officerData.password,
      role: officerData.role,
      phone: officerData.phone,
      title: officerData.title,
      churchId: currentUser?.churchId || activeChurchId,
      churchName: officerData.churchName || currentUser?.churchName || 'Woodlands SDA Church',
      assignedClass: officerData.assignedClass,
      language: officerData.language,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (officerData.role === Role.CLERK) {
      setClerks(prev => [...prev, newOfficer]);
      setAdmins(prev => [...prev, newOfficer]);
    } else if (officerData.role === Role.SUPERINTENDENT) {
      setSuperintendents(prev => [...prev, newOfficer]);
    } else if (officerData.role === Role.TREASURER) {
      setTreasurers(prev => [...prev, newOfficer]);
    } else if (officerData.role === Role.TEACHER) {
      setTeachers(prev => [...prev, newOfficer]);
      if (officerData.assignedClass) {
        setClasses(prev => prev.map(c => {
          if (c.id === officerData.assignedClass) {
            return {
              ...c,
              teacherId: newId,
              language: officerData.language || c.language
            };
          }
          return c;
        }));
      }
    } else if (officerData.role === Role.CHURCH_ADMIN) {
      setChurchAdmins(prev => [...prev, newOfficer]);
      setAdmins(prev => [...prev, newOfficer]);
    }
  };

  const handleUpdateOfficerByElder = (userId: string, updates: Partial<User>) => {
    setClerks(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    setAdmins(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    setSuperintendents(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    setTreasurers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    setTeachers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    setChurchAdmins(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteOfficerByElder = (userId: string) => {
    setClerks(prev => prev.filter(u => u.id !== userId));
    setAdmins(prev => prev.filter(u => u.id !== userId));
    setSuperintendents(prev => prev.filter(u => u.id !== userId));
    setTreasurers(prev => prev.filter(u => u.id !== userId));
    setTeachers(prev => prev.filter(u => u.id !== userId));
    setChurchAdmins(prev => prev.filter(u => u.id !== userId));
  };

  const updateTeacher = (teacherId: string, updates: Partial<User>) => {
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, ...updates } : t));
    if (updates.assignedClass || updates.language) {
      setClasses(prev => prev.map(c => {
        if (c.teacherId === teacherId) {
          return { 
            ...c, 
            id: updates.assignedClass || c.id,
            language: updates.language || c.language 
          };
        }
        return c;
      }));
    }
  };

  // Clerk Extended Handlers (Members, Families, Transfers, Governance)
  const addChurchMember = (member: Omit<ChurchMember, 'id' | 'churchId'>) => {
    if (!currentUser) return;
    const newMember: ChurchMember = {
      ...member,
      id: `m-${Date.now()}`,
      churchId: currentUser.churchId || activeChurchId
    };
    setChurchMembers(prev => [...prev, newMember]);
  };

  const updateChurchMember = (memberId: string, updates: Partial<ChurchMember>) => {
    setChurchMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
  };

  const deleteChurchMember = (memberId: string) => {
    setChurchMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const addFamilyUnit = (fam: Omit<FamilyUnit, 'id' | 'churchId'>) => {
    if (!currentUser) return;
    const newFam: FamilyUnit = {
      ...fam,
      id: `fam-${Date.now()}`,
      churchId: currentUser.churchId || activeChurchId
    };
    setFamilyUnits(prev => [...prev, newFam]);
  };

  const updateFamilyUnit = (id: string, updates: Partial<FamilyUnit>) => {
    setFamilyUnits(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFamilyUnit = (id: string) => {
    setFamilyUnits(prev => prev.filter(f => f.id !== id));
  };

  const addMeeting = (meeting: Omit<ChurchMeeting, 'id' | 'churchId'>) => {
    if (!currentUser) return;
    const newM: ChurchMeeting = {
      ...meeting,
      id: `meet-${Date.now()}`,
      churchId: currentUser.churchId || activeChurchId
    };
    setMeetings(prev => [...prev, newM]);
  };

  const updateMeeting = (id: string, updates: Partial<ChurchMeeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const addOfficer = (officer: Omit<ChurchOfficer, 'id' | 'churchId'>) => {
    if (!currentUser) return;
    const newO: ChurchOfficer = {
      ...officer,
      id: `off-${Date.now()}`,
      churchId: currentUser.churchId || activeChurchId
    };
    setOfficers(prev => [...prev, newO]);
  };

  const updateOfficer = (id: string, updates: Partial<ChurchOfficer>) => {
    setOfficers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOfficer = (id: string) => {
    setOfficers(prev => prev.filter(o => o.id !== id));
  };

  const initiateTransfer = (studentId: string, studentName: string, toChurchId: string, toChurchName: string, reason?: string) => {
    if (!currentUser) return;
    
    const newRequest: TransferRequest = {
      id: `tr-${Date.now()}`,
      studentId,
      studentName,
      fromChurchId: currentUser.id,
      fromChurchName: currentUser.churchName || 'Unknown Church',
      toChurchId,
      toChurchName,
      status: 'pending',
      requestDate: new Date().toISOString(),
      reason
    };

    setTransferRequests(prev => [...prev, newRequest]);
    
    // Mark student as transferring in their current class
    setClasses(prev => prev.map(c => ({
      ...c,
      students: c.students.map(s => s.id === studentId ? { ...s, isTransferring: true } : s)
    })));
  };

  const updateTransferStatus = (requestId: string, status: TransferRequest['status']) => {
    setTransferRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    
    if (status === 'approved') {
      const request = transferRequests.find(r => r.id === requestId);
      if (request) {
        let studentToMove: Student | null = null;
        let oldClassId: string | null = null;

        classes.forEach(c => {
          const found = c.students.find(s => s.id === request.studentId);
          if (found) {
            studentToMove = found;
            oldClassId = c.id;
          }
        });

        if (studentToMove && oldClassId) {
          setClasses(prev => prev.map(c => {
            if (c.id === oldClassId) {
              return { ...c, students: c.students.filter(s => s.id !== request.studentId) };
            }
            return c;
          }));

          const targetClerk = admins.find(a => a.id === request.toChurchId);
          if (targetClerk) {
            let targetClass = classes.find(c => c.churchId === request.toChurchId);
            
            if (!targetClass) {
              const newClassId = `c-transferred-${request.toChurchId}`;
              targetClass = {
                id: newClassId,
                name: 'Transferred Members',
                teacherId: '',
                students: [],
                churchId: request.toChurchId
              };
              setClasses(prev => [...prev, targetClass!]);
            }

            const movedStudent: Student = {
              ...(studentToMove as unknown as Student),
              classId: targetClass.id,
              isTransferring: false,
              attendanceStatus: 'unmarked'
            };
            
            setClasses(prev => prev.map(c => {
              if (c.id === targetClass!.id) {
                return { ...c, students: [...c.students, movedStudent] };
              }
              return c;
            }));
          }
        }
      }
    }
  };

  const updateTransferStage = (requestId: string, status: TransferRequest['status'], extra?: Partial<TransferRequest>) => {
    setTransferRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status, ...(extra || {}) };
      }
      return r;
    }));

    if (status === 'approved') {
      updateTransferStatus(requestId, 'approved');
    }
  };

  // Treasury Handlers
  const handleAddBankAccount = (acc: Omit<ChurchBankAccount, 'id' | 'churchId'>) => {
    const newAccount: ChurchBankAccount = {
      ...acc,
      id: `acc-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
    };
    setBankAccounts(prev => [newAccount, ...prev]);
  };

  const handleReconcileAccount = (id: string, date: string, statementBal: number) => {
    setBankAccounts(prev => prev.map(a => a.id === id ? {
      ...a,
      lastReconciledDate: date,
      currentBalance: statementBal
    } : a));
  };

  const handleCompileRemittance = (remittance: Omit<ConferenceRemittance, 'id' | 'churchId'>) => {
    const newRemit: ConferenceRemittance = {
      ...remittance,
      id: `remit-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
    };
    setRemittances(prev => [newRemit, ...prev]);
  };

  const handleAcknowledgeReceipt = (id: string, conferenceReceiptNo: string) => {
    setRemittances(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'remitted_acknowledged',
      conferenceReceiptNumber: conferenceReceiptNo
    } : r));
  };

  const handleRecordSSTransmission = (data: Omit<SabbathSchoolTransmission, 'id' | 'churchId' | 'receiptNumber'>) => {
    const newTrans: SabbathSchoolTransmission = {
      ...data,
      id: `ss-trans-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
      receiptNumber: `SSR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    };
    setSsTransmissions(prev => [newTrans, ...prev]);
  };

  const handleAddDisbursement = (disbursement: Omit<DisbursementRecord, 'id' | 'churchId' | 'voucherNumber'>) => {
    const newDisb: DisbursementRecord = {
      ...disbursement,
      id: `disb-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
      voucherNumber: `DIS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    };
    setDisbursements(prev => [newDisb, ...prev]);
    setBankAccounts(prev => prev.map(b => b.accountType === 'operating_checking' ? { ...b, currentBalance: b.currentBalance - disbursement.amount } : b));
    if (disbursement.fundCategory === 'auxiliary') {
      setAuxiliaryDepartments(prev => prev.map(d => d.name === disbursement.fundName ? {
        ...d,
        currentBalance: Math.max(0, d.currentBalance - disbursement.amount)
      } : d));
    }
  };

  const handleReceiveAuxiliaryFunds = (auxId: string, amount: number, _donorNote: string) => {
    setAuxiliaryDepartments(prev => prev.map(a => a.id === auxId ? {
      ...a,
      currentBalance: a.currentBalance + amount
    } : a));
    setBankAccounts(prev => prev.map(b => b.accountType === 'operating_checking' ? { ...b, currentBalance: b.currentBalance + amount } : b));
  };

  const handleAddEnvelope = (envelope: Omit<OfferingEnvelope, 'id' | 'churchId' | 'receiptNumber'>) => {
    const newEnvelope: OfferingEnvelope = {
      ...envelope,
      id: `env-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
      receiptNumber: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    };
    setEnvelopes(prev => [newEnvelope, ...prev]);
    setBankAccounts(prev => prev.map(b => b.accountType === 'operating_checking' ? { ...b, currentBalance: b.currentBalance + envelope.totalAmount } : b));
  };

  const handleAddLooseOffering = (loose: Omit<LooseOfferingRecord, 'id' | 'churchId' | 'receiptNumber'>) => {
    const newLoose: LooseOfferingRecord = {
      ...loose,
      id: `loose-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
      receiptNumber: `LCR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    };
    setLooseOfferings(prev => [newLoose, ...prev]);
    setBankAccounts(prev => prev.map(b => b.accountType === 'operating_checking' ? { ...b, currentBalance: b.currentBalance + loose.totalAmount } : b));
  };

  const handleAddLiteratureOrder = (order: Omit<LiteratureOrder, 'id' | 'churchId' | 'orderNumber'>) => {
    const newOrder: LiteratureOrder = {
      ...order,
      id: `lit-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
      orderNumber: `ABC-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`
    };
    setLiteratureOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateLiteratureStatus = (id: string, status: 'collected' | 'remitted_to_abc' | 'delivered', ref?: string) => {
    setLiteratureOrders(prev => prev.map(l => l.id === id ? {
      ...l,
      status,
      ...(ref ? { abcInvoiceRef: ref, remittedToAbcDate: new Date().toISOString().split('T')[0] } : {})
    } : l));
  };

  const handleAddNewAudit = (audit: Omit<AuditRecord, 'id' | 'churchId'>) => {
    const newAudit: AuditRecord = {
      ...audit,
      id: `audit-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
    };
    setAuditRecords(prev => [newAudit, ...prev]);
  };

  // Superintendent Handlers
  const handleToggleMobilisationItem = (id: string) => {
    setMobilisationPlan(prev => prev.map(m => {
      if (m.id === id) {
        const nextCompleted = !m.isCompleted;
        return {
          ...m,
          isCompleted: nextCompleted,
          completedDate: nextCompleted ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return m;
    }));
  };

  const handleAddMobilisationItem = (item: Omit<MobilisationPlanItem, 'id'>) => {
    const newItem: MobilisationPlanItem = {
      ...item,
      id: `mob-${Date.now()}`
    };
    setMobilisationPlan(prev => [...prev, newItem]);
  };

  const handleUpdateCurriculum = (id: string, updates: Partial<SSCurriculumItem>) => {
    setCurriculumInventory(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleUpdateRunSheet = (updated: SSProgramRunSheet) => {
    setProgramRunSheet(updated);
  };

  const handleAddAuxiliaryOfficer = (officer: Omit<SSAuxiliaryOfficer, 'id'>) => {
    const newOfficer: SSAuxiliaryOfficer = {
      ...officer,
      id: `aux-${Date.now()}`
    };
    setAuxiliaryOfficers(prev => [...prev, newOfficer]);
  };

  const handleUpdateTeacherCandidate = (id: string, updates: Partial<SSTeacherCandidate>) => {
    setTeacherCandidates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddTeacherCandidate = (candidate: Omit<SSTeacherCandidate, 'id'>) => {
    const newCandidate: SSTeacherCandidate = {
      ...candidate,
      id: `tc-${Date.now()}`
    };
    setTeacherCandidates(prev => [...prev, newCandidate]);
  };

  const handleAddTeachersMeeting = (meeting: Omit<SSTeachersMeeting, 'id'>) => {
    const newMeeting: SSTeachersMeeting = {
      ...meeting,
      id: `tm-${Date.now()}`
    };
    setTeachersMeetings(prev => [newMeeting, ...prev]);
  };

  const handleAddEvangelismProject = (project: Omit<SSEvangelismProject, 'id'>) => {
    const newProj: SSEvangelismProject = {
      ...project,
      id: `evang-${Date.now()}`
    };
    setEvangelismProjects(prev => [...prev, newProj]);
  };

  const handleUpdateEvangelismProject = (id: string, updates: Partial<SSEvangelismProject>) => {
    setEvangelismProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddGreetingSchedule = (item: Omit<SSGreetingSchedule, 'id'>) => {
    const newGreet: SSGreetingSchedule = {
      ...item,
      id: `gs-${Date.now()}`
    };
    setGreetingSchedules(prev => [...prev, newGreet]);
  };

  const handleUpdateQuarterlyReport = (updated: Partial<SSQuarterlyReport>) => {
    setQuarterlyReport(prev => ({ ...prev, ...updated }));
  };

  const handleAddStudyGuideOrder = (orderData: Omit<StudyGuideOrder, 'id' | 'churchId' | 'orderNumber'>) => {
    const nextNum = (studyGuideOrders.length + 1).toString().padStart(3, '0');
    const newOrder: StudyGuideOrder = {
      ...orderData,
      id: `sgo-${Date.now()}`,
      churchId: currentUser?.churchId || activeChurchId,
      orderNumber: `SGO-2026-${nextNum}`
    };
    setStudyGuideOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateStudyGuideOrder = (id: string, updates: Partial<StudyGuideOrder>) => {
    setStudyGuideOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const handleDeleteStudyGuideOrder = (id: string) => {
    setStudyGuideOrders(prev => prev.filter(o => o.id !== id));
  };

  const mappedFinancialTransmissions: FinancialTransmission[] = ssTransmissions.map(st => ({
    id: st.id,
    transmissionRef: st.receiptNumber,
    sabbathDate: st.date,
    breakdown: {
      worldMissionOffering: st.regularMissionOffering,
      thirteenthSabbathOffering: st.thirteenthSabbathOffering,
      birthdayThankOffering: st.birthdayThankOffering,
      missionInvestment: st.missionInvestment,
      sabbathSchoolExpense: st.sabbathSchoolExpense
    },
    totalAmount: st.totalMissionAmount,
    signedBySecretary: st.secretaryName,
    receivedByTreasurer: st.treasurerName,
    status: st.status === 'remitted' ? 'remitted' : 'transmitted'
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <SDALogo className="w-20 h-20 mb-8 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-blue-300">Connecting to Database...</p>
      </div>
    );
  }

  // Find the specific class for the current teacher
  const getTeacherClass = (): Class | null => {
    if (!currentUser || currentUser.role !== Role.TEACHER) return null;
    
    const assignedClass = classes.find(c => c.id === currentUser.assignedClass);
    if (assignedClass) return assignedClass;
    
    const teacherIdClass = classes.find(c => c.teacherId === currentUser.id);
    if (teacherIdClass) return teacherIdClass;

    return null;
  };

  const teacherClass = getTeacherClass();

  const activeConference = useMemo(() => {
    return conferences.find(c => 
      c.id === currentUser?.conferenceId || 
      (currentUser?.conferenceName && c.name.toLowerCase() === currentUser?.conferenceName?.toLowerCase())
    ) || conferences[0] || INITIAL_CONFERENCES[0];
  }, [conferences, currentUser]);

  const activeDistrict = useMemo(() => {
    return districts.find(d => 
      d.id === currentUser?.districtId || 
      (currentUser?.districtName && d.name.toLowerCase() === currentUser?.districtName?.toLowerCase())
    ) || districts[0] || INITIAL_DISTRICTS[0];
  }, [districts, currentUser]);

  const districtObj = currentUser && currentUser.role === Role.DISTRICT_ADMIN
    ? districts.find(d => d.id === currentUser.districtId) || {
        id: currentUser.districtId || 'dist_001',
        name: currentUser.districtName || 'District Office',
        conferenceId: 'conf_001',
        is_active: true
      }
    : null;

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {dbError && (
          <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-top duration-500 z-[100]">
            <DatabaseZap className="w-4 h-4" />
            {dbError}
          </div>
        )}
        {currentUser && (
          <Navigation
            user={currentUser}
            notifications={notifications}
            onLogout={handleLogout}
            onProfileClick={() => {
              if (currentUser.role === Role.CLERK) {
                setIsClerkManageOpen(true);
              } else {
                setIsTeacherProfileOpen(true);
              }
            }}
            onMarkNotificationRead={handleMarkNotificationRead}
            onOpenPitchModal={() => setIsPitchModalOpen(true)}
          />
        )}
        
        {/* Executive Pitch Modal */}
        <ClientPitchModal 
          isOpen={isPitchModalOpen} 
          onClose={() => setIsPitchModalOpen(false)} 
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/signup" element={!currentUser ? <SignupPage onSignup={handleSignup} /> : <Navigate to="/" />} />
            <Route path="/login" element={!currentUser ? (
              <LoginPage
                isBackendConnected={isBackendConnected}
                onLogin={handleLogin}
                teachers={teachers}
                admins={admins}
                onTeacherResetRequest={requestTeacherReset}
                onClerkResetEmail={requestClerkResetEmail}
                onForceChangePassword={handleForceChangePassword}
              />
            ) : <Navigate to="/" />} />
            <Route path="/reset/:token" element={<ResetPasswordPage />} />
            <Route path="/register-church" element={<RegisterChurchPage isBackendConnected={isBackendConnected} districts={districts} onSubmitRegistration={handleRegisterChurch} />} />
            <Route path="/register-district" element={<RegisterDistrictPage isBackendConnected={isBackendConnected} backendUrl={BACKEND_URL} />} />
            <Route
              path="/guest-list"
              element={
                currentUser?.role === Role.CLERK ? (
                  <GuestListPage classes={classes} attendanceRecords={attendanceRecords} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            
            <Route 
              path="/" 
              element={
                !currentUser ? (
                  <Navigate to="/login" />
                ) : currentUser.role === Role.SUPER_ADMIN ? (
                  <SuperAdminDashboard
                    user={currentUser}
                    conferences={conferences.length > 0 ? conferences : INITIAL_CONFERENCES}
                    districts={districts.length > 0 ? districts : INITIAL_DISTRICTS}
                    churches={churches.length > 0 ? (churches as any) : INITIAL_CHURCHES}
                    churchMembers={churchMembers}
                    onAddConference={handleAddConference}
                  />
                ) : currentUser.role === Role.CHURCH_ADMIN ? (
                  <ChurchAdminDashboard
                    user={currentUser}
                    clerks={clerks}
                    superintendents={superintendents}
                    treasurers={treasurers}
                    teachers={teachers}
                    classes={classes}
                    churchMembers={churchMembers}
                    familyUnits={familyUnits}
                    transferRequests={transferRequests}
                    meetings={meetings}
                    officers={officers}
                    attendanceRecords={attendanceRecords}
                    onAddOfficer={handleAddOfficerByElder}
                    onUpdateOfficer={handleUpdateOfficerByElder}
                    onDeleteOfficer={handleDeleteOfficerByElder}
                  />
                ) : currentUser.role === Role.TREASURER ? (
                  <TreasurerDashboard
                    user={currentUser}
                    churchMembers={churchMembers}
                    bankAccounts={bankAccounts}
                    onAddBankAccount={handleAddBankAccount}
                    onReconcileAccount={handleReconcileAccount}
                    remittances={remittances}
                    onCompileRemittance={handleCompileRemittance}
                    onAcknowledgeReceipt={handleAcknowledgeReceipt}
                    ssTransmissions={ssTransmissions}
                    onRecordSSTransmission={handleRecordSSTransmission}
                    disbursements={disbursements}
                    auxiliaryDepartments={auxiliaryDepartments}
                    onAddDisbursement={handleAddDisbursement}
                    onReceiveAuxiliaryFunds={handleReceiveAuxiliaryFunds}
                    envelopes={envelopes}
                    looseOfferings={looseOfferings}
                    literatureOrders={literatureOrders}
                    onAddEnvelope={handleAddEnvelope}
                    onAddLooseOffering={handleAddLooseOffering}
                    onAddLiteratureOrder={handleAddLiteratureOrder}
                    onUpdateLiteratureStatus={handleUpdateLiteratureStatus}
                    auditRecords={auditRecords}
                    onAddNewAudit={handleAddNewAudit}
                  />
                ) : currentUser.role === Role.SUPERINTENDENT ? (
                  <SuperintendentDashboard
                    user={currentUser}
                    mobilisationPlan={mobilisationPlan}
                    onToggleMobilisationItem={handleToggleMobilisationItem}
                    onAddMobilisationItem={handleAddMobilisationItem}
                    conferenceEmphases={conferenceEmphases}
                    curriculumInventory={curriculumInventory}
                    onUpdateCurriculum={handleUpdateCurriculum}
                    programRunSheet={programRunSheet}
                    onUpdateRunSheet={handleUpdateRunSheet}
                    councilMembers={councilMembers}
                    auxiliaryOfficers={auxiliaryOfficers}
                    onAddAuxiliaryOfficer={handleAddAuxiliaryOfficer}
                    teacherCandidates={teacherCandidates}
                    onUpdateTeacherCandidate={handleUpdateTeacherCandidate}
                    onAddTeacherCandidate={handleAddTeacherCandidate}
                    teachersMeetings={teachersMeetings}
                    onAddTeachersMeeting={handleAddTeachersMeeting}
                    evangelismProjects={evangelismProjects}
                    onAddEvangelismProject={handleAddEvangelismProject}
                    onUpdateEvangelismProject={handleUpdateEvangelismProject}
                    greetingSchedules={greetingSchedules}
                    onAddGreetingSchedule={handleAddGreetingSchedule}
                    quarterlyReport={quarterlyReport}
                    onUpdateQuarterlyReport={handleUpdateQuarterlyReport}
                    churchMembers={churchMembers}
                    financialTransmissions={mappedFinancialTransmissions}
                    classSessions={classSessions}
                    teachers={teachers}
                    classes={classes}
                    onAddTeacher={addTeacher}
                    onUpdateTeacher={updateTeacher}
                    onDeleteTeacher={removeTeacher}
                    onUpdatePassword={updateTeacherPassword}
                    studyGuideOrders={studyGuideOrders}
                    onAddStudyGuideOrder={handleAddStudyGuideOrder}
                    onUpdateStudyGuideOrder={handleUpdateStudyGuideOrder}
                    onDeleteStudyGuideOrder={handleDeleteStudyGuideOrder}
                  />
                ) : currentUser.role === Role.CONFERENCE_PRESIDENT ? (
                  <ConferencePresidentDashboard
                    user={currentUser}
                    conference={activeConference}
                    districts={districts}
                    churches={churches.length > 0 ? (churches as any) : INITIAL_CHURCHES}
                    churchMembers={churchMembers}
                    remittances={remittances}
                    onAddDistrict={(newDist, pastorUser) => {
                      setDistricts(prev => [...prev, newDist]);
                      setDistrictPastors(prev => [...prev, pastorUser]);
                    }}
                    onNavigateToDistrict={(targetDistId) => {
                      const targetDist = districts.find(d => d.id === targetDistId);
                      if (targetDist) {
                        const pastor = districtPastors.find(p => p.districtId === targetDistId) || {
                          id: `pastor-${targetDist.id}`,
                          name: targetDist.pastorName || 'District Pastor',
                          email: targetDist.pastorEmail || 'pastor@district.org',
                          role: Role.DISTRICT_PASTOR,
                          districtId: targetDist.id,
                          districtName: targetDist.name,
                          conferenceId: targetDist.conferenceId,
                          title: 'District Pastor (Pastoral Circuit Overseer)'
                        } as User;
                        setCurrentUser(pastor);
                      }
                    }}
                  />
                ) : currentUser.role === Role.CONFERENCE_ADMIN ? (
                  <ConferenceDashboard
                    user={currentUser}
                    districts={districts}
                    churches={churches}
                    teachers={teachers}
                    attendanceRecords={attendanceRecords}
                    announcements={announcements}
                    pendingDistrictRegs={pendingDistrictRegs}
                    onCreateDistrict={handleCreateDistrict}
                    onUpdateDistrict={handleUpdateDistrict}
                    onApproveChurch={handleApproveChurch}
                    onApproveDistrictReg={handleApproveDistrictReg}
                    onPublishAnnouncement={handlePublishAnnouncement}
                    onAdminUpdateUser={handleAdminUpdateUser}
                    onLogout={handleLogout}
                  />
                ) : currentUser.role === Role.DISTRICT_PASTOR ? (
                  <DistrictPastorDashboard
                    user={currentUser}
                    district={activeDistrict}
                    churches={churches.length > 0 ? (churches as any) : INITIAL_CHURCHES}
                    churchMembers={churchMembers}
                    attendanceRecords={attendanceRecords}
                    onSelectChurchForPastoralCare={(targetId) => {
                      setActiveChurchId(targetId);
                      const targetChurch = (churches as any[]).find(c => c.id === targetId);
                      const elder = churchAdmins.find(a => a.churchId === targetId) || {
                        id: `elder-${targetId}`,
                        name: targetChurch?.elderName || 'Presiding Elder',
                        email: targetChurch?.elderEmail || 'elder@church.org',
                        role: Role.CHURCH_ADMIN,
                        churchId: targetId,
                        churchName: targetChurch?.name || 'Local Church',
                        title: 'Church Administrator & Presiding Elder'
                      } as User;
                      setCurrentUser(elder);
                    }}
                  />
                ) : currentUser.role === Role.DISTRICT_ADMIN ? (
                  districtObj ? (
                    <DistrictDashboard
                      user={currentUser}
                      district={districtObj}
                      churches={churches}
                      attendanceRecords={attendanceRecords}
                      announcements={announcements}
                      onApproveChurch={handleApproveChurch}
                      onPublishAnnouncement={handlePublishAnnouncement}
                      onLogout={handleLogout}
                    />
                  ) : (
                    <div className="max-w-6xl mx-auto px-4 py-10 text-center">
                      <p className="text-red-500">Error: District details not found.</p>
                    </div>
                  )
                ) : currentUser.role === Role.CLERK ? (
                  <ClerkDashboard 
                    teachers={teachers} 
                    classes={classes} 
                    announcements={announcements} 
                    attendanceRecords={attendanceRecords}
                    addTeacher={addTeacher}
                    addClass={addClass}
                    notifyTeachersNextSabbath={notifyTeachersNextSabbath}
                    isManageOpen={isClerkManageOpen}
                    onCloseManage={() => setIsClerkManageOpen(false)}
                    updateTeacherPassword={updateTeacherPassword}
                    assignTeacherToClass={assignTeacherToClass}
                    removeTeacher={removeTeacher}
                    resetRequests={resetRequests}
                    resolveResetRequest={resolveResetRequest}
                    offerings={offerings}
                    onOfferingsChange={setOfferings}
                    user={currentUser}
                    admins={admins}
                    churchMembers={churchMembers}
                    familyUnits={familyUnits}
                    transferRequests={transferRequests}
                    meetings={meetings}
                    officers={officers}
                    onAddChurchMember={addChurchMember}
                    onUpdateChurchMember={updateChurchMember}
                    onDeleteChurchMember={deleteChurchMember}
                    onAddFamilyUnit={addFamilyUnit}
                    onUpdateFamilyUnit={updateFamilyUnit}
                    onDeleteFamilyUnit={deleteFamilyUnit}
                    onAddMeeting={addMeeting}
                    onUpdateMeeting={updateMeeting}
                    onDeleteMeeting={deleteMeeting}
                    onAddOfficer={addOfficer}
                    onUpdateOfficer={updateOfficer}
                    onDeleteOfficer={deleteOfficer}
                    onInitiateTransfer={initiateTransfer}
                    onUpdateTransferStage={updateTransferStage}
                  />
                ) : (
                  // Teacher Dashboard
                  teacherClass ? (
                    <TeacherDashboard 
                      user={currentUser} 
                      churchClass={teacherClass}
                      submitAnnouncement={submitAnnouncement}
                      submitAttendance={submitAttendance}
                      addStudent={addStudentToClass}
                      removeStudent={removeStudentFromClass}
                      updateStudent={updateStudentDetails}
                      attendanceRecords={attendanceRecords}
                      updatePassword={updateTeacherPassword}
                      isProfileOpen={isTeacherProfileOpen}
                      onCloseProfile={() => setIsTeacherProfileOpen(false)}
                    />
                  ) : (
                    <div className="max-w-6xl mx-auto px-4 py-10">
                      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="text-6xl mb-6">📚</div>
                          <h2 className="text-2xl font-black text-slate-900 mb-4">No Class Assigned</h2>
                          <p className="text-slate-600 mb-6">
                            {currentUser.name}, you haven't been assigned to a class yet.
                          </p>
                          <p className="text-slate-500 text-sm">
                            Please contact the church clerk for class assignment.
                          </p>
                          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                            <p className="text-blue-700 text-sm">
                              <strong>User ID:</strong> {currentUser.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )
              } 
            />
          </Routes>
        </main>
        
        <footer className="bg-white border-t py-6 text-center text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
          <div className="flex flex-col items-center gap-3">
            <div>
              &copy; {new Date().getFullYear()} Seventh-day Adventist Church • Digital Registry 
              {isBackendConnected ? ' (Database Connected)' : ' (Local Mode)'}
            </div>
            <a
              href="/app-icon.svg"
              download="sda-digital-church-register-icon.svg"
              className="text-blue-700 hover:text-blue-900 transition-colors"
            >
              Download App Icon
            </a>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
