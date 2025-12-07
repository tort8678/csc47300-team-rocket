import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Eye, ArrowLeft, Edit, Trash, X, Reply, SendHorizontal, Download, Check } from 'lucide-react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import apiService from '../../services/api';
import { useModal } from '../../contexts/ModalContext';
import type { Thread, Comment, User } from '../../types/api.types';
import '../../styles/main.css';
import '../../styles/thread.css';

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

export default function ThreadDetail() {
  const { showModal, showConfirm } = useModal();
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [attachmentNames, setAttachmentNames] = useState<Record<string, string>>({});

  // Fetch attachment filenames
  useEffect(() => {
    if (thread?.attachments && thread.attachments.length > 0) {
      const fetchAttachmentNames = async () => {
        const names: Record<string, string> = {};
        await Promise.all(
          thread.attachments!.map(async (fileId) => {
            try {
              const response = await fetch(`http://localhost:3000/api/threads/attachments/${fileId}/info`);
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                  names[fileId] = data.data.filename;
                }
              }
            } catch (error) {
              console.error(`Error fetching attachment info for ${fileId}:`, error);
            }
          })
        );
        setAttachmentNames(names);
      };
      fetchAttachmentNames();
    }
  }, [thread?.attachments]);

  useEffect(() => {
    if (thread) {
      document.title = `${thread.title} - DamIt`;
    } else {
      document.title = 'Thread - DamIt';
    }
  }, [thread]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch full user data from API
      apiService.getCurrentUser().then(response => {
        if (response.success && response.data) {
          setCurrentUser(response.data);
        }
      }).catch(() => {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }

    if (threadId) {
      const viewedKey = `viewed_thread_${threadId}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed) {
        sessionStorage.setItem(viewedKey, 'true');
        loadThread(true);
      } else {
        loadThread(false);
      }
    }
  }, [threadId]);

  const loadThread = async (incrementView: boolean = false) => {
    if (!threadId) return;

    try {
      setLoading(true);
      const [threadResponse, commentsResponse] = await Promise.all([
        apiService.getThreadById(threadId, incrementView),
        apiService.getThreadComments(threadId)
      ]);

      if (threadResponse.success && threadResponse.data) {
        setThread(threadResponse.data);
      }

      if (commentsResponse.success && commentsResponse.data) {
        setComments(commentsResponse.data);
      }
    } catch (err) {
      setError('Failed to load thread');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!threadId || !currentUser) {
      navigate('/Login');
      return;
    }

    try {
      const response = await apiService.toggleLikeThread(threadId);
      if (response.success && thread && response.data) {
        setThread({
          ...thread,
          likes: response.data.likes,
          userLiked: response.data.userLiked
        });
      }
    } catch (err) {
      console.error('Failed to like thread:', err);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      navigate('/Login');
      return;
    }

    try {
      const response = await apiService.toggleLikeComment(commentId);
      if (response.success) {
        const updateLikes = (list: CommentWithReplies[]): CommentWithReplies[] =>
          list.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: response.data?.likes ?? c.likes,
                  userLiked: response.data?.userLiked ?? !c.userLiked
                }
              : {
                  ...c,
                  replies: updateLikes(c.replies)
                }
          );

        setComments(updateLikes(comments));
      }
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId || !newComment.trim() || !currentUser) return;

    try {
      const response = await apiService.createComment(threadId, {
        content: newComment
      });

      if (response.success) {
        setNewComment('');
        loadThread();
      }
    } catch (err) {
      console.error('Failed to create comment:', err);
      showModal('Failed to post comment.', 'error');
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!threadId || !replyContent.trim() || !currentUser) return;

    try {
      const response = await apiService.createComment(threadId, {
        content: replyContent,
        parentCommentId
      });

      if (response.success) {
        setReplyContent('');
        setReplyingTo(null);
        loadThread();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
      showModal('Failed to post reply.', 'error');
    }
  };

  const handleDeleteThread = async () => {
    if (!threadId || !currentUser) return;
    const confirmed = await showConfirm('Are you sure you want to delete this thread?', 'Confirm Delete');
    if (!confirmed) return;

    try {
      const response = await apiService.deleteThread(threadId);
      if (response.success) navigate('/threads');
    } catch (err) {
      console.error('Failed to delete thread:', err);
      showModal('Failed to delete thread.', 'error');
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getCategoryLabel = (categoryValue: string) => {
    const map: Record<string, string> = {
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
    return map[categoryValue] || categoryValue;
  };


  const renderComment = (comment: CommentWithReplies, depth: number = 0) => {
    const isOwn = currentUser && comment.author?.id === currentUser.id;
    const admin = currentUser?.role?.startsWith('admin');
    const canEdit = isOwn || admin;

    const expanded = expandedReplies.has(comment.id);
    const replyCount = comment.replies?.length || 0;

    return (
      <div key={comment.id}>
        <div className={`comment-item ${depth > 0 ? 'nested' : ''}`}>
          <div>
            <div className="comment-header">
            <Link to={`/profile/${comment.author?.username || 'unknown'}`} className="comment-author">
              {comment.author?.username || 'Unknown'}
            </Link>
            <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
          </div>
          <div className="comment-content">{comment.content}</div>
          </div>
          <div className="comment-actions">
            <button
              onClick={() => handleCommentLike(comment.id)}
              className={`like-btn ${comment.userLiked ? 'liked' : ''}`}
            >
              <Heart size={20} fill={comment.userLiked ? '#fdcffa' : 'none'} />
              {comment.likes || 0}
            </button>

            {currentUser && (
              <button
              onClick={() => {
                const isSameComment = replyingTo === comment.id;
            
                if (isSameComment) {
                  // Toggle off: close reply box + collapse replies
                  setReplyingTo(null);
                  setExpandedReplies(prev => {
                    const copy = new Set(prev);
                    copy.delete(comment.id);
                    return copy;
                  });
                } else {
                  // Switch to another comment's reply box
                  setReplyingTo(comment.id);
            
                  // Always expand replies for this comment
                  setExpandedReplies(prev => {
                    const copy = new Set(prev);
                    copy.add(comment.id);
                    return copy;
                  });
                }
              }}
            >
              <Reply size={24} />
              {replyCount}
            </button>
            
            )}

            {canEdit && (
              <button
                className="delete-comment-btn"
                onClick={async () => {
                  const confirmed = await showConfirm('Delete this comment?', 'Confirm Delete');
                  if (!confirmed) return;
                  try {
                    await apiService.deleteComment(comment.id);
                    loadThread();
                  } catch (err) {
                    console.error('Failed to delete comment:', err);
                  }
                }}
              >
                <Trash size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
{expanded && (
  <div className="comment-replies" style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
    
    {/* Reply Form FIRST */}
    {replyingTo === comment.id && (
      <div className="reply-form" style={{ marginBottom: "0.5rem" }}>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
        />
        <div className="reply-actions">
          <button
            onClick={() => {
              setReplyingTo(null);
              setReplyContent('');
            }}
            className="btn btn-secondary btn-sm"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => handleSubmitReply(comment.id)}
            className="btn btn-primary btn-sm"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </div>
    )}

    {/* Then show all child replies */}
    {(comment.replies || []).map((reply) => renderComment(reply, depth + 1))}
    
  </div>
)}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container loading-container">
          <p>Loading thread...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div>
        <Header />
        <main className="container error-container">
          <p>{error || 'Thread not found'}</p>
          <Link to="/threads">Back to Threads</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const authorId = typeof thread.author === 'object' ? thread.author.id : thread.author;
  const isOwnThread = currentUser && authorId === currentUser.id;
  const canEditThread = isOwnThread || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';
  const canModerate = isAdmin && thread.status && (thread.status === 'pending' || thread.status === 'rejected');

  const handleApprove = async () => {
    if (!threadId || !isAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/threads/admin/${threadId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        showModal('Thread approved successfully!', 'success');
        loadThread(false);
      } else {
        throw new Error('Failed to approve thread');
      }
    } catch (error) {
      console.error('Error approving thread:', error);
      showModal('Failed to approve thread. Please try again.', 'error');
    }
  };

  const handleReject = async () => {
    if (!threadId || !isAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/threads/admin/${threadId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        showModal('Thread rejected.', 'success');
        loadThread(false);
      } else {
        throw new Error('Failed to reject thread');
      }
    } catch (error) {
      console.error('Error rejecting thread:', error);
      showModal('Failed to reject thread. Please try again.', 'error');
    }
  };

  return (
    <div>
      <Header />
      <main className="container" style={{ padding: '2rem' }}>
        <Link to="/threads" className="back-link">
          <ArrowLeft size={20} />
          Back to Threads
        </Link>

        {canModerate && (
            <div style={{
              margin: '1rem 0',
              padding: '1rem',
              background: 'rgba(255, 193, 7, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 193, 7, 0.5)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              flexDirection: 'column'
            }}>
              <span style={{ color: '#ffc107', fontWeight: 500 }}>
                Admin Actions
              </span>
              <div
              style={{ display: 'flex',
                width: '100%',
                gap: '25px',
                justifyContent: 'center'}}>
              <button
                onClick={handleReject}
                className="post-action-btn"
                style={{maxWidth: '25%'}}
              >
                <X size={18} />
              </button>
              <button
                onClick={handleApprove}
                className="post-action-btn approve"
                style={{maxWidth: '25%'}}
              >
                <Check size={18} />
              </button>
              </div>
            </div>
          )}
        <article className="thread-detail">
          <div className="thread-header">
            <h1>{thread.title}</h1>
            <div className="thread-meta">
              <Link to={`/profile/${typeof thread.author === 'object' ? thread.author.username : thread.author}`}>
                {typeof thread.author === 'object' ? thread.author.username : thread.author}
              </Link>
              <span className="thread-category">{getCategoryLabel(thread.category)}</span>
              <span>{getTimeAgo(thread.createdAt)}</span>
            </div>
          </div>

          <div className="thread-content">{thread.content}</div>

          {thread.attachments && thread.attachments.length > 0 && (
            <div className="thread-attachments" style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {thread.attachments.map((fileId, index) => {
                  const attachmentUrl = `http://localhost:3000/api/threads/attachments/${fileId}`;
                  const fileName = attachmentNames[fileId] || `Attachment ${index + 1}`;
                  return (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      color: '#fdcffa'
                    }}>
                      <Download size={16} />
                      <a 
                        href={attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          textDecoration: 'none',
                          color: '#fdcffa',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span>{fileName}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="thread-actions">
            <button onClick={handleLike} className={`like-btn ${thread.userLiked ? 'liked' : ''}`}>
              <Heart size={25} fill={thread.userLiked ? '#fdcffa' : 'none'} />
              {thread.likes}
            </button>

            <div className="thread-stat">
              <Reply size={25} />
              {thread.replies}
            </div>

            <div className="thread-stat">
              <Eye size={25} />
              {thread.views}
            </div>

            {canEditThread && (
              <div className="thread-edit-actions">
                <Link to={`/thread/${threadId}/edit`} className="edit-link">
                  <Edit size={25} />
                </Link>
                <button onClick={handleDeleteThread} className="delete-btn">
                  <Trash size={25} />
                </button>
              </div>
            )}
          </div>
        </article>
        {(thread.status === 'approved') && (
        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>

          {currentUser ? (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button type="submit" className="btn btn-primary">
                <SendHorizontal size={18} />
              </button>
            </form>
          ) : (
            <p className="login-prompt">
              <Link to="/Login">Log in</Link> to post a comment
            </p>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="comments-empty">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </section>
        )}
      </main>
      <Footer />
    </div>
  );
}