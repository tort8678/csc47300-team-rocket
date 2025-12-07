import {useEffect, useState} from 'react';
import {useNavigate, Link, useParams} from 'react-router-dom';
import {
    GraduationCap,
    Calendar,
    MapPin,
    Crown,
    Star,
    HeartHandshake,
    Rocket,
    Check,
    X,
    SquarePen,
    Heart,
    ArrowDown
} from 'lucide-react';
import Header from "../../components/header";
import Footer from "../../components/footer";
import ThreadItem from "../../components/threadItem";
import apiService from "../../services/api";
import { useModal } from "../../contexts/ModalContext";
import '../../styles/main.css';
import '../../styles/profile.css';
import type {Thread} from '../../types/api.types';
import type {User as ApiUser} from '../../types/api.types';

interface UserProfile extends ApiUser {
    bio?: string;
    major?: string;
    classYear?: string;
    location?: string;
}

export default function Profile() {
    const { showModal } = useModal();
    const navigate = useNavigate();
    const { username } = useParams<{ username?: string }>();
    const isOwnProfile = !username || (localStorage.getItem('user') && username === JSON.parse(localStorage.getItem('user') || '{}').username);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [userThreads, setUserThreads] = useState<Thread[]>([]);
    const [userComments, setUserComments] = useState<any[]>([]);
    const [displayedThreads, setDisplayedThreads] = useState<Thread[]>([]);
    const [displayedComments, setDisplayedComments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'threads' | 'comments'>('threads');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({
        bio: '',
        major: '',
        classYear: '',
        location: ''
    });

    useEffect(() => {
        document.title = username ? `${username}'s Profile - DamIt` : 'Profile - DamIt';
        
        if (isOwnProfile) {
            const token = localStorage.getItem('token');
            if (!token) {
                showModal('Please log in to view your profile.', 'info');
                navigate('/login');
                return;
            }
        }

        loadUserProfile();
    }, [navigate, username, isOwnProfile]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            let response;
            if (isOwnProfile) {
                response = await apiService.getOwnProfile();
            } else {
                if (!username) return;
                response = await apiService.getUserProfileByUsername(username);
            }
            
            if (response.success && response.data) {
                const userData = response.data as UserProfile;
                setUser(userData);
                setEditForm({
                    bio: userData.bio || '',
                    major: userData.major || '',
                    classYear: userData.classYear || '',
                    location: userData.location || ''
                });
                
                // Load threads and comments after user is loaded
                if (isOwnProfile) {
                    loadUserThreads();
                    loadUserComments();
                } else {
                    // For other users, load after a short delay to ensure user state is set
                    setTimeout(() => {
                        loadOtherUserThreads(userData.username);
                        loadOtherUserComments(userData.username);
                    }, 100);
                }
            } else {
                showModal('Failed to load profile. Please try again.', 'error');
                if (isOwnProfile) {
                    navigate('/login');
                } else {
                    navigate('/threads');
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showModal('Failed to load profile. Please try again.', 'error');
            if (isOwnProfile) {
                navigate('/login');
            } else {
                navigate('/threads');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadOtherUserThreads = async (username: string) => {
        try {
            console.log('Loading other user threads:', username);
            if (!username) return;
            const response = await apiService.getUserThreads(username, 1, 100);
            console.log('User threads response:', response);
            if (response.success && response.data && Array.isArray(response.data)) {
                const threads = response.data.map((thread: any) => ({
                    id: thread.id,
                    title: thread.title,
                    content: thread.content,
                    author: typeof thread.author === 'object' ? thread.author : thread.author,
                    category: thread.category,
                    likes: thread.likes || 0,
                    replies: thread.replies || 0,
                    views: thread.views || 0,
                    status: thread.status,
                    createdAt: thread.createdAt
                }));
                console.log('Setting user threads:', threads);
                setUserThreads(threads);
                setDisplayedThreads(threads.slice(0, 5));
            } else {
                console.log('No threads found or invalid response:', response);
            }
        } catch (error) {
            console.error('Error loading user threads:', error);
        }
    };

    const loadOtherUserComments = async (username: string) => {
        try {
            if (!username) return;
            console.log('Loading other user comments for:', username);
            const response = await apiService.getUserComments(username, 1, 100);
            console.log('User comments response:', response);
            if (response.success && response.data && Array.isArray(response.data)) {
                console.log('Setting user comments:', response.data);
                setUserComments(response.data);
                setDisplayedComments(response.data.slice(0, 5));
            } else {
                console.log('No comments found or invalid response:', response);
                setUserComments([]);
                setDisplayedComments([]);
            }
        } catch (error) {
            console.error('Error loading user comments:', error);
            setUserComments([]);
            setDisplayedComments([]);
        }
    };

    const loadUserThreads = async () => {
        try {
            if (!user) return;
            
            // Get user ID from token or user object
            const token = localStorage.getItem('token');
            if (!token) return;
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;
                
                // Use getThreads with authorId filter
                const response = await apiService.getThreads({
                    page: 1,
                    limit: 100,
                    authorId: userId
                });
                
                if (response.success && response.data) {
                    const threads = response.data.map((thread: any) => ({
                        id: thread.id,
                        title: thread.title,
                        content: thread.content,
                        author: typeof thread.author === 'object' ? thread.author : thread.author,
                        category: thread.category,
                        likes: thread.likes || 0,
                        replies: thread.replies || 0,
                        views: thread.views || 0,
                        status: thread.status,
                        createdAt: thread.createdAt
                    }));
                    setUserThreads(threads);
                    setDisplayedThreads(threads.slice(0, 5));
                }
            } catch (e) {
                console.error('Error parsing token:', e);
            }
        } catch (error) {
            console.error('Error loading user threads:', error);
        }
    };

    const loadUserComments = async () => {
        try {
            if (!user) return;
            
            const token = localStorage.getItem('token');
            if (!token) return;
            
            try {
                // Get user by ID to get username
                const userResponse = await apiService.getOwnProfile();
                if (userResponse.success && userResponse.data) {
                    const username = userResponse.data.username;
                    
                    const response = await apiService.getUserComments(username, 1, 100);
                    console.log('Own comments response:', response);
                    if (response.success && response.data && Array.isArray(response.data)) {
                        console.log('Setting own comments:', response.data);
                        setUserComments(response.data);
                        setDisplayedComments(response.data.slice(0, 5));
                    } else {
                        console.log('No comments found or invalid response:', response);
                        setUserComments([]);
                        setDisplayedComments([]);
                    }
                }
            } catch (e) {
                console.error('Error loading comments:', e);
            }
        } catch (error) {
            console.error('Error loading user comments:', error);
        }
    };

    // Reload threads and comments when user is loaded (only for own profile)
    useEffect(() => {
        if (user && isOwnProfile) {
            loadUserThreads();
            loadUserComments();
        }
    }, [user, isOwnProfile]);

    const handleLoadMoreThreads = () => {
        // Load all remaining threads
        setDisplayedThreads([...userThreads]);
    };

    const handleLoadMoreComments = () => {
        // Load all remaining comments
        setDisplayedComments([...userComments]);
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            const response = await apiService.updateProfile({
                bio: editForm.bio,
                major: editForm.major,
                classYear: editForm.classYear,
                location: editForm.location
            });

            if (response.success && response.data) {
                const updatedUser = response.data as UserProfile;
                setUser(updatedUser);
                setIsEditing(false);
                showModal('Profile updated successfully!', 'success');
            } else {
                showModal('Failed to update profile. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showModal('Failed to update profile. Please try again.', 'error');
        }
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

    if (loading || !user) {
        return (
            <div>
                <Header />
                <main className="container">
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffffb3' }}>
                        Loading profile...
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Get user initials for avatar
    const initials = user.username
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Format date
    const joinDate = user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        })
        : 'Recently';

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


    return (
        <div>
            <Header/>
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

                            {isOwnProfile && isEditing ? (
                                <div className="about-card">
                                    <h3>Edit Profile</h3>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                                        <div className="form-group">
                                            <label>Bio</label>
                                            <textarea
                                                value={editForm.bio}
                                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Major</label>
                                            <input
                                                type="text"
                                                value={editForm.major}
                                                onChange={(e) => setEditForm({...editForm, major: e.target.value})}
                                                placeholder="e.g., Computer Science"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Class Year</label>
                                            <input
                                                type="text"
                                                value={editForm.classYear}
                                                onChange={(e) => setEditForm({...editForm, classYear: e.target.value})}
                                                placeholder="e.g., Class of 2026"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                                placeholder="e.g., Campus Housing"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="btn btn-secondary"
                                            >
                                                <X/>
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                className="btn btn-primary"
                                            >
                                                <Check/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="about-card">
                                    <div className="about-card-header">
                                        <h3>About</h3>
                                        {isOwnProfile && (
                                            <button
                                                className="edit-profile-btn"
                                                onClick={() => setIsEditing(!isEditing)}
                                            ><SquarePen/>
                                            </button>
                                        )}
                                    </div>
                                    <p>{user.bio || 'No bio added yet. Click "Edit Profile" to add one!'}</p>
                                    <div className="about-details">
                                        {user.major && (
                                            <div className="detail-item">
                                                <GraduationCap className="detail-icon" size={20}/>
                                                <span>{user.major}</span>
                                            </div>
                                        )}
                                        {user.classYear && (
                                            <div className="detail-item">
                                                <Calendar className="detail-icon" size={20}/>
                                                <span>{user.classYear}</span>
                                            </div>
                                        )}
                                        {user.location && (
                                            <div className="detail-item">
                                                <MapPin className="detail-icon" size={20}/>
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
                                            <Crown size={40}/>
                                        </div>
                                    )}
                                    {totalThreads >= 1 && (
                                        <div className="badge" title="Active Member">
                                            <Star size={40}/>
                                        </div>
                                    )}
                                    {totalPosts >= 5 && (
                                        <div className="badge" title="Helpful">
                                            <HeartHandshake size={40}/>
                                        </div>
                                    )}
                                    <div className="badge" title="Early Adopter">
                                        <Rocket size={40}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-main">
                            <div className="activity-tabs">
                                <button 
                                    className={`tab-btn ${activeTab === 'threads' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('threads')}
                                >
                                    {(isOwnProfile ? 'My' : username + "'s")} Threads
                                </button>
                                <button 
                                    className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('comments')}
                                >
                                    {(isOwnProfile ? 'My' : username + "'s")} Comments
                                </button>
                            </div>

                            <div className="activity-content">
                                {activeTab === 'threads' ? (
                                    <>
                                        {displayedThreads.length === 0 ? (
                                            <div className="empty-message" style={{textAlign: 'center', padding: '2rem', color: '#ffffffb3'}}>
                                                No threads yet. <Link to="/thread/new" style={{color: '#fdcffa', textDecoration: 'none'}}>Create your first thread!</Link>
                                            </div>
                                        ) : (
                                            <div className="threads-list">
                                                {displayedThreads.map((thread) => (
                                                    <ThreadItem
                                                        key={thread.id}
                                                        thread={thread}
                                                        getTimeAgo={getTimeAgo}
                                                        getThreadInitials={() => initials}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {/* Show Load More button only if there are more than 5 threads and not all are displayed */}
                                        {userThreads.length > 5 && displayedThreads.length < userThreads.length && (
                                            <div className="load-more">
                                                <button className="load-more-btn" onClick={handleLoadMoreThreads}>
                                                    <ArrowDown size={25} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {displayedComments.length === 0 ? (
                                            <div className="empty-message" style={{textAlign: 'center', padding: '2rem', color: '#ffffffb3'}}>
                                                No comments yet.
                                            </div>
                                        ) : (
                                            <div className="threads-list">
                                                {displayedComments.map((comment) => {
                                                    const threadId = typeof comment.thread === 'object' && comment.thread ? comment.thread.id : (typeof comment.thread === 'string' ? comment.thread : '');
                                                    const threadTitle = typeof comment.thread === 'object' && comment.thread ? comment.thread.title : 'Unknown Thread';
                                                    const replyingTo = typeof comment.repliedToUsername === 'string' && comment.repliedToUsername ? comment.repliedToUsername : 'Unknown User';
                                                    return (
                                                        <Link to={`/thread/${threadId}`} key={comment.id} className="thread-item" style={{cursor: 'pointer'}}>
                                                            <div className="thread-main">
                                                                <div className="thread-content">
                                                                    
                                                                    <div className="thread-meta" style={{fontSize: '0.875rem'}}>
                                                                        <span>Replying to <Link to={`/profile/${replyingTo}`}>{replyingTo}</Link> in <span style={{ color:'#fdcffa',fontWeight: '600'}}>{threadTitle}</span></span>
                                                                        <span className="thread-time">{getTimeAgo(comment.createdAt)}</span>
                                                                    </div>
                                                                    <p className="thread-preview" style={{fontSize: '1rem'}}>{comment.content.substring(0, 150)}{comment.content.length > 150 ? '...' : ''}</p>
                                                                </div>
                                                            </div>
                                                            <div className="thread-stats">
                                                                <div className="stat">
                                                                    <Heart size={20} />
                                                                    <span className="stat-count">{comment.likes || 0}</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {/* Show Load More button only if there are more than 5 comments and not all are displayed */}
                                        {userComments.length > 5 && displayedComments.length < userComments.length && (
                                            <div className="load-more">
                                                <button className="load-more-btn" onClick={handleLoadMoreComments}>
                                                    <ArrowDown size={25} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
