import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Header from "../../components/header";
import Footer from "../../components/footer";
import ThreadItem from "../../components/threadItem";
import '../../styles/threads.css';
import type { Thread, ApiResponse } from "../../types/api.types";

const API_BASE_URL = "http://localhost:3000/api";

// Define category types
interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryGroup {
  label: string;
  options: CategoryOption[];
}

const categoryGroups: CategoryGroup[] = [
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

// Time formatting function
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

export default function Threads() {
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'recent' | 'popular' | 'replies' | 'views'>('recent');
  const [filter, setFilter] = useState<'all' | 'liked' | 'my-threads'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const threadsPerPage = 10;

  let url = new URL(window.location.href);
  url.searchParams.delete('category');
  window.history.replaceState({}, '', url.toString());
  
  useEffect(() => {
    document.title = 'Threads - DamIt';
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload.userId);
      } catch (e) {
        // Invalid token
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
      // Reset filter if user logs out
      if (filter === 'my-threads' || filter === 'liked') {
        setFilter('all');
      }
    }

    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sort, selectedCategory, filter]);

  // Update total pages for liked filter
  useEffect(() => {
    if (filter === 'liked' && threads.length > 0) {
      const totalLiked = threads.filter(t => t.userLiked === true).length;
      setTotalPages(Math.ceil(totalLiked / threadsPerPage));
    }
  }, [threads, filter, threadsPerPage]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // For 'liked' filter, fetch more threads to filter client-side
      const limit = filter === 'liked' ? 1000 : threadsPerPage;
      let url = `${API_BASE_URL}/threads?page=${currentPage}&limit=${limit}&sort=${sort}`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      if (filter === 'my-threads' && currentUser) {
        url += `&authorId=${currentUser}`;
      }
      // Note: 'liked' filter is handled client-side, so we fetch all threads

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      const data: ApiResponse<Thread[]> = await response.json();
      
      if (data.success && data.data) {
        setThreads(data.data);
        // Only set pagination if not filtering by 'liked' (we'll calculate it client-side)
        if (data.pagination && filter !== 'liked') {
          setTotalPages(data.pagination.totalPages);
        } else if (filter === 'liked') {
          // Calculate total pages for liked threads
          const likedCount = data.data.filter((t: Thread) => t.userLiked === true).length;
          setTotalPages(Math.ceil(likedCount / threadsPerPage));
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedThreads = useMemo(() => {
    let filtered = threads;

    // Apply filter
    if (filter === 'my-threads' && currentUser) {
      filtered = filtered.filter(thread => {
        const authorId = typeof thread.author === 'object' ? thread.author.id : thread.author;
        return authorId === currentUser;
      });
    } else if (filter === 'liked' && currentUser) {
      // Filter for liked threads - userLiked should be true
      filtered = filtered.filter(thread => thread.userLiked === true);
    }

    // Apply category filter (already done server-side, but keeping for client-side filtering if needed)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(thread => thread.category === selectedCategory);
    }

    // For 'liked' filter, apply pagination client-side since we fetched all threads
    if (filter === 'liked') {
      const startIndex = (currentPage - 1) * threadsPerPage;
      const endIndex = startIndex + threadsPerPage;
      filtered = filtered.slice(startIndex, endIndex);
    }

    // Sorting is done server-side, but we can apply additional client-side sorting if needed
    return filtered;
  }, [threads, filter, selectedCategory, currentUser, currentPage, threadsPerPage]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getThreadInitials = (author: string | { username: string } | undefined) => {
    if (!author) return 'U';
    const username = typeof author === 'string' ? author : author.username || 'U';
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || username.slice(0, 2).toUpperCase();
  };

  return (
      <div>
        <Header />
        <main className="container">
          <div className="threads-header">
            <div className="page-title">
              <h1>Recent Threads</h1>
              <p>Latest discussions from the community</p>
            </div>
            <Link to="/thread/new" className="new-thread-btn"><Plus /></Link>
          </div>

          <div className="filter-bar">
            <div className="filter-group">
              <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setFilter('all');
                    setCurrentPage(1);
                  }}
              >
                All
              </button>
              <button
                  className={`filter-btn ${filter === 'liked' ? 'active' : ''}`}
                  onClick={() => {
                    if (currentUser) {
                      setFilter('liked');
                      setCurrentPage(1);
                    } else {
                      alert('Please log in to view liked threads.');
                    }
                  }}
                  disabled={!currentUser}
                  style={{ opacity: !currentUser ? 0.5 : 1, cursor: !currentUser ? 'not-allowed' : 'pointer' }}
              >
                Liked
              </button>
              <button
                  className={`filter-btn ${filter === 'my-threads' ? 'active' : ''}`}
                  onClick={() => {
                    if (currentUser) {
                      setFilter('my-threads');
                      setCurrentPage(1);
                    } else {
                      alert('Please log in to view your threads.');
                    }
                  }}
                  disabled={!currentUser}
                  style={{ opacity: !currentUser ? 0.5 : 1, cursor: !currentUser ? 'not-allowed' : 'pointer' }}
              >
                My Threads
              </button>
            </div>

            <div className="category-filter">
              <label htmlFor="category">Category:</label>
              <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
              >
                <option value="all">All Categories</option>
                {categoryGroups.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                      ))}
                    </optgroup>
                ))}
              </select>
            </div>

            <div className="sort-group">
              <label htmlFor="sort">Sort by:</label>
              <select
                  id="sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as any);
                    setCurrentPage(1);
                  }}
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="replies">Most Replies</option>
                <option value="views">Most Views</option>
              </select>
            </div>
          </div>

          <div className="threads-list">
            {loading ? (
                <div className="empty-message">Loading threads...</div>
            ) : filteredAndSortedThreads.length === 0 ? (
                <div className="empty-message">
                  {filter === 'my-threads'
                      ? "You haven't created any threads yet."
                      : "No threads found matching your criteria."}
                </div>
            ) : (
                filteredAndSortedThreads.map((thread) => (
                    <ThreadItem
                        key={thread.id}
                        thread={thread}
                        getTimeAgo={getTimeAgo}
                        getThreadInitials={getThreadInitials}
                    />
                ))
            )}
          </div>

          {totalPages > 1 && (
              <div className="pagination">
                <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>

                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                ))}

                <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
          )}
        </main>
        <Footer />
      </div>
  );
}
