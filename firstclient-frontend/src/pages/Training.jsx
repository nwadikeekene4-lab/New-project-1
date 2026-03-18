import { useEffect, useState } from "react";
import API from "../api"; 
import "./Training.css";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryMedia, setGalleryMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const openVideoGallery = (videos, index = 0) => {
    setGalleryMedia(videos);
    setCurrentIndex(index);
  };

  const nextVideo = () => setCurrentIndex((prev) => (prev + 1) % galleryMedia.length);
  const prevVideo = () => setCurrentIndex((prev) => (prev - 1 + galleryMedia.length) % galleryMedia.length);

  if (loading) {
    return (
      <div className="school-loading">
        <div className="pastry-spinner"></div>
        <p>Preheating the oven...</p>
      </div>
    );
  }

  return (
    <div className="school-page-wrapper">
      <header className="school-hero">
        <div className="hero-overlay">
          <h1>Pastry Training School</h1>
          <p>Master the art of baking with Essence Creations</p>
        </div>
      </header>

      <div className="school-container">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            // Separate Images and Videos for the specific "Blog" order
            const images = session.trainingMedia?.filter(m => !m.url.match(/\.(mp4|mov|webm)$/i)) || [];
            const videos = session.trainingMedia?.filter(m => m.url.match(/\.(mp4|mov|webm)$/i)) || [];

            return (
              <article key={session.id} className="session-blog-card">
                {/* 1. Header & Category */}
                <div className="card-header">
                  <span className="category-tag">{session.subHeader || "Masterclass"}</span>
                  <h2 className="session-title">{session.title}</h2>
                </div>

                {/* 2. Image Showcase (Grid) */}
                {images.length > 0 && (
                  <div className="image-showcase">
                    <img src={images[0].url} alt={session.title} className="main-featured-img" />
                    {images.length > 1 && (
                      <div className="mini-image-strip">
                        {images.slice(1, 4).map((img, idx) => (
                          <img key={idx} src={img.url} alt="Baking detail" />
                        ))}
                        {images.length > 4 && <div className="more-count">+{images.length - 4}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. The Write-up */}
                <div className="session-content">
                  <p className="description-text">{session.description}</p>
                </div>

                {/* 4. Video Gallery Trigger */}
                {videos.length > 0 && (
                  <div className="video-section">
                    <h3>Course Videos ({videos.length})</h3>
                    <div className="video-grid">
                      {videos.map((vid, idx) => (
                        <div key={idx} className="video-play-card" onClick={() => openVideoGallery(videos, idx)}>
                          <div className="play-button">▶</div>
                          <span className="play-label">Watch Lesson {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="no-content">
            <h3>New Classes Coming Soon!</h3>
            <p>Our instructors are currently filming new techniques.</p>
          </div>
        )}

        <section className="enrollment-cta">
            <span className="cta-badge">Enrollment Open</span>
            <h2>Start Your Professional Journey</h2>
            <p>Learn the secrets of perfect pastries today.</p>
            <a href="https://wa.me/2348028136371" className="whatsapp-btn">Enroll via WhatsApp</a>
        </section>
      </div>

      {/* 🎥 Video Gallery Modal (Sync with Admin Style) */}
      {galleryMedia && (
        <div className="school-modal" onClick={() => setGalleryMedia(null)}>
          <button className="modal-close">✕</button>
          <button className="modal-nav prev" onClick={(e) => { e.stopPropagation(); prevVideo(); }}>‹</button>
          <button className="modal-nav next" onClick={(e) => { e.stopPropagation(); nextVideo(); }}>›</button>
          
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <video src={galleryMedia[currentIndex].url} controls autoPlay className="modal-video" />
            <div className="modal-counter">Lesson {currentIndex + 1} of {galleryMedia.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
