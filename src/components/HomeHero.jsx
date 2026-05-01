import React from 'react';
import { Link } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import './HomeHero.css';

function HomeHero() {
  const [state, handleSubmit] = useForm("mbdwjndz");

  return (
    <section id="about" className="home-hero fade-in">
      {/* ... rest of the code ... */}
      {/* Left Column: Profile Card */}
      <div className="profile-card">
        <div className="profile-image-container">
          <div className="dashed-circle"></div>
          <div className="profile-image-box">
             <img src="/profile.jpg" alt="Profile" className="profile-photo" />
          </div>
        </div>
        
        <h1 className="profile-name">BARATH M</h1>
        <p className="profile-desc">
          Software Engineer
        </p>
        

      </div>

      {/* Right Column: Hero Content */}
      <div className="hero-content">
        <div className="hero-titles">
          <h2 className="title-primary">SOFTWARE</h2>
          <h2 className="title-secondary">ENGINEER</h2>
        </div>
        
        <div className="hero-bio">
          <p>
            I am a passionate Software Engineer with a knack for building full-stack web applications using modern technologies like Next.js and Tailwind CSS. My journey in tech began with a curiosity for solving real-world problems through innovative solutions, which evolved into a love for crafting user-centric digital experiences.
          </p>
          <p>
            With a strong foundation in JavaScript frameworks, I focus on creating scalable, efficient, and visually appealing applications. Currently, I am diving deeper into backend development with Node.js and Express to expand my skill set and deliver powerful, server-side solutions.
          </p>
          <p>
            Beyond coding, I thrive in collaborative environments and enjoy tackling challenging problems with creative solutions. I aim to contribute to impactful projects that make a difference in users' lives.
          </p>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <h3>{new Date().getFullYear() > 2026 ? `+${new Date().getFullYear() - 2026}` : 'FRESHER'}</h3>
            <p>YEARS OF EXPERIENCE</p>
          </div>
          <div className="stat-item">
            <h3>8+</h3>
            <p>PROJECTS COMPLETED</p>
          </div>
          <div className="stat-item">
            <h3>2+</h3>
            <p>CURRENT PROJECTS</p>
          </div>
        </div>

        <div className="skills-cards">
          <div className="skill-card red-card">
            <div className="skill-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>
            </div>
            <h4>DYNAMIC ANIMATION,<br/>MOTION DESIGN</h4>
          </div>
          <div className="skill-card lime-card">
            <div className="skill-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <h4>FRAMER, FIGMA,<br/>WORDPRESS, REACTJS</h4>
          </div>
        </div>

        {/* Education Section */}
        <div id="education" className="education-section fade-in">
          <div className="hero-titles education-titles">
            <h2 className="title-primary">MY</h2>
            <h2 className="title-secondary">EDUCATION</h2>
          </div>
          
          <div className="education-timeline">
            <div className="timeline-item">
              <div className="timeline-dot">
                <div className="dot-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                </div>
              </div>
              <div className="timeline-content">
                <h3>UG - Bachelor of Technology in Computer Science and Business Systems</h3>
                <p className="inst-name">Bannari Amman Institute of Technology - Sathy</p>
                <span className="timeline-date">Nov 2022 — Apr 2026</span>
                <p className="timeline-desc">Completed B.Tech with a focus on Computer Science and Business Systems. Actively involved in full-stack development and technical research.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">
                <div className="dot-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                </div>
              </div>
              <div className="timeline-content">
                <h3>Higher Secondary Education</h3>
                <p className="inst-name">Amala Matriculation · Gobi</p>
                <span className="timeline-date">Jun 2021 — Mar 2022</span>
                <p className="timeline-desc">Completed 12th grade with a focus on Mathematics.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">
                <div className="dot-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                </div>
              </div>
              <div className="timeline-content">
                <h3>Secondary Education</h3>
                <p className="inst-name">Amala Matriculation · Gobi</p>
                <span className="timeline-date">Jul 2019 — Mar 2020</span>
                <p className="timeline-desc">Completed 10th grade and Assisted peers in learning computer skills through hands-on lab sessions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div id="projects" className="recent-projects fade-in">
          <div className="hero-titles recent-titles">
            <h2 className="title-primary">RECENT</h2>
            <h2 className="title-secondary">PROJECTS</h2>
          </div>
          
          <div className="project-list">
            <Link to="/project/finos" className="project-item">
              <div className="project-image" style={{background: 'linear-gradient(135deg, #6b21a8 0%, #3b0764 100%)'}}></div>
              <div className="project-info">
                <h3>FinOS</h3>
                <p>FinTech</p>
              </div>
              <div className="project-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
            </Link>

            <Link to="/project/vhire" className="project-item">
              <div className="project-image" style={{background: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)'}}></div>
              <div className="project-info">
                <h3>VHire</h3>
                <p>Interview Platform</p>
              </div>
              <div className="project-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
            </Link>
            
            <Link to="/project/documind-ai" className="project-item">
              <div className="project-image" style={{background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)'}}></div>
              <div className="project-info">
                <h3>DocuMind AI</h3>
                <p>Document Assistant</p>
              </div>
              <div className="project-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
            </Link>

            <a href="#" className="project-item">
              <div className="project-image" style={{background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'}}></div>
              <div className="project-info">
                <h3>Crawlix</h3>
                <p>Mini Search Engine</p>
              </div>
              <div className="project-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
            </a>
          </div>
        </div>

        {/* Experience Section */}
        <div id="skills" className="experience-section fade-in">
          <div className="hero-titles experience-titles">
            <h2 className="title-primary">SKILLS &</h2>
            <h2 className="title-secondary">TOOLS</h2>
          </div>
          
          <div className="skills-grid-container">
            {/* Frontend */}
            <div className="skill-category-row">
              <div className="category-label">FRONTEND</div>
              <div className="category-items">
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" />
                  JavaScript
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" />
                  TypeScript
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" alt="AngularJS" />
                  AngularJS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="ReactJS" />
                  ReactJS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" alt="NextJS" style={{filter: 'invert(1)'}} />
                  NextJS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" alt="Redux" />
                  Redux
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" />
                  Tailwind CSS
                </div>
              </div>
            </div>

            {/* Backend */}
            <div className="skill-category-row">
              <div className="category-label">BACKEND</div>
              <div className="category-items">
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="NodeJS" />
                  NodeJS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" alt="NestJS" />
                  NestJS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="ExpressJS" style={{filter: 'invert(1)'}} />
                  ExpressJS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" />
                  Java
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" />
                  Python
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="skill-category-row">
              <div className="category-label">DATABASE</div>
              <div className="category-items">
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" alt="MySQL" />
                  MySQL
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" />
                  PostgreSQL
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" />
                  MongoDB
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="skill-category-row">
              <div className="category-label">TOOLS</div>
              <div className="category-items">
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" />
                  Git
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" alt="Docker" />
                  Docker
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="AWS" />
                  AWS
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" alt="Postman" />
                  Postman
                </div>
                <div className="skill-item-min">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" alt="Vercel" style={{filter: 'invert(1)'}} />
                  Vercel
                </div>
              </div>
            </div>
          </div>
        </div>





        {/* Contact Section */}
        <div id="contact" className="contact-section fade-in">
          <div className="hero-titles contact-titles">
            <h2 className="title-primary">LET'S WORK</h2>
            <h2 className="title-secondary">TOGETHER</h2>
          </div>
          
          {state.succeeded ? (
            <div className="form-success-message">
              <h3>Message Sent Successfully!</h3>
              <p>Thanks for reaching out. I'll get back to you as soon as possible.</p>
              <button className="submit-btn" onClick={() => window.location.reload()}>Send Another Message</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" name="name" placeholder="John Doe" required />
                  <ValidationError prefix="Name" field="name" errors={state.errors} />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" placeholder="john@example.com" required />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" placeholder="Tell me about your project..." rows="5" required></textarea>
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </div>

              <button type="submit" className="submit-btn" disabled={state.submitting}>
                {state.submitting ? 'Sending...' : 'Submit →'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}

export default HomeHero;
