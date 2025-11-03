import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Eye } from 'lucide-react';
import Header from "../../components/header";
import Footer from "../../components/footer";
import '../../styles/threads.css';
import type { Thread } from "../../types/types";

export default function Threads() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [sort, setSort] = useState<'recent' | 'popular' | 'replies' | 'views'>('recent');

  useEffect(() => {
    // load threads from localStorage (keys starting with 'thread_')
    const loaded: Thread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('thread_')) {
        try {
          const t = JSON.parse(localStorage.getItem(key) as string) as Thread;
          // ensure createdAt is Date or parsable
          if (t) loaded.push(t);
        } catch (e) {
          // ignore malformed entries
          // console.warn('Malformed thread in localStorage', key);
        }
      }
    }

    // sort by createdAt desc by default
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setThreads(loaded);
  }, []);

  const sortedThreads = useMemo(() => {
    // currently only supports 'recent' sorting; placeholders for others
    if (sort === 'recent') return threads;
    // for 'popular'/'replies'/'views' we don't have metrics stored, so return threads unchanged
    return threads;
  }, [threads, sort]);

  const handleNewThread = () => {
    // redirect to create thread route
    navigate('/createThread');
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
          <button onClick={handleNewThread} className="new-thread-btn">+ New Thread</button>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Following</button>
            <button className="filter-btn">My Threads</button>
          </div>
          <div className="sort-group">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
              <option value="views">Most Views</option>
            </select>
          </div>
        </div>

        <div className="threads-list">
          {sortedThreads.length === 0 ? (
            <div className="empty-message">No threads yet. Be the first to post!</div>
          ) : (
            sortedThreads.map((thread) => (
              <div key={thread.id} className={`thread-item ${/* placeholder classes based on time */ ''}`}>
                <div className="thread-main">
                  <div className="thread-avatar">{(thread.title || '').slice(0,2).toUpperCase()}</div>
                  <div className="thread-content">
                    <h3>
                      <Link to={`/thread/${encodeURIComponent(thread.id)}`}>{thread.title}</Link>
                    </h3>
                    <p className="thread-preview">{thread.content.substring(0, 150)}</p>
                    <div className="thread-meta">
                      <span className="thread-author">{(thread as Thread).author ?? 'unknown'}</span>
                      <span className="thread-category">{thread.category}</span>
                      <span className="thread-time">{new Date(thread.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="thread-stats">
                  <div className="stat">
                    <MessageSquare size={20}/>
                    <span className="stat-count">{(thread as Thread).replies ?? 0}</span>
                  </div>
                  <div className="stat">
                    <Eye size={20}/>
                    <span className="stat-count">{(thread as Thread).views ?? 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pagination">
          <button className="page-btn" disabled>Previous</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <button className="page-btn">5</button>
          <button className="page-btn">Next</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}