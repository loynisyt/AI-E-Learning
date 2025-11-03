'use client';
import { Button } from '@mui/material';
import Link from 'next/link';
import ShieldIcon from '@mui/icons-material/Shield';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarIcon from '@mui/icons-material/Star';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Access to basic courses', 'Community support', 'Limited AI tools'],
      cta: 'Start Free',
      planId: 'free',
      highlighted: false,
      icon: ShieldIcon,
    },
    {
      name: 'Premium',
      price: '$29',
      period: 'month',
      features: ['All courses unlocked', 'Priority support', 'Advanced AI tools', 'Certificate of completion'],
      cta: 'Get Premium',
      planId: 'premium',
      highlighted: true,
      icon: RocketLaunchIcon,
    },
    {
      name: 'Premium+',
      price: '$49',
      period: 'month',
      features: ['Everything in Premium', '1-on-1 mentoring', 'Exclusive projects', 'Career guidance'],
      cta: 'Get Premium+',
      planId: 'premium-plus',
      highlighted: false,
      icon: StarIcon,
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <h2 className="title is-2 has-text-centered has-text-link-light">Choose Your Plan</h2>
        <div className="columns is-centered">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div key={index} className="column is-one-third">
                <div
                  className={`card ${plan.highlighted ? 'pricing-card-highlighted' : ''}`}
                  style={{
                    height: '100%',
                    border: plan.highlighted ? '2px solid #6C4BFF' : '1px solid #e1e5e9',
                    borderRadius: '12px',
                    position: 'relative',
                  }}
                >
                  <div className="card-content has-text-centered">
                    <h3 className="title is-4">{plan.name}</h3>
                    <div className="is-size-1 has-text-weight-bold" style={{ color: '#6C4BFF' }}>
                      {plan.price}
                    </div>
                    <p className="is-size-6">per {plan.period}</p>
                    <ul style={{ textAlign: 'left', margin: '1rem 0' }}>
                      {plan.features.map((feature, i) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                    </ul>
                    <Link href={`/login?plan=${plan.planId}`} passHref>
                      <Button
                        variant={plan.highlighted ? 'contained' : 'outlined'}
                        color="primary"
                        fullWidth
                        aria-label={`Select ${plan.name} plan`}
                        startIcon={<IconComponent />}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          boxShadow: plan.highlighted ? '0 8px 30px rgba(108,75,255,0.20), 0 0 18px rgba(76,107,255,0.12)' : 'none',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: plan.highlighted ? '0 12px 40px rgba(108,75,255,0.30), 0 0 24px rgba(76,107,255,0.18)' : '0 4px 12px rgba(0,0,0,0.1)',
                          },
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
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
