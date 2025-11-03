// lib/directusAdmin.js
const { createDirectus, authentication, rest } = require('@directus/sdk');

// Initialize Directus client
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
  .with(authentication('json'))
  .with(rest());

/**
 * Create admin user in Directus
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 */
async function createDirectusAdmin(email = 'admin@example.com', password = 'Loynis2020@') {
  try {
    console.log('Attempting to create Directus admin user...');

    // Try to login first (user might already exist)
    try {
      await directus.login(email, password);
      console.log('Directus admin user already exists and login successful');
      return;
    } catch (loginError) {
      console.log('Admin user does not exist, creating...');
    }

    // Create admin user via Directus API
    // Note: This requires admin privileges or proper role setup
    // In production, you might need to bootstrap Directus differently
    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You might need a static token or admin token here
        'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN || ''}`
      },
      body: JSON.stringify({
        email,
        password,
        role: 'admin', // This might need to be a valid role ID
        status: 'active'
      })
    });

    if (response.ok) {
      console.log('Directus admin user created successfully');
    } else {
      const errorData = await response.json();
      console.error('Failed to create Directus admin:', errorData);
      console.log('Note: You may need to create the admin user manually in Directus UI');
    }
  } catch (error) {
    console.error('Error creating Directus admin:', error);
    console.log('Note: Directus admin creation may require manual setup');
  }
}

module.exports = {
  createDirectusAdmin
};
