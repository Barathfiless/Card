import React from 'react';

function BlogCard({ post }) {
  return (
    <article className="blog-card fade-in">
      <a href="#" className="card-link" aria-label={post.title}></a>
      <div className="card-content">
        <div className="card-header">
          <h2>{post.title}</h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="desc">{post.desc}</p>
        <div className="meta">
          <span>{post.date}</span>
          <span className="dot">•</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
