import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Navbar({ isLoggedIn, setIsLoggedIn, navVisible, setnavVisible}) {
    const navigate = useNavigate();

    function LogoutHandler() {
        setIsLoggedIn(false);
        setnavVisible(false);
        toast.error("Logged Out");
        localStorage.removeItem("isLoggedIn");
        navigate("/login"); // Redirect to login page on logout
    }

    return (
        <div className='flex flex-col md:flex-row gap-8 justify-between items-center w-11/12 max-w-[1160px] py-4 mx-auto'>
            { (navVisible &&
                <>
                    <nav>
                        <ul className='text-white flex gap-x-6'>
                            {/* <li>
                                <Link to="/">Home</Link>
                            </li> */}
                            <li>
                                <Link to="/Dashboard">Dashboard</Link>
                            </li>
                            {/* <li>
                                <Link to="/application/:appName">Applications</Link>
                            </li> */}
                            <li>
                                <Link to="/EndpointManagement">Endpoints</Link>
                            </li>
                            <li>
                                <Link to="/PolicyPage">Policy</Link>
                            </li>
                            <li>
                                <Link to="/DPI_page">DPI</Link>
                            </li>
                        </ul>
                    </nav>

                    <div className='flex items-center gap-x-4'>
                        <button
                            onClick={LogoutHandler}
                            className='bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-700'>
                            Log Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Navbar;
