import { Course} from '../models/course.model.js';
import { Faculty } from '../models/faculty.model.js';

export const getCourseAnnouncements = async (req, res) => {
    try {
        
        const { courseId } = req.params;
        console.log("Fetching announcements for course ID:", courseId);
      // Find course with announcements
      const course = await Course.findOne({ courseCode: courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // If no announcements or empty array, return course with empty announcements
      if (!course.announcements || course.announcements.length === 0) {
        return res.status(200).json(course);
      }
      
      // Get all faculty IDs from announcements
      const facultyIds = [...new Set(course.announcements.map(announcement => announcement.postedBy))];
      
      // Find all faculty members who posted announcements
      const facultyMembers = await Faculty.find({ facultyId: { $in: facultyIds } });
      
      // Create a lookup object for faculty
      const facultyLookup = {};
      facultyMembers.forEach(faculty => {
        facultyLookup[faculty.facultyId] = {
          name: faculty.name,
          email: faculty.email,
          department: faculty.department,
          designation: faculty.designation
        };
      });
      
      // Add faculty details to each announcement
      const announcementsWithFaculty = course.announcements.map(announcement => {
        const faculty = facultyLookup[announcement.postedBy] || null;
        
        return {
          ...announcement.toObject(),
          faculty: faculty
        };
      });
      
      // Sort announcements by date (most recent first)
      announcementsWithFaculty.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Return course with enhanced announcements
      const result = {
        ...course.toObject(),
        announcements: announcementsWithFaculty
      };
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching course announcements:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch course announcements',
        error: error.message 
      });
    }
  };
  
  // Get faculty by IDs
  export const getFacultyByIds = async (req, res) => {
    try {
      const facultyIds = req.query.ids.split(',');
      
      // Find faculty members by IDs
      const facultyMembers = await Faculty.find({ facultyId: { $in: facultyIds } });
      
      if (!facultyMembers || facultyMembers.length === 0) {
        return res.status(404).json({ success: false, message: 'No faculty members found' });
      }
      
      return res.status(200).json(facultyMembers);
    } catch (error) {
      console.error('Error fetching faculty members:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch faculty members',
        error: error.message 
      });
    }
  };

export const getFacultyCourses = async (req, res) => {
try {

    console.log("Fetching faculty courses for user ID:", req.params.id);
    const { id } = req.params;

    // Check if the faculty exists
    const faculty = await Faculty.findOne({ userId: id });
    // console.log("Faculty found:", faculty);
    if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
    }
    
    // Get the faculty courses with details
    const facultyCourses = faculty.courses || [];
    // console.log("Faculty courses:", facultyCourses);
    // Get current semester status
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // // Determine current session based on month
    let currentSession;
    if (currentMonth >= 0 && currentMonth <= 4) {
        currentSession = 'Winter Semester';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
        currentSession = 'Summer Course';
    } else {
        currentSession = 'Spring Semester';
    }
    
    // Get all active courses for the current session
    // const activeCourses = facultyCourses.filter(course => 
    //     course.year === currentYear && 
    //     course.session === currentSession && 
    //     course.status === 'Ongoing'
    // );

    const activeCourses = facultyCourses.filter(course => course.status === 'Ongoing');

    // console.log("Active courses:", activeCourses);
    
    // Get course details for each active course
    const coursesWithDetails = await Promise.all(
        activeCourses.map(async (course) => {
        const courseDetails = await Course.findOne({ courseCode: course.courseCode });
        
        if (!courseDetails) {
            return {
            id: course.courseCode,
            name: course.courseCode, // Fallback if details not found
            department: "",
            credits: 0,
            assignments: 0,
            attendance: 0,
            announcements: 0,
            };
        }
        
        // Get student count (dummy data for now)
        const studentCount = Math.floor(Math.random() * 60) + 20; // Random between 20-80
        
        // Get assignment count
        const assignmentCount = Math.floor(Math.random() * 5) + 1; // Random between 1-5
        
        // Get average attendance (dummy data)
        const avgAttendance = Math.floor(Math.random() * 30) + 70; // Random between 70-100
        
        return {
            id: courseDetails.courseCode,
            name: courseDetails.courseName,
            department: courseDetails.department,
            credits: courseDetails.credits,
            students: studentCount,
            assignments: assignmentCount,
            avgAttendance: avgAttendance,
            announcements: courseDetails.announcements ? courseDetails.announcements.length : 0,
            year: course.year,
            session: course.session,
        };
        })
    );
    
    // Get feedback availability status (could be from settings or config)
    const feedbackOpen = currentMonth >= 3 && currentMonth <= 5; // Open during April-June
    
    return res.status(200).json({
        courses: coursesWithDetails,
        feedbackOpen: feedbackOpen
    });
    
    } catch (error) {
    console.error('Error fetching faculty courses:', error);
    return res.status(500).json({ message: 'Error fetching faculty courses', error: error.message });
    }
}

// Add a new announcement to a course (for faculty use)
export const addCourseAnnouncement = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, content, importance, postedBy } = req.body;

      console.log("Adding announcement to course ID:", courseId);
      // Validate request
      if (!title || !content || !postedBy) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title, content, and faculty ID are required' 
        });
      }
      
      // Find course
      const course = await Course.findOne({ courseCode: courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Create new announcement
      const newAnnouncement = {
        title,
        content,
        importance: importance || 'Medium',
        date: new Date(),
        postedBy
      };
      
      // Add announcement to course
      course.announcements.push(newAnnouncement);
      await course.save();
      
      return res.status(201).json({ 
        success: true, 
        message: 'Announcement added successfully',
        announcement: newAnnouncement 
      });
    } catch (error) {
      console.error('Error adding course announcement:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add announcement',
        error: error.message 
      });
    }
};
  
// Update an existing course announcement (for faculty use)
export const updateCourseAnnouncement = async (req, res) => {
  try {
    const { courseId, announcementId } = req.params;
    const { title, content, importance, attachments } = req.body;
    
    // Validate request
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Find course
    const course = await Course.findOne({ courseCode: courseId });
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Find announcement index
    const announcementIndex = course.announcements.findIndex(
      ann => ann.id.toString() === announcementId
    );
    
    if (announcementIndex === -1) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    // Update announcement
    course.announcements[announcementIndex].title = title;
    course.announcements[announcementIndex].content = content;
    course.announcements[announcementIndex].importance = importance || 'Medium';
    
    // Update attachments if provided
    if (attachments) {
      course.announcements[announcementIndex].attachments = attachments;
    }
    
    await course.save();
    
    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: course.announcements[announcementIndex]
    });
  } catch (error) {
    console.error('Error updating course announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message
    });
  }
};

// Delete a course announcement (for faculty use)
export const deleteCourseAnnouncement = async (req, res) => {
  try {

    const { courseId, announcementId } = req.params;
    console.log("Deleting announcement from course ID:", courseId);
    // Find course
    const course = await Course.findOne({ courseCode: courseId });
    
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Find announcement index
    const announcementIndex = course.announcements.findIndex(
      ann => ann.id.toString() === announcementId
    );

    
    if (announcementIndex === -1) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    // Remove announcement
    course.announcements.splice(announcementIndex, 1);
    await course.save();
    
    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
};