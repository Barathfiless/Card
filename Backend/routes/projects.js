import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// GET all active projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving active projects', error: err.message });
  }
});

// GET all projects (both active and soft-deleted)
router.get('/all', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving all projects', error: err.message });
  }
});

// GET only soft-deleted projects
router.get('/deleted', async (req, res) => {
  try {
    const projects = await Project.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving deleted projects', error: err.message });
  }
});

// POST - Create or Update a project (Upsert)
router.post('/', async (req, res) => {
  const {
    id,
    title,
    subtitle,
    description,
    longDescription,
    color,
    textColor,
    image,
    imageDescription,
    gallery,
    tags,
    features,
    liveUrl,
    impact,
    bannerPosY,
    bannerImage,
    bannerHeight
  } = req.body;

  if (!id || !title || !subtitle || !description || !longDescription || !image) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    // Find project by slug/id and update, or create a new one if it doesn't exist
    const project = await Project.findOneAndUpdate(
      { id: id.trim() },
      {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        longDescription: longDescription.trim(),
        color,
        textColor: textColor || '#ffffff',
        image,
        imageDescription: imageDescription?.trim() || '',
        gallery: gallery || [],
        tags: tags || ['React', 'Web App'],
        features: features || [],
        liveUrl: liveUrl || '',
        impact: impact || '',
        bannerPosY: bannerPosY || '50',
        bannerImage: bannerImage || '',
        bannerHeight: bannerHeight || '170',
        isDeleted: false // Ensure it becomes active/visible on upsert
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error saving project', error: err.message });
  }
});

// PUT - Soft-delete a project
router.put('/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project moved to trash successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
});

// PUT - Restore a soft-deleted project
router.put('/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findOneAndUpdate(
      { id },
      { isDeleted: false },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project restored successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Error restoring project', error: err.message });
  }
});

// PUT - Reorder projects (bulk update)
router.put('/reorder', async (req, res) => {
  const { orders } = req.body;
  if (!orders || !Array.isArray(orders)) {
    return res.status(400).json({ message: 'Invalid reorder data' });
  }
  try {
    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { order: item.order }
      }
    }));
    await Project.bulkWrite(bulkOps);
    res.json({ message: 'Projects reordered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error reordering projects', error: err.message });
  }
});

export default router;
