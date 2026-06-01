import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addProject, getProjects, getAllInventoryProjects } from '../data/projects';
import { compressImage } from '../utils/image';
import { getTagLogoUrl } from '../utils/tags';
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

const BLANK_FORM = {
  title: '',
  subtitle: '',
  description: '',
  longDescription: '',
  color: '#7c3aed',
  textColor: '#ffffff',
  image: '',
  imageDescription: '',
  tags: '',
  features: '',
  liveUrl: '',
  impact: '',
  bannerPosY: '50',
  bannerImage: '',
  bannerHeight: '170'
};

const TECH_STACK_OPTIONS = [
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
  { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'NestJS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg' },
  { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Spring Boot', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { name: 'Redis', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
  { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg' },
  { name: 'Postman', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
  { name: 'HTML5', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS3', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'Figma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'Angular', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
  { name: 'Vue.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
  { name: 'Firebase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg' },
  { name: 'Kubernetes', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg' },
  { name: 'Express', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
  { name: 'GraphQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg' }
];

function RichTextEditor({ value, onChange, placeholder, minHeight = '100px', className = '' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  return (
    <div className={`premium-rich-editor ${className}`}>
      <div className="rich-editor-toolbar">
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          title="Align Left"
          className="toolbar-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          title="Align Center"
          className="toolbar-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="10" x2="6" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="18" y1="18" x2="6" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          title="Align Right"
          className="toolbar-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="21" y1="10" x2="7" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="7" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyFull')}
          title="Justify"
          className="toolbar-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="21" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="3" y2="18" />
          </svg>
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet Points"
          className="toolbar-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" strokeWidth="0" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" strokeWidth="0" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" strokeWidth="0" />
          </svg>
        </button>
        <div className="toolbar-separator" />
        <div className="color-picker-btn-wrapper">
          <input
            type="color"
            onChange={(e) => executeCommand('foreColor', e.target.value)}
            title="Text Color"
            className="toolbar-color-picker"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="color-icon">
            <line x1="4" y1="20" x2="20" y2="20" />
            <polyline points="4 20 12 4 20 20" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="rich-editor-content"
        onInput={handleInput}
        style={{ minHeight }}
        placeholder={placeholder}
      />
    </div>
  );
}

function UploadProject() {
  const navigate = useNavigate();

  // Step 1 = project picker, Step 2 = form
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null); // null = new project

  const [formData, setFormData] = useState(BLANK_FORM);
  const [gallery, setGallery] = useState([]);
  const [isMainImageUploading, setIsMainImageUploading] = useState(false);
  const [mainImageError, setMainImageError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTab, setPreviewTab] = useState('preview'); // 'preview' | 'overview'
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const tagDropdownRef = useRef(null);

  const [isRepositioningBanner, setIsRepositioningBanner] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startPosY, setStartPosY] = useState(50);

  // All projects (including deleted ones filtered out) for the picker
  const [allProjects, setAllProjects] = useState([]);
  const [isPickerLoading, setIsPickerLoading] = useState(true);

  useEffect(() => {
    const fetchPickerProjects = async () => {
      try {
        setIsPickerLoading(true);
        const data = await getAllInventoryProjects();
        setAllProjects(data);
      } catch (err) {
        console.error('Error loading inventory projects:', err);
      } finally {
        setIsPickerLoading(false);
      }
    };
    fetchPickerProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ─── Step 1 handlers ────────────────────────────────────────────
  const handleSelectExistingProject = (project) => {
    setSelectedProject(project);
    // Pre-fill form with existing data
    setFormData({
      title: project.title || '',
      subtitle: project.subtitle || '',
      description: project.description || '',
      longDescription: project.longDescription || '',
      color: project.color || '#7c3aed',
      textColor: project.textColor || '#ffffff',
      image: project.image || '',
      imageDescription: project.imageDescription || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
      features: Array.isArray(project.features) ? project.features.join('\n') : (project.features || ''),
      liveUrl: project.liveUrl || '',
      impact: project.impact || '',
      bannerPosY: project.bannerPosY || '50',
      bannerImage: project.bannerImage || '',
      bannerHeight: project.bannerHeight || '170'
    });
    setGallery(
      Array.isArray(project.gallery)
        ? project.gallery.map(g => ({ id: Math.random().toString(36).substr(2, 9), url: g.url || '', description: g.description || '', isUploading: false, error: '' }))
        : []
    );
    setValidationError('');
    setStep(2);
  };

  const handleSelectNewProject = () => {
    setSelectedProject(null);
    setFormData(BLANK_FORM);
    setGallery([]);
    setValidationError('');
    setStep(2);
  };

  // ─── Form handlers ───────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectPresetColor = (val) => {
    setFormData(prev => ({ ...prev, color: val }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
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
      setFormData(prev => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error(err);
      setMainImageError('Failed to process image. Please upload a valid image file.');
    } finally {
      setIsMainImageUploading(false);
    }
  };

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

  const handleAddTag = (tagToAdd) => {
    const currentTags = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];
    if (!currentTags.some(t => t.toLowerCase() === tagToAdd.toLowerCase())) {
      const updatedTags = [...currentTags, tagToAdd].join(', ');
      setFormData(prev => ({ ...prev, tags: updatedTags }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const currentTags = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];
    const updatedTags = currentTags.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()).join(', ');
    setFormData(prev => ({ ...prev, tags: updatedTags }));
  };

  const handleBannerDoubleClick = () => {
    if (!formData.bannerImage && !formData.image) return;
    setIsRepositioningBanner(prev => !prev);
  };

  const handleBannerMouseDown = (e) => {
    if (!isRepositioningBanner) return;
    setIsDraggingBanner(true);
    setStartY(e.clientY);
    setStartPosY(parseInt(formData.bannerPosY || '50', 10));
    e.preventDefault();
  };

  const handleBannerMouseMove = (e) => {
    if (!isDraggingBanner) return;
    const deltaY = e.clientY - startY;
    const percentChange = Math.round(deltaY / 2);
    let newPosY = startPosY - percentChange;
    if (newPosY < 0) newPosY = 0;
    if (newPosY > 100) newPosY = 100;
    setFormData(prev => ({ ...prev, bannerPosY: String(newPosY) }));
  };

  const handleBannerMouseUp = () => {
    setIsDraggingBanner(false);
  };

  const handleBannerTouchStart = (e) => {
    if (!isRepositioningBanner) return;
    setIsDraggingBanner(true);
    setStartY(e.touches[0].clientY);
    setStartPosY(parseInt(formData.bannerPosY || '50', 10));
  };

  const handleBannerTouchMove = (e) => {
    if (!isDraggingBanner) return;
    const deltaY = e.touches[0].clientY - startY;
    const percentChange = Math.round(deltaY / 2);
    let newPosY = startPosY - percentChange;
    if (newPosY < 0) newPosY = 0;
    if (newPosY > 100) newPosY = 100;
    setFormData(prev => ({ ...prev, bannerPosY: String(newPosY) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const isTitleEmpty = !formData.title.replace(/<[^>]*>/g, '').trim();
    if (isTitleEmpty) { setValidationError('Project title is required.'); return; }
    if (!formData.description.trim()) { setValidationError('Description is required.'); return; }
    if (!formData.image) { setValidationError('Main project image is required. Please upload a banner image.'); return; }

    setIsSubmitting(true);

    const cleanTitleText = formData.title.replace(/<[^>]*>/g, '');
    const id = selectedProject
      ? selectedProject.id  // reuse same ID when editing
      : cleanTitleText.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    const subtitleVal = formData.subtitle?.trim() || 'Web Application';
    const longDescVal = formData.longDescription?.trim() || formData.description.trim();
    const textColorVal = formData.textColor || '#ffffff';

    const tagsArr = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
    const isFeaturesHtml = formData.features && (formData.features.includes('<') || formData.features.includes('&nbsp;'));
    const featuresVal = isFeaturesHtml
      ? formData.features
      : (formData.features ? formData.features.split('\n').map(f => f.trim()).filter(f => f.length > 0) : []);
    const galleryArr = gallery.filter(item => item.url).map(item => ({ url: item.url, description: item.description.trim() }));

    const newProject = {
      id,
      title: formData.title.trim(),
      subtitle: subtitleVal,
      description: formData.description.trim(),
      longDescription: longDescVal,
      color: formData.color,
      textColor: textColorVal,
      image: formData.image,
      imageDescription: formData.imageDescription.trim(),
      gallery: galleryArr,
      tags: tagsArr.length > 0 ? tagsArr : ['React', 'Web App'],
      features: featuresVal,
      liveUrl: formData.liveUrl?.trim() || '',
      impact: formData.impact?.trim() || '',
      bannerPosY: formData.bannerPosY || '50',
      bannerImage: formData.bannerImage || '',
      bannerHeight: formData.bannerHeight || '170'
    };

    try {
      await addProject(newProject);
      setIsSubmitting(false);
      navigate('/admin');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setValidationError('Failed to save project. Please try again.');
    }
  };

  const previewTags = formData.tags
    ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : [];

  // ══════════════════════════════════════════════════════════════════
  // STEP 1 — Project Picker
  // ══════════════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="upload-page-container">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Upload Project</h1>
          <p className="admin-page-subtitle">Choose an existing project to edit, or create a brand-new one.</p>
        </div>

        <div className="project-picker-grid">
          {/* New Project card */}
          <button className="picker-card picker-card--new" onClick={handleSelectNewProject}>
            <div className="picker-card-new-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="picker-card-new-label">New Project</span>
            <span className="picker-card-new-sub">Start from scratch</span>
          </button>

          {/* Existing project cards */}
          {isPickerLoading ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
              <div className="loader-spinner" style={{ marginBottom: '15px' }}></div>
              <span style={{ color: 'var(--admin-text-muted)' }}>Retrieving projects inventory...</span>
            </div>
          ) : allProjects.map(project => (
            <button
              key={project.id}
              className="picker-card picker-card--existing"
              onClick={() => handleSelectExistingProject(project)}
              style={{ '--picker-accent': project.color || '#7c3aed' }}
            >
              <div className="picker-card-accent-bar" />
              <div className="picker-card-thumb">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <div className="picker-card-thumb-placeholder">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="picker-card-body">
                <h3 className="picker-card-title">{project.title}</h3>
                <span className="picker-card-category">{project.subtitle}</span>
                <p className="picker-card-desc">{project.description?.substring(0, 80)}{project.description?.length > 80 ? '…' : ''}</p>
              </div>
              <div className="picker-card-edit-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // STEP 2 — Form
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="upload-page-container">
      {/* Header with back button */}
      <div className="admin-page-header">
        <div className="upload-header-row">
          <button className="upload-back-btn" onClick={() => setStep(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All Projects
          </button>
          <div>
            <h1 className="admin-page-title">
              {selectedProject ? `Editing: ${selectedProject.title}` : 'New Project'}
            </h1>
            <p className="admin-page-subtitle">
              {selectedProject
                ? 'Update the details below and republish to apply changes.'
                : 'Fill in the details to publish a new project to your portfolio.'}
            </p>
          </div>
        </div>
      </div>

      {/* Premium Pill Tab switcher centered at top */}
      <div className="premium-tab-switcher-container">
        <div className="premium-tab-switcher-pill">
          <button
            type="button"
            className={`premium-tab-pill-btn ${previewTab === 'preview' ? 'active' : ''}`}
            onClick={() => setPreviewTab('preview')}
          >
            Preview
          </button>
          <button
            type="button"
            className={`premium-tab-pill-btn ${previewTab === 'overview' ? 'active' : ''}`}
            onClick={() => setPreviewTab('overview')}
          >
            Overview
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="upload-content-panel">
        {previewTab === 'preview' ? (
          /* Preview Tab: Form (Left) & Card Preview (Right) */
          <div className="preview-tab-layout-premium">
            
            {/* Left Column: Form Panel */}
            <div className="form-panel-card-premium">
              <h2 className="premium-form-title">Project Details</h2>
              
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

              <form onSubmit={handleSubmit} className="upload-form-premium">
                {/* Title */}
                <div className="form-group-premium">
                  <label htmlFor="title">Title</label>
                  <RichTextEditor
                    value={formData.title}
                    onChange={(val) => setFormData(prev => ({ ...prev, title: val }))}
                    placeholder="Enter project title"
                    minHeight="60px"
                  />
                </div>

                {/* Main Image Banner Upload */}
                <div className="form-group-premium">
                  <label>Upload Image</label>
                  <div
                    className={`image-upload-dropzone-premium ${isDragActive ? 'drag-active' : ''} ${formData.image ? 'has-image' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    {formData.image ? (
                      <div className="uploaded-image-preview-container-premium">
                        <img src={formData.image} alt="Uploaded Banner" className="uploaded-image-preview-premium" />
                        <button
                          type="button"
                          className="remove-image-btn-premium"
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
                      <label htmlFor="main-image-file" className="dropzone-label-premium">
                        <div className="dropzone-icon-wrapper-premium">
                          {isMainImageUploading ? (
                            <div className="loader-spinner"></div>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                        </div>
                        <span className="dropzone-text-primary-premium">
                          {isMainImageUploading ? 'Processing image...' : 'Drag & drop image here or click to browse'}
                        </span>
                        <span className="dropzone-text-secondary-premium">Supports PNG, JPG up to 5MB</span>
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

                {/* Description */}
                <div className="form-group-premium">
                  <label htmlFor="description">Description</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                    placeholder="Enter a short description for project card..."
                    minHeight="100px"
                  />
                </div>

                {/* Accent Color Presets */}
                <div className="form-group-premium">
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

                {/* Action Buttons inside Form Box */}
                <div className="form-actions-premium">
                  <button type="button" className="cancel-btn-premium" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-project-btn-premium"
                  >
                    {isSubmitting ? 'Publishing...' : selectedProject ? 'Update Project' : 'Publish Project'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Card Preview */}
            <div className="preview-card-column-premium">
              <div className="preview-card-column-header">
                <h3>Card Preview</h3>
                <p>How your project card will appear on the home page.</p>
              </div>
              
              <div className="preview-card-wrapper-premium">
                <div
                  className="msci-project-card-horizontal-premium"
                  style={{
                    backgroundColor: formData.color || '#1b36d1',
                    color: formData.textColor || '#ffffff'
                  }}
                >
                  <div className="horizontal-content-premium">
                    <span className="horizontal-category-premium">{formData.subtitle || 'Category / Subtitle'}</span>
                    <h3 className="horizontal-title-premium" dangerouslySetInnerHTML={{ __html: formData.title || 'Project Title' }} />
                    <p className="horizontal-desc-premium" dangerouslySetInnerHTML={{ __html: formData.description || 'Project description goes here...' }} />
                    <div className="preview-tags-row-premium">
                      {previewTags.map((tag, idx) => {
                        const logoUrl = getTagLogoUrl(tag);
                        return (
                          <span key={idx} className="preview-tag-pill-premium">
                            {logoUrl && <img src={logoUrl} alt="" className="tag-logo-img" />}
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                    <button type="button" className="msci-outline-btn-white-premium">Learn more</button>
                  </div>
                  <div className="horizontal-image-premium">
                    {formData.image ? (
                      <img src={formData.image} alt="Project Preview" />
                    ) : (
                      <div className="preview-image-placeholder-premium">
                        <span>No banner uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Overview Tab: Full Project Page Preview */
          <div className="overview-tab-content-premium">
            {/* 1. Accent Colored Banner */}
            <div 
              className={`ov-banner-premium ${isRepositioningBanner ? 'repositioning' : ''}`}
              onDoubleClick={handleBannerDoubleClick}
              style={{
                backgroundColor: formData.color || '#1b36d1',
                backgroundImage: formData.bannerImage 
                  ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${formData.bannerImage})` 
                  : (formData.image ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${formData.image})` : 'none'),
                backgroundSize: 'cover',
                backgroundPosition: `center ${formData.bannerPosY || '50'}%`,
                minHeight: `${formData.bannerHeight || '170'}px`,
                color: formData.textColor || '#ffffff',
                cursor: (formData.bannerImage || formData.image) ? (isRepositioningBanner ? 'ns-resize' : 'pointer') : 'default',
                position: 'relative'
              }}
              title={(formData.bannerImage || formData.image) ? "Double-click to reposition image" : ""}
            >
              {/* Image Upload/Change Controls inside the Banner itself */}
              <div 
                className="banner-image-controls" 
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '12px', 
                  zIndex: 4, 
                  display: 'flex', 
                  gap: '8px' 
                }}
              >
                <label 
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(4px)',
                    userSelect: 'none'
                  }}
                  title="Upload a custom banner image different from card image"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload Custom Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const compressed = await compressImage(file);
                        setFormData(prev => ({ ...prev, bannerImage: compressed }));
                      } catch (err) {
                        console.error('Error compressing banner image:', err);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>

                {formData.bannerImage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, bannerImage: '' }));
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(4px)',
                      userSelect: 'none'
                    }}
                    title="Remove custom banner image and revert to card image"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* If repositioning, show a transparent drag handler area */}
              {isRepositioningBanner && (
                <div 
                  className="banner-drag-catcher"
                  onMouseDown={handleBannerMouseDown}
                  onMouseMove={handleBannerMouseMove}
                  onMouseUp={handleBannerMouseUp}
                  onMouseLeave={handleBannerMouseUp}
                  onTouchStart={handleBannerTouchStart}
                  onTouchMove={handleBannerTouchMove}
                  onTouchEnd={handleBannerMouseUp}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 5,
                    background: 'rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{
                    background: '#1e293b',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '24px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    userSelect: 'none',
                    minWidth: '280px'
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>Image Position: {formData.bannerPosY || '50'}%</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Drag banner vertically</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '4px' }}>
                        <span>Banner Height: {formData.bannerHeight || '170'}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="120" 
                        max="500" 
                        value={formData.bannerHeight || '170'} 
                        onChange={(e) => setFormData(prev => ({ ...prev, bannerHeight: e.target.value }))}
                        style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setIsRepositioningBanner(false); }}
                      style={{
                        background: '#1500b5',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 16px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        marginTop: '4px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(21, 0, 181, 0.3)'
                      }}
                    >
                      Save Layout
                    </button>
                  </div>
                </div>
              )}

              <div className="ov-banner-left" style={{ flexGrow: 1, minWidth: 0 }}>
                <RichTextEditor
                  value={formData.title}
                  onChange={(val) => setFormData(prev => ({ ...prev, title: val }))}
                  placeholder="Enter Project Title..."
                  minHeight="60px"
                  className="banner-title-editor"
                />
              </div>
              
              <div className="ov-banner-right" style={{ flexShrink: 0 }}>
                <div className="ov-live-link-editor-container" style={{ width: '280px' }}>
                  <RichTextEditor
                    value={formData.liveUrl || `Live : www.${(formData.title || 'FinOS').toLowerCase().replace(/<[^>]*>/g, '').replace(/\s+/g, '')}-barath.com`}
                    onChange={(val) => setFormData(prev => ({ ...prev, liveUrl: val }))}
                    placeholder="Enter Live URL..."
                    minHeight="50px"
                    className="banner-live-editor"
                  />
                </div>
                <div className="ov-tags-row-premium" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {previewTags.map((tag, idx) => {
                    const logoUrl = getTagLogoUrl(tag);
                    return (
                      <span key={idx} className="ov-tag-badge-premium" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {logoUrl && <img src={logoUrl} alt="" className="badge-logo-img" />}
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0 2px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '2px'
                          }}
                          title={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  
                  {/* Add Tag Dropdown/Popover Trigger */}
                  <div ref={tagDropdownRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)',
                        padding: 0,
                        lineHeight: 1
                      }}
                      title="Add Tech Stack"
                    >
                      +
                    </button>

                    {isTagDropdownOpen && (
                      <div className="tech-stack-popover" style={{
                        position: 'absolute',
                        top: '32px',
                        right: '0',
                        width: '280px',
                        maxHeight: '320px',
                        overflowY: 'auto',
                        background: '#ffffff',
                        border: '1.5px solid #222222',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                        zIndex: 100,
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px'
                      }}>
                        {/* Custom search or add-custom option */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '4px', display: 'flex', gap: '4px' }}>
                          <input
                            type="text"
                            placeholder="Custom tag..."
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (customTagInput.trim()) {
                                  handleAddTag(customTagInput.trim());
                                  setCustomTagInput('');
                                }
                              }
                            }}
                            style={{
                              flex: 1,
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              color: '#333'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customTagInput.trim()) {
                                  handleAddTag(customTagInput.trim());
                                  setCustomTagInput('');
                              }
                            }}
                            style={{
                              background: '#1500b5',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                        </div>
                        
                        {/* Predefined Options */}
                        {TECH_STACK_OPTIONS.map(opt => {
                          const isAlreadySelected = previewTags.some(t => t.toLowerCase() === opt.name.toLowerCase());
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              onClick={() => {
                                if (isAlreadySelected) {
                                  handleRemoveTag(opt.name);
                                } else {
                                  handleAddTag(opt.name);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: isAlreadySelected ? 'rgba(21, 0, 181, 0.08)' : '#fafafa',
                                border: isAlreadySelected ? '1.5px solid #1500b5' : '1.5px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: '#374151',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                fontWeight: isAlreadySelected ? 'bold' : 'normal'
                              }}
                            >
                              <img src={opt.logo} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{opt.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Three-Column Layout */}
            <div className="ov-columns-grid-premium">
              {/* Column 1: Overview */}
              <div className="ov-column-premium">
                <h3 className="ov-column-title-premium">Overview</h3>
                <div className="ov-column-box-premium" style={{ padding: '12px' }}>
                  <RichTextEditor
                    value={formData.longDescription}
                    onChange={(val) => setFormData(prev => ({ ...prev, longDescription: val }))}
                    placeholder="No overview description added yet."
                    minHeight="200px"
                  />
                </div>
              </div>

              {/* Column 2: Key Features */}
              <div className="ov-column-premium">
                <h3 className="ov-column-title-premium">Key Features</h3>
                <div className="ov-column-box-premium" style={{ padding: '12px' }}>
                  <RichTextEditor
                    value={formData.features}
                    onChange={(val) => setFormData(prev => ({ ...prev, features: val }))}
                    placeholder="No key features added yet."
                    minHeight="200px"
                  />
                </div>
              </div>

              {/* Column 3: Clips */}
              <div className="ov-column-premium">
                <h3 className="ov-column-title-premium">Clips</h3>
                <div className="ov-column-box-premium clips-box-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                  {gallery.length > 0 ? (
                    <div className="interactive-clips-manager" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Active Clip Preview */}
                      <div className="active-clip-preview-container" style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', background: '#f9fafb' }}>
                        {gallery[activeClipIndex]?.url ? (
                          <>
                            <img src={gallery[activeClipIndex].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            <button
                              type="button"
                              className="remove-clip-btn"
                              onClick={() => {
                                removeGalleryItem(gallery[activeClipIndex].id);
                                if (activeClipIndex >= gallery.length - 1 && activeClipIndex > 0) {
                                  setActiveClipIndex(activeClipIndex - 1);
                                }
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(15, 23, 42, 0.75)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Delete Clip"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.8rem' }}>
                            {gallery[activeClipIndex]?.isUploading ? 'Uploading screenshot...' : 'No image uploaded'}
                          </div>
                        )}
                      </div>

                      {/* Active Clip Description */}
                      {gallery[activeClipIndex] && (
                        <input
                          type="text"
                          placeholder="Add a screenshot description..."
                          value={gallery[activeClipIndex].description}
                          onChange={(e) => handleGalleryDescriptionChange(gallery[activeClipIndex].id, e.target.value)}
                          className="gallery-item-desc-input"
                          style={{
                            width: '100%',
                            border: '1.5px solid #222222',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '0.85rem'
                          }}
                        />
                      )}

                      {/* Thumbnails + Add New Button Strip */}
                      <div className="clips-thumbnail-strip" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0', alignItems: 'center' }}>
                        {gallery.map((item, idx) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveClipIndex(idx)}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '6px',
                              border: idx === activeClipIndex ? '2px solid #1500b5' : '1px solid #d1d5db',
                              overflow: 'hidden',
                              padding: 0,
                              cursor: 'pointer',
                              flexShrink: 0,
                              background: '#fff'
                            }}
                          >
                            {item.url ? (
                              <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontSize: '9px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                ...
                              </div>
                            )}
                          </button>
                        ))}

                        {/* Add Clip Button */}
                        <label
                          className="add-clip-thumbnail-btn"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            border: '1.5px dashed #9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#4b5563',
                            flexShrink: 0,
                            background: '#fafafa',
                            transition: 'all 0.2s'
                          }}
                          title="Add Screenshot"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const newId = Math.random().toString(36).substr(2, 9);
                              setGallery(prev => [
                                ...prev,
                                { id: newId, url: '', description: '', isUploading: true, error: '' }
                              ]);
                              setActiveClipIndex(gallery.length); // select new clip
                              try {
                                const compressed = await compressImage(file);
                                setGallery(prev => prev.map(item => item.id === newId ? { ...item, url: compressed, isUploading: false } : item));
                              } catch (err) {
                                console.error(err);
                                setGallery(prev => prev.map(item => item.id === newId ? { ...item, error: 'Failed to process image.', isUploading: false } : item));
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* Empty Clips State - Direct Upload */
                    <label
                      className="clips-empty-upload-dropzone"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        border: '2px dashed #9ca3af',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        cursor: 'pointer',
                        background: '#fafafa',
                        width: '100%',
                        height: '100%',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ color: '#6b7280' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
                        Add Project Clips / Screenshots
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        Clips are Screenshots of the projects
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const newId = Math.random().toString(36).substr(2, 9);
                          setGallery([
                            { id: newId, url: '', description: '', isUploading: true, error: '' }
                          ]);
                          setActiveClipIndex(0);
                          try {
                            const compressed = await compressImage(file);
                            setGallery([{ id: newId, url: compressed, description: '', isUploading: false, error: '' }]);
                          } catch (err) {
                            console.error(err);
                            setGallery([]);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Dynamic Tech Stack Impact String */}
            <div className="ov-impact-row-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <RichTextEditor
                value={formData.impact || `Impact - A Platform with the tech stacks of ${previewTags.join(', ') || 'React, Web App'}`}
                onChange={(val) => setFormData(prev => ({ ...prev, impact: val }))}
                placeholder="Enter project impact statement..."
                minHeight="60px"
                className="impact-editor"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadProject;
