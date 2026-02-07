import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from 'better-auth/crypto'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.enrollment.deleteMany()
  await prisma.instructorAssignment.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verification.deleteMany()
  await prisma.course.deleteMany()
  await prisma.semester.deleteMany()
  await prisma.user.deleteMany()

  // Helper: create user + credential account (mimics Better-Auth signup)
  async function createUserWithAccount(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  }) {
    const user = await prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: true,
        emailVerified: true,
      },
    })

    // Create Better-Auth credential account (password stored here)
    const hashedPassword = await hashPassword(data.password)
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    })

    return user
  }

  // Create users
  const admin = await createUserWithAccount({
    email: 'admin@campushub.com',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Admin',
    role: 'ADMIN',
  })
  console.log('Created admin:', admin.email)

  const instructor1 = await createUserWithAccount({
    email: 'john.smith@campushub.com',
    password: 'Instructor123!',
    firstName: 'John',
    lastName: 'Smith',
    role: 'INSTRUCTOR',
  })

  const instructor2 = await createUserWithAccount({
    email: 'sarah.johnson@campushub.com',
    password: 'Instructor123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'INSTRUCTOR',
  })
  console.log('Created 2 instructors')

  const studentsData = [
    { email: 'alice@student.campushub.com', firstName: 'Alice', lastName: 'Williams' },
    { email: 'bob@student.campushub.com', firstName: 'Bob', lastName: 'Brown' },
    { email: 'carol@student.campushub.com', firstName: 'Carol', lastName: 'Davis' },
    { email: 'david@student.campushub.com', firstName: 'David', lastName: 'Miller' },
    { email: 'emma@student.campushub.com', firstName: 'Emma', lastName: 'Wilson' },
  ]

  const students = await Promise.all(
    studentsData.map((s) =>
      createUserWithAccount({
        ...s,
        password: 'Student123!', 
        role: 'STUDENT',
      })
    )
  )
  console.log('Created 5 students')

  // Create active semester
  const now = new Date()
  const semesterStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const semesterEnd = new Date(now.getFullYear(), now.getMonth() + 4, 30)
  const enrollmentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const enrollmentEnd = new Date(now.getFullYear(), now.getMonth() + 2, 15)
  const dropDeadline = new Date(now.getFullYear(), now.getMonth() + 1, 30)

  const semester = await prisma.semester.create({
    data: {
      name: `Fall ${now.getFullYear()}`,
      code: `FA${now.getFullYear()}`,
      startDate: semesterStart,
      endDate: semesterEnd,
      enrollmentStart,
      enrollmentEnd,
      dropDeadline,
      isActive: true,
    },
  })
  console.log('Created active semester:', semester.name)

  // Create courses
  const coursesData = [
    { code: 'CS101', name: 'Introduction to Programming', description: 'Learn the fundamentals of programming using Python.', credits: 3, capacity: 30 },
    { code: 'CS201', name: 'Data Structures & Algorithms', description: 'Study fundamental data structures and algorithm design.', credits: 4, capacity: 25 },
    { code: 'MATH201', name: 'Calculus I', description: 'Limits, derivatives, and integrals of single-variable functions.', credits: 4, capacity: 35 },
    { code: 'ENG101', name: 'English Composition', description: 'Develop writing skills for academic and professional contexts.', credits: 3, capacity: 30 },
    { code: 'PHYS101', name: 'Physics I', description: 'Mechanics, waves, and thermodynamics with lab.', credits: 4, capacity: 25 },
  ]

  const courses = await Promise.all(
    coursesData.map((c) =>
      prisma.course.create({
        data: { ...c, semesterId: semester.id },
      })
    )
  )
  console.log('Created 5 courses')

  // Assign instructors
  await prisma.instructorAssignment.create({
    data: { instructorId: instructor1.id, courseId: courses[0].id, isPrimary: true },
  })
  await prisma.instructorAssignment.create({
    data: { instructorId: instructor1.id, courseId: courses[1].id, isPrimary: true },
  })
  await prisma.instructorAssignment.create({
    data: { instructorId: instructor2.id, courseId: courses[2].id, isPrimary: true },
  })
  await prisma.instructorAssignment.create({
    data: { instructorId: instructor2.id, courseId: courses[3].id, isPrimary: true },
  })
  await prisma.instructorAssignment.create({
    data: { instructorId: instructor1.id, courseId: courses[4].id, isPrimary: true },
  })
  console.log('Assigned instructors to courses')

  // Create sample enrollments
  for (const student of students.slice(0, 3)) {
    await prisma.enrollment.create({
      data: { studentId: student.id, courseId: courses[0].id },
    })
    await prisma.enrollment.create({
      data: { studentId: student.id, courseId: courses[2].id },
    })
  }

  for (const student of students.slice(2, 5)) {
    await prisma.enrollment.create({
      data: { studentId: student.id, courseId: courses[1].id },
    })
    await prisma.enrollment.create({
      data: { studentId: student.id, courseId: courses[3].id },
    })
  }
  console.log('Created sample enrollments')

  console.log('\nSeed completed!')
  console.log('------------------------------')
  console.log('Login credentials:')
  console.log('  Admin:      admin@campushub.com / Admin123!')
  console.log('  Instructor: john.smith@campushub.com / Instructor123!')
  console.log('  Instructor: sarah.johnson@campushub.com / Instructor123!')
  console.log('  Student:    alice@student.campushub.com / Student123!')
  console.log('  Student:    bob@student.campushub.com / Student123!')
  console.log('------------------------------')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
