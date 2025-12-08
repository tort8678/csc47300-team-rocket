import { useState, useEffect } from "react";
import { Check, X, RefreshCw, Users, FileText, UserPlus, Ban, UserCheck, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Thread, ApiResponse, User } from "../../types/api.types";
import { useModal } from "../../contexts/ModalContext";
import CustomSelect, { type SelectOptionGroup } from "../../components/CustomSelect";
import apiService from "../../services/api";
import '../../styles/adminDashboard.css';
import Header from "../../components/header";
import Footer from "../../components/footer";
const API_BASE_URL = "http://localhost:3000/api";

interface ThreadWithAuthor extends Thread {
  author: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    bio?: string;
    major?: string;
    classYear?: string;
  };
}

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="stat-card">
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const categoryGroups: SelectOptionGroup[] = [
  {
    label: "Academic",
    options: [
      { value: "academic-help", label: "Academic Help" },
      { value: "course-reviews", label: "Course Reviews" },
      { value: "research-projects", label: "Research & Projects" }
    ]
  },
  {
    label: "Campus Life",
    options: [
      { value: "events-activities", label: "Events & Activities" },
      { value: "clubs-organizations", label: "Clubs & Organizations" },
      { value: "sports-fitness", label: "Sports & Fitness" }
    ]
  },
  {
    label: "Career & Life",
    options: [
      { value: "career-internships", label: "Career & Internships" },
      { value: "housing-roommates", label: "Housing & Roommates" },
      { value: "buy-sell", label: "Buy & Sell" }
    ]
  },
  {
    label: "Entertainment",
    options: [
      { value: "gaming", label: "Gaming" },
      { value: "movies-tv", label: "Movies & TV" },
      { value: "music", label: "Music" }
    ]
  },
  {
    label: "General",
    options: [
      { value: "general-discussion", label: "General Discussion" },
      { value: "announcements", label: "Announcements" }
    ]
  }
];

