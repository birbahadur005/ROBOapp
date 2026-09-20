// Client-side mock data store with localStorage persistence for standalone GitHub Pages hosting

export interface MockDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  officeLocation: string;
  contactEmail: string;
  contactPhone: string;
}

export interface MockAuthority {
  id: string;
  userId?: string;
  name: string;
  designation: string;
  departmentId: string;
  department?: MockDepartment;
  officeLocation: string;
  visitingHours: string;
  isAcceptingAppointments: boolean;
  bio: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  user?: { id?: string; accountId?: string; email?: string };
}

export interface MockAppointment {
  id: string;
  referenceNo: string;
  visitorName: string;
  visitorMobile: string;
  visitorEmail?: string;
  visitorType: string;
  studentId?: string;
  departmentName?: string;
  organization?: string;
  purpose: string;
  message?: string;
  numberOfVisitors: number;
  requestedDate: string;
  requestedTime: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  authorityId: string;
  authority?: MockAuthority;
  qrToken?: string;
  remarks?: string;
  rejectionReason?: string;
  photoBase64?: string;
  createdAt: string;
}

export interface MockUser {
  id: string;
  accountId: string;
  email: string;
  password: string; // plain text check for demo mock fallback
  role: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'AUTHORITY' | 'RECEPTION';
  status: string;
  authorityProfile?: MockAuthority;
}

const STORAGE_KEYS = {
  INITIALIZED: 'robo_mock_initialized_v6',
  SETTINGS: 'robo_mock_settings',
  DEPARTMENTS: 'robo_mock_departments',
  AUTHORITIES: 'robo_mock_authorities',
  APPOINTMENTS: 'robo_mock_appointments',
  INFO: 'robo_mock_info',
  LOCATIONS: 'robo_mock_locations',
  ANNOUNCEMENTS: 'robo_mock_announcements',
  USERS: 'robo_mock_users',
  AUDIT_LOGS: 'robo_mock_audit_logs',
};

const defaultDepartments: MockDepartment[] = [
  {
    id: 'dept-adm',
    name: 'Administration',
    code: 'ADM',
    description: 'Central College Executive Administration',
    officeLocation: 'Main Administration Building, 1st Floor',
    contactEmail: 'admin.office@college.edu',
    contactPhone: '+91 98765 43210'
  },
  {
    id: 'dept-acad',
    name: 'Academic Affairs',
    code: 'ACAD',
    description: 'Principal and Academic Planning Office',
    officeLocation: 'Main Administration Building, Ground Floor',
    contactEmail: 'academics@college.edu',
    contactPhone: '+91 98765 43211'
  },
  {
    id: 'dept-cse',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Department of Computer Science & Engineering',
    officeLocation: 'Tech Block B, 2nd Floor',
    contactEmail: 'cse@college.edu',
    contactPhone: '+91 98765 43212'
  },
  {
    id: 'dept-acc',
    name: 'Accounts & Finance',
    code: 'ACC',
    description: 'Fee Collection, Accounts, and Student Finance',
    officeLocation: 'Main Administration Building, Room 104',
    contactEmail: 'accounts@college.edu',
    contactPhone: '+91 98765 43213'
  }
];

const defaultAuthorities: MockAuthority[] = [
  {
    id: 'auth-dir',
    name: 'Dr. R. K. Sharma',
    designation: 'Director',
    departmentId: 'dept-adm',
    department: defaultDepartments[0],
    officeLocation: 'Main Administration Building, 1st Floor, Room 201',
    visitingHours: JSON.stringify({
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '14:00',
      endTime: '17:00',
      slotMinutes: 20
    }),
    isAcceptingAppointments: true,
    bio: 'Director & Patron of Academic Affairs',
    email: 'director@college.edu',
    mobile: '+91 98765 00001'
  },
  {
    id: 'auth-prin',
    name: 'Prof. Anjali Verma',
    designation: 'Principal',
    departmentId: 'dept-acad',
    department: defaultDepartments[1],
    officeLocation: 'Main Administration Building, Ground Floor, Room 102',
    visitingHours: JSON.stringify({
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '11:00',
      endTime: '14:00',
      slotMinutes: 15
    }),
    isAcceptingAppointments: true,
    bio: 'Principal & Head of Faculty',
    email: 'principal@college.edu',
    mobile: '+91 98765 00002'
  },
  {
    id: 'auth-cse',
    name: 'Dr. Vikramaditya Rao',
    designation: 'HOD, Computer Science',
    departmentId: 'dept-cse',
    department: defaultDepartments[2],
    officeLocation: 'Tech Block B, 2nd Floor, Room 305',
    visitingHours: JSON.stringify({
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '10:00',
      endTime: '13:00',
      slotMinutes: 15
    }),
    isAcceptingAppointments: true,
    bio: 'Head of Computer Science & Engineering',
    email: 'cse.hod@college.edu',
    mobile: '+91 98765 00003'
  },
  {
    id: 'auth-acc',
    name: 'Shri Manoj Agrawal',
    designation: 'Accounts Officer',
    departmentId: 'dept-acc',
    department: defaultDepartments[3],
    officeLocation: 'Main Administration Building, Room 104',
    visitingHours: JSON.stringify({
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '10:00',
      endTime: '15:00',
      slotMinutes: 15
    }),
    isAcceptingAppointments: true,
    bio: 'Chief Financial Officer & Accounts Head',
    email: 'accounts@college.edu',
    mobile: '+91 98765 00004'
  }
];

