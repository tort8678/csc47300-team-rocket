import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header";
import Footer from "../../components/footer";
import '../../styles/main.css';
import '../../styles/profile.css';
import type { User } from '../../types/types';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const loggedInUsername = localStorage.getItem('loggedInUser');
        if (!loggedInUsername) {
            alert('Please log in to view your profile.');
            navigate('/login');
            return;
        }

        // Get user data from localStorage
        const userData = localStorage.getItem(loggedInUsername);
        if (userData) {
            const parsedUser = JSON.parse(userData) as User;
            setUser(parsedUser);
        }
    }, [navigate]);

    if (!user) {
        return null; // or a loading spinner
    }

    // Get user initials for avatar
    const initials = user.username
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Format date
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    return (
        <div>
            <Header />
            <main className="container">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-banner"></div>
                        <div className="profile-info">
                            <div className="profile-avatar-large" id="profile-avatar">{initials}</div>
                            <div className="profile-details">
                                <h1 id="profile-username">{user.username}</h1>
                                <p className="user-title">Computer Science Student</p>
                                <p className="join-date">Member since {joinDate}</p>
                            </div>
                            <button className="edit-profile-btn">Edit Profile</button>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-sidebar">
                            <div className="stats-card">
                                <h3>Statistics</h3>
                                <div className="stat-row"><span className="stat-label">Total Posts</span><span className="stat-value">234</span></div>
                                <div className="stat-row"><span className="stat-label">Threads Started</span><span className="stat-value">45</span></div>
                                <div className="stat-row"><span className="stat-label">Likes Received</span><span className="stat-value">892</span></div>
                                <div className="stat-row"><span className="stat-label">Reputation</span><span className="stat-value">1,247</span></div>
                            </div>

                            <div className="about-card">
                                <h3>About</h3>
                                <p>CS major passionate about web development and AI. Always looking to collaborate on projects!</p>
                                <div className="about-details">
                                    <div className="detail-item"><span className="detail-icon icon-graduation-cap"></span><span>Computer Science</span></div>
                                    <div className="detail-item"><span className="detail-icon icon-calendar"></span><span>className of 2026</span></div>
                                    <div className="detail-item"><span className="detail-icon icon-map-pin"></span><span>Campus Housing</span></div>
                                </div>
                            </div>

                            <div className="badges-card">
                                <h3>Badges</h3>
                                <div className="badges-grid">
                                    <div className="badge icon-crown" title="100 Posts"></div>
                                    <div className="badge icon-star" title="Active Member"></div>
                                    <div className="badge icon-heart-handshake" title="Helpful"></div>
                                    <div className="badge icon-rocket" title="Early Adopter"></div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-main">
                            <div className="activity-tabs">
                                <button className="tab-btn active">Recent Posts</button>
                                <button className="tab-btn">Threads</button>
                                <button className="tab-btn">Saved</button>
                            </div>

                            <div className="activity-content">
                                <div className="activity-item">
                                    <div className="activity-body">
                                        <div className="activity-header">
                                            <span className="activity-type">Posted in</span>
                                            <span className="activity-category">Academic Help</span>
                                            <span className="activity-time">5 minutes ago</span>
                                        </div>
                                        <a href="thread.html" className="thread-link">Best study spots on campus?</a>
                                        <p>Hey everyone! Finals are coming up and I'm looking for some good study spots on
                                            campus...</p>
                                        <div className="activity-footer"><span className="activity-stats">12 likes • 8 replies</span></div>
                                    </div>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-body">
                                        <div className="activity-header">
                                            <span className="activity-type">Replied to</span>
                                            <span className="activity-category">Course Reviews</span>
                                            <span className="activity-time">2 hours ago</span>
                                        </div>
                                        <a href="#" className="thread-link">CS 201 with Prof. Smith?</a>
                                        <p>I had Prof. Smith last semester - great professor!</p>
                                        <div className="activity-footer"><span className="activity-stats">15 likes • 3 replies</span></div>
                                    </div>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-body">
                                        <div className="activity-header">
                                            <span className="activity-type">Started thread in </span>
                                            <span className="activity-category">Research &amp; Projects</span>
                                            <span className="activity-time">1 day ago</span>
                                        </div>
                                        <a href="#" className="thread-link">Looking for project partners - Web Dev</a>
                                        <p>Anyone interested in building a full-stack web application for a className project?</p>
                                        <div className="activity-footer"><span className="activity-stats">8 likes • 12 replies</span></div>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-body">
                                        <div className="activity-header"><span className="activity-type">Replied to</span> <span
                                            className="activity-category">General Discussion</span> <span className="activity-time">3 days ago</span>
                                        </div>
                                        <a href="#" className="thread-link">Best coffee shops near campus?</a>
                                        <p>Java Junction on Main Street is my go-to spot. Great coffee, free WiFi, and plenty of
                                            seating. Perfect for studying!</p>
                                        <div className="activity-footer"><span className="activity-stats">10 likes • 4 replies</span></div>
                                    </div>
                                </div>
                            </div>


                            <div className="load-more">
                                <button className="load-more-btn">Load More Activity</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}