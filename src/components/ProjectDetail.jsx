import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjects } from '../data/projects';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const allProjects = getProjects();
  const project = allProjects.find(p => p.id === projectId);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset states when project changes
    setImageLoaded(false);
    setImageError(false);
  }, [projectId]);

  if (!project) {
    return (
      <div className="error-page">
        <h1>Project Not Found</h1>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="project-detail-page fade-in visible">
      <div className="project-header" style={{ '--project-color': project.color }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
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
              <div className="features-grid">
                {(project.features && project.features.length > 0 ? project.features : [
                  "High Performance Architecture",
                  "Intuitive User Interface",
                  "Scalable Cloud Infrastructure",
                  "Modern Security Standards"
                ]).map((feat, idx) => (
                  <div key={idx} className="feature-card">
                    <div className="feature-icon-wrapper">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="project-visuals">
            <div className={`project-image-wrapper ${!imageLoaded ? 'loading' : ''} ${imageError ? 'error' : ''}`}>
              {!imageLoaded && !imageError && <div className="skeleton-loader" />}
              {imageError ? (
                <div className="image-error-fallback">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Image Unavailable</span>
                </div>
              ) : (
                <img 
                  src={project.image} 
                  alt={project.title} 
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.4s ease-in-out' }}
                />
              )}
            </div>
            {project.imageDescription && (
              <p className="project-image-caption">
                {project.imageDescription}
              </p>
            )}
            <div className="project-cta-box">
              <h3>Interested in this project?</h3>
              <p>Let's talk about how I can bring similar value to your team.</p>
              <Link to="/#contact" className="cta-btn">Get in Touch</Link>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="project-gallery-section">
            <h2 className="gallery-section-title">Project Gallery</h2>
            <div className="gallery-grid">
              {project.gallery.map((img, idx) => (
                <div key={idx} className="gallery-card">
                  <div className="gallery-img-wrapper">
                    <img src={img.url} alt={img.description || `Gallery ${idx + 1}`} />
                  </div>
                  {img.description && (
                    <div className="gallery-img-caption">
                      <p>{img.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
