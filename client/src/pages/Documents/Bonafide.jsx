import React, { useState } from 'react';
import DocumentLayout from '../../components/documentSection/DocumentLayout';

const BonafidePage = () => {
    const [activeTab, setActiveTab] = useState('application');
    const [formData, setFormData] = useState({
        currentSemester: '',
        certificateFor: ''
    });

    // Hardcoded student data (will come from backend)
    const studentInfo = {
        name: 'JOHN SMITH DOE',
        rollNo: '220103045',
        fatherName: 'ROBERT JAMES DOE',
        enrolledYear: '2022',
        programme: 'BTech',
        department: 'Dept. of Mechanical Engineering',
        hostel: 'Kameng',
        roomNo: 'A-123',
        dateOfBirth: '2003-08-25'
    };

    const certificateReasons = [
        'Bank Account Opening',
        'Passport Application',
        'Visa Application',
        'Education Loan',
        'Scholarship Application',
        'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ ...studentInfo, ...formData });
    };

    const renderApplicationForm = () => (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Header */}
            <div className="card bg-base-200 border-2 border-base-300">
                <div className="card-body">
                    <h2 className="card-title text-sm">BONAFIDE CERTIFICATE APPLICATION</h2>
                    <p className="text-xs italic">Please verify your information below</p>
                </div>
            </div>

            {/* Student Information Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 card bg-base-100 shadow-lg border-2 border-base-200 p-6">
                <InfoDisplay label="Name" value={studentInfo.name} />
                <InfoDisplay label="Roll No" value={studentInfo.rollNo} />
                <InfoDisplay label="S/o / D/o" value={studentInfo.fatherName} />
                <InfoDisplay label="Enrolled Year" value={studentInfo.enrolledYear} />
                <InfoDisplay label="Programme" value={studentInfo.programme} />
                <InfoDisplay label="Department" value={studentInfo.department} />
                <InfoDisplay label="Hostel" value={studentInfo.hostel} />
                <InfoDisplay label="Room No" value={studentInfo.roomNo} />
                <InfoDisplay label="Date of Birth" value={studentInfo.dateOfBirth} />
            </div>

            {/* User Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 card bg-base-100 shadow-lg border-2 border-base-200 p-6">
                {/* Current Semester Selection */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-semibold">Current Semester</span>
                    </label>
                    <select
                        name="currentSemester"
                        className="select select-bordered w-full focus:outline-none focus:border-primary"
                        value={formData.currentSemester}
                        onChange={handleInputChange}
                    >
                        <option value="">Choose Semester</option>
                        {[1,2,3,4,5,6,7,8].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>

                {/* Certificate Purpose Selection */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-semibold">Certificate For</span>
                    </label>
                    <select
                        name="certificateFor"
                        className="select select-bordered w-full focus:outline-none focus:border-primary"
                        value={formData.certificateFor}
                        onChange={handleInputChange}
                    >
                        <option value="">Choose Purpose</option>
                        {certificateReasons.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 mt-8">
                <button 
                    type="button" 
                    className="btn btn-outline hover:bg-base-200"
                    onClick={() => setFormData({})}
                >
                    Reset
                </button>
                <button type="submit" className="btn btn-primary">
                    Submit Application
                </button>
            </div>
        </form>
    );

    const InfoDisplay = ({ label, value }) => (
        <div className="form-control">
            <label className="label">
                <span className="label-text text-xs text-gray-500">{label}</span>
            </label>
            <div className="text-sm font-medium">{value}</div>
        </div>
    );

    return (
        <DocumentLayout title="Bonafide Certificate">
            <div className="flex mb-8">
                <div className="inline-flex rounded-lg bg-base-200 p-1">
                    <button 
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                        ${activeTab === 'application' 
                            ? 'bg-primary text-primary-content shadow-md' 
                            : 'hover:bg-base-300'}`}
                        onClick={() => setActiveTab('application')}
                    >
                        New Application
                    </button>
                    <button 
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                        ${activeTab === 'status' 
                            ? 'bg-primary text-primary-content shadow-md' 
                            : 'hover:bg-base-300'}`}
                        onClick={() => setActiveTab('status')}
                    >
                        Application Status
                    </button>
                </div>
            </div>

            <div className="bg-base-100 rounded-lg p-6 shadow-lg border border-base-200">
                {activeTab === 'application' ? renderApplicationForm() : (
                    <div className="text-center py-8">
                        <h3 className="text-lg font-semibold">Application Status</h3>
                        {/* Add status tracking UI here */}
                    </div>
                )}
            </div>
        </DocumentLayout>
    );
};

export default BonafidePage;
