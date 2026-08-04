export enum Role {
  CONFERENCE_ADMIN = 'CONFERENCE_ADMIN',
  DISTRICT_ADMIN = 'DISTRICT_ADMIN',
  CLERK = 'CLERK',
  TEACHER = 'TEACHER',
  VIEWER = 'VIEWER'
}

export interface Conference {
  id: string;
  name: string;
  created_at?: string;
}

export interface District {
  id: string;
  name: string;
  conferenceId: string;
  is_active: boolean;
  created_at?: string;
}

export interface Church {
  id: string;
  church_name: string;
  districtId: string;
  province: string;
  location: string;
  email: string;
  phone_number: string;
  clerkName: string;
  clerkEmail: string;
  clerkPassword?: string;
  pastor_name?: string;
  membership: number;
  status: 'pending' | 'approved';
  is_active: boolean;
  created_at?: string;
}

export interface PendingDistrictRegistration {
  id: string;
  districtName: string;
  conferenceId: string;
  adminName: string;
  adminEmail: string;
  phone_number?: string;
  password?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  assignedClass?: string;
  language?: string;
  churchName?: string;
  churchId?: string;
  districtId?: string;
  conferenceId?: string;
  is_first_login?: boolean;
  temp_password?: string;
  is_active?: boolean;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  attendanceStatus: 'present' | 'absent' | 'sick' | 'travelled' | 'other' | 'unmarked';
  lessonStudied?: boolean;
  attendanceNote?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  baptized?: boolean;
  member_since?: string;
  emergency_contact?: string;
  medical_notes?: string;
  address?: string;
}

export interface Visitor {
  id: string;
  name: string;
  classId: string;
  contact?: string;
  location?: string;
  purpose?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: Student[];
  language?: string;
}

export interface Announcement {
  id: string;
  teacherId: string;
  teacherName: string;
  className: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'compiled';
  targetType: 'CONFERENCE' | 'DISTRICT' | 'CHURCH';
  targetId: string;
  priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  expiryDate?: string;
  isArchived?: boolean;
  readReceipts?: string[]; // user IDs
  richText?: string;
  attachments?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  recipientType: 'CONFERENCE' | 'DISTRICT' | 'CHURCH' | 'USER';
  recipientId: string;
  isRead: boolean;
  created_at?: string;
}

export interface Offerings {
  weeklyMission: number;
  thirteenthSabbath: number;
  birthdayThank: number;
  investmentFund: number;
}
