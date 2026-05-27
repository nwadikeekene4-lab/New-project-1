import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';


export default function App() {
  // This state holds the link of the project you want to display live
  const [activeDemoUrl, setActiveDemoUrl] = useState('');

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* Pass the function down to Projects so the buttons work */}
        <Projects onSelectDemo={setActiveDemoUrl} />

        {/* This section only appears if a Live Demo button is clicked */}
        {activeDemoUrl && (
          <section id="live-demo-view" className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Live Project Preview</h2>
            <div className="iframe-wrapper">
              <iframe 
                src={activeDemoUrl} 
                title="Project Live Demo"
                width="100%" 
                height="600px" 
                style={{ border: '2px solid #334155', borderRadius: '8px', background: '#fff' }}
              />
            </div>
            <button 
              className="btn-secondary" 
              style={{ marginTop: '1.5rem' }} 
              onClick={() => setActiveDemoUrl('')}
            >
              Close Live Preview
            </button>
          </section>
        )}

        
      </main>
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #334155', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        &copy; 2026 Nwadike Ekene Peter. Built with React. Hosted on Vercel.
      </footer>
    </>
  );
}