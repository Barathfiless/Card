import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addProject } from '../data/projects';
import { compressImage } from '../utils/image';
import './UploadProject.css';

const COLOR_PRESETS = [
  { name: 'Indigo', value: '#4B0082' },
  { name: 'Deep Blue', value: '#1b36d1' },
  { name: 'Dark Green', value: '#006400' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Crimson', value: '#9b1c1c' },
  { name: 'Charcoal', value: '#1e293b' }
];

const IMAGE_PRESETS = [
  { name: 'Analytics', url: 'https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=600' },
  { name: 'Interviews', url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=600' },
  { name: 'AI & Books', url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=600' },
  { name: 'Coding', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600' },
  { name: 'Security', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600' }
];

function UploadProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    longDescription: '',
    color: '#7c3aed',
    image: '', // base64 string
    imageDescription: '', // caption for main image
    tags: '',
    features: ''
  });

  const [gallery, setGallery] = useState([]);
  const [isMainImageUploading, setIsMainImageUploading] = useState(false);
  const [mainImageError, setMainImageError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectPresetColor = (val) => {
    setFormData(prev => ({
      ...prev,
      color: val
    }));
  };

  // Main image drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await processMainImage(file);
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processMainImage(file);
  };

  const processMainImage = async (file) => {
    setIsMainImageUploading(true);
    setMainImageError('');
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        image: compressed
      }));
    } catch (err) {
      console.error(err);
      setMainImageError('Failed to process image. Please upload a valid image file.');
    } finally {
      setIsMainImageUploading(false);
    }
  };

  // Gallery handlers
  const addGalleryItem = () => {
    setGallery(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), url: '', description: '', isUploading: false, error: '' }
    ]);
  };

  const removeGalleryItem = (id) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const handleGalleryFileChange = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGallery(prev => prev.map(item => item.id === id ? { ...item, isUploading: true, error: '' } : item));
    try {
      const compressed = await compressImage(file);
      setGallery(prev => prev.map(item => item.id === id ? { ...item, url: compressed, isUploading: false } : item));
    } catch (err) {
      console.error(err);
      setGallery(prev => prev.map(item => item.id === id ? { ...item, error: 'Failed to process image.', isUploading: false } : item));
    }
  };

  const handleGalleryDescriptionChange = (id, value) => {
    setGallery(prev => prev.map(item => item.id === id ? { ...item, description: value } : item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.title.trim()) {
      setValidationError('Project title is required.');
      return;
    }
    if (!formData.subtitle.trim()) {
      setValidationError('Category/Subtitle is required.');
      return;
    }
    if (!formData.description.trim()) {
      setValidationError('Short description is required.');
      return;
    }
    if (!formData.longDescription.trim()) {
      setValidationError('Overview description is required.');
      return;
    }
    if (!formData.image) {
      setValidationError('Main project image is required. Please upload a banner image.');
      return;
    }

    setIsSubmitting(true);

    // Create unique slug ID from title
    const id = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove weird characters
      .replace(/\s+/g, '-'); // replace spaces with hyphens

    // Convert comma-separated strings to arrays
    const tagsArr = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const featuresArr = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const galleryArr = gallery
      .filter(item => item.url)
      .map(item => ({
        url: item.url,
        description: item.description.trim()
      }));

    const newProject = {
      id,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      longDescription: formData.longDescription.trim(),
      color: formData.color,
      image: formData.image,
      imageDescription: formData.imageDescription.trim(),
      gallery: galleryArr,
      tags: tagsArr.length > 0 ? tagsArr : ['React', 'Web App'],
      features: featuresArr
    };

    try {
      addProject(newProject);
      setIsSubmitting(false);
      navigate('/admin');
      window.location.reload(); // Force reload to re-read localStorage on other pages
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setValidationError('Failed to save project. Please try again.');
    }
  };

  // Preview helper values
  const previewTags = formData.tags
    ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : ['React', 'System Design'];

  return (
    <div className="upload-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Upload Project</h1>
        <p className="admin-page-subtitle">Publish a new engineering project. Fill in details to render on home and project detail pages.</p>
      </div>

      <div className="upload-grid-layout">
        {/* Form Panel */}
        <div className="form-panel-card">
          {validationError && (
            <div className="form-error-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="upload-form">
            {/* Title & Subtitle */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Project Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g. DocuMind AI"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">Category / Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  placeholder="e.g. Document Assistant"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="form-group">
              <label htmlFor="description">Short Description (for cards)</label>
              <textarea
                id="description"
                name="description"
                rows="2"
                maxLength="200"
                placeholder="A brief overview summarizing the project (approx. 100-150 chars)..."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Long Description */}
            <div className="form-group">
              <label htmlFor="longDescription">Detailed Overview (for project page)</label>
              <textarea
                id="longDescription"
                name="longDescription"
                rows="4"
                placeholder="Provide a comprehensive explanation of the project's purpose, design, implementation, and success metrics..."
                value={formData.longDescription}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Tags & Features */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">Tags (Comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="React, TypeScript, AWS"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
                <span className="helper-text">Separate tech tags with commas.</span>
              </div>

              <div className="form-group">
                <label htmlFor="features">Key Features (One per line)</label>
                <textarea
                  id="features"
                  name="features"
                  rows="2"
                  placeholder="High Performance Architecture&#10;Modern Security Standards"
                  value={formData.features}
                  onChange={handleInputChange}
                />
                <span className="helper-text">Add project bullet points (press Enter for each).</span>
              </div>
            </div>

            {/* Accent Color Presets */}
            <div className="form-group">
              <label>Accent Color</label>
              <div className="preset-container">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`preset-color-circle ${formData.color === preset.value ? 'selected' : ''}`}
                    style={{ backgroundColor: preset.value }}
                    onClick={() => handleSelectPresetColor(preset.value)}
                    title={preset.name}
                  />
                ))}
                <div className="custom-color-picker-wrapper">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    className="custom-color-picker"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                  <span>Custom Color</span>
                </div>
              </div>
            </div>

            {/* Main Project Image Drop Zone / Uploader */}
            <div className="form-group">
              <label>Project Banner Image (Main)</label>
              
              <div 
                className={`image-upload-dropzone ${isDragActive ? 'drag-active' : ''} ${formData.image ? 'has-image' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {formData.image ? (
                  <div className="uploaded-image-preview-container">
                    <img src={formData.image} alt="Uploaded Banner" className="uploaded-image-preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn" 
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      title="Remove Image"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label htmlFor="main-image-file" className="dropzone-label">
                    <div className="dropzone-icon-wrapper">
                      {isMainImageUploading ? (
                        <div className="loader-spinner"></div>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                    </div>
                    <span className="dropzone-text-primary">
                      {isMainImageUploading ? 'Processing image...' : 'Drag & drop image here or click to browse'}
                    </span>
                    <span className="dropzone-text-secondary">Supports PNG, JPG up to 5MB</span>
                    <input 
                      type="file" 
                      id="main-image-file" 
                      accept="image/*"
                      onChange={handleMainImageChange} 
                      style={{ display: 'none' }}
                      disabled={isMainImageUploading}
                    />
                  </label>
                )}
              </div>

              {mainImageError && <span className="input-error-msg">{mainImageError}</span>}
            </div>

            {/* Description of Main Image */}
            <div className="form-group">
              <label htmlFor="imageDescription">Main Image Description</label>
              <input
                type="text"
                id="imageDescription"
                name="imageDescription"
                placeholder="e.g. Dashboard interface showcasing real-time analytics widgets."
                value={formData.imageDescription}
                onChange={handleInputChange}
              />
            </div>

            {/* Gallery Uploads Section */}
            <div className="form-group gallery-section-wrapper">
              <div className="gallery-header-row">
                <label>Additional Project Images (Gallery)</label>
                <button 
                  type="button" 
                  className="add-gallery-item-btn" 
                  onClick={addGalleryItem}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Image
                </button>
              </div>

              <div className="gallery-items-list">
                {gallery.length === 0 ? (
                  <div className="empty-gallery-state">
                    No additional images added yet. Click "Add Image" to build an image gallery for this project.
                  </div>
                ) : (
                  gallery.map((item, idx) => (
                    <div key={item.id} className="gallery-item-card">
                      <div className="gallery-item-index">Image #{idx + 1}</div>
                      
                      <div className="gallery-item-layout">
                        <div className="gallery-item-upload-box">
                          {item.url ? (
                            <div className="gallery-thumbnail-container">
                              <img src={item.url} alt={`Gallery ${idx + 1}`} className="gallery-thumbnail" />
                              <button 
                                type="button" 
                                className="gallery-thumbnail-remove-btn"
                                onClick={() => setGallery(prev => prev.map(g => g.id === item.id ? { ...g, url: '' } : g))}
                                title="Change Image"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <label htmlFor={`gallery-file-${item.id}`} className="gallery-upload-label">
                              {item.isUploading ? (
                                <div className="loader-spinner spinner-small"></div>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                  </svg>
                                  <span>Upload</span>
                                </>
                              )}
                              <input 
                                type="file" 
                                id={`gallery-file-${item.id}`} 
                                accept="image/*"
                                onChange={(e) => handleGalleryFileChange(item.id, e)}
                                style={{ display: 'none' }}
                                disabled={item.isUploading}
                              />
                            </label>
                          )}
                        </div>

                        <div className="gallery-item-meta-box">
                          <input
                            type="text"
                            placeholder="Describe this image (caption)..."
                            value={item.description}
                            onChange={(e) => handleGalleryDescriptionChange(item.id, e.target.value)}
                            className="gallery-item-desc-input"
                            required
                          />
                          {item.error && <span className="gallery-item-error">{item.error}</span>}
                        </div>

                        <button 
                          type="button" 
                          className="gallery-item-delete-btn"
                          onClick={() => removeGalleryItem(item.id)}
                          title="Delete Row"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <Link to="/admin" className="cancel-btn">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-project-btn"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="preview-panel">
          <h3 className="preview-panel-title">Live Preview</h3>
          <p className="preview-panel-subtitle">This is how your project card will appear on the portfolio home page stacked list.</p>

          <div className="preview-card-wrapper">
            <div 
              className="msci-project-card-horizontal preview-horizontal-card"
              style={{ backgroundColor: formData.color || '#1b36d1' }}
            >
              <div className="horizontal-content">
                <h3 className="horizontal-title">
                  {formData.title || 'Project Title'}
                </h3>
                <p className="horizontal-desc">
                  {formData.description || 'A brief summary describing the technical execution of this engineering project.'}
                </p>
                <div className="preview-tags-row">
                  {previewTags.map((tag, idx) => (
                    <span key={idx} className="preview-tag-pill">{tag}</span>
                  ))}
                </div>
                <button type="button" className="msci-outline-btn-white" style={{ marginTop: '16px' }}>
                  Learn more
                </button>
              </div>
              <div className="horizontal-image">
                {formData.image ? (
                  <img src={formData.image} alt="Project Preview" />
                ) : (
                  <div className="preview-image-placeholder">
                    <span>No banner uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadProject;
