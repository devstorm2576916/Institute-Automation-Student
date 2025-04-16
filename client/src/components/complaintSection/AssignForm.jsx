// AssignComplaintForm.js
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const AssignForm = ({ onClose, onAssign, complaint }) => {
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [supportStaff, setSupportStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Fetch support staff based on category and subcategory
    useEffect(() => {
        const fetchSupportStaff = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(
                    `http://localhost:8000/api/complaints/admin/filteredSupportStaff?category=${complaint.category}&subCategory=${complaint.subCategory}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch support staff");
                }

                const data = await response.json();
                setSupportStaff(data.supportStaff || []);
                
                // Clear previous selection as we have new staff
                setSelectedStaffId("");
            } catch (error) {
                console.error("Error fetching support staff:", error);
                setError("Failed to load support staff. Please try again.");
                toast.error("Failed to load support staff");
            } finally {
                setIsLoading(false);
            }
        };

        if (complaint?.category && complaint?.subCategory) {
            fetchSupportStaff();
        }
    }, [complaint?.category, complaint?.subCategory]);

    const handleStaffSelect = (staff) => {
        setSelectedStaffId(staff._id);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedStaffId) {
            toast.error("Please select a staff member to assign!");
            return;
        }
    
        // Find the selected staff to get their info
        const selectedStaff = supportStaff.find(staff => staff._id === selectedStaffId);
        
        if (!selectedStaff) {
            toast.error("Selected staff not found. Please try again.");
            return;
        }
        
        const assignData = {
            complaintId: complaint._id,
            name: selectedStaff.name,
            phoneNo: selectedStaff.phone,
            supportStaffId: selectedStaffId
        };
    
        console.log("Assigning to:", assignData);
        onAssign(assignData);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Assign Complaint</h2>
                <div className="mb-4">
                    <span className="block font-medium text-gray-700 mb-2">Complaint Details:</span>
                    <div className="bg-gray-100 p-3 rounded">
                        <p><span className="font-semibold">Category:</span> {complaint.category}</p>
                        <p><span className="font-semibold">Sub-category:</span> {complaint.subCategory}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center my-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                        {error}
                    </div>
                ) : (
                    <div className="mb-4">
                        <h3 className="font-medium text-gray-700 mb-2">Select Support Staff:</h3>
                        {supportStaff && supportStaff.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto border rounded-md">
                                {supportStaff.map((staff) => {
                                    const assignedCount = staff.assignedComplaints?.length || 0;
                                    return (
                                        <div 
                                            key={staff._id} 
                                            className={`p-2 border-b cursor-pointer hover:bg-gray-100 ${
                                                selectedStaffId === staff._id ? 'bg-blue-50' : ''
                                            }`}
                                            onClick={() => handleStaffSelect(staff)}
                                        >
                                            <div className="flex justify-between">
                                                <p className="font-medium">{staff.name}</p>
                                                <span className="text-xs px-2 py-1 rounded bg-blue-100">
                                                    {assignedCount} {assignedCount === 1 ? 'complaint' : 'complaints'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{staff.phone}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-gray-500 mb-2">No available support staff found for this category.</p>
                                <p className="text-sm text-blue-600">Please go to the Support Staff tab to add new staff members.</p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleAssign}>
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
                            disabled={isLoading || !selectedStaffId}
                        >
                            {isLoading ? "Assigning..." : "Assign"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignForm;
