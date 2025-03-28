import React, { useState } from 'react';
import { IoMenuOutline } from "react-icons/io5";
import { IoMdArrowDropright } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link } from 'react-router-dom';

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
                    <div className="p-2">
                        <button onClick={() => setIsOpen(!isOpen)} className="bg-transparent border-none text-2xl cursor-pointer mr-2">
                            <IoMenuOutline />
                        </button>
                    </div>
                </>
            }
            {isOpen && 
                <>
                    <div className="w-[250px] h-screen bg-gray-100 border-r-2 border-gray-300 p-2 font-sans">
                        <button onClick={() => setIsOpen(!isOpen)} className="bg-transparent border-none text-2xl cursor-pointer mr-2">
                            <IoMenuOutline />
                        </button>
                        <ul className="list-none pl-5 mt-5">
                            <li>
                                <span className="font-bold text-gray-800 cursor-pointer flex items-center" onClick={() => toggleSection('course')}>
                                    {expandedSections.course ? <IoMdArrowDropdown /> : <IoMdArrowDropright />} Course
                                </span>
                                {expandedSections.course && (
                                    <ul className="pl-5">
                                        <li>
                                            <Link to="/registration" className="text-blue-500 hover:underline">
                                                Registration
                                            </Link>
                                        </li>
                                        <li>
                                            <span className="font-bold text-gray-800 cursor-pointer flex items-center" onClick={() => toggleSection('activeCourses')}>
                                                {expandedSections.activeCourses ? <IoMdArrowDropdown /> : <IoMdArrowDropright />} Active Courses
                                            </span>
                                            {expandedSections.activeCourses && (
                                            <ul className="pl-5">
                                                <li>Assignment</li>
                                                <li>
                                                <Link to="/attendancelanding" className="text-blue-500 hover:underline">
                                                    Attendance
                                                </Link>               
                                                </li>                                 
                                                <li>Drop Course</li>
                                                <li>Announcements</li>
                                                <li>Feedback</li>
                                            </ul>
                                            )}
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li className="mt-2">
                            <span className="font-bold text-gray-800 cursor-pointer flex items-center" onClick={() => toggleSection('document')}>
                                {expandedSections.document ? <IoMdArrowDropdown /> : <IoMdArrowDropright />} Document
                            </span>
                            {expandedSections.document && (
                                <ul className="pl-5">
                                    <li>Transcript</li>
                                    <li>ID</li>
                                    <li>Passport</li>
                                    <li>Bonafide</li>
                                    <li>Fee Receipt</li>
                                </ul>
                            )}
                            </li>
                            <li className="mt-2">
                            <span className="font-bold text-gray-800 cursor-pointer flex items-center" onClick={() => toggleSection('hostel')}>
                                {expandedSections.hostel ? <IoMdArrowDropdown /> : <IoMdArrowDropright />} Hostel
                            </span>
                            {expandedSections.hostel && (
                                <ul className="pl-5">
                                    <li>
                                        <Link to="/hostel/leave" className="text-blue-500 hover:underline">
                                            Leave
                                        </Link>
                                    </li>
                                    <li>Mess</li>
                                    <li>Hostel Transfer</li>
                                </ul>
                            )}
                            </li>
                            <li className="mt-2">
                            <span className="font-bold text-gray-800 cursor-pointer flex items-center" onClick={() => toggleSection('complaint')}>
                                {expandedSections.complaint ? <IoMdArrowDropdown /> : <IoMdArrowDropright />} Complaint
                            </span>
                            {expandedSections.complaint && (
                                <ul className="pl-5">
                                    <li>
                                        <Link to="/complaint" className="text-blue-500 hover:underline">
                                            Complaint Form
                                        </Link>
                                    </li>
                                </ul>
                            )}
                            </li>
                            <li className="mt-2">
                            <span className="font-bold text-gray-800 cursor-pointer flex items-center" onClick={() => toggleSection('profile')}>
                                {expandedSections.profile ? <IoMdArrowDropdown /> : <IoMdArrowDropright />} Profile
                            </span>
                            {expandedSections.profile && (
                                <ul className="pl-5">
                                    <li>View Profile</li>
                                </ul>
                            )}
                            </li>
                        </ul>
                    </div>
                </>
            }
        </>
    );
};

export default Sidebar;