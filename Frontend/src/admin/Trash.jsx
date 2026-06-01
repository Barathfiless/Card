import React, { useState, useEffect } from 'react';
import { getDeletedProjects, restoreProject } from '../data/projects';
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

  const handleRestore = async (id, title) => {
    try {
      await restoreProject(id);
      loadDeletedProjects();
      // Dispatch storage event to alert main layout if needed
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error restoring project:', err);
    }
  };

  return (
    <div className="trash-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Trash</h1>
        <p className="admin-page-subtitle">View and restore previously deleted projects. Restored projects will instantly return to your live portfolio.</p>
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
                      <button 
                        onClick={() => handleRestore(project.id, project.title)} 
                        className="action-btn undo-btn" 
                        title="Restore Project"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <polyline points="3 3 3 8 8 8"/>
                        </svg>
                        Restore Project
                      </button>
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
