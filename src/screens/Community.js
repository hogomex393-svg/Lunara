import React, { useState } from 'react';

export default function Community({
  navigate, animKey, posts, likedPosts, setLikedPosts, setReportPost, setCommunityPosts,
}) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  const toggleComments = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const submitComment = (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments + 1,
              commentsList: [
                ...(p.commentsList || []),
                { id: Date.now(), author: 'You', avatar: '🌙', text, time: 'Just now' },
              ],
            }
          : p
      )
    );
    setCommentInputs((c) => ({ ...c, [postId]: '' }));
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({ title: 'Lunara Community', text: post.text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(post.text).catch(() => {});
    }
  };

  return (
    <div className="community screen-enter" key={animKey}>
      <h2 className="community-title">Community</h2>
      <p className="community-sub">Anonymous · Safe · Supportive</p>

      <button className="share-bar" onClick={() => navigate('createPost')}>
        <div className="share-bar-avatar">🌙</div>
        <span className="share-bar-text">Share your thoughts...</span>
      </button>

      {posts.map((post, i) => (
        <div key={post.id} className="post-card" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="post-header">
            <div className="post-avatar">{post.avatar}</div>
            <div>
              <div className="post-author">{post.author}</div>
              <div className="post-time">{post.time}</div>
            </div>
            <button
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)',
              }}
              onClick={() => setReportPost(post.id)}
            >
              ⋯
            </button>
          </div>

          <div className="post-text">{post.text}</div>

          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="post-image-real" />
          ) : post.hasImage ? (
            <div className="post-image">📷 Shared photo</div>
          ) : null}

          <div className="post-actions">
            <button
              className={`post-action ${likedPosts.has(post.id) ? 'liked' : ''}`}
              onClick={() => {
                setLikedPosts((s) => {
                  const n = new Set(s);
                  n.has(post.id) ? n.delete(post.id) : n.add(post.id);
                  return n;
                });
              }}
            >
              {likedPosts.has(post.id) ? '♥' : '♡'}{' '}
              {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
            </button>
            <button
              className={`post-action ${expandedPost === post.id ? 'liked' : ''}`}
              onClick={() => toggleComments(post.id)}
            >
              💬 {post.comments}
            </button>
            <button className="post-action" onClick={() => handleShare(post)}>
              ↗ Share
            </button>
          </div>

          {expandedPost === post.id && (
            <div className="comment-section">
              {(post.commentsList || []).length === 0 && (
                <p className="comment-empty">Be the first to comment</p>
              )}
              {(post.commentsList || []).map((c) => (
                <div key={c.id} className="comment-bubble">
                  <span className="comment-avatar">{c.avatar}</span>
                  <div className="comment-body">
                    <span className="comment-author">{c.author}</span>
                    <span className="comment-text">{c.text}</span>
                  </div>
                </div>
              ))}
              <div className="comment-input-row">
                <input
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) =>
                    setCommentInputs((c) => ({ ...c, [post.id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                />
                <button
                  className="comment-send"
                  onClick={() => submitComment(post.id)}
                  disabled={!(commentInputs[post.id] || '').trim()}
                >
                  ↑
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
