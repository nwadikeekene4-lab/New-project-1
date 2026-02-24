import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState([
    { id: 1, name: "Chidi Oke", text: "The Agege bread is always fresh! Best bakery in the area. I highly recommend it for any breakfast.", date: "Feb 10" },
    { id: 2, name: "Amina Bello", text: "Love the provision section. Very organized and they always have what I need for my home.", date: "Feb 09" },
    { id: 3, name: "Tunde Williams", text: "Finally found a place that sells high-quality provisions at fair prices. The service is top-notch!", date: "Feb 05" }
  ]);

  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newText) return;
    const newEntry = { id: Date.now(), name: newName, text: newText, date: "Just now" };
    setReviews([newEntry, ...reviews]);
    setNewName('');
    setNewText('');
  };

  return (
    <div className="reviews-wrapper">
      <div className="reviews-container">
        
        {/* Consistent Konga Navigation Section */}
        <div className="nav-section">
          <button className="nav-back-btn" onClick={() => navigate('/hub')}>
            <span className="arrow-icon">←</span> Back to Hub
          </button>
        </div>

        <div className="reviews-main-content">
          <header className="reviews-header">
            <h1 className="reviews-title">Customer Reviews</h1>
            <p className="reviews-subtitle">Real feedback from the Heritage community</p>
          </header>

          {/* REVIEWS GRID - Now side-by-side on desktop */}
          <div className="reviews-grid">
            {reviews.map((rev) => (
              <div key={rev.id} className="review-placard">
                <div className="placard-header">
                  <FaUserCircle className="user-icon" />
                  <div className="user-meta">
                    <h4>{rev.name}</h4>
                    <span>{rev.date}</span>
                  </div>
                </div>
                <p className="review-body">{rev.text}</p>
              </div>
            ))}
          </div>

          {/* WRITE A REVIEW SECTION */}
          <section className="write-review-section">
            <div className="write-card">
              <div className="form-title">
                <FaEdit className="edit-icon" /> <h3>Leave a Review</h3>
              </div>
              <form onSubmit={handleSubmit} className="review-form">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required 
                />
                <textarea 
                  placeholder="Share your experience with us..." 
                  rows="3"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  required
                ></textarea>
                <button type="submit" className="post-btn">
                  Post Review <FaPaperPlane />
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;