const defaultUsers: MockUser[] = [
  {
    id: 'usr-admin',
    accountId: 'ADMIN-001',
    email: 'admin@college.edu',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE'
  },
  {
    id: 'usr-reception',
    accountId: 'RECEPTION-001',
    email: 'reception@college.edu',
    password: 'Reception@123',
    role: 'RECEPTION',
    status: 'ACTIVE'
  },
  {
    id: 'usr-dir',
    accountId: 'DIRECTOR-001',
    email: 'director@college.edu',
    password: 'Director@123',
    role: 'AUTHORITY',
    status: 'ACTIVE',
    authorityProfile: defaultAuthorities[0]
  },
  {
    id: 'usr-prin',
    accountId: 'PRINCIPAL-001',
    email: 'principal@college.edu',
    password: 'Principal@123',
    role: 'AUTHORITY',
    status: 'ACTIVE',
    authorityProfile: defaultAuthorities[1]
  },
  {
    id: 'usr-cse',
    accountId: 'CSE-HOD-001',
    email: 'cse.hod@college.edu',
    password: 'Hod@123',
    role: 'AUTHORITY',
    status: 'ACTIVE',
    authorityProfile: defaultAuthorities[2]
  },
  {
    id: 'usr-acc',
    accountId: 'ACCOUNTS-001',
    email: 'accounts@college.edu',
    password: 'Admin@123',
    role: 'AUTHORITY',
    status: 'ACTIVE',
    authorityProfile: defaultAuthorities[3]
  }
];

const defaultCollegeInfo = [
  {
    id: 'info-1',
    category: 'ABOUT',
    title: 'About Our Institution',
    contentEn: 'Founded with a mission to deliver world-class technical education, our institution provides state-of-the-art laboratories, highly qualified faculty, and industry-oriented curricula.',
    contentHi: 'विश्वस्तरीय तकनीकी शिक्षा प्रदान करने के उद्देश्य से स्थापित, हमारा संस्थान आधुनिक प्रयोगशालाओं, उच्च योग्य प्राध्यापकों और उद्योग-उन्मुख पाठ्यक्रम की सुविधा प्रदान करता है।',
    priority: 1,
    isActive: true
  },
  {
    id: 'info-2',
    category: 'ADMISSION',
    title: 'Admissions 2026-2027 Information',
    contentEn: 'Admissions for undergraduate B.Tech and postgraduate M.Tech courses are open from May through August. Eligibility requires minimum 60% in 10+2 with Physics and Mathematics. Contact admission cell at Ext: 108.',
    contentHi: 'सत्र 2026-2027 के लिए स्नातक बी.टेक एवं स्नातकोत्तर एम.टेक प्रवेश प्रक्रिया मई से अगस्त तक खुली है। प्रवेश हेतु 10+2 में भौतिकी और गणित सहित न्यूनतम 60% अंक अनिवार्य हैं। अधिक जानकारी हेतु प्रवेश प्रकोष्ठ से संपर्क करें।',
    priority: 1,
    isActive: true
  },
  {
    id: 'info-3',
    category: 'EXAMINATION',
    title: 'Examination Cell Guidelines',
    contentEn: 'The Examination Department is located in the Main Administrative Building, Room 108. Semester examinations, admit card verification, and transcript requests are handled Monday to Friday 10 AM to 4 PM.',
    contentHi: 'परीक्षा विभाग मुख्य प्रशासनिक भवन के कक्ष संख्या 108 में स्थित है। सेमेस्टर परीक्षा, प्रवेश पत्र सत्यापन और प्रतिलेख अनुरोध सोमवार से शुक्रवार सुबह 10 बजे से शाम 4 बजे तक स्वीकार किए जाते हैं।',
    priority: 1,
    isActive: true
  },
  {
    id: 'info-4',
    category: 'HOURS',
    title: 'College Working Hours',
    contentEn: 'Campus offices operate Monday through Saturday from 9:00 AM to 5:00 PM. Visiting hours for external visitors are 10:00 AM to 4:00 PM upon approved appointment.',
    contentHi: 'कॉलेज कार्यालय सोमवार से शनिवार सुबह 9:00 बजे से शाम 5:00 बजे तक संचालित होते हैं। बाहरी आगंतुकों के लिए मिलने का समय स्वीकृत अपॉइंटमेंट के आधार पर सुबह 10:00 बजे से शाम 4:00 बजे तक है।',
    priority: 1,
    isActive: true
  },
  {
    id: 'info-5',
    category: 'EMERGENCY',
    title: 'Emergency Contacts & Medical Desk',
    contentEn: 'Campus Security Desk: +91 98765 99999 | Medical Health Center (24x7): +91 98765 88888 | Reception Helpline: 011-23456789',
    contentHi: 'परिसर सुरक्षा डेस्क: +91 98765 99999 | चिकित्सा स्वास्थ्य केंद्र (24x7): +91 98765 88888 | रिसेप्शन हेल्पलाइन: 011-23456789',
    priority: 1,
    isActive: true
  }
];

