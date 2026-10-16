
import { 
  Role, User, Class, Student, FamilyUnit, ChurchMember, ChurchMeeting, 
  ChurchOfficer, TransferRequest, ChurchBankAccount, OfferingEnvelope, 
  LooseOfferingRecord, SabbathSchoolTransmission, DisbursementRecord, 
  AuxiliaryDepartment, ConferenceRemittance, LiteratureOrder, AuditRecord,
  MobilisationPlanItem, ConferenceEmphases, SSCurriculumItem, SSProgramRunSheet, 
  SSCouncilMember, SSAuxiliaryOfficer, SSTeacherCandidate, SSTeachersMeeting, 
  SSEvangelismProject, SSConferenceQuarterlyReportStatus, StudyGuideOrder, 
  ChurchStation, Conference, District,
  MinisterialCredential, StatisticalComplianceReport, ConstituencyDelegateQuota, CompanyPlantingProject
} from './types';

export const INITIAL_CONFERENCES: Conference[] = [
  {
    id: 'conf-lusaka',
    name: 'Lusaka Conference',
    presidentName: 'Pastor Dr. Harrington Simpasa',
    presidentEmail: 'president@conference.org',
    presidentPhone: '+260 211 251234',
    headquartersCity: 'Lusaka',
    unionName: 'Southern Zambia Union Conference (SZUC)',
    address: 'Plot 3025, Independence Avenue, Lusaka',
    phone: '+260 211 251234',
    email: 'info@lusakaconference.org',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'conf-midlands',
    name: 'Midlands Conference',
    presidentName: 'Pastor C. M. Mulenga',
    presidentEmail: 'president@midlands.org',
    headquartersCity: 'Kabwe',
    unionName: 'Southern Zambia Union Conference (SZUC)',
    phone: '+260 215 222100',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'conf-copperbelt',
    name: 'Copperbelt Conference',
    presidentName: 'Pastor S. K. Chilufya',
    presidentEmail: 'president@copperbelt.org',
    headquartersCity: 'Ndola',
    unionName: 'Northern Zambia Union Conference (NZUC)',
    phone: '+260 212 612300',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'dist-woodlands',
    name: 'Woodlands District',
    conferenceId: 'conf-lusaka',
    conferenceName: 'Lusaka Conference',
    pastorName: 'Pastor Kelvin Mwale',
    pastorEmail: 'pastor@district.org',
    pastorPhone: '+260 977 888111',
    headquartersChurchId: 'church-woodlands',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'dist-central',
    name: 'Central Lusaka District',
    conferenceId: 'conf-lusaka',
    conferenceName: 'Lusaka Conference',
    pastorName: 'Pastor Emmanuel Lungu',
    pastorEmail: 'pastor.lungu@district.org',
    pastorPhone: '+260 977 777222',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'dist-matero',
    name: 'Matero District',
    conferenceId: 'conf-lusaka',
    conferenceName: 'Lusaka Conference',
    pastorName: 'Pastor David Banda',
    pastorEmail: 'pastor.banda@district.org',
    pastorPhone: '+260 977 666333',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_SUPER_ADMIN: User = {
  id: 'superadmin-1',
  name: 'Elder Dr. G. T. Ngwira',
  email: 'superadmin@sda.org',
  password: 'admin123',
  role: Role.SUPER_ADMIN,
  title: 'System Super Admin (Overall Portal Overseer)',
  phone: '+260 977 999000',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const INITIAL_CONFERENCE_PRESIDENT: User = {
  id: 'president-1',
  name: 'Pastor Dr. Harrington Simpasa',
  email: 'president@conference.org',
  password: 'president123',
  role: Role.CONFERENCE_PRESIDENT,
  conferenceId: 'conf-lusaka',
  conferenceName: 'Lusaka Conference',
  title: 'Conference President (Executive Overseer)',
  phone: '+260 977 555444',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const INITIAL_DISTRICT_PASTOR: User = {
  id: 'pastor-1',
  name: 'Pastor Kelvin Mwale',
  email: 'pastor@district.org',
  password: 'pastor123',
  role: Role.DISTRICT_PASTOR,
  conferenceId: 'conf-lusaka',
  conferenceName: 'Lusaka Conference',
  districtId: 'dist-woodlands',
  districtName: 'Woodlands District',
  churchId: 'church-woodlands',
  churchName: 'Woodlands SDA Church',
  title: 'District Pastor (Pastoral Overseer)',
  phone: '+260 977 888111',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const INITIAL_CHURCHES: ChurchStation[] = [
  {
    id: 'church-woodlands',
    name: 'Woodlands SDA Church',
    conference: 'Lusaka Conference',
    conferenceId: 'conf-lusaka',
    district: 'Woodlands District',
    districtId: 'dist-woodlands',
    city: 'Lusaka',
    address: 'Woodlands Main Road, Lusaka, Zambia',
    phone: '+260 211 254890',
    email: 'woodlands@church.org',
    elderName: 'Elder M. S. Banda',
    elderEmail: 'elder@church.org',
    pastorName: 'Pastor Kelvin Mwale',
    isDemo: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_CHURCH_ADMIN: User = {
  id: 'elder-1',
  name: 'Elder M. S. Banda',
  email: 'elder@church.org',
  password: 'elder123',
  role: Role.CHURCH_ADMIN,
  churchId: 'church-woodlands',
  churchName: 'Woodlands SDA Church',
  title: 'Church Admin Elder (Main Admin)',
  phone: '+260 977 100200',
  status: 'active'
};

export const INITIAL_CLERK: User = {
  id: 'clerk-1',
  name: 'Sister P. Tembo',
  email: 'clerk@church.org',
  password: 'clerk123',
  role: Role.CLERK,
  churchId: 'church-woodlands',
  churchName: 'Woodlands SDA Church',
  title: 'Church Clerk (Secretariat)',
  phone: '+260 977 200300',
  status: 'active'
};

export const INITIAL_SUPERINTENDENT: User = {
  id: 'superintendent-1',
  name: 'Sister R. Simpasa',
  email: 'superintendent@church.org',
  password: 'superintendent123',
  role: Role.SUPERINTENDENT,
  churchId: 'church-woodlands',
  churchName: 'Woodlands SDA Church',
  title: 'Sabbath School Superintendent',
  phone: '+260 977 300400',
  status: 'active'
};

export const INITIAL_TREASURER: User = {
  id: 'treasurer-1',
  name: 'Elder Joseph Banda',
  email: 'treasurer@church.org',
  password: 'treasurer123',
  role: Role.TREASURER,
  churchId: 'church-woodlands',
  churchName: 'Woodlands SDA Church'
};

export const INITIAL_TEACHERS: User[] = [
  { id: 't1', name: 'Elder Musonda', email: 'musonda@church.org', password: 'password123', role: Role.TEACHER, assignedClass: 'c1', language: 'English', churchId: 'church-woodlands', churchName: 'Woodlands SDA Church' },
  { id: 't2', name: 'Sister Chanda', email: 'chanda@church.org', password: 'password123', role: Role.TEACHER, assignedClass: 'c2', churchId: 'church-woodlands', churchName: 'Woodlands SDA Church' },
  { id: 't3', name: 'Brother Mwale', email: 'mwale@church.org', password: 'password123', role: Role.TEACHER, assignedClass: 'c3', churchId: 'church-woodlands', churchName: 'Woodlands SDA Church' },
];

export const INITIAL_CLASSES: Class[] = [
  {
    id: 'c1',
    name: 'Adult Sabbath School',
    language: 'English',
    teacherId: 't1',
    students: [
      { id: 's1', name: 'Alice Walker', classId: 'c1', attendanceStatus: 'unmarked' },
      { id: 's2', name: 'Robert Miller', classId: 'c1', attendanceStatus: 'unmarked' },
    ]
  },
  {
    id: 'c2',
    name: 'Youth Ministry',
    teacherId: 't2',
    students: [
      { id: 's3', name: 'Sarah Jenkins', classId: 'c2', attendanceStatus: 'unmarked' },
    ]
  },
  {
    id: 'c3',
    name: 'Primary Class',
    teacherId: 't3',
    students: [
      { id: 's4', name: 'Little Timmy', classId: 'c3', attendanceStatus: 'unmarked' },
    ]
  }
];

export const ADULT_LANGUAGES = ['English', 'Bemba', 'Tonga', 'Nyanja', 'Lozi'];

export const INITIAL_FAMILY_UNITS: FamilyUnit[] = [
  {
    id: 'fam-1',
    churchId: 'admin-initial',
    familyName: 'Mwale Household',
    primaryContactId: 'mem-1',
    primaryContactName: 'David Mwale',
    address: 'Plot 412 Independence Way, Woodlands',
    contactPhone: '+260 977 123456',
    notes: 'Family actively involved in Sabbath School and Deaconry ministry.'
  },
  {
    id: 'fam-2',
    churchId: 'admin-initial',
    familyName: 'Gómez Morales Household',
    primaryContactId: 'mem-4',
    primaryContactName: 'Carlos Gómez Morales',
    address: '14 Sunningdale Gardens, Villa Elizabetha',
    contactPhone: '+260 966 987654',
    notes: 'Bilingual family (Spanish/English). Non-member spouse attending Bible studies.'
  },
  {
    id: 'fam-3',
    churchId: 'admin-initial',
    familyName: 'Walker-Tembo Household',
    primaryContactId: 'mem-7',
    primaryContactName: 'Alice Walker',
    address: '88 Great East Road, Olympia',
    contactPhone: '+260 955 456789',
    notes: 'Single parent household with two youth.'
  }
];

export const INITIAL_CHURCH_MEMBERS: ChurchMember[] = [
  {
    id: 'mem-1',
    name: 'David Mwale',
    givenNames: 'David',
    primarySurname: 'Mwale',
    churchId: 'admin-initial',
    status: 'active',
    baptismDate: '2015-08-22',
    dob: '1982-04-14',
    gender: 'male',
    contact: '+260 977 123456',
    email: 'david.mwale@adventist.org',
    address: 'Plot 412 Independence Way, Woodlands',
    familyUnitId: 'fam-1',
    relationshipToHead: 'Head of Household',
    memberType: 'baptized',
    lastAttendDate: '2026-08-29'
  },
  {
    id: 'mem-2',
    name: 'Grace Musonda Mwale',
    givenNames: 'Grace',
    primarySurname: 'Musonda',
    secondarySurname: 'Mwale',
    churchId: 'admin-initial',
    status: 'active',
    baptismDate: '2016-09-10',
    dob: '1986-11-20',
    gender: 'female',
    contact: '+260 977 123457',
    email: 'grace.mwale@adventist.org',
    address: 'Plot 412 Independence Way, Woodlands',
    familyUnitId: 'fam-1',
    relationshipToHead: 'Spouse',
    memberType: 'baptized',
    lastAttendDate: '2026-08-29'
  },
  {
    id: 'mem-3',
    name: 'Chileshe Mwale',
    givenNames: 'Chileshe',
    primarySurname: 'Mwale',
    churchId: 'admin-initial',
    status: 'active',
    dob: '2014-06-03',
    gender: 'male',
    address: 'Plot 412 Independence Way, Woodlands',
    familyUnitId: 'fam-1',
    relationshipToHead: 'Child',
    memberType: 'unbaptized_child'
  },
  {
    id: 'mem-4',
    name: 'Carlos Gómez Morales',
    givenNames: 'Carlos',
    primarySurname: 'Gómez',
    secondarySurname: 'Morales',
    churchId: 'admin-initial',
    status: 'active',
    baptismDate: '2012-04-07',
    dob: '1979-02-18',
    gender: 'male',
    contact: '+260 966 987654',
    email: 'carlos.gomez@adventist.org',
    address: '14 Sunningdale Gardens, Villa Elizabetha',
    familyUnitId: 'fam-2',
    relationshipToHead: 'Head of Household',
    memberType: 'baptized',
    lastAttendDate: '2026-08-22'
  },
  {
    id: 'mem-5',
    name: 'Elena Rodríguez Santos',
    givenNames: 'Elena',
    primarySurname: 'Rodríguez',
    secondarySurname: 'Santos',
    churchId: 'admin-initial',
    status: 'active',
    dob: '1983-09-12',
    gender: 'female',
    contact: '+260 966 987655',
    address: '14 Sunningdale Gardens, Villa Elizabetha',
    familyUnitId: 'fam-2',
    relationshipToHead: 'Spouse',
    memberType: 'non_member_spouse',
    notes: 'Regular visitor attending baptismal class.'
  } as ChurchMember,
  {
    id: 'mem-6',
    name: 'Mateo Gómez Rodríguez',
    givenNames: 'Mateo',
    primarySurname: 'Gómez',
    secondarySurname: 'Rodríguez',
    churchId: 'admin-initial',
    status: 'active',
    dob: '2018-12-01',
    gender: 'male',
    address: '14 Sunningdale Gardens, Villa Elizabetha',
    familyUnitId: 'fam-2',
    relationshipToHead: 'Child',
    memberType: 'unbaptized_child'
  },
  {
    id: 'mem-7',
    name: 'Alice Walker',
    givenNames: 'Alice',
    primarySurname: 'Walker',
    churchId: 'admin-initial',
    status: 'active',
    baptismDate: '2019-11-16',
    dob: '1990-07-25',
    gender: 'female',
    contact: '+260 955 456789',
    email: 'alice.walker@adventist.org',
    address: '88 Great East Road, Olympia',
    familyUnitId: 'fam-3',
    relationshipToHead: 'Head of Household',
    memberType: 'baptized',
    lastAttendDate: '2026-08-29'
  },
  {
    id: 'mem-8',
    name: 'Jonathan Phiri',
    givenNames: 'Jonathan',
    primarySurname: 'Phiri',
    churchId: 'admin-initial',
    status: 'missing',
    baptismDate: '2017-03-25',
    dob: '1985-05-10',
    gender: 'male',
    contact: '+260 971 000111',
    address: 'Plot 12 Chelston Green',
    memberType: 'baptized',
    outreachFlag: true,
    outreachNotes: 'Unaccounted for last 6 weeks. Deacon visiting scheduled.',
    lastAttendDate: '2026-07-11'
  },
  {
    id: 'mem-9',
    name: 'Ruth Bwalya',
    givenNames: 'Ruth',
    primarySurname: 'Bwalya',
    churchId: 'admin-initial',
    status: 'transferring',
    baptismDate: '2020-01-18',
    dob: '1995-10-30',
    gender: 'female',
    contact: '+260 965 222333',
    email: 'ruth.bwalya@adventist.org',
    address: 'Plot 77 Northmead',
    memberType: 'baptized',
    lastAttendDate: '2026-08-15'
  },
  {
    id: 'mem-10',
    name: 'Gabriel Banda',
    givenNames: 'Gabriel',
    primarySurname: 'Banda',
    churchId: 'admin-initial',
    status: 'censured',
    baptismDate: '2011-05-14',
    dob: '1978-08-19',
    gender: 'male',
    contact: '+260 978 333444',
    address: 'House 5 Rhodes Park',
    memberType: 'baptized',
    outreachFlag: true,
    outreachNotes: 'Under 6-month disciplinary censure per Church Board motion RES-2026-004. Pastoral care assigned to Elder Musonda.',
    lastAttendDate: '2026-08-22'
  },
  {
    id: 'mem-11',
    name: 'Late Elder Samuel Lungu',
    givenNames: 'Samuel',
    primarySurname: 'Lungu',
    churchId: 'admin-initial',
    status: 'deceased',
    baptismDate: '1975-04-12',
    dob: '1948-03-15',
    gender: 'male',
    address: 'Kabulonga, Lusaka',
    memberType: 'baptized',
    outreachNotes: 'Resting in the blessed hope. Memorial service held on 2026-05-18.'
  }
];

export const INITIAL_MEETINGS: ChurchMeeting[] = [
  {
    id: 'meet-1',
    churchId: 'admin-initial',
    title: 'Regular Monthly Church Board Meeting',
    type: 'BOARD',
    date: '2026-08-10',
    time: '18:30 - 20:45',
    location: 'Church Boardroom & Zoom',
    quorumConfirmed: true,
    quorumCount: 14,
    attendees: [
      'Pastor H. Chisenga (Chair)',
      'Elder Musonda (Head Elder)',
      'Sister Chanda (Clerk / Secretary)',
      'Brother Mwale (Treasurer)',
      'Brother B. Zulu (Head Deacon)',
      'Sister M. Kalunga (Head Deaconess)',
      'Elder P. Banda (Personal Ministries)'
    ],
    absentees: ['Sister T. Banda (Apology received - travel)'],
    agenda: [
      '1. Devotion & Season of Prayer',
      '2. Reading and Confirmation of Previous Minutes',
      '3. Membership Transfer Requests (In & Out)',
      '4. Evangelistic Campaign Budget & Dates',
      '5. Recommendation on Disciplinary Matters'
    ],
    minutes: 'The Church Board convened on Monday evening. Pastor Chisenga led the devotional from Nehemiah 2 emphasizing collaborative leadership and spiritual diligence. Following discussion, transfer recommendations were carried for reading before the congregation. Budget for the upcoming Voice of Prophecy effort was reviewed and recommended for business meeting ratification.',
    resolutions: [
      {
        id: 'res-1',
        meetingId: 'meet-1',
        resolutionNumber: 'RES-2026-018',
        motion: 'VOTED: To recommend to the church in business session the granting of letters of transfer for Sister Ruth Bwalya to Riverside SDA Church, Kitwe.',
        mover: 'Sister Chanda (Clerk)',
        seconder: 'Brother B. Zulu',
        tag: 'Membership Action',
        status: 'Carried',
        requiresBusinessMeeting: true,
        votedDate: '2026-08-10'
      },
      {
        id: 'res-2',
        meetingId: 'meet-1',
        resolutionNumber: 'RES-2026-019',
        motion: 'VOTED: To approve the procurement of 250 copies of the Adult Sabbath School Quarterly in Bemba and Tonga for Q4 distribution.',
        mover: 'Brother Mwale (Treasurer)',
        seconder: 'Elder Musonda',
        tag: 'Financial/Building',
        status: 'Carried',
        requiresBusinessMeeting: false,
        votedDate: '2026-08-10'
      }
    ]
  },
  {
    id: 'meet-2',
    churchId: 'admin-initial',
    title: 'Q3 Church Business Meeting',
    type: 'BUSINESS',
    date: '2026-08-23',
    time: '14:30 - 17:00',
    location: 'Main Church Sanctuary',
    quorumConfirmed: true,
    quorumCount: 86,
    attendees: ['Church Officers & Baptized Resident Members'],
    absentees: [],
    agenda: [
      '1. Opening Song & Prayer',
      '2. Church Clerk Membership Report (Additions, Transfers, Deaths)',
      '3. Treasurer Financial Statement',
      '4. Final Vote on Second Readings of Membership Transfers',
      '5. Ratification of Standing Committee Appointments'
    ],
    minutes: 'Duly called quarterly church business meeting. Notice was given in the church bulletin for two consecutive Sabbaths in accordance with the SDA Church Manual. Membership additions by baptism and profession of faith were celebrated. The treasurer presented the Q2 audited financial summary. Second readings of outgoing and incoming transfers were conducted and affirmed by congregation vote.',
    resolutions: [
      {
        id: 'res-3',
        meetingId: 'meet-2',
        resolutionNumber: 'RES-2026-020',
        motion: 'VOTED: Following second public reading, the church confirmed the reception of Brother Michael Tembo by transfer from Lusaka Central Church.',
        mover: 'Sister Chanda (Clerk)',
        seconder: 'Elder Musonda',
        tag: 'Membership Action',
        status: 'Carried',
        requiresBusinessMeeting: true,
        votedDate: '2026-08-23'
      }
    ]
  }
];

export const INITIAL_OFFICERS: ChurchOfficer[] = [
  {
    id: 'off-1',
    churchId: 'admin-initial',
    title: 'Head Elder',
    department: 'Pastoral & Elders',
    officerName: 'Elder Musonda',
    contact: '+260 977 111222',
    email: 'musonda@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'Board of Elders'
  },
  {
    id: 'off-2',
    churchId: 'admin-initial',
    title: 'Church Clerk',
    department: 'Secretariat & Records',
    officerName: 'Sister Chanda',
    contact: '+260 977 333444',
    email: 'clerk@church.org',
    termYear: '2026 - 2027',
    isChair: false,
    committeeName: 'Secretariat & Communications'
  },
  {
    id: 'off-3',
    churchId: 'admin-initial',
    title: 'Church Treasurer',
    department: 'Treasury & Finance',
    officerName: 'Brother Mwale',
    contact: '+260 977 555666',
    email: 'treasurer@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'Finance Committee'
  },
  {
    id: 'off-4',
    churchId: 'admin-initial',
    title: 'Head Deacon',
    department: 'Deaconry',
    officerName: 'Brother B. Zulu',
    contact: '+260 977 777888',
    email: 'deacons@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'Deacons Council'
  },
  {
    id: 'off-5',
    churchId: 'admin-initial',
    title: 'Head Deaconess',
    department: 'Deaconry',
    officerName: 'Sister M. Kalunga',
    contact: '+260 977 999000',
    email: 'deaconesses@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'Deaconesses Council'
  },
  {
    id: 'off-6',
    churchId: 'admin-initial',
    title: 'Sabbath School Superintendent',
    department: 'Sabbath School',
    officerName: 'Sister R. Simpasa',
    contact: '+260 966 112233',
    email: 'sabbathschool@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'Sabbath School Council'
  },
  {
    id: 'off-7',
    churchId: 'admin-initial',
    title: 'Personal Ministries Leader',
    department: 'Evangelism & Outreach',
    officerName: 'Elder P. Banda',
    contact: '+260 966 445566',
    email: 'evangelism@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'Evangelism Council'
  },
  {
    id: 'off-8',
    churchId: 'admin-initial',
    title: 'Adventist Youth (AY) Director',
    department: 'Youth Ministries',
    officerName: 'Brother K. Mutale',
    contact: '+260 955 778899',
    email: 'youth@church.org',
    termYear: '2026 - 2027',
    isChair: true,
    committeeName: 'AY Council'
  }
];

export const INITIAL_TRANSFER_REQUESTS: TransferRequest[] = [
  {
    id: 'tr-1',
    studentName: 'Michael Tembo',
    memberId: 'mem-ex-1',
    transferType: 'incoming',
    fromChurchId: 'ch-lusaka-central',
    fromChurchName: 'Lusaka Central SDA Church',
    toChurchId: 'admin-initial',
    toChurchName: 'Woodlands SDA Church',
    status: 'second_reading',
    requestDate: '2026-08-05',
    boardVoteDate: '2026-08-10',
    boardResolutionNo: 'RES-2026-015',
    firstReadingDate: '2026-08-16',
    secondReadingDate: '2026-08-23',
    reason: 'Relocated residence to Woodlands area for employment.',
    clerkNotes: 'Letter of recommendation in good standing received from Lusaka Central clerk.'
  },
  {
    id: 'tr-2',
    studentName: 'Ruth Bwalya',
    memberId: 'mem-9',
    transferType: 'outgoing',
    fromChurchId: 'admin-initial',
    fromChurchName: 'Woodlands SDA Church',
    toChurchId: 'ch-riverside-kitwe',
    toChurchName: 'Riverside SDA Church, Kitwe',
    status: 'first_reading',
    requestDate: '2026-08-02',
    boardVoteDate: '2026-08-10',
    boardResolutionNo: 'RES-2026-018',
    firstReadingDate: '2026-08-16',
    reason: 'Transferred to Copperbelt University for post-graduate studies.',
    clerkNotes: 'Board recommendation passed. 2nd reading scheduled for next Sabbath.'
  },
  {
    id: 'tr-3',
    studentName: 'Priscilla Chimuka',
    memberId: 'mem-ex-3',
    transferType: 'incoming',
    fromChurchId: 'ch-libala',
    fromChurchName: 'Libala SDA Church',
    toChurchId: 'admin-initial',
    toChurchName: 'Woodlands SDA Church',
    status: 'pending_board',
    requestDate: '2026-08-28',
    reason: 'Marriage and change of home church.',
    clerkNotes: 'Official transfer request form received via Conference portal.'
  }
];

export const INITIAL_BANK_ACCOUNTS: ChurchBankAccount[] = [
  {
    id: 'bank-1',
    churchId: 'admin-initial',
    accountName: 'Woodlands Seventh-day Adventist Church - General Operating Account',
    accountNumber: '028194820192',
    bankName: 'Standard Chartered Bank',
    branchName: 'Kabulonga Branch',
    accountType: 'operating_checking',
    currentBalance: 14850.50,
    isExclusiveChurchAccount: true,
    signatories: ['Elder Joseph Banda (Treasurer)', 'Dr. Hastings Phiri (First Elder)', 'Pastor Chimuka'],
    lastReconciledDate: '2026-08-31',
    reconciledBookBalance: 14850.50,
    status: 'active'
  },
  {
    id: 'bank-2',
    churchId: 'admin-initial',
    accountName: 'Woodlands SDA Church - Sanctuary Expansion Building Fund (Savings)',
    accountNumber: '039918239014',
    bankName: 'Zambia National Commercial Bank (Zanaco)',
    branchName: 'Corporate Branch',
    accountType: 'authorized_savings',
    boardAuthRef: 'MIN-2025-11-04 (Voted Church Board Minute: High-Yield Building Reserve)',
    currentBalance: 52400.00,
    isExclusiveChurchAccount: true,
    signatories: ['Elder Joseph Banda (Treasurer)', 'Dr. Hastings Phiri (First Elder)'],
    lastReconciledDate: '2026-08-31',
    reconciledBookBalance: 52400.00,
    status: 'active'
  }
];

export const INITIAL_AUXILIARY_DEPARTMENTS: AuxiliaryDepartment[] = [
  {
    id: 'aux-1',
    churchId: 'admin-initial',
    name: 'Adventist Youth Ministries (AYM)',
    leaderName: 'Ruth Bwalya',
    secretaryName: 'Chileshe Mwape',
    currentBalance: 3420.00,
    trustRuleConfirmed: true
  },
  {
    id: 'aux-2',
    churchId: 'admin-initial',
    name: 'Dorcas Society & Community Services',
    leaderName: 'Grace Tembo',
    secretaryName: 'Evelyn Mwale',
    currentBalance: 2150.00,
    trustRuleConfirmed: true
  },
  {
    id: 'aux-3',
    churchId: 'admin-initial',
    name: 'Family Life Ministries',
    leaderName: 'Elder David Mwale',
    secretaryName: 'Sarah Mwale',
    currentBalance: 1800.00,
    trustRuleConfirmed: true
  },
  {
    id: 'aux-4',
    churchId: 'admin-initial',
    name: 'Pathfinders & Adventurers Club',
    leaderName: 'James Banda',
    secretaryName: 'Mary Zulu',
    currentBalance: 2950.00,
    trustRuleConfirmed: true
  },
  {
    id: 'aux-5',
    churchId: 'admin-initial',
    name: 'Music & Church Choir',
    leaderName: 'Emmanuel Sakala',
    secretaryName: 'Beatrice Lungu',
    currentBalance: 1240.00,
    trustRuleConfirmed: true
  }
];

export const INITIAL_ENVELOPES: OfferingEnvelope[] = [
  {
    id: 'env-1',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0841',
    envelopeNumber: 'ENV-104',
    donorType: 'member',
    memberId: 'mem-1',
    donorName: 'David Mwale',
    date: '2026-08-29',
    paymentMethod: 'cash_envelope',
    items: [
      { id: 'item-1', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 1500.00 },
      { id: 'item-2', category: 'conference_trust', fundName: 'Regular World Mission Offering', amount: 200.00 },
      { id: 'item-3', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 300.00 },
      { id: 'item-4', category: 'local_church', fundName: 'Sanctuary Building Fund', amount: 250.00 }
    ],
    totalAmount: 2250.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-1b',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0902',
    envelopeNumber: 'ENV-104',
    donorType: 'member',
    memberId: 'mem-1',
    donorName: 'David Mwale',
    date: '2026-09-05',
    paymentMethod: 'bank_transfer',
    checkOrRefNumber: 'TX-ZMW-94821',
    items: [
      { id: 'item-1b1', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 1500.00 },
      { id: 'item-1b2', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 350.00 },
      { id: 'item-1b3', category: 'local_church', fundName: 'Sanctuary Building Fund', amount: 300.00 },
      { id: 'item-1b4', category: 'conference_trust', fundName: 'Thirteenth Sabbath Offering', amount: 100.00 }
    ],
    totalAmount: 2250.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-1c',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0715',
    envelopeNumber: 'ENV-104',
    donorType: 'member',
    memberId: 'mem-1',
    donorName: 'David Mwale',
    date: '2026-07-18',
    paymentMethod: 'cash_envelope',
    items: [
      { id: 'item-1c1', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 1500.00 },
      { id: 'item-1c2', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 250.00 },
      { id: 'item-1c3', category: 'auxiliary', fundName: 'Family Life Ministries', amount: 150.00 }
    ],
    totalAmount: 1900.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-1d',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2025-1120',
    envelopeNumber: 'ENV-104',
    donorType: 'member',
    memberId: 'mem-1',
    donorName: 'David Mwale',
    date: '2025-11-29',
    paymentMethod: 'cash_envelope',
    items: [
      { id: 'item-1d1', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 1400.00 },
      { id: 'item-1d2', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 200.00 }
    ],
    totalAmount: 1600.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-2',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0842',
    envelopeNumber: 'ENV-118',
    donorType: 'member',
    memberId: 'mem-4',
    donorName: 'Carlos Gómez Morales',
    date: '2026-08-29',
    paymentMethod: 'conference_egiving',
    checkOrRefNumber: 'EGV-98214-ZAM',
    items: [
      { id: 'item-5', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 2100.00 },
      { id: 'item-6', category: 'conference_trust', fundName: 'Thirteenth Sabbath Offering', amount: 150.00 },
      { id: 'item-7', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 400.00 },
      { id: 'item-8', category: 'auxiliary', fundName: 'Adventist Youth Ministries (AYM)', amount: 100.00 }
    ],
    totalAmount: 2750.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-2b',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0903',
    envelopeNumber: 'ENV-118',
    donorType: 'member',
    memberId: 'mem-4',
    donorName: 'Carlos Gómez Morales',
    date: '2026-09-05',
    paymentMethod: 'conference_egiving',
    checkOrRefNumber: 'EGV-99411-ZAM',
    items: [
      { id: 'item-2b1', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 2100.00 },
      { id: 'item-2b2', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 500.00 },
      { id: 'item-2b3', category: 'local_church', fundName: 'Sanctuary Building Fund', amount: 300.00 }
    ],
    totalAmount: 2900.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-3',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0843',
    envelopeNumber: 'ENV-142',
    donorType: 'member',
    memberId: 'mem-7',
    donorName: 'Alice Walker',
    date: '2026-08-29',
    paymentMethod: 'cash_envelope',
    items: [
      { id: 'item-9', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 800.00 },
      { id: 'item-10', category: 'conference_trust', fundName: 'Birthday-Thank Offering', amount: 50.00 },
      { id: 'item-11', category: 'local_church', fundName: 'Needy / Poor Benevolent Fund', amount: 150.00 },
      { id: 'item-12', category: 'auxiliary', fundName: 'Dorcas Society & Community Services', amount: 100.00 }
    ],
    totalAmount: 1100.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  },
  {
    id: 'env-4',
    churchId: 'admin-initial',
    receiptNumber: 'REC-2026-0904',
    envelopeNumber: 'ENV-156',
    donorType: 'member',
    memberId: 'mem-2',
    donorName: 'Grace Musonda Mwale',
    date: '2026-09-05',
    paymentMethod: 'cash_envelope',
    items: [
      { id: 'item-13', category: 'conference_trust', fundName: 'Tithe (Conference Trust)', amount: 1200.00 },
      { id: 'item-14', category: 'local_church', fundName: 'Local Church Operating Budget', amount: 200.00 },
      { id: 'item-15', category: 'local_church', fundName: 'Sanctuary Building Fund', amount: 200.00 },
      { id: 'item-16', category: 'auxiliary', fundName: 'Dorcas Society & Community Services', amount: 100.00 }
    ],
    totalAmount: 1700.00,
    isConfidential: true,
    issuedReceipt: true,
    receivedBy: 'Elder Joseph Banda'
  }
];

export const INITIAL_LOOSE_OFFERINGS: LooseOfferingRecord[] = [
  {
    id: 'loose-1',
    churchId: 'admin-initial',
    receiptNumber: 'LSE-2026-0829',
    date: '2026-08-29',
    serviceType: 'Divine Service',
    treasurerName: 'Elder Joseph Banda',
    secondOfficerName: 'Deacon Charles Zulu',
    secondOfficerRole: 'Deacon',
    denominationBreakdown: {
      bills100: 18, // 1800
      bills50: 24,  // 1200
      bills20: 35,  // 700
      bills10: 42,  // 420
      bills5: 28,   // 140
      coins: 65     // 65
    },
    totalAmount: 4325.00,
    targetFund: 'Local Church Budget (Combined Offering Plan)',
    isSignedByBoth: true,
    deaconReceiptIssued: true,
    notes: 'Counted together in treasury room immediately after divine service benediction.'
  }
];

export const INITIAL_SS_TRANSMISSIONS: SabbathSchoolTransmission[] = [
  {
    id: 'ss-trans-1',
    churchId: 'admin-initial',
    receiptNumber: 'SSR-2026-0829',
    date: '2026-08-29',
    secretaryName: 'Sister Mwamba (SS Secretary)',
    treasurerName: 'Elder Joseph Banda (Treasurer)',
    regularMissionOffering: 840.00,
    thirteenthSabbathOffering: 420.00,
    birthdayThankOffering: 160.00,
    missionInvestment: 280.00,
    sabbathSchoolExpense: 110.00,
    totalMissionAmount: 1700.00,
    acknowledgedReceiptGiven: true,
    status: 'remitted'
  },
  {
    id: 'ss-trans-2',
    churchId: 'admin-initial',
    receiptNumber: 'SSR-2026-0822',
    date: '2026-08-22',
    secretaryName: 'Sister Mwamba (SS Secretary)',
    treasurerName: 'Elder Joseph Banda (Treasurer)',
    regularMissionOffering: 780.00,
    thirteenthSabbathOffering: 310.00,
    birthdayThankOffering: 90.00,
    missionInvestment: 210.00,
    sabbathSchoolExpense: 95.00,
    totalMissionAmount: 1390.00,
    acknowledgedReceiptGiven: true,
    status: 'remitted'
  }
];

export const INITIAL_DISBURSEMENTS: DisbursementRecord[] = [
  {
    id: 'disb-1',
    churchId: 'admin-initial',
    voucherNumber: 'DIS-2026-0112',
    date: '2026-08-18',
    payee: 'ZESCO Power Corporation',
    fundCategory: 'local_church',
    fundName: 'Church Operating Budget - Utilities',
    amount: 980.00,
    boardMinuteRef: 'MIN-2026-07-08 (Standing Utility Authorization)',
    authorizedBy: 'Dr. Hastings Phiri (Board Chair)',
    billVoucherAttached: true,
    paymentMethod: 'bank_transfer',
    checkOrRefNumber: 'FT-9941824',
    description: 'Monthly electricity bill for church main auditorium and youth hall.',
    status: 'receipt_attached'
  },
  {
    id: 'disb-2',
    churchId: 'admin-initial',
    voucherNumber: 'DIS-2026-0113',
    date: '2026-08-24',
    payee: 'Ruth Bwalya (AYM Youth Leader)',
    fundCategory: 'auxiliary',
    fundName: 'Adventist Youth Ministries (AYM)',
    amount: 650.00,
    boardMinuteRef: 'AYM Executive Order #2026-04',
    authorizedBy: 'Ruth Bwalya (AYM Leader)',
    auxiliaryOrderSigned: true,
    billVoucherAttached: true,
    receiptIssuedToDepartment: true,
    paymentMethod: 'bank_transfer',
    checkOrRefNumber: 'FT-9948831',
    description: 'Procurement of youth camp meeting literature, badges, and first aid kit.',
    status: 'receipt_attached'
  },
  {
    id: 'disb-3',
    churchId: 'admin-initial',
    voucherNumber: 'DIS-2026-0114',
    date: '2026-08-28',
    payee: 'Grace Tembo (Dorcas Secretary)',
    fundCategory: 'auxiliary',
    fundName: 'Dorcas Society & Community Services',
    amount: 400.00,
    boardMinuteRef: 'Dorcas Executive Committee Vote #D-12',
    authorizedBy: 'Grace Tembo (Dorcas Leader)',
    auxiliaryOrderSigned: true,
    billVoucherAttached: true,
    receiptIssuedToDepartment: true,
    paymentMethod: 'petty_cash',
    checkOrRefNumber: 'PC-2026-039',
    description: 'Emergency food relief hampers (mealie meal, cooking oil) for vulnerable families.',
    status: 'receipt_attached'
  }
];

export const INITIAL_CONFERENCE_REMITTANCES: ConferenceRemittance[] = [
  {
    id: 'remit-2026-07',
    churchId: 'admin-initial',
    monthYear: '2026-07',
    remittanceNumber: 'REM-CONF-2026-07',
    dateRemitted: '2026-07-31',
    titheAmount: 18450.00,
    regularMissionAmount: 3200.00,
    thirteenthSabbathAmount: 1650.00,
    birthdayThankAmount: 480.00,
    missionInvestmentAmount: 920.00,
    specialConferenceProjectsAmount: 1200.00,
    totalRemittance: 25900.00,
    conferenceTreasurerName: 'Elder M. S. Katulwende (Conference Treasurer)',
    conferenceReceiptNumber: 'CR-LUS-2026-7841',
    bankTransferRef: 'EFT-SCB-99812491',
    nonDiversionPledgeConfirmed: true,
    status: 'remitted_acknowledged'
  },
  {
    id: 'remit-2026-08',
    churchId: 'admin-initial',
    monthYear: '2026-08',
    remittanceNumber: 'REM-CONF-2026-08',
    dateRemitted: '2026-08-31',
    titheAmount: 19820.00,
    regularMissionAmount: 3450.00,
    thirteenthSabbathAmount: 1820.00,
    birthdayThankAmount: 510.00,
    missionInvestmentAmount: 1050.00,
    specialConferenceProjectsAmount: 1400.00,
    totalRemittance: 28050.00,
    conferenceTreasurerName: 'Elder M. S. Katulwende (Conference Treasurer)',
    conferenceReceiptNumber: 'CR-LUS-2026-8219',
    bankTransferRef: 'EFT-SCB-99931820',
    nonDiversionPledgeConfirmed: true,
    status: 'remitted_acknowledged'
  }
];

export const INITIAL_LITERATURE_ORDERS: LiteratureOrder[] = [
  {
    id: 'lit-1',
    churchId: 'admin-initial',
    orderNumber: 'ABC-2026-042',
    orderDate: '2026-08-15',
    memberOrDepartmentName: 'Sabbath School Department',
    itemsDescription: 'Adult Sabbath School Lesson Quarterlies Q4 (40 copies Standard, 10 copies Teacher Edition)',
    amountCollected: 1250.00,
    remittedToAbcDate: '2026-08-19',
    abcInvoiceRef: 'INV-ABC-9418',
    paymentMethod: 'transfer',
    status: 'delivered'
  },
  {
    id: 'lit-2',
    churchId: 'admin-initial',
    orderNumber: 'ABC-2026-043',
    orderDate: '2026-08-25',
    memberOrDepartmentName: 'Family Life & Individual Members',
    itemsDescription: '5x The Adventist Home, 3x Messages to Young People, 12x 2027 Daily Devotionals',
    amountCollected: 890.00,
    remittedToAbcDate: '2026-08-28',
    abcInvoiceRef: 'INV-ABC-9502',
    paymentMethod: 'transfer',
    status: 'remitted_to_abc'
  }
];

export const INITIAL_AUDIT_RECORD: AuditRecord = {
  id: 'audit-2025',
  churchId: 'admin-initial',
  year: 2025,
  auditorName: 'P. Kangwa, ACCA (Conference Auditor)',
  auditDate: '2026-03-14',
  auditScope: 'Full annual financial audit of all Church, Auxiliary, and Conference trust funds for fiscal year 2025.',
  controlledInspectionLogs: [
    {
      date: '2026-08-10',
      inspectorName: 'Pastor Chimuka',
      inspectorRole: 'Pastor',
      purpose: 'Mid-year financial statement and auxiliary fund review prior to Board meeting.'
    },
    {
      date: '2026-07-15',
      inspectorName: 'Dr. Hastings Phiri',
      inspectorRole: 'First Elder',
      purpose: 'Routine inspection of bank reconciliation and trust fund remittance vouchers.'
    }
  ],
  findingsSummary: 'Records maintained with exceptional fidelity to the SDA Church Manual. 100% of Conference trust funds remitted strictly monthly. Dual-counting loose offering sheets properly co-signed. Auxiliary ledgers strictly segregated.',
  status: 'certified_clean',
  auditOpinion: 'clean_unqualified',
  conferenceName: 'Lusaka Conference of SDA',
  officialLetterPreserved: true
};

export const INITIAL_AUDIT_RECORDS: AuditRecord[] = [INITIAL_AUDIT_RECORD];

// -------------------------------------------------------------
// SABBATH SCHOOL SUPERINTENDENT INITIAL STATE (SDA Church Manual)
// -------------------------------------------------------------

export const INITIAL_MOBILISATION_PLAN: MobilisationPlanItem[] = [
  {
    id: 'mob-1',
    phase: 'immediate_post_election',
    title: 'Post-Election Strategic Mobilisation',
    description: 'Begin immediate planning for smooth and effective operation of Sabbath School as soon as elected.',
    deadline: '2026-01-10',
    isCompleted: true,
    completedDate: '2026-01-08',
    mandatedBy: 'SDA Church Manual (Executive Leadership)',
    notes: 'Prioritized early planning prior to new ecclesiastical term.'
  },
  {
    id: 'mob-2',
    phase: 'council_convening',
    title: 'Convene Inaugural Sabbath School Council Meeting',
    description: 'Call the chief administrative body of Sabbath School together to organize all divisions and auxiliary positions.',
    deadline: '2026-01-18',
    isCompleted: true,
    completedDate: '2026-01-15',
    mandatedBy: 'SDA Church Manual (Council Chairperson)',
    notes: 'Full quorum achieved with Pastor Chimuka and Elder Musonda in attendance.'
  },
  {
    id: 'mob-3',
    phase: 'council_convening',
    title: 'Appoint Non-Council Auxiliary Officers',
    description: 'Lead council in appointing assistant division leaders, division secretaries, music directors, pianists, organists, and greeters.',
    deadline: '2026-01-25',
    isCompleted: true,
    completedDate: '2026-01-22',
    mandatedBy: 'SDA Church Manual (Staffing & Appointments)',
    notes: 'Greeters and music rosters confirmed for all divisions.'
  },
  {
    id: 'mob-4',
    phase: 'council_convening',
    title: 'Vetting of Teachers & Church Board Recommendation',
    description: 'Carefully choose teachers who are members in regular standing, consult children division leaders, and submit roster to Church Board.',
    deadline: '2026-02-05',
    isCompleted: true,
    completedDate: '2026-02-01',
    mandatedBy: 'SDA Church Manual (Teacher Quality Control)',
    notes: 'Approved at Church Board meeting Min RES-2026-018.'
  },
  {
    id: 'mob-5',
    phase: 'curriculum_procurement',
    title: 'Audit & Supply General Conference Bible Study Guides',
    description: 'Verify adequate supplies of age-level GC Bible study guides for all divisions from Beginner to Adult.',
    deadline: '2026-06-20',
    isCompleted: true,
    completedDate: '2026-06-18',
    mandatedBy: 'SDA Church Manual (Operational Oversight)',
    notes: 'Q3 inventory received from Adventist Book Centre (ABC).'
  },
  {
    id: 'mob-6',
    phase: 'quarterly_launch',
    title: '30-Minute Uninterrupted Class Study Adherence Audit',
    description: 'Enforce program timetable guarantee providing teachers and classes a minimum of 30 uninterrupted minutes for Scripture study.',
    deadline: '2026-07-04',
    isCompleted: true,
    completedDate: '2026-07-04',
    mandatedBy: 'SDA Church Manual (Study of Scripture)',
    notes: '40-minute slot (09:45 - 10:25) voted and strictly enforced.'
  },
  {
    id: 'mob-7',
    phase: 'ongoing_oversight',
    title: 'Weekly Teachers Preparation Meetings Coordination',
    description: 'Maintain weekly teachers preparation sessions to ensure doctrinal unity, pedagogy excellence, and lesson readiness.',
    deadline: '2026-09-05',
    isCompleted: true,
    completedDate: '2026-09-04',
    mandatedBy: 'SDA Church Manual (Unity of Doctrine)',
    notes: 'Conducted every Friday evening at 18:00.'
  },
  {
    id: 'mob-8',
    phase: 'ongoing_oversight',
    title: 'End-of-Quarter Secretarial Reconciliation & Conference Transmission',
    description: 'Work with SS Secretary to complete quarterly report immediately after 13th Sabbath and submit promptly to Conference.',
    deadline: '2026-09-30',
    isCompleted: false,
    mandatedBy: 'SDA Church Manual (Secretarial Accountability)',
    notes: 'Scheduled for immediate audit after 13th Sabbath on Sept 26.'
  }
];

export const INITIAL_CONFERENCE_EMPHASES: ConferenceEmphases = {
  id: 'conf-emph-2026',
  conferenceName: 'Lusaka Conference of Seventh-day Adventists',
  quarter: 'Q3 2026',
  annualTheme: 'Rooted in the Word, Growing in Grace, Going into the Harvest',
  priorityEmphases: [
    'Systematic Daily Lesson Study: 70%+ daily study target across all Sabbath School action units.',
    'Sabbath School Action Units: Dedicated 10-minute weekly outreach and community care segment in class time.',
    'Southern Asia-Pacific Division (SSD) 13th Sabbath Projects: Promoting offering goals for Adventist schools and clinics.',
    'Branch Sabbath Schools & Story Hours: Active establishment of neighborhood Bible clubs in surrounding communities.',
    'Community Guest Day: Intentional non-member invitation Sabbath with coordinated hospitality.'
  ],
  recommendedCurricula: [
    'Adult Sabbath School Bible Study Guide (Standard & Teachers Edition)',
    'Collegiate Quarterly / Young Adult InVerse',
    'Cornerstones (Youth) & Real-Time Faith (Earliteen)',
    'PowerPoints (Junior), Primary, Kindergarten & Beginner (Alive in Jesus & Gracelink)'
  ],
  upcomingTrainingEvents: [
    {
      date: '2026-09-19',
      title: 'Conference Sabbath School Master Teacher Workshop',
      locationOrLink: 'Lusaka Central Church Auditorium & Online Stream',
      targetAudience: 'All Division Leaders, Teachers & Assistant Superintendents'
    },
    {
      date: '2026-10-04',
      title: 'Q4 VBS & Childrens Ministries Review & Leadership Summit',
      locationOrLink: 'Conference Headquarters, Woodlands',
      targetAudience: 'Children Division Leaders & VBS Directors'
    }
  ],
  directorNotes: 'The Conference Sabbath School Department commends Woodlands Church for exemplary reporting and robust mission offering transmissions. Please ensure all newly appointed teachers have completed the child safety briefing.'
};

export const INITIAL_CURRICULUM_INVENTORY: SSCurriculumItem[] = [
  {
    id: 'curr-1',
    divisionLevel: 'Adult Standard',
    quarter: 'Q3 2026',
    guideTitle: 'The Book of Mark (Standard Edition)',
    quantityNeeded: 180,
    quantityReceived: 200,
    quantityDistributed: 185,
    bufferStock: 15,
    status: 'distributed',
    notes: 'Well received; includes English, Bemba, and Nyanja translations.'
  },
  {
    id: 'curr-2',
    divisionLevel: 'Adult Large Print',
    quarter: 'Q3 2026',
    guideTitle: 'The Book of Mark (Large Print Edition)',
    quantityNeeded: 35,
    quantityReceived: 40,
    quantityDistributed: 35,
    bufferStock: 5,
    status: 'distributed',
    notes: 'Reserved for senior members and visually impaired.'
  },
  {
    id: 'curr-3',
    divisionLevel: 'Adult Teachers Edition',
    quarter: 'Q3 2026',
    guideTitle: 'The Book of Mark (Teachers Pedagogical Edition)',
    quantityNeeded: 25,
    quantityReceived: 30,
    quantityDistributed: 24,
    bufferStock: 6,
    status: 'distributed',
    notes: 'Distributed to all certified adult division teachers.'
  },
  {
    id: 'curr-4',
    divisionLevel: 'Collegiate / Young Adult',
    quarter: 'Q3 2026',
    guideTitle: 'inVerse Bible Study Guide: Discipleship & Mission',
    quantityNeeded: 50,
    quantityReceived: 50,
    quantityDistributed: 48,
    bufferStock: 2,
    status: 'distributed',
    notes: 'Young Adult / University student unit.'
  },
  {
    id: 'curr-5',
    divisionLevel: 'Cornerstones / Youth',
    quarter: 'Q3 2026',
    guideTitle: 'Cornerstone Connections (Youth 15-18)',
    quantityNeeded: 65,
    quantityReceived: 70,
    quantityDistributed: 64,
    bufferStock: 6,
    status: 'distributed',
    notes: 'Youth division classes.'
  },
  {
    id: 'curr-6',
    divisionLevel: 'Real-Time Faith / Earliteen',
    quarter: 'Q3 2026',
    guideTitle: 'Real-Time Faith (Earliteen 12-14)',
    quantityNeeded: 45,
    quantityReceived: 50,
    quantityDistributed: 44,
    bufferStock: 6,
    status: 'distributed',
    notes: 'Earliteen division.'
  },
  {
    id: 'curr-7',
    divisionLevel: 'PowerPoints / Junior',
    quarter: 'Q3 2026',
    guideTitle: 'Junior PowerPoints (Ages 10-11)',
    quantityNeeded: 55,
    quantityReceived: 60,
    quantityDistributed: 52,
    bufferStock: 8,
    status: 'distributed',
    notes: 'Junior division.'
  },
  {
    id: 'curr-8',
    divisionLevel: 'Primary',
    quarter: 'Q3 2026',
    guideTitle: 'Primary Bible Study Guide (Ages 6-9)',
    quantityNeeded: 70,
    quantityReceived: 75,
    quantityDistributed: 70,
    bufferStock: 5,
    status: 'distributed',
    notes: 'Includes activity workbooks.'
  },
  {
    id: 'curr-9',
    divisionLevel: 'Kindergarten',
    quarter: 'Q3 2026',
    guideTitle: 'Kindergarten Bible Study Guide (Ages 3-5)',
    quantityNeeded: 40,
    quantityReceived: 45,
    quantityDistributed: 38,
    bufferStock: 7,
    status: 'distributed',
    notes: 'Visual story felts and crafts provided.'
  },
  {
    id: 'curr-10',
    divisionLevel: 'Beginner / Cradle Roll',
    quarter: 'Q3 2026',
    guideTitle: 'Beginner Cradle Roll (Birth - Age 2)',
    quantityNeeded: 30,
    quantityReceived: 35,
    quantityDistributed: 28,
    bufferStock: 7,
    status: 'distributed',
    notes: 'Parent instruction guides provided.'
  }
];

export const STUDY_GUIDE_PRICES: Record<string, number> = {
  'Adult Standard': 35,
  'Adult Large Print': 45,
  'Adult Teachers Edition': 50,
  'Collegiate / Young Adult': 35,
  'Cornerstones / Youth': 35,
  'Real-Time Faith / Earliteen': 35,
  'PowerPoints / Junior': 30,
  'Primary': 30,
  'Kindergarten': 30,
  'Beginner / Cradle Roll': 30,
  'Ellen White Companion Book': 65
};

export const INITIAL_STUDY_GUIDE_ORDERS: StudyGuideOrder[] = [
  {
    id: 'sgo-1',
    churchId: 'admin-initial',
    orderNumber: 'SGO-2026-001',
    orderDate: '2026-08-20',
    memberId: 'mem-1',
    memberName: 'Elder Musonda',
    memberContact: '+260 977 111222',
    memberEmail: 'musonda@church.org',
    guideType: 'Adult Teachers Edition',
    quarter: 'Q4 2026',
    quantity: 2,
    unitPrice: 50,
    totalAmount: 100,
    paymentStatus: 'paid',
    amountPaid: 100,
    paymentMethod: 'Mobile Money',
    paymentDate: '2026-08-20',
    orderStatus: 'distributed',
    distributedDate: '2026-09-05',
    notes: 'Personal copy and one for assistant teacher.',
    takenBySuperintendent: 'Sister R. Simpasa'
  },
  {
    id: 'sgo-2',
    churchId: 'admin-initial',
    orderNumber: 'SGO-2026-002',
    orderDate: '2026-08-24',
    memberId: 'mem-2',
    memberName: 'Sister Chanda',
    memberContact: '+260 977 333444',
    guideType: 'Cornerstones / Youth',
    quarter: 'Q4 2026',
    quantity: 3,
    unitPrice: 35,
    totalAmount: 105,
    paymentStatus: 'paid',
    amountPaid: 105,
    paymentMethod: 'Cash',
    paymentDate: '2026-08-24',
    orderStatus: 'received_from_abc',
    notes: 'For youth class facilitators at next quarter kickoff.',
    takenBySuperintendent: 'Sister R. Simpasa'
  },
  {
    id: 'sgo-3',
    churchId: 'admin-initial',
    orderNumber: 'SGO-2026-003',
    orderDate: '2026-08-29',
    memberId: 'mem-7',
    memberName: 'Alice Walker',
    memberContact: '+260 955 456789',
    memberEmail: 'alice.walker@adventist.org',
    guideType: 'Adult Large Print',
    quarter: 'Q4 2026',
    quantity: 2,
    unitPrice: 45,
    totalAmount: 90,
    paymentStatus: 'paid',
    amountPaid: 90,
    paymentMethod: 'SS Envelope',
    paymentDate: '2026-08-29',
    orderStatus: 'placed',
    notes: 'Special request: large font print for senior family members.',
    takenBySuperintendent: 'Sister R. Simpasa'
  },
  {
    id: 'sgo-4',
    churchId: 'admin-initial',
    orderNumber: 'SGO-2026-004',
    orderDate: '2026-09-02',
    memberId: 'mem-9',
    memberName: 'Ruth Bwalya',
    memberContact: '+260 965 222333',
    memberEmail: 'ruth.bwalya@adventist.org',
    guideType: 'Collegiate / Young Adult',
    quarter: 'Q4 2026',
    quantity: 1,
    unitPrice: 35,
    totalAmount: 35,
    paymentStatus: 'pending',
    amountPaid: 0,
    orderStatus: 'placed',
    notes: 'Will pay via Airtel Money this Sabbath.',
    takenBySuperintendent: 'Sister R. Simpasa'
  },
  {
    id: 'sgo-5',
    churchId: 'admin-initial',
    orderNumber: 'SGO-2026-005',
    orderDate: '2026-09-04',
    memberName: 'Brother Chilufya Tembo',
    memberContact: '+260 976 543210',
    guideType: 'Primary',
    quarter: 'Q4 2026',
    quantity: 2,
    unitPrice: 30,
    totalAmount: 60,
    paymentStatus: 'paid',
    amountPaid: 60,
    paymentMethod: 'Cash',
    paymentDate: '2026-09-04',
    orderStatus: 'received_from_abc',
    notes: 'Primary lesson quarterly for two children in Grade 3 and 4.',
    takenBySuperintendent: 'Sister R. Simpasa'
  },
  {
    id: 'sgo-6',
    churchId: 'admin-initial',
    orderNumber: 'SGO-2026-006',
    orderDate: '2026-09-05',
    memberId: 'mem-4',
    memberName: 'Carlos Gómez Morales',
    memberContact: '+260 966 987654',
    guideType: 'Ellen White Companion Book',
    quarter: 'Q4 2026',
    quantity: 1,
    unitPrice: 65,
    totalAmount: 65,
    paymentStatus: 'paid',
    amountPaid: 65,
    paymentMethod: 'Bank Transfer',
    paymentDate: '2026-09-05',
    orderStatus: 'placed',
    notes: 'EGW Sabbath School Quarterly Companion volume.',
    takenBySuperintendent: 'Sister R. Simpasa'
  }
];

export const INITIAL_PROGRAM_RUN_SHEET: SSProgramRunSheet = {
  id: 'run-sheet-2026-09-12',
  sabbathDate: '2026-09-12',
  quarterTheme: 'Rooted in the Word, Growing in Grace',
  superintendentOnDuty: 'Sister R. Simpasa (Superintendent)',
  songLeader: 'Brother J. Mutale (Music Director)',
  pianistOrOrganist: 'Sister C. Mwape (Pianist)',
  headGreeter: 'Sister M. Kalunga (Head Greeter)',
  greeters: ['Sister M. Kalunga', 'Brother B. Zulu', 'Sister S. Jenkins'],
  missionSpotlightTitle: 'Light on the Island: Hospital Boat Ministries in the Philippines (SSD)',
  lessonStudyDurationMinutes: 40, // EXCEEDS the 30-min minimum!
  isTeachingTimeGuaranteed: true,
  notes: 'Sabbath School starts promptly at 09:15. Teaching time strictly begins at 09:45 and concludes at 10:25.',
  segments: [
    {
      id: 'seg-1',
      timeRange: '09:15 - 09:25',
      title: 'Praise & Song Service, Welcome & Invocation',
      personResponsible: 'Brother J. Mutale & Sister C. Mwape',
      purpose: 'Fellowship',
      durationMinutes: 10,
      notes: 'Hymn #272 "Give Me the Bible", Hymn #334 "Come Thou Fount"'
    },
    {
      id: 'seg-2',
      timeRange: '09:25 - 09:30',
      title: 'Superintendents Purpose Address & Memory Verse Challenge',
      personResponsible: 'Sister R. Simpasa (Superintendent)',
      purpose: 'Administration',
      durationMinutes: 5,
      notes: 'Recitation of weekly memory verse across all divisions'
    },
    {
      id: 'seg-3',
      timeRange: '09:30 - 09:38',
      title: 'World Mission Feature: Southern Asia-Pacific Division (SSD)',
      personResponsible: 'Brother G. Banda (Investment Secretary)',
      purpose: 'World Mission',
      durationMinutes: 8,
      notes: 'Video story from General Conference Mission Quarterly'
    },
    {
      id: 'seg-4',
      timeRange: '09:38 - 09:45',
      title: 'Sabbath School Action Unit Outreach & Personal Ministries Call',
      personResponsible: 'Elder P. Banda (Personal Ministries Leader)',
      purpose: 'Community Outreach',
      durationMinutes: 7,
      notes: 'Sharing testimonies of weekly literature distribution & Community Guest Day progress'
    },
    {
      id: 'seg-5',
      timeRange: '09:45 - 10:25',
      title: 'Class Lesson Study: Lesson 11 "Filled With the Holy Spirit"',
      personResponsible: 'Assigned Sabbath School Class Teachers',
      purpose: 'Study',
      durationMinutes: 40,
      notes: 'CRITICAL MANDATE: At least 30 minutes of uninterrupted study time guaranteed.'
    },
    {
      id: 'seg-6',
      timeRange: '10:25 - 10:30',
      title: 'Class Mission Offerings Collection & Closing Prayer',
      personResponsible: 'Class Secretaries & Teachers',
      purpose: 'World Mission',
      durationMinutes: 5,
      notes: 'Regular SS Offering & Mission Investment collection recorded in register'
    }
  ]
};

export const INITIAL_COUNCIL_MEMBERS: SSCouncilMember[] = [
  {
    id: 'cm-1',
    churchId: 'admin-initial',
    name: 'Sister R. Simpasa',
    roleTitle: 'Superintendent',
    divisionScope: 'General Sabbath School',
    contact: '+260 966 112233',
    email: 'superintendent@church.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-2',
    churchId: 'admin-initial',
    name: 'Brother M. Chilufya',
    roleTitle: 'Assistant Superintendent',
    divisionScope: 'Program Logistics & Media',
    contact: '+260 977 441122',
    email: 'm.chilufya@church.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-3',
    churchId: 'admin-initial',
    name: 'Sister N. Mwansa',
    roleTitle: 'Sabbath School Secretary',
    divisionScope: 'Statistical Records & Conference Reports',
    contact: '+260 966 553311',
    email: 'ss.secretary@church.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-4',
    churchId: 'admin-initial',
    name: 'Sister T. Tembo',
    roleTitle: 'Assistant Secretary',
    divisionScope: 'Class Register Audits',
    contact: '+260 955 889900',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-15'
  },
  {
    id: 'cm-5',
    churchId: 'admin-initial',
    name: 'Elder David Mwale',
    roleTitle: 'Adult Division Leader',
    divisionScope: 'Adult Sabbath School (Classes 1 - 8)',
    contact: '+260 977 123456',
    email: 'david.mwale@adventist.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-6',
    churchId: 'admin-initial',
    name: 'Sister Chanda',
    roleTitle: 'Youth Division Leader',
    divisionScope: 'Youth & Collegiate',
    contact: '+260 977 333444',
    email: 'chanda@church.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-7',
    churchId: 'admin-initial',
    name: 'Brother K. Lungu',
    roleTitle: 'Earliteen / Junior Leader',
    divisionScope: 'Earliteen & Junior Divisions',
    contact: '+260 966 778899',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-8',
    churchId: 'admin-initial',
    name: 'Sister L. Phiri',
    roleTitle: 'Childrens Division Leader',
    divisionScope: 'Primary, Kindergarten, Cradle Roll',
    contact: '+260 971 223344',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-9',
    churchId: 'admin-initial',
    name: 'Brother Gabriel Banda',
    roleTitle: 'Investment Secretary',
    divisionScope: 'Mission Investment Promotion',
    contact: '+260 978 889911',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-10',
    churchId: 'admin-initial',
    name: 'Elder P. Banda',
    roleTitle: 'Personal Ministries Leader',
    divisionScope: 'Evangelism & Action Units',
    contact: '+260 966 445566',
    email: 'evangelism@church.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-11',
    churchId: 'admin-initial',
    name: 'Sister E. Zulu',
    roleTitle: 'Childrens Ministries Coordinator / VBS Director',
    divisionScope: 'VBS, Story Hours & Neighborhood Clubs',
    contact: '+260 977 001122',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-12',
    churchId: 'admin-initial',
    name: 'Elder Musonda',
    roleTitle: 'Appointed Elder',
    divisionScope: 'Board of Elders Oversight',
    contact: '+260 977 111222',
    email: 'musonda@church.org',
    isVotingMember: true,
    term: '2026 - 2027',
    appointedDate: '2026-01-05'
  },
  {
    id: 'cm-13',
    churchId: 'admin-initial',
    name: 'Pastor Chimuka',
    roleTitle: 'Local Pastor',
    divisionScope: 'General Pastoral Guidance',
    contact: '+260 977 000999',
    email: 'pastor@church.org',
    isVotingMember: true,
    term: 'Ex-officio',
    appointedDate: '2026-01-05'
  }
];

export const INITIAL_AUXILIARY_OFFICERS: SSAuxiliaryOfficer[] = [
  {
    id: 'aux-1',
    churchId: 'admin-initial',
    name: 'Sister C. Mwape',
    roleTitle: 'Pianist',
    division: 'General Sabbath School',
    contact: '+260 977 881122',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  },
  {
    id: 'aux-2',
    churchId: 'admin-initial',
    name: 'Brother F. Bwalya',
    roleTitle: 'Organist',
    division: 'General Sabbath School',
    contact: '+260 966 334455',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  },
  {
    id: 'aux-3',
    churchId: 'admin-initial',
    name: 'Brother J. Mutale',
    roleTitle: 'Music Director',
    division: 'General Sabbath School',
    contact: '+260 955 667788',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  },
  {
    id: 'aux-4',
    churchId: 'admin-initial',
    name: 'Sister M. Kalunga',
    roleTitle: 'Hospitality Coordinator',
    division: 'General Sabbath School',
    contact: '+260 977 999000',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  },
  {
    id: 'aux-5',
    churchId: 'admin-initial',
    name: 'Brother B. Zulu',
    roleTitle: 'Greeter / Hostess',
    division: 'General Sabbath School',
    contact: '+260 977 777888',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  },
  {
    id: 'aux-6',
    churchId: 'admin-initial',
    name: 'Sister Alice Walker',
    roleTitle: 'Assistant Division Leader',
    division: 'Primary',
    contact: '+260 955 456789',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  },
  {
    id: 'aux-7',
    churchId: 'admin-initial',
    name: 'Brother T. Silwimba',
    roleTitle: 'Division Secretary',
    division: 'Youth Division',
    contact: '+260 971 445566',
    councilAppointedDate: '2026-01-22',
    status: 'active'
  }
];

export const INITIAL_TEACHER_CANDIDATES: SSTeacherCandidate[] = [
  {
    id: 'tc-1',
    churchId: 'admin-initial',
    memberId: 'mem-1',
    name: 'Elder Musonda',
    division: 'Adult',
    assignedClassName: 'Adult Sabbath School (Class 1)',
    classroomLocation: 'Main Sanctuary - North Wing (Pews 1-6)',
    assistantTeacherName: 'Brother Mwape Zulu',
    isMemberInRegularStanding: true,
    divisionLeaderConsulted: true,
    boardApprovalStatus: 'board_approved',
    boardResolutionNumber: 'RES-2026-018',
    boardVoteDate: '2026-01-28',
    teachersMeetingAttendanceRate: 95,
    contact: '+260 977 111222',
    email: 'musonda@church.org',
    childSafetyCertified: true,
    childSafetyExpiryDate: '2027-12-31',
    yearsOfService: 12,
    studyGuideAssigned: 'Adult Teachers Edition (Q3/Q4)',
    status: 'active',
    notes: 'Seasoned Bible instructor; maintains doctrinal unity and prompt class start.'
  },
  {
    id: 'tc-2',
    churchId: 'admin-initial',
    memberId: 'mem-2',
    name: 'Sister Chanda',
    division: 'Youth',
    assignedClassName: 'Youth Ministry (Class 2)',
    classroomLocation: 'Youth Hall - Room 2B',
    assistantTeacherName: 'Brother Kelvin Mwanza',
    isMemberInRegularStanding: true,
    divisionLeaderConsulted: true,
    boardApprovalStatus: 'board_approved',
    boardResolutionNumber: 'RES-2026-018',
    boardVoteDate: '2026-01-28',
    teachersMeetingAttendanceRate: 90,
    contact: '+260 977 333444',
    email: 'chanda@church.org',
    childSafetyCertified: true,
    childSafetyExpiryDate: '2027-06-30',
    yearsOfService: 5,
    studyGuideAssigned: 'Cornerstones / Youth Edition',
    status: 'active',
    notes: 'Dynamic youth facilitator; excellent student engagement and Bible study discussion.'
  },
  {
    id: 'tc-3',
    churchId: 'admin-initial',
    memberId: 'mem-3',
    name: 'Brother Mwale',
    division: 'Primary',
    assignedClassName: 'Primary Class (Class 3)',
    classroomLocation: 'Children Ministry Complex - Room 102',
    assistantTeacherName: 'Sister Grace Tembo',
    isMemberInRegularStanding: true,
    divisionLeaderConsulted: true,
    boardApprovalStatus: 'board_approved',
    boardResolutionNumber: 'RES-2026-018',
    boardVoteDate: '2026-01-28',
    teachersMeetingAttendanceRate: 88,
    contact: '+260 977 555666',
    email: 'mwale@church.org',
    childSafetyCertified: true,
    childSafetyExpiryDate: '2028-01-15',
    yearsOfService: 7,
    studyGuideAssigned: 'Primary Bible Study Guide & Felt Kit',
    status: 'active',
    notes: 'Consulted with Children Division Leader Sister L. Phiri prior to board recommendation.'
  },
  {
    id: 'tc-4',
    churchId: 'admin-initial',
    memberId: 'mem-4',
    name: 'Carlos Gómez Morales',
    division: 'Adult',
    assignedClassName: 'Bilingual / Spanish Study Unit',
    classroomLocation: 'Board Room Annex',
    assistantTeacherName: 'Brother Diego Rivera',
    isMemberInRegularStanding: true,
    divisionLeaderConsulted: true,
    boardApprovalStatus: 'council_recommended',
    teachersMeetingAttendanceRate: 92,
    contact: '+260 966 987654',
    email: 'carlos.gomez@church.org',
    childSafetyCertified: true,
    childSafetyExpiryDate: '2027-09-01',
    yearsOfService: 3,
    studyGuideAssigned: 'Adult Standard Spanish / English',
    status: 'active',
    notes: 'Recommended by Sabbath School Council; pending formal vote at next Church Board.'
  },
  {
    id: 'tc-5',
    churchId: 'admin-initial',
    memberId: 'mem-7',
    name: 'Alice Walker',
    division: 'Earliteen',
    assignedClassName: 'Earliteen Action Unit',
    classroomLocation: 'Youth Complex - Room 1A',
    assistantTeacherName: 'Sister Brenda Chileshe',
    isMemberInRegularStanding: true,
    divisionLeaderConsulted: true,
    boardApprovalStatus: 'council_recommended',
    teachersMeetingAttendanceRate: 85,
    contact: '+260 955 456789',
    email: 'alice.walker@adventist.org',
    childSafetyCertified: true,
    childSafetyExpiryDate: '2027-11-20',
    yearsOfService: 4,
    studyGuideAssigned: 'Real-Time Faith / Earliteen',
    status: 'active',
    notes: 'Division leader Brother K. Lungu strongly recommends appointment.'
  },
  {
    id: 'tc-6',
    churchId: 'admin-initial',
    memberId: 'mem-5',
    name: 'Elena Rodríguez Santos',
    division: 'Adult',
    assignedClassName: 'Prospective Assistant',
    classroomLocation: 'Main Sanctuary',
    isMemberInRegularStanding: false, // Non-member spouse!
    divisionLeaderConsulted: false,
    boardApprovalStatus: 'draft_selection',
    teachersMeetingAttendanceRate: 40,
    contact: '+260 966 987655',
    email: 'elena.santos@gmail.com',
    childSafetyCertified: false,
    yearsOfService: 0,
    status: 'inactive',
    notes: 'CHURCH MANUAL RESTRAINT: Currently attending baptismal class. Cannot be recommended as teacher until baptized into regular membership standing.'
  }
];

export const INITIAL_TEACHERS_MEETINGS: SSTeachersMeeting[] = [
  {
    id: 'tm-1',
    churchId: 'admin-initial',
    date: '2026-09-04',
    lessonNumber: 10,
    lessonTitle: 'The Gospel in Action: Christ’s Compassion',
    leaderName: 'Sister R. Simpasa (Superintendent)',
    attendees: ['Elder Musonda', 'Sister Chanda', 'Brother Mwale', 'Carlos Gómez Morales', 'Alice Walker'],
    doctrinalFocus: 'The dual nature of Christ and the sanctuary typology in Gospel healing narratives.',
    teachingPedagogyHelps: 'Techniques for inductive questioning and keeping discussion focused without letting single individuals dominate.',
    notes: 'Full participation. Handed out supplementary research briefs from the Biblical Research Institute.'
  },
  {
    id: 'tm-2',
    churchId: 'admin-initial',
    date: '2026-08-28',
    lessonNumber: 9,
    lessonTitle: 'The Cost of Discipleship and Cross-Bearing',
    leaderName: 'Pastor Chimuka',
    attendees: ['Elder Musonda', 'Sister Chanda', 'Brother Mwale', 'Alice Walker'],
    doctrinalFocus: 'Justification by faith vs legalism; true grace leading to willing obedience.',
    teachingPedagogyHelps: 'Encouraging daily Bible study habit using memory verse review cards.',
    notes: 'Reviewed lesson plan and allocated 40 minutes for class study time.'
  }
];

export const INITIAL_EVANGELISM_PROJECTS: SSEvangelismProject[] = [
  {
    id: 'evang-1',
    churchId: 'admin-initial',
    type: 'Community Guest Day',
    title: 'Annual Sabbath School Community Guest Day & Friendship Dinner',
    targetDate: '2026-09-19',
    coordinatorName: 'Sister R. Simpasa & Elder P. Banda',
    partnerDepartment: 'Personal Ministries & Deaconry',
    status: 'planning',
    participantsCount: 120,
    notes: 'Every Sabbath School action unit committed to bringing at least two community friends or neighbors. Special luncheon prepared.'
  },
  {
    id: 'evang-2',
    churchId: 'admin-initial',
    type: 'Pastors Bible Class',
    title: 'Weekly Baptismal Class & Seekers Action Unit',
    targetDate: '2026-09-12',
    coordinatorName: 'Pastor Chimuka & Elder Musonda',
    partnerDepartment: 'Pastoral & Sabbath School Adult Division',
    status: 'in_progress',
    participantsCount: 16,
    decisionsOrBaptismsCount: 8,
    notes: 'Meets every Sabbath at 09:45 during lesson study time. 8 candidates preparing for December baptism.'
  },
  {
    id: 'evang-3',
    churchId: 'admin-initial',
    type: 'Vacation Bible School',
    title: 'Summer VBS: "Champions of Faith" Community Outreach',
    targetDate: '2026-08-15',
    coordinatorName: 'Sister E. Zulu (VBS Director)',
    partnerDepartment: 'Childrens Ministries & Sabbath School',
    status: 'completed',
    participantsCount: 85,
    decisionsOrBaptismsCount: 22,
    notes: '85 community children attended over 5 days; 22 enrolled into weekly Primary and Junior Sabbath School divisions.'
  },
  {
    id: 'evang-4',
    churchId: 'admin-initial',
    type: 'Branch Sabbath School',
    title: 'Chelston Green Story Hour & Neighborhood Bible Club',
    targetDate: '2026-09-26',
    coordinatorName: 'Sister Alice Walker & Youth Division',
    partnerDepartment: 'Youth Ministries & Personal Ministries',
    status: 'in_progress',
    participantsCount: 35,
    decisionsOrBaptismsCount: 4,
    notes: 'Conducted Sabbath afternoons at Chelston Community Park. 35 children and parents attending regularly.'
  },
  {
    id: 'evang-5',
    churchId: 'admin-initial',
    type: 'Decision Day',
    title: 'Third Quarter Decision Day for Christ',
    targetDate: '2026-09-26',
    coordinatorName: 'Sister R. Simpasa & Pastor Chimuka',
    partnerDepartment: 'All Divisions',
    status: 'planning',
    participantsCount: 250,
    notes: 'Appeals made simultaneously across Adult, Youth, and Earliteen classes before 13th Sabbath.'
  }
];

export const INITIAL_QUARTERLY_REPORT_STATUS: SSConferenceQuarterlyReportStatus = {
  id: 'rep-q3-2026',
  churchId: 'admin-initial',
  quarter: 'Q3 2026',
  lastSabbathDate: '2026-09-26',
  dueDate: '2026-09-30',
  checklist: {
    classesRegistersReconciled: true,
    dailyStudyTabulated: true,
    missionOfferingsVerifiedWithTreasurer: true,
    outreachActivitiesCompiled: true,
    superintendentSigned: true,
    secretarySigned: true,
    submittedToConference: false
  },
  conferenceDirectorFeedback: 'Previous quarter (Q2) report commended for 100% on-time submission. Ready for Q3 compilation.'
};

export const INITIAL_MINISTERIAL_CREDENTIALS: MinisterialCredential[] = [
  {
    id: 'cred-1',
    conferenceId: 'conf-lusaka',
    ministerName: 'Pastor Dr. Harrington Simpasa',
    email: 'president@conference.org',
    phone: '+260 211 251234',
    type: 'ORDAINED_MINISTER',
    credentialNumber: 'LC-ORD-2022-001',
    districtName: 'Conference Headquarters Circuit',
    assignedChurchName: 'Lusaka Central Church',
    issueDate: '2022-01-15',
    expiryDate: '2027-01-15',
    status: 'active',
    votedByExecutiveCommitteeDate: '2021-12-08'
  },
  {
    id: 'cred-2',
    conferenceId: 'conf-lusaka',
    ministerName: 'Pastor H. Chisenga',
    email: 'pastor@district.org',
    phone: '+260 977 123456',
    type: 'ORDAINED_MINISTER',
    credentialNumber: 'LC-ORD-2023-014',
    districtId: 'dist-woodlands',
    districtName: 'Woodlands District',
    assignedChurchName: 'Woodlands SDA Church',
    issueDate: '2023-02-01',
    expiryDate: '2028-02-01',
    status: 'active',
    votedByExecutiveCommitteeDate: '2023-01-12'
  },
  {
    id: 'cred-3',
    conferenceId: 'conf-lusaka',
    ministerName: 'Pastor Brian Mulenga',
    email: 'bmulenga@conference.org',
    phone: '+260 971 889900',
    type: 'LICENSED_PASTOR',
    credentialNumber: 'LC-LIC-2024-032',
    districtId: 'dist-central',
    districtName: 'Central Lusaka District',
    assignedChurchName: 'Libala SDA Church',
    issueDate: '2024-06-15',
    expiryDate: '2026-11-30',
    status: 'expiring_soon',
    votedByExecutiveCommitteeDate: '2024-05-20'
  },
  {
    id: 'cred-4',
    conferenceId: 'conf-lusaka',
    ministerName: 'Sister Grace Mwamba',
    email: 'gmwamba@conference.org',
    phone: '+260 966 443322',
    type: 'BIBLE_INSTRUCTOR',
    credentialNumber: 'LC-BI-2023-009',
    districtId: 'dist-woodlands',
    districtName: 'Woodlands District',
    assignedChurchName: 'Woodlands SDA Church',
    issueDate: '2023-03-10',
    expiryDate: '2028-03-10',
    status: 'active',
    votedByExecutiveCommitteeDate: '2023-02-18'
  },
  {
    id: 'cred-5',
    conferenceId: 'conf-lusaka',
    ministerName: 'Elder Dr. Peter Sampa',
    email: 'psampa@conference.org',
    phone: '+260 955 776655',
    type: 'COMMISSIONED_HEALING_MINISTER',
    credentialNumber: 'LC-CHM-2021-004',
    districtId: 'dist-matero',
    districtName: 'Matero District',
    assignedChurchName: 'Matero Main SDA Church',
    issueDate: '2021-08-20',
    expiryDate: '2026-08-20',
    status: 'renewed',
    votedByExecutiveCommitteeDate: '2026-07-15'
  }
];

export const INITIAL_STATISTICAL_COMPLIANCE: StatisticalComplianceReport[] = [
  {
    id: 'stat-woodlands-2026-09',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-woodlands',
    churchId: 'church-woodlands',
    churchName: 'Woodlands SDA Church',
    month: 'September 2026',
    deadlineDate: '2026-10-07',
    submittedDate: '2026-10-04',
    status: 'on_time',
    membershipStart: 312,
    baptisms: 6,
    professionsOfFaith: 1,
    lettersIn: 3,
    lettersOut: 2,
    deaths: 0,
    removals: 0,
    membershipEnd: 320,
    ssAttendanceAverage: 283,
    titheRemitted: 21650,
    acmsSyncStatus: 'synced',
    verifiedByClerkName: 'Sister Chanda'
  },
  {
    id: 'stat-libala-2026-09',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-central',
    churchId: 'church-libala',
    churchName: 'Libala SDA Church',
    month: 'September 2026',
    deadlineDate: '2026-10-07',
    submittedDate: '2026-10-06',
    status: 'on_time',
    membershipStart: 210,
    baptisms: 4,
    professionsOfFaith: 0,
    lettersIn: 2,
    lettersOut: 1,
    deaths: 0,
    removals: 0,
    membershipEnd: 215,
    ssAttendanceAverage: 194,
    titheRemitted: 14200,
    acmsSyncStatus: 'synced',
    verifiedByClerkName: 'Brother J. Mwanza'
  },
  {
    id: 'stat-kabulonga-2026-09',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-woodlands',
    churchId: 'church-kabulonga',
    churchName: 'Kabulonga Mission Company',
    month: 'September 2026',
    deadlineDate: '2026-10-07',
    submittedDate: '2026-10-09',
    status: 'late',
    membershipStart: 42,
    baptisms: 2,
    professionsOfFaith: 0,
    lettersIn: 1,
    lettersOut: 0,
    deaths: 0,
    removals: 0,
    membershipEnd: 45,
    ssAttendanceAverage: 38,
    titheRemitted: 3850,
    acmsSyncStatus: 'pending_verification',
    verifiedByClerkName: 'Sister M. Tembo'
  },
  {
    id: 'stat-matero-2026-09',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-matero',
    churchId: 'church-matero',
    churchName: 'Matero Main SDA Church',
    month: 'September 2026',
    deadlineDate: '2026-10-07',
    status: 'overdue',
    membershipStart: 480,
    baptisms: 0,
    professionsOfFaith: 0,
    lettersIn: 0,
    lettersOut: 0,
    deaths: 0,
    removals: 0,
    membershipEnd: 480,
    ssAttendanceAverage: 410,
    titheRemitted: 0,
    acmsSyncStatus: 'failed',
    verifiedByClerkName: 'Clerk Pending'
  }
];

export const INITIAL_DELEGATE_QUOTAS: ConstituencyDelegateQuota[] = [
  {
    id: 'del-woodlands',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-woodlands',
    churchId: 'church-woodlands',
    churchName: 'Woodlands SDA Church',
    officialMembership: 320,
    basicQuota: 1,
    proportionalQuota: 6, // 320 / 50 = 6 delegates
    totalDelegatesAllocated: 7,
    delegatesSubmittedCount: 7,
    status: 'accredited',
    votedByChurchDate: '2026-08-23'
  },
  {
    id: 'del-libala',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-central',
    churchId: 'church-libala',
    churchName: 'Libala SDA Church',
    officialMembership: 215,
    basicQuota: 1,
    proportionalQuota: 4,
    totalDelegatesAllocated: 5,
    delegatesSubmittedCount: 5,
    status: 'accredited',
    votedByChurchDate: '2026-08-30'
  },
  {
    id: 'del-matero',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-matero',
    churchId: 'church-matero',
    churchName: 'Matero Main SDA Church',
    officialMembership: 480,
    basicQuota: 1,
    proportionalQuota: 9,
    totalDelegatesAllocated: 10,
    delegatesSubmittedCount: 8,
    status: 'provisional',
    votedByChurchDate: '2026-09-06'
  },
  {
    id: 'del-kabulonga',
    conferenceId: 'conf-lusaka',
    districtId: 'dist-woodlands',
    churchId: 'church-kabulonga',
    churchName: 'Kabulonga Mission Company',
    officialMembership: 45,
    basicQuota: 1,
    proportionalQuota: 0,
    totalDelegatesAllocated: 1,
    delegatesSubmittedCount: 0,
    status: 'pending_submission'
  }
];

export const INITIAL_COMPANY_PROJECTS: CompanyPlantingProject[] = [
  {
    id: 'plant-1',
    districtId: 'dist-woodlands',
    conferenceId: 'conf-lusaka',
    name: 'State Lodge Branch Sabbath School',
    location: 'State Lodge Area, Lusaka East',
    type: 'BRANCH_SABBATH_SCHOOL',
    currentActiveMembers: 24,
    motherChurchName: 'Woodlands SDA Church',
    appointedLeaderName: 'Elder M. Kalenga',
    appointedClerkName: 'Sister F. Mutale',
    appointedTreasurerName: 'Brother D. Chola',
    targetOrganizationDate: '2026-12-19',
    pastorRecommendationStatus: 'recommended'
  },
  {
    id: 'plant-2',
    districtId: 'dist-woodlands',
    conferenceId: 'conf-lusaka',
    name: 'Kabulonga Mission Company',
    location: 'Kabulonga Shopping Centre vicinity',
    type: 'COMPANY',
    currentActiveMembers: 45,
    motherChurchName: 'Woodlands SDA Church',
    appointedLeaderName: 'Brother T. Nyirenda',
    appointedClerkName: 'Sister M. Tembo',
    appointedTreasurerName: 'Brother S. Banda',
    targetOrganizationDate: '2027-02-14',
    pastorRecommendationStatus: 'approved_by_conference',
    executiveCommitteeVotedDate: '2026-07-28'
  },
  {
    id: 'plant-3',
    districtId: 'dist-central',
    conferenceId: 'conf-lusaka',
    name: 'Kamwala South Pioneer Group',
    location: 'Kamwala South Community Hall',
    type: 'MISSION_GROUP',
    currentActiveMembers: 18,
    motherChurchName: 'Libala SDA Church',
    appointedLeaderName: 'Elder J. Phiri',
    appointedClerkName: 'Sister N. Lungu',
    appointedTreasurerName: 'Brother C. Mwila',
    targetOrganizationDate: '2027-04-10',
    pastorRecommendationStatus: 'in_progress'
  }
];


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

