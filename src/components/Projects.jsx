import React from 'react';
import './Projects.css';

const myProjects = [
  {
    id: 1,
    title: "Essence creations e-commerce website",
    description: "A fast, responsive shopping application featuring clean state management and search filtering.",
    tags: ["React", "CSS Grid"],
    // Swapped: This now points directly to your online public video file on GitHub
    videoUrl: "https://raw.githubusercontent.com/nwadikeekene4-lab/New-project-1/main/public/videos/video1.mp4",
    githubLink: "https://github.com/nwadikeekene4-lab/New-project-1"
  }
];

export default function Projects() {
  return (
    <section id="projects" className="container">
      <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>Featured Projects</h2>
      <div className="projects-grid">
        {myProjects.map((project) => (
          <div key={project.id} className="project-card">
            
            {/* Standard HTML5 Mobile-Friendly Video Player */}
            <div className="video-container" style={{ backgroundColor: '#000' }}>
              <video 
                src={project.videoUrl} 
                controls 
                playsInline 
                preload="metadata"
                width="100%" 
                style={{ display: 'block', aspectRatio: '16/9', objectFit: 'cover', borderBottom: '1px solid #334155' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tags">
                {project.tags.map((tag, index) => <span key={index}>{tag}</span>)}
              </div>
              <div className="project-links">
                <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>GitHub</a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}