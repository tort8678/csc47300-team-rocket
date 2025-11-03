import { useEffect, useState } from 'react';
import Header from "../../components/header";
import { Library, PartyPopper, Briefcase, Home, Gamepad2, MessageSquare, Eye } from 'lucide-react';
import '../../styles/main.css';
import type { Thread } from '../../types/types';

export default function HomePage() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [stats, setStats] = useState({
        members: 0,
        threads: 0,
        posts: 0
    });
    const [categoryStats, setCategoryStats] = useState<Record<string, { threads: number; posts: number }>>({});

    const categoryMapping: Record<string, { label: string; description: string }> = {
        "academic-help": {
            label: "Academic Help",
            description: "Study groups, homework help, and course discussions"
        },
        "events-activities": {
            label: "Campus Life",
            description: "Events, clubs, and campus activities"
        },
        "career-internships": {
            label: "Career & Internships",
            description: "Job postings, internships, and career advice"
        },
        "housing-roommates": {
            label: "Housing & Roommates",
            description: "Find roommates and discuss housing options"
        },
        "gaming": {
            label: "Entertainment",
            description: "Gaming, movies, music, and hobbies"
        },
        "general-discussion": {
            label: "General Discussion",
            description: "Random topics and casual conversations"
        }
    };

    useEffect(() => {
        // Load threads from localStorage
        const loaded: Thread[] = [];
        let totalUsers = 0;
        const userSet = new Set<string>();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            if (key.startsWith('thread_')) {
                try {
                    const t = JSON.parse(localStorage.getItem(key) as string) as Thread;
                    if (t) {
                        loaded.push(t);
                        if (t.author) userSet.add(t.author);
                    }
                } catch (e) {
                    // ignore malformed entries
                }
            } else if (!key.startsWith('thread_') && !key.startsWith('loggedInUser') && key !== 'null') {
                // Count unique users (non-thread keys that are user data)
                totalUsers++;
            }
        }

        // Sort by most recent
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Calculate total posts (threads + replies)
        const totalPosts = loaded.reduce((sum, thread) => sum + 1 + (thread.replies || 0), 0);

        // Calculate category stats using category values
        const catStats: Record<string, { threads: number; posts: number }> = {};
        loaded.forEach(thread => {
            const cat = thread.category || 'general-discussion';
            if (!catStats[cat]) {
                catStats[cat] = { threads: 0, posts: 0 };
            }
            catStats[cat].threads++;
            catStats[cat].posts += 1 + (thread.replies || 0);
        });

        setThreads(loaded.slice(0, 3)); // Only show 3 most recent
        setStats({
            members: Math.max(userSet.size, totalUsers),
            threads: loaded.length,
            posts: totalPosts
        });
        setCategoryStats(catStats);
    }, []);

    const getCategoryStats = (categoryValue: string) => {
        return categoryStats[categoryValue] || { threads: 0, posts: 0 };
    };

    const getCategoryLabel = (categoryValue: string) => {
        return categoryMapping[categoryValue]?.label || categoryValue;
    };

    const getThreadInitials = (author: string) => {
        return author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || author.slice(0, 2).toUpperCase();
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
                        <div className="category-card">
                            <Library className="category-icon" size={40} />
                            <h3>Academic Help</h3>
                            <p>Study groups, homework help, and course discussions</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('academic-help').threads} threads</span>
                                <span>{getCategoryStats('academic-help').posts} posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <PartyPopper className="category-icon" size={40} />
                            <h3>Campus Life</h3>
                            <p>Events, clubs, and campus activities</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('events-activities').threads} threads</span>
                                <span>{getCategoryStats('events-activities').posts} posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <Briefcase className="category-icon" size={40} />
                            <h3>Career & Internships</h3>
                            <p>Job postings, internships, and career advice</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('career-internships').threads} threads</span>
                                <span>{getCategoryStats('career-internships').posts} posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <Home className="category-icon" size={40} />
                            <h3>Housing & Roommates</h3>
                            <p>Find roommates and discuss housing options</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('housing-roommates').threads} threads</span>
                                <span>{getCategoryStats('housing-roommates').posts} posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <Gamepad2 className="category-icon" size={40} />
                            <h3>Entertainment</h3>
                            <p>Gaming, movies, music, and hobbies</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('gaming').threads} threads</span>
                                <span>{getCategoryStats('gaming').posts} posts</span>
                            </div>
                        </div>
                        <div className="category-card">
                            <MessageSquare className="category-icon" size={40} />
                            <h3>General Discussion</h3>
                            <p>Random topics and casual conversations</p>
                            <div className="category-meta">
                                <span>{getCategoryStats('general-discussion').threads} threads</span>
                                <span>{getCategoryStats('general-discussion').posts} posts</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    {threads.length === 0 ? (
                        <div className="empty-message">No threads yet. Be the first to post!</div>
                    ) : (
                        <div className="threads-list">
                            {threads.map((thread) => (
                                <div key={thread.id} className="thread-item">
                                    <div className="thread-main">
                                        <div className="thread-avatar">{getThreadInitials(thread.author || 'Anonymous')}</div>
                                        <div className="thread-content">
                                            <h3>
                                                <a href={`/thread/${encodeURIComponent(thread.id)}`}>{thread.title}</a>
                                            </h3>
                                            <p className="thread-preview">{thread.content.substring(0, 150)}{thread.content.length > 150 ? '...' : ''}</p>
                                            <div className="thread-meta">
                                                <span className="thread-author">{thread.author || 'Anonymous'}</span>
                                                <span className="thread-category">{getCategoryLabel(thread.category)}</span>
                                                <span className="thread-time">{getTimeAgo(thread.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="thread-stats">
                                        <div className="stat">
                                            <MessageSquare size={20} />
                                            <span className="stat-count">{thread.replies || 0}</span>
                                        </div>
                                        <div className="stat">
                                            <Eye size={20} />
                                            <span className="stat-count">{thread.views || 0}</span>
                                        </div>
                                    </div>
                                </div>
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