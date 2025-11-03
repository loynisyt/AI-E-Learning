'use client';
import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Button, TextField, Alert, CircularProgress } from '@mui/material';
import Link from 'next/link';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { signInWithGooglePopup, signInWithFacebookPopup } from '@/lib/firebaseClient';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    plan: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (isRegistering && !formData.firstName.trim()) newErrors.firstName = 'First name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDirectusSignup = async () => {
    if (!validate()) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          plan: formData.plan,
        }),
      });
      if (response.ok) {
        setStatus('success');
        // Redirect to login or auto-login
        await signIn('credentials', { email: formData.email, password: formData.password });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setStatus('error');
    }
  };

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFirebaseSignIn = async (provider) => {
    setLoading(true);
    try {
      let result;
      if (provider === 'google') {
        result = await signInWithGooglePopup();
      } else if (provider === 'facebook') {
        result = await signInWithFacebookPopup();
      }

      if (result) {
        // Send ID token to backend for verification and session creation
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: result.idToken }),
        });

        if (response.ok) {
          // Redirect to dashboard on success
          router.push('/dashboard');
        } else {
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('Firebase sign-in error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `/api/auth/oauth/${provider}?redirect=${encodeURIComponent('/dashboard')}`;
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-half">
            <h1 className="title is-1 css-74q9gv-MuiTypography-root has-text-centered">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </h1>
            {status === 'success' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Account created successfully!
              </Alert>
            )}
            {status === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Something went wrong. Please try again.
              </Alert>
            )}
          
            <hr />
            <form onSubmit={(e) => { e.preventDefault(); isRegistering ? handleDirectusSignup() : signIn('credentials', formData); }}>
              {isRegistering && (
                <>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    margin="normal"
                  />
                </>
              )}
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                required
              />
              <div style={{ marginTop: '1rem' }}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </Button>
              </div>

                <div className="buttons is-centered mt-4">
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
                variant="outlined"
                onClick={() => handleFirebaseSignIn('google')}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                Sign in with Google
              </Button>
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <FacebookIcon />}
                variant="outlined"
                onClick={() => handleFirebaseSignIn('facebook')}
                disabled={loading}
              >
                Sign in with Facebook
              </Button>
            </div>

            </form>
            <p className="has-text-centered" style={{ marginTop: '1rem' }}>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link href="#" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Sign In' : 'Create Account'}
              </Link>
            </p>
            <p className="has-text-centered">
              <Link href="/">Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
