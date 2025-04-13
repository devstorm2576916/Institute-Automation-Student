import { Student } from '../models/student.model.js';
import { Course, StudentCourse, FacultyCourse } from '../models/course.model.js';

// Keep your existing getStudent function
export const getStudent = async (req, res) => {
    const studentId = req.params.id;
    console.log(studentId);
    const user = await Student.findOne({ userId: studentId })
        .populate('userId');
    if (!user) {
        return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(user);
    console.log("Student details fetched successfully", user);
};

// Add this new function for student courses
export const getStudentCourses = async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log("Fetching courses for student ID:", studentId);
        
        // First get the student record to get the roll number
        const student = await Student.findOne({ userId: studentId });

        if (!student) {
            console.log("Student not found for ID:", studentId);
            return res.status(404).json({ message: "Student not found" });
        }
        
        console.log("Found student with roll number:", student.rollNo);

        // Get current academic session
        const now = new Date();
        const year = now.getFullYear();
        let session;
        
        if (now.getMonth() >= 0 && now.getMonth() <= 4) {
            session = 'Spring Semester';
        } else if (now.getMonth() >= 5 && now.getMonth() <= 7) {
            session = 'Summer Course';
        } else {
            session = 'Winter Semester';
        }
        
        const semester = `${session} ${year}`;
        console.log("Current academic session:", semester);
        console.log(student.rollNo);
        
        // Find approved courses for this student
        const studentCourses = await Course.find({});
        
        console.log(`Found ${studentCourses.length} enrolled courses for student`);
        
        if (!studentCourses || studentCourses.length === 0) {
            return res.status(200).json({ 
                courses: [],
                feedbackOpen: false
            });
        }
        
        // Get course details and faculty information
        const courses = await Promise.all(
            studentCourses.map(async (sc) => {
                const course = await Course.findOne({ courseCode: sc.courseId });
                
                if (!course) {
                    console.log(`Course not found for ID: ${sc.courseId}`);
                    return null;
                }
                
                const facultyCourse = await FacultyCourse.findOne({
                    courseCode: sc.courseId
                }).populate('facultyId', 'name');
                
                // Use placeholder values for some fields
                return {
                    id: course.courseCode,
                    name: course.courseName,
                    instructor: facultyCourse?.facultyId?.name || 'TBA',
                    credits: course.credits,
                    assignments: 8, // Placeholder
                    announcements: 3, // Placeholder
                    attendance: 85 // Placeholder
                };
            })
        );
        
        // Filter out null values (courses that weren't found)
        const validCourses = courses.filter(course => course !== null);
        console.log(`Returning ${validCourses.length} valid courses`);
        
        // Determine if feedback is available (implement your logic)
        const isFeedbackAvailable = false; // Placeholder
        
        res.status(200).json({
            courses: validCourses,
            feedbackOpen: isFeedbackAvailable
        });
        
    } catch (error) {
        console.error("Error fetching student courses:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
};


// Drop a course for a student
export const dropCourse = async (req, res, next) => {
    try {
      const { studentId, courseId } = req.params;
      // Find the student
      const student = await Student.findById(studentId);
      console.log("studentId isne database se nikali hai so good hai", studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Check if the student is enrolled in the course
      const courseIndex = student.courses.findIndex(course => course.toString() === courseId);
      if (courseIndex === -1) {
        return res.status(404).json({ message: "Course not found in student's enrolled courses" });
      }
      
      // Remove the course from the student's courses array
      student.courses.splice(courseIndex, 1);
      await student.save();
      
      // Find the course and update its enrolled students
      const course = await Course.findById(courseId);
      if (course) {
        const studentIndex = course.enrolledStudents.findIndex(id => id.toString() === studentId);
        if (studentIndex !== -1) {
          course.enrolledStudents.splice(studentIndex, 1);
          await course.save();
        }
      }
      
      res.status(200).json({ message: "Course dropped successfully" });
    } catch (error) {
      next(error);
    }
  };
