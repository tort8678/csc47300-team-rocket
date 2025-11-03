import Header from "../../components/header";
import { Library, PartyPopper, Briefcase, Home, Gamepad2, MessageSquare, Eye } from 'lucide-react';
import '../../styles/main.css';


export default function HomePage() {
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
                            <Library className="category-icon" size={40} />
                            <h3>Academic Help</h3>
                            <p>Study groups, homework help, and course discussions</p>
                            <div className="category-meta">
                                <span>2,345 threads</span>
                                <span>12,890 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <PartyPopper className="category-icon" size={40} />
                            <h3>Campus Life</h3>
                            <p>Events, clubs, and campus activities</p>
                            <div className="category-meta">
                                <span>1,823 threads</span>
                                <span>8,432 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <Briefcase className="category-icon" size={40} />
                            <h3>Career &amp; Internships</h3>
                            <p>Job postings, internships, and career advice</p>
                            <div className="category-meta">
                                <span>956 threads</span>
                                <span>4,321 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <Home className="category-icon" size={40} />
                            <h3>Housing &amp; Roommates</h3>
                            <p>Find roommates and discuss housing options</p>
                            <div className="category-meta">
                                <span>678 threads</span>
                                <span>3,211 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <Gamepad2 className="category-icon" size={40} />
                            <h3>Entertainment</h3>
                            <p>Gaming, movies, music, and hobbies</p>
                            <div className="category-meta">
                                <span>1,445 threads</span>
                                <span>9,876 posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <MessageSquare className="category-icon" size={40} />
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
                    <div className="threads-list">
                        <div className="thread-item">
                            <div className="thread-main">
                                <div className="thread-avatar">JD</div>
                                <div className="thread-content">
                                    <h3>
                                        <a href="thread.html">Best study spots on campus?</a>
                                    </h3>
                                    <p className="thread-preview">Hey everyone! Finals are coming up and I'm looking for some good study spots on campus. Any recommendations for quiet places?</p>
                                    <div className="thread-meta">
                                        <span className="thread-author">john_doe</span>
                                        <span className="thread-category">Academic Help</span>
                                        <span className="thread-time">5 minutes ago</span>
                                    </div>
                                </div>
                            </div>
                            <div className="thread-stats">
                                <div className="stat">
                                    <MessageSquare size={20} />
                                    <span className="stat-count">12</span>
                                </div>
                                <div className="stat">
                                    <Eye size={20} />
                                    <span className="stat-count">45</span>
                                </div>
                            </div>
                        </div>

                        <div className="thread-item">
                            <div className="thread-main">
                                <div className="thread-avatar">SM</div>
                                <div className="thread-content">
                                    <h3>
                                        <a href="thread.html">Spring Break Trip Planning</a>
                                    </h3>
                                    <p className="thread-preview">Looking to organize a spring break trip with some friends. Where did you go last year? Any budget-friendly recommendations?</p>
                                    <div className="thread-meta">
                                        <span className="thread-author">sarah_m</span>
                                        <span className="thread-category">Campus Life</span>
                                        <span className="thread-time">23 minutes ago</span>
                                    </div>
                                </div>
                            </div>
                            <div className="thread-stats">
                                <div className="stat">
                                    <MessageSquare size={20} />
                                    <span className="stat-count">8</span>
                                </div>
                                <div className="stat">
                                    <Eye size={20} />
                                    <span className="stat-count">67</span>
                                </div>
                            </div>
                        </div>

                        <div className="thread-item">
                            <div className="thread-main">
                                <div className="thread-avatar">AK</div>
                                <div className="thread-content">
                                    <h3>
                                        <a href="thread.html">Summer Internship Opportunities</a>
                                    </h3>
                                    <p className="thread-preview">Has anyone started applying for summer internships yet? I'd love to hear about your experiences and any tips for the application process.</p>
                                    <div className="thread-meta">
                                        <span className="thread-author">alex_kim</span>
                                        <span className="thread-category">Career &amp; Internships</span>
                                        <span className="thread-time">1 hour ago</span>
                                    </div>
                                </div>
                            </div>
                            <div className="thread-stats">
                                <div className="stat">
                                    <MessageSquare size={20} />
                                    <span className="stat-count">15</span>
                                </div>
                                <div className="stat">
                                    <Eye size={20} />
                                    <span className="stat-count">123</span>
                                </div>
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