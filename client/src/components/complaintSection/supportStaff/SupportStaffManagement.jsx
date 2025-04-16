import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

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
    direction: "ascending"
  });
  
  // Filtered and sorted staff data
  const [displayedStaff, setDisplayedStaff] = useState([]);

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
          return sortConfig.direction === "ascending" 
            ? aLength - bLength 
            : bLength - aLength;
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
        sortedData = sortedData.filter(staff =>
          // Search by name or phone
          staff.name.toLowerCase().includes(query) ||
          staff.phone.includes(query) ||
          // Search by categories
          (staff.categories && staff.categories.some(category => 
            category.toLowerCase().includes(query)
          )) ||
          // Search by subcategories
          (staff.subCategories && staff.subCategories.some(subCategory => 
            subCategory.toLowerCase().includes(query)
          ))
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
    if (!window.confirm("Are you sure you want to delete this support staff member?")) {
      return;
    }

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
      subCategories: []
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
      subCategories: updatedSubcategories
    });
  };

  // Get all subcategories for selected categories
  const getAvailableSubcategories = () => {
    let subcategories = [];
    newStaff.categories.forEach(category => {
      if (categoriesOptions[category]) {
        subcategories = [...subcategories, ...categoriesOptions[category]];
      }
    });
    return [...new Set(subcategories)]; // Remove duplicates
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Support Staff Management</h2>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {formError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {formError}
        </div>
      )}
      
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
                <div key={category} className="flex items-center">
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
                  <div key={subcategory} className="flex items-center">
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
          <p className="text-gray-600">Loading support staff data...</p>
        ) : isError ? (
          <p className="text-red-600">Error loading support staff data. Please try again.</p>
        ) : (
          <>
            {/* Search bar */}
            <div className="mb-4 flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
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
                    <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {displayedStaff.length > 0 ? (
              <>
                {searchQuery && (
                  <p className="text-sm text-gray-600 mb-2">
                    Found {displayedStaff.length} {displayedStaff.length === 1 ? 'result' : 'results'} for "{searchQuery}"
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
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedStaff.map((staff) => {
                        const complaintsCount = staff.assignedComplaints ? staff.assignedComplaints.length : 0;
                        
                        return (
                          <tr key={staff._id} className="border-t">
                            <td className="py-3 px-4">{staff.name}</td>
                            <td className="py-3 px-4">{staff.phone}</td>
                            <td className="py-3 px-4">
                              {staff.categories && staff.categories.length > 0
                                ? staff.categories.join(", ")
                                : "All categories"}
                            </td>
                            <td className="py-3 px-4">
                              {staff.subCategories && staff.subCategories.length > 0
                                ? staff.subCategories.join(", ")
                                : "All subcategories"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${complaintsCount >= 5 ? "text-red-600" : ""}`}>
                                {complaintsCount}
                              </span>
                              {complaintsCount > 0 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  active {complaintsCount === 1 ? 'complaint' : 'complaints'}
                                </span>
                              )}
                              {complaintsCount >= 5 && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 py-1 px-2 rounded">
                                  At capacity
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleDeleteStaff(staff._id)}
                                className={`bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm ${
                                  complaintsCount > 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={complaintsCount > 0}
                                title={complaintsCount > 0 ? "Cannot delete staff with assigned complaints" : "Delete staff"}
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
              <p className="text-gray-600">
                {searchQuery 
                  ? `No support staff found matching "${searchQuery}". Try a different search term.` 
                  : "No support staff found. Add some staff members using the form above."}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupportStaffManagement;