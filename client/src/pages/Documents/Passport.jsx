import React, { useState } from 'react';
import DocumentLayout from './components/DocumentLayout';

const PassportPage = () => {
    const [activeTab, setActiveTab] = useState('application');

    return (
        <DocumentLayout title="Passport Application">
            <div className="space-y-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('application')}
                            className={`py-2 px-1 border-b-2 ${
                                activeTab === 'application'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            New Application
                        </button>
                        <button
                            onClick={() => setActiveTab('status')}
                            className={`py-2 px-1 border-b-2 ${
                                activeTab === 'status'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Application Status
                        </button>
                    </nav>
                </div>

                {/* Content based on active tab */}
                <div className="mt-4">
                    {activeTab === 'application' ? (
                        <div>New Application Form will go here</div>
                    ) : (
                        <div>Status tracking will go here</div>
                    )}
                </div>
            </div>
        </DocumentLayout>
    );
};

export default PassportPage;
