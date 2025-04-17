import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * Confirmation dialog component for delete operations
 * @param {Object} props Component props
 * @param {Object} props.staff - The support staff data to be deleted
 * @param {function} props.onConfirm - Function to call when delete is confirmed
 * @param {function} props.onCancel - Function to cancel the delete operation
 * @returns {JSX.Element} The rendered component
 */
const DeleteConfirmationDialog = ({ staff, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="bg-red-50 p-4 border-b border-red-100">
                    <h3 className="text-lg font-semibold text-red-700">Confirm Deletion</h3>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <svg className="h-8 w-8 text-red-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-700">
                            Are you sure you want to delete the support staff member <span className="font-bold">{staff.name}</span>?
                        </p>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone. All information associated with this staff member will be permanently removed.
                    </p>
                    
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onConfirm(staff._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors font-medium"
                        >
                            Delete Staff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal component to display complaints assigned to a support staff member
 * @param {Object} props Component props
 * @param {Object} props.staff - The support staff data
 * @param {function} props.onClose - Function to close the modal
 * @returns {JSX.Element} The rendered component
 */
const StaffComplaintsModal = ({ staff, onClose }) => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("assigned"); // "assigned" or "resolved"

    useEffect(() => {
        const fetchComplaints = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch detailed complaints data for the active tab
                const complaintsToFetch = activeTab === "assigned" ? staff.assignedComplaints || [] : staff.resolvedComplaints || [];

                if (complaintsToFetch.length > 0) {
                    const complaintPromises = complaintsToFetch.map(async (complaintId) => {
                        const response = await fetch(`http://localhost:8000/api/complaints/detail/${complaintId}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                            credentials: "include",
                        });

                        if (!response.ok) {
                            throw new Error(`Failed to fetch complaint details for ID: ${complaintId}`);
                        }

                        return response.json();
                    });

                    const complaintsData = await Promise.all(complaintPromises);
                    setComplaints(complaintsData.map((data) => data.complaint));
                } else {
                    // If there are no complaints for this tab
                    setComplaints([]);
                }
            } catch (err) {
                console.error("Error fetching staff complaints:", err);
                setError("Failed to load complaint details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaints();
    }, [staff, activeTab]);

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-red-100 text-red-800";
            case "In Progress":
                return "bg-yellow-100 text-yellow-800";
            case "Resolved":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Complaints for {staff.name}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "assigned" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                        onClick={() => setActiveTab("assigned")}
                    >
                        Assigned ({staff.assignedComplaints?.length || 0})
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "resolved" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                        onClick={() => setActiveTab("resolved")}
                    >
                        Resolved ({staff.resolvedComplaints?.length || 0})
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-grow">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span className="text-gray-600">Loading complaints...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center p-6 text-red-600">
                            <svg
                                className="w-12 h-12 mx-auto text-red-500 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p>{error}</p>
                        </div>
                    ) : complaints.length === 0 ? (
                        <div className="text-center p-6 text-gray-600">
                            <svg
                                className="w-12 h-12 mx-auto text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p>No {activeTab === "assigned" ? "active" : "resolved"} complaints found for this staff member.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map((complaint) => (
                                <div
                                    key={complaint._id}
                                    className="border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-lg">{complaint.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                                        <div>
                                            <p>
                                                <span className="font-medium">Category:</span> {complaint.category}
                                            </p>
                                            <p>
                                                <span className="font-medium">Sub-category:</span> {complaint.subCategory}
                                            </p>
                                            <p>
                                                <span className="font-medium">Date:</span> {new Date(complaint.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p>
                                                <span className="font-medium">Contact:</span> {complaint.phoneNumber}
                                            </p>
                                            <p>
                                                <span className="font-medium">Location:</span> {complaint.locality} - {complaint.address}
                                            </p>
                                            <p>
                                                <span className="font-medium">Time Availability:</span> {complaint.timeAvailability}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="font-medium mb-1">Description:</p>
                                        <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded line-clamp-2">{complaint.description}</p>
                                    </div>

                                    {complaint.imageUrls && complaint.imageUrls.length > 0 && (
                                        <div>
                                            <p className="font-medium text-sm mb-1">Images:</p>
                                            <div className="flex space-x-2 overflow-x-auto">
                                                {complaint.imageUrls.map((url, index) => (
                                                    <img
                                                        key={index}
                                                        src={`http://localhost:8000/uploads/complaints/${url}`}
                                                        alt={`Complaint ${index + 1}`}
                                                        className="h-16 w-16 object-cover rounded border border-gray-200"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * SupportStaffManagement component for hostel admins to add, view, and delete support staff.
 * @returns {JSX.Element} The rendered component.
 */
const SupportStaffManagement = () => {
    // State for the new support staff form
    const [newStaff, setNewStaff] = useState({
        name: "",
        phone: "",
        categories: [],
        subCategories: [],
    });

    // State for form validation and feedback
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "ascending",
    });

    // Filtered and sorted staff data
    const [displayedStaff, setDisplayedStaff] = useState([]);

    // Selected staff for viewing complaints
    const [selectedStaff, setSelectedStaff] = useState(null);

    // State for delete confirmation dialog
    const [staffToDelete, setStaffToDelete] = useState(null);

    // Handle deleting staff after confirmation
    const handleConfirmDelete = (staffId) => {
        handleDeleteStaff(staffId);
        setStaffToDelete(null); // Close the dialog after deletion
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setStaffToDelete(null);
    };

    // Categories and subcategories options - same as in the complaints form
    const categoriesOptions = {
        "Computer & Comm. Centre": ["Automation", "Email Services", "HPC Support", "Network", "PC & Peripherals", "Telephone", "Turnitin", "Web Services", "Other"],
        "Hostel/Resident Complaints": ["Plumbing", "Room Servicing", "Electricity Issues", "Furniture Repair", "Cleaning Services", "Other"],
        "Infrastructure Complaints": ["Gym", "Badminton Hall", "Table Tennis Court", "Ground", "Swimming Pool", "Food Court", "Other"],
    };

    // Fetching all support staff data
    const {
        data: supportStaffData = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["supportStaff"],
        queryFn: async () => {
            const response = await fetch("http://localhost:8000/api/complaints/admin/supportStaff", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                credentials: "include",
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch support staff");
            }
            return result.supportStaff || [];
        },
    });

    // Update displayed staff when data changes or sort config changes
    useEffect(() => {
        if (supportStaffData.length) {
            let sortedData = [...supportStaffData];

            // Apply sorting
            sortedData.sort((a, b) => {
                // Special case for assignedComplaints length sorting
                if (sortConfig.key === "assignedComplaints") {
                    const aLength = a.assignedComplaints ? a.assignedComplaints.length : 0;
                    const bLength = b.assignedComplaints ? b.assignedComplaints.length : 0;
                    return sortConfig.direction === "ascending" ? aLength - bLength : bLength - aLength;
                }

                // Special case for resolvedComplaints length sorting
                if (sortConfig.key === "resolvedComplaints") {
                    const aLength = a.resolvedComplaints ? a.resolvedComplaints.length : 0;
                    const bLength = b.resolvedComplaints ? b.resolvedComplaints.length : 0;
                    return sortConfig.direction === "ascending" ? aLength - bLength : bLength - aLength;
                }

                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? 1 : -1;
                }
                return 0;
            });

            // Apply search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                sortedData = sortedData.filter(
                    (staff) =>
                        // Search by name or phone
                        staff.name.toLowerCase().includes(query) ||
                        staff.phone.includes(query) ||
                        // Search by categories
                        (staff.categories && staff.categories.some((category) => category.toLowerCase().includes(query))) ||
                        // Search by subcategories
                        (staff.subCategories && staff.subCategories.some((subCategory) => subCategory.toLowerCase().includes(query)))
                );
            }

            setDisplayedStaff(sortedData);
        }
    }, [supportStaffData, sortConfig, searchQuery]);

    // Function to request a sort
    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    // Function to get sort direction indicator
    const getSortDirectionIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === "ascending" ? "↑" : "↓";
    };

    // Handler for adding a new support staff
    const handleAddStaff = async (e) => {
        e.preventDefault();

        // Validation
        if (!newStaff.name || !newStaff.phone) {
            setFormError("Name and phone number are required.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/complaints/admin/supportStaff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                credentials: "include",
                body: JSON.stringify(newStaff),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to add support staff");
            }

            // Reset form and show success message
            setNewStaff({
                name: "",
                phone: "",
                categories: [],
                subCategories: [],
            });
            setSuccessMessage("Support staff added successfully!");
            setFormError("");

            // Refetch the support staff list
            refetch();

            // Clear success message after a few seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setFormError(error.message || "An error occurred while adding support staff");
        }
    };

    // Handler for deleting a support staff
    const handleDeleteStaff = async (staffId) => {
        try {
            const response = await fetch("http://localhost:8000/api/complaints/admin/supportStaff", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                credentials: "include",
                body: JSON.stringify({ supportStaffId: staffId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete support staff");
            }

            // Show success message
            setSuccessMessage("Support staff deleted successfully!");

            // Refetch the support staff list
            refetch();

            // Clear success message after a few seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setFormError(error.message || "An error occurred while deleting support staff");
        }
    };

    // Handle category selection changes
    const handleCategoryChange = (category) => {
        const updatedCategories = [...newStaff.categories];

        // Toggle category selection
        if (updatedCategories.includes(category)) {
            const index = updatedCategories.indexOf(category);
            updatedCategories.splice(index, 1);
        } else {
            updatedCategories.push(category);
        }

        setNewStaff({
            ...newStaff,
            categories: updatedCategories,
            // Clear subcategories when categories change
            subCategories: [],
        });
    };

    // Handle subcategory selection changes
    const handleSubcategoryChange = (subcategory) => {
        const updatedSubcategories = [...newStaff.subCategories];

        // Toggle subcategory selection
        if (updatedSubcategories.includes(subcategory)) {
            const index = updatedSubcategories.indexOf(subcategory);
            updatedSubcategories.splice(index, 1);
        } else {
            updatedSubcategories.push(subcategory);
        }

        setNewStaff({
            ...newStaff,
            subCategories: updatedSubcategories,
        });
    };

    // Get all subcategories for selected categories
    const getAvailableSubcategories = () => {
        let subcategories = [];
        newStaff.categories.forEach((category) => {
            if (categoriesOptions[category]) {
                subcategories = [...subcategories, ...categoriesOptions[category]];
            }
        });
        return [...new Set(subcategories)]; // Remove duplicates
    };

    // Handle row click to view staff complaints
    const handleStaffRowClick = (staff) => {
        // Show complaints if the staff has assigned or resolved complaints
        if ((staff.assignedComplaints && staff.assignedComplaints.length > 0) || (staff.resolvedComplaints && staff.resolvedComplaints.length > 0)) {
            setSelectedStaff(staff);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Support Staff Management</h2>

            {/* Success message */}
            {successMessage && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{successMessage}</div>}

            {/* Error message */}
            {formError && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{formError}</div>}

            {/* Add new support staff form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4">Add New Support Staff</h3>
                <form onSubmit={handleAddStaff}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block font-medium mb-1">Name*</label>
                            <input
                                type="text"
                                value={newStaff.name}
                                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Enter staff name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Phone Number*</label>
                            <input
                                type="tel"
                                value={newStaff.phone}
                                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Enter phone number"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-1">Specialization Categories (Optional)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {Object.keys(categoriesOptions).map((category) => (
                                <div
                                    key={category}
                                    className="flex items-center"
                                >
                                    <input
                                        type="checkbox"
                                        id={`category-${category}`}
                                        checked={newStaff.categories.includes(category)}
                                        onChange={() => handleCategoryChange(category)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`category-${category}`}>{category}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {newStaff.categories.length > 0 && (
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Subcategories (Optional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                {getAvailableSubcategories().map((subcategory) => (
                                    <div
                                        key={subcategory}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`subcategory-${subcategory}`}
                                            checked={newStaff.subCategories.includes(subcategory)}
                                            onChange={() => handleSubcategoryChange(subcategory)}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`subcategory-${subcategory}`}>{subcategory}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        Add Support Staff
                    </button>
                </form>
            </div>

            {/* Support staff list */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Support Staff List</h3>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading support staff data...</p>
                    </div>
                ) : isError ? (
                    <p className="text-red-600">Error loading support staff data. Please try again.</p>
                ) : (
                    <>
                        {/* Search bar */}
                        <div className="mb-4 flex">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-500"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by name, phone, or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={() => setSearchQuery("")}
                                        title="Clear search"
                                    >
                                        <svg
                                            className="w-4 h-4 text-gray-500 hover:text-gray-700"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {displayedStaff.length > 0 ? (
                            <>
                                {searchQuery && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Found {displayedStaff.length} {displayedStaff.length === 1 ? "result" : "results"} for "{searchQuery}"
                                    </p>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th
                                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                                    onClick={() => requestSort("name")}
                                                >
                                                    Name {getSortDirectionIndicator("name")}
                                                </th>
                                                <th
                                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                                    onClick={() => requestSort("phone")}
                                                >
                                                    Phone {getSortDirectionIndicator("phone")}
                                                </th>
                                                <th className="py-2 px-4 text-left">Categories</th>
                                                <th className="py-2 px-4 text-left">Subcategories</th>
                                                <th
                                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                                    onClick={() => requestSort("assignedComplaints")}
                                                >
                                                    Assigned Complaints {getSortDirectionIndicator("assignedComplaints")}
                                                </th>
                                                <th
                                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                                    onClick={() => requestSort("resolvedComplaints")}
                                                >
                                                    Resolved Complaints {getSortDirectionIndicator("resolvedComplaints")}
                                                </th>
                                                <th className="py-2 px-4 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedStaff.map((staff) => {
                                                const assignedCount = staff.assignedComplaints ? staff.assignedComplaints.length : 0;
                                                const resolvedCount = staff.resolvedComplaints ? staff.resolvedComplaints.length : 0;
                                                const hasComplaints = assignedCount > 0 || resolvedCount > 0;

                                                return (
                                                    <tr
                                                        key={staff._id}
                                                        className={`border-t ${hasComplaints ? "cursor-pointer hover:bg-gray-50" : ""}`}
                                                        onClick={() => handleStaffRowClick(staff)}
                                                    >
                                                        <td className="py-3 px-4">{staff.name}</td>
                                                        <td className="py-3 px-4">{staff.phone}</td>
                                                        <td className="py-3 px-4">{staff.categories && staff.categories.length > 0 ? staff.categories.join(", ") : "All categories"}</td>
                                                        <td className="py-3 px-4">{staff.subCategories && staff.subCategories.length > 0 ? staff.subCategories.join(", ") : "All subcategories"}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`font-medium ${assignedCount >= 5 ? "text-red-600" : assignedCount > 0 ? "text-blue-600" : ""}`}>{assignedCount}</span>
                                                            {assignedCount > 0 && <span className="text-xs text-gray-500 ml-1">active {assignedCount === 1 ? "complaint" : "complaints"}</span>}
                                                            {assignedCount >= 5 && <span className="ml-2 text-xs bg-red-100 text-red-600 py-1 px-2 rounded">At capacity</span>}
                                                            {assignedCount > 0 && <span className="ml-2 text-xs text-blue-600 hover:underline">(Click to view)</span>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`font-medium ${resolvedCount > 0 ? "text-green-600" : ""}`}>{resolvedCount}</span>
                                                            {resolvedCount > 0 && <span className="text-xs text-gray-500 ml-1">resolved {resolvedCount === 1 ? "complaint" : "complaints"}</span>}
                                                            {resolvedCount > 0 && <span className="ml-2 text-xs text-green-600 hover:underline">(Click to view)</span>}
                                                        </td>
                                                        <td
                                                            className="py-3 px-4"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => setStaffToDelete(staff)}
                                                                className={`bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm ${assignedCount > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                disabled={assignedCount > 0}
                                                                title={assignedCount > 0 ? "Cannot delete staff with assigned complaints" : "Delete staff"}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-600">{searchQuery ? `No support staff found matching "${searchQuery}". Try a different search term.` : "No support staff found. Add some staff members using the form above."}</p>
                        )}
                    </>
                )}
            </div>

            {/* Staff Complaints Modal */}
            {selectedStaff && (
                <StaffComplaintsModal
                    staff={selectedStaff}
                    onClose={() => setSelectedStaff(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {staffToDelete && (
                <DeleteConfirmationDialog
                    staff={staffToDelete}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default SupportStaffManagement;
