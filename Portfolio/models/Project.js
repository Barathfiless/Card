import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  longDescription: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#7c3aed'
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  order: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true // Base64 data url or path
  },
  imageDescription: {
    type: String,
    default: '',
    trim: true
  },
  gallery: [
    {
      url: { type: String, required: true },
      description: { type: String, default: '', trim: true }
    }
  ],
  tags: {
    type: [String],
    default: ['React', 'Web App']
  },
  features: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  liveUrl: {
    type: String,
    default: '',
    trim: true
  },
  impact: {
    type: String,
    default: '',
    trim: true
  },
  sectionTitleOverview: {
    type: String,
    default: '',
    trim: true
  },
  sectionTitleFeatures: {
    type: String,
    default: '',
    trim: true
  },
  sectionTitleClips: {
    type: String,
    default: '',
    trim: true
  },
  bannerPosY: {
    type: String,
    default: '50'
  },
  bannerImage: {
    type: String,
    default: ''
  },
  bannerHeight: {
    type: String,
    default: '170'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
