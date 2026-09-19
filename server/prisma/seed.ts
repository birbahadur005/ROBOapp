import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo database for RAVAN College Receptionist System...');

  // 1. Initial Application Settings
  await prisma.applicationSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      collegeName: 'RAVAN Institute of Technology & Management',
      tagline: 'AI Visitor & Appointment Management System',
      themeColor: '#1e3a8a',
      defaultLanguage: 'en',
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
      isSetupComplete: true
    }
  });

  // 2. Demo Users & Passwords
  const commonPassword = await bcrypt.hash('Admin@123', 10);
  const directorPassword = await bcrypt.hash('Director@123', 10);
  const principalPassword = await bcrypt.hash('Principal@123', 10);
  const hodPassword = await bcrypt.hash('Hod@123', 10);
  const receptionPassword = await bcrypt.hash('Reception@123', 10);

  // Super Admin
  await prisma.user.upsert({
    where: { accountId: 'ADMIN-001' },
    update: {},
    create: {
      accountId: 'ADMIN-001',
      email: 'admin@college.edu',
      passwordHash: commonPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  // Reception Desk
  await prisma.user.upsert({
    where: { accountId: 'RECEPTION-001' },
    update: {},
    create: {
      accountId: 'RECEPTION-001',
      email: 'reception@college.edu',
      passwordHash: receptionPassword,
      role: 'RECEPTION',
      status: 'ACTIVE'
    }
  });

  // 3. Departments
  const deptAdmin = await prisma.department.upsert({
    where: { code: 'ADM' },
    update: {},
    create: {
      name: 'Administration',
      code: 'ADM',
      description: 'Central College Executive Administration',
      officeLocation: 'Main Administration Building, 1st Floor',
      contactEmail: 'admin.office@college.edu',
      contactPhone: '+91 98765 43210'
    }
  });

  const deptAcademics = await prisma.department.upsert({
    where: { code: 'ACAD' },
    update: {},
    create: {
      name: 'Academic Affairs',
      code: 'ACAD',
      description: 'Principal and Academic Planning Office',
      officeLocation: 'Main Administration Building, Ground Floor',
      contactEmail: 'academics@college.edu',
      contactPhone: '+91 98765 43211'
    }
  });

  const deptCSE = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Engineering',
      officeLocation: 'Tech Block B, 2nd Floor',
      contactEmail: 'cse@college.edu',
      contactPhone: '+91 98765 43212'
    }
  });

  const deptAccounts = await prisma.department.upsert({
    where: { code: 'ACC' },
    update: {},
    create: {
      name: 'Accounts & Finance',
      code: 'ACC',
      description: 'Fee Collection, Accounts, and Student Finance',
      officeLocation: 'Main Administration Building, Room 104',
      contactEmail: 'accounts@college.edu',
      contactPhone: '+91 98765 43213'
    }
  });

  // 4. Authorities
  // Director
  const userDirector = await prisma.user.upsert({
    where: { accountId: 'DIRECTOR-001' },
    update: {},
    create: {
      accountId: 'DIRECTOR-001',
      email: 'director@college.edu',
      passwordHash: directorPassword,
      role: 'AUTHORITY',
      status: 'ACTIVE'
    }
  });

  await prisma.authority.upsert({
    where: { userId: userDirector.id },
    update: {},
    create: {
      userId: userDirector.id,
      name: 'Dr. R. K. Sharma',
      designation: 'Director',
      departmentId: deptAdmin.id,
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
    }
  });

  // Principal
  const userPrincipal = await prisma.user.upsert({
    where: { accountId: 'PRINCIPAL-001' },
    update: {},
    create: {
      accountId: 'PRINCIPAL-001',
      email: 'principal@college.edu',
      passwordHash: principalPassword,
      role: 'AUTHORITY',
      status: 'ACTIVE'
    }
  });

  await prisma.authority.upsert({
    where: { userId: userPrincipal.id },
    update: {},
    create: {
      userId: userPrincipal.id,
      name: 'Prof. Anjali Verma',
      designation: 'Principal',
      departmentId: deptAcademics.id,
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
    }
  });

  // CSE HOD
  const userHOD = await prisma.user.upsert({
    where: { accountId: 'CSE-HOD-001' },
    update: {},
    create: {
      accountId: 'CSE-HOD-001',
      email: 'cse.hod@college.edu',
      passwordHash: hodPassword,
      role: 'AUTHORITY',
      status: 'ACTIVE'
    }
  });

  await prisma.authority.upsert({
    where: { userId: userHOD.id },
    update: {},
    create: {
      userId: userHOD.id,
      name: 'Dr. Vikramaditya Rao',
      designation: 'HOD, Computer Science',
      departmentId: deptCSE.id,
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
    }
  });

  // Accounts Officer
  const userAccounts = await prisma.user.upsert({
    where: { accountId: 'ACCOUNTS-001' },
    update: {},
    create: {
      accountId: 'ACCOUNTS-001',
      email: 'accounts@college.edu',
      passwordHash: commonPassword,
      role: 'AUTHORITY',
      status: 'ACTIVE'
    }
  });

  await prisma.authority.upsert({
    where: { userId: userAccounts.id },
    update: {},
    create: {
      userId: userAccounts.id,
      name: 'Shri Manoj Agrawal',
      designation: 'Accounts Officer',
      departmentId: deptAccounts.id,
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
  });

  // 5. College Knowledge Base Items
  const infoData = [
    {
      category: 'ABOUT',
      title: 'About Our Institution',
      contentEn: 'Founded with a mission to deliver world-class technical education, our institution provides state-of-the-art laboratories, highly qualified faculty, and industry-oriented curricula.',
      contentHi: 'विश्वस्तरीय तकनीकी शिक्षा प्रदान करने के उद्देश्य से स्थापित, हमारा संस्थान आधुनिक प्रयोगशालाओं, उच्च योग्य प्राध्यापकों और उद्योग-उन्मुख पाठ्यक्रम की सुविधा प्रदान करता है।'
    },
    {
      category: 'ADMISSION',
      title: 'Admissions 2026-2027 Information',
      contentEn: 'Admissions for undergraduate B.Tech and postgraduate M.Tech courses are open from May through August. Eligibility requires minimum 60% in 10+2 with Physics and Mathematics. Contact admission cell at Ext: 108.',
      contentHi: 'सत्र 2026-2027 के लिए स्नातक बी.टेक एवं स्नातकोत्तर एम.टेक प्रवेश प्रक्रिया मई से अगस्त तक खुली है। प्रवेश हेतु 10+2 में भौतिकी और गणित सहित न्यूनतम 60% अंक अनिवार्य हैं। अधिक जानकारी हेतु प्रवेश प्रकोष्ठ से संपर्क करें।'
    },
    {
      category: 'EXAMINATION',
      title: 'Examination Cell Guidelines',
      contentEn: 'The Examination Department is located in the Main Administrative Building, Room 108. Semester examinations, admit card verification, and transcript requests are handled Monday to Friday 10 AM to 4 PM.',
      contentHi: 'परीक्षा विभाग मुख्य प्रशासनिक भवन के कक्ष संख्या 108 में स्थित है। सेमेस्टर परीक्षा, प्रवेश पत्र सत्यापन और प्रतिलेख अनुरोध सोमवार से शुक्रवार सुबह 10 बजे से शाम 4 बजे तक स्वीकार किए जाते हैं।'
    },
    {
      category: 'HOURS',
      title: 'College Working Hours',
      contentEn: 'Campus offices operate Monday through Saturday from 9:00 AM to 5:00 PM. Visiting hours for external visitors are 10:00 AM to 4:00 PM upon approved appointment.',
      contentHi: 'कॉलेज कार्यालय सोमवार से शनिवार सुबह 9:00 बजे से शाम 5:00 बजे तक संचालित होते हैं। बाहरी आगंतुकों के लिए मिलने का समय स्वीकृत अपॉइंटमेंट के आधार पर सुबह 10:00 बजे से शाम 4:00 बजे तक है।'
    },
    {
      category: 'EMERGENCY',
      title: 'Emergency Contacts & Medical Desk',
      contentEn: 'Campus Security Desk: +91 98765 99999 | Medical Health Center (24x7): +91 98765 88888 | Reception Helpline: 011-23456789',
      contentHi: 'परिसर सुरक्षा डेस्क: +91 98765 99999 | चिकित्सा स्वास्थ्य केंद्र (24x7): +91 98765 88888 | रिसेप्शन हेल्पलाइन: 011-23456789'
    }
  ];

  for (const item of infoData) {
    await prisma.collegeInformation.create({
      data: {
        category: item.category,
        title: item.title,
        contentEn: item.contentEn,
        contentHi: item.contentHi,
        isActive: true,
        priority: 1
      }
    });
  }

  // 6. Interactive Campus Locations
  const locationsData = [
    { name: 'Main Campus Entrance Gate', category: 'GATE', locationCode: 'GATE-01', description: 'Primary security checkpoint and visitor vehicle parking', xCoord: 15.0, yCoord: 85.0, floorInfo: 'Ground' },
    { name: 'Central Reception & Kiosk', category: 'OFFICE', locationCode: 'RECEPT-01', description: 'Main digital visitor lobby and reception desk', xCoord: 25.0, yCoord: 70.0, floorInfo: 'Ground Floor, Lobby' },
    { name: 'Director Office', category: 'OFFICE', locationCode: 'DIR-201', description: 'Director Chamber and Conference Hall', xCoord: 35.0, yCoord: 45.0, floorInfo: 'Main Admin Block, 1st Floor' },
    { name: 'Principal Office', category: 'OFFICE', locationCode: 'PRIN-102', description: 'Principal Office and Academic Council', xCoord: 45.0, yCoord: 50.0, floorInfo: 'Main Admin Block, Ground Floor' },
    { name: 'Computer Science Complex', category: 'BUILDING', locationCode: 'CSE-BLDG', description: 'AI & Robotics Labs, CSE Faculty Offices', xCoord: 65.0, yCoord: 35.0, floorInfo: 'Tech Block B, Floors 1-3' },
    { name: 'Central Library & Reading Room', category: 'LIBRARY', locationCode: 'LIB-CENTRAL', description: '3-story digital library and quiet study area', xCoord: 50.0, yCoord: 25.0, floorInfo: 'Central Academic Block' },
    { name: 'Accounts & Student Billing Cell', category: 'OFFICE', locationCode: 'ACC-104', description: 'Fee counter and scholarships office', xCoord: 30.0, yCoord: 60.0, floorInfo: 'Main Admin Block, Room 104' },
    { name: 'Auditorium & Convocation Hall', category: 'BUILDING', locationCode: 'AUDI-01', description: '1500-seat multi-purpose auditorium', xCoord: 80.0, yCoord: 55.0, floorInfo: 'South Campus Block' }
  ];

  for (const loc of locationsData) {
    await prisma.campusLocation.upsert({
      where: { locationCode: loc.locationCode },
      update: {},
      create: loc
    });
  }

  // 7. Active Announcements
  await prisma.announcement.create({
    data: {
      title: 'Digital Visitor Passes Now Active',
      description: 'All visitors are requested to generate their digital pass at the entrance kiosk or with an approved appointment reference.',
      priority: 'HIGH',
      isActive: true
    }
  });

  await prisma.announcement.create({
    data: {
      title: 'Annual Technical Symposium Registrations Open',
      description: 'Registration for student research papers and innovation stalls is now live at the Computer Science department.',
      priority: 'NORMAL',
      isActive: true
    }
  });

  console.log('Seed completed successfully!');
  console.log('Credentials:');
  console.log('  Super Admin:      ADMIN-001       / Admin@123');
  console.log('  Reception Desk:   RECEPTION-001   / Reception@123');
  console.log('  Director:         DIRECTOR-001    / Director@123');
  console.log('  Principal:        PRINCIPAL-001   / Principal@123');
  console.log('  CSE HOD:          CSE-HOD-001     / Hod@123');
  console.log('  Accounts Officer: ACCOUNTS-001    / Admin@123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
