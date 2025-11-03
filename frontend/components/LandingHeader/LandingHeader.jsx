'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';

export default function LandingHeader() {

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
    <nav className="navbar " role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link href="/" className="navbar-item">
          <strong style={{ color: '#6C4BFF' }}>AI E-Learning</strong>
        </Link>
      </div>
      <div className="navbar-end">
        <div className="navbar-item">
          <div className="buttons">
            <Link href="/login" passHref>
              <Button variant="outlined" className='is-size-5' color="primary">
                Sign In
              </Button>
            </Link>
            <Link href="#registration" passHref>
              <Button variant="contained" className='is-size-5' color="primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
