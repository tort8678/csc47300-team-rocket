import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "../../components/header";
import { Library, PartyPopper, Briefcase, Home, Gamepad2, MessageSquare } from 'lucide-react';
import apiService from '../../services/api';
import '../../styles/main.css';
import type { Thread } from '../../types/api.types';
import ThreadItem from '../../components/threadItem';

export default function HomePage() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [stats, setStats] = useState({
        members: 0,
        threads: 0,
        posts: 0
    });
    const [categoryStats, setCategoryStats] = useState<Record<string, { threads: number; posts: number }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Home - DamIt';
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Fetch stats and recent threads in parallel
            const [statsResponse, threadsResponse] = await Promise.all([
                apiService.getPublicStats(),
                apiService.getThreads({ page: 1, limit: 3, sort: 'recent' })
            ]);

            if (statsResponse.success && statsResponse.data) {
                setStats({
                    members: statsResponse.data.members,
                    threads: statsResponse.data.threads,
                    posts: statsResponse.data.posts
                });
                setCategoryStats(statsResponse.data.categories || {});
            }

            if (threadsResponse.success && threadsResponse.data) {
                setThreads(threadsResponse.data);
            }
        } catch (error) {
            console.error('Error loading home page data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryStats = (categoryValue: string) => {
        return categoryStats[categoryValue] || { threads: 0, posts: 0 };
    };

    const getThreadInitials = (author: string | { username: string }) => {
        const username = typeof author === 'string' ? author : author.username;
        return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || username.slice(0, 2).toUpperCase();
    };

    const getTimeAgo = (date: string | Date) => {
        const now = new Date();
        const threadDate = new Date(date);
        const seconds = Math.floor((now.getTime() - threadDate.getTime()) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <div>
            <Header />

            <main className="container">
                <section className="hero">
                    <h2>Welcome to DamIt Forum</h2>
                    <p>Connect with fellow students, share knowledge, and build your university community</p>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">{stats.members.toLocaleString()}</span>
                            <span className="stat-label">Members</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{stats.threads.toLocaleString()}</span>
                            <span className="stat-label">Threads</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{stats.posts.toLocaleString()}</span>
                            <span className="stat-label">Posts</span>
                        </div>
                    </div>
                </section>

                <section className="featured-categories">
                    <h2>Popular Categories</h2>
                    <div className="category-grid">
                        <Link to="/threads?category=academic-help" className="category-card">
                            <Library className="category-icon" size={40} />
                            <h3>Academic Help</h3>
                            <p>Study groups, homework help, and course discussions</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('academic-help').threads} threads</span>
                                <span>{getCategoryStats('academic-help').posts} posts</span>
                            </div>
                        </Link>
                        <Link to="/threads?category=events-activities" className="category-card">
                            <PartyPopper className="category-icon" size={40} />
                            <h3>Events & Activities</h3>
                            <p>Events, clubs, and campus activities</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('events-activities').threads} threads</span>
                                <span>{getCategoryStats('events-activities').posts} posts</span>
                            </div>
                        </Link>
                        <Link to="/threads?category=career-internships" className="category-card">
                            <Briefcase className="category-icon" size={40} />
                            <h3>Career & Internships</h3>
                            <p>Job postings, internships, and career advice</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('career-internships').threads} threads</span>
                                <span>{getCategoryStats('career-internships').posts} posts</span>
                            </div>
                        </Link>
                        <Link to="/threads?category=housing-roommates" className="category-card">
                            <Home className="category-icon" size={40} />
                            <h3>Housing & Roommates</h3>
                            <p>Find roommates and discuss housing options</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('housing-roommates').threads} threads</span>
                                <span>{getCategoryStats('housing-roommates').posts} posts</span>
                            </div>
                        </Link>
                        <Link to="/threads?category=gaming" className="category-card">
                            <Gamepad2 className="category-icon" size={40} />
                            <h3>Gaming</h3>
                            <p>Video games, board games, and gaming meetups</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('gaming').threads} threads</span>
                                <span>{getCategoryStats('gaming').posts} posts</span>
                            </div>
                        </Link>
                        <Link to="/threads?category=general-discussion" className="category-card">
                            <MessageSquare className="category-icon" size={40} />
                            <h3>General Discussion</h3>
                            <p>Random topics and casual conversations</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('general-discussion').threads} threads</span>
                                <span>{getCategoryStats('general-discussion').posts} posts</span>
                            </div>
                        </Link>
                    </div>
                </section>

                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    {loading ? (
                        <div className="empty-message">Loading threads...</div>
                    ) : threads.length === 0 ? (
                        <div className="empty-message">No threads yet. Be the first to post!</div>
                    ) : (
                        <div className="threads-list">
                            {threads.map((thread) => (
                                <ThreadItem
                                key={thread.id}
                                thread={thread}
                                getTimeAgo={getTimeAgo}
                                getThreadInitials={getThreadInitials as (author: string | { username: string } | undefined) => string}
                            />
                            ))}
                        </div>
                    )}
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
