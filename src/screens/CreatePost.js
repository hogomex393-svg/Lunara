import React, { useRef } from 'react';

export default function CreatePost({
  navigate, animKey,
  text, setText, photo, setPhoto,
  setCommunityPosts,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className="create-post screen-enter" key={animKey}>
      <div className="create-post-header">
        <button
          className="back-btn"
          onClick={() => {
            setText('');
            setPhoto(null);
            navigate('community');
          }}
        >
          ←
        </button>
        <button
          className="btn-primary"
          style={{ padding: '10px 24px', flex: 'none' }}
          disabled={!text.trim()}
          onClick={() => {
            const newPost = {
              id: Date.now(),
              author: 'You',
              avatar: '🌙',
              time: 'Just now',
              text: text,
              likes: 0,
              comments: 0,
              commentsList: [],
              hasImage: !!photo,
              imageUrl: photo,
            };
            setCommunityPosts((p) => [newPost, ...p]);
            setText('');
            setPhoto(null);
            navigate('community');
          }}
        >
          Post
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div className="share-bar-avatar" style={{ width: 40, height: 40 }}>🌙</div>
        <textarea
          placeholder="What's on your mind? Your post will be anonymous..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
      </div>

      {photo && (
        <div className="photo-preview">
          <img src={photo} alt="Selected" className="photo-preview-img" />
          <button className="remove-photo" onClick={() => setPhoto(null)}>✕</button>
        </div>
      )}

      <div className="add-photo-bar">
        <button className="add-photo-btn" onClick={() => fileInputRef.current.click()}>
          📷 Add Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
