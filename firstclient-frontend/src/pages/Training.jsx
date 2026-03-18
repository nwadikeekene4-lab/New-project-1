import { useEffect, useState } from "react";
import API from "../api"; 
import "./Training.css";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoIndices, setVideoIndices] = useState({});
  const [visibleCount, setVisibleCount] = useState(6); // Show 6 initially
  const [expandedDesc, setExpandedDesc] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

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

    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = (id) => {
    if (likedPosts.includes(id)) return; 
    const newLiked = [...likedPosts, id];
    setLikedPosts(newLiked);
    localStorage.setItem("ec_liked_posts", JSON.stringify(newLiked));
  };

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
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
      <p>Preparing the Masterclass...</p>
    </div>
  );

  return (
    <div className="school-page-wrapper" onContextMenu={(e) => e.preventDefault()}>
      <header className="school-hero">
        <div className="hero-content">
          <span className="hero-badge">Professional Training</span>
          <h1>Essence Pastry School</h1>
          <p>Master world-class techniques from the comfort of your kitchen.</p>
        </div>
      </header>

      <div className="school-container">
        {sessions.slice(0, visibleCount).map((session) => {
          const images = session.trainingMedia?.filter(m => !m.url.match(/\.(mp4|mov|webm)$/i)) || [];
          const videos = session.trainingMedia?.filter(m => m.url.match(/\.(mp4|mov|webm)$/i)) || [];
          const currentVidIdx = videoIndices[session.id] || 0;
          const isLiked = likedPosts.includes(session.id);
          const isExpanded = expandedDesc[session.id];

          return (
            <article key={session.id} className="vimeo-post-card">
              {/* Media Section: Cinematic 16:9 */}
              <div className="vimeo-media-box">
                {videos.length > 0 ? (
                  <div className="video-player-container">
                    <video 
                      key={videos[currentVidIdx].url}
                      src={videos[currentVidIdx].url} 
                      controls 
                      controlsList="nodownload"
                      disablePictureInPicture
                      className="vimeo-media"
                    />
                    {videos.length > 1 && (
                      <div className="media-nav-overlay">
                        <button onClick={() => handlePrevVideo(session.id, videos.length)}>‹</button>
                        <span className="media-counter">{currentVidIdx + 1}/{videos.length}</span>
                        <button onClick={() => handleNextVideo(session.id, videos.length)}>›</button>
                      </div>
                    )}
                  </div>
                ) : images.length > 0 ? (
                  <img src={images[0].url} alt="" className="vimeo-media" />
                ) : null}
              </div>

              {/* Info Section */}
              <div className="vimeo-info">
                <div className="info-header">
                  <div className="avatar-small">EC</div>
                  <div className="title-area">
                    <h2 className="vimeo-title">{session.title}</h2>
                    <span className="vimeo-category">{session.subHeader || "Technique"}</span>
                  </div>
                </div>

                <div className={`vimeo-description ${isExpanded ? 'is-open' : ''}`}>
                  <p>{session.description}</p>
                </div>
                
                {session.description?.length > 150 && (
                  <button className="read-more-link" onClick={() => toggleDesc(session.id)}>
                    {isExpanded ? "Show Less" : "Read More..."}
                  </button>
                )}

                <div className="vimeo-actions">
                  <button 
                    className={`vimeo-like-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={() => handleLike(session.id)}
                  >
                    {isLiked ? '❤️ Liked' : '🤍 Like'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More Button - Facebook Style */}
      {visibleCount < sessions.length && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 6)}>
            View More Classes
          </button>
        </div>
      )}

      {/* Floating Buttons */}
      {showScrollTop && (
        <button className="scroll-up" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑
        </button>
      )}

      <a href="https://wa.me/2348028136371" target="_blank" rel="noopener noreferrer" className="vimeo-whatsapp">
        💬 <span className="wa-btn-text">Enroll Now</span>
      </a>
    </div>
  );
}
