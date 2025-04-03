// AssignComplaintForm.js
import React, { useState } from "react";

const taskData = {
    "Computer & Comm. Centre": [
        "Automation", "Email Services", "HPC Support", "Network",
        "PC & Peripherals", "Telephone", "Turnitin", "Web Services", "Other"
    ],
    "Hostel/Resident Complaints": [
        "Plumbing", "Room Servicing", "Electricity Issues", "Furniture Repair",
        "Cleaning Services", "Other"
    ],
    "Infrastructure Complaints": [
        "Gym", "Badminton Hall", "Table Tennis Court", "Ground",
        "Swimming Pool", "Food Court", "Other"
    ]
};

const availablePeople = {
    "Automation": ["Alice", "Bob"],
    "Email Services": ["Charlie", "Dave"],
    "Plumbing": ["Eve", "Frank"],
    "Electricity Issues": ["Grace", "Hank"],
    "Gym": ["Ivy", "Jack"],
    "Other": ["Admin1", "Admin2"]
};

const AssignForm = ({ onClose, onAssign }) => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubTask, setSelectedSubTask] = useState("");
    const [selectedPerson, setSelectedPerson] = useState("");

    const handleAssign = () => {
        if (!selectedCategory) {
            alert("Please select a category.");
        } else if (!selectedSubTask) {
            alert("Please select a subtask.");
        } else if (!selectedPerson) {
            alert("No Person Available!!");
        } else {
            onAssign(selectedCategory, selectedSubTask, selectedPerson);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Assign Complaint</h2>
                <label className="block mb-2">Category:</label>
                <select className="w-full p-2 border rounded" onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {Object.keys(taskData).map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                {selectedCategory && (
                    <>
                        <label className="block mt-4 mb-2">Subtask:</label>
                        <select className="w-full p-2 border rounded" onChange={(e) => setSelectedSubTask(e.target.value)}>
                            <option value="">Select Subtask</option>
                            {taskData[selectedCategory].map((task) => (
                                <option key={task} value={task}>{task}</option>
                            ))}
                        </select>
                    </>
                )}
                {selectedSubTask && availablePeople[selectedSubTask] && (
                    <>
                        <label className="block mt-4 mb-2">Assign To:</label>
                        <select className="w-full p-2 border rounded" onChange={(e) => setSelectedPerson(e.target.value)}>
                            <option value="">Select Person</option>
                            {availablePeople[selectedSubTask].map((person) => (
                                <option key={person} value={person}>{person}</option>
                            ))}
                        </select>
                    </>
                )}
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={onClose}>Cancel</button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAssign}>Assign</button>
                </div>
            </div>
        </div>
    );
};

export default AssignForm;