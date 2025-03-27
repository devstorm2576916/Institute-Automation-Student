import React, { useState } from 'react';
import DocumentLayout from './components/DocumentLayout';

const TranscriptPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <DocumentLayout title="Transcript">
            <div className="space-y-6">
                {/* Student Info Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4">Student Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">John Doe</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Roll Number</p>
                            <p className="font-medium">123456</p>
                        </div>
                        {/* Add more student details */}
                    </div>
                </div>

                {/* Download Section */}
                <div className="flex justify-end space-x-4">
                    <button 
                        className={`px-6 py-2 rounded ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Download Transcript'}
                    </button>
                </div>
            </div>
        </DocumentLayout>
    );
};

export default TranscriptPage;
