import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjects } from '../data/projects';
import { getTagLogoUrl } from '../utils/tags';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeClip, setActiveClip] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setImageLoaded(false);
    setImageError(false);
    setActiveClip(0);

    const loadProject = async () => {
      try {
        setLoading(true);
        const allProjects = await getProjects();
        const found = allProjects.find(p => p.id === projectId);
        setProject(found);
      } catch (err) {
        console.error('Error loading project details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <p>Retrieving project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pd-error">
        <h1>Project Not Found</h1>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  const features =
    project.features && (Array.isArray(project.features) ? project.features.length > 0 : project.features.trim().length > 0)
      ? project.features
      : [
          'High Performance Architecture',
          'Intuitive User Interface',
          'Scalable Cloud Infrastructure',
          'Modern Security Standards',
        ];

  // Build clips: only gallery items (screenshots)
  const clips = project.gallery && project.gallery.length > 0 ? project.gallery : [];

  const impactText =
    project.impact ||
    (project.tags && project.tags.length > 0
      ? `A Platform with the tech stacks of ${project.tags.join(', ')}`
      : null);

  const bannerBg = project.bannerImage 
    ? project.bannerImage 
    : (project.image ? project.image : null);

  // Derive inline style for header background from project color and image
  const headerStyle = {
    '--project-color': project.color || '#1b36d1',
    backgroundColor: project.color || '#1b36d1',
    backgroundImage: bannerBg ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${bannerBg})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: `center ${project.bannerPosY || '50'}%`,
    minHeight: `${project.bannerHeight || '170'}px`,
  };

  return (
    <div className="pd-page">

      {/* ── Header Banner ── */}
      <div className="pd-header" style={headerStyle}>
        <div className="pd-header-inner" style={{ minHeight: headerStyle.minHeight }}>

          {/* Back button */}
          <div className="pd-back-row">
            <button className="pd-back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>

          {/* Header Content Body */}
          <div className="pd-header-body">
            {/* Left side: Title (rich support) */}
            <div className="pd-header-left">
              <h1 className="pd-title" dangerouslySetInnerHTML={{ __html: project.title }} />
            </div>

            {/* Right side: Live Link (rich support) + Tags */}
            <div className="pd-header-right">
              {project.liveUrl && (
                <div className="pd-live-row">
                  {project.liveUrl.startsWith('<') ? (
                    <div className="pd-live-link-rich" dangerouslySetInnerHTML={{ __html: project.liveUrl }} />
                  ) : (
                    <a
                      href={project.liveUrl.startsWith('http') ? project.liveUrl : `https://${project.liveUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pd-live-link"
                    >
                      Live : {project.liveUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
              <div className="pd-tags">
                {project.tags &&
                  project.tags.map(tag => {
                    const logoUrl = getTagLogoUrl(tag);
                    return (
                      <span key={tag} className="pd-tag">
                        {logoUrl && (
                          <img src={logoUrl} alt="" className="pd-tag-icon" />
                        )}
                        {tag}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Horizontal Divider ── */}
      <div className="pd-divider" />

      {/* ── 3-Column Content ── */}
      <div className="pd-content">

        {/* Col 1 — Overview */}
        <div className="pd-col pd-col-overview pd-card">
          <h2 className="pd-section-title">Overview</h2>
          <p className="pd-overview-text" dangerouslySetInnerHTML={{ __html: project.longDescription || project.description }} />
        </div>

        {/* Col 2 — Key Features */}
        <div className="pd-col pd-col-features pd-card">
          <h2 className="pd-section-title">Key Features</h2>
          {Array.isArray(features) ? (
            <ul className="pd-features-list">
              {features.map((feat, idx) => (
                <li key={idx} className="pd-feature-item">
                  <span className="pd-bullet">•</span>
                  {feat}
                </li>
              ))}
            </ul>
          ) : (
            <div className="pd-features-rich" dangerouslySetInnerHTML={{ __html: features }} />
          )}
        </div>

        {/* Col 3 — Clips */}
        <div className="pd-col pd-col-clips pd-card">
          <h2 className="pd-section-title">Clips</h2>
          <div className="pd-clips-viewer">
            {clips.length > 0 ? (
              <>
                {/* Main image box */}
                <div className="pd-clip-main">
                  {!imageLoaded && !imageError && <div className="pd-clip-skeleton" />}
                  {imageError ? (
                    <div className="pd-clip-error">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Image Unavailable</span>
                    </div>
                  ) : (
                    <img
                      src={clips[activeClip]?.url}
                      alt={clips[activeClip]?.description || project.title}
                      className="pd-clip-img"
                      style={{ opacity: imageLoaded ? 1 : 0 }}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>

                {/* Thumbnail strip — only if multiple clips */}
                {clips.length > 1 && (
                  <div className="pd-clip-thumbs">
                    {clips.map((clip, idx) => (
                      <button
                        key={idx}
                        className={`pd-clip-thumb ${idx === activeClip ? 'active' : ''}`}
                        onClick={() => {
                          setActiveClip(idx);
                          setImageLoaded(false);
                          setImageError(false);
                        }}
                        aria-label={`View clip ${idx + 1}`}
                      >
                        <img src={clip.url} alt={`Clip ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="pd-clip-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>No Preview</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Impact Row ── */}
      {impactText && (
        <div className="pd-impact-row">
          {impactText.startsWith('<') ? (
            <div className="pd-impact-text-rich pd-impact-line" dangerouslySetInnerHTML={{ __html: impactText }} />
          ) : (
            <p className="pd-impact-text pd-impact-line">
              <span className="pd-impact-label">Impact -</span> {impactText}
            </p>
          )}
        </div>
      )}

      {/* ── Gallery Section ── */}
      {project.gallery && project.gallery.length > 0 && (
        <div className="pd-gallery-section">
          <h2 className="pd-gallery-title">Project Gallery</h2>
          <div className="pd-gallery-grid">
            {project.gallery.map((img, idx) => (
              <div key={idx} className="pd-gallery-card">
                <div className="pd-gallery-img-wrap">
                  <img
                    src={img.url}
                    alt={img.description || `Gallery ${idx + 1}`}
                  />
                </div>
                {img.description && (
                  <div className="pd-gallery-caption">
                    <p>{img.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default ProjectDetail;
