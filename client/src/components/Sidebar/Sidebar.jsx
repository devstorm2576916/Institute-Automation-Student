import React, { useContext, useState } from 'react';
import { IoMenuOutline } from "react-icons/io5";
import Student from './Student';
import Faculty from './Faculty';
import AcadAdmin from './AcadAdmin';
import HostelAdmin from './HostelAdmin';
import { RoleContext } from '../../context/Rolecontext';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { role } = useContext(RoleContext);
    // console.log(role)
    return (
        <>
            {/* Hamburger Menu */}
            {!isOpen && (
                <div className="relative p-2">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="text-3xl text-gray-700 hover:text-green-600 transition-colors duration-300"
                    >
                        <IoMenuOutline />
                    </button>
                </div>
            )}

            {/* Sidebar */}
            {isOpen && (
                <div className="relative top-0 left-0 w-[250px] min-h-screen bg-white shadow-2xl p-6 transition-transform duration-300 mr-2">
                    {/* Close Menu */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-3xl text-gray-700 hover:text-green-600 transition-colors duration-300"
                        >
                            <IoMenuOutline />
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="space-y-6">
                        {role === "student" && <Student />}
                        {role === "faculty" && <Faculty />}
                        {role === "acadAdmin" && <AcadAdmin />}
                        {role === "nonAcadAdmin" && <HostelAdmin />}
                    </div>
                </div>
            )}
        </>

    );
};

export default Sidebar;