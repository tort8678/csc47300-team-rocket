import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import apiService from "../../services/api";
import '../../styles/main.css';
import '../../styles/login.css';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Login - DamIt';
        const token = localStorage.getItem('token');
        if (token) {
            // User is already logged in
            navigate("/");
        }
    }, [navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await apiService.login({
                username: formData.username,
                password: formData.password
            });

            if (response.success) {
                navigate("/");
            } else {
                setError(response.message || 'Login failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <Header />
            <main className="container auth-wrap">
                <section className="auth-card">
                    <div>
                        <h2>Welcome back</h2>
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

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <label htmlFor="username">Username</label>
                            <input 
                                id="username" 
                                name="username" 
                                type="text" 
                                placeholder="e.g., ccnystudent" 
                                required 
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={loading}
                            />

                            <label htmlFor="password">Password</label>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={loading}
                            />

                            <div className="auth-actions">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-block"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                                <span className="muted">
                                    No account? {' '}
                                    <Link 
                                        to="/register" 
                                        style={{ color: "var(--accent-color)" }}
                                    >
                                        Create one
                                    </Link>
                                </span>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
