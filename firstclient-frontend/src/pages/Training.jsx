import { useEffect, useState } from "react";
import API from "../api"; 
import "./Training.css";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track which video is being viewed for each post specifically
  const [videoIndices, setVideoIndices] = useState({});

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

  const handleNextVideo = (sessionId, totalVideos) => {
    setVideoIndices(prev => ({
      ...prev,
      [sessionId]: ((prev[sessionId] || 0) + 1) % totalVideos
    }));
  };

  const handlePrevVideo = (sessionId, totalVideos) => {
    setVideoIndices(prev => ({
      ...prev,
      [sessionId]: ((prev[sessionId] || 0) - 1 + totalVideos) % totalVideos
    }));
  };

  if (loading) {
    return (
      <div className="school-loader-container">
        <div className="pastry-spinner"></div>
        <p>Loading Masterclasses...</p>
      </div>
    );
  }

  return (
    <div className="school-page-wrapper">
      <header className="school-hero">
        <div className="hero-content">
          <h1>Pastry Training School</h1>
          <p>Master the art of baking with Essence Creations</p>
        </div>
      </header>

      <div className="school-container">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            const images = session.trainingMedia?.filter(m => !m.url.match(/\.(mp4|mov|webm)$/i)) || [];
            const videos = session.trainingMedia?.filter(m => m.url.match(/\.(mp4|mov|webm)$/i)) || [];
            const currentVidIdx = videoIndices[session.id] || 0;

            return (
              <article key={session.id} className="social-post-card">
                {/* 1. Header Section */}
                <div className="post-header">
                  <div className="post-avatar">EC</div>
                  <div className="post-meta">
                    <h2 className="post-title">{session.title}</h2>
                    <span className="post-category">{session.subHeader || "Technique"}</span>
                  </div>
                </div>

                {/* 2. Image Gallery (Blog Style) */}
                {images.length > 0 && (
                  <div className="post-image-area">
                    <img src={images[0].url} alt="" className="featured-image" />
                    {images.length > 1 && (
                      <div className="image-counter">+{images.length - 1} Photos</div>
                    )}
                  </div>
                )}

                {/* 3. Description Write-up */}
                <div className="post-caption">
                  <p>{session.description}</p>
                </div>

                {/* 4. Integrated Video Gallery (Live on Page) */}
                {videos.length > 0 && (
                  <div className="post-video-gallery">
                    <div className="video-viewer">
                      <video 
                        key={videos[currentVidIdx].url}
                        src={videos[currentVidIdx].url} 
                        controls 
                        controlsList="nodownload"
                        className="live-video"
                      />
                      
                      {videos.length > 1 && (
                        <>
                          <button className="nav-arrow left" onClick={() => handlePrevVideo(session.id, videos.length)}>‹</button>
                          <button className="nav-arrow right" onClick={() => handleNextVideo(session.id, videos.length)}>›</button>
                          <div className="video-indicator">
                            {currentVidIdx + 1} / {videos.length} Videos
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="empty-feed">No posts yet. Check back soon!</div>
        )}

        <section className="enrollment-cta">
          <div className="cta-inner">
            <span className="cta-badge">Enrollment Open</span>
            <h2>Start Your Baking Journey</h2>
            <p>Ready to bake like a pro? Chat with our experts today.</p>
            <a href="https://wa.me/2348028136371" className="whatsapp-btn">
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
