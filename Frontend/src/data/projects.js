/**
 * Data helper module for interacting with the backend Portfolio Projects API.
 * All state is stored in MongoDB instead of local storage.
 */

// GET active projects (isDeleted: false)
export const getProjects = async () => {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch active projects');
    return await res.json();
  } catch (err) {
    console.error('Error fetching active projects:', err);
    return [];
  }
};

// GET all inventory projects (including soft-deleted ones)
export const getAllInventoryProjects = async () => {
  try {
    const res = await fetch('/api/projects/all');
    if (!res.ok) throw new Error('Failed to fetch all projects');
    return await res.json();
  } catch (err) {
    console.error('Error fetching all projects:', err);
    return [];
  }
};

// GET only soft-deleted projects
export const getDeletedProjects = async () => {
  try {
    const res = await fetch('/api/projects/deleted');
    if (!res.ok) throw new Error('Failed to fetch deleted projects');
    return await res.json();
  } catch (err) {
    console.error('Error fetching deleted projects:', err);
    return [];
  }
};

// POST - Create or update a project (Upsert)
export const addProject = async (project) => {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) {
    throw new Error('Failed to save project to MongoDB');
  }
  return await res.json();
};

// PUT - Soft-delete a project (moves it to trash)
export const deleteProject = async (id) => {
  const res = await fetch(`/api/projects/${id}/delete`, {
    method: 'PUT'
  });
  if (!res.ok) {
    throw new Error(`Failed to delete project ${id}`);
  }
  return await res.json();
};

// PUT - Restore a soft-deleted project from trash
export const restoreProject = async (id) => {
  const res = await fetch(`/api/projects/${id}/restore`, {
    method: 'PUT'
  });
  if (!res.ok) {
    throw new Error(`Failed to restore project ${id}`);
  }
  return await res.json();
};

// Check if a project is soft-deleted
export const isProjectDeleted = async (id) => {
  try {
    const deleted = await getDeletedProjects();
    return deleted.some(p => p.id === id);
  } catch (e) {
    return false;
  }
};
