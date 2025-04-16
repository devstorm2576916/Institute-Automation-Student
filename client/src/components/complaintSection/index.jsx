import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NewComplaintForm from "./newComplaintForm.jsx";
import ComplaintDetails from "./ComplaintDetails";
import { RoleContext } from "../../context/Rolecontext.jsx";
import SupportStaffManagement from "./supportStaff/SupportStaffManagement.jsx";

/**
 * ComplaintSection component renders the complaint management interface.
 * It displays different views based on the user's role and selected page.
 * returns {JSX.Element} The rendered component.
 */
const ComplaintSection = () => {
    // type {string} - The user's role (e.g., 'student', 'faculty', 'acadAdmin').
    const { role } = useContext(RoleContext);

    //type {string} - Selected complaint category.
    const [category, setCategory] = useState("Computer & Comm. Centre");

    //type {string} - Selected complaint sub-category.
    const [subCategory, setSubCategory] = useState("");

    // type {boolean} - Flag to toggle the visibility of the new complaint form.
    const [showNewComplaintForm, setShowNewComplaintForm] = useState(false);

    //type {object|null} - Selected complaint details.
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // type {string} - Search query for filtering complaints.
    const [searchQuery, setSearchQuery] = useState("");

    //Determines if the user is a student or faculty.
    //type {boolean}
    const isStudentOrFaculty = role === "student" || role === "faculty";

    // Default active page based on the user's role.
    // type {string}
    const defaultActivePage = isStudentOrFaculty ? "My Complaints" : "Pending";

    // type {string} - Current active page in the complaint section.
    const [activePage, setActivePage] = useState(defaultActivePage);

    /**
     * API endpoint for fetching complaints based on user role.
     * type {string}
     */
    const endpoint = role === "student" || role === "faculty" ? "http://localhost:8000/api/complaints/" : "http://localhost:8000/api/complaints/admin";

    /**
     * Fetches complaint data using React Query.
     * type {object} - Contains complaint data, loading state, error state, and refetch function.
     */
    const {
        data: complaintData = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["complaints", role],
        queryFn: async () => {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                credentials: "include",
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch complaints");
            }
            return result.data || [];
        },
    });

    /**
     * Complaint categories and their respective sub-categories.
     * @type {object}
     */
    const categories = {
        "Computer & Comm. Centre": ["Automation", "Email Services", "HPC Support", "Network", "PC & Peripherals", "Telephone", "Turnitin", "Web Services", "Other"],
        "Hostel/Resident Complaints": ["Plumbing", "Room Servicing", "Electricity Issues", "Furniture Repair", "Cleaning Services", "Other"],
        "Infrastructure Complaints": ["Gym", "Badminton Hall", "Table Tennis Court", "Ground", "Swimming Pool", "Food Court", "Other"],
    };

    /**
     * Filters complaints based on the search query and active page.
     * @type {Array}
     */
    const filteredComplaints = complaintData.filter((complaint) => complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) && (isStudentOrFaculty ? activePage === "My Complaints" : complaint.status === activePage));

    /**
     * Toggles the visibility of the new complaint form.
     */
    const handleGoClick = () => {
        setShowNewComplaintForm(true);
    };

    /**
     * Handles the back action from the new complaint form.
     * @param {boolean} wasNewAdded - Indicates if a new complaint was added.
     */
    const handleBackClick = (wasNewAdded) => {
        setShowNewComplaintForm(false);
        if (wasNewAdded) {
            refetch();
        }
    };

    /**
     * Sets the selected complaint for viewing details.
     * @param {object} complaint - The complaint to view.
     */
    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
    };

    /**
     * Handles the back action from the complaint details view.
     * @param {boolean} wasDeleted - Indicates if the complaint was deleted.
     */
    const handleBackFromDetails = (wasDeleted) => {
        setSelectedComplaint(null);
        if (wasDeleted) {
            refetch();
        }
    };

    /**
     * Resets the selected complaint when the active page changes.
     */
    useEffect(() => {
        setSelectedComplaint(null);
    }, [activePage]);

    // If the role is Academic Admin, don't show the complaint section
    if (role === "acadAdmin") {
        return null;
    }
    return (
        <div className="flex flex-col h-[100%] border-1 w-[98%] m-2">
            {/* Improved Navbar with better styling */}
            <div className="bg-white p-2 rounded-lg shadow-md w-[98%] h-auto mb-4 m-auto">
                <nav className="w-full p-4 h-auto">
                    <ul className="flex justify-start space-x-4">
                        <li
                            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                                activePage === (isStudentOrFaculty ? "My Complaints" : "Pending")
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setActivePage(isStudentOrFaculty ? "My Complaints" : "Pending")}
                        >
                            {isStudentOrFaculty ? "My Complaints" : "Pending"}
                            {!isStudentOrFaculty && activePage === "Pending" && filteredComplaints.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {filteredComplaints.length}
                                </span>
                            )}
                        </li>
                        <li
                            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                                activePage === (isStudentOrFaculty ? "New Complaint" : "In Progress")
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setActivePage(isStudentOrFaculty ? "New Complaint" : "In Progress")}
                        >
                            {isStudentOrFaculty ? "New Complaint" : "In Progress"}
                            {!isStudentOrFaculty && activePage === "In Progress" && 
                             complaintData.filter(c => c.status === "In Progress").length > 0 && (
                                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                    {complaintData.filter(c => c.status === "In Progress").length}
                                </span>
                            )}
                        </li>

                        {isStudentOrFaculty ? "" : (
                            <>
                                <li
                                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                                        activePage === "Resolved"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActivePage("Resolved")}
                                >
                                    {"Resolved"}
                                    {activePage === "Resolved" && 
                                     complaintData.filter(c => c.status === "Resolved").length > 0 && (
                                        <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            {complaintData.filter(c => c.status === "Resolved").length}
                                        </span>
                                    )}
                                </li>
                                <li
                                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                                        activePage === "Support Staff"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActivePage("Support Staff")}
                                >
                                    {"Support Staff"}
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>

            {/* Main Content with improved styling */}
            <div className="bg-white p-6 rounded-lg shadow-md w-[98%] min-h-full mb-4 m-auto">
                {/* Loading and Error States with better feedback */}
                {isLoading && (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                {isError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">Error fetching complaints. Please try again later.</span>
                    </div>
                )}

                {/* New Complaint Form Selection */}
                {isStudentOrFaculty && activePage === "New Complaint" && !showNewComplaintForm && (
                    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
                        <label className="block font-semibold mb-2">Register to:</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setSubCategory("");
                            }}
                        >
                            {Object.keys(categories).map((cat) => (
                                <option
                                    key={cat}
                                    value={cat}
                                >
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <label className="block font-semibold mt-4 mb-2">Select Category</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                        >
                            <option value="">--Select Category--</option>
                            {categories[category]?.map((cat) => (
                                <option
                                    key={cat}
                                    value={cat}
                                >
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <button
                            className="bg-[#28a745] text-white px-4 py-2 rounded-md mt-3"
                            onClick={handleGoClick}
                            disabled={!subCategory}
                        >
                            GO
                        </button>
                    </div>
                )}

                {/* New Complaint Form */}
                {isStudentOrFaculty && activePage === "New Complaint" && showNewComplaintForm && (
                    <div className="relative">
                        <button
                            className="absolute top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            onClick={() => handleBackClick(false)}
                        >
                            Back
                        </button>
                        <NewComplaintForm
                            subCategory={subCategory}
                            category={category}
                            onBack={() => handleBackClick(true)}
                        />
                    </div>
                )}

                {/* Complaint List View with improved card design */}
                {((isStudentOrFaculty && activePage === "My Complaints") || 
                  (!isStudentOrFaculty && (activePage === "Pending" || activePage === "In Progress" || activePage === "Resolved")) || 
                  (isStudentOrFaculty && activePage === "Delete Complaint")) && !selectedComplaint && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Complaint List with improved card design */}
                        {!isLoading && filteredComplaints.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredComplaints.map((complaint) => {
                                    // Determine status color based on status
                                    let statusColor = "gray";
                                    if (complaint.status === "Pending") statusColor = "red";
                                    else if (complaint.status === "In Progress") statusColor = "yellow";
                                    else if (complaint.status === "Resolved") statusColor = "green";

                                    return (
                                        <div
                                            key={complaint._id}
                                            className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                        >
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-gray-800">{complaint.title}</h3>
                                                    <span 
                                                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800 border border-${statusColor}-300`}
                                                    >
                                                        {complaint.status}
                                                    </span>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Date:</span> {new Date(complaint.date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Category:</span> {complaint.category} - {complaint.subCategory}
                                                    </p>
                                                    {complaint.assignedName && (
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Assigned to:</span> {complaint.assignedName}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{complaint.description}</p>
                                                <div className="flex justify-end">
                                                    <button
                                                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                                                        onClick={() => handleViewDetails(complaint)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="text-center py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-600 font-medium">No complaints found.</p>
                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria.</p>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Complaint Details */}
                {((isStudentOrFaculty && (activePage === "My Complaints" || activePage === "Delete Complaint")) || (!isStudentOrFaculty && (activePage === "Pending" || activePage === "In Progress" || activePage === "Resolved"))) && selectedComplaint && (
                    <ComplaintDetails
                        complaint={selectedComplaint}
                        onBack={handleBackFromDetails}
                        role={role}
                    />
                )}

                {/* Support Staff Management */}
                {!isStudentOrFaculty && activePage === "Support Staff" && (
                    <SupportStaffManagement />
                )}
            </div>
        </div>
    );
};

export default ComplaintSection;
