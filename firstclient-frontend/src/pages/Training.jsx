import { useEffect, useState } from "react";
import API from "../api";
import "./Training.css"; // We'll create this next

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loader">Loading School Content...</div>;

  return (
    <div className="school-page-wrapper">
      <header className="school-hero">
        <h1>Pastry Training School</h1>
        <p>Master the art of baking with Essence Creations</p>
      </header>

      <div className="school-container">
        {sessions.map((session) => (
          <article key={session.id} className="training-section">
            <div className="section-text">
              <h2>{session.title}</h2>
              <p>{session.description}</p>
            </div>

            <div className="section-gallery">
              {session.media && session.media.map((item) => (
                <div key={item.id} className="media-card">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      controls 
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
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
