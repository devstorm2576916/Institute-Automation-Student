import React, { useState } from 'react';
import { IoMenuOutline } from "react-icons/io5";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        course: false,
        activeCourses: false,
        document: false,
        hostel: false,
        complaint: false,
        profile: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <>
            {!isOpen && 
                <>
                    <div style={{padding: '10px'}}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                marginRight: '10px',
                            }}
                        >
                            <IoMenuOutline />
                        </button>
                    </div>
                </>
            }
            {isOpen && 
                <>
                    <div
                        style={{
                            width: '250px',
                            height: '100vh',
                            backgroundColor: '#f5f5f5',
                            borderRight: '2px solid #ccc',
                            padding: '10px',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                marginRight: '10px',
                            }}
                        >
                            <IoMenuOutline />
                        </button>
                        <ul style={{ listStyleType: 'none', paddingLeft: '20px', marginTop: '20px' }}>
                            <li>
                                <span 
                                    style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                                    onClick={() => toggleSection('course')}
                                >
                                    {expandedSections.course ? '▼' : '▶'} Course
                                </span>
                                {expandedSections.course && (
                                    <ul style={{ paddingLeft: '20px' }}>
                                        <li>Registration</li>
                                        <li className="list-unstyled">
                                            <span 
                                                style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                                                onClick={() => toggleSection('activeCourses')}
                                            >
                                                {expandedSections.activeCourses ? '▼' : '▶'} Active Courses
                                            </span>
                                            {expandedSections.activeCourses && (
                                                <ul style={{ paddingLeft: '20px' }}>
                                                    <li>Assignment</li>
                                                    <li>Attendance</li>
                                                    <li>Drop Course</li>
                                                    <li>Announcements</li>
                                                    <li>Feedback</li>
                                                </ul>
                                            )}
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li style={{ marginTop: '10px' }}>
                                <span 
                                    style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                                    onClick={() => toggleSection('document')}
                                >
                                    {expandedSections.document ? '▼' : '▶'} Document
                                </span>
                                {expandedSections.document && (
                                    <ul style={{ paddingLeft: '20px' }}>
                                        <li>Transcript</li>
                                        <li>ID</li>
                                        <li>Passport</li>
                                        <li>Bonafide</li>
                                        <li>Fee Receipt</li>
                                    </ul>
                                )}
                            </li>
                            <li style={{ marginTop: '10px' }}>
                                <span 
                                    style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                                    onClick={() => toggleSection('hostel')}
                                >
                                    {expandedSections.hostel ? '▼' : '▶'} Hostel
                                </span>
                                {expandedSections.hostel && (
                                    <ul style={{ paddingLeft: '20px' }}>
                                        <li>Leave</li>
                                        <li>Mess</li>
                                        <li>Hostel Transfer</li>
                                    </ul>
                                )}
                            </li>
                            <li style={{ marginTop: '10px' }}>
                                <span 
                                    style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                                    onClick={() => toggleSection('complaint')}
                                >
                                    {expandedSections.complaint ? '▼' : '▶'} Complaint
                                </span>
                            </li>
                            <li style={{ marginTop: '10px' }}>
                                <span 
                                    style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                                    onClick={() => toggleSection('profile')}
                                >
                                    {expandedSections.profile ? '▼' : '▶'} Profile
                                </span>
                            </li>
                        </ul>
                    </div>
                </>
            }
        </>
    );
};

export default Sidebar;