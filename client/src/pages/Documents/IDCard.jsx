import React from 'react';
import DocumentLayout from './components/DocumentLayout';

const IDCardPage = () => {
    return (
        <DocumentLayout title="ID Card">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="text-center">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Upload Photo
                            </label>
                            <input type="file" className="hidden" accept="image/*" />
                            <button className="bg-blue-500 text-white px-4 py-2 rounded">
                                Choose File
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">ID Card Preview</h3>
                        {/* Preview content will go here */}
                    </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end">
                    <button className="bg-green-500 text-white px-6 py-2 rounded">
                        Generate ID Card
                    </button>
                </div>
            </div>
        </DocumentLayout>
    );
};

export default IDCardPage;
