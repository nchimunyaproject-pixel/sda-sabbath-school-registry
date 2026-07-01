
import { Role, User, Class, Student } from './types';

export const INITIAL_TEACHERS: User[] = [
  { id: 't1', name: 'Elder Musonda', email: 'musonda@church.org', password: 'password123', role: Role.TEACHER, assignedClass: 'c1', language: 'Bemba' },
  { id: 't2', name: 'Sister Chanda', email: 'chanda@church.org', password: 'password123', role: Role.TEACHER, assignedClass: 'c2', language: 'Nyanja' },
  { id: 't3', name: 'Brother Mwale', email: 'mwale@church.org', password: 'password123', role: Role.TEACHER, assignedClass: 'c3', language: 'English' },
];

export const INITIAL_CLASSES: Class[] = [
  {
    id: 'c1',
    name: 'Adult Sabbath School',
    language: 'Bemba',
    teacherId: 't1',
    students: [
      { id: 's1', name: 'Alice Walker', classId: 'c1', attendanceStatus: 'unmarked' },
      { id: 's2', name: 'Robert Miller', classId: 'c1', attendanceStatus: 'unmarked' },
    ]
  },
  {
    id: 'c2',
    name: 'Adult Sabbath School',
    language: 'Nyanja',
    teacherId: 't2',
    students: [
      { id: 's3', name: 'Sarah Jenkins', classId: 'c2', attendanceStatus: 'unmarked' },
    ]
  },
  {
    id: 'c3',
    name: 'Adult Sabbath School',
    language: 'English',
    teacherId: 't3',
    students: [
      { id: 's4', name: 'Little Timmy', classId: 'c3', attendanceStatus: 'unmarked' },
    ]
  },
  {
    id: 'c4',
    name: 'Youth Ministry',
    teacherId: '',
    students: []
  },
  {
    id: 'c5',
    name: 'Primary Class',
    teacherId: '',
    students: []
  }
];

export const ADULT_LANGUAGES = ['English', 'Bemba', 'Tonga', 'Nyanja', 'Lozi'];

export const SABBATH_SCHOOL_OBJECTIVES = [
  'Study of the Word',
  'Fellowship',
  'Community Outreach',
  'World Mission Emphasis'
];

export const SABBATH_SCHOOL_DIVISIONS = [
  'Beginner (0-2)',
  'Kindergarten',
  'Primary',
  'Junior',
  'Teen',
  'Youth',
  'Young Adult',
  'Adult',
  'Extension Division'
];
