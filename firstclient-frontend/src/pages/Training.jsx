import { useEffect, useState } from "react";
import API from "../api"; // Keeping your existing API instance
import "./Training.css";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        // This hits your backend: https://firstclient-backend.onrender.com/api/training
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

  if (loading) return <div className="loader">Loading School Content...</div>;

  return (
    <div className="school-page-wrapper">
      <header className="school-hero">
        <h1>Pastry Training School</h1>
        <p>Master the art of baking with Essence Creations</p>
      </header>

      <div className="school-container">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <article key={session.id} className="training-section">
              <div className="section-text">
                <span className="section-badge">Masterclass Session</span>
                <h2>{session.title}</h2>
                <p>{session.description}</p>
              </div>

              {/* The gallery now loops through the media array associated with this session */}
              <div className="section-gallery">
                {session.media && session.media.length > 0 ? (
                  session.media.map((item) => (
                    <div key={item.id} className="media-card">
                      {item.type === 'video' ? (
                        <video 
                          src={item.url} 
                          controls 
                          controlsList="nodownload"
                          playsInline
                          webkit-playsinline="true"
                          className="school-media" 
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={item.url} 
                          alt={session.title} 
                          className="school-media" 
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-media-text">No media available for this session.</p>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="no-content">
            <p>Our upcoming masterclasses are being prepared. Stay tuned!</p>
          </div>
        )}

        {/* --- 🎯 INTEGRATED: ENROLLMENT CALL TO ACTION --- */}
        <section className="enrollment-cta">
          <div className="cta-content">
            <span className="cta-badge">Enrollment Open</span>
            <h2>Ready to start your baking journey?</h2>
            <p>
              Join our next masterclass and learn the secrets of Essence Creations. 
              Click below to chat with our instructors about pricing and schedules.
            </p>
            
            <a 
              href="https://wa.me/2348028136371?text=Hello!%20I'm%20interested%20in%20enrolling%20in%20the%20Pastry%20Training%20School%20at%20Essence%20Creations." 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-enroll-btn"
            >
              <span className="whatsapp-icon">💬</span>
              Enroll via WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
