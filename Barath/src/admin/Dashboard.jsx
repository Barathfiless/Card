import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllInventoryProjects, deleteProject, isProjectDeleted, updateProjectStatus } from '../data/projects';
import { adminFetch } from '../utils/adminApi';
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
      
      // Filter non-deleted projects (both live and suspended) for display in inventory
      const nonDeleted = all.filter(p => !p.isDeleted);
      const sortedActive = nonDeleted.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProjectsList(sortedActive);

      // Active (Live) projects count for stats (excluding suspended)
      const liveProjects = all.filter(p => !p.isDeleted && p.status !== 'suspended');
      const deletedProjectsCount = all.filter(p => p.isDeleted).length;

      // Calculate unique tags for live projects only
      const tagsSet = new Set();
      liveProjects.forEach(p => {
        if (Array.isArray(p.tags)) {
          p.tags.forEach(t => tagsSet.add(t));
        }
      });

      setStats({
        totalProjects: all.length,
        activeProjects: liveProjects.length,
        deletedProjects: deletedProjectsCount,
        uniqueTags: tagsSet.size
      });
    } catch (err) {
      console.error('Error refreshing dashboard stats:', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateProjectStatus(id, status);
      await refreshDashboardData();
    } catch (err) {
      console.error('Error changing project status:', err);
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

      const res = await adminFetch('/api/projects/reorder', {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSortedAlphabetically, setIsSortedAlphabetically] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '08-06-2026';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '08-06-2026';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProjects.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to move the ${selectedIds.length} selected projects to Trash?`)) {
      try {
        for (const id of selectedIds) {
          await deleteProject(id);
        }
        setSelectedIds([]);
        refreshDashboardData();
      } catch (err) {
        console.error('Error during bulk deletion:', err);
      }
    }
  };

  // Filter projects by search query
  const filteredProjects = projectsList.filter(project => {
    const query = searchQuery.toLowerCase();
    const titleMatch = project.title ? project.title.toLowerCase().includes(query) : false;
    const slugMatch = project.id ? project.id.toLowerCase().includes(query) : false;
    const subtitleMatch = project.subtitle ? project.subtitle.toLowerCase().includes(query) : false;
    const tagMatch = Array.isArray(project.tags) ? project.tags.some(t => t.toLowerCase().includes(query)) : false;
    return titleMatch || slugMatch || subtitleMatch || tagMatch;
  });

  // Sort projects alphabetically or keep drag-and-drop order
  const displayProjects = isSortedAlphabetically
    ? [...filteredProjects].sort((a, b) => {
        const titleA = (a.title || '').replace(/<[^>]*>/g, '').toLowerCase();
        const titleB = (b.title || '').replace(/<[^>]*>/g, '').toLowerCase();
        return titleA.localeCompare(titleB);
      })
    : filteredProjects;

  const isAllSelected = displayProjects.length > 0 && displayProjects.every(p => selectedIds.includes(p.id));

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
          <span className="stat-label">Total Projects</span>
          <span className="stat-value">{stats.totalProjects}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Projects</span>
          <span className="stat-value">{stats.activeProjects}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Deleted Projects</span>
          <span className="stat-value">
            <Link to="/admin/trash" className="stat-link-value">{stats.deletedProjects}</Link>
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Tech Competencies</span>
          <span className="stat-value">{stats.uniqueTags}</span>
        </div>
      </div>

      {/* Projects Management Section */}
      <div className="dashboard-content-panel">
        <div className="panel-header">
          <h2>Project Inventory</h2>
          {selectedIds.length > 0 && (
            <div className="panel-header-actions" style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="deselect-all-btn fade-in" 
                onClick={() => setSelectedIds([])} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--admin-border)', 
                  color: 'var(--admin-text-muted)', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '0.78rem', 
                  cursor: 'pointer', 
                  fontWeight: 600 
                }}
              >
                Deselect All
              </button>
              <button className="bulk-delete-btn fade-in" onClick={handleBulkDelete}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {/* Mockup Action Bar */}
        <div className="inventory-action-bar">
          <div className="action-bar-left">
            <Link to="/admin/upload" className="action-bar-btn" title="Upload New Project">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </Link>
            
            <button 
              className={`action-bar-btn ${isSortedAlphabetically ? 'active' : ''}`} 
              title="Sort Alphabetically"
              onClick={() => setIsSortedAlphabetically(!isSortedAlphabetically)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 16 4 4 4-4"/>
                <path d="M7 20V4"/>
                <path d="m21 8-4-4-4 4"/>
                <path d="M17 4v16"/>
              </svg>
            </button>

            <button 
              className={`action-bar-btn ${searchQuery ? 'active' : ''}`}
              title="Clear Filter / Search"
              onClick={() => {
                setSearchQuery('');
                setIsSortedAlphabetically(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className={`action-bar-search-wrapper ${showSearch || searchQuery ? 'expanded' : ''}`}>
              <button 
                className="action-bar-btn search-trigger-btn" 
                title="Search Projects"
                onClick={() => setShowSearch(!showSearch)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </button>
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="action-bar-search-input"
              />
            </div>
          </div>

          <div className="action-bar-right">
            <button 
              className="action-bar-btn" 
              title="Refresh Data"
              onClick={refreshDashboardData}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>
            <Link 
              to="/admin/trash" 
              className="action-bar-btn" 
              title="View Trash"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="projects-table-wrapper">
          <table className="projects-table contentful-style-table">
            <thead>
              <tr>
                <th className="select-col" style={{ width: '80px' }}>
                  <div className="select-header-flex">
                    <input 
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="table-checkbox"
                    />
                  </div>
                </th>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {displayProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-state">No active projects found. Create one above!</td>
                </tr>
              ) : (
                displayProjects.map((project, index) => (
                  <tr 
                    key={project.id}
                    draggable={!isSortedAlphabetically}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`draggable-row ${selectedIds.includes(project.id) ? 'row-selected' : ''}`}
                  >
                    <td className="select-col">
                      <div className="select-cell-flex">
                        <div className="drag-handle-icon" title={isSortedAlphabetically ? "Disable alphabetical sorting to drag" : "Drag to reorder"}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: isSortedAlphabetically ? 0.15 : 0.45 }}>
                            <circle cx="9" cy="5" r="1.5"/>
                            <circle cx="9" cy="12" r="1.5"/>
                            <circle cx="9" cy="19" r="1.5"/>
                            <circle cx="15" cy="5" r="1.5"/>
                            <circle cx="15" cy="12" r="1.5"/>
                            <circle cx="15" cy="19" r="1.5"/>
                          </svg>
                        </div>
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(project.id)}
                          onChange={(e) => handleSelectRow(e, project.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="table-checkbox"
                        />
                      </div>
                    </td>
                    <td className="title-cell-premium">
                      <Link to={`/admin/upload?edit=${project.id}`} className="project-title-link">
                        <span dangerouslySetInnerHTML={{ __html: project.title }} />
                      </Link>
                    </td>
                    <td className="status-cell-premium">
                      <div className="status-toggle-links">
                        <button 
                          onClick={() => handleStatusChange(project.id, 'live')}
                          className={`status-toggle-btn btn-live ${project.status !== 'suspended' ? 'active' : ''}`}
                          type="button"
                        >
                          Live
                        </button>
                        <span className="status-toggle-divider">|</span>
                        <button 
                          onClick={() => handleStatusChange(project.id, 'suspended')}
                          className={`status-toggle-btn btn-suspend ${project.status === 'suspended' ? 'active' : ''}`}
                          type="button"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                    <td className="date-cell-premium">
                      <span className="date-text">{formatDate(project.createdAt)}</span>
                    </td>
                    <td className="row-options-cell">
                      <div className="actions-flex">
                        <a 
                          href={`/project/${project.id}`} 
                          className="action-btn view-btn" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="View Project"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </a>
                        <Link 
                          to={`/admin/upload?edit=${project.id}`} 
                          className="action-btn edit-btn"
                          title="Edit Project"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDelete(project.id, project.title)}
                          className="action-btn delete-btn"
                          title="Delete Project"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          </svg>
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

