import { useEffect, useState } from "react";
import API from "../api"; 
import "./Training.css";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoIndices, setVideoIndices] = useState({});
  
  // Persistent Like System (Prevents double liking)
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem("ec_liked_posts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        const res = await API.get("/training");
        setSessions(res.data);
      } catch (err) {
        console.error("Error loading training school:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainingData();
  }, []);

  const handleLike = (id) => {
    if (likedPosts.includes(id)) return; 
    const newLiked = [...likedPosts, id];
    setLikedPosts(newLiked);
    localStorage.setItem("ec_liked_posts", JSON.stringify(newLiked));
  };

  const handleNextVideo = (sessionId, totalVideos) => {
    setVideoIndices(prev => ({ ...prev, [sessionId]: ((prev[sessionId] || 0) + 1) % totalVideos }));
  };

  const handlePrevVideo = (sessionId, totalVideos) => {
    setVideoIndices(prev => ({ ...prev, [sessionId]: ((prev[sessionId] || 0) - 1 + totalVideos) % totalVideos }));
  };

  if (loading) return (
    <div className="school-loader-container">
      <div className="pastry-spinner"></div>
      <p>Mastering the art...</p>
    </div>
  );

  return (
    <div className="school-page-wrapper" onContextMenu={(e) => e.preventDefault()}>
      <header className="school-hero">
        <div className="hero-content">
          <h1>Pastry Training School</h1>
          <p>Elevate your skills with Essence Creations</p>
        </div>
      </header>

      <div className="school-container">
        {sessions.map((session) => {
          // Identify media types
          const images = session.trainingMedia?.filter(m => !m.url.match(/\.(mp4|mov|webm)$/i)) || [];
          const videos = session.trainingMedia?.filter(m => m.url.match(/\.(mp4|mov|webm)$/i)) || [];
          const currentVidIdx = videoIndices[session.id] || 0;
          const isLiked = likedPosts.includes(session.id);

          return (
            <article key={session.id} className="social-post-card">
              <div className="post-header">
                <div className="post-avatar">EC</div>
                <div className="post-meta">
                  <h2 className="post-title">{session.title}</h2>
                  <span className="post-category">{session.subHeader || "Technique"}</span>
                </div>
              </div>

              {/* Moderate Image Height + Double Tap Like */}
              {images.length > 0 && (
                <div className="post-image-area" onDoubleClick={() => handleLike(session.id)}>
                  <img src={images[0].url} alt="" className="featured-image" draggable="false" />
                  {isLiked && <div className="heart-overlay">❤️</div>}
                  {images.length > 1 && <div className="image-counter">1 / {images.length}</div>}
                </div>
              )}

              <div className="post-caption">
                <p>{session.description}</p>
                <div className="post-actions">
                  <button 
                    className={`like-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={() => handleLike(session.id)}
                  >
                    {isLiked ? '❤️ Liked' : '🤍 Like'}
                  </button>
                </div>
              </div>

              {/* Protected Video Gallery */}
              {videos.length > 0 && (
                <div className="post-video-gallery">
                  <video 
                    key={videos[currentVidIdx].url}
                    src={videos[currentVidIdx].url} 
                    controls 
                    controlsList="nodownload nofullscreen"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="live-video"
                  />
                  {videos.length > 1 && (
                    <>
                      <button className="nav-arrow left" onClick={() => handlePrevVideo(session.id, videos.length)}>‹</button>
                      <button className="nav-arrow right" onClick={() => handleNextVideo(session.id, videos.length)}>›</button>
                      <div className="video-count-tag">{currentVidIdx + 1} / {videos.length}</div>
                    </>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* 🟢 FLOATABLE WHATSAPP BUBBLE */}
      <a 
        href="https://wa.me/2348028136371?text=Hello!%20I'm%20interested%20in%20enrolling%20in%20the%20Pastry%20Training%20School." 
        target="_blank" 
        rel="noopener noreferrer" 
        className="floating-whatsapp"
      >
        <span className="wa-icon">💬</span>
        <span className="wa-text">Enroll Now</span>
      </a>
    </div>
  );
}
