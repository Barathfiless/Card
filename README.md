# Portfolio (Monorepo)

A beautiful, professional developer portfolio with an administration portal. The project is organized into two primary services:
- **[Frontend](file:///d:/Portfolio%20-%20Copy/Frontend/)**: A premium React application built with Vite, vanilla CSS, and Google OAuth login.
- **[Backend](file:///d:/Portfolio%20-%20Copy/Backend/)**: A Node.js + Express API server that uses MongoDB to persist uploaded projects, handle soft deletes, and manage project details.

---

## Folder Structure

```
d:\Portfolio - Copy\
  ├── Frontend/           # React SPA Client
  │    ├── public/        # Static assets
  │    ├── src/           # Component & View logic
  │    ├── index.html
  │    ├── vite.config.js # Vite configuration (with API proxy)
  │    └── package.json
  │
  ├── Backend/            # Express REST API
  │    ├── models/        # Mongoose database models
  │    ├── routes/        # Express routers
  │    ├── server.js      # Express server & DB connection
  │    └── package.json
  │
  ├── README.md
  └── .gitignore
```

---

## How to Get Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or using MongoDB Atlas)

### Setup & Installation

#### 1. Setup Backend
1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `Backend/` directory (or use default values):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
   ```
4. Start the server (with hot reload):
   ```bash
   npm run dev
   ```
   *Note: On first startup, the backend automatically seeds the default projects (FinOS, VHire, DocuMind AI) into MongoDB.*

#### 2. Setup Frontend
1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy or check the `.env` file inside `Frontend/`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The client will be running at `http://localhost:5173`. Any requests to `/api/*` will automatically be proxied to the backend at `http://localhost:5000`.

---

## Features
- **Dynamic Projects Slider**: Rich, animated slideshow displaying recent engineering work.
- **Academic Milestones**: Sleek visual timeline showcasing educational achievements.
- **Admin Dashboard**: Secure OAuth-protected panel to upload, update, delete, or restore projects.
- **Interactive UI**: Micro-animations, dark-mode themes, and glassmorphism elements built with custom CSS.
