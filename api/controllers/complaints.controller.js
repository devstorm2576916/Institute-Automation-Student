// import { mongoose } from "../database/mongoDb.js";
import { HostelAdmin as Admin } from "../models/hostelAdmin.model.js";
import { Complaint, SupportStaff } from "../models/complaint.model.js";
import { validateAccessToken } from "../middleware/auth.middleware.js";

export default ComplaintsController = {
  createComplaint: async (req, res) => {
    const complaint = new Complaint(req.body);
    try {
      await complaint.save();
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
  getUserComplaints: async (req, res) => {
    const userId = req.user._id;
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

  // complaintId
  deleteComplaint: async (req, res) => {
    const complaintId = req.body.complaintId;
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
      if (complaint.userId !== userId) {
        console.log(`ERROR : User don't have access to this complaint`);
        console.log(`UserId : ${userId}, ComplaintID: ${complaintId}`);
        return res.status(403).json({
          message: "User don't h`ave access to this complaint",
        });
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
  // complaintId
  // updatedStatus
  updateStatus: async (req, res) => {
    const complaintId = req.body.complaintId;
    const updatedStatus = req.body.updatedStatus;
    if (!complaintId || !updatedStatus) {
      return res.status(400).json({
        error: "Missing attributes",
        message: "Required attributes: `complaintId` and `udpatedStatus`",
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
        updatedAt: Date.now,
      };
      const complaint = await Complaint.findByIdAndUpdate({ _id: complaintId }, patch, { new: true });
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

  // assignedName
  // assignedContact
  // complaintId
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
        updatedAt: Date.now(),
      };

      const complaint = await Complaint.findByIdAndUpdate({ _id: complaintId }, patch, { new: true });
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
      return res.status(500).json({
        message: "Something went wrong!",
        error: e,
      });
    }
  },

  // create support staff
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

  // delete support staff
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
    } catch (e) {}
  },

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
