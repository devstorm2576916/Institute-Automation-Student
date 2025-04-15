import { connectDB } from "../database/mongoDb.js";
import { User} from "../models/user.model.js";
import { Student } from "../models/student.model.js"; 
import bcrypt from "bcrypt"; // Import the bcrypt library
import { HostelAdmin } from "../models/hostelAdmin.model.js";
import { AcadAdmin } from "../models/acadAdmin.model.js";
import { Faculty } from "../models/faculty.model.js";
import { StudentCourse } from "../models/course.model.js";
import { Course } from "../models/course.model.js";

// Sample user data
const userData = {
  name: "John Doe",
  email: "testStudent@iitg.ac.in",
  hostel: "Lohit",
  rollNo: "220101039",
  password: "password123", // In a real app, you should hash this
  refreshToken: "sample-refresh-token-1",
  contactNo: "1234567890",
  isVerified: true
};
const nonAcadAdminData = {
  name: "Himanshu Sharma",
  email: "testHab@iitg.ac.in",
  password: "1234", // In a real app, you should hash this
  refreshToken: "sample-refresh-token-2",
  contactNo: "8329521234",
  isVerified: true
};
const acadAdminData = {
    name: "Dr. Smith",
    email: "acadAdmin@iitg.ac.in",
    password: "admin123",
    refreshToken: "sample-refresh-token-3",
    contactNo: "9876543210",
    isVerified: true,
    designation: "Dean of Academic Affairs",
    qualifications: ["PhD in Computer Science", "M.Tech in AI"],
    status: "active"
};
const facultyData = {
    name: "Dr. Sarah Johnson",
    email: "faculty@iitg.ac.in",
    password: "faculty123",
    refreshToken: "sample-refresh-token-4",
    contactNo: "7654321890",
    isVerified: true,
    department: "Computer Science and Engineering",
    designation: "Associate Professor",
    courses: [],//empty for now
    specialization: "Machine Learning",
    qualifications: ["PhD in AI", "MTech in Computer Science"],
    status: "active"
};


const studentCoursesData = [
  {
      rollNo: "220101039",
      courseId: "CS101",
      creditOrAudit: "Credit",
      semester: "3",
      status: "Approved",
      grade: "A"
  },
  {
      rollNo: "220101039",
      courseId: "MA102",
      creditOrAudit: "Credit",
      semester: "3",
      status: "Approved",
      grade: "B+"
  },
  {
      rollNo: "220101039",
      courseId: "EE204",
      creditOrAudit: "Credit",
      semester: "3",
      status: "Approved",
      grade: "A-"
  },
  {
      rollNo: "220101039",
      courseId: "HS103",
      creditOrAudit: "Audit",
      semester: "3",
      status: "Pending",
      grade: null
  }
];

