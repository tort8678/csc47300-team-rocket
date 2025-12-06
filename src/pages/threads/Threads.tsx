import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, Plus } from 'lucide-react';
import Header from "../../components/header";
import Footer from "../../components/footer";
import '../../styles/threads.css';
import type { Thread } from "../../types/types";

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

// Get all categories flattened for display
const allCategories = categoryGroups.flatMap(group => group.options);

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
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [sort, setSort] = useState<'recent' | 'popular' | 'replies' | 'views'>('recent');
  const [filter, setFilter] = useState<'all' | 'following' | 'my-threads'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const threadsPerPage = 10;

  useEffect(() => {
    // Get current user from localStorage (you might want to adjust this based on your auth system)
    const user = localStorage.getItem('currentUser') || 'anonymous';
    setCurrentUser(user);

    // Load threads from localStorage
    const loaded: Thread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('thread_')) {
        try {
          const t = JSON.parse(localStorage.getItem(key) as string) as Thread;
          if (t) loaded.push(t);
        } catch (e) {
          // Ignore malformed entries
        }
      }
    }

    // Sort by createdAt desc by default
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setThreads(loaded);
  }, []);

  const filteredAndSortedThreads = useMemo(() => {
    let filtered = threads;

    // Apply filter
    if (filter === 'my-threads' && currentUser) {
      filtered = filtered.filter(thread => thread.author === currentUser);
    }
    // Note: 'following' filter would need additional logic for following system

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(thread => thread.category === selectedCategory);
    }

    // Apply sorting
    if (sort === 'recent') {
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // For other sorting options, you'll need to store these metrics in your Thread type
    return filtered;
  }, [threads, filter, selectedCategory, sort, currentUser]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedThreads.length / threadsPerPage);
  const startIndex = (currentPage - 1) * threadsPerPage;
  const endIndex = startIndex + threadsPerPage;
  const currentThreads = filteredAndSortedThreads.slice(startIndex, endIndex);

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

  const handleNewThread = () => {
    navigate('/thread/new');
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = allCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <button onClick={handleNewThread} className="new-thread-btn"><Plus /></button>
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
                  className={`filter-btn ${filter === 'following' ? 'active' : ''}`}
                  onClick={() => {
                    setFilter('following');
                    setCurrentPage(1);
                  }}
              >
                Following
              </button>
              <button
                  className={`filter-btn ${filter === 'my-threads' ? 'active' : ''}`}
                  onClick={() => {
                    setFilter('my-threads');
                    setCurrentPage(1);
                  }}
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
            {currentThreads.length === 0 ? (
                <div className="empty-message">
                  {filter === 'my-threads'
                      ? "You haven't created any threads yet."
                      : "No threads found matching your criteria."}
                </div>
            ) : (
                currentThreads.map((thread) => (
                    <div key={thread.id} className="thread-item">
                      <div className="thread-main">
                        <div className="thread-avatar">
                          {(thread.author || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="thread-content">
                          <h3>
                            <Link to={`/thread/${encodeURIComponent(thread.id.split("_")[1])}`}>
                              {thread.title}
                            </Link>
                          </h3>
                          <p className="thread-preview">
                            {thread.content.substring(0, 150)}
                            {thread.content.length > 150 && '...'}
                          </p>
                          <div className="thread-meta">
                            <span className="thread-author">{thread.author || 'unknown'}</span>
                            <span className="thread-category">
                        {getCategoryLabel(thread.category)}
                      </span>
                            <span className="thread-time">
                        {getTimeAgo(thread.createdAt)}
                      </span>
                          </div>
                        </div>
                      </div>
                      <div className="thread-stats">
                        <div className="stat">
                          <MessageSquare size={20}/>
                          <span className="stat-count">{thread.replies ?? 0}</span>
                        </div>
                        <div className="stat">
                          <Eye size={20}/>
                          <span className="stat-count">{thread.views ?? 0}</span>
                        </div>
                      </div>
                    </div>
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