const defaultLocations = [
  { id: 'loc-1', name: 'Main Campus Entrance Gate', category: 'GATE', locationCode: 'GATE-01', description: 'Primary security checkpoint and visitor vehicle parking', xCoord: 15.0, yCoord: 85.0, floorInfo: 'Ground' },
  { id: 'loc-2', name: 'Central Reception & Kiosk', category: 'OFFICE', locationCode: 'RECEPT-01', description: 'Main digital visitor lobby and reception desk', xCoord: 25.0, yCoord: 70.0, floorInfo: 'Ground Floor, Lobby' },
  { id: 'loc-3', name: 'Director Office', category: 'OFFICE', locationCode: 'DIR-201', description: 'Director Chamber and Conference Hall', xCoord: 35.0, yCoord: 45.0, floorInfo: 'Main Admin Block, 1st Floor' },
  { id: 'loc-4', name: 'Principal Office', category: 'OFFICE', locationCode: 'PRIN-102', description: 'Principal Office and Academic Council', xCoord: 45.0, yCoord: 50.0, floorInfo: 'Main Admin Block, Ground Floor' },
  { id: 'loc-5', name: 'Computer Science Complex', category: 'BUILDING', locationCode: 'CSE-BLDG', description: 'AI & Robotics Labs, CSE Faculty Offices', xCoord: 65.0, yCoord: 35.0, floorInfo: 'Tech Block B, Floors 1-3' },
  { id: 'loc-6', name: 'Central Library & Reading Room', category: 'LIBRARY', locationCode: 'LIB-CENTRAL', description: '3-story digital library and quiet study area', xCoord: 50.0, yCoord: 25.0, floorInfo: 'Central Academic Block' },
  { id: 'loc-7', name: 'Accounts & Student Billing Cell', category: 'OFFICE', locationCode: 'ACC-104', description: 'Fee counter and scholarships office', xCoord: 30.0, yCoord: 60.0, floorInfo: 'Main Admin Block, Room 104' },
  { id: 'loc-8', name: 'Auditorium & Convocation Hall', category: 'BUILDING', locationCode: 'AUDI-01', description: '1500-seat multi-purpose auditorium', xCoord: 80.0, yCoord: 55.0, floorInfo: 'South Campus Block' }
];

