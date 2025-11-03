import type { User } from "../../types/types";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import '../../styles/login.css';
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Register() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<Omit<User, 'id' | 'createdAt'>>({
        email: '',
        username: '',
        EMPLID: 0,
        password: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');

    function createUser(e: FormEvent) {
        e.preventDefault();
        
        if (userInfo.password !== confirmPassword || userInfo.password.length < 1) {
            alert('Passwords do not match or are empty.');
            return;
        }

        const newUser: User = {
            ...userInfo,
            id: 'placeholder',
            createdAt: new Date()
        };

        localStorage.setItem(userInfo.username, JSON.stringify(newUser));
        alert('Account created successfully!');
        console.log("user created successfully");
        navigate('/login');
    }


    return (
        <div>
            <Header />
            <main className="container auth-wrap">
                <section className="auth-card">
                    <h2>Create a new account</h2>
                    <p className="muted">Sign in to start posting and join discussions.</p>

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
                        />

                        <label htmlFor="emplid">EMPLID</label>
                        <input 
                            id="emplid" 
                            name="emplid" 
                            type="number" 
                            placeholder="e.g. 12345678" 
                            required 
                            value={userInfo.EMPLID || ''}
                            onChange={(e) => setUserInfo({...userInfo, EMPLID: parseInt(e.target.value) || 0})}
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
                        />

                        <div className="auth-actions">
                            <button type="submit" className="btn btn-primary btn-full">Sign Up</button>
                        </div>
                    </form>
                </section>
            </main>
            <Footer />
        </div>
    )
}