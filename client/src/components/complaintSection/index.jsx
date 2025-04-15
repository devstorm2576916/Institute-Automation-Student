import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NewComplaintForm from "./newComplaintForm.jsx";
import ComplaintDetails from "./ComplaintDetails";
import { RoleContext } from "../../context/Rolecontext.jsx";

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
            {/* Permanent Navbar */}
            <div className="bg-gray-50 p-2 rounded-lg drop-shadow-md w-[98%] h-auto mb-4 m-auto">
                <nav className="w-full text-white p-4 h-auto">
                    <ul className="flex justify-start space-x-8">
                        <li
                            className={`text-white px-4 py-2 rounded-md p-2 cursor-pointer ${activePage === (isStudentOrFaculty ? "My Complaints" : "Pending") ? "bg-gray-800" : "bg-gray-600"}`}
                            onClick={() => setActivePage(isStudentOrFaculty ? "My Complaints" : "Pending")}
                        >
                            {isStudentOrFaculty ? "My Complaints" : "Pending"}
                        </li>
                        <li
                            className={`text-white px-4 py-2 rounded-md p-2 cursor-pointer ${activePage === (isStudentOrFaculty ? "New Complaint" : "In Progress") ? "bg-gray-800" : "bg-gray-600"}`}
                            onClick={() => setActivePage(isStudentOrFaculty ? "New Complaint" : "In Progress")}
                        >
                            {isStudentOrFaculty ? "New Complaint" : "In Progress"}
                        </li>

                        {isStudentOrFaculty ? "":(
                            <li
                                className={`text-white px-4 py-2 rounded-md p-2 cursor-pointer ${activePage === (isStudentOrFaculty ? "Delete Complaint" : "Resolved") ? "bg-gray-800" : "bg-gray-600"}`}
                                onClick={() => setActivePage("Resolved")}
                            >
                                {"Resolved"}
                            </li>
                        )}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 p-6 rounded-lg drop-shadow-md w-[98%] min-h-full mb-4 m-auto">
                {/* Loading and Error States */}
                {isLoading && <p className="text-gray-600">Loading complaints...</p>}
                {isError && <p className="text-red-600">Error fetching complaints.</p>}

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

                {/* Complaint List View */}
                {((isStudentOrFaculty && activePage === "My Complaints") || (!isStudentOrFaculty && (activePage === "Pending" || activePage === "In Progress" || activePage === "Resolved")) || (isStudentOrFaculty && activePage === "Delete Complaint")) && !selectedComplaint && (
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
                        {!isLoading && filteredComplaints.length > 0
                            ? filteredComplaints.map((complaint) => (
                                  <div
                                      key={complaint.id}
                                      className="flex justify-between items-center p-4 mb-2 border rounded-md"
                                  >
                                      <div>
                                          <h3 className="font-semibold">{complaint.title}</h3>
                                          <p className="text-sm text-gray-600">Date: {new Date(complaint.date).toLocaleDateString()}</p>
                                          <p className="text-sm text-gray-600">Status: {complaint.status}</p>
                                      </div>
                                      <button
                                          className="bg-[#5969ff] text-white px-4 py-2 rounded-md"
                                          onClick={() => handleViewDetails(complaint)}
                                      >
                                          View Details
                                      </button>
                                  </div>
                              ))
                            : !isLoading && <p className="text-gray-600">No complaints found.</p>}
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
            </div>
        </div>
    );
};

export default ComplaintSection;
