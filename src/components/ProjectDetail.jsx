import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) {
    return (
      <div className="error-page">
        <h1>Project Not Found</h1>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="project-detail-page fade-in">
      <div className="project-header" style={{ '--project-color': project.color }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        <div className="header-content">
          <div className="project-badge">{project.subtitle}</div>
          <h1 className="project-title">{project.title}</h1>
          <div className="project-tags">
            {project.tags.map(tag => (
              <span key={tag} className="project-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="project-main-content">
        <div className="project-info-grid">
          <div className="project-main-text">
            <h2>Overview</h2>
            <p className="project-long-desc">{project.longDescription}</p>
            
            <div className="project-features">
              <h2>Key Features</h2>
              <ul>
                <li>High Performance Architecture</li>
                <li>Intuitive User Interface</li>
                <li>Scalable Cloud Infrastructure</li>
                <li>Modern Security Standards</li>
              </ul>
            </div>
          </div>
          
          <div className="project-visuals">
            <div className="project-image-wrapper">
              <img src={project.image} alt={project.title} />
            </div>
            <div className="project-cta-box">
              <h3>Interested in this project?</h3>
              <p>Let's talk about how I can bring similar value to your team.</p>
              <Link to="/#contact" className="cta-btn">Get in Touch</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