const coursesData = [
  {
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      department: "Computer Science and Engineering",
      slot: "A",
      credits: 6,
      announcements: [
          {
              title: "Mid-Semester Exam Schedule",
              content: "The mid-semester exam will be conducted on April 25, 2025, from 9:00 AM to 12:00 PM in the Main Auditorium. Please bring your ID cards and necessary stationery.",
              importance: "High",
              date: new Date("2025-04-10"),
              postedBy: "FACULTY001"
          },
          {
              title: "Assignment Submission Deadline Extended",
              content: "Due to the upcoming festival, the deadline for Assignment 2 has been extended to April 20, 2025.",
              importance: "Medium",
              date: new Date("2025-04-12"),
              postedBy: "FACULTY001"
          }
      ],
      students: [
        "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
      ]
  },
  {
      courseCode: "MA102",
      courseName: "Calculus and Linear Algebra",
      department: "Mathematics",
      slot: "C",
      credits: 8,
      announcements: [
          {
              title: "Extra Class This Weekend",
              content: "We will have an extra class this Saturday (April 19, 2025) from 10:00 AM to 12:00 PM to cover topics from Chapter 7.",
              importance: "Medium",
              date: new Date("2025-04-14"),
              postedBy: "FACULTY002"
          }
      ],
      students: [
        "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
      ]
  },
  {
      courseCode: "EE204",
      courseName: "Digital Electronics",
      department: "Electrical Engineering",
      slot: "E",
      credits: 6,
      announcements: [
          {
              title: "Lab Report Submission",
              content: "All lab reports for experiments 1-5 must be submitted by April 22, 2025. No extensions will be provided.",
              importance: "High",
              date: new Date("2025-04-08"),
              postedBy: "FACULTY003"
          },
          {
              title: "Project Groups Formation",
              content: "Please form groups of 3 students for the final project and submit your group details by April 17, 2025.",
              importance: "Medium",
              date: new Date("2025-04-11"),
              postedBy: "FACULTY003"
          }
        ],
        students: [
          "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
        ]
  },
  {
      courseCode: "HS103",
      courseName: "Introduction to Philosophy",
      department: "Humanities and Social Sciences",
      slot: "G",
      credits: 4,
      announcements: [
          {
              title: "Guest Lecture Announcement",
              content: "We will have a guest lecture by Prof. Michael Stevens on 'Contemporary Philosophical Perspectives' on April 23, 2025, at 3:00 PM in the HSS Auditorium.",
              importance: "Medium",
              date: new Date("2025-04-13"),
              postedBy: "FACULTY004"
          }
      ],
      students: [
        "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
      ]
  },
  {
      courseCode: "CS201",
      courseName: "Data Structures and Algorithms",
      department: "Computer Science and Engineering",
      slot: "B",
      credits: 8,
      announcements: [
          {
              title: "Coding Contest",
              content: "A coding contest will be held on April 21, 2025, from 6:00 PM to 9:00 PM in the Computer Lab. Top performers will receive extra credits.",
              importance: "Medium",
              date: new Date("2025-04-09"),
              postedBy: "FACULTY001"
          },
          {
              title: "URGENT: Change in Syllabus",
              content: "The topic 'Advanced Graph Algorithms' has been removed from the final exam syllabus. Please refer to the updated syllabus on the course portal.",
              importance: "Critical",
              date: new Date("2025-04-12"),
              postedBy: "FACULTY001"
          }
      ],
      students: [
        "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
      ]
  },
  {
      courseCode: "ME101",
      courseName: "Engineering Mechanics",
      department: "Mechanical Engineering",
      slot: "D",
      credits: 6,
      announcements: [
          {
              title: "Field Trip",
              content: "A field trip to the Manufacturing Plant is scheduled for April 27, 2025. Details will be shared in the next class.",
              importance: "Medium",
              date: new Date("2025-04-14"),
              postedBy: "FACULTY005"
          }
      ],
      students: [
        "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
      ]
  },
  {
      courseCode: "CH102",
      courseName: "Physical Chemistry",
      department: "Chemistry",
      slot: "F",
      credits: 6,
      announcements: [
          {
              title: "Lab Equipment Malfunction",
              content: "Due to a malfunction in the lab equipment, this week's practical session has been postponed to next week.",
              importance: "High",
              date: new Date("2025-04-13"),
              postedBy: "FACULTY006"
          }
      ],
      students: [
        "67fb82e1fd693835a24dd230", // Example student ID, replace with actual IDs
      ]
  }
];

