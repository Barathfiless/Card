import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject } from '../data/projects';
import './Dashboard.css';

const DEFAULT_PROJECT_IDS = new Set(['finos', 'vhire', 'documind-ai']);

function Dashboard() {
  const [projectsList, setProjectsList] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    uniqueTags: 0,
    subscribers: 284,
    uptime: '99.98%'
  });

  useEffect(() => {
    const list = getProjects();
    setProjectsList(list);

    // Calculate unique tags
    const tagsSet = new Set();
    list.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => tagsSet.add(t));
      }
    });

    setStats(prev => ({
      ...prev,
      totalProjects: list.length,
      uniqueTags: tagsSet.size
    }));
  }, []);

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete the project "${title}"?`)) {
      deleteProject(id);
      const updatedList = getProjects();
      setProjectsList(updatedList);

      // Recalculate tags
      const tagsSet = new Set();
      updatedList.forEach(p => {
        if (Array.isArray(p.tags)) {
          p.tags.forEach(t => tagsSet.add(t));
        }
      });

      setStats(prev => ({
        ...prev,
        totalProjects: updatedList.length,
        uniqueTags: tagsSet.size
      }));
    }
  };


  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back, Administrator. Here is an overview of your portfolio metrics and projects.</p>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProjects}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.uniqueTags}</span>
            <span className="stat-label">Tech Competencies</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.subscribers}</span>
            <span className="stat-label">Newsletter Subscribers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper teal-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.uptime}</span>
            <span className="stat-label">System Health</span>
          </div>
        </div>
      </div>

      {/* Projects Management Section */}
      <div className="dashboard-content-panel">
        <div className="panel-header">
          <h2>Project Inventory</h2>
          <Link to="/admin/upload" className="upload-project-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload New Project
          </Link>
        </div>

        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Details</th>
                <th>Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-table-state">No projects found. Create one above!</td>
                </tr>
              ) : (
                projectsList.map(project => (
                  <tr key={project.id}>
                    <td>
                      <div className="project-cell">
                        <img src={project.image} alt={project.title} className="table-project-img" />
                        <div className="project-cell-meta">
                          <span className="project-cell-title">{project.title}</span>
                          <span className="project-cell-id">ID: {project.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{project.subtitle}</span>
                    </td>
                    <td className="text-right">
                      <div className="actions-flex">
                        <Link to={`/project/${project.id}`} className="action-btn view-btn" title="View">
                          View
                        </Link>
                        <span className="actions-divider">|</span>
                        <Link to={`/admin/upload?edit=${project.id}`} className="action-btn edit-btn" title="Edit">
                          Edit
                        </Link>
                        <span className="actions-divider">|</span>
                        <button 
                          onClick={() => handleDelete(project.id, project.title)} 
                          className="action-btn delete-btn" 
                          title="Delete Project"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
