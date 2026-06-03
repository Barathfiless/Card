import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">
            Barath<span>.</span>dev
          </span>
          <p>
            Building high-precision, industry-standard web platforms, analytical backend servers, and client solutions.
          </p>
        </div>

        <div className="footer-col">
          <h4>Discover</h4>
          <ul>
            <li><a href="#about">About Me</a></li>
            <li><a href="#education">Academic Chronicles</a></li>
            <li><a href="#skills">System Competencies</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Highlights</h4>
          <ul>
            <li><a href="#projects">Recent Projects</a></li>
            <li><a href="#about">About Developer</a></li>
            <li><a href="#skills">Competencies</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Engagement</h4>
          <ul>
            <li><a href="#contact">Inquiries & Consulting</a></li>
            <li><a href="https://www.linkedin.com/in/barathh/" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a></li>
            <li><a href="https://github.com/Barathfiless" target="_blank" rel="noopener noreferrer">GitHub Workspace</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-links">
          <a href="/login">Admin Access</a>
          <a href="#terms">Terms of Use</a>
          <a href="#privacy">Privacy Statement</a>
          <a href="#cookies">Cookie Preferences</a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Barath M. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