const facultyCoursesData = [
  {
    facultyId: "FACULTY001", // Will be replaced with actual facultyId
    courseCode: "CS101",
    year: 2025,
    session: "Spring Semester",
    status: "Ongoing",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    facultyId: "FACULTY001", // Will be replaced with actual facultyId
    courseCode: "CS201",
    year: 2025,
    session: "Spring Semester",
    status: "Ongoing",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    facultyId: "FACULTY001", // Will be replaced with actual facultyId
    courseCode: "HS103",
    year: 2024,
    session: "Winter Semester",
    status: "Completed",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    facultyId: "FACULTY001", // Will be replaced with actual facultyId
    courseCode: "MA102",
    year: 2024,
    session: "Summer Course",
    status: "Completed",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];


// Function to seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log("Connected to MongoDB, starting seed process...");
    
    // Generate a salt
    const saltRounds = 10; // You can adjust this number for more or less security (higher is more secure but slower)
    const hashedPassword = await bcrypt.hash(facultyData.password, saltRounds);
    
    // Create user with the hashed password
    const createdFacultyUser = await User.create({
      ...facultyData, // Spread the existing facultyData
      password: hashedPassword, // Override the plain text password with the hashed one
    });
    console.log("User created:", createdFacultyUser.name, "with email:", createdFacultyUser.email);
    
    // Create a faculty with the same email
    const faculty = await Faculty.create({
      userId: createdFacultyUser._id,
      email: facultyData.email,
      department: facultyData.department,
      designation: facultyData.designation,
      courses: facultyData.courses,
          specialization: facultyData.specialization,
          qualifications: facultyData.qualifications,
          status: facultyData.status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("Faculty created with designation:", faculty.designation);
        console.log("Faculty is linked to user with email:", createdFacultyUser.email);
        
        // const hashedPassword = await bcrypt.hash(acadAdminData.password, saltRounds);
        
        // // Create user with the hashed password
        // const createdAcadAdminUser = await User.create({
          //   ...acadAdminData, // Spread the existing acadAdminData
          //   password: hashedPassword, // Override the plain text password with the hashed one
          // });
          // console.log("User created:", createdAcadAdminUser.name, "with email:", createdAcadAdminUser.email);
          
          // // Create an academic admin with the same email
          // const acadAdmin = await AcadAdmin.create({
            //       userId: createdAcadAdminUser._id,
            //       email: acadAdminData.email,
            //       designation: acadAdminData.designation,
            //       qualifications: acadAdminData.qualifications,
            //       status: acadAdminData.status,
            //       createdAt: new Date(),
            //       updatedAt: new Date()
            //     });
            //     console.log("Academic Admin created with designation:", acadAdmin.designation);
            //     console.log("Academic Admin is linked to user with email:", createdAcadAdminUser.email);
            
            // const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // // Create user with the hashed password
            // const createdUser = await User.create({
              //   ...userData, // Spread the existing userData
              //   password: hashedPassword, // Override the plain text password with the hashed one
              // });
              // console.log("User created:", createdUser.name, "with email:", createdUser.email);
              
              // // Create a student with the same email
              // const student = await Student.create({
                //       userId: createdUser._id,
                //       hostel: "Lohit",
                //       rollNo: "220101039",
                //       email: "testStudent@iitg.ac.in",
                //       department: "Computer Science and Engineering",
                //       semester: 3,
                //       batch: "2023-2027",
                //       program: "BTech",
                //       status: "active",
                //       roomNo: "D-234",
                //       createdAt: new Date(),
                //       updatedAt: new Date()
                //     });
                //     console.log("Student created with register number:", student.registerNo);
                //     console.log("Student is linked to user with email:", createdUser.email);
                
                // const hashedPassword2 = await bcrypt.hash(nonAcadAdminData.password, saltRounds);
                // console.log("Hashed password for non-academic admin:", hashedPassword2);
                // // Create the Non-Academic Admin User
                // const createdHabUser = await User.create({
                  //     ...nonAcadAdminData,
                  //     password: hashedPassword2,
                  // });
                  // console.log("Non-Academic Admin User created:", createdHabUser.name, "with email:", createdHabUser.email);
                  
                  // // Now create the HostelAdmin entry
                  // const createdHab = await HostelAdmin.create({
                    //     userId: createdHabUser._id,     // Link to created User
                    //     email: createdHabUser.email,    // Same email
                    //     status: "active",               // or "on-leave" / "inactive" if you want
                    // });
                    // console.log("HostelAdmin created:", createdHab.email);
                    
                    console.log("Database seeded successfully!");
                    process.exit(0);
                  } catch (error) {
                    console.error("Error seeding database:", error);
                    process.exit(1);
                  }
                };
                
const seedStudentCourses = async () => {
    try {
      // Connect to MongoDB
      await connectDB();
      console.log("Connected to MongoDB, starting student courses seed process...");
      
      // Check if courses already exist for this student
      const existingCourses = await StudentCourse.find({ rollNo: "220101039" });
      
      if (existingCourses.length > 0) {
        console.log(`Found ${existingCourses.length} existing courses for student 220101039. Deleting them before re-seeding.`);
        await StudentCourse.deleteMany({ rollNo: "220101039" });
      }
      
      // Insert the student courses
      const result = await StudentCourse.insertMany(studentCoursesData);
      
      console.log(`Successfully added ${result.length} courses for student 220101039:`);
      result.forEach(course => {
        console.log(`- ${course.courseId} (${course.creditOrAudit}) - Status: ${course.status}, Grade: ${course.grade || 'Not graded yet'}`);
      });
      
      console.log("Student courses seeded successfully!");
      process.exit(0);
    } catch (error) {
      console.error("Error seeding student courses:", error);
      process.exit(1);
    }
  };
  
  const seedCourses = async () => {
    try {
      // Connect to MongoDB
      await connectDB();
      console.log("Connected to MongoDB, starting courses seed process...");
      
      // Check if courses already exist
      const existingCourses = await Course.find({
        courseCode: { $in: coursesData.map(course => course.courseCode) }
      });
      
      if (existingCourses.length > 0) {
        console.log(`Found ${existingCourses.length} existing courses. Deleting them before re-seeding.`);
        await Course.deleteMany({
          courseCode: { $in: coursesData.map(course => course.courseCode) }
        });
      }
      
      // Insert the courses
      const result = await Course.insertMany(coursesData);
      
      console.log(`Successfully added ${result.length} courses:`);
      result.forEach(course => {
        console.log(`- ${course.courseCode}: ${course.courseName} (${course.credits} credits, Slot: ${course.slot})`);
      });
      
      console.log("Courses seeded successfully!");
      
      // If you want to run both seed functions, you can call seedStudentCourses() here
      // or just exit
      process.exit(0);
    } catch (error) {
      console.error("Error seeding courses:", error);
      process.exit(1);
    }
  };

  const seedFacultyCourses = async () => {
    try {
      // Connect to MongoDB
      await connectDB();
      console.log("Connected to MongoDB, starting faculty courses seed process...");
      
      // Get the faculty userId from the email to link courses properly
      const faculty = await Faculty.findOne({ email: facultyData.email });
      
      if (!faculty) {
        console.error("Faculty not found! Run seedDatabase first.");
        process.exit(1);
      }
      
      console.log("Faculty found:", faculty.name, "with ID:", faculty._id);
      console.log("Faculty : ", faculty);
      // Update facultyId in the data
      const facultyCoursesWithCorrectId = facultyCoursesData.map(course => ({
        ...course,
        facultyId: faculty.userId.toString() // Use the actual faculty ID
      }));

      // Add the faculty courses to the faculty document
      const updatedFaculty = await Faculty.findByIdAndUpdate(
        faculty.userId,
        { courses: facultyCoursesWithCorrectId },
        { new: true }
      );

      
      console.log(`Successfully added ${updatedFaculty.courses.length} courses to faculty ${updatedFaculty.email}:`);
      updatedFaculty.courses.forEach(course => {
        console.log(`- ${course.courseCode} (${course.session}, ${course.year}) - Status: ${course.status}`);
      });
      
      console.log("Faculty courses seeded successfully!");
      process.exit(0);
    } catch (error) {
      console.error("Error seeding faculty courses:", error);
      process.exit(1);
    }
  };
  // Run the seeding function
  // seedDatabase();
  // seedStudentCourses();
  
  export { seedDatabase, seedStudentCourses, seedCourses, seedFacultyCourses };