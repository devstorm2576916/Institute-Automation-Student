import React, { useState, useEffect } from "react";
import DocumentLayout from "../../components/documentSection/DocumentLayout";
import PDFPreview from "../../components/documentSection/PDFPreview";
import FeeReceiptPDF from "../../components/documentSection/FeeReceiptPDF";
import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { toast } from "react-hot-toast";

const FeeReceiptPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [userId, setUserId] = useState(null);
  const [preparedFeeData, setPreparedFeeData] = useState(null);

  // Get user ID from localStorage
  useEffect(() => {
    try {
      const { data: userData } = JSON.parse(
        localStorage.getItem("currentUser")
      );
      const { userId } = userData.user;
      setUserId(userId);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Fetch fee payment history
  const { data: feeData, isLoading: isFeeDataLoading } = useQuery({
    queryKey: ["feeHistory", userId],
    queryFn: async () => {
      const response = await newRequest.get(`/student/${userId}/fees/history`);
      console.log("Fee history data:", response.data);
      return response.data;
    },
    enabled: !!userId,
    onError: (error) => {
      console.error("Error fetching fee history:", error);
      toast.error("Failed to fetch fee history");
    },
  });

  // Add a check for empty fee data
  useEffect(() => {
    if (feeData && (!feeData.payments || feeData.payments.length === 0)) {
      // Replace toast.info with toast() for an informational message.
      toast("You don't have any fee payment records yet.");
    }
  }, [feeData]);

  // Prepare fee data when semester changes
  useEffect(() => {
    if (!selectedSemester || !feeData) return;

    try {
      // Find fee payment details for selected semester
      const semesterPayment = feeData.payments.find(
        (p) => p.semester === parseInt(selectedSemester)
      );

      if (!semesterPayment) {
        setPreparedFeeData(null);
        return;
      }

      // Prepare fee data for PDF
      const feeBreakdown = semesterPayment.feeBreakdown;

      // Format fee particulars data
      const feeParticulars = [
        { particular: "Tuition Fees", amount: feeBreakdown.tuitionFees },
        { particular: "Examination Fee", amount: feeBreakdown.examinationFees },
        {
          particular: "Registration/Enrollment Fee",
          amount: feeBreakdown.registrationFee,
        },
        { particular: "Gymkhana Fee", amount: feeBreakdown.gymkhanaFee },
        { particular: "Medical Fee", amount: feeBreakdown.medicalFee },
        { particular: "Hostel Fund", amount: feeBreakdown.hostelFund },
        { particular: "Hostel Rent", amount: feeBreakdown.hostelRent },
        {
          particular: "Electricity and Water Charges",
          amount: feeBreakdown.elecAndWater,
        },
        {
          particular: "Adjustable Mess Advance",
          amount: feeBreakdown.messAdvance,
        },
        {
          particular: "Students Brotherhood Fund",
          amount: feeBreakdown.studentsBrotherhoodFund,
        },
        {
          particular: "Academic Facilities Fee",
          amount: feeBreakdown.acadFacilitiesFee,
        },
        {
          particular: "Hostel Maintenance Charge",
          amount: feeBreakdown.hostelMaintenance,
        },
        {
          particular: "Students Travel Assistance Fund",
          amount: feeBreakdown.studentsTravelAssistance,
        },
      ];

      // Calculate total
      const totalAmount = feeParticulars.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );

      // Add totals to fee particulars
      const completeParticulars = [
        ...feeParticulars,
        { particular: "Total Amount", amount: totalAmount.toFixed(2) },
        { particular: "Adjustment Amount", amount: "0.00" },
        { particular: "Payable Amount", amount: totalAmount.toFixed(2) },
      ];

      setPreparedFeeData({
        student: feeData.student,
        feeParticulars: completeParticulars,
        transactionDetails: {
          slNo: 1,
          feeType: "Semester Registration Fee",
          feeAmount: totalAmount,
          transactionId: semesterPayment.transactionId || "N/A",
          dateTime: new Date(semesterPayment.paidAt).toLocaleString("sv-SE"),
          status: "Success",
          viewableDocumentId: semesterPayment.viewableDocumentId,
        },
      });
    } catch (error) {
      console.error("Error preparing fee data:", error);
      toast.error("Error preparing fee data");
      setPreparedFeeData(null);
    }
  }, [selectedSemester, feeData]);

  const handleGenerate = async () => {
    if (!selectedSemester || !preparedFeeData) {
      toast.error("Please select a semester with valid payment data");
      return;
    }

    setIsLoading(true);
    try {
      const blob = await pdf(
        <FeeReceiptPDF
          student={preparedFeeData.student}
          semester={`Semester ${selectedSemester}`}
          feeData={preparedFeeData.feeParticulars}
          isPaid={true}
          transactionDetails={preparedFeeData.transactionDetails}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
      toast.success("Receipt generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `Fee_Receipt_${feeData.student.rollNo}_Sem${selectedSemester}_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Receipt downloaded successfully");
    } else {
      toast.error("Please generate the receipt first");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get available semesters with payments
  const paidSemesters = feeData?.payments
    ? [...new Set(feeData.payments.map((p) => p.semester))]
    : [];

  return (
    <DocumentLayout title="Fee Receipt">
      <div className="max-w-3xl mx-auto space-y-6 p-6 bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
          Fee Receipt
        </h1>

        {/* Semester Selection */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Semester</option>
            {paidSemesters.length > 0 ? (
              paidSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))
            ) : (
              <option disabled>No paid semesters found</option>
            )}
          </select>
        </div>

        {/* Display Student Info */}
        {feeData && (
          <div className="bg-white p-4 rounded-lg shadow-inner mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{feeData.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="font-medium">{feeData.student.rollNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Programme</p>
                <p className="font-medium">{feeData.student.program}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{feeData.student.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{feeData.student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium">
                  {feeData.student.contact || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fee Details for Selected Semester */}
        {selectedSemester && preparedFeeData && (
          <div className="bg-white p-4 rounded-lg shadow-inner mt-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Fee Details - Semester {selectedSemester}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Particular
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preparedFeeData.feeParticulars.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        index >= preparedFeeData.feeParticulars.length - 3
                          ? "bg-blue-50 font-semibold"
                          : ""
                      }
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {item.particular}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <p className="flex justify-between text-sm">
                <span className="font-medium">Transaction ID:</span>
                <span>{preparedFeeData.transactionDetails.transactionId}</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className="font-medium">Payment Date:</span>
                <span>{preparedFeeData.transactionDetails.dateTime}</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className="font-medium">Status:</span>
                <span className="text-green-600 font-semibold">Paid</span>
              </p>
            </div>
          </div>
        )}

        {/* Payment Status */}
        {selectedSemester && feeData && (
          <div
            className={`p-3 text-center rounded-lg text-lg font-semibold ${
              paidSemesters.includes(parseInt(selectedSemester))
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {paidSemesters.includes(parseInt(selectedSemester))
              ? "Payment Successful"
              : "No Payment Record Found"}
          </div>
        )}

        {/* PDF Preview */}
        <PDFPreview pdfUrl={pdfUrl} isLoading={isLoading || isFeeDataLoading} />

        {/* Generate & Download Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleGenerate}
            disabled={
              isLoading ||
              !selectedSemester ||
              !preparedFeeData ||
              isFeeDataLoading
            }
            className={`relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
              isLoading ||
              !selectedSemester ||
              !preparedFeeData ||
              isFeeDataLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-600"
            }`}
          >
            {isLoading ? "Generating..." : "Generate Receipt"}
          </button>
          {pdfUrl && (
            <button
              onClick={handleDownload}
              className="relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-green-600 to-teal-700 hover:from-teal-500 hover:to-green-600 shadow-lg transform hover:scale-105"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>
    </DocumentLayout>
  );
};

export default FeeReceiptPage;
