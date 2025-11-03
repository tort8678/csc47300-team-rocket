import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/main.css';

const Header: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        setIsLoggedIn(!!loggedInUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        setIsLoggedIn(false);
        alert('You have been logged out.');
        navigate('/login');
    };

    return (
        <header>
            <div className="container">
                <div className="logo">
                    <h1>DamIt</h1>
                </div>
                <nav>
                    <ul>
                        <li>
                            <Link
                                to="/"
                                className={location.pathname === '/' ? 'active' : ''}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/categories"
                                className={location.pathname === '/categories' ? 'active' : ''}
                            >
                                Categories
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/threads"
                                className={location.pathname === '/threads' ? 'active' : ''}
                            >
                                Recent Threads
                            </Link>
                        </li>
                        {isLoggedIn && (
                            <li>
                                <Link
                                    to="/profile"
                                    className={location.pathname === '/profile' ? 'active' : ''}
                                >
                                    Profile
                                </Link>
                            </li>
                        )}
                        {!isLoggedIn && (
                            <li>
                                <Link
                                    to="/login"
                                    className={location.pathname === '/login' ? 'active' : ''}
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                        {isLoggedIn && (
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                >
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
