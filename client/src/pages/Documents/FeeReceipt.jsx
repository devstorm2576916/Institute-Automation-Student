import React, { useState } from 'react';
import DocumentLayout from './components/DocumentLayout';

const FeeReceiptPage = () => {
    const [selectedSemester, setSelectedSemester] = useState('');

    return (
        <DocumentLayout title="Fee Receipt">
            <div className="space-y-6">
                {/* Semester Selection */}
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Semester
                    </label>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                    >
                        <option value="">Choose semester</option>
                        {/* Add semester options */}
                    </select>
                </div>

                {/* Receipt List */}
                <div className="border rounded-lg divide-y">
                    {/* Receipt items will go here */}
                    <div className="p-4 text-center text-gray-500">
                        Select a semester to view receipts
                    </div>
                </div>
            </div>
        </DocumentLayout>
    );
};

export default FeeReceiptPage;
