import mongoose from "mongoose";
import { ApplicationDocument, Bonafide, Passport } from '../models/documents.models.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/user.model.js';
import { FeeBreakdown } from "../models/fees.model.js";

// Get all applications with pagination
export const getAllApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const applications = await ApplicationDocument.find()
            .populate({
                path: 'studentId',
                select: 'rollNo department program userId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await ApplicationDocument.countDocuments();

        const enrichedApplications = applications.map(app => ({
            ...app,
            studentId: {
                ...app.studentId,
                name: app.studentId?.userId?.name
            }
        }));

        // console.log(enrichedApplications)
        res.status(200).json({
            applications: enrichedApplications,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filter applications based on query parameters
export const filterApplications = async (req, res) => {
    try {
        const { rollNo, type, status } = req.query;
        let query = {};

        // Build query based on filters
        if (rollNo) {
            const student = await Student.findOne({ 
                rollNo: { $regex: `^${rollNo}`, $options: 'i' } // Changed to match prefix only
            });
            if (student) {
                query.studentId = student._id;
            } else {
                return res.status(200).json([]); // Return empty if no student found
            }
        }
        
        if (type && type !== 'all') {
            query.documentType = type;
        }
        
        if (status && status !== 'all') {
            // Convert status to proper case (first letter uppercase)
            const properStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            query.status = properStatus;
        }

        const applications = await ApplicationDocument.find(query)
            .populate({
                path: 'studentId',
                select: 'rollNo department program userId hostel roomNo batch fatherName motherName',
                populate: {
                    path: 'userId',
                    select: 'name dateOfBirth email contactNo'
                }
            })
            .populate('approvalDetails.approvedBy', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // console.log(applications)
        // Get detailed information for each application
        const detailedApplications = await Promise.all(applications.map(async (app) => {
            let details;
            switch (app.documentType) {
                case 'Bonafide':
                    details = await Bonafide.findOne({ applicationId: app._id });
                    break;
                case 'Passport':
                    details = await Passport.findOne({ applicationId: app._id });
                    break;
                default:
                    details = null;
            }

            return {
                ...app,
                details,
                studentName: app.studentId?.userId?.name || 'N/A',
                rollNo: app.studentId?.rollNo || 'N/A',
                department: app.studentId?.department || 'N/A'
            };
        }));

        res.status(200).json(detailedApplications);
    } catch (error) {
        console.error('Filter Applications Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get specific application details
export const getApplicationById = async (req, res) => {
    try {
        const application = await ApplicationDocument.findById(req.params.id)
            .populate({
                path: 'studentId',
                select: 'rollNo department program semester userId hostel roomNo batch fatherName motherName',
                populate: {
                    path: 'userId',
                    select: 'name dateOfBirth email contactNo'
                }
            })
            .populate('approvalDetails.approvedBy', 'name')
            .lean();

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        let details;
        if (application.documentType === 'Bonafide') {
            details = await Bonafide.findOne({ applicationId: application._id });
        } else if (application.documentType === 'Passport') {
            details = await Passport.findOne({ applicationId: application._id });
        }

        // Enrich with complete student details
        const studentDetails = {
            name: application.studentId?.userId?.name,
            rollNo: application.studentId?.rollNo,
            department: application.studentId?.department,
            program: application.studentId?.program,
            dateOfBirth: application.studentId?.userId?.dateOfBirth,
            email: application.studentId?.userId?.email,
            contactNumber: application.studentId?.userId?.contactNo,
            hostelName: application.studentId?.hostel,
            roomNo: application.studentId?.roomNo,
            fathersName: application.studentId?.fatherName,
            mothersName: application.studentId?.motherName,
            semester: application.studentId?.semester,
            batch: application.studentId?.batch
        };

        // Add name from user model and ensure approvalDetails are present
        const enrichedApplication = {
            ...application,
            details,
            studentDetails,
            approvalDetails: {
                ...application.approvalDetails,
                remarks: application.approvalDetails?.remarks || [],
                approvalDate: application.updatedAt
            }
        };

        res.status(200).json(enrichedApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update application status and add remarks
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        
        if (!id || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Convert status to proper case (first letter uppercase)
        const properStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        let application = await ApplicationDocument.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Initialize approvalDetails if it doesn't exist
        if (!application.approvalDetails) {
            application.approvalDetails = {
                remarks: [],
                approvalDate: new Date()
            };
        }

        // Update the application
        application.status = properStatus;
        
        // Add remarks if provided
        if (remarks) {
            // Initialize remarks array if it doesn't exist
            if (!application.approvalDetails.remarks) {
                application.approvalDetails.remarks = [];
            }
            application.approvalDetails.remarks.push(remarks);
        }
        
        application.updatedAt = new Date();

        // Save the updated application
        const updatedApplication = await application.save();

        // Populate necessary fields
        await updatedApplication.populate({
            path: 'studentId',
            select: 'rollNo department program userId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        });

        // Enrich response with student name
        const enrichedApplication = {
            ...updatedApplication.toObject(),
            studentId: {
                ...updatedApplication.studentId.toObject(),
                name: updatedApplication.studentId?.userId?.name
            }
        };

        res.status(200).json(enrichedApplication);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// Add comment to application
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const application = await ApplicationDocument.findByIdAndUpdate(
            id,
            {
                $push: {
                    'approvalDetails.remarks': comment
                },
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const addFeeStructure = async (req, res) => {
    try {
      const requiredFields = [
        "year",
        "program",
        "semesterParity",
        "tuitionFees",
        "examinationFees",
        "registrationFee",
        "gymkhanaFee",
        "medicalFee",
        "hostelFund",
        "hostelRent",
        "elecAndWater",
        "messAdvance",
        "studentsBrotherhoodFund",
        "acadFacilitiesFee",
        "hostelMaintenance",
        "studentsTravelAssistance",
      ];
  
      // Check if all required fields are present
      const missingFields = requiredFields.filter((field) => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
          success: false,
        });
      }
  
      // Validate numeric fields
      const numericFields = [
        "year",
        "semesterParity",
        "tuitionFees",
        "examinationFees",
        "registrationFee",
        "gymkhanaFee",
        "medicalFee",
        "hostelFund",
        "hostelRent",
        "elecAndWater",
        "messAdvance",
        "studentsBrotherhoodFund",
        "acadFacilitiesFee",
        "hostelMaintenance",
        "studentsTravelAssistance",
      ];
  
      const invalidFields = numericFields.filter(
        (field) => isNaN(req.body[field]) || req.body[field] < 0
      );
  
      if (invalidFields.length > 0) {
        return res.status(400).json({
          message: `Invalid numeric values for fields: ${invalidFields.join(
            ", "
          )}`,
          success: false,
        });
      }
  
      // Validate program
      const validPrograms = ["BTech", "MTech", "PhD", "BDes", "MDes"];
      if (!validPrograms.includes(req.body.program)) {
        return res.status(400).json({
          message: "Invalid program. Must be one of: " + validPrograms.join(", "),
          success: false,
        });
      }
  
      const feeData = {
        ...req.body,
        breakdownId: new mongoose.Types.ObjectId(),
      };
  
      const feeBreakdown = new FeeBreakdown(feeData);
      await feeBreakdown.save();
  
      return res.status(201).json({
        message: "Fee structure added successfully",
        success: true,
        data: feeBreakdown,
      });
    } catch (error) {
      console.error("Error adding fee structure:", error);
      return res.status(500).json({
        message: "Failed to add fee structure",
        success: false,
        error: error.message,
      });
    }
  };
  
  export const getFeeBreakdown = async (req, res) => {
      try {
          const { year, program, semesterParity } = req.query;
          const query = {};
  
          if (year) query.year = year;
          if (program) query.program = program;
          if (semesterParity) query.semesterParity = semesterParity;
  
          const feeBreakdowns = await FeeBreakdown.find(query);
  
          if (!feeBreakdowns.length) {
              return res.status(404).json({
                  message: "No fee breakdown found for the given query",
                  success: false,
              });
          }
  
          return res.status(200).json({
              message: "Fee breakdown fetched successfully",
              success: true,
              data: feeBreakdowns,
          });
      } catch (error) {
          console.error("Error fetching fee breakdown:", error);
          return res.status(500).json({
              message: "Failed to fetch fee breakdown",
              success: false,
              error: error.message,
          });
      }
  };

  