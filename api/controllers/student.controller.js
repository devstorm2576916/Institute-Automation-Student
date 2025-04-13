import { Student } from '../models/student.model.js';

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
            .populate('userId', 'name dateOfBirth'); // Only populate specific fields from user
           
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        console.log('fetched student info for bonafide',student)
        // Format response data
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
            enrolledYear: student.batch
        };

        res.status(200).json(studentDetails);
    } catch (error) {
        console.error('Error fetching student bonafide details:', error);
        res.status(500).json({ message: 'Error fetching student details' });
    }
};