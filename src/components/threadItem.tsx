import { Link } from 'react-router-dom';
import { Reply, Heart, Hourglass, X } from 'lucide-react';
import type { Thread } from '../types/api.types';

interface ThreadItemProps {
  thread: Thread;
  getTimeAgo: (date: string | Date) => string;
  getThreadInitials?: (author: string | { username: string } | undefined) => string;
}

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

const allCategories = categoryGroups.flatMap(group => group.options);

const getCategoryLabel = (categoryValue: string) => {
  const category = allCategories.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

export default function ThreadItem({ thread, getTimeAgo, getThreadInitials }: ThreadItemProps) {
  const getInitials = (author: string | { username: string } | undefined) => {
    if (getThreadInitials) {
      return getThreadInitials(author);
    }
    if (!author) return 'U';
    const username = typeof author === 'string' ? author : author.username || 'U';
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="thread-item">
      <div className="thread-main">
        <div className="thread-avatar">{getInitials(thread.author)}</div>
        <div className="thread-content">
          <h3 style={{ display: 'flex', width: '-webkit-fill-available', justifyContent: 'space-between'}}>
            <Link to={`/thread/${thread.id}`}>{thread.title}</Link>
            {thread.status && thread.status !== 'approved' && (
              <span className="thread-status" style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: thread.status === 'pending' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 82, 82, 0.2)',
                color: thread.status === 'pending' ? '#ffc107' : '#ff5252',
                display: 'flex',
                alignItems: 'center',
                width: 'fit-content',
              }}>
                {thread.status === 'pending' ? <Hourglass size={18}/> : <X size={18}/>}
                {thread.status === 'pending' ? 'Pending' : 'Rejected'}
              </span>
            )}
          </h3>
          <p className="thread-preview">
            {thread.content.substring(0, 150)}{thread.content.length > 150 ? '...' : ''}
          </p>
          <div className="thread-meta">
            <Link
              to={`/profile/${typeof thread.author === 'string' ? thread.author : thread.author.username}`}
            >
              <span className="thread-author">
                {typeof thread.author === 'string' ? thread.author : thread.author.username || 'Anonymous'}
              </span>
            </Link>
            <span className="thread-category">{getCategoryLabel(thread.category)}</span>
            <span className="thread-time">{getTimeAgo(thread.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="thread-stats">
        <div className="stat">
          <Heart size={20} />
          <span className="stat-count">{thread.likes || 0}</span>
        </div>
        <div className="stat">
          <Reply size={20} />
          <span className="stat-count">{thread.replies || 0}</span>
        </div>
      </div>
    </div>
  );
}

