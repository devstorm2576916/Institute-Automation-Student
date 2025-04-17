import React, { useState, useEffect } from 'react';
import newRequest from '../../utils/newRequest';
import { useQuery } from '@tanstack/react-query';

const HostelLeaveStudent = () => {
    const { data: userData } = JSON.parse(localStorage.getItem("currentUser"));
    const { email, userId } = userData.user;

    const [activeTab, setActiveTab] = useState('pending');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [requestPending, setRequestPending] = useState(false);

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["leaves"],
        queryFn: () =>
            newRequest.get(`/hostel/${userId}/leaves`).then((res) => res.data),
    });

    // Segregate requests
    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [rejectedRequests, setRejectedRequests] = useState([]);

    useEffect(() => {
        if (data) {
            setPendingRequests(data.filter(req => req.status === 'Pending'));
            setApprovedRequests(data.filter(req => req.status === 'Approved'));
            setRejectedRequests(data.filter(req => req.status === 'Rejected'));
        }
    }, [data]);

    useEffect(() => {
        // Clear response message when leave data changes (e.g., after approval/rejection)
        setResponseMessage('');
    }, [data]);

    const handleOpenForm = () => setShowForm(true);
    const handleDiscard = () => {
        setShowForm(false);
        setFormData({ startDate: '', endDate: '', reason: '' });
        setResponseMessage('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponseMessage('');
        // Normalize dates to midnight for accurate comparison and submission
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(start, end, today);

        if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
            setResponseMessage('All fields are required.');
            return;
        }
        if (start < today) {
            setResponseMessage('Start date cannot be in the past.');
            return;
        }
        if (start > end) {
            setResponseMessage('Start date cannot be after end date.');
            return;
        }
        if (pendingRequests.length > 0) {
            setResponseMessage('You already have a pending leave request.');
            return;
        }
        
        setRequestPending(true);
        try {
            const newReq = {
                applicationId: Date.now(),
                status: 'Pending',
                email,
                startDate: formData.startDate, // send as "YYYY-MM-DD"
                endDate: formData.endDate,
                reason: formData.reason,
            };
            await newRequest.post('/hostel/leave', newReq);
            await refetch(); // <-- Add this line
            setResponseMessage('Leave request submitted successfully.');
            setShowForm(false);
            setFormData({ startDate: '', endDate: '', reason: '' }); // Clear form after success
        } catch (err) {
            setResponseMessage('Failed to submit request.');
        } finally {
            setRequestPending(false);
        }
    };

    // Helper for tab button styles
    const tabButtonClass = (tab) =>
        `flex items-center px-5 py-2.5 shadow rounded-md text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50
        ${activeTab === tab ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-700'}
        `;

    // Helper to adjust for noon UTC storage
    function adjustNoonDate(dateString) {
        const d = new Date(dateString);
        d.setHours(d.getHours() + 12);
        return d.toLocaleDateString();
    }

    // Card component for leave requests
    const LeaveCard = ({ req }) => (
        <div className="p-4 bg-gray-200 rounded-lg shadow mb-3">
            <p><strong>Start Date:</strong> {req.startDate ? adjustNoonDate(req.startDate) : ''}</p>
            <p><strong>End Date:</strong> {req.endDate ? adjustNoonDate(req.endDate) : ''}</p>
            <p><strong>Reason:</strong> {req.reason}</p>
            <p><strong>Status:</strong> {req.status}</p>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center p-4 m-2">
            <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 flex items-center flex-col">
                <h2 className="text-2xl font-semibold text-center mb-4">Leave Requests</h2>
                <hr className="border-gray-300 mb-4 w-full" />

                {/* Tabs */}
                <div className="flex justify-around w-full mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={tabButtonClass('pending')}
                        style={activeTab === 'pending' ? { color: '#fff', fontWeight: 600 } : {}}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={tabButtonClass('approved')}
                        style={activeTab === 'approved' ? { color: '#fff', fontWeight: 600 } : {}}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={tabButtonClass('rejected')}
                        style={activeTab === 'rejected' ? { color: '#fff', fontWeight: 600 } : {}}
                    >
                        Rejected
                    </button>
                </div>

                {/* Tab Content */}
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error loading requests.</p>
                ) : (
                    <>
                        {activeTab === 'pending' && (
                            <>
                                {pendingRequests.length === 0 ? (
                                    <p className="card w-full bg-base-100 shadow border border-base-200 rounded-lg text-center text-gray-500 py-4">No pending requests</p>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingRequests.map((req) => <LeaveCard key={req._id} req={req} />)}
                                    </div>
                                )}
                                {pendingRequests.length === 0 && !showForm && (
                                    <button
                                        className="mt-4 bg-indigo-700 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition"
                                        onClick={handleOpenForm}
                                        disabled={pendingRequests.length > 0}
                                    >
                                        Apply for Leave
                                    </button>
                                )}
                            </>
                        )}

                        {activeTab === 'approved' && (
                            approvedRequests.length === 0 ? (
                                <p className="card w-full bg-base-100 shadow border border-base-200 rounded-lg text-center text-gray-500 py-4">No approved requests</p>
                            ) : (
                                <div className="space-y-3">
                                    {approvedRequests.map((req) => <LeaveCard key={req._id} req={req} />)}
                                </div>
                            )
                        )}

                        {activeTab === 'rejected' && (
                            rejectedRequests.length === 0 ? (
                                <p className="card w-full bg-base-100 shadow border border-base-200 rounded-lg text-center text-gray-500 py-4">No rejected requests</p>
                            ) : (
                                <div className="space-y-3">
                                    {rejectedRequests.map((req) => <LeaveCard key={req._id} req={req} />)}
                                </div>
                            )
                        )}
                    </>
                )}

                {/* Leave Application Form */}
                {showForm && (
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md w-[80%]">
                        <h3 className="text-xl font-semibold text-center mb-4">Leave Application</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className={`w-full p-2 border rounded-lg ${
                                        formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                />
                                {formData.startDate && new Date(formData.startDate) < new Date(new Date().setHours(0,0,0,0)) && (
                                    <p className="text-red-500 text-sm mt-1">Start date cannot be in the past</p>
                                )}
                                {formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate) && (
                                    <p className="text-red-500 text-sm mt-1">Start date cannot be after end date</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className={`w-full p-2 border rounded-lg ${
                                        formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium">Reason for Leave</label>
                                <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" required className="w-full p-2 border rounded-lg"></textarea>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition" onClick={handleDiscard}>Discard</button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                                    disabled={
                                        requestPending ||
                                        (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate))
                                    }
                                >
                                    {requestPending ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {responseMessage && (
                    <div className="mt-4 p-4 rounded bg-yellow-100 text-yellow-800">
                        <p>{responseMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostelLeaveStudent;
