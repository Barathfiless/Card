import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllInventoryProjects, getProjects, deleteProject, isProjectDeleted } from '../data/projects';
import './Dashboard.css';

function Dashboard() {
  const [projectsList, setProjectsList] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    deletedProjects: 0,
    uniqueTags: 0
  });

  const [draggedIndex, setDraggedIndex] = useState(null);

  const refreshDashboardData = async () => {
    try {
      const all = await getAllInventoryProjects();
      const active = await getProjects();
      const sortedActive = active.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProjectsList(sortedActive);

      const deletedProjectsCount = all.length - active.length;

      // Calculate unique tags for active projects only
      const tagsSet = new Set();
      active.forEach(p => {
        if (Array.isArray(p.tags)) {
          p.tags.forEach(t => tagsSet.add(t));
        }
      });

      setStats({
        totalProjects: all.length,
        activeProjects: active.length,
        deletedProjects: deletedProjectsCount,
        uniqueTags: tagsSet.size
      });
    } catch (err) {
      console.error('Error refreshing dashboard stats:', err);
    }
  };

  useEffect(() => {
    refreshDashboardData();
  }, []);

  const handleDelete = async (id, title) => {
    const plainTitle = title.replace(/<[^>]*>/g, '');
    if (window.confirm(`Are you sure you want to delete the project "${plainTitle}"? It will move to Trash.`)) {
      try {
        await deleteProject(id);
        refreshDashboardData();
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const listCopy = [...projectsList];
    const draggedItem = listCopy[draggedIndex];
    listCopy.splice(draggedIndex, 1);
    listCopy.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setProjectsList(listCopy);
  };

  const handleDragEnd = async (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedIndex(null);

    try {
      const orders = projectsList.map((project, idx) => ({
        id: project.id,
        order: idx
      }));

      const res = await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });

      if (!res.ok) throw new Error('Failed to update project order');
      console.log('Project order updated successfully');
    } catch (err) {
      console.error('Error saving project order:', err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back, Administrator. Here is a live, dynamic overview of your active portfolio projects.</p>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
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
          <div className="stat-icon-wrapper green-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <Link to="/admin/trash" className="stat-link-wrapper">
            <div className="stat-icon-wrapper red-glow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
          </Link>
          <div className="stat-info">
            <span className="stat-value">{stats.deletedProjects}</span>
            <span className="stat-label">Deleted Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.uniqueTags}</span>
            <span className="stat-label">Tech Competencies</span>
          </div>
        </div>
      </div>

      {/* Projects Management Section */}
      <div className="dashboard-content-panel">
        <div className="panel-header">
          <h2>Project Inventory</h2>
          <Link to="/admin/upload" className="upload-project-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                <th style={{ width: '40px' }}></th>
                <th>Project Details</th>
                <th>Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-table-state">No active projects found. Create one above!</td>
                </tr>
              ) : (
                projectsList.map((project, index) => (
                  <tr 
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="draggable-row"
                  >
                    <td className="drag-handle-cell">
                      <div className="drag-handle-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}>
                          <circle cx="9" cy="5" r="1.5"/>
                          <circle cx="9" cy="12" r="1.5"/>
                          <circle cx="9" cy="19" r="1.5"/>
                          <circle cx="15" cy="5" r="1.5"/>
                          <circle cx="15" cy="12" r="1.5"/>
                          <circle cx="15" cy="19" r="1.5"/>
                        </svg>
                      </div>
                    </td>
                    <td>
                      <div className="project-cell">
                        <img src={project.image} alt={project.title.replace(/<[^>]*>/g, '')} className="table-project-img" />
                        <div className="project-cell-meta">
                          <span className="project-cell-title" dangerouslySetInnerHTML={{ __html: project.title }} />
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </Link>
                        <span className="actions-divider">|</span>
                        <Link to={`/admin/upload?edit=${project.id}`} className="action-btn edit-btn" title="Edit">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <span className="actions-divider">|</span>
                        <button 
                          onClick={() => handleDelete(project.id, project.title)} 
                          className="action-btn delete-btn" 
                          title="Delete Project"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
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
