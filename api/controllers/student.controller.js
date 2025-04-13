import { Student } from '../models/student.model.js';
import { ApplicationDocument, Bonafide, Passport } from '../models/documents.models.js';

// Get basic student info
export const getStudent = async (req, res) => {
    const studentId = req.params.id;
    console.log(studentId)
    const user = await Student.findOne({ userId: studentId })
        .populate('userId') // populate the userId field and get the name field
    if (!user) {
        return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(user);
    console.log("Student details fetched successfully", user);
};

// Get student details for bonafide
export const getStudentBonafideDetails = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        const student = await Student.findOne({ userId: studentId })
            .populate('userId', 'name dateOfBirth'); 
            
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const studentDetails = {
            name: student.userId.name,
            rollNo: student.rollNo,
            fatherName: student.fatherName,
            dateOfBirth: student.userId.dateOfBirth,
            program: student.program,
            department: student.department,
            hostel: student.hostel,
            roomNo: student.roomNo,
            semester: student.semester,
            batch: student.batch,
            enrolledYear: student.batch
        };

        res.status(200).json(studentDetails);
    } catch (error) {
        console.error('Error fetching student bonafide details:', error);
        res.status(500).json({ message: 'Error fetching student details' });
    }
};

// Create new bonafide application
export const createBonafideApplication = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { currentSemester, certificateFor, otherReason } = req.body;

        // Find student
        const student = await Student.findOne({ userId: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create application document
        const applicationDoc = new ApplicationDocument({
            studentId: student._id,
            documentType: 'Bonafide',
            status: 'Pending'
        });
        await applicationDoc.save();

        console.log('created application request' , applicationDoc)
        // Create bonafide document
        const bonafide = new Bonafide({
            applicationId: applicationDoc._id,
            currentSemester,
            purpose: certificateFor, // This will be 'Other' when a custom reason is provided
            otherReason: certificateFor === 'Other' ? otherReason : undefined
        });
        await bonafide.save();
        console.log('created bonafide doc' , bonafide)

        res.status(201).json({ 
            message: 'Bonafide application submitted successfully',
            applicationId: applicationDoc._id 
        });
    } catch (error) {
        console.error('Error creating bonafide application:', error);
        res.status(500).json({ message: error.message || 'Error submitting bonafide application' });
    }
};

// Get student's bonafide applications
export const getBonafideApplications = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Find student
        const student = await Student.findOne({ userId: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Get all applications
        const applications = await ApplicationDocument.find({ 
            studentId: student._id,
            documentType: 'Bonafide'
        }).sort({ createdAt: -1 });

        // Get bonafide details for each application
        const applicationDetails = await Promise.all(applications.map(async (app) => {
            const bonafide = await Bonafide.findOne({ applicationId: app._id });
            if (!bonafide) return null;
            
            return {
                applicationDate: app.createdAt,
                certificateFor: bonafide.purpose === 'Other' ? bonafide.otherReason : bonafide.purpose,
                currentSemester: bonafide.currentSemester,
                remarks: app.remarks || '',
                documentStatus: app.status === 'pending' ? 'Documents Under Review' : 'Documents Verified',
                currentStatus: app.status.charAt(0).toUpperCase() + app.status.slice(1)
            };
        }));

        // Filter out any null values from failed lookups
        const validApplications = applicationDetails.filter(app => app !== null);
        res.status(200).json(validApplications);
    } catch (error) {
        console.error('Error fetching bonafide applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};

// Get student details for passport
export const getStudentPassportDetails = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        const student = await Student.findOne({ userId: studentId })
            .populate('userId', 'name dateOfBirth email'); 
            
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const studentDetails = {
            name: student.userId.name,
            rollNo: student.rollNo,
            department: student.department,
            programme: student.program,
            dateOfBirth: student.userId.dateOfBirth,
            email: student.userId.email,
            contactNumber: student.userId.contactNo || '',
            hostelName: student.hostel,
            roomNo: student.roomNo,
            fathersName: student.fatherName,
            mothersName: student.motherName
        };
        console.log('fetched student info for passport',studentDetails)
        res.status(200).json(studentDetails);
    } catch (error) {
        console.error('Error fetching student passport details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Submit passport application
export const submitPassportApplication = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { 
            applicationType, 
            placeOfBirth, 
            semester, 
            mode, 
            tatkalReason, 
            travelPlans,
            travelDetails,
            fromDate,
            toDate
        } = req.body;

        const student = await Student.findOne({ userId: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create application document
        const applicationDoc = new ApplicationDocument({
            studentId: student._id,
            documentType: 'Passport',
            status: 'Pending'
        });
        await applicationDoc.save();

        console.log('application object for passport' , applicationDoc)
        // Create passport document
        const passport = new Passport({
            applicationId: applicationDoc._id,
            applicationType,
            placeOfBirth,
            semester,
            mode,
            tatkalReason,
            travelPlans,
            travelDetails,
            fromDate: travelPlans === 'yes' ? fromDate : undefined,
            toDate: travelPlans === 'yes' ? toDate : undefined
        });
        await passport.save();
        console.log('paspport object for passport' , passport)
        res.status(201).json({ 
            message: 'Passport application submitted successfully',
            applicationId: applicationDoc._id 
        });
    } catch (error) {
        console.error('Error creating passport application:', error);
        res.status(500).json({ message: error.message || 'Error submitting passport application' });
    }
};

// Get passport applications history
export const getPassportApplications = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findOne({ userId: studentId });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const applications = await ApplicationDocument.find({
            studentId: student._id,
            documentType: 'Passport'
        })
        .sort({ createdAt: -1 })
        .lean();

        const passportApplications = await Promise.all(
            applications.map(async (app) => {
                const passportDoc = await Passport.findOne({ applicationId: app._id });
                return {
                    applicationDate: new Date(app.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    applicationType: passportDoc.applicationType,
                    mode: passportDoc.mode,
                    remarks: app.remarks || '',
                    otherDetails: passportDoc.mode === 'tatkal' ? `Tatkal Application - ${passportDoc.tatkalReason}` : 'Regular Application',
                    documentStatus: app.status === 'pending' ? 'Documents Under Review' : 'Documents Verified',
                    currentStatus: app.status.toLowerCase()
                };
            })
        );

        const validApplications = passportApplications.filter(app => app !== null);
        res.status(200).json(validApplications);
    } catch (error) {
        console.error('Error fetching passport applications:', error);
        res.status(500).json({ message: error.message });
    }
};