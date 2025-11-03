'use client';
import { Button } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function LandingHero() {
  const scrollToRegistration = () => {
    document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero is-large fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="hero-blobs">
        <div className="hero-blob"></div>
        <div className="hero-blob"></div>
      </div>
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="title is-1 has-text-link-light has-text-weight-bold ">
            Learn modern web dev — fast, practical, career-ready.
          </h1>
          <h2 className="subtitle is-4 has-text-light  has-text-weight-bold">
            Hands-on courses, real projects, mentor feedback. Start free — upgrade anytime.
          </h2>
          <div className="buttons is-centered ">
            <Button
              variant="contained"
              color="primary"
              className="btn-get-started button is-fullwidth ml-6 mr-6 pulse"
              onClick={scrollToRegistration}
              aria-label="Get started with registration"
              startIcon={<RocketLaunchIcon />}
              sx={{
                height: '64px',
                padding: '0 32px',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '16px',
                background: 'linear-gradient(90deg, #6C4BFF, #4c4cffff)',
                boxShadow: '0 8px 30px rgba(108,75,255,0.20), 0 0 18px rgba(76,107,255,0.12)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 18px 50px rgba(108,75,255,0.28), 0 0 34px rgba(76,107,255,0.22)',
                  filter: 'drop-shadow(0 6px 28px rgba(76,107,255,0.18))',
                },
                transition: 'transform .18s ease, box-shadow .18s ease',
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
