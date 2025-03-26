import React, { useState } from "react";
import NewComplaintForm from "./newComplaintForm"; // Import the NewComplaintForm component

const ComplaintSection = () => {
    const [department, setDepartment] = useState("Computer & Comm. Centre");
    const [category, setCategory] = useState("");
    const [activePage, setActivePage] = useState("New Complaint");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewComplaintForm, setShowNewComplaintForm] = useState(false); // State to control NewComplaintForm visibility

    const categories = {
        "Computer & Comm. Centre": [
            "Automation",
            "Email Services",
            "HPC Support",
            "Network",
            "PC & Peripherals",
            "Telephone",
            "Turnitin",
            "Web Services",
        ],
        "Hostel Complaints": [
            "Plumbing",
            "Room Servicing",
            "Electricity Issues",
            "Furniture Repair",
            "Cleaning Services",
        ],
    };

    // Mock complaint history data
    const complaintHistory = [
        {
            title: "Noise Complaint",
            date: "12th Oct 2023",
            status: "Resolved",
        },
        {
            title: "Water Leakage",
            date: "5th Oct 2023",
            status: "Pending",
        },
        {
            title: "Street Light Issue",
            date: "1st Oct 2023",
            status: "In Progress",
        },
    ];

    // Filter complaints based on search query
    const filteredComplaints = complaintHistory.filter((complaint) =>
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle GO button click to show the NewComplaintForm
    const handleGoClick = () => {
        setShowNewComplaintForm(true);
    };

    // Handle Back button to hide the NewComplaintForm
    const handleBackClick = () => {
        setShowNewComplaintForm(false);
    };

    return (
        <div className="flex flex-col h-[100%] border-1 w-[98%] m-2">
            {/* Permanent Navbar */}
            <div className="bg-gray-50 p-2 rounded-lg drop-shadow-md w-[98%] h-auto mb-4 m-auto">
                <nav className="w-full text-white p-4 h-auto">
                    <ul className="flex justify-start space-x-8">
                        <li
                            className={`text-white px-4 py-2 rounded-md p-2 cursor-pointer ${
                                activePage === "My Complaints" ? "bg-gray-800" : "bg-gray-600"
                            }`}
                            onClick={() => setActivePage("My Complaints")}
                        >
                            My Complaints
                        </li>
                        <li
                            className={`text-white px-4 py-2 rounded-md p-2 cursor-pointer ${
                                activePage === "New Complaint" ? "bg-gray-800" : "bg-gray-600"
                            }`}
                            onClick={() => setActivePage("New Complaint")}
                        >
                            New Complaint
                        </li>
                        <li
                            className={`text-white px-4 py-2 rounded-md p-2 cursor-pointer ${
                                activePage === "Delete Complaint" ? "bg-gray-800" : "bg-gray-600"
                            }`}
                            onClick={() => setActivePage("Delete Complaint")}
                        >
                            Delete Complaint
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 p-6 rounded-lg drop-shadow-md w-[98%] min-h-full mb-4 m-auto">
                {activePage === "New Complaint" && !showNewComplaintForm && (
                    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
                        <label className="block font-semibold mb-2">Register complaint to:</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={department}
                            onChange={(e) => {
                                setDepartment(e.target.value);
                                setCategory("");
                            }}
                        >
                            <option>Computer & Comm. Centre</option>
                            <option>Hostel Complaints</option>
                        </select>

                        <label className="block font-semibold mt-4 mb-2">Select Category</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">--Select Category--</option>
                            {categories[department]?.map((cat, index) => (
                                <option key={index} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <button
                            className="bg-[#28a745] text-white px-4 py-2 rounded-md mt-3"
                            onClick={handleGoClick}
                        >
                            GO
                        </button>
                    </div>
                )}

                {activePage === "New Complaint" && showNewComplaintForm && (
                    <div className="relative">
                        {/* Back Button */}
                        <button
                            className="absolute top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            onClick={handleBackClick}
                        >
                            Back
                        </button>
                        {/* Render the NewComplaintForm */}
                        <NewComplaintForm />
                    </div>
                )}

                {activePage === "My Complaints" && (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                className="w-full p-2 border rounded-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Complaint List */}
                        {filteredComplaints.length > 0 ? (
                            filteredComplaints.map((complaint, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-4 mb-2 border rounded-md"
                                >
                                    <div>
                                        <h3 className="font-semibold">{complaint.title}</h3>
                                        <p className="text-sm text-gray-600">Date: {complaint.date}</p>
                                        <p className="text-sm text-gray-600">Status: {complaint.status}</p>
                                    </div>
                                    <button className="bg-[#5969ff] text-white px-4 py-2 rounded-md">
                                        View Details
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No complaints found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintSection;