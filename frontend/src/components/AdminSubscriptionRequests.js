import React, { useState, useEffect } from 'react';
import { 
  getSubscriptionRequests, 
  processSubscriptionRequest 
} from '../services/messSubscriptionService';
import '../styles/AdminSubscriptionRequests.css';

const AdminSubscriptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getSubscriptionRequests();
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      setError('Unable to load subscription requests');
      setLoading(false);
    }
  };

  const handleRequestAction = async (status) => {
    if (!selectedRequest) return;

    setProcessingStatus(status);

    try {
      const rejectionReason = status === 'REJECTED' 
        ? prompt('Please provide a reason for rejection:') 
        : '';
      
      await processSubscriptionRequest(
        selectedRequest._id, 
        status, 
        rejectionReason
      );
      
   
      await fetchRequests();
      setSelectedRequest(null);
      setProcessingStatus(null);
    } catch (error) {
      alert('Failed to process request');
      setProcessingStatus(null);
    }
  };

  const renderRequestStatus = (status) => {
    const statusColors = {
      PENDING: 'text-yellow-600',
      APPROVED: 'text-green-600',
      REJECTED: 'text-red-600'
    };
    return (
      <span className={`font-semibold ${statusColors[status] || 'text-gray-600'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading subscription requests...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-container">
      <h2>Subscription Requests</h2>
      
      {requests.length === 0 ? (
        <div className="no-requests">No subscription requests found</div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div 
              key={request._id} 
              className={`request-card ${selectedRequest?._id === request._id ? 'selected' : ''}`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="request-header">
                <h3>{request.studentId?.name || 'Unknown Student'}</h3>
                {renderRequestStatus(request.status)}
              </div>
              <div className="request-details">
                <p>
                  <strong>Student ID:</strong> {request.studentId?.studentId}
                </p>
                <p>
                  <strong>Current Plan:</strong> {request.currentPlan}
                </p>
                <p>
                  <strong>Requested Plan:</strong> {request.newPlan}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="request-modal">
          <div className="request-modal-content">
            <h3>Process Subscription Request</h3>
            <p>Do you want to approve or reject this request?</p>
            <div className="modal-actions">
              <button 
                onClick={() => handleRequestAction('APPROVED')}
                disabled={processingStatus !== null}
                className="approve-btn"
              >
                {processingStatus === 'APPROVED' ? 'Processing...' : 'Approve'}
              </button>
              <button 
                onClick={() => handleRequestAction('REJECTED')}
                disabled={processingStatus !== null}
                className="reject-btn"
              >
                {processingStatus === 'REJECTED' ? 'Processing...' : 'Reject'}
              </button>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionRequests;