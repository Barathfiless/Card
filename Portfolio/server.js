import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import projectRouter from './routes/projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image payload upload up to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// REST API routes
app.use('/api/projects', projectRouter);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Serve static assets from the React frontend build folder
app.use(express.static(path.join(__dirname, '../Barath/dist')));

// Fallback to React index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Barath/dist/index.html'));
});

// Connect to MongoDB & Start Server
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
