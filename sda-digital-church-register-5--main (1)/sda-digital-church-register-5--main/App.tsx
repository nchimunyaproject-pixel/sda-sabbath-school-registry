import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Role, User, Class, Announcement, AttendanceRecord, Student, Offerings, District, Church, Notification, PendingDistrictRegistration } from './types.ts';
import { INITIAL_TEACHERS, INITIAL_CLASSES } from './constants.ts';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import ClerkDashboard from './pages/ClerkDashboard.tsx';
import TeacherDashboard from './pages/TeacherDashboard.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import GuestListPage from './pages/GuestListPage.tsx';
import RegisterChurchPage from './pages/RegisterChurchPage.tsx';
import RegisterDistrictPage from './pages/RegisterDistrictPage.tsx';
import ConferenceDashboard from './pages/ConferenceDashboard.tsx';
import DistrictDashboard from './pages/DistrictDashboard.tsx';
import Navigation from './components/Navigation.tsx';
import SDALogo from './components/SDALogo.tsx';
import { DatabaseZap } from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001/api';
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
  const [districts, setDistricts] = useState<District[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [pendingDistrictRegs, setPendingDistrictRegs] = useState<PendingDistrictRegistration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isClerkManageOpen, setIsClerkManageOpen] = useState(false);
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);
  const [resetRequests, setResetRequests] = useState<{ id: string; name: string; email: string; requestedAt: string }[]>([]);

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
            setTeachers(teachersData);
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
            // Extracted from districts query
            const allChurches = districtsData.flatMap((d: any) => d.churches || []);
            setChurches(allChurches);
          }

          // Load pending district registrations
          try {
            const distRegRes = await fetch(`${BACKEND_URL}/admin/district-registrations/pending`, {
              headers: withChurchHeader()
            });
            if (distRegRes.ok) {
              setPendingDistrictRegs(await distRegRes.json());
            }
          } catch (e) { /* ignore if endpoint not yet deployed */ }

          // Load offerings from database
          const offeringsResponse = await fetch(`${BACKEND_URL}/offerings`, {
            headers: withChurchHeader()
          });
          if (offeringsResponse.ok) {
            const offeringsData = await offeringsResponse.json();
            if (offeringsData) {
              setOfferings({
                weeklyMission: Number(offeringsData.weeklyMission || 0),
                thirteenthSabbath: Number(offeringsData.thirteenthSabbath || 0),
                birthdayThank: Number(offeringsData.birthdayThank || 0),
                investmentFund: Number(offeringsData.investmentFund || 0)
              });
            }
          }

          // Load attendance records from database
          const attendanceResponse = await fetch(`${BACKEND_URL}/attendance`, {
            headers: withChurchHeader()
          });
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            if (Array.isArray(attendanceData)) {
              setAttendanceRecords(attendanceData);
            }
          }
          
        } else {
          setDbError("Backend server error");
          setIsBackendConnected(false);
          // Fallback to local data
          setTeachers(INITIAL_TEACHERS);
          setClasses(INITIAL_CLASSES);
          setAdmins([]);
        }
      } catch (err) {
        console.warn("Backend not detected. Falling back to local storage.");
        setIsBackendConnected(false);
        setDbError("Backend connection failed. Running in local mode.");
        
        // Fallback to local data
        const savedData = localStorage.getItem('sda_registry_full_data');
        if (savedData) {
          try {
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
          } catch (e) {
            console.error("Local data parse error");
            setAdmins([]);
            setTeachers(INITIAL_TEACHERS);
            setClasses(INITIAL_CLASSES);
            setOfferings({
              weeklyMission: 0,
              thirteenthSabbath: 0,
              birthdayThank: 0,
              investmentFund: 0
            });
          }
        } else {
          setAdmins([]);
          setTeachers(INITIAL_TEACHERS);
          setClasses(INITIAL_CLASSES);
          setOfferings({
            weeklyMission: 0,
            thirteenthSabbath: 0,
            birthdayThank: 0,
            investmentFund: 0
          });
        }
      }
      
      // Restore user session
      const savedUser = localStorage.getItem('sda_current_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('sda_current_user');
        }
      }

      const savedRequests = localStorage.getItem('sda_reset_requests');
      if (savedRequests) {
        try {
          setResetRequests(JSON.parse(savedRequests));
        } catch (e) {
          localStorage.removeItem('sda_reset_requests');
        }
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Always persist to localStorage
  useEffect(() => {
    if (isLoading) return;
    const dataToSync = {
      admins,
      teachers,
      classes,
      announcements,
      attendanceRecords,
      offerings
    };
    localStorage.setItem('sda_registry_full_data', JSON.stringify(dataToSync));
  }, [admins, teachers, classes, announcements, attendanceRecords, offerings, isLoading]);

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
          console.log("✅ Sync completed successfully");
        } catch (err: any) {
          console.error("❌ SYNC FAILURE:", err);
          setDbError("Sync failed: " + err.message);
        }
      }
    };

    const debounceSync = setTimeout(syncData, 1000); // debounce for 1s
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
        // Fallback to local
        setAdmins(prev => [...prev, user]);
      }
    } else {
      setAdmins(prev => [...prev, user]);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sda_current_user', JSON.stringify(user));
    
    // Update last login in database
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
    // Local fallback
    setChurches(prev => [...prev, { ...churchData, status: 'pending', membership: Number(churchData.membership) || 0 }]);
    return true;
  };

  const handleApproveChurch = async (id: string) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/churches/${id}/approve`, {
          method: 'POST',
          headers: withChurchHeader()
        });
        if (response.ok) {
          const resData = await response.json();
          alert(`Church approved successfully! Clerk temporary password: ${resData.tempPass}`);
          setChurches(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
          
          // Refresh users
          const usersRes = await fetch(`${BACKEND_URL}/users`, { headers: withChurchHeader() });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setTeachers(usersData.filter((user: User) => user.role === Role.TEACHER));
            setAdmins(usersData.filter((user: User) => user.role === Role.CLERK));
          }
        }
      } catch (err) {
        console.error('Failed to approve church:', err);
      }
    } else {
      setChurches(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
      alert(`Church approved! Clerk account created locally.`);
    }
  };

  const handleApproveDistrictReg = async (id: string) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/district-registrations/${id}/approve`, {
          method: 'POST',
          headers: withChurchHeader()
        });
        if (response.ok) {
          const data = await response.json();
          alert(`District Admin approved! Temporary password: ${data.tempPass || 'See email'}`);
          setPendingDistrictRegs(prev => prev.filter(r => r.id !== id));
          // Refresh districts and users
          const distRes = await fetch(`${BACKEND_URL}/admin/districts`, { headers: withChurchHeader() });
          if (distRes.ok) { const d = await distRes.json(); setDistricts(d); }
          const usersRes = await fetch(`${BACKEND_URL}/users`, { headers: withChurchHeader() });
          if (usersRes.ok) { const u = await usersRes.json(); setTeachers(u.filter((x: User) => x.role === Role.TEACHER)); }
        }
      } catch (err) {
        console.error('Failed to approve district registration:', err);
      }
    } else {
      setPendingDistrictRegs(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAdminUpdateUser = async (userId: string, data: Partial<User> & { password?: string }) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/users/${userId}`, {
          method: 'PUT',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(data)
        });
        if (response.ok) {
          // If updating current user, refresh session
          if (userId === currentUser?.id) {
            const updated = { ...currentUser, name: data.name ?? currentUser.name, email: data.email ?? currentUser.email };
            setCurrentUser(updated);
            localStorage.setItem('sda_current_user', JSON.stringify(updated));
          }
          // Refresh user list
          const usersRes = await fetch(`${BACKEND_URL}/users`, { headers: withChurchHeader() });
          if (usersRes.ok) {
            const u = await usersRes.json();
            setTeachers(u.filter((x: User) => x.role === Role.TEACHER || x.role === Role.CLERK || x.role === Role.DISTRICT_ADMIN));
          }
        }
      } catch (err) {
        console.error('Failed to update user:', err);
      }
    } else {
      setTeachers(prev => prev.map(t => t.id === userId ? { ...t, ...data } : t));
    }
  };

  const handleCreateDistrict = async (name: string) => {
     if (isBackendConnected) {
       try {
         const response = await fetch(`${BACKEND_URL}/admin/districts`, {
           method: 'POST',
           headers: withChurchHeader({ 'Content-Type': 'application/json' }),
           body: JSON.stringify({ name })
         });
         if (response.ok) {
           const newDist = await response.json();
           setDistricts(prev => [...prev, { ...newDist, is_active: true, churches: [] }]);
         }
       } catch (err) {
         console.error('Failed to create district:', err);
       }
     } else {
       const newDist: District = { id: `dist_${Date.now()}`, name, conferenceId: 'conf_001', is_active: true };
       setDistricts(prev => [...prev, newDist]);
     }
  };

  const handleUpdateDistrict = async (id: string, name: string, is_active: boolean) => {
     if (isBackendConnected) {
       try {
         await fetch(`${BACKEND_URL}/admin/districts/${id}`, {
           method: 'PUT',
           headers: withChurchHeader({ 'Content-Type': 'application/json' }),
           body: JSON.stringify({ name, is_active })
         });
       } catch (err) {
         console.error('Failed to update district:', err);
       }
     }
     setDistricts(prev => prev.map(d => d.id === id ? { ...d, name, is_active } : d));
  };

  const handleForceChangePassword = async (userId: string, newPass: string) => {
     if (isBackendConnected) {
       try {
         const response = await fetch(`${BACKEND_URL}/users/change-password-force`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId, newPassword: newPass })
         });
         return response.ok;
       } catch (err) {
         console.error('Failed to change temp password:', err);
       }
       return false;
     }
     return true;
  };

  const handlePublishAnnouncement = async (announceData: any) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/announcements`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(announceData)
        });
        if (response.ok) {
          const savedAnn = await response.json();
          setAnnouncements(prev => [savedAnn, ...prev]);
        }
      } catch (err) {
        console.error('Failed to publish announcement:', err);
      }
    } else {
      setAnnouncements(prev => [announceData, ...prev]);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    if (isBackendConnected) {
       try {
         await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
           method: 'PUT',
           headers: withChurchHeader()
         });
       } catch (err) {
         console.error('Failed to read notification:', err);
       }
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addTeacher = async (name: string, email: string, password: string, classId: string, language?: string) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/users/create-teacher`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ name, email, phone: '', assignedClass: classId }),
        });
        if (response.ok) {
          const resData = await response.json();
          alert(`Teacher created successfully! Temporary password sent to email. Code: ${resData.tempPass}`);
          
          // Refresh users
          const usersResponse = await fetch(`${BACKEND_URL}/users`, {
            headers: withChurchHeader()
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setTeachers(usersData.filter((user: User) => user.role === Role.TEACHER));
          }
          
          // Refresh classes
          const classesResponse = await fetch(`${BACKEND_URL}/classes`, {
            headers: withChurchHeader()
          });
          if (classesResponse.ok) {
            const classesData = await classesResponse.json();
            setClasses(classesData);
          }
        }
      } catch (err) {
        console.error('Failed to add teacher:', err);
      }
    } else {
      const newId = `t${Date.now()}`;
      const newTeacher: User = {
        id: newId,
        name,
        email,
        password,
        role: Role.TEACHER,
        assignedClass: classId,
        language: language,
        is_first_login: true,
        temp_password: password
      };
      setTeachers(prev => [...prev, newTeacher]);
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, teacherId: newId, language: language || c.language } : c
      ));
    }
  };

  const addClass = async (name: string, language: string) => {
    const newClass: Class = {
      id: `c${Date.now()}`,
      name,
      teacherId: '',
      language,
      students: []
    };

    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/classes`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...newClass, churchId: CHURCH_ID })
        });
        if (response.ok) {
          const savedClass = await response.json();
          const normalized = { ...savedClass, students: savedClass.students || [] };
          setClasses(prev => [...prev, normalized]);
          return normalized as Class;
        }
      } catch (err) {
        console.error('Failed to add class to database:', err);
      }
    }

    setClasses(prev => [...prev, newClass]);
    return newClass;
  };

  const notifyTeachersNextSabbath = async (message: string, sabbathDate: string, recipients?: string[]) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/notifications/next-sabbath`, {
          method: 'POST',
          headers: withChurchHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ message, sabbathDate, recipients })
        });
        return response.ok;
      } catch (err) {
        console.error('Failed to send next sabbath notice:', err);
        return false;
      }
    }
    return false;
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
        console.error('Failed to update password in database:', err);
      }
    }
    
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, password: newPassword } : t));
    if (currentUser?.id === teacherId) {
      const updated = { ...currentUser, password: newPassword } as User;
      setCurrentUser(updated);
      localStorage.setItem('sda_current_user', JSON.stringify(updated));
    }
  };

  const removeTeacher = async (teacherId: string) => {
    if (isBackendConnected) {
      try {
        await fetch(`${BACKEND_URL}/users/${teacherId}`, { method: 'DELETE', headers: withChurchHeader() });
      } catch (err) {
        console.error('Failed to remove teacher from database:', err);
      }
    }

    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    setClasses(prev => prev.map(c => (c.teacherId === teacherId ? { ...c, teacherId: '' } : c)));
  };

  const assignTeacherToClass = async (teacherId: string, classId: string, language?: string) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const nextLanguage = language || targetClass.language;

    // Optimistic local update
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, teacherId, language: nextLanguage };
      }
      if (c.teacherId === teacherId && c.id !== classId) {
        return { ...c, teacherId: '' };
      }
      return c;
    }));
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, assignedClass: classId, language: nextLanguage } : t));

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
      gender: studentData.gender as 'MALE' | 'FEMALE' | undefined,
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
          // Update local classes with new student
          setClasses(prev => prev.map(c => {
            if (c.id === classId) {
              return { ...c, students: [...c.students, savedStudent] };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error('Failed to add student to database:', err);
        // Fallback to local
        setClasses(prev => prev.map(c => {
          if (c.id === classId) {
            return { ...c, students: [...c.students, newStudent] };
          }
          return c;
        }));
      }
    } else {
      setClasses(prev => prev.map(c => {
        if (c.id === classId) {
          return { ...c, students: [...c.students, newStudent] };
        }
        return c;
      }));
    }
  };

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    if (isBackendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/students/${studentId}`, {
          method: 'DELETE',
          headers: withChurchHeader()
        });
        if (!response.ok) {
          throw new Error('Failed to delete student');
        }
      } catch (err) {
        console.error('Failed to remove student from database:', err);
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
          
          // Update students' attendance status in database
          await fetch(`${BACKEND_URL}/students/attendance`, {
            method: 'PUT',
            headers: withChurchHeader({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ 
              classId: record.classId, 
              students: record.records 
            }),
          });
          
          // Refresh classes
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-950 text-white">
        <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 animate-pulse">
          <SDALogo className="w-48 h-24" />
        </div>
        <div className="flex items-center gap-3">
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
    
    // Try to find the exact assigned class
    const assignedClass = classes.find(c => c.id === currentUser.assignedClass);
    if (assignedClass) return assignedClass;
    
    // If assigned class not found, find any class that has this user as teacherId
    const teacherIdClass = classes.find(c => c.teacherId === currentUser.id);
    if (teacherIdClass) return teacherIdClass;

    // Return null if no class found
    return null;
  };

  // Get teacher class with safe fallback
  const teacherClass = getTeacherClass();

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
          />
        )}
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
                  />
                ) : (
                  // Only render TeacherDashboard if class exists
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
