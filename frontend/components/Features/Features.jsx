'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ComputerIcon from '@mui/icons-material/Computer';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import MoneyIcon from '@mui/icons-material/Money';
import MediaIcon from '@mui/icons-material/MovieCreation';
import CompanyIcon from '@mui/icons-material/BusinessCenter';

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              '.feature-card',
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: 'AI Tools Mastery',
      description: 'Learn to use cutting-edge AI tools for development and productivity.',
      icon: ComputerIcon,
      bullets: ['Prompt engineering', 'AI-assisted coding', 'Tool integration'],
    },
    {
      title: 'Hands-on Projects',
      description: 'Build real-world applications with AI technologies.',
      icon: RocketLaunchIcon,
      bullets: ['Portfolio projects', 'Collaborative coding', 'Industry standards'],
    },
    {
      title: 'Expert Mentorship',
      description: 'Get feedback from industry professionals and AI experts.',
      icon: SchoolIcon,
      bullets: ['Code reviews', 'Career guidance', 'Networking opportunities'],
    },
     {
      title: 'Ai Media Creation',
      description: 'Create stunning media content using AI-powered tools.',
      icon: MediaIcon,
      bullets: ['AI image generation', 'Video editing with AI', 'Audio synthesis'],
    },
      {
      title: 'Ai in Trading/investment',
      description: 'Leverage AI for smarter trading and investment strategies.',
      icon: MoneyIcon,
      bullets: ['Algorithmic trading', 'Market analysis', 'Risk management'],
    },
      {
      title: 'Ai in Company Management',
      description: 'Optimize business operations with AI-driven solutions.',
      icon: CompanyIcon,
      bullets: ['Process automation', 'Data-driven decisions', 'Customer insights'],
    },
    
  ];

  return (
    <section className=" section section--features" ref={sectionRef}>
      <div className="container ">
        <h2 className="title is-2 has-text-centered has-text-link-light">What You'll Learn</h2>
        <div className="columns is-multiline ">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="column is-one-third ">
                <div className="card features-card has-background-light" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div className="sheen"></div>
                  <div className="card-content has-text-centered">
                    <div className="icon mb-6" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#6C4BFF' }}>
                      <IconComponent fontSize="inherit" />
                    </div>
                    <h3 className="title is-4" style={{ fontWeight: 700, marginBottom: '8px' }}>
                      {feature.title}
                    </h3>
                    <p
                      className="subtitle is-6"
                      style={{
                        fontWeight: 300,
                        color: 'rgba(11,19,48,0.8)',
                        lineHeight: 1.6
                      }}
                    >
                      {feature.description}
                    </p>
                    <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
                      {feature.bullets.map((bullet, i) => (
                        <li key={i} style={{ fontWeight: 300, color: 'rgba(11,19,48,0.8)' }}>
                          • {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
