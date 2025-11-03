import Header from "../../components/header";
import '../../styles/main.css';


export default function Home() {
    return (
        <div>
            <Header />

            <main className="container">
                <section className="hero">
                    <h2>Welcome to DamIt Forum</h2>
                    <p>Connect with fellow students, share knowledge, and build your university community</p>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">15,234</span>
                            <span className="stat-label">Members</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">45,892</span>
                            <span className="stat-label">Threads</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">328,451</span>
                            <span className="stat-label">Posts</span>
                        </div>
                    </div>
                </section>

                <section className="featured-categories">
                    <h2>Popular Categories</h2>
                    <div className="category-grid">
                        <div className="category-card">
                            <div className="category-icon icon-library"></div>
                            <h3>Academic Help</h3>
                            <p>Study groups, homework help, and course discussions</p>
                            <div className="category-meta">
                                <span>2,345 threads</span>
                                <span>12,890 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-icon icon-party-popper"></div>
                            <h3>Campus Life</h3>
                            <p>Events, clubs, and campus activities</p>
                            <div className="category-meta">
                                <span>1,823 threads</span>
                                <span>8,432 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-icon icon-briefcase-business"></div>
                            <h3>Career &amp; Internships</h3>
                            <p>Job postings, internships, and career advice</p>
                            <div className="category-meta">
                                <span>956 threads</span>
                                <span>4,321 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-icon icon-house"></div>
                            <h3>Housing &amp; Roommates</h3>
                            <p>Find roommates and discuss housing options</p>
                            <div className="category-meta">
                                <span>678 threads</span>
                                <span>3,211 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-icon icon-gamepad-2"></div>
                            <h3>Entertainment</h3>
                            <p>Gaming, movies, music, and hobbies</p>
                            <div className="category-meta">
                                <span>1,445 threads</span>
                                <span>9,876 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-icon icon-message-square"></div>
                            <h3>General Discussion</h3>
                            <p>Random topics and casual conversations</p>
                            <div className="category-meta">
                                <span>3,289 threads</span>
                                <span>18,765 posts</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-avatar">JD</div>
                            <div className="activity-content">
                                <h4><a href="thread.html">Best study spots on campus?</a></h4>
                                <p>Posted by <strong>john_doe</strong> in <a href="#" className="activity-category">Academic Help</a>
                                </p>
                                <span className="activity-time">5 minutes ago</span>
                            </div>
                            <div className="activity-stats">
                                <span>12 replies</span>
                                <span>45 views</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-avatar">SM</div>
                            <div className="activity-content">
                                <h4><a href="thread.html">Spring Break Trip Planning</a></h4>
                                <p>Posted by <strong>sarah_m</strong> in <a href="#" className="activity-category">Campus Life</a></p>
                                <span className="activity-time">23 minutes ago</span>
                            </div>
                            <div className="activity-stats">
                                <span>8 replies</span>
                                <span>67 views</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-avatar">AK</div>
                            <div className="activity-content">
                                <h4><a href="thread.html">Summer Internship Opportunities</a></h4>
                                <p>Posted by <strong>alex_kim</strong> in <a href="#" className="activity-category">Career &amp;
                                    Internships</a></p>
                                <span className="activity-time">1 hour ago</span>
                            </div>
                            <div className="activity-stats">
                                <span>15 replies</span>
                                <span>123 views</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>DamIt Forum</h3>
                            <p>Your university community hub</p>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Guidelines</a></li>
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2025 DamIt Forum. All rights reserved.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}