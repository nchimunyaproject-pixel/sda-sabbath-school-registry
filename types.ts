export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CONFERENCE_ADMIN = 'CONFERENCE_ADMIN',
  CONFERENCE_PRESIDENT = 'CONFERENCE_PRESIDENT',
  DISTRICT_ADMIN = 'DISTRICT_ADMIN',
  DISTRICT_PASTOR = 'DISTRICT_PASTOR',
  CHURCH_ADMIN = 'CHURCH_ADMIN',
  CLERK = 'CLERK',
  TEACHER = 'TEACHER',
  TREASURER = 'TREASURER',
  SUPERINTENDENT = 'SUPERINTENDENT',
  VIEWER = 'VIEWER'
}

export interface Conference {
  id: string;
  name: string;
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
  headquartersCity?: string;
  unionName?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  created_at?: string;
}

export interface District {
  id: string;
  name: string;
  conferenceId: string;
  conferenceName?: string;
  pastorName?: string;
  pastorEmail?: string;
  pastorPhone?: string;
  headquartersChurchId?: string;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  churches?: Church[];
}

export interface Church {
  id: string;
  name?: string;
  church_name?: string;
  districtId?: string;
  province?: string;
  location?: string;
  email?: string;
  phone_number?: string;
  clerkName?: string;
  clerkEmail?: string;
  clerkPassword?: string;
  pastor_name?: string;
  pastorName?: string;
  pastorId?: string;
  membership?: number;
  status?: 'pending' | 'approved';
  is_active?: boolean;
  conference?: string;
  conferenceId?: string;
  district?: string;
  city?: string;
  address?: string;
  phone?: string;
  elderName?: string;
  elderEmail?: string;
  isDemo?: boolean;
  createdAt?: string;
  created_at?: string;
}

export type ChurchStation = Church;

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
  districtName?: string;
  conferenceId?: string;
  conferenceName?: string;
  phone?: string;
  title?: string;
  is_first_login?: boolean;
  temp_password?: string;
  is_active?: boolean;
  status?: 'active' | 'inactive';
  createdAt?: string;
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
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'male' | 'female' | 'other';
  baptized?: boolean;
  member_since?: string;
  emergency_contact?: string;
  medical_notes?: string;
  address?: string;
  isTransferring?: boolean;
  memberId?: string;
}

export type MemberStatus = 'active' | 'transferring' | 'missing' | 'censured' | 'disfellowshipped' | 'deceased' | 'transferred' | 'removed';

export interface ChurchMember {
  id: string;
  name: string;
  memberNumber?: string;
  givenNames?: string;
  primarySurname?: string;
  secondarySurname?: string;
  churchId: string;
  status: MemberStatus;
  baptismDate?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  contact?: string;
  email?: string;
  address?: string;
  familyUnitId?: string;
  relationshipToHead?: 'Head of Household' | 'Spouse' | 'Child' | 'Dependent' | 'Relative' | 'Other';
  memberType?: 'baptized' | 'non_baptized_family' | 'non_member_spouse' | 'unbaptized_child';
  outreachFlag?: boolean;
  outreachNotes?: string;
  lastAttendDate?: string;
}

export interface FamilyUnit {
  id: string;
  churchId: string;
  familyName: string;
  primaryContactId: string;
  primaryContactName?: string;
  address: string;
  contactPhone: string;
  notes?: string;
}

export type TransferStatus = 'pending' | 'pending_board' | 'first_reading' | 'second_reading' | 'approved' | 'rejected';

export interface TransferRequest {
  id: string;
  studentId?: string;
  memberId?: string;
  studentName: string;
  transferType?: 'incoming' | 'outgoing';
  fromChurchId: string;
  fromChurchName: string;
  toChurchId: string;
  toChurchName: string;
  status: TransferStatus;
  requestDate: string;
  approvalDate?: string;
  reason?: string;
  boardVoteDate?: string;
  boardResolutionNo?: string;
  firstReadingDate?: string;
  secondReadingDate?: string;
  eAdventistSynced?: boolean;
  clerkNotes?: string;
}

export interface MeetingResolution {
  id: string;
  meetingId: string;
  resolutionNumber: string;
  motion: string;
  mover: string;
  seconder: string;
  tag: 'Membership Action' | 'Financial/Building' | 'Elections' | 'Discipline' | 'General Policy';
  status: 'Carried' | 'Defeated' | 'Tabled';
  requiresBusinessMeeting: boolean;
  votedDate: string;
}

export interface ChurchMeeting {
  id: string;
  churchId: string;
  title: string;
  type: 'BOARD' | 'BUSINESS';
  date: string;
  time: string;
  location: string;
  quorumConfirmed: boolean;
  quorumCount: number;
  attendees: string[];
  absentees: string[];
  agenda: string[];
  minutes: string;
  resolutions: MeetingResolution[];
}

export interface ChurchOfficer {
  id: string;
  churchId: string;
  title: string;
  department: string;
  officerName: string;
  contact?: string;
  email?: string;
  termYear: string;
  isChair: boolean;
  committeeName?: string;
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
  churchId?: string;
}

export interface Announcement {
  id: string;
  teacherId: string;
  teacherName: string;
  className: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'compiled';
  targetType?: 'CONFERENCE' | 'DISTRICT' | 'CHURCH';
  targetId?: string;
  priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  expiryDate?: string;
  isArchived?: boolean;
  readReceipts?: string[];
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

export interface OutreachReport {
  prospectiveMembersCount: number;
  dailyStudyPlanCount: number;
  bibleStudiesGivenCount: number;
  personalWitnessingCount: number;
  literatureGivenCount: number;
  christianHelpValue: number;
  christianHelpHours: number;
  vopEnrolmentsCount: number;
  vopGraduationsCount: number;
  prospectiveMembersVisitedCount: number;
  actionUnitProjectsCount: number;
  totalReportingCount: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  visitorCount: number;
  lessonStudyCount?: number;
  records: Student[];
  visitors: Visitor[];
  outreachReport?: OutreachReport;
}

// -------------------------------------------------------------
// TREASURY & FINANCIAL SYSTEM TYPES (SDA Church Manual Aligned)
// -------------------------------------------------------------

export type FundCategory = 'conference_trust' | 'local_church' | 'auxiliary';

export interface ChurchBankAccount {
  id: string;
  churchId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  accountType: 'operating_checking' | 'authorized_savings' | 'term_deposit';
  boardAuthRef?: string;
  currentBalance: number;
  isExclusiveChurchAccount: boolean;
  signatories: string[];
  lastReconciledDate: string;
  reconciledBookBalance: number;
  status: 'active' | 'frozen' | 'archived';
}

export interface OfferingEnvelopeItem {
  id: string;
  category: FundCategory;
  fundName: string;
  amount: number;
}

export interface OfferingEnvelope {
  id: string;
  churchId: string;
  receiptNumber: string;
  envelopeNumber?: string;
  donorType: 'member' | 'visitor' | 'anonymous';
  memberId?: string;
  donorName: string;
  date: string;
  paymentMethod: 'cash_envelope' | 'check' | 'conference_egiving' | 'bank_transfer';
  checkOrRefNumber?: string;
  items: OfferingEnvelopeItem[];
  totalAmount: number;
  isConfidential: boolean;
  treasurerNotes?: string;
  issuedReceipt: boolean;
  receivedBy: string;
}

export interface LooseOfferingRecord {
  id: string;
  churchId: string;
  receiptNumber: string;
  date: string;
  serviceType: 'Divine Service' | 'Sabbath School' | 'AY Service' | 'Midweek Prayer' | 'Camp Meeting';
  treasurerName: string;
  secondOfficerName: string;
  secondOfficerRole: 'Deacon' | 'Deaconess' | 'Elder';
  denominationBreakdown: {
    bills100?: number;
    bills50?: number;
    bills20?: number;
    bills10?: number;
    bills5?: number;
    coins?: number;
  };
  totalAmount: number;
  targetFund: string;
  isSignedByBoth: boolean;
  deaconReceiptIssued: boolean;
  notes?: string;
}

export interface SabbathSchoolTransmission {
  id: string;
  churchId: string;
  receiptNumber: string;
  date: string;
  secretaryName: string;
  treasurerName: string;
  regularMissionOffering: number;
  thirteenthSabbathOffering: number;
  birthdayThankOffering: number;
  missionInvestment: number;
  sabbathSchoolExpense?: number;
  totalMissionAmount: number;
  acknowledgedReceiptGiven: boolean;
  status: 'received' | 'remitted';
}

export interface DisbursementRecord {
  id: string;
  churchId: string;
  voucherNumber: string;
  date: string;
  payee: string;
  fundCategory: 'local_church' | 'auxiliary';
  fundName: string;
  amount: number;
  boardMinuteRef: string;
  authorizedBy: string;
  auxiliaryOrderSigned?: boolean;
  billVoucherAttached: boolean;
  receiptIssuedToDepartment?: boolean;
  paymentMethod: 'check' | 'bank_transfer' | 'petty_cash';
  checkOrRefNumber?: string;
  description: string;
  status: 'draft' | 'board_approved' | 'disbursed' | 'receipt_attached';
}

export interface AuxiliaryDepartment {
  id: string;
  churchId: string;
  name: string;
  leaderName: string;
  secretaryName: string;
  currentBalance: number;
  trustRuleConfirmed: boolean;
}

export interface ConferenceRemittance {
  id: string;
  churchId: string;
  monthYear: string;
  remittanceNumber: string;
  dateRemitted: string;
  titheAmount: number;
  regularMissionAmount: number;
  thirteenthSabbathAmount: number;
  birthdayThankAmount: number;
  missionInvestmentAmount: number;
  specialConferenceProjectsAmount: number;
  totalRemittance: number;
  conferenceTreasurerName: string;
  conferenceReceiptNumber?: string;
  bankTransferRef: string;
  nonDiversionPledgeConfirmed: boolean;
  status: 'draft' | 'pending_remittance' | 'remitted_acknowledged';
}

export interface LiteratureOrder {
  id: string;
  churchId: string;
  orderNumber: string;
  orderDate: string;
  memberOrDepartmentName: string;
  itemsDescription: string;
  amountCollected: number;
  remittedToAbcDate?: string;
  abcInvoiceRef?: string;
  paymentMethod: 'cash' | 'transfer';
  status: 'collected' | 'remitted_to_abc' | 'delivered';
}

export interface AuditRecord {
  id: string;
  churchId: string;
  year: number | string;
  auditorName: string;
  auditDate: string;
  auditScope?: string;
  controlledInspectionLogs?: Array<{
    date: string;
    inspectorName: string;
    inspectorRole: 'Conference Auditor' | 'Pastor' | 'District Leader' | 'First Elder' | 'Board Audit Committee';
    purpose: string;
  }>;
  findingsSummary: string;
  status: 'pending' | 'in_progress' | 'certified_clean' | 'reconciled_with_exceptions' | 'completed';
  auditorTitle?: string;
  conferenceName?: string;
  auditOpinion?: 'clean_unqualified' | 'qualified' | 'adverse';
  boardPresentedDate?: string;
  officialLetterPreserved?: boolean;
}

// -------------------------------------------------------------
// SABBATH SCHOOL SUPERINTENDENT DOMAIN (SDA Church Manual)
// -------------------------------------------------------------

export interface MobilisationPlanItem {
  id: string;
  phase: 'immediate_post_election' | 'council_convening' | 'curriculum_procurement' | 'quarterly_launch' | 'ongoing_oversight';
  title: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  completedDate?: string;
  mandatedBy: string;
  notes?: string;
}

export interface ConferenceEmphases {
  id: string;
  conferenceName: string;
  quarter: string;
  annualTheme: string;
  priorityEmphases: string[];
  recommendedCurricula: string[];
  upcomingTrainingEvents: Array<{
    date: string;
    title: string;
    locationOrLink: string;
    targetAudience: string;
  }>;
  directorNotes: string;
}

export interface SSCurriculumItem {
  id: string;
  divisionLevel: 'Adult Standard' | 'Adult Large Print' | 'Adult Teachers Edition' | 'Collegiate / Young Adult' | 'Cornerstones / Youth' | 'Real-Time Faith / Earliteen' | 'PowerPoints / Junior' | 'Primary' | 'Kindergarten' | 'Beginner / Cradle Roll';
  quarter: string;
  guideTitle: string;
  quantityNeeded: number;
  quantityReceived: number;
  quantityDistributed: number;
  bufferStock: number;
  status: 'ordered' | 'partially_received' | 'fully_stocked' | 'distributed';
  notes?: string;
}

export interface StudyGuideOrder {
  id: string;
  churchId: string;
  orderNumber: string;
  orderDate: string;
  memberId?: string;
  memberName: string;
  memberContact: string;
  memberEmail?: string;
  guideType: 
    | 'Adult Standard'
    | 'Adult Large Print'
    | 'Adult Teachers Edition'
    | 'Collegiate / Young Adult'
    | 'Cornerstones / Youth'
    | 'Real-Time Faith / Earliteen'
    | 'PowerPoints / Junior'
    | 'Primary'
    | 'Kindergarten'
    | 'Beginner / Cradle Roll'
    | 'Ellen White Companion Book';
  quarter: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partially_paid';
  amountPaid: number;
  paymentMethod?: 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'SS Envelope';
  paymentDate?: string;
  orderStatus: 'placed' | 'confirmed_abc' | 'received_from_abc' | 'distributed' | 'cancelled';
  distributedDate?: string;
  notes?: string;
  takenBySuperintendent: string;
}

export interface SSProgramSegment {
  id: string;
  timeRange: string;
  title: string;
  personResponsible: string;
  purpose: 'Study' | 'Fellowship' | 'Community Outreach' | 'World Mission' | 'Administration';
  durationMinutes: number;
  notes?: string;
}

export interface SSProgramRunSheet {
  id: string;
  sabbathDate: string;
  quarterTheme: string;
  superintendentOnDuty: string;
  songLeader: string;
  pianistOrOrganist: string;
  headGreeter: string;
  greeters: string[];
  missionSpotlightTitle: string;
  lessonStudyDurationMinutes: number;
  isTeachingTimeGuaranteed: boolean;
  segments: SSProgramSegment[];
  notes?: string;
}

export type CouncilRoleTitle = 
  | 'Superintendent' 
  | 'Assistant Superintendent' 
  | 'Sabbath School Secretary' 
  | 'Assistant Secretary' 
  | 'Adult Division Leader' 
  | 'Youth Division Leader' 
  | 'Earliteen / Junior Leader' 
  | 'Childrens Division Leader' 
  | 'Investment Secretary' 
  | 'Personal Ministries Leader' 
  | 'Childrens Ministries Coordinator / VBS Director' 
  | 'Appointed Elder' 
  | 'Local Pastor';

export interface SSCouncilMember {
  id: string;
  churchId: string;
  name: string;
  roleTitle: CouncilRoleTitle;
  divisionScope?: string;
  contact: string;
  email?: string;
  isVotingMember: boolean;
  term: string;
  appointedDate: string;
}

export interface SSAuxiliaryOfficer {
  id: string;
  churchId: string;
  name: string;
  roleTitle: 'Assistant Division Leader' | 'Division Secretary' | 'Music Director' | 'Pianist' | 'Organist' | 'Greeter / Hostess' | 'Hospitality Coordinator';
  division: 'General Sabbath School' | 'Adult Division' | 'Youth Division' | 'Earliteen' | 'Junior' | 'Primary' | 'Kindergarten' | 'Cradle Roll';
  contact: string;
  councilAppointedDate: string;
  status: 'active' | 'inactive';
}

export interface SSTeacherCandidate {
  id: string;
  churchId: string;
  memberId: string;
  name: string;
  division: 'Adult' | 'Youth' | 'Earliteen' | 'Junior' | 'Primary' | 'Kindergarten' | 'Cradle Roll';
  assignedClassName?: string;
  classroomLocation?: string;
  assistantTeacherName?: string;
  isMemberInRegularStanding: boolean;
  divisionLeaderConsulted: boolean;
  boardApprovalStatus: 'draft_selection' | 'council_recommended' | 'board_approved' | 'rejected';
  boardResolutionNumber?: string;
  boardVoteDate?: string;
  teachersMeetingAttendanceRate: number;
  contact: string;
  email?: string;
  childSafetyCertified?: boolean;
  childSafetyExpiryDate?: string;
  yearsOfService?: number;
  studyGuideAssigned?: string;
  status?: 'active' | 'on_leave' | 'substitute' | 'inactive';
  notes?: string;
}

export interface SSTeachersMeeting {
  id: string;
  churchId: string;
  date: string;
  lessonNumber: number;
  lessonTitle: string;
  leaderName: string;
  attendees: string[];
  doctrinalFocus: string;
  teachingPedagogyHelps: string;
  notes?: string;
}

export interface SSEvangelismProject {
  id: string;
  churchId: string;
  type?: 'Decision Day' | 'Pastors Bible Class' | 'Community Guest Day' | 'Vacation Bible School' | 'Branch Sabbath School' | 'Neighborhood Bible Club' | 'Story Hour' | 'Action Unit Project';
  projectType?: 'community_guest_day' | 'decision_day' | 'pastors_bible_class' | 'vacation_bible_school' | 'branch_sabbath_school' | 'neighborhood_bible_club' | string;
  title: string;
  targetDate: string;
  coordinatorName?: string;
  leadCoordinator?: string;
  partnerDepartment?: string;
  collaboratingDepartment?: string;
  status: 'planning' | 'planned' | 'in_progress' | 'completed';
  participantsCount?: number;
  participantsEnrolled?: number;
  decisionsOrBaptismsCount?: number;
  decisionsCount?: number;
  goalsAndObjectives?: string;
  notes?: string;
}

export interface SSGreetingSchedule {
  id: string;
  churchId: string;
  sabbathDate: string;
  division: string;
  assignedHostesses: string[];
  welcomeTheme: string;
  status: 'scheduled' | 'served' | 'rescheduled';
}

export interface SSClassSession {
  id: string;
  classId: string;
  className: string;
  date: string;
  attendanceCount: number;
  dailyLessonStudyCount: number;
  missionOfferingAmount: number;
  teacherName: string;
}

export interface FinancialTransmission {
  id: string;
  transmissionRef: string;
  sabbathDate: string;
  breakdown: {
    worldMissionOffering: number;
    thirteenthSabbathOffering: number;
    birthdayThankOffering: number;
    missionInvestment: number;
    sabbathSchoolExpense?: number;
  };
  totalAmount: number;
  signedBySecretary: string;
  receivedByTreasurer: string;
  status: 'transmitted' | 'reconciled' | 'remitted';
}

export interface SSQuarterlyReport {
  id: string;
  churchId: string;
  quarter: string;
  year: number;
  totalEnrollment: number;
  averageAttendance: number;
  dailyStudyPercentage: number;
  missionOfferingsTotal: number;
  branchSabbathSchoolsCount: number;
  baptismsFromSS: number;
  isClassRegisterAudited: boolean;
  isDailyStudyCalculated: boolean;
  isOfferingsReconciled: boolean;
  isSuperintendentSigned: boolean;
  isSecretarySigned: boolean;
  isTransmittedToConference: boolean;
  conferenceSubmissionDate?: string;
  conferenceAcknowledgementReceipt?: string;
}

export interface SSConferenceQuarterlyReportStatus {
  id: string;
  churchId: string;
  quarter: string;
  lastSabbathDate: string;
  dueDate: string;
  checklist: {
    classesRegistersReconciled: boolean;
    dailyStudyTabulated: boolean;
    missionOfferingsVerifiedWithTreasurer: boolean;
    outreachActivitiesCompiled: boolean;
    superintendentSigned: boolean;
    secretarySigned: boolean;
    submittedToConference: boolean;
  };
  conferenceSubmissionDate?: string;
  conferenceReceiptRef?: string;
  conferenceDirectorFeedback?: string;
}

export interface MinisterialCredential {
  id: string;
  conferenceId: string;
  ministerName: string;
  email: string;
  phone?: string;
  type: 'ORDAINED_MINISTER' | 'COMMISSIONED_MINISTER' | 'LICENSED_PASTOR' | 'BIBLE_INSTRUCTOR' | 'COMMISSIONED_HEALING_MINISTER';
  credentialNumber: string;
  districtId?: string;
  districtName?: string;
  assignedChurchName?: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'renewed' | 'emeritus' | 'suspended';
  votedByExecutiveCommitteeDate: string;
}

export interface StatisticalComplianceReport {
  id: string;
  conferenceId: string;
  districtId: string;
  churchId: string;
  churchName: string;
  month: string;
  deadlineDate: string;
  submittedDate?: string;
  status: 'on_time' | 'late' | 'pending' | 'overdue';
  membershipStart: number;
  baptisms: number;
  professionsOfFaith: number;
  lettersIn: number;
  lettersOut: number;
  deaths: number;
  removals: number;
  membershipEnd: number;
  ssAttendanceAverage: number;
  titheRemitted: number;
  acmsSyncStatus: 'synced' | 'pending_verification' | 'failed';
  verifiedByClerkName: string;
}

export interface ConstituencyDelegateQuota {
  id: string;
  conferenceId: string;
  districtId: string;
  churchId: string;
  churchName: string;
  officialMembership: number;
  basicQuota: number;
  proportionalQuota: number;
  totalDelegatesAllocated: number;
  delegatesSubmittedCount: number;
  status: 'accredited' | 'provisional' | 'pending_submission';
  votedByChurchDate?: string;
}

export interface CompanyPlantingProject {
  id: string;
  districtId: string;
  conferenceId: string;
  name: string;
  location: string;
  type: 'BRANCH_SABBATH_SCHOOL' | 'COMPANY' | 'MISSION_GROUP' | 'ORGANIZED_CHURCH';
  currentActiveMembers: number;
  motherChurchName: string;
  appointedLeaderName: string;
  appointedClerkName: string;
  appointedTreasurerName: string;
  targetOrganizationDate: string;
  pastorRecommendationStatus: 'recommended' | 'in_progress' | 'approved_by_conference';
  executiveCommitteeVotedDate?: string;
}
