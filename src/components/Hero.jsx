import React from 'react';

export default function Hero() {
  return (
    <section id="about" className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', paddingTop: '8rem' }}>
      <div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
          Hi, I'm <span style={{ color: 'var(--accent)' }}>Nwadike Ekene Peter</span>
        </h1>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Frontend Web Developer
        </h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          I build high-performance, responsive and secured full stack website using React.
        </p>
        <a href="#projects" className="btn">View My Work</a>
      </div>
    </section>
  );
}