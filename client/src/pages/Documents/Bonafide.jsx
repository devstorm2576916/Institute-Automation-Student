import React, { useState } from 'react';
import DocumentLayout from './components/DocumentLayout';

const BonafidePage = () => {
    const [status, setStatus] = useState('new'); // new, pending, approved, rejected

    return (
        <DocumentLayout title="Bonafide Certificate">
            <div className="space-y-6">
                {/* Status Indicator */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Application Status</h3>
                    <div className="flex items-center space-x-2">
                        <span className={`h-3 w-3 rounded-full ${
                            status === 'approved' ? 'bg-green-500' :
                            status === 'pending' ? 'bg-yellow-500' :
                            status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-500'
                        }`}></span>
                        <span className="capitalize">{status}</span>
                    </div>
                </div>

                {/* Application Form */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Request Details</h3>
                    {/* Form fields will go here */}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded">
                        Clear
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">
                        Submit Request
                    </button>
                </div>
            </div>
        </DocumentLayout>
    );
};

export default BonafidePage;
