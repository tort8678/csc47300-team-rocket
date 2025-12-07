import { useState, useEffect } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { Thread, ApiResponse } from "../../types/api.types";
import { useModal } from "../../contexts/ModalContext";
import CustomSelect, { type SelectOptionGroup } from "../../components/CustomSelect";
import '../../styles/adminDashboard.css';
import Header from "../../components/header";
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
  const { showModal } = useModal();
  const [posts, setPosts] = useState<ThreadWithAuthor[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
            if (user.role === 'admin') {
              setIsAdmin(true);
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
          if (data.success && data.data && data.data.role === 'admin') {
            setIsAdmin(true);
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

  const fetchPendingThreads = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/threads/admin/pending?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch pending threads");
      }

      const data: ApiResponse<ThreadWithAuthor[]> = await response.json();
      if (data.success && data.data) {
        setPosts(data.data);
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

  useEffect(() => {
    // Only fetch if admin check is complete and user is admin
    if (!checkingAuth && isAdmin) {
      fetchPendingThreads();
      fetchStats();
      
      // Refresh every 30 seconds to catch new threads
      const interval = setInterval(() => {
        fetchPendingThreads();
        fetchStats();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [checkingAuth, isAdmin]);

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

      // Refresh the list and stats
      await fetchPendingThreads();
      await fetchStats();
    } catch (error) {
      console.error("Error approving thread:", error);
      showModal("Failed to approve thread. Please try again.", 'error');
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

      // Refresh the list and stats
      await fetchPendingThreads();
      await fetchStats();
    } catch (error) {
      console.error("Error rejecting thread:", error);
      showModal("Failed to reject thread. Please try again.", 'error');
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

  // Show loading while checking auth
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
                fetchPendingThreads();
                fetchStats();
              }}
              className="admin-refresh-btn"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            </div>
          {loading ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