const defaultAnnouncements = [
  {
    id: 'ann-1',
    title: 'Digital Visitor Passes Now Active',
    description: 'All visitors are requested to generate their digital pass at the entrance kiosk or with an approved appointment reference.',
    priority: 'HIGH',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann-2',
    title: 'Annual Technical Symposium Registrations Open',
    description: 'Registration for student research papers and innovation stalls is now live at the Computer Science department.',
    priority: 'NORMAL',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const todayStr = new Date().toISOString().split('T')[0];

const defaultAppointments: MockAppointment[] = [
  {
    id: 'appt-demo-1',
    referenceNo: 'REQ-10021',
    visitorName: 'Rahul Verma',
    visitorMobile: '9876543210',
    visitorEmail: 'rahul.verma@example.com',
    visitorType: 'PARENT',
    purpose: 'Discuss student academic progress and attendance report',
    numberOfVisitors: 1,
    requestedDate: todayStr,
    requestedTime: '11:30',
    status: 'ACCEPTED',
    authorityId: 'auth-prin',
    authority: defaultAuthorities[1],
    qrToken: 'QR-TOKEN-REQ-10021',
    remarks: 'Approved. Please arrive 10 mins in advance with ID proof.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'appt-demo-2',
    referenceNo: 'REQ-10022',
    visitorName: 'Suman Gupta',
    visitorMobile: '9876500000',
    visitorEmail: 'suman.gupta@company.org',
    visitorType: 'VENDOR',
    purpose: 'Campus laboratory equipment demonstration & MOU discussion',
    numberOfVisitors: 2,
    requestedDate: todayStr,
    requestedTime: '14:30',
    status: 'PENDING',
    authorityId: 'auth-dir',
    authority: defaultAuthorities[0],
    qrToken: 'QR-TOKEN-REQ-10022',
    createdAt: new Date().toISOString()
  }
];

const defaultSettings = {
  id: 'default',
  collegeName: 'RAVAN College Receptionist',
  siteName: 'RAVAN College Receptionist',
  tagline: 'A Smarter Campus for a Brighter Tomorrow',
  themeColor: '#1e3a8a',
  logoUrl: 'logo.png',
  siteLogoUrl: 'logo.png',
  appLogoUrl: 'logo.png',
  appIconUrl: 'logo.png',
  appShortName: 'RAVAN Reception',
  defaultLanguage: 'en',
  collegeAddress: 'Knowledge City, Institutional Area, Sector 62',
  collegePhone: '+91 11 2345 6789',
  collegeEmail: 'info@college.edu',
  emergencyPhone: '+91 98765 99999',
  visitingHoursGeneral: 'Mon-Sat 10:00 AM - 4:00 PM',
  allowCameraPhoto: true,
  requireVisitorPhoto: false,
  requiredVisitorFields: JSON.stringify([
    'visitorName',
    'visitorMobile',
    'purpose',
    'requestedDate',
    'requestedTime'
  ]),
  maxAdvanceBookingDays: 14,
  appointmentLeadTimeHours: 2,
  strictConflictPrevention: true,
  maxVisitorsPerRequest: 10,
  soundAlertsEnabled: true,
  browserNotificationsEnabled: true,
  emailNotificationsEnabled: false,
  enableAIAssistant: true,
  aiWelcomeMessage: 'Hello! I am your AI College Receptionist. How can I help you today?',
  kioskAutoResetSeconds: 90,
  kioskShowAnnouncements: true,
  kioskShowCampusMap: true,
  backgroundType: 'default',
  backgroundColor: '#0f172a',
  backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
  backgroundImageUrl: '',
  backgroundVideoUrl: '',
  backgroundOverlayOpacity: 60,
  backgroundBlur: 0,
  secondaryColor: '#3b82f6',
  welcomeHeading: 'Welcome to',
  heroBadgeText: 'Digital Reception Kiosk'
};

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorage(key: string, val: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage set failed', e);
  }
}

export function initMockStorage(): void {
  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  const existingUsers = getStorage<MockUser[]>(STORAGE_KEYS.USERS, []);

  if (!isInit || existingUsers.length === 0) {
    setStorage(STORAGE_KEYS.DEPARTMENTS, defaultDepartments);
    setStorage(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
    setStorage(STORAGE_KEYS.USERS, defaultUsers);
    setStorage(STORAGE_KEYS.INFO, defaultCollegeInfo);
    setStorage(STORAGE_KEYS.LOCATIONS, defaultLocations);
    setStorage(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements);
    setStorage(STORAGE_KEYS.APPOINTMENTS, defaultAppointments);
    setStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        action: 'SYSTEM_INITIALIZED',
        details: 'Initial system seeding completed',
        timestamp: new Date().toISOString()
      }
    ]);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Mock request dispatcher
export function handleMockRoute(url: string, method: string = 'GET', body: any = null): any {
  initMockStorage();

  const cleanUrl = url.replace(/^\/api/, '');
  const [pathname, queryString] = cleanUrl.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. Auth Me
  if (pathname === '/auth/me') {
    const activeToken = localStorage.getItem('ravan_auth_token');
    if (!activeToken) {
      throw new Error('Not authenticated');
    }
    const users = getStorage<MockUser[]>(STORAGE_KEYS.USERS, defaultUsers);
    const matched = users.find(
      (u) =>
        `mock-jwt-token-${u.id}` === activeToken ||
        `mock-jwt-token-${u.accountId}` === activeToken ||
        `mock-jwt-token-${u.accountId.toLowerCase()}` === activeToken.toLowerCase()
    ) || users[0];

    return {
      success: true,
      user: {
        id: matched.id,
        accountId: matched.accountId,
        email: matched.email,
        role: matched.role,
        status: matched.status,
        authorityProfile: matched.authorityProfile
      }
    };
  }

  // 2. Auth Login
  if (pathname === '/auth/login' && method === 'POST') {
    const rawId = (body?.identifier || body?.accountId || body?.email || '').trim().toLowerCase();
    const rawPass = (body?.password || '').trim();

    if (!rawId || !rawPass) {
      throw new Error('Account ID and Password are required.');
    }

    const users = getStorage<MockUser[]>(STORAGE_KEYS.USERS, defaultUsers);
    const found = users.find(
      (u) =>
        u.accountId.toLowerCase() === rawId ||
        u.email.toLowerCase() === rawId
    );

    if (!found || found.password !== rawPass) {
      throw new Error('Invalid Account ID / Email or Password. Please verify credentials.');
    }

    if (found.status === 'DISABLED') {
      throw new Error('Your account has been deactivated. Please contact the administrator.');
    }

    const token = `mock-jwt-token-${found.accountId}`;
    return {
      success: true,
      token,
      user: {
        id: found.id,
        accountId: found.accountId,
        email: found.email,
        role: found.role,
        status: found.status,
        authorityProfile: found.authorityProfile
      }
    };
  }

  // 3. Auth Logout
  if (pathname === '/auth/logout') {
    return { success: true };
  }

  // 4. Settings
  if (pathname === '/admin/settings') {
    const current = { ...defaultSettings, ...getStorage(STORAGE_KEYS.SETTINGS, defaultSettings) };
    if (method === 'PATCH' || method === 'POST') {
      const updated = { ...current, ...body };
      setStorage(STORAGE_KEYS.SETTINGS, updated);
      return { success: true, settings: updated };
    }
    return { success: true, settings: current };
  }

  // 5. Upload Logo Mock
  if (pathname === '/admin/upload-logo' && method === 'POST') {
    return { success: true, logoUrl: 'logo.png', message: 'Logo updated successfully' };
  }

  // 6. Departments
  if (pathname === '/admin/departments') {
    const depts = getStorage<MockDepartment[]>(STORAGE_KEYS.DEPARTMENTS, defaultDepartments);
    if (method === 'POST') {
      const newDept: MockDepartment = {
        id: 'dept-' + Date.now(),
        name: body.name || 'New Department',
        code: body.code || 'DEPT',
        description: body.description || '',
        officeLocation: body.officeLocation || '',
        contactEmail: body.contactEmail || '',
        contactPhone: body.contactPhone || ''
      };
      depts.push(newDept);
      setStorage(STORAGE_KEYS.DEPARTMENTS, depts);
      return { success: true, department: newDept };
    }
    return { success: true, departments: depts };
  }

  const deptMatch = pathname.match(/^\/admin\/departments\/(.+)$/);
  if (deptMatch) {
    const id = deptMatch[1];
    let depts = getStorage<MockDepartment[]>(STORAGE_KEYS.DEPARTMENTS, defaultDepartments);
    if (method === 'PATCH' || method === 'PUT') {
      const idx = depts.findIndex((d) => d.id === id);
      if (idx !== -1) {
        depts[idx] = { ...depts[idx], ...body };
        setStorage(STORAGE_KEYS.DEPARTMENTS, depts);
        return { success: true, department: depts[idx] };
      }
      throw new Error('Department not found');
    }
    if (method === 'DELETE') {
      depts = depts.filter((d) => d.id !== id);
      setStorage(STORAGE_KEYS.DEPARTMENTS, depts);
      return { success: true };
    }
  }

  // 7. Authorities
  if (pathname === '/authorities') {
    const auths = getStorage<MockAuthority[]>(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
    return { success: true, authorities: auths };
  }

  const authByIdMatch = pathname.match(/^\/authorities\/(.+)$/);
  if (authByIdMatch && method === 'GET') {
    const id = authByIdMatch[1];
    const auths = getStorage<MockAuthority[]>(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
    const auth = auths.find((a) => a.id === id);
    if (!auth) throw new Error('Authority not found');
    return { success: true, authority: auth };
  }

  const adminAuthMatch = pathname.match(/^\/admin\/authorities\/(.+)$/);
  if (adminAuthMatch) {
    const id = adminAuthMatch[1];
    let auths = getStorage<MockAuthority[]>(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
    if (method === 'PATCH' || method === 'PUT') {
      const idx = auths.findIndex((a) => a.id === id);
      if (idx !== -1) {
        auths[idx] = { ...auths[idx], ...body };
        setStorage(STORAGE_KEYS.AUTHORITIES, auths);

        // Sync with users list if credentials or email changed
        if (body.password || body.email || body.accountId) {
          let users = getStorage<MockUser[]>(STORAGE_KEYS.USERS, defaultUsers);
          const uIdx = users.findIndex(
            (u) => u.id === auths[idx].userId || u.accountId === auths[idx].user?.accountId || u.email === auths[idx].email
          );
          if (uIdx !== -1) {
            if (body.password) users[uIdx].password = body.password;
            if (body.email) users[uIdx].email = body.email;
            if (body.accountId) users[uIdx].accountId = body.accountId;
            setStorage(STORAGE_KEYS.USERS, users);
          }
        }

        return { success: true, authority: auths[idx] };
      }
      throw new Error('Authority not found');
    }
    if (method === 'DELETE') {
      auths = auths.filter((a) => a.id !== id);
      setStorage(STORAGE_KEYS.AUTHORITIES, auths);
      return { success: true, message: 'Authority deleted successfully' };
    }
  }

  if (pathname === '/admin/authorities' && method === 'POST') {
    const auths = getStorage<MockAuthority[]>(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
    const newAuth: MockAuthority = {
      id: 'auth-' + Date.now(),
      name: body.name,
      designation: body.designation,
      departmentId: body.departmentId,
      officeLocation: body.officeLocation || '',
      visitingHours: body.visitingHours || JSON.stringify({ days: ['Monday', 'Tuesday', 'Wednesday'], startTime: '10:00', endTime: '16:00', slotMinutes: 20 }),
      isAcceptingAppointments: true,
      bio: body.bio || '',
      email: body.email || '',
      mobile: body.mobile || ''
    };
    auths.push(newAuth);
    setStorage(STORAGE_KEYS.AUTHORITIES, auths);
    return { success: true, authority: newAuth };
  }

  // 8. Appointments
  if (pathname === '/appointments') {
    const appts = getStorage<MockAppointment[]>(STORAGE_KEYS.APPOINTMENTS, defaultAppointments);
    const dateFilter = params.get('date');

    if (method === 'POST') {
      const refNum = 'REQ-' + Math.floor(10000 + Math.random() * 90000);
      const auths = getStorage<MockAuthority[]>(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
      const matchedAuth = auths.find((a) => a.id === body.authorityId) || auths[0];

      const newAppt: MockAppointment = {
        id: 'appt-' + Date.now(),
        referenceNo: refNum,
        visitorName: body.visitorName,
        visitorMobile: body.visitorMobile,
        visitorEmail: body.visitorEmail,
        visitorType: body.visitorType || 'GENERAL',
        studentId: body.studentId,
        departmentName: body.departmentName,
        organization: body.organization,
        purpose: body.purpose,
        message: body.message,
        numberOfVisitors: Number(body.numberOfVisitors || 1),
        requestedDate: body.requestedDate,
        requestedTime: body.requestedTime,
        status: 'PENDING',
        authorityId: body.authorityId,
        authority: matchedAuth,
        qrToken: `QR-TOKEN-${refNum}`,
        photoBase64: body.photoBase64,
        createdAt: new Date().toISOString()
      };

      appts.unshift(newAppt);
      setStorage(STORAGE_KEYS.APPOINTMENTS, appts);

      return {
        success: true,
        message: 'Appointment request submitted successfully! Please save your Reference Number.',
        appointment: newAppt
      };
    }

    if (dateFilter) {
      return { success: true, appointments: appts.filter((a) => a.requestedDate === dateFilter) };
    }
    return { success: true, appointments: appts };
  }

  // Track appointment
  if (pathname === '/appointments/track') {
    const ref = params.get('referenceNo');
    const mob = params.get('mobile');
    const appts = getStorage<MockAppointment[]>(STORAGE_KEYS.APPOINTMENTS, defaultAppointments);
    const found = appts.find(
      (a) =>
        a.referenceNo.toUpperCase() === (ref || '').trim().toUpperCase() &&
        (!mob || a.visitorMobile.replace(/\D/g, '').endsWith(mob.replace(/\D/g, '').slice(-10)))
    );
    if (!found) {
      throw new Error('Appointment not found. Please verify Reference Number and registered Mobile.');
    }
    return { success: true, appointment: found };
  }

  // Verify QR
  if (pathname === '/appointments/verify-qr' && method === 'POST') {
    const { qrToken } = body || {};
    const appts = getStorage<MockAppointment[]>(STORAGE_KEYS.APPOINTMENTS, defaultAppointments);
    const found = appts.find(
      (a) => a.qrToken === qrToken || a.referenceNo === qrToken
    );
    if (!found) {
      throw new Error('Invalid or unrecognized QR token.');
    }
    return { success: true, appointment: found };
  }

  // Appointment actions: Accept, Reject, Reschedule, Complete
  const apptActionMatch = pathname.match(/^\/appointments\/(.+)\/(accept|reject|reschedule|complete)$/);
  if (apptActionMatch && method === 'POST') {
    const [, id, action] = apptActionMatch;
    const appts = getStorage<MockAppointment[]>(STORAGE_KEYS.APPOINTMENTS, defaultAppointments);
    const index = appts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    if (action === 'accept') {
      appts[index].status = 'ACCEPTED';
      appts[index].remarks = body?.remarks || 'Approved by authority';
    } else if (action === 'reject') {
      appts[index].status = 'REJECTED';
      appts[index].rejectionReason = body?.reason || 'Declined by authority';
    } else if (action === 'reschedule') {
      appts[index].status = 'RESCHEDULED';
      appts[index].requestedDate = body?.newDate || appts[index].requestedDate;
      appts[index].requestedTime = body?.newTime || appts[index].requestedTime;
      appts[index].remarks = body?.remarks || 'Rescheduled by authority';
    } else if (action === 'complete') {
      appts[index].status = 'COMPLETED';
    }

    setStorage(STORAGE_KEYS.APPOINTMENTS, appts);
    return { success: true, appointment: appts[index] };
  }

  // 9. College Information
  if (pathname === '/college/info') {
    const items = getStorage(STORAGE_KEYS.INFO, defaultCollegeInfo);
    if (method === 'POST') {
      const newItem = { id: 'info-' + Date.now(), ...body, isActive: true };
      items.push(newItem);
      setStorage(STORAGE_KEYS.INFO, items);
      return { success: true, item: newItem };
    }
    return { success: true, items };
  }

  const deleteInfoMatch = pathname.match(/^\/college\/info\/(.+)$/);
  if (deleteInfoMatch && method === 'DELETE') {
    const id = deleteInfoMatch[1];
    let items = getStorage(STORAGE_KEYS.INFO, defaultCollegeInfo);
    items = items.filter((i: any) => i.id !== id);
    setStorage(STORAGE_KEYS.INFO, items);
    return { success: true };
  }

  // 10. Campus Locations
  if (pathname === '/college/campus') {
    const locs = getStorage(STORAGE_KEYS.LOCATIONS, defaultLocations);
    if (method === 'POST') {
      const newLoc = { id: 'loc-' + Date.now(), ...body };
      locs.push(newLoc);
      setStorage(STORAGE_KEYS.LOCATIONS, locs);
      return { success: true, location: newLoc };
    }
    return { success: true, locations: locs };
  }

  const deleteCampusMatch = pathname.match(/^\/college\/campus\/(.+)$/);
  if (deleteCampusMatch && method === 'DELETE') {
    const id = deleteCampusMatch[1];
    let locs = getStorage(STORAGE_KEYS.LOCATIONS, defaultLocations);
    locs = locs.filter((l: any) => l.id !== id);
    setStorage(STORAGE_KEYS.LOCATIONS, locs);
    return { success: true };
  }

  // 11. Announcements
  if (pathname === '/college/announcements') {
    const anns = getStorage(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements);
    if (method === 'POST') {
      const newAnn = { id: 'ann-' + Date.now(), ...body, createdAt: new Date().toISOString(), isActive: true };
      anns.unshift(newAnn);
      setStorage(STORAGE_KEYS.ANNOUNCEMENTS, anns);
      return { success: true, announcement: newAnn };
    }
    return { success: true, announcements: anns };
  }

  const deleteAnnMatch = pathname.match(/^\/college\/announcements\/(.+)$/);
  if (deleteAnnMatch && method === 'DELETE') {
    const id = deleteAnnMatch[1];
    let anns = getStorage(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements);
    anns = anns.filter((a: any) => a.id !== id);
    setStorage(STORAGE_KEYS.ANNOUNCEMENTS, anns);
    return { success: true };
  }

  // 12. Admin Analytics
  if (pathname === '/admin/analytics') {
    const appts = getStorage<MockAppointment[]>(STORAGE_KEYS.APPOINTMENTS, defaultAppointments);
    const auths = getStorage<MockAuthority[]>(STORAGE_KEYS.AUTHORITIES, defaultAuthorities);
    const depts = getStorage<MockDepartment[]>(STORAGE_KEYS.DEPARTMENTS, defaultDepartments);

    return {
      success: true,
      stats: {
        totalAppointments: appts.length,
        pendingAppointments: appts.filter((a) => a.status === 'PENDING').length,
        approvedToday: appts.filter((a) => a.status === 'ACCEPTED').length,
        checkedInToday: appts.filter((a) => a.status === 'CHECKED_IN').length,
        completedToday: appts.filter((a) => a.status === 'COMPLETED').length,
        authoritiesCount: auths.length,
        departmentsCount: depts.length
      }
    };
  }

  // 13. Audit Logs
  if (pathname === '/admin/audit-logs') {
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    return { success: true, logs };
  }

  // 14. AI Receptionist Ask
  if (pathname === '/ai/ask' && method === 'POST') {
    const q = (body?.question || '').toLowerCase();
    let answer = 'Welcome to RAVAN College! For general visiting hours, we are open Monday to Saturday from 9:00 AM to 5:00 PM. Please use our digital kiosk to meet authorities or track your appointment.';
    if (q.includes('director')) {
      answer = 'Dr. R. K. Sharma is the Director. His office is located in the Main Administration Building, 1st Floor, Room 201. Visiting hours are Mon-Fri 2:00 PM - 5:00 PM.';
    } else if (q.includes('principal')) {
      answer = 'Prof. Anjali Verma is the Principal. Her office is in the Main Administration Building, Ground Floor, Room 102. Visiting hours are Mon-Fri 11:00 AM - 2:00 PM.';
    } else if (q.includes('cse') || q.includes('computer')) {
      answer = 'The Computer Science & Engineering department is headed by Dr. Vikramaditya Rao, located in Tech Block B, 2nd Floor.';
    } else if (q.includes('account') || q.includes('fee')) {
      answer = 'The Accounts and Student Billing counter is in Main Admin Block Room 104, managed by Shri Manoj Agrawal.';
    } else if (q.includes('admission')) {
      answer = 'Admissions for 2026-2027 are currently open for B.Tech and M.Tech courses. Please visit the Academic Affairs office or contact admission cell.';
    }
    return { success: true, answer };
  }

  // 15. User Management (Admin only)
  if (pathname === '/admin/users') {
    const users = getStorage<MockUser[]>(STORAGE_KEYS.USERS, defaultUsers);
    if (method === 'POST') {
      const { accountId, email, password, role } = body || {};
      if (!accountId || !email || !password) {
        throw new Error('User ID, Email, and Password are required.');
      }
      const cleanAccountId = accountId.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      if (users.some((u) => u.accountId.toUpperCase() === cleanAccountId)) {
        throw new Error(`User ID "${cleanAccountId}" is already in use.`);
      }
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        throw new Error(`Email "${cleanEmail}" is already in use.`);
      }

      const newUser: MockUser = {
        id: 'usr-' + Date.now(),
        accountId: cleanAccountId,
        email: cleanEmail,
        password: password.trim(),
        role: role || 'AUTHORITY',
        status: 'ACTIVE'
      };
      users.push(newUser);
      setStorage(STORAGE_KEYS.USERS, users);
      return { success: true, user: newUser, message: 'User created successfully.' };
    }

    return {
      success: true,
      users: users.map((u) => ({
        id: u.id,
        accountId: u.accountId,
        email: u.email,
        role: u.role,
        status: u.status,
        authorityProfile: u.authorityProfile
          ? {
              id: u.authorityProfile.id,
              name: u.authorityProfile.name,
              designation: u.authorityProfile.designation
            }
          : undefined
      }))
    };
  }

  const userUpdateMatch = pathname.match(/^\/admin\/users\/(.+)$/);
  if (userUpdateMatch) {
    const id = userUpdateMatch[1];
    const users = getStorage<MockUser[]>(STORAGE_KEYS.USERS, defaultUsers);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found.');

    if (method === 'PATCH') {
      const { accountId, password, email, role, status } = body || {};
      if (accountId && accountId.trim()) {
        const cleanId = accountId.trim().toUpperCase();
        if (users.some((u) => u.id !== id && u.accountId.toUpperCase() === cleanId)) {
          throw new Error(`User ID "${cleanId}" is already taken by another account.`);
        }
        users[index].accountId = cleanId;
      }
      if (password && password.trim()) {
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        users[index].password = password.trim();
      }
      if (email && email.trim()) {
        users[index].email = email.trim().toLowerCase();
      }
      if (role) {
        users[index].role = role;
      }
      if (status) {
        users[index].status = status;
      }

      setStorage(STORAGE_KEYS.USERS, users);
      return { success: true, user: users[index], message: 'User credentials updated successfully.' };
    }

    if (method === 'DELETE') {
      const filtered = users.filter((u) => u.id !== id);
      setStorage(STORAGE_KEYS.USERS, filtered);
      return { success: true, message: 'User deleted successfully.' };
    }
  }

  // Default fallback
  return { success: true, data: [] };
}
