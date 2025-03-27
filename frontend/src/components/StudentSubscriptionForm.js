import React, { useState } from 'react';
import { createSubscriptionRequest } from '../services/messSubscriptionService';
import '../styles/StudentSubscriptionForm.css';

const StudentSubscriptionForm = () => {
  const [newPlan, setNewPlan] = useState('REGULAR');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStudentId = (id) => {
   
    const studentIdRegex = /^\d{9}$/;
    return studentIdRegex.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    
    if (!validateStudentId(studentId)) {
      setError('Invalid Student ID. Must be exactly 9 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      await createSubscriptionRequest(studentId, newPlan);
      alert('Subscription request submitted successfully!');
   
      setStudentId('');
      setNewPlan('REGULAR');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Failed to submit request. Please try again.';
      setError(errorMessage);
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="subscription-container">
      <div className="subscription-card">
        <form onSubmit={handleSubmit} className="subscription-form">
          <h2>Mess Subscription</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input 
              type="number" 
              id="studentId"
              value={studentId}
              onChange={(e) => {
              
                const value = e.target.value.slice(0, 9);
                setStudentId(value);
              }}
              placeholder="Enter 9-digit Student ID"
              required 
              min="100000000"
              max="999999999"
            />
          </div>

          <div className="form-group">
            <label htmlFor="messPlan">Mess Plan</label>
            <div className="plan-options">
              <label 
                className={`plan-option ${newPlan === 'REGULAR' ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  value="REGULAR"
                  checked={newPlan === 'REGULAR'}
                  onChange={() => setNewPlan('REGULAR')}
                  className="plan-radio"
                />
                <span>Regular Plan</span>
              </label>
              <label 
                className={`plan-option ${newPlan === 'SPECIAL' ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  value="SPECIAL"
                  checked={newPlan === 'SPECIAL'}
                  onChange={() => setNewPlan('SPECIAL')}
                  className="plan-radio"
                />
                <span>Special Plan</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentSubscriptionForm;