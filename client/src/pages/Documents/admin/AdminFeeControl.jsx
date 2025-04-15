import React, { useState } from "react";
import DocumentLayout from "../../../components/documentSection/DocumentLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../../utils/newRequest";
import { toast } from "react-hot-toast";
import {
  FaCalendarAlt,
  FaGraduationCap,
  FaInfoCircle,
  FaFileAlt,
  FaPlus,
  FaListAlt,
} from "react-icons/fa";

const FeeStructurePage = () => {
  // Initial fee structure form data.
  const initialFormData = {
    semesterParity: "", // Optional field: 0 for Even, 1 for Odd
    year: "",
    program: "",
    tuitionFees: "",
    examinationFees: "",
    registrationFee: "",
    gymkhanaFee: "",
    medicalFee: "",
    hostelFund: "",
    hostelRent: "",
    elecAndWater: "",
    messAdvance: "",
    studentsBrotherhoodFund: "",
    acadFacilitiesFee: "",
    hostelMaintenance: "",
    studentsTravelAssistance: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("add"); // "add" or "view"
  const queryClient = useQueryClient();

  // Mutation to create a new fee structure entry.
  const createFeeStructure = useMutation({
    mutationFn: (data) => newRequest.post("/acadadmin/feeControl/addFee", data),
    onSuccess: () => {
      toast.success("Fee structure added successfully");
      setFormData(initialFormData);
      // Invalidate the fee structure list to force a refetch.
      queryClient.invalidateQueries(["fee-structure-list"]);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Error adding fee structure!!!"
      );
    },
  });

  // Validation for the fee structure form.
  const validateForm = () => {
    const errors = {};
    if (!formData.year) errors.year = "Year is required";
    if (!formData.program) errors.program = "Program is required";
    if (!formData.tuitionFees) errors.tuitionFees = "Tuition Fees is required";
    if (!formData.examinationFees)
      errors.examinationFees = "Examination Fees is required";
    if (!formData.registrationFee)
      errors.registrationFee = "Registration Fee is required";
    if (!formData.gymkhanaFee) errors.gymkhanaFee = "Gymkhana Fee is required";
    if (!formData.medicalFee) errors.medicalFee = "Medical Fee is required";
    if (!formData.hostelFund) errors.hostelFund = "Hostel Fund is required";
    if (!formData.hostelRent) errors.hostelRent = "Hostel Rent is required";
    if (!formData.elecAndWater)
      errors.elecAndWater = "Electricity & Water charges are required";
    if (!formData.messAdvance) errors.messAdvance = "Mess Advance is required";
    if (!formData.studentsBrotherhoodFund)
      errors.studentsBrotherhoodFund = "Students Brotherhood Fund is required";
    if (!formData.acadFacilitiesFee)
      errors.acadFacilitiesFee = "Academic Facilities Fee is required";
    if (!formData.hostelMaintenance)
      errors.hostelMaintenance = "Hostel Maintenance fee is required";
    if (!formData.studentsTravelAssistance)
      errors.studentsTravelAssistance =
        "Students Travel Assistance is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        // Omit semesterParity if not provided
        semesterParity: formData.semesterParity
          ? formData.semesterParity
          : undefined,
      };
      console.log("Submitting fee structure:", submissionData);
      createFeeStructure.mutate(submissionData);
    }
  };

  // Fetch fee structure list (only when list tab is active).
  const {
    isLoading: listLoading,
    error: listError,
    data: feeList = [],
  } = useQuery({
    queryKey: ["fee-structure-list"],
    queryFn: () =>
      newRequest
        .get("/acadadmin/feeControl/getFeeBreakdown")
        .then((res) => res.data.data),
    enabled: activeTab === "view", // only fetch when "view" tab is active
  });

  // Render the form view.
  const renderFormView = () => (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Header */}
      <div className="card border rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-3">
          <FaFileAlt className="w-10 h-10 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Add New Fee Structure
            </h2>
            <p className="text-sm text-gray-500">
              Please fill in all the required fee details below.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="card bg-base-100 shadow border border-base-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 border-b pb-3 text-gray-700 flex items-center">
          <FaInfoCircle className="w-6 h-6 mr-2" /> Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                <FaCalendarAlt className="w-4 h-4 mr-2" /> Year
              </span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.year ? "border-red-500" : ""
              }`}
              placeholder="e.g., 2025"
            />
            {formErrors.year && (
              <span className="text-xs text-red-500">{formErrors.year}</span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                <FaGraduationCap className="w-4 h-4 mr-2" /> Program
              </span>
            </label>
            <select
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              className={`select select-bordered ${
                formErrors.program ? "border-red-500" : ""
              }`}
            >
              <option value="" disabled>
                Select Program
              </option>
              <option value="BTech">BTech</option>
              <option value="MTech">MTech</option>
              <option value="PhD">PhD</option>
              <option value="BDes">BDes</option>
              <option value="MDes">MDes</option>
            </select>
            {formErrors.program && (
              <span className="text-xs text-red-500">{formErrors.program}</span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                <FaInfoCircle className="w-4 h-4 mr-2" /> Semester Type
              </span>
            </label>
            <select
              name="semesterParity"
              value={formData.semesterParity}
              onChange={handleInputChange}
              className="select select-bordered"
            >
              <option value="">Even/Odd</option>
              <option value="0">Even</option>
              <option value="1">Odd</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fee Details Section */}
      <div className="card bg-base-100 shadow border border-base-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 border-b pb-3 text-gray-700">
          Fee Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tuition Fees */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Tuition Fees
              </span>
            </label>
            <input
              type="number"
              name="tuitionFees"
              value={formData.tuitionFees}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.tuitionFees ? "border-red-500" : ""
              }`}
              placeholder="Enter Tuition Fees"
            />
            {formErrors.tuitionFees && (
              <span className="text-xs text-red-500">
                {formErrors.tuitionFees}
              </span>
            )}
          </div>
          {/* Examination Fees */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Examination Fees
              </span>
            </label>
            <input
              type="number"
              name="examinationFees"
              value={formData.examinationFees}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.examinationFees ? "border-red-500" : ""
              }`}
              placeholder="Enter Examination Fees"
            />
            {formErrors.examinationFees && (
              <span className="text-xs text-red-500">
                {formErrors.examinationFees}
              </span>
            )}
          </div>
          {/* Registration Fee */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Registration Fee
              </span>
            </label>
            <input
              type="number"
              name="registrationFee"
              value={formData.registrationFee}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.registrationFee ? "border-red-500" : ""
              }`}
              placeholder="Enter Registration Fee"
            />
            {formErrors.registrationFee && (
              <span className="text-xs text-red-500">
                {formErrors.registrationFee}
              </span>
            )}
          </div>
          {/* Gymkhana Fee */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Gymkhana Fee
              </span>
            </label>
            <input
              type="number"
              name="gymkhanaFee"
              value={formData.gymkhanaFee}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.gymkhanaFee ? "border-red-500" : ""
              }`}
              placeholder="Enter Gymkhana Fee"
            />
            {formErrors.gymkhanaFee && (
              <span className="text-xs text-red-500">
                {formErrors.gymkhanaFee}
              </span>
            )}
          </div>
          {/* Medical Fee */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Medical Fee
              </span>
            </label>
            <input
              type="number"
              name="medicalFee"
              value={formData.medicalFee}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.medicalFee ? "border-red-500" : ""
              }`}
              placeholder="Enter Medical Fee"
            />
            {formErrors.medicalFee && (
              <span className="text-xs text-red-500">
                {formErrors.medicalFee}
              </span>
            )}
          </div>
          {/* Hostel Fund */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Hostel Fund
              </span>
            </label>
            <input
              type="number"
              name="hostelFund"
              value={formData.hostelFund}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.hostelFund ? "border-red-500" : ""
              }`}
              placeholder="Enter Hostel Fund"
            />
            {formErrors.hostelFund && (
              <span className="text-xs text-red-500">
                {formErrors.hostelFund}
              </span>
            )}
          </div>
          {/* Hostel Rent */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Hostel Rent
              </span>
            </label>
            <input
              type="number"
              name="hostelRent"
              value={formData.hostelRent}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.hostelRent ? "border-red-500" : ""
              }`}
              placeholder="Enter Hostel Rent"
            />
            {formErrors.hostelRent && (
              <span className="text-xs text-red-500">
                {formErrors.hostelRent}
              </span>
            )}
          </div>
          {/* Electricity & Water */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Electricity &amp; Water
              </span>
            </label>
            <input
              type="number"
              name="elecAndWater"
              value={formData.elecAndWater}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.elecAndWater ? "border-red-500" : ""
              }`}
              placeholder="Enter Charges"
            />
            {formErrors.elecAndWater && (
              <span className="text-xs text-red-500">
                {formErrors.elecAndWater}
              </span>
            )}
          </div>
          {/* Mess Advance */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Mess Advance
              </span>
            </label>
            <input
              type="number"
              name="messAdvance"
              value={formData.messAdvance}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.messAdvance ? "border-red-500" : ""
              }`}
              placeholder="Enter Mess Advance"
            />
            {formErrors.messAdvance && (
              <span className="text-xs text-red-500">
                {formErrors.messAdvance}
              </span>
            )}
          </div>
          {/* Students Brotherhood Fund */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Students Brotherhood Fund
              </span>
            </label>
            <input
              type="number"
              name="studentsBrotherhoodFund"
              value={formData.studentsBrotherhoodFund}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.studentsBrotherhoodFund ? "border-red-500" : ""
              }`}
              placeholder="Enter Fund Amount"
            />
            {formErrors.studentsBrotherhoodFund && (
              <span className="text-xs text-red-500">
                {formErrors.studentsBrotherhoodFund}
              </span>
            )}
          </div>
          {/* Academic Facilities Fee */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Academic Facilities Fee
              </span>
            </label>
            <input
              type="number"
              name="acadFacilitiesFee"
              value={formData.acadFacilitiesFee}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.acadFacilitiesFee ? "border-red-500" : ""
              }`}
              placeholder="Enter Academic Facilities Fee"
            />
            {formErrors.acadFacilitiesFee && (
              <span className="text-xs text-red-500">
                {formErrors.acadFacilitiesFee}
              </span>
            )}
          </div>
          {/* Hostel Maintenance */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Hostel Maintenance
              </span>
            </label>
            <input
              type="number"
              name="hostelMaintenance"
              value={formData.hostelMaintenance}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.hostelMaintenance ? "border-red-500" : ""
              }`}
              placeholder="Enter Hostel Maintenance Fee"
            />
            {formErrors.hostelMaintenance && (
              <span className="text-xs text-red-500">
                {formErrors.hostelMaintenance}
              </span>
            )}
          </div>
          {/* Students Travel Assistance */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm text-gray-600">
                Students Travel Assistance
              </span>
            </label>
            <input
              type="number"
              name="studentsTravelAssistance"
              value={formData.studentsTravelAssistance}
              onChange={handleInputChange}
              className={`input input-bordered ${
                formErrors.studentsTravelAssistance ? "border-red-500" : ""
              }`}
              placeholder="Enter Travel Assistance Amount"
            />
            {formErrors.studentsTravelAssistance && (
              <span className="text-xs text-red-500">
                {formErrors.studentsTravelAssistance}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => setFormData(initialFormData)}
          className="px-6 py-2 rounded-lg btn btn-outline text-primary-content shadow-md hover:bg-base-300"
        >
          Reset Form
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg btn btn-primary text-primary-content shadow-md hover:outline hover:outline-black"
        >
          Submit Fee Structure
        </button>
      </div>
    </form>
  );

  // Render the fee structure list view.
  const renderListView = () => {
    if (listLoading) {
      return <div className="text-center py-10">Loading fee structures...</div>;
    }
    if (listError) {
      return (
        <div className="text-center py-10 text-red-600">
          Error loading fee structures. Please try again later.
        </div>
      );
    }
    if (feeList.length === 0) {
      return (
        <div className="text-center py-10 text-gray-600">
          <p>No fee structure entries found.</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-base-200">
        <table className="w-full table-auto">
          <thead className="bg-gradient-to-r from-indigo-50 to-blue-50 text-left">
            <tr>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Sl.
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Year
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Program
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Semester
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Tuition
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Exam
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Reg.
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Gymkhana
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Medical
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Hostel Fund
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Hostel Rent
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Elec. & Water
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Mess Adv.
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Brotherhood
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Acad. Facilities
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Hostel Maint.
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-indigo-800 uppercase">
                Travel Assist.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {feeList.map((fee, index) => (
              <tr
                key={fee._id || index}
                className="hover:bg-indigo-50/50 transition-colors duration-150"
              >
                <td className="px-4 py-2 text-sm font-medium text-gray-600">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">{fee.year}</td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {fee.program}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {fee.semesterParity === 0
                    ? "Even"
                    : fee.semesterParity === 1
                    ? "Odd"
                    : "Both"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.tuitionFees?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.examinationFees?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.registrationFee?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.gymkhanaFee?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.medicalFee?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.hostelFund?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.hostelRent?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.elecAndWater?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.messAdvance?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.studentsBrotherhoodFund?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.acadFacilitiesFee?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.hostelMaintenance?.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ₹{fee.studentsTravelAssistance?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DocumentLayout title="Fee Structure Management">
      {/* Switching Tabs */}
      <div className="mb-8 flex justify-center sm:justify-start">
        <div className="inline-flex rounded-lg p-1 shadow-inner space-x-1 border border-indigo-200">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 ${
              activeTab === "add"
                ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md"
                : "text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <FaPlus className="w-4 h-4 mr-2" /> Add Fee Structure
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`flex items-center px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 ${
              activeTab === "view"
                ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md"
                : "text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <FaListAlt className="w-4 h-4 mr-2" /> Fee Structures List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border border-base-200 min-h-[400px]">
        {activeTab === "add" ? renderFormView() : renderListView()}
      </div>
    </DocumentLayout>
  );
};

export default FeeStructurePage;
