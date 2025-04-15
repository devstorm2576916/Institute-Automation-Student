import newRequest from "../../client/src/utils/newRequest.js";
import axios from "axios";
import { HostelLeave, HostelTransfer } from "../models/hostel.model.js";
import { Student } from '../models/student.model.js';

export const studentLeave = async (req, res) => {
  try {
    const { studentId, startDate, endDate, applicationId, email, reason } = req.body;
    console.log(req.body);
    // Validate input
    if (!studentId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    // const startDate = new Date(leaveStartDate);
    // const endDate = new Date(leaveEndDate);

    // Validate dates
    if (startDate >= endDate) {
        return res.status(400).json({ message: "End date must be after start date" });
    }
    if (startDate < new Date()) {
        return res.status(400).json({ message: "Start date cannot be in the past" });
    }


    const student = await Student.findOne({ email });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    if (student.rollNo !== studentId) {
        return res.status(400).json({ message: "Student ID does not match email" });
    }
    // Create leave request object
    const leaveRequest = {
        rollNo: student.rollNo,
        // applicationId,
        startDate,
        endDate,
        reason,
        status: 'Pending',
    };

    // Save to database (assuming you have a LeaveRequest model)
    await HostelLeave.create(leaveRequest);
    console.log(leaveRequest);
    // For example, save the leave request to the database

    res.status(200).json({ message: "Leave request submitted successfully" });
  } catch (error) {
    console.error("Error in studentLeave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getStudentLeave = async (req, res) => {
    try {
      const student = await Student.findOne({userId: req.params.id});
  
      if (!student) {
        console.error("Student not found:", req.params.id);
        return res.status(404).json({ message: "Student not found" });
      }
  
      const leaves = await HostelLeave.find({ rollNo: student.rollNo });
  
      if (!leaves || leaves.length === 0) {
        return res.status(404).json({ message: "No leaves found for this student" });
      }
  
      res.status(200).json(leaves);
    } catch (error) {
      console.error("Error in getStudentLeave:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await HostelLeave.find({});

        if (!leaves || leaves.length === 0) {
            return res.status(404).json({ message: "No leaves found" });
        }
        res.status(200).json(leaves);
    } catch (error) {
        console.error("Error in getAllLeaves:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateAnyLeave = async (req, res) => {
    try {
        const { status } = req.body;
        const leaveId = req.params.id;

        const leave = await HostelLeave.findByIdAndUpdate(leaveId, { status }, { new: true });

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        res.status(200).json({ message: "Leave request updated successfully", leave });
    } catch (error) {
        console.error("Error in updateAnyLeave:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const hostelTransfer = async (req, res) => {
  try {
    const { status, studentId, currentHostel, requestedHostel, reason } = req.body;
    console.log(req);

    // Validate input
    if (!studentId || !currentHostel || !requestedHostel || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.findOne({ rollNo: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create transfer request object
    const transferRequest = {
      rollNo: student.rollNo,
      currentHostel,
      requestedHostel,
      reason,
      status
    };

    // Save to database
    await HostelTransfer.create(transferRequest);

    res.status(200).json({ message: "Transfer request submitted successfully" });
  } catch (error) {
    console.error("Error in createTransferRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentTransfer = async (req, res) => {
  try {
    const student = await Student.findOne({userId: req.params.id});
    

    if (!student) {
      console.error("Student not found:", id);
      return res.status(404).json({ message: "Student not found" });
    }

    const requests = await HostelTransfer.find({ rollNo: student.rollNo });
    if (!requests) {
      return res.status(404).json({ message: "No requests found for this student" });
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getStudentTransfer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all transfer requests
export const getAllTransferRequests = async (req, res) => {
  try {
    const requests = await HostelTransfer.find({});
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getAllTransferRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Approve or reject a transfer request
export const updateTransferRequest = async (req, res) => {
  try {
    const { status, reason, newHostel, rollNo } = req.body;
    const requestId = req.params.id;

    // console.log(requestId, status, reason, newHostel, rollNo);

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Make a GET request to fetch the userId using the rollNo
    let userId;
    try {
      const response = await axios.get(`http://localhost:8000/api/student/${rollNo}/rollno`);
      if (response.status === 200) {
        userId = response.data.userId;
      } else {
        return res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      console.error("Error fetching userId by rollNo:", error);
      return res.status(500).json({ message: "Failed to fetch userId" });
    }

    // console.log(userId);

    if (status === 'Approved') {
      try {
        // Make a PUT request to update the student's profile
        const response = await axios.put(`http://localhost:8000/api/student/${userId}/profile`, {
          hostel: newHostel
        });

        if (response.status !== 200) {
          throw new Error('Failed to update student profile');
        }
      } catch (error) {
        console.error("Error in updating hostel:", error);
        return res.status(500).json({ message: "Failed to update hostel, transaction aborted" });
      }
    }
    // console.log("Hostel changed");

    // Update the transfer request status and reason
    const request = await HostelTransfer.findByIdAndUpdate(
      requestId,
      { status, reason },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Transfer request not found" });
    }

    res.status(200).json({ message: "Transfer request updated successfully", request });
  } catch (error) {
    console.error("Error in updateTransferRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};