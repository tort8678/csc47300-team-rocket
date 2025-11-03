import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import '../../styles/main.css';
import '../../styles/login.css';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            alert('You are already logged in.');
            navigate("/");
        }
    }, [navigate]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            // Check if user exists
            const user = localStorage.getItem(formData.username);
            if (!user) {
                alert('User not found.');
                return;
            }

            const userData = JSON.parse(user);
            // Check password
            if (userData.password !== formData.password) {
                alert('Incorrect password.');
                return;
            }

            // Login successful
            localStorage.setItem('loggedInUser', formData.username);
            alert('Login successful!');
            navigate("/");
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
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
                            />

                            <div className="auth-actions">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-block"
                                >
                                    Sign In
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


