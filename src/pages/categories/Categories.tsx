import React, { useEffect, useState } from 'react';
import { Library, PartyPopper, Briefcase, Gamepad2, MessageSquare } from 'lucide-react';
import '../../styles/categories.css';
import Header from "../../components/header";
import Footer from "../../components/footer";
import type { Thread } from '../../types/types';

interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryGroup {
  label: string;
  options: CategoryOption[];
}

const Categories: React.FC = () => {
  const [categoryData, setCategoryData] = useState<Record<string, any>>({});

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

  const categoryDescriptions: Record<string, string> = {
    "academic-help": "Study groups, homework help, and course discussions",
    "course-reviews": "Share your experiences and review courses",
    "research-projects": "Collaborate on research and academic projects",
    "events-activities": "Campus events, parties, and social gatherings",
    "clubs-organizations": "Join and discuss student organizations",
    "sports-fitness": "Intramural sports, gym, and fitness discussions",
    "career-internships": "Job postings, internships, and career advice",
    "housing-roommates": "Find roommates and discuss housing options",
    "buy-sell": "Textbooks, furniture, and other items",
    "gaming": "Video games, board games, and gaming meetups",
    "movies-tv": "Discuss movies, TV shows, and streaming",
    "music": "Share music, discuss concerts, and find bandmates",
    "general-discussion": "Random topics and casual conversations",
    "announcements": "Official forum and university announcements"
  };

  useEffect(() => {
    // Load all threads from localStorage
    const threads: Thread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('thread_')) {
        try {
          const t = JSON.parse(localStorage.getItem(key) as string) as Thread;
          if (t) threads.push(t);
        } catch (e) {
          // ignore malformed entries
        }
      }
    }

    // Calculate stats per category (using value, not label)
    const stats: Record<string, any> = {};
    threads.forEach(thread => {
      const cat = thread.category || 'general-discussion';
      if (!stats[cat]) {
        stats[cat] = {
          threads: 0,
          posts: 0,
          latestThread: null
        };
      }
      stats[cat].threads++;
      stats[cat].posts += 1 + (thread.replies || 0);

      // Update latest thread
      if (!stats[cat].latestThread || new Date(thread.createdAt) > new Date(stats[cat].latestThread.createdAt)) {
        stats[cat].latestThread = {
          title: thread.title,
          author: thread.author || 'Anonymous',
          createdAt: thread.createdAt
        };
      }
    });

    setCategoryData(stats);
  }, []);

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const threadDate = new Date(date);
    const seconds = Math.floor((now.getTime() - threadDate.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  const getCategoryStats = (categoryValue: string) => {
    return categoryData[categoryValue] || { threads: 0, posts: 0, latestThread: null };
  };

  const getGroupIcon = (groupLabel: string) => {
    switch (groupLabel) {
      case 'Academic':
        return <Library className="category-icon" size={40}/>;
      case 'Campus Life':
        return <PartyPopper className="category-icon" size={40}/>;
      case 'Career & Life':
        return <Briefcase className="category-icon" size={40}/>;
      case 'Entertainment':
        return <Gamepad2 className="category-icon" size={40}/>;
      case 'General':
        return <MessageSquare className="category-icon" size={40}/>;
      default:
        return <MessageSquare className="category-icon" size={40}/>;
    }
  };

  return (
      <div>
        <Header />

        <main className="container">
          <div className="page-header">
            <h1>Forum Categories</h1>
            <p>Browse all discussion categories and find what interests you</p>
          </div>

          <div className="categories-container">
            {categoryGroups.map((group) => (
                <div key={group.label} className="category-section">
                  <h2>{getGroupIcon(group.label)} {group.label}</h2>
                  <div className="category-list">
                    {group.options.map((option) => {
                      const stats = getCategoryStats(option.value);
                      return (
                          <div key={option.value} className="category-item">
                            <div className="category-info">
                              <h3>{option.label}</h3>
                              <p>{categoryDescriptions[option.value]}</p>
                            </div>
                            <div className="category-stats">
                              <div className="stat-item">
                                <span className="stat-value">{stats.threads}</span>
                                <span className="stat-label">Threads</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{stats.posts}</span>
                                <span className="stat-label">Posts</span>
                              </div>
                            </div>
                            {stats.latestThread ? (
                                <div className="latest-post">
                                  <span className="latest-label">Latest:</span>
                                  <span className="latest-thread">{stats.latestThread.title}</span>
                                  <span className="latest-user">by {stats.latestThread.author}</span>
                                  <span className="latest-time">{getTimeAgo(stats.latestThread.createdAt)}</span>
                                </div>
                            ) : (
                                <div className="latest-post">
                                  <span className="latest-label">No threads yet</span>
                                </div>
                            )}
                          </div>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default Categories;