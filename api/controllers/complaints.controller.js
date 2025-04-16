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
      const patch = {
        status: updatedStatus,
        updatedAt: Date.now(),
      };
      const complaint = await Complaint.findByIdAndUpdate(complaintId, patch, { new: true });
      if (complaint) {
        return res.send({
          message: "Complaint updated successfully!",
          complaint: complaint,
        });
      }
      return res.status(404).json({
        message: "Complaint not found!",
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
   * - Body: { complaintId, assignedName, assignedContact }
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
        console.log(`ERROR: Unauthorised access to update complaint status`);
        return res.status(403).json({
          error: "User is not authorised for this action",
          message: "You are not authorised to update status",
        });
      }
      const { complaintId, assignedName, assignedContact } = req.body;
      if (!complaintId || !assignedName || !assignedContact) {
        return res.status(400).json({
          error: "Missing attributes",
          message: "Required attributes: `complaintId`, `assignedName`, and `assignedContact`",
        });
      }

      const patch = {
        assignedName,
        assignedContact,
        status: "In Progress",
        updatedAt: Date.now(),
      };
      const complaint = await Complaint.findByIdAndUpdate(complaintId, patch, { new: true });
      if (complaint) {
        return res.send({
          message: "Complaint assigned successfully!",
          complaint: complaint,
        });
      }

      return res.status(404).json({
        message: "Complaint not found!",
      });
    } catch (e) {
      console.log(`ERROR: Assigning complaint : ${e}`);
      return res.send({
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
};

export default ComplaintsController;