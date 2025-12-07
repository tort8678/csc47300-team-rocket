import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { useModal } from '../contexts/ModalContext';
import type { User } from '../types/api.types';
import '../styles/main.css';

const Header: React.FC = () => {
    const { showModal } = useModal();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        // Check if user is admin
        if (token) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user: User = JSON.parse(userStr);
                    setIsAdmin(user.role === 'admin');
                } catch (e) {
                    // If parsing fails, try to fetch user from API
                    apiService.getCurrentUser().then(response => {
                        if (response.success && response.data) {
                            setIsAdmin(response.data.role === 'admin');
                        }
                    }).catch(() => {
                        setIsAdmin(false);
                    });
                }
            } else {
                // Fetch user from API if not in localStorage
                apiService.getCurrentUser().then(response => {
                    if (response.success && response.data) {
                        setIsAdmin(response.data.role === 'admin');
                    }
                }).catch(() => {
                    setIsAdmin(false);
                });
            }
        } else {
            setIsAdmin(false);
        }
    }, [location]);

    const handleLogout = () => {
        apiService.logout();
        setIsLoggedIn(false);
        showModal('You have been logged out.', 'info');
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
                        {isLoggedIn && isAdmin && (
                            <li>
                                <Link
                                    to="/admin"
                                    className={location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'active' : ''}
                                >
                                    Admin
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
