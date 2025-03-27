import React, { useState } from 'react';
import DocumentLayout from '../../components/documentSection/DocumentLayout';
import PDFPreview from '../../components/documentSection/PDFPreview';

const IDCardPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    // Hardcoded student data
    const studentInfo = {
        name: "JOHN SMITH DOE",
        rollNo: "220103045",
        programme: "BTech",
        department: "Computer Science and Engineering",
        validUntil: "2024-05-31",
        bloodGroup: "B+",
        emergencyContact: "+91 9876543210"
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setPdfUrl('/sample-idcard.pdf');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DocumentLayout title="ID Card">
            <div className="max-w-6xl mx-auto space-y-6">
                <PDFPreview pdfUrl={pdfUrl} isLoading={isLoading} />
                
                <div className="flex justify-center gap-4 pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="btn btn-primary min-w-[200px]"
                    >
                        {isLoading ? 'Generating...' : 'Generate ID Card'}
                    </button>
                    {pdfUrl && (
                        <a 
                            href={pdfUrl} 
                            download 
                            className="btn btn-accent min-w-[200px]"
                        >
                            Download PDF
                        </a>
                    )}
                </div>
            </div>
        </DocumentLayout>
    );
};

export default IDCardPage;
