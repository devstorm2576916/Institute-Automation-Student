// AssignComplaintForm.js
import React, { useState } from "react";

const AssignForm = ({ onClose, onAssign, complaint }) => {
    const [selectedPerson, setSelectedPerson] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleAssign = (e) => {
        e.preventDefault(); // 
        if (selectedPerson.length === 0 || phoneNumber.length === 0) {
            alert("Please select a person and provide a phone number!");
            return;
        }
    
        const phoneRegex = /^\+\d{1,4}[\s-]?\d{10}$/;
    
        if (!phoneRegex.test(phoneNumber)) {
            alert("Please enter a valid phone number in the format +91 9876543210");
            return;
        }
    
        const assignedPerson = {
            name: selectedPerson,
            phoneNo: phoneNumber,
        };
    
        console.log(assignedPerson);
        onAssign(assignedPerson);
    };
    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Assign Complaint</h2>

                <form onSubmit={handleAssign}>
                    <label className="block font-semibold mb-2">Assign To:</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md mb-4"
                        placeholder="Name"
                        value={selectedPerson}
                        onChange={(e) => setSelectedPerson(e.target.value)}
                    />

                    <label className="block font-semibold mb-2">Phone Number:</label>
                    <input
                        type="tel"
                        className="w-full p-2 border rounded-md mb-4"
                        placeholder="+91 9876543210"
                        pattern="^\+\d{1,4}[\s-]?\d{10}$"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Assign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignForm;
