import React, { useState, useEffect } from 'react';
import { RoleContext } from "../../../context/Rolecontext";
import { useContext } from "react";


function SearchableStudentDropdown({ courseId, onStudentSelect }) {
    const { role } = useContext(RoleContext);  
    const [selectedStudent, setSelectedStudent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            if (role === "faculty") {
                setLoading(true);
                try {
                    const response = await fetch(`http://localhost:8000/api/attendancelanding/faculty/${courseId}`);
                    const data = await response.json();
                    
                    if (data?.rollNumbers) {
                        const students = data.rollNumbers.map(rollNo => ({
                            rollNumber: rollNo,
                            name: rollNo // Using rollNo as name placeholder
                        }));
                        console.log(students);
                        setStudents(students);
                    }
                } catch (error) {
                    console.log("Error fetching students:", error);
                    setError(error);
                } finally {
                    setLoading(false);
                }
            }
            if (role === 'acadAdmin') {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:8000/api/attendancelanding/admin/student');
                    const data = await response.json();
                    
                    if (data?.data) {
                        const students = data.data.map(rollNo => ({
                            rollNumber: rollNo,
                            name: rollNo // Using rollNo as name placeholder since we only have roll numbers
                        }));
                        console.log("Admin students:", students);
                        setStudents(students);
                    } else {
                        console.log("No student data found in response:", data);
                    }
                } catch (error) {
                    console.log("Error fetching students for admin:", error);
                    setError(error);
                } finally {
                    setLoading(false);
                }
            }
        };
    
        fetchStudents();
    }, [role, courseId]);

    const handleStudentChange = (e) => {
        const rollNo = e.target.value;
        setSelectedStudent(rollNo);
        if (rollNo && onStudentSelect) {
            onStudentSelect(rollNo); // Call the fetchAttendance function with the selected roll number
        }
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="mx-5 my-4">
            <div className="relative">
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search student by name or roll number..."
                    value={searchTerm}
                    onChange={handleInputChange}
                />
            </div>
            
            <div className="mt-2">
                <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedStudent}
                    onChange={handleStudentChange}  // Use the new handler
                >
                    <option value="">Select a student</option>
                    {loading ? (
                        <option disabled>Loading students...</option>
                    ) : error ? (
                        <option disabled>Error loading students</option>
                    ) : (
                        filteredStudents.map(student => (
                            <option key={student.rollNumber} value={student.rollNumber}>
                                {student.name} ({student.rollNumber})
                            </option>
                        ))
                    )}
                </select>
            </div>
        </div>
    );
}
export default SearchableStudentDropdown;