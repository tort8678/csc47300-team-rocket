import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from 'react-router-dom';
import apiService from "../../services/api";
import { useModal } from "../../contexts/ModalContext";
import '../../styles/main.css';
import '../../styles/login.css';
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Register() {
    const { showModal } = useModal();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        email: '',
        username: '',
        EMPLID: 0,
        password: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Register - DamIt';
    }, []);

    async function createUser(e: FormEvent) {
        e.preventDefault();
        setError(null);
        
        if (userInfo.password !== confirmPassword || userInfo.password.length < 1) {
            setError('Passwords do not match.');
            setUserInfo({...userInfo, password: ''});
            setConfirmPassword('');
            return;
        }

        if (userInfo.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        
        try {
            const response = await apiService.register({
                username: userInfo.username,
                email: userInfo.email,
                password: userInfo.password,
                EMPLID: userInfo.EMPLID || undefined
            });

            if (response.success) {
                showModal('Account created successfully!', 'success');
                navigate('/login');
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Header />
            <main className="container auth-wrap">
                <section className="auth-card">
                    <h2>Create a new account</h2>
                    <p className="muted">Sign in to start posting and join discussions.</p>

                    {error && (
                        <div style={{ 
                            padding: '0.75rem', 
                            background: 'rgba(255, 0, 0, 0.1)', 
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            color: '#ff6b6b'
                        }}>
                            {error}
                        </div>
                    )}

                    <form className="auth-form" id="loginForm" onSubmit={createUser}>
                        <label htmlFor="email">Email Address</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="e.g. Initial.last###@citymail.cuny.edu" 
                            required 
                            value={userInfo.email}
                            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                            disabled={loading}
                        />

                        <label htmlFor="username">Username</label>
                        <input 
                            id="username" 
                            name="username" 
                            type="text" 
                            placeholder="e.g. johndoe" 
                            required 
                            value={userInfo.username}
                            onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                            disabled={loading}
                        />

                        <label htmlFor="emplid">EMPLID</label>
                        <input 
                            id="emplid" 
                            name="emplid" 
                            type="number" 
                            placeholder="e.g. 12345678" 
                            value={userInfo.EMPLID || ''}
                            onChange={(e) => setUserInfo({...userInfo, EMPLID: parseInt(e.target.value) || 0})}
                            disabled={loading}
                        />

                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            value={userInfo.password}
                            onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
                            disabled={loading}
                        />

                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />

                        <div className="auth-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-full"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
            <Footer />
        </div>
    )
}
