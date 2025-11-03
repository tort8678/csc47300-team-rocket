import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Calendar, MapPin, Crown, Star, HeartHandshake, Rocket, MessageSquare, Eye } from 'lucide-react';
import Header from "../../components/header";
import Footer from "../../components/footer";
import '../../styles/main.css';
import '../../styles/profile.css';
import type { User, Thread } from '../../types/types';

interface UserProfile extends User {
    bio?: string;
    major?: string;
    classYear?: string;
    location?: string;
}

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [userThreads, setUserThreads] = useState<Thread[]>([]);
    const [displayedThreads, setDisplayedThreads] = useState<Thread[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        major: '',
        classYear: '',
        location: ''
    });

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
            const parsedUser = JSON.parse(userData) as UserProfile;
            setUser(parsedUser);
            setEditForm({
                bio: parsedUser.bio || '',
                major: parsedUser.major || '',
                classYear: parsedUser.classYear || '',
                location: parsedUser.location || ''
            });
        }

        // Load user's threads
        const threads: Thread[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('thread_')) {
                try {
                    const t = JSON.parse(localStorage.getItem(key) as string) as Thread;
                    if (t && t.author === loggedInUsername) {
                        threads.push(t);
                    }
                } catch (e) {
                    // ignore malformed entries
                }
            }
        }
        threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserThreads(threads);

        // Initially display only 5 threads
        setDisplayedThreads(threads.slice(0, 5));
    }, [navigate]);

    const handleLoadMore = () => {
        // Load all remaining threads
        setDisplayedThreads([...userThreads]);
    };

    const handleSaveProfile = () => {
        if (!user) return;

        const updatedUser: UserProfile = {
            ...user,
            bio: editForm.bio,
            major: editForm.major,
            classYear: editForm.classYear,
            location: editForm.location
        };

        localStorage.setItem(user.username, JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        if (user) {
            setEditForm({
                bio: user.bio || '',
                major: user.major || '',
                classYear: user.classYear || '',
                location: user.location || ''
            });
        }
        setIsEditing(false);
    };

    if (!user) {
        return null;
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

    // Calculate stats
    const totalThreads = userThreads.length;
    const totalPosts = userThreads.reduce((sum, t) => sum + 1 + (t.replies || 0), 0);
    const totalViews = userThreads.reduce((sum, t) => sum + (t.views || 0), 0);

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

    const getCategoryLabel = (categoryValue: string) => {
        const mapping: Record<string, string> = {
            "academic-help": "Academic Help",
            "course-reviews": "Course Reviews",
            "research-projects": "Research & Projects",
            "events-activities": "Events & Activities",
            "clubs-organizations": "Clubs & Organizations",
            "sports-fitness": "Sports & Fitness",
            "career-internships": "Career & Internships",
            "housing-roommates": "Housing & Roommates",
            "buy-sell": "Buy & Sell",
            "gaming": "Gaming",
            "movies-tv": "Movies & TV",
            "music": "Music",
            "general-discussion": "General Discussion",
            "announcements": "Announcements"
        };
        return mapping[categoryValue] || categoryValue;
    };

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
                                <p className="user-title">{user.major || 'Student'}</p>
                                <p className="join-date">Member since {joinDate}</p>
                            </div>
                            <button
                                className="edit-profile-btn"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-sidebar">
                            <div className="stats-card">
                                <h3>Statistics</h3>
                                <div className="stat-row">
                                    <span className="stat-label">Total Posts</span>
                                    <span className="stat-value">{totalPosts}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Threads Started</span>
                                    <span className="stat-value">{totalThreads}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Total Views</span>
                                    <span className="stat-value">{totalViews}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Reputation</span>
                                    <span className="stat-value">0</span>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="about-card">
                                    <h3>Edit Profile</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="form-group">
                                            <label>Bio</label>
                                            <textarea
                                                value={editForm.bio}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Major</label>
                                            <input
                                                type="text"
                                                value={editForm.major}
                                                onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                                                placeholder="e.g., Computer Science"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Class Year</label>
                                            <input
                                                type="text"
                                                value={editForm.classYear}
                                                onChange={(e) => setEditForm({ ...editForm, classYear: e.target.value })}
                                                placeholder="e.g., Class of 2026"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                placeholder="e.g., Campus Housing"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="btn btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                className="btn btn-primary"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )  : (
                                <div className="about-card">
                                    <h3>About</h3>
                                    <p>{user.bio || 'No bio added yet. Click "Edit Profile" to add one!'}</p>
                                    <div className="about-details">
                                        {user.major && (
                                            <div className="detail-item">
                                                <GraduationCap className="detail-icon" size={20} />
                                                <span>{user.major}</span>
                                            </div>
                                        )}
                                        {user.classYear && (
                                            <div className="detail-item">
                                                <Calendar className="detail-icon" size={20} />
                                                <span>{user.classYear}</span>
                                            </div>
                                        )}
                                        {user.location && (
                                            <div className="detail-item">
                                                <MapPin className="detail-icon" size={20} />
                                                <span>{user.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="badges-card">
                                <h3>Badges</h3>
                                <div className="badges-grid">
                                    {totalThreads >= 10 && (
                                        <div className="badge" title="10+ Threads">
                                            <Crown size={40} />
                                        </div>
                                    )}
                                    {totalThreads >= 1 && (
                                        <div className="badge" title="Active Member">
                                            <Star size={40} />
                                        </div>
                                    )}
                                    {totalPosts >= 5 && (
                                        <div className="badge" title="Helpful">
                                            <HeartHandshake size={40} />
                                        </div>
                                    )}
                                    <div className="badge" title="Early Adopter">
                                        <Rocket size={40} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-main">
                            <div className="activity-tabs">
                                <button className="tab-btn active">My Threads</button>
                            </div>

                            <div className="activity-content">
                                {displayedThreads.length === 0 ? (
                                    <div className="empty-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No threads yet. <Link to="/createThread" style={{ color: '#4CAF50' }}>Create your first thread!</Link>
                                    </div>
                                ) : (
                                    <div className="threads-list">
                                        {displayedThreads.map((thread) => (
                                            <div key={thread.id} className="thread-item">
                                                <div className="thread-main">
                                                    <div className="thread-avatar">{initials}</div>
                                                    <div className="thread-content">
                                                        <h3>
                                                            <Link to={`/thread/${encodeURIComponent(thread.id)}`}>{thread.title}</Link>
                                                        </h3>
                                                        <p className="thread-preview">
                                                            {thread.content.substring(0, 150)}{thread.content.length > 150 ? '...' : ''}
                                                        </p>
                                                        <div className="thread-meta">
                                                            <span className="thread-author">{thread.author}</span>
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
                            </div>

                            {/* Show Load More button only if there are more than 5 threads and not all are displayed */}
                            {userThreads.length > 5 && displayedThreads.length < userThreads.length && (
                                <div className="load-more">
                                    <button className="load-more-btn" onClick={handleLoadMore}>
                                        Load More ({userThreads.length - displayedThreads.length} remaining)
                                    </button>
                                </div>
                            )}

                            {/* Show "All threads loaded" only if there were more than 5 threads initially and now all are displayed */}
                            {userThreads.length > 5 && displayedThreads.length === userThreads.length && (
                                <div className="load-more">
                                    <button className="load-more-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                        All threads loaded
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}