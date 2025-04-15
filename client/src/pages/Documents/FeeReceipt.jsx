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
      return response.data;
    },
    enabled: !!userId,
  });

  const handleGenerate = async () => {
    if (!selectedSemester) return;
    setIsLoading(true);
    try {
      // Find fee payment details for selected semester
      const semesterPayment = feeData?.payments?.find(
        (p) => p.semester === parseInt(selectedSemester)
      );

      if (!semesterPayment) {
        toast.error("No fee payment found for selected semester");
        return;
      }

      const blob = await pdf(
        <FeeReceiptPDF
          student={feeData.student}
          semester={selectedSemester}
          feeData={semesterPayment.feeBreakdown}
          isPaid={true}
          transactionDetails={{
            transactionId: semesterPayment.transactionId,
            dateTime: semesterPayment.paidAt,
            viewableDocumentId: semesterPayment.viewableDocumentId,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
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
    }
  };

  return (
    <DocumentLayout title="Fee Receipt">
      <div className="max-w-3xl mx-auto space-y-6 p-6 bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
          Fee Receipt
        </h1>

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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                Semester {num}
              </option>
            ))}
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
                <p className="font-medium">{feeData.student.programme}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-medium">{feeData.student.branch}</p>
              </div>
            </div>
          </div>
        )}

        {/* Display Fee Payment Status */}
        {selectedSemester && feeData && (
          <div
            className={`p-3 text-center rounded-lg text-lg font-semibold ${
              feeData.payments.some(
                (p) => p.semester === parseInt(selectedSemester)
              )
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feeData.payments.some(
              (p) => p.semester === parseInt(selectedSemester)
            )
              ? "Fees Paid"
              : "Fees Not Paid"}
          </div>
        )}

        {/* PDF Preview */}
        <PDFPreview pdfUrl={pdfUrl} isLoading={isLoading || isFeeDataLoading} />

        {/* Generate & Download Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !selectedSemester || isFeeDataLoading}
            className={`relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
              isLoading || !selectedSemester || isFeeDataLoading
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
