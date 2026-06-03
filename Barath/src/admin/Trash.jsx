import React, { useState, useEffect } from 'react';
import { getDeletedProjects, restoreProject, permanentlyDeleteProject } from '../data/projects';
import './Trash.css';

function Trash() {
  const [deletedProjects, setDeletedProjects] = useState([]);

  const loadDeletedProjects = async () => {
    try {
      const data = await getDeletedProjects();
      setDeletedProjects(data);
    } catch (err) {
      console.error('Error loading deleted projects:', err);
    }
  };

  useEffect(() => {
    loadDeletedProjects();
  }, []);

  const handleRestore = async (id) => {
    try {
      await restoreProject(id);
      loadDeletedProjects();
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error restoring project:', err);
    }
  };

  const handlePermanentDelete = async (id, title) => {
    const plainTitle = title.replace(/<[^>]*>/g, '');
    if (
      !window.confirm(
        `Permanently delete "${plainTitle}"? This cannot be undone and removes all project data.`
      )
    ) {
      return;
    }

    try {
      await permanentlyDeleteProject(id);
      loadDeletedProjects();
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error permanently deleting project:', err);
      window.alert('Could not delete project permanently. Please try again.');
    }
  };

  return (
    <div className="trash-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Trash</h1>
        <p className="admin-page-subtitle">View, restore, or permanently delete projects in trash. Permanent deletion cannot be undone.</p>
      </div>

      {/* Projects Management Section */}
      <div className="dashboard-content-panel">
        <div className="panel-header">
          <h2>Trash Inventory ({deletedProjects.length})</h2>
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
              {deletedProjects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-table-state">Trash is empty. No deleted projects found!</td>
                </tr>
              ) : (
                deletedProjects.map(project => (
                  <tr key={project.id} className="project-row-deleted-view">
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
                      <span className="category-badge badge-deleted">{project.subtitle}</span>
                    </td>
                    <td className="text-right">
                      <div className="trash-actions">
                        <button
                          type="button"
                          onClick={() => handleRestore(project.id)}
                          className="action-btn undo-btn"
                          title="Restore Project"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <polyline points="3 3 3 8 8 8"/>
                          </svg>
                          Restore Project
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(project.id, project.title)}
                          className="action-btn permanent-delete-btn"
                          title="Delete Permanently"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                          Delete Permanently
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

export default Trash;
