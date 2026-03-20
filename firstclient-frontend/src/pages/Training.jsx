import { useEffect, useState } from "react";
import API from "../api"; 
import "./Training.css";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoIndices, setVideoIndices] = useState({});
  const [imageIndices, setImageIndices] = useState({}); // New: Logic for image gallery
  const [visibleCount, setVisibleCount] = useState(6); 
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
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchTrainingData();

    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = (id) => {
    setLikedPosts(prev => {
      const isLiked = prev.includes(id);
      const updated = isLiked ? prev.filter(postId => postId !== id) : [...prev, id];
      localStorage.setItem("ec_liked_posts", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Generic Navigation Logic for both Images and Videos
  const handleNext = (sessionId, total, type) => {
    const setter = type === 'video' ? setVideoIndices : setImageIndices;
    setter(prev => ({ ...prev, [sessionId]: ((prev[sessionId] || 0) + 1) % total }));
  };

  const handlePrev = (sessionId, total, type) => {
    const setter = type === 'video' ? setVideoIndices : setImageIndices;
    setter(prev => ({ ...prev, [sessionId]: ((prev[sessionId] || 0) - 1 + total) % total }));
  };

  if (loading) return (
    <div className="school-loader-container">
      <div className="pastry-spinner"></div>
      <p className="loading-text">Essence Pastry School</p>
    </div>
  );

  return (
    <div className="school-page-wrapper" onContextMenu={(e) => e.preventDefault()}>
      <header className="school-hero">
        <div className="hero-content">
          <h1>Essence Pastry School</h1>
        </div>
      </header>

      <div className="school-container">
        {sessions.slice(0, visibleCount).map((session) => {
          const images = session.trainingMedia?.filter(m => !m.url.match(/\.(mp4|mov|webm)$/i)) || [];
          const videos = session.trainingMedia?.filter(m => m.url.match(/\.(mp4|mov|webm)$/i)) || [];
          
          const currentVidIdx = videoIndices[session.id] || 0;
          const currentImgIdx = imageIndices[session.id] || 0;
          
          const isLiked = likedPosts.includes(session.id);
          const isExpanded = expandedDesc[session.id];

          return (
            <article key={session.id} className="vimeo-post-card">
              
              {/* Media: Image Gallery with working arrows */}
              {images.length > 0 && (
                <div className="vimeo-media-box image-box">
                  <img src={images[currentImgIdx].url} alt="" className="vimeo-media" draggable="false" />
                  {images.length > 1 && (
                    <div className="vimeo-nav-arrows">
                      <button className="nav-pill left" onClick={() => handlePrev(session.id, images.length, 'image')}>‹</button>
                      <span className="vimeo-count-tag">{currentImgIdx + 1}/{images.length}</span>
                      <button className="nav-pill right" onClick={() => handleNext(session.id, images.length, 'image')}>›</button>
                    </div>
                  )}
                </div>
              )}

              {/* Media: Video Gallery with working arrows */}
              {videos.length > 0 && (
                <div className="vimeo-media-box video-box">
                  <video 
                    key={videos[currentVidIdx].url}
                    src={videos[currentVidIdx].url} 
                    controls 
                    controlsList="nodownload"
                    playsInline
                    className="vimeo-media"
                  />
                  {videos.length > 1 && (
                    <div className="vimeo-nav-arrows">
                      <button className="nav-pill left" onClick={() => handlePrev(session.id, videos.length, 'video')}>‹</button>
                      <span className="vimeo-count-tag">{currentVidIdx + 1}/{videos.length}</span>
                      <button className="nav-pill right" onClick={() => handleNext(session.id, videos.length, 'video')}>›</button>
                    </div>
                  )}
                </div>
              )}

              <div className="vimeo-info">
                <div className="info-header">
                  <div className="avatar-small">EC</div>
                  <div className="title-area">
                    <h2 className="vimeo-title">{session.title}</h2>
                    <span className="vimeo-category">{session.subHeader || "Class"}</span>
                  </div>
                </div>

                <div className={`vimeo-description ${isExpanded ? 'is-open' : ''}`}>
                  <p>{session.description}</p>
                </div>
                
                {session.description?.length > 120 && (
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

      {visibleCount < sessions.length && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 6)}>
            View More Sessions
          </button>
        </div>
      )}

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
