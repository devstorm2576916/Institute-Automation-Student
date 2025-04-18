import { Course} from '../models/course.model.js';
import { Faculty } from '../models/faculty.model.js';
import { Student } from '../models/student.model.js';
import { StudentCourse } from '../models/course.model.js';
import { User } from '../models/user.model.js';

  

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
        
        const faculty = await Faculty.findOne({ userId: postedBy });
        console.log("Faculty:", faculty);
        if(!faculty) {
          return res.status(404).json({ success: false, message: 'Faculty not found' });
        } 
        const facultyUser = await User.findOne({ _id: postedBy });
        console.log("Faculty User ID:", postedBy);
        console.log("Faculty User:", facultyUser);
        if(!facultyUser) {
          return res.status(404).json({ success: false, message: 'Faculty user not found' });
        }

        console.log("Faculty User:", facultyUser);
        // Create new announcement
        const newAnnouncement = {
          title,
          content,
          importance: importance || 'Medium',
          date: new Date(),
          postedBy: facultyUser.name
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
  