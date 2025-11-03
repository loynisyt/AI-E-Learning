'use client';
import { useState } from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.consent) newErrors.consent = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'consent' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '', consent: false });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
    }
  };

  return (
    <section
      className="section section--contact"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '4rem 2rem',
        color: '#0B1330'
      }}
    >
      <div className="container">
        <h2 className="title is-2 has-text-centered" style={{ marginBottom: '2rem' }}>
          Get In Touch
        </h2>

        {status === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Message sent successfully! We'll get back to you soon.
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to send message. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="input-row" style={{ marginBottom: '1.5rem' }}>
            <div className="left-icon">
              <PersonIcon className='mt-5' sx={{ color: 'var(--primary)' }} />
            </div>
            <div className="input-col">
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)',
                      boxShadow: '0 8px 30px rgba(76,107,255,0.12)',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="input-row" style={{ marginBottom: '1.5rem' }}>
            <div className="left-icon">
              <EmailIcon  className='mt-5' sx={{ color: 'var(--primary)' }} />
            </div>
            <div className="input-col">
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)',
                      boxShadow: '0 8px 30px rgba(76,107,255,0.12)',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="input-row" style={{ marginBottom: '1.5rem' }}>
            <div className="left-icon">
              <ChatIcon className='mt-5' sx={{ color: 'var(--primary)' }} />
            </div>
            <div className="input-col">
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)',
                      boxShadow: '0 8px 30px rgba(76,107,255,0.12)',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div className="consent--light">
              <FormControlLabel
                control={
                  <Checkbox
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    sx={{
                      '&.Mui-checked': {
                        color: 'var(--primary)',
                      },
                    }}
                  />
                }
                label="I agree to the Terms of Service and Privacy Policy"
              />
            </div>
            {errors.consent && (
              <p style={{ color: '#f14668', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.consent}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            sx={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, var(--primary), var(--primary-variant))',
              boxShadow: '0 8px 30px rgba(108,75,255,0.20)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(108,75,255,0.30)',
              },
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}
