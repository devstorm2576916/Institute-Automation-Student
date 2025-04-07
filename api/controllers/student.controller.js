import { Student } from '../models/student.model.js';
export const getStudent=async(req, res)=> {
    const studentId = req.params.id;
    const user = await Student.findOne({ where: { id: studentId } })
    if (!user) {
        return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(user);
    console.log("Student details fetched successfully", user);
};