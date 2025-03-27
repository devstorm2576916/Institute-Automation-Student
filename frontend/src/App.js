import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentSubscriptionForm from './components/StudentSubscriptionForm';
import AdminSubscriptionRequests from './components/AdminSubscriptionRequests';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <div className="nav-content">
            <h1>Mess Subscription System</h1>
            <div className="nav-links">
              <Link to="/student" className="nav-link">Student Request</Link>
              <Link to="/admin" className="nav-link">Admin Requests</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/student" element={<StudentSubscriptionForm />} />
          <Route path="/admin" element={<AdminSubscriptionRequests />} />
          <Route path="/" element={<div className="home-page">Select a Role</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;