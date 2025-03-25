import React, { useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import iitglogo from '../assets/iitglogo.jpg';

const Navbar = () => {
    return (
        <>
        <nav class="navbar bg-body-tertiary">
            <div class="container-fluid">
                <img src={iitglogo} alt="Logo" height="90" class="d-inline-block align-text-top"/>
                <h3>Institute Automation</h3>
                <button type="button" class="btn btn-outline-success me-4">Logout</button>
            </div>
            </nav>
        </>
    );
};

export default Navbar;