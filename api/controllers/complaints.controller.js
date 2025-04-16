// import { mongoose } from "../database/mongoDb.js";
import { HostelAdmin as Admin } from "../models/hostelAdmin.model.js";
import { Complaint, SupportStaff } from "../models/complaint.model.js";

import { promises as fs } from 'fs'; // Using the promise-based fs module
import path from 'path'; // Import path module
import { Buffer } from 'buffer'; // Import Buffer

const ComplaintsController = {
  /**
   * Create a new complaint.
   * 
   * Input:
   * - Body: { title, date, description, imageUrl (optional), category, subCategory }
   * - User: { userId } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Successfully created the complaint", complaint }
   * - Error: { message: "Something went wrong!" }
   */
  createComplaint: async (req, res) => {
    const { title, date, description, phoneNumber, timeAvailability, address, locality, category, subCategory, images } = req.body;
    const imageNames = [];
    // Loop through each image in the array
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // Ensure the image is a valid Base64 string
      if (typeof image !== 'string') {
        continue; // Skip invalid entries
      }
      // Decode Base64 to a buffer and  Generate a unique file name
      const buffer = Buffer.from(image, 'base64');
      const filePath = `${Date.now()}_image_${i}.jpg`;
      imageNames.push(filePath);
      try {
        await fs.mkdir(path.join(process.cwd(), 'uploads/complaints'), { recursive: true });
        await fs.writeFile(path.join(process.cwd(), 'uploads/complaints', filePath), buffer);
        console.log(`Saved image ${i} to ${filePath}`);
      } catch (err) {
        console.error(`Failed to save image ${i}:`, err.message);
      }
    }
    const complaint = new Complaint({ title, date, description, phoneNumber, timeAvailability, address, locality, category, subCategory, userId: req.user.userId, imageUrls: imageNames });
    try {
      await complaint.save();
      console.log(`Complaint created successfully: ${complaint._id}`);
      res.status(201).json({
        message: "Successfully created the complaint",
        complaint: complaint,
      });
    } catch (e) {
      console.log(`ERROR: Creating the complaint`);
      console.log(e);
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },

  /**
   * Get complaints of the logged-in user.
   * 
   * Input:
   * - Body: { page (optional), limit (optional) }
   * - User: { userId } (from `req.user`)
   * 
   * Output:
   * - Success: { data: complaints, pagination: { currentPage, totalPages, pageSize, totalItems } }
   * - Error: { message: "Something went wrong!" }
   */
  getUserComplaints: async (req, res) => {
    const userId = req.user.userId;
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const skip = (page - 1) * limit;

      const totalComplaints = await Complaint.countDocuments({ userId });
      const totalPages = Math.ceil(totalComplaints / limit);
      const complaints = await Complaint.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 });

      res.send({
        data: complaints,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          pageSize: limit,
          totalItems: totalComplaints,
        },
      });
    } catch (e) {
      console.log(`ERROR: Fetching user complaints : ${userId}`);
      console.log(e);
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },

  /**
   * Get all complaints (Admin only).
   * 
   * Input:
   * - Body: { page (optional), limit (optional) }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { data: complaints, pagination: { currentPage, totalPages, pageSize, totalItems } }
   * - Error: { message: "Something went wrong while fetching complaints." }
   */
  getAllComplaints: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorized access to fetch all complaints by user with email: ${req.user.email}`);
        return res.status(403).json({
          error: "User is not authorized for this action",
          message: "You are not authorized to view all complaints",
        });
      }

      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const skip = (page - 1) * limit;

      const totalComplaints = await Complaint.countDocuments();
      const totalPages = Math.ceil(totalComplaints / limit);

      const complaints = await Complaint.find().skip(skip).limit(limit).sort({ createdAt: -1 });
      return res.send({
        data: complaints,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          pageSize: limit,
          totalItems: totalComplaints,
        },
      });
    } catch (error) {
      console.error("ERROR: Fetching all complaints:", error);
      return res.status(500).json({ message: "Something went wrong while fetching complaints." });
    }
  },

  /**
   * Delete a complaint.
   * 
   * Input:
   * - Body: { _id (complaintId) }
   * - User: { userId } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Complaint deleted successfully!" }
   * - Error: { message: "Complaint not found!" } or { message: "Something went wrong!" }
   */
  deleteComplaint: async (req, res) => {
    const complaintId = req.body._id;
    const userId = req.user.userId;

    if (!complaintId) {
      res.status(400).json({
        message: "Missing required attribute 'complaintId'",
      });
      return;
    }
    try {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({
          message: `Complaint not found : ${complaintId}`,
        });
      }
      if (complaint.userId.toString() !== userId) {
        console.log(`ERROR : User don't have access to this complaint`);
        console.log(`UserId : ${userId}, ComplaintID: ${complaintId}`);
        return res.status(403).json({
          message: "User don't have access to this complaint",
        });
      }
      
      // Check if complaint is resolved, and if so, prevent deletion
      if (complaint.status === 'Resolved') {
        return res.status(403).json({
          message: "Resolved complaints cannot be deleted",
          error: "Resolved complaints are permanently stored in the system"
        });
      }
      
      // Delete associated images from disk
      if (complaint.imageUrls && complaint.imageUrls.length > 0) {
        for (const imagePath of complaint.imageUrls) {
          try {
            await fs.unlink(path.join(process.cwd(), 'uploads/complaints', imagePath));
            console.log(`Deleted image: ${imagePath}`);
          } catch (err) {
            console.error(`Failed to delete image '${imagePath}':`, err.message);
          }
        }
      }
      const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);
      if (deletedComplaint) {
        console.log(`ERROR: Deleting complaint '${complaintId}'`);
        return res.send({
          message: "Complaint deleted successfully!",
        });
      }
      console.log(`ERROR: Deleting complaint : '${complaintId}'`);
      return res.status(404).json({
        error: `No matching complaint with id : ${complaintId}`,
        message: "Complaint not found!",
      });
    } catch (e) {
      console.log(`ERROR: Deleting complaint : '${complaintId}'`);
      console.log(e);
      return res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },

  /**
   * Update the status of a complaint (Admin only).
   * 
   * Input:
   * - Body: { complaintId, updatedStatus }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Complaint updated successfully!", complaint }
   * - Error: { message: "Complaint not found!" } or { message: "Something went wrong!" }
   */
  updateStatus: async (req, res) => {
    const complaintId = req.body.complaintId;
    const updatedStatus = req.body.updatedStatus;
    if (!complaintId || !updatedStatus) {
      return res.status(400).json({
        error: "Missing attributes",
        message: "Required attributes: `complaintId` and `updatedStatus`",
      });
    }
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorised access to update complaint status`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to update status",
        });
      }

      // Get the complaint to check if it has an assigned staff member
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found!",
        });
      }

      // Update the complaint status
      const patch = {
        status: updatedStatus,
        updatedAt: Date.now(),
      };
      
      const updatedComplaint = await Complaint.findByIdAndUpdate(complaintId, patch, { new: true });

      // If the status is changed to "Resolved" and the complaint has an assigned staff member
      if (updatedStatus === 'Resolved' && complaint.assignedStaffId) {
        // Add to resolved complaints and remove from assigned complaints
        await SupportStaff.findByIdAndUpdate(
          complaint.assignedStaffId,
          { 
            $pull: { assignedComplaints: complaintId },
            $addToSet: { resolvedComplaints: complaintId }
          }
        );
      }

      return res.send({
        message: "Complaint updated successfully!",
        complaint: updatedComplaint,
      });
    } catch (e) {
      console.log(`ERROR: Updating status`);
      console.log(e);
      return res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },

  /**
   * Assign a complaint to a support staff (Admin only).
   * 
   * Input:
   * - Body: { complaintId, supportStaffId }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Complaint assigned successfully!", complaint }
   * - Error: { message: "Complaint not found!" } or { message: "Something went wrong!" }
   */
  assignComplaint: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorised access to assign complaint`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to assign complaints",
        });
      }
      
      const { complaintId, supportStaffId } = req.body;
      if (!complaintId || !supportStaffId) {
        return res.status(400).json({
          error: "Missing attributes",
          message: "Required attributes: `complaintId` and `supportStaffId`",
        });
      }

      // Find the support staff
      const supportStaff = await SupportStaff.findById(supportStaffId);
      if (!supportStaff) {
        return res.status(404).json({
          message: "Support staff not found!",
        });
      }

      // Check if the staff is already handling too many complaints
      if (supportStaff.assignedComplaints && supportStaff.assignedComplaints.length >= 5) {
        return res.status(400).json({
          message: "Support staff is busy with 5 or more complaints already!",
        });
      }

      // Find the complaint
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found!",
        });
      }
      
      // If complaint is already assigned to someone else, remove it from their list
      if (complaint.assignedStaffId) {
        await SupportStaff.findByIdAndUpdate(
          complaint.assignedStaffId,
          { $pull: { assignedComplaints: complaintId } }
        );
      }

      // Update complaint with staff info
      const updatedComplaint = await Complaint.findByIdAndUpdate(
        complaintId, 
        { 
          assignedName: supportStaff.name,
          assignedContact: supportStaff.phone,
          assignedStaffId: supportStaffId,
          status: "In Progress",
          updatedAt: Date.now(),
        }, 
        { new: true }
      );

      // Add complaint to staff's assigned complaints list
      await SupportStaff.findByIdAndUpdate(
        supportStaffId,
        { $addToSet: { assignedComplaints: complaintId } }
      );

      return res.status(200).json({
        message: "Complaint assigned successfully!",
        complaint: updatedComplaint,
      });
    } catch (e) {
      console.log(`ERROR: Assigning complaint : ${e}`);
      return res.status(500).json({
        message: "Something went wrong!",
        error: e,
      });
    }
  },

  /**
   * Create a new support staff (Admin only).
   * 
   * Input:
   * - Body: { name, phone }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Successfully created the support staff", supportStaff }
   * - Error: { message: "Something went wrong!" }
   */
  createSupportStaff: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorised access to update complaint status`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to update status",
        });
      }
      const supportStaff = new SupportStaff(req.body);
      await supportStaff.save();
      return res.status(201).json({
        message: "Successfully created the support staff",
        supportStaff: supportStaff,
      });
    } catch (e) {
      return res.status(500).json({
        message: "Something went wrong!",
        error: e,
      });
    }
  },

  /**
   * Delete a support staff (Admin only).
   * 
   * Input:
   * - Body: { supportStaffId }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Support staff deleted successfully!" }
   * - Error: { message: "Support staff not found!" } or { message: "Something went wrong!" }
   */
  deleteSupportStaff: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorised access to update complaint status`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to update status",
        });
      }
      const response = await SupportStaff.findByIdAndDelete(req.body.supportStaffId);
      if (response) {
        console.log(`Support staff deleted successfully!: ${req.body.supportStaffId}`);
        return res.status(200).json({
          message: "Support staff deleted successfully!",
        });
      }
      console.log(`Error: No support staff found with ID ${req.body.supportStaffId}`);
      return res.status(404).json({
        message: "Support staff not found!",
        error: `No support staff found with ID ${req.body.supportStaffId}`,
      });
    } catch (e) {
      return res.status(500).json({
        message: "Something went wrong!",
        error: e,
      });
    }
  },

  /**
   * Get all support staff (Admin only).
   * 
   * Input:
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Support staff fetched successfully!", supportStaff }
   * - Error: { message: "Something went wrong!" }
   */
  getAllSupportStaff: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorised access to update complaint status`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to update status",
        });
      }
      const supportStaff = await SupportStaff.find();
      return res.status(200).json({
        message: "Support staff fetched successfully!",
        supportStaff: supportStaff,
      });
    } catch (e) {
      return res.status(500).json({
        message: "Something went wrong!",
        error: e,
      });
    }
  },

  /**
   * Get filtered support staff based on category and subcategory (Admin only).
   * 
   * Input:
   * - Query: { category, subCategory }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Support staff fetched successfully!", supportStaff }
   * - Error: { message: "Something went wrong!" }
   */
  getFilteredSupportStaff: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorised access to fetch support staff`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to fetch support staff",
        });
      }
      
      const { category, subCategory } = req.query;
      
      if (!category || !subCategory) {
        return res.status(400).json({
          error: "Missing query parameters",
          message: "Required query parameters: 'category' and 'subCategory'",
        });
      }
      
      // Find staff who either:
      // 1. Have the matching category and subcategory, or
      // 2. Don't have any category/subcategory specified (generalists)
      // And have fewer than 5 assigned complaints
      const supportStaff = await SupportStaff.find({
        $and: [
          // Staff who have fewer than 5 active complaints
          { $expr: { $lt: [{ $size: { $ifNull: ["$assignedComplaints", []] } }, 5] } },
          {
            $or: [
              // Staff who specialize in this category/subcategory
              { 
                $or: [
                  { categories: { $in: [category] } },
                  { categories: { $size: 0 } },
                  { categories: { $exists: false } }
                ]
              },
              { 
                $or: [
                  { subCategories: { $in: [subCategory] } },
                  { subCategories: { $size: 0 } },
                  { subCategories: { $exists: false } }
                ]
              }
            ]
          }
        ]
      });
      
      // Sort the results in memory after retrieving them from the database
      // This avoids the MongoDB sort expression issue
      const sortedStaff = supportStaff.sort((a, b) => {
        const aCount = a.assignedComplaints ? a.assignedComplaints.length : 0;
        const bCount = b.assignedComplaints ? b.assignedComplaints.length : 0;
        return aCount - bCount; // Sort by number of complaints (ascending)
      });
      
      return res.status(200).json({
        message: "Support staff fetched successfully!",
        supportStaff: sortedStaff,
      });
    } catch (e) {
      console.log(`ERROR: Fetching filtered support staff: ${e}`);
      return res.status(500).json({
        message: "Something went wrong!",
        error: e,
      });
    }
  },

  /**
   * Update a support staff's availability status.
   * @route PATCH /api/complaints/admin/supportStaff/availability
   * @access Private - Admin only
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.supportStaffId - The ID of the support staff to update
   * @param {boolean} req.body.isAvailable - The new availability status
   * @param {Object} res - Express response object
   * @returns {Object} - Response object
   * - Success: { message: "Successfully updated support staff availability", supportStaff }
   * - Error: { message: "Error message" }
   */
  updateSupportStaffAvailability: async (req, res) => {
    try {
      // Validate request
      const { supportStaffId, isAvailable } = req.body;
      
      if (!supportStaffId) {
        return res.status(400).json({ message: "Support staff ID is required" });
      }
      
      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "isAvailable must be a boolean value" });
      }
      
      // Find and update the support staff
      const supportStaff = await SupportStaff.findByIdAndUpdate(
        supportStaffId,
        { isAvailable },
        { new: true } // Return the updated document
      );
      
      if (!supportStaff) {
        return res.status(404).json({ message: "Support staff not found" });
      }
      
      return res.status(200).json({
        message: "Successfully updated support staff availability",
        supportStaff: supportStaff,
      });
    } catch (error) {
      console.error("Error updating support staff availability:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Get complaints filtered by status with pagination (Admin only).
   * 
   * Input:
   * - Body: { status, page (optional), limit (optional) }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { data: complaints, pagination: { currentPage, totalPages, pageSize, totalItems } }
   * - Error: { message: "Something went wrong while fetching complaints." }
   */
  getComplaintsByStatus: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.user.email });
      if (!admin) {
        console.log(`ERROR: Unauthorized access to fetch complaints by status by user with email: ${req.user.email}`);
        return res.status(403).json({
          error: "User is not authorized for this action",
          message: "You are not authorized to view these complaints",
        });
      }

      const status = req.body.status;
      if (!status) {
        return res.status(400).json({
          error: "Missing required attribute",
          message: "Status is required to filter complaints",
        });
      }

      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const skip = (page - 1) * limit;

      // Find complaints with the specified status
      const query = { status };
      const totalComplaints = await Complaint.countDocuments(query);
      const totalPages = Math.ceil(totalComplaints / limit);

      const complaints = await Complaint.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      return res.send({
        data: complaints,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          pageSize: limit,
          totalItems: totalComplaints,
        },
      });
    } catch (error) {
      console.error("ERROR: Fetching complaints by status:", error);
      return res.status(500).json({ message: "Something went wrong while fetching complaints." });
    }
  },

  /**
   * Get complaint details by ID.
   * 
   * Input:
   * - Params: { id }
   * - User: { email } (from `req.user`)
   * 
   * Output:
   * - Success: { message: "Complaint details fetched successfully!", complaint }
   * - Error: { message: "Complaint not found!" } or { message: "Something went wrong!" }
   */
  getComplaintById: async (req, res) => {
    try {
      const complaintId = req.params.id;
      
      if (!complaintId) {
        return res.status(400).json({
          error: "Missing complaint ID",
          message: "Complaint ID is required"
        });
      }

      const complaint = await Complaint.findById(complaintId);
      
      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found!"
        });
      }

      return res.status(200).json({
        message: "Complaint details fetched successfully!",
        complaint: complaint
      });
    } catch (e) {
      console.error(`ERROR: Fetching complaint details by ID: ${e}`);
      return res.status(500).json({
        message: "Something went wrong while fetching complaint details."
      });
    }
  },

};

export default ComplaintsController;