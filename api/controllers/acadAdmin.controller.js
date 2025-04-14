import { ApplicationDocument, Bonafide, Passport } from '../models/documents.models.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/user.model.js';
import { CourseDropRequest } from '../models/courseDropRequest.model.js';
import { Course, StudentCourse} from '../models/course.model.js';


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

export const getDropRequests = async (req, res) => {
    try {
        // console.log('[1] Starting to fetch drop requests...');
        
        // Fetch all requests without filtering
        const requests = await CourseDropRequest.find({})
            .sort({ requestDate: -1 })
            .lean();

        // console.log('[2] Raw database results:', requests);

        // Process requests with proper error handling
        const formattedRequests = await Promise.all(
            requests.map(async (request) => {
                try {
                    // console.log(`[3] Processing request ${request._id}`);
                    // console.log(request.rollNo, request.courseId, request.studentId);
                    const student = await Student.findOne({ rollNo: request.rollNo })

                    // console.log(`[4] Student data for ${request._id}:`, student);
                    const user = await User.findById(student.userId);

                    return {
                        _id: request._id,
                        studentName: user.name || 'Unknown',
                        rollNo: student?.rollNo || 'N/A',
                        courseName: request.courseName,
                        courseId: request.courseCode,
                        requestDate: request.requestDate,
                        status: request.status,
                        remarks: request.remarks
                    };
                } catch (error) {
                    console.error(`[!] Error processing request ${request._id}:`, error);
                    return null;
                }
            })
        );

        // Filter out any failed requests
        const validRequests = formattedRequests.filter(req => req !== null);
        
        // console.log('[5] Final formatted requests:', validRequests);
        
        res.status(200).json(validRequests);
    } catch (error) {
        console.error('[!] Critical error in getDropRequests:', error);
        res.status(500).json({ 
            message: 'Failed to fetch drop requests',
            error: error.message 
        });
    }
};

export const updateDropRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, remarks } = req.body;
        // console.log("Step 1: Received params:", { requestId, status, remarks });

        const request = await CourseDropRequest.findById(requestId);
        // console.log("Step 2: Fetched drop request:", request);

        if (!request) {
            // console.log("Step 2.1: Drop request not found");
            return res.status(404).json({ message: 'Drop request not found' });
        }

        request.status = status;
        request.remarks = remarks;
        await request.save();
        // console.log("Step 3: Updated request status and remarks, saved request");

        if (status === 'Approved') {
            // Get student's rollNo from the request
            const student = await Student.findOne({ rollNo: request.rollNo })
            // console.log("Step 4: Fetched student:", student);

            if (!student) {
                console.log("Step 4.1: Student not found");
                return res.status(404).json({ message: 'Student not found' });
            }

            // Get course code from the course ID
            const course = await Course.findOne({ courseCode: request.courseId });
            // console.log("Step 5: Fetched course:", course);

            if (!course) {
                console.log("Step 5.1: Course not found");
                return res.status(404).json({ message: 'Course not found' });
            }

            // Delete the specific student-course relationship
            const deletionResult = await StudentCourse.deleteOne({
                rollNo: student.rollNo,
                courseId: course.courseCode
            });
            // console.log("Step 6: StudentCourse deletion result:", deletionResult);

            if (deletionResult.deletedCount === 0) {
                // console.log("Step 6.1: Student course enrollment not found");
                return res.status(404).json({
                    message: 'Student course enrollment not found'
                });
            }
        }

        // console.log("Step 8: Drop request update process completed successfully");
        res.status(200).json({ message: 'Drop request updated successfully' });
    } catch (error) {
        console.error('Error updating drop request:', error);
        res.status(500).json({ message: 'Failed to update drop request' });
    }
};


