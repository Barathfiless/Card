import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import { getProjects } from '../data/projects';
import TypingHeader from './TypingHeader';
import { getTagLogoUrl } from '../utils/tags';
import './HomeHero.css';

function HomeHero() {
  const [state, handleSubmit] = useForm("mbdwjndz");
  const [isPaused, setIsPaused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [allProjects, setAllProjects] = useState([]);

  // Keep main page in sync with admin-managed projects
  useEffect(() => {
    const fetchProjectsList = async () => {
      const data = await getProjects();
      setAllProjects(data);
    };
    fetchProjectsList();

    // Re-sync whenever admin adds / deletes a project in the same browser tab
    window.addEventListener('projectsUpdated', fetchProjectsList);
    // native 'storage' fires when another tab changes localStorage
    window.addEventListener('storage', fetchProjectsList);
    return () => {
      window.removeEventListener('projectsUpdated', fetchProjectsList);
      window.removeEventListener('storage', fetchProjectsList);
    };
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const tickerItems = [
    {
      name: 'React.js',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
    },
    {
      name: 'Next.js',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg'
    },
    {
      name: 'JavaScript',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
    },
    {
      name: 'TypeScript',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'
    },
    {
      name: 'Tailwind CSS',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg'
    },
    {
      name: 'Node.js',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
    },
    {
      name: 'NestJS',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg'
    },
    {
      name: 'Java / Spring Boot',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg'
    },
    {
      name: 'Python',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'
    },
    {
      name: 'PostgreSQL',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
    },
    {
      name: 'MySQL',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
    },
    {
      name: 'MongoDB',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'
    },
    {
      name: 'Redis',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'
    },
    {
      name: 'Git',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg'
    },
    {
      name: 'Docker',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'
    },
    {
      name: 'AWS',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
    },
    {
      name: 'Postman',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg'
    }
  ];

  // Repeat the array to ensure smooth seamless scrolling loop
  const repeatedItems = [...tickerItems, ...tickerItems, ...tickerItems];

  const lane1Items = tickerItems.slice(0, 8);
  const lane2Items = tickerItems.slice(8);
  const repeatedLane1 = [...lane1Items, ...lane1Items, ...lane1Items];
  const repeatedLane2 = [...lane2Items, ...lane2Items, ...lane2Items];

  return (
    <div className="home-hero-container">
      {/* 1. Dark Gradient Hero Banner */}
      <section className="msci-hero-banner">
        <div className="container">
          <div className="msci-hero-grid">
            <div className="msci-hero-left">
              <span className="msci-hero-tagline" style={{ display: 'none' }}></span>
              <h1 className="msci-hero-title">
                BARATH M
              </h1>
              <p className="msci-hero-subtitle">
                Software Developer Engineer
              </p>
              <div className="msci-hero-profile">
                <img
                  src="/hero-profile.png"
                  alt="Barath M"
                  className="msci-hero-profile-img"
                  width={380}
                  height={475}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Index Ticker Bar */}
      <div className="container msci-ticker-wrapper">
        <div className="msci-ticker-bar">
          <div className="msci-ticker-content">
            <div className={`msci-ticker-track ${isPaused ? 'paused' : ''}`}>
              {repeatedItems.map((item, index) => (
                <div key={index} className="msci-ticker-item">
                  {item.logo && (
                    <img src={item.logo} alt={item.name} className="msci-ticker-logo" />
                  )}
                  <span className="msci-ticker-name">{item.name}</span>
                  {index < repeatedItems.length - 1 && <span className="msci-ticker-divider">|</span>}
                </div>
              ))}
            </div>
          </div>

          <button
            className="msci-ticker-pause-btn"
            onClick={togglePause}
            title={isPaused ? "Play Ticker" : "Pause Ticker"}
            aria-label="Pause ticker"
          >
            {isPaused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 2. About Section (using Featured Solutions UI) */}
      <section id="about" className="msci-featured-section">
        <div className="container">
          <div className="msci-featured-header">
            <TypingHeader text="About Barath" className="msci-featured-title" />
            <h3 className="msci-featured-subtitle">Forward-thinking Software Development Engineer</h3>
          </div>

          <div className="msci-featured-cols">
            <div className="msci-featured-col">
              <h4>Engineering Rigor</h4>
              <p>Commitment to clean, maintainable architecture and robust testing protocols to ensure system reliability.</p>
            </div>
            <div className="msci-featured-col">
              <h4>Full-Stack Versatility</h4>
              <p>Seamless execution across client-side logic, sophisticated server structures, and complex databases.</p>
            </div>
            <div className="msci-featured-col">
              <h4>Business Alignment</h4>
              <p>Formulating software designs optimized for scaling, operational efficiency, and rapid user growth.</p>
            </div>
          </div>

          <div className="msci-featured-cards-grid">
            <div className="msci-featured-card blue-card">
              <div className="blue-card-graphic">
                <div className="card-marquee-wrapper">
                  {/* Lane 1 (Flowing Left) */}
                  <div className="card-marquee-lane lane-left">
                    <div className="card-marquee-track">
                      {repeatedLane1.map((item, idx) => (
                        <div key={`l1-${idx}`} className="card-marquee-item" title={item.name}>
                          <img src={item.logo} alt={item.name} className="card-marquee-logo" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lane 2 (Flowing Right) */}
                  <div className="card-marquee-lane lane-right">
                    <div className="card-marquee-track">
                      {repeatedLane2.map((item, idx) => (
                        <div key={`l2-${idx}`} className="card-marquee-item" title={item.name}>
                          <img src={item.logo} alt={item.name} className="card-marquee-logo" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="blue-card-content">
                <h4>Building secure & scalable systems</h4>
                <p>Dedicated to bridging the gap between computer science principles and strategic business goals to deliver long-term value.</p>
              </div>
            </div>

            <div className="msci-featured-card light-card">
              <div className="light-card-content">
                <h4>Track Record of Excellence</h4>
                <p>B.Tech CSBS graduate with 15+ completed projects, mastering 5+ core technologies with a 99.9% code performance target.</p>
                <Link to="#projects" className="msci-outline-btn">View my work</Link>
              </div>
              <div className="light-card-image">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop" alt="Modern Architecture" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Education / Milestones Section */}
      <section id="education" className="msci-edu-section">
        <div className="container">
          <div className="msci-edu-grid">
            <div className="msci-edu-info">
              <TypingHeader text="Academic Milestones" className="msci-edu-title" />
              <h3 className="msci-edu-subtitle">Foundations of engineering & systems expertise</h3>
              <p className="msci-edu-desc">
                A structured academic background in Computer Science and Business Systems, combining core technological principles with business strategy.
              </p>
              <div className="msci-edu-graphic">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="edu-svg">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="1" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="1" />
                  <circle cx="100" cy="50" r="4" fill="#00c0a5" />
                  <circle cx="100" cy="150" r="4" fill="#00c0a5" />
                  <circle cx="50" cy="100" r="4" fill="#00c0a5" />
                  <circle cx="150" cy="100" r="4" fill="#00c0a5" />
                </svg>
              </div>
            </div>

            <div className="msci-timeline">
              <div className="msci-timeline-item">
                <div className="msci-timeline-dot"></div>
                <div className="msci-timeline-date">Nov 2022 — Apr 2026</div>
                <h3 className="msci-timeline-title">UG - Bachelor of Technology in Computer Science and Business Systems</h3>
                <div className="msci-timeline-inst">Bannari Amman Institute of Technology - Sathy</div>
                <p className="msci-timeline-desc">
                  Engaged in deep coursework covering full-stack software development, data structures, and business operations. Executed technical projects and developed multiple production-ready web applications.
                </p>
              </div>

              <div className="msci-timeline-item">
                <div className="msci-timeline-dot"></div>
                <div className="msci-timeline-date">Jun 2021 — Mar 2022</div>
                <h3 className="msci-timeline-title">Higher Secondary Education</h3>
                <div className="msci-timeline-inst">Amala Matriculation · Gobi</div>
                <p className="msci-timeline-desc">
                  Focused on Mathematics, Physics, and Computer Sciences. Laid a strong foundation for analytical reasoning.
                </p>
              </div>

              <div className="msci-timeline-item">
                <div className="msci-timeline-dot"></div>
                <div className="msci-timeline-date">Jul 2019 — Mar 2020</div>
                <h3 className="msci-timeline-title">Secondary Education</h3>
                <div className="msci-timeline-inst">Amala Matriculation · Gobi</div>
                <p className="msci-timeline-desc">
                  Completed secondary schooling with outstanding academic merit. Initiated first peer-learning sessions inside computer lab environments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Projects Section (Research & Insights style with Slide bar) */}
      {(() => {
        // Chunk projects into arrays of maximum 3
        const projectChunks = [];
        for (let i = 0; i < allProjects.length; i += 3) {
          projectChunks.push(allProjects.slice(i, i + 3));
        }

        return (
          <section id="projects" className="msci-projects-section">
            <div className="container">
              <div className="msci-projects-header">
                <div className="msci-projects-header-left">
                  <TypingHeader text="Recent Engineering Projects" className="msci-projects-title" />
                  <h3 className="msci-projects-subtitle">Innovative solutions for complex problems</h3>
                </div>

                {projectChunks.length > 1 && (
                  <div className="msci-slider-controls">
                    <button
                      type="button"
                      className="msci-slider-arrow-btn"
                      onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                      disabled={activeSlide === 0}
                      aria-label="Previous Slide"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                    </button>
                    <span className="msci-slider-counter">
                      {activeSlide + 1} / {projectChunks.length}
                    </span>
                    <button
                      type="button"
                      className="msci-slider-arrow-btn"
                      onClick={() => setActiveSlide(prev => Math.min(projectChunks.length - 1, prev + 1))}
                      disabled={activeSlide === projectChunks.length - 1}
                      aria-label="Next Slide"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {projectChunks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--msci-light-gray)', borderRadius: '16px', border: '1px dashed var(--msci-border)' }}>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '20px' }}>No engineering projects published yet.</p>
                  <Link to="/login" className="msci-projects-explore-btn" style={{ textDecoration: 'none' }}>
                    Access Admin Panel
                  </Link>
                </div>
              ) : (
                <div className="msci-projects-slider-viewport">
                  <div
                    className="msci-projects-slider-track"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                  >
                    {projectChunks.map((chunk, slideIdx) => {
                      const mainProject = chunk[0];
                      const otherProjects = chunk.slice(1);

                      return (
                        <div key={slideIdx} className="msci-project-slide">
                          <div className="msci-projects-layout">
                            {/* Left Large Card */}
                            {mainProject && (
                              <div
                                className="msci-project-card-large"
                                style={{
                                  backgroundColor: mainProject.color || '#f4f4f6',
                                  color: mainProject.textColor || '#0b1a30',
                                }}
                              >
                                <div className="msci-project-large-graphic">
                                  <div className="graphic-circle-img">
                                    <img src={mainProject.image} alt={mainProject.title.replace(/<[^>]*>/g, '')} />
                                  </div>
                                  <svg viewBox="0 0 200 200" className="graphic-overlay-svg" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="0" cy="100" r="90" fill="none" stroke="#00c0a5" strokeWidth="1" />
                                    <circle cx="30" cy="100" r="90" fill="none" stroke="#00c0a5" strokeWidth="1" />
                                    <circle cx="60" cy="100" r="90" fill="none" stroke="#00c0a5" strokeWidth="1" />
                                    <circle cx="150" cy="100" r="4" fill="#00c0a5" />
                                  </svg>
                                </div>
                                <div className="msci-project-large-content">
                                  <h3 className="msci-project-large-title" dangerouslySetInnerHTML={{ __html: mainProject.title }} />
                                  <p className="msci-project-large-desc" dangerouslySetInnerHTML={{ __html: mainProject.description }} />
                                  <Link to={`/project/${mainProject.id}`} className="msci-outline-btn-black">
                                    Read the report
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* Right Stacked Cards */}
                            <div className="msci-projects-right-stack">
                              {otherProjects.length > 0 ? (
                                otherProjects.map((project) => {
                                  const accentColor = project.color || '#1b36d1';
                                  const cardStyle = {
                                    backgroundColor: accentColor,
                                    color: project.textColor || '#ffffff',
                                  };

                                  return (
                                    <div
                                      key={project.id}
                                      className="msci-project-card-horizontal"
                                      style={cardStyle}
                                    >
                                      <div className="horizontal-content">
                                        <h3 className="horizontal-title" dangerouslySetInnerHTML={{ __html: project.title }} />
                                        <p className="horizontal-desc" dangerouslySetInnerHTML={{ __html: project.description }} />
                                        <Link to={`/project/${project.id}`} className="msci-outline-btn-white">
                                          Learn more
                                        </Link>
                                      </div>
                                      <div
                                        className="horizontal-image"
                                        style={{ backgroundColor: accentColor }}
                                      >
                                        {project.image && (
                                          <img src={project.image} alt={project.title.replace(/<[^>]*>/g, '')} />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="msci-empty-stack-placeholder">
                                  {/* Keep spacing even if last slide has only 1 project */}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {projectChunks.length > 1 && (
                <div className="msci-slider-dots">
                  {projectChunks.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`msci-slider-dot ${activeSlide === idx ? 'active' : ''}`}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* 6. Skills & Tools section (News style) */}
      <section id="skills" className="msci-news-section">
        <div className="container">
          <div className="msci-news-header">
            <TypingHeader text="Skills & System Competencies" className="msci-news-title" />
          </div>

          <div className="msci-news-grid">
            {/* Frontend */}
            <div className="msci-news-card news-blue-card">
              <div className="news-card-content">
                <h3 className="news-card-heading">Frontend Systems</h3>
                <p className="news-card-text">React.js, Next.js, JavaScript, TypeScript, Tailwind CSS</p>
                <div className="news-icons-row">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" alt="NextJS" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TS" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind" />
                </div>
                <Link to="#projects" className="news-btn news-btn-blue">View projects</Link>
              </div>
              <div className="news-card-graphic">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="100" cy="80" rx="60" ry="25" fill="none" stroke="#00c0a5" strokeWidth="1" />
                  <ellipse cx="100" cy="140" rx="60" ry="25" fill="none" stroke="#00c0a5" strokeWidth="1" />
                  <path d="M40 80 L40 140" stroke="#00c0a5" strokeWidth="1" fill="none" />
                  <path d="M160 80 L160 140" stroke="#00c0a5" strokeWidth="1" fill="none" />
                  <circle cx="40" cy="110" r="3" fill="#00c0a5" />
                  <circle cx="100" cy="140" r="3" fill="#00c0a5" />
                  <circle cx="160" cy="90" r="3" fill="#00c0a5" />
                </svg>
              </div>
            </div>

            {/* Backend */}
            <div className="msci-news-card news-black-card">
              <div className="news-card-content">
                <h3 className="news-card-heading">Backend Architecture</h3>
                <p className="news-card-text">Node.js, NestJS, Java / Spring Boot, Python</p>
                <div className="news-icons-row">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" alt="NestJS" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" />
                </div>
                <Link to="#projects" className="news-btn news-btn-blue">View projects</Link>
              </div>
              <div className="news-card-graphic">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="80" cy="100" r="30" fill="none" stroke="#9eb1ff" strokeWidth="1" />
                  <circle cx="90" cy="100" r="45" fill="none" stroke="#9eb1ff" strokeWidth="1" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#9eb1ff" strokeWidth="1" />
                  <circle cx="110" cy="100" r="3" fill="#9eb1ff" />
                  <circle cx="135" cy="100" r="3" fill="#9eb1ff" />
                  <circle cx="160" cy="100" r="3" fill="#9eb1ff" />
                </svg>
              </div>
            </div>

            {/* Databases */}
            <div className="msci-news-card news-white-card">
              <div className="news-card-content">
                <h3 className="news-card-heading">Data Store & Databases</h3>
                <p className="news-card-text">PostgreSQL, MySQL, MongoDB, Redis</p>
                <div className="news-icons-row">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" alt="MySQL" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" alt="Redis" />
                </div>
                <Link to="#projects" className="news-btn news-btn-white">View projects</Link>
              </div>
              <div className="news-card-graphic">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="100" cy="70" rx="50" ry="20" fill="none" stroke="#1b36d1" strokeWidth="1" />
                  <ellipse cx="100" cy="100" rx="50" ry="20" fill="none" stroke="#1b36d1" strokeWidth="1" />
                  <ellipse cx="100" cy="130" rx="50" ry="20" fill="none" stroke="#1b36d1" strokeWidth="1" />
                  <circle cx="150" cy="70" r="3" fill="#1b36d1" />
                  <circle cx="150" cy="100" r="3" fill="#1b36d1" />
                  <circle cx="150" cy="130" r="3" fill="#1b36d1" />
                  <line x1="150" y1="70" x2="150" y2="130" stroke="#1b36d1" strokeWidth="1" strokeDasharray="4 2" />
                </svg>
              </div>
            </div>

            {/* Tools */}
            <div className="msci-news-card news-teal-card">
              <div className="news-card-content">
                <h3 className="news-card-heading">Infrastructure & Tools</h3>
                <p className="news-card-text">Git, Docker, AWS, Postman</p>
                <div className="news-icons-row">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" alt="Docker" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="AWS" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" alt="Postman" />
                </div>
                <Link to="#projects" className="news-btn news-btn-blue">View projects</Link>
              </div>
              <div className="news-card-graphic">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                  <ellipse cx="100" cy="100" rx="60" ry="20" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                  <ellipse cx="100" cy="100" rx="20" ry="60" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                  <circle cx="100" cy="40" r="3" fill="#ffffff" />
                  <circle cx="100" cy="160" r="3" fill="#ffffff" />
                  <circle cx="160" cy="100" r="3" fill="#ffffff" />
                  <circle cx="40" cy="100" r="3" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Subscribe / Contact Section */}
      <section id="contact" className="msci-subscribe-section">
        <div className="container">
          <div className="msci-subscribe-grid">
            <div className="msci-subscribe-content">
              <h2 className="msci-subscribe-title">
                <TypingHeader text="Let's connect" className="msci-subscribe-light" tag="span" />
                <br />
                <TypingHeader text="Reach out to discuss projects, collaborations, or opportunities." className="msci-subscribe-bold" tag="span" delay={25} />
              </h2>

              {state.succeeded ? (
                <div className="subscribe-success-message">
                  <p>Thank you! I'll get in touch with you shortly.</p>
                </div>
              ) : (
                <form className="msci-subscribe-form" onSubmit={handleSubmit}>
                  <div className="msci-subscribe-input-wrapper">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      required
                      className="msci-subscribe-input"
                    />
                    <button type="submit" className="msci-subscribe-btn" disabled={state.submitting}>
                      Let's talk
                    </button>
                  </div>
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </form>
              )}
            </div>

            <div className="msci-subscribe-graphic">
              <div className="graphic-container">
                <svg viewBox="0 0 400 400" className="subscribe-svg" xmlns="http://www.w3.org/2000/svg">
                  {/* Top Circle */}
                  <circle cx="200" cy="50" r="150" fill="none" stroke="#00c0a5" strokeWidth="1" opacity="0.6" />
                  {/* Bottom Circle */}
                  <circle cx="200" cy="350" r="150" fill="none" stroke="#00c0a5" strokeWidth="1" opacity="0.6" />
                  {/* Left Circle */}
                  <circle cx="50" cy="200" r="150" fill="none" stroke="#00c0a5" strokeWidth="1" opacity="0.6" />
                  {/* Right Circle */}
                  <circle cx="350" cy="200" r="150" fill="none" stroke="#00c0a5" strokeWidth="1" opacity="0.6" />

                  {/* Intersection Dots */}
                  <circle cx="88" cy="200" r="6" fill="#00c0a5" />
                  <circle cx="312" cy="200" r="6" fill="#00c0a5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeHero;