const FilterBar = ({ filters, onFiltersChange }: any) => (
  <div className="filter-bar">
    <div className="filter-bar-content">
      <input
        type="text"
        placeholder="Search posts..."
        value={filters.search}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            search: e.target.value,
          })
        }
        className="filter-input"
      />
      <CustomSelect
        value={filters.category}
        onChange={(value) =>
          onFiltersChange({
            ...filters,
            category: value,
          })
        }
        optionGroups={categoryGroups}
        options={[{ value: 'all', label: 'All Categories' }]}
        placeholder="All Categories"
        className="filter-select"
        width="350px"
      />
    </div>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '1.5rem',
      marginBottom: '1rem'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-btn"
      >
        <ArrowLeft size={25} />
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} style={{ color: 'white', padding: '0 0.5rem' }}>...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`page-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-btn"
      >
        <ArrowRight size={25} />
      </button>
    </div>
  );
};

const PostCard = ({
  post,
  onApprove,
  onReject,
}: {
  post: ThreadWithAuthor;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "academic-help": "Academic Help",
      "course-reviews": "Course Reviews",
      "research-projects": "Research & Projects",
      "events-activities": "Events & Activities",
      "clubs-organizations": "Clubs & Organizations",
      "sports-fitness": "Sports & Fitness",
      "career-internships": "Career & Internships",
      "housing-roommates": "Housing & Roommates",
      "buy-sell": "Buy & Sell",
      gaming: "Gaming",
      "movies-tv": "Movies & TV",
      music: "Music",
      "general-discussion": "General Discussion",
      announcements: "Announcements",
    };
    return categoryMap[category] || category;
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || username.slice(0, 2).toUpperCase();
  };

  return (
    
    <div className="post-card">
      <div>
        <div className="post-header">
          <div className="post-avatar">
            {getInitials(post.author.username)}
          </div>
          <div className="post-info">
            <div className="post-title">
              <Link to={`/thread/${post.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                {post.title}
              </Link>
            </div>
            <div className="post-meta">
              {post.author.username} • {formatTime(post.createdAt)}
            </div>
          </div>
        </div>

        <p className="post-content">
          {post.content.substring(0, 120)}...
        </p>

        <div className="post-tags">
          <span className="post-tag">
            {formatCategoryDisplay(post.category)}
          </span>
          {post.author.classYear && (
            <span className="post-tag-secondary">
              {post.author.classYear}
            </span>
          )}
          {post.author.major && (
            <span className="post-tag-secondary">
              {post.author.major}
            </span>
          )}
        </div>
      </div>
      <div className="post-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReject(post.id);
          }}
          className="post-action-btn"
        >
          <X size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove(post.id);
          }}
          className="post-action-btn approve"
        >
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { showModal, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<'threads' | 'users'>('threads');
  const [posts, setPosts] = useState<ThreadWithAuthor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });
  const [userFilters, setUserFilters] = useState({
    search: "",
  });
  // Pagination state
  const [threadsPagination, setThreadsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLevel2, setIsAdminLevel2] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [createAdminData, setCreateAdminData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin_level_1' as 'admin_level_1' | 'admin_level_2'
  });
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banDuration, setBanDuration] = useState<string>('forever');

  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.role === 'admin_level_1' || user.role === 'admin_level_2') {
              setIsAdmin(true);
              setIsAdminLevel2(user.role === 'admin_level_2');
              setCheckingAuth(false);
              return;
            }
          } catch (e) {
            // Try API
          }
        }

        // Verify with API
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && (data.data.role === 'admin_level_1' || data.data.role === 'admin_level_2')) {
            setIsAdmin(true);
            setIsAdminLevel2(data.data.role === 'admin_level_2');
            setCheckingAuth(false);
            return;
          }
        }

        // Not admin, redirect
        window.location.href = '/';
      } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/';
      }
    };

    checkAdminAccess();
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'Admin Dashboard - DamIt';
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const formatBanExpiry = (timestamp: string | Date | null | undefined) => {
    if (!timestamp) return 'Permanent';
    const expiry = new Date(timestamp);
    const now = new Date();
    if (expiry <= now) return 'Expired';
  
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
  
    return expiry.toLocaleString('en-US', options);
  };

  const getCurrentUserRole = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || 'user';
      } catch (e) {
        return 'user';
      }
    }
    return 'user';
  };

  const fetchPendingThreads = async (page: number = threadsPagination.page) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/threads/admin/pending?page=${page}&limit=${threadsPagination.limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch pending threads");
      }

      const data: ApiResponse<ThreadWithAuthor[]> & { pagination?: { page: number; limit: number; total: number; totalPages: number } } = await response.json();
      if (data.success && data.data) {
        setPosts(data.data);
        if (data.pagination) {
          setThreadsPagination(data.pagination);
        }
      } else {
        console.error("Failed to fetch pending threads:", data);
      }
    } catch (error) {
      console.error("Error fetching pending threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/threads/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data: ApiResponse<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
      }> = await response.json();

      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async (page: number = usersPagination.page) => {
    try {
      setUsersLoading(true);
      // Include inactive (banned) users for admins
      const response = await apiService.getAdminUsers({ page, limit: usersPagination.limit, includeInactive: true });
      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setUsersPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showModal('Failed to fetch users.', 'error', 'Error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if admin check is complete and user is admin
    if (!checkingAuth && isAdmin) {
      if (activeTab === 'threads') {
        fetchPendingThreads(1);
        fetchStats();
      } else if (activeTab === 'users') {
        fetchUsers(1);
      }
    }
  }, [checkingAuth, isAdmin, activeTab]);

  // Reset pagination when switching tabs
  useEffect(() => {
    if (activeTab === 'threads') {
      setThreadsPagination(prev => ({ ...prev, page: 1 }));
    } else if (activeTab === 'users') {
      setUsersPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [activeTab]);

  const handleApprove = async (postId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/threads/admin/${postId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve thread");
      }

      // Refresh the list and stats (stay on current page)
      await fetchPendingThreads(threadsPagination.page);
      await fetchStats();
    } catch (error) {
      console.error("Error approving thread:", error);
      showModal("Failed to approve thread.", 'error', 'Error');
    }
  };

  const handleReject = async (postId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/threads/admin/${postId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject thread");
      }

      // Refresh the list and stats (stay on current page)
      await fetchPendingThreads(threadsPagination.page);
      await fetchStats();
    } catch (error) {
      console.error("Error rejecting thread:", error);
      showModal("Failed to reject thread.", 'error', 'Error');
    }
  };

  const handleBanUser = (userId: string) => {
    setBanUserId(userId);
    setBanDuration('forever');
    setShowBanModal(true);
  };

  const handleConfirmBan = async () => {
    if (!banUserId) return;

    let duration: number | 'forever' | null = null;
    
    if (banDuration === 'forever') {
      duration = 'forever';
    } else {
      const hours = parseInt(banDuration);
      if (isNaN(hours) || hours <= 0) {
        showModal('Invalid duration selected.', 'error', 'Error');
        return;
      }
      duration = hours;
    }

    const confirmed = await showConfirm(
      duration === 'forever' 
        ? `Permanently ban this user?`
        : `Ban this user for ${duration} hour${duration > 1 ? 's' : ''}?`,
      'Confirm Ban'
    );
    if (!confirmed) {
      setShowBanModal(false);
      setBanUserId(null);
      return;
    }

    try {
      const response = await apiService.banUser(banUserId, duration);
      if (response.success) {
        showModal(response.message || 'User banned.', 'success', 'Success');
        await fetchUsers(usersPagination.page);
      } else {
        showModal(response.message || 'Failed to ban user.', 'error', 'Error');
      }
    } catch (error: any) {
      console.error('Error banning user:', error);
      showModal(error.response?.data?.message || 'Failed to ban user.', 'error', 'Error');
    } finally {
      setShowBanModal(false);
      setBanUserId(null);
      setBanDuration('forever');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const confirmed = await showConfirm('Unban this user?', 'Confirm Unban');
    if (!confirmed) return;

    try {
      const response = await apiService.unbanUser(userId);
      if (response.success) {
        showModal('User unbanned.', 'success', 'Success');
        await fetchUsers(usersPagination.page);
      } else {
        showModal(response.message || 'Failed to unban user.', 'error', 'Error');
      }
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      showModal(error.response?.data?.message || 'Failed to unban user.', 'error', 'Error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await showConfirm('Delete this user? This cannot be undone.', 'Confirm Delete');
    if (!confirmed) return;

    try {
      const response = await apiService.deleteAdminUser(userId);
      if (response.success) {
        showModal('User deleted.', 'success', 'Success');
        await fetchUsers(usersPagination.page);
      } else {
        showModal(response.message || 'Failed to delete user.', 'error', 'Error');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showModal(error.response?.data?.message || 'Failed to delete user.', 'error', 'Error');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createAdmin(createAdminData);
      if (response.success) {
        showModal('Admin user created.', 'success', 'Success');
        setShowCreateAdminForm(false);
        setCreateAdminData({ username: '', email: '', password: '', role: 'admin_level_1' });
        await fetchUsers(usersPagination.page);
      } else {
        showModal(response.message || 'Failed to create admin user.', 'error', 'Error');
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      showModal(error.response?.data?.message || 'Failed to create admin user.', 'error', 'Error');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !post.title.toLowerCase().includes(searchLower) &&
        !post.content.toLowerCase().includes(searchLower) &&
        !post.author.username.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.category !== "all" && post.category !== filters.category) {
      return false;
    }
    return true;
  });

  const filteredUsers = users.filter((user) => {
    if (userFilters.search) {
      const searchLower = userFilters.search.toLowerCase();
      if (
        !user.username.toLowerCase().includes(searchLower) &&
        !user.email.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  // Show loading only while checking auth initially
  if (checkingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white'
      }}>
        <div>Checking permissions...</div>
      </div>
    );
  }

  // Don't render if not admin (redirect will happen)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <Header />

      <div className="admin-container">
        {/* Tabs */}
        <div 
          className="admin-tabs"
        >
          <button
            onClick={() => setActiveTab('threads')}
            className={`tab-btn ${activeTab === 'threads' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 'bold'
            }}
          >
            <FileText size={18} />
            Threads
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 'bold'
            }}
          >
            <Users size={18} />
            Users
          </button>
        </div>

        {activeTab === 'threads' && (
          <>
            {/* Statistics Cards */}
            <div className="admin-stats-grid">
              <StatCard label="Total Posts" value={stats.total} color="#FDCFFA" />
              <StatCard
                label="Pending Review"
                value={stats.pending}
                color="#FDCFFA"
              />
              <StatCard
                label="Approved Today"
                value={stats.approved}
                color="#BDE7BD"
              />
              <StatCard
                label="Rejected Today"
                value={stats.rejected}
                color="#FF6962"
              />
            </div>

            {/* Filter Bar */}
            <FilterBar filters={filters} onFiltersChange={setFilters} />
            {/* Pending Review Queue */}
            <div>
              <div className="section-header">
                <h2 className="section-title">Pending Review</h2>
                <button
                  onClick={() => {
                    fetchPendingThreads(1);
                    fetchStats();
                  }}
                  className="admin-refresh-btn"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
              {loading && posts.length === 0 ? (
                <div className="loading-message">
                  Loading...
                </div>
              ) : (
                <>
                  <div className="posts-grid">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                  {filteredPosts.length === 0 && (
                    <div className="empty-message">
                      No pending posts to review
                    </div>
                  )}
                  <Pagination
                    currentPage={threadsPagination.page}
                    totalPages={threadsPagination.totalPages}
                    onPageChange={(page) => {
                      setThreadsPagination(prev => ({ ...prev, page }));
                      fetchPendingThreads(page);
                    }}
                  />
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="section-header">
              <h2 className="section-title" style={{ margin: 0 }}>User Management</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isAdminLevel2 && (
                  <button
                    onClick={() => setShowCreateAdminForm(!showCreateAdminForm)}
                    className="admin-refresh-btn"
                  >
                    <UserPlus size={18} />
                    Create Admin
                  </button>
                )}
                <button
                  onClick={() => fetchUsers(1)}
                  className="admin-refresh-btn"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>

            {showCreateAdminForm && isAdminLevel2 && (
              <div className="modal-overlay" style={{zIndex: 100}}>
              <div style={{ 
                background: 'rgba(0,0,0,0.4)', 
                padding: '1.5rem', 
                borderRadius: '15px', 
                marginBottom: '1.5rem',
                border: '1px solid #333',
                backdropFilter: 'blur(15px)',
                width: '500px'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#FDCFFA' }}>Create Admin User</h3>
                <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '20px'}}>
                  <div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Username</label>
                      <input
                        type="text"
                        value={createAdminData.username}
                        onChange={(e) => setCreateAdminData({ ...createAdminData, username: e.target.value })}
                        required
                        style={{  color: '#fff',
                          background: '#00000080',
                          border: '1px solid #ffffff26',
                          borderRadius: '12px',
                          outline: 'none',
                          padding: '0.9rem 1rem',
                          fontFamily: 'unset',
                          fontSize: '15px',
                          width: '100%'}}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Email</label>
                      <input
                        type="email"
                        value={createAdminData.email}
                        onChange={(e) => setCreateAdminData({ ...createAdminData, email: e.target.value })}
                        required
                        style={{  color: '#fff',
                          background: '#00000080',
                          border: '1px solid #ffffff26',
                          borderRadius: '12px',
                          outline: 'none',
                          padding: '0.9rem 1rem',
                          fontFamily: 'unset',
                          fontSize: '15px',
                          width: '100%'}}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Password</label>
                      <input
                        type="password"
                        value={createAdminData.password}
                        onChange={(e) => setCreateAdminData({ ...createAdminData, password: e.target.value })}
                        required
                        minLength={6}
                        style={{  color: '#fff',
                          background: '#00000080',
                          border: '1px solid #ffffff26',
                          borderRadius: '12px',
                          outline: 'none',
                          padding: '0.9rem 1rem',
                          fontFamily: 'unset',
                          fontSize: '15px',
                          width: '100%'}}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Role</label>
                      <CustomSelect
                        value={createAdminData.role}
                        onChange={(value) => setCreateAdminData({ ...createAdminData, role: value as 'admin_level_1' | 'admin_level_2' })}
                        options={[
                          { value: 'admin_level_1', label: 'Admin Level 1' },
                          { value: 'admin_level_2', label: 'Admin Level 2' }
                        ]}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'end' }}>
                  <button
                      type="button"
                      onClick={() => {
                        setShowCreateAdminForm(false);
                        setCreateAdminData({ username: '', email: '', password: '', role: 'admin_level_1' });
                      }}
                      className="modal-close"
                      style={{ width: '40px' }}
                    >
                      <X size={18} />
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '40px' }}
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </form>
              </div>
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Search users..."
                value={userFilters.search}
                onChange={(e) => setUserFilters({ search: e.target.value })}
                className="filter-input"
                style={{ width: '100%', maxWidth: '500px' }}
              />
            </div>

            {usersLoading && users.length === 0 ? (
              <div className="loading-message">
                Loading users...
              </div>
            ) : (
              <>
                {filteredUsers.length === 0 ? (
                  <div className="empty-message">
                    No users found
                  </div>
                ) : (
                  <div className="users-table-container">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Ban Expires</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const isAdminLevel2 = getCurrentUserRole() === 'admin_level_2';
                          const canBan = isAdminLevel2 
                            ? (user.role === 'user' || user.role === 'admin_level_1')
                            : (getCurrentUserRole() === 'admin_level_1' && user.role === 'user');
                          const canDelete = isAdminLevel2 && (user.role === 'user' || user.role === 'admin_level_1');
                          const isBanned = user.isActive === false;

                          return (
                            <tr key={user.id} className={isBanned ? 'banned-row' : ''}>
                              <td>
                                <Link 
                                  to={`/profile/${user.username}`} 
                                  style={{ color: '#FDCFFA', textDecoration: 'none', fontWeight: 'bold' }}
                                >
                                  {user.username}
                                </Link>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                  {user.role === 'admin_level_2' ? 'Admin L2' : user.role === 'admin_level_1' ? 'Admin L1' : 'User'}
                              </td>
                              <td>
                                {isBanned ? (
                                  <span style={{ color: '#FDCFFA', fontWeight: 'bold' }}>Banned</span>
                                ) : (
                                  <span style={{ fontWeight: 'bold' }}>Active</span>
                                )}
                              </td>
                              <td>
                                {isBanned ? formatBanExpiry(user.bannedUntil) : '-'}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {!isBanned ? (
                                    canBan && (
                                      <button
                                        onClick={() => handleBanUser(user.id)}
                                        className="post-action-btn"
                                        title="Ban User"
                                        style={{ padding: '0.5rem' }}
                                      >
                                        <Ban size={16} />
                                      </button>
                                    )
                                  ) : (
                                    canBan && (
                                      <button
                                        onClick={() => handleUnbanUser(user.id)}
                                        className="post-action-btn approve"
                                        title="Unban User"
                                        style={{ padding: '0.5rem' }}
                                      >
                                        <UserCheck size={16} />
                                      </button>
                                    )
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="post-action-btn"
                                      title="Delete User"
                                      style={{ background: '#FF6962', padding: '0.5rem' }}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pagination
                  currentPage={usersPagination.page}
                  totalPages={usersPagination.totalPages}
                  onPageChange={(page) => {
                    setUsersPagination(prev => ({ ...prev, page }));
                    fetchUsers(page);
                  }}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => {
          setShowBanModal(false);
          setBanUserId(null);
          setBanDuration('forever');
        }}>
          <div 
            style={{ 
              background: 'rgba(0,0,0,0.4)', 
              padding: '1.5rem', 
              borderRadius: '15px', 
              border: '1px solid #333',
              backdropFilter: 'blur(15px)',
              width: '500px',
              maxWidth: '90vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: '#FDCFFA' }}>Ban User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Set Ban Duration</label>
                <CustomSelect
                  value={banDuration}
                  onChange={(value) => setBanDuration(value)}
                  options={[
                    { value: '1', label: '1 hour' },
                    { value: '24', label: '1 day' },
                    { value: '168', label: '1 week' },
                    { value: '720', label: '1 month' },
                    { value: 'forever', label: 'Forever' }
                  ]}
                  placeholder="Select ban duration"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowBanModal(false);
                  setBanUserId(null);
                  setBanDuration('forever');
                }}
                className="modal-close"
                style={{ width: '40px' }}
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="btn btn-primary"
                style={{ width: '40px' }}
              >
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
