'use client';
import { useState, useEffect } from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Footer() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles for animation
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <footer className="footer has-background-dark has-text-white-ter">
      <div className="container">
        <div className="columns">
          <div className="column is-one-third">
            <h3 className="title is-4 has-text-white">AI E-Learning</h3>
            <p className="has-text-grey-light">
              Revolutionizing education with AI-powered learning experiences.
              Master new skills with personalized, interactive courses.
            </p>
          </div>
          <div className="column is-one-third">
            <h4 className="title is-5 has-text-white">Quick Links</h4>
            <ul>
              <li><a href="/courses" className="has-text-grey-light">Courses</a></li>
              <li><a href="/about" className="has-text-grey-light">About</a></li>
              <li><a href="/contact" className="has-text-grey-light">Contact</a></li>
              <li><a href="/privacy" className="has-text-grey-light">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="column is-one-third">
            <h4 className="title is-5 has-text-white">Connect With Us</h4>
            <div className="social-links" style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <a
                href="https://github.com"
                className="social-icon"
                aria-label="Visit our GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://linkedin.com"
                className="social-icon"
                aria-label="Visit our LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://twitter.com"
                className="social-icon"
                aria-label="Visit our Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>
        </div>
        <hr className="has-background-grey-dark" />
        <div className="content has-text-centered">
          <p className="has-text-grey">
            © 2024 AI E-Learning. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </footer>
  );
}
