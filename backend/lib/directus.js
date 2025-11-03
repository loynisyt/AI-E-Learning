// lib/directus.js
const { Directus } = require('@directus/sdk');

// Użyj nazwy usługi Docker dla backendu w Compose
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://directus:8055';

// Tworzymy instancję klienta Directus
const directus = new Directus(directusUrl);

/**
 * Authenticate with Directus using static token or credentials
 */
async function authenticateDirectus() {
  try {
    if (process.env.DIRECTUS_STATIC_TOKEN) {
      await directus.auth.static(process.env.DIRECTUS_STATIC_TOKEN);
      console.log('Directus authenticated with static token');
    } else if (process.env.DIRECTUS_EMAIL && process.env.DIRECTUS_PASSWORD) {
      await directus.auth.login({
        email: process.env.DIRECTUS_EMAIL,
        password: process.env.DIRECTUS_PASSWORD
      });
      console.log('Directus authenticated with credentials');
    } else {
      console.warn('No Directus authentication configured');
    }
  } catch (error) {
    console.error('Directus authentication failed:', error);
    if (error?.response) {
      console.error('Directus response:', error.response);
    }
  }
}

/**
 * Get items from a Directus collection
 * @param {string} collection - Collection name
 * @param {Object} query - Query parameters
 * @returns {Array} Items from collection
 */
async function getContent(collection, query = {}) {
  try {
    return await directus.items(collection).readMany(query);
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    throw error;
  }
}

/**
 * Create an item in a Directus collection
 * @param {string} collection - Collection name
 * @param {Object} data - Item data
 * @returns {Object} Created item
 */
async function createContent(collection, data) {
  try {
    return await directus.items(collection).createOne(data);
  } catch (error) {
    console.error(`Error creating ${collection}:`, error);
    throw error;
  }
}

/**
 * Update an item in a Directus collection
 * @param {string} collection - Collection name
 * @param {string|number} id - Item ID
 * @param {Object} data - Updated data
 * @returns {Object} Updated item
 */
async function updateContent(collection, id, data) {
  try {
    return await directus.items(collection).updateOne(id, data);
  } catch (error) {
    console.error(`Error updating ${collection}:`, error);
    throw error;
  }
}

/**
 * Delete an item from a Directus collection
 * @param {string} collection - Collection name
 * @param {string|number} id - Item ID
 */
async function deleteContent(collection, id) {
  try {
    await directus.items(collection).deleteOne(id);
  } catch (error) {
    console.error(`Error deleting ${collection}:`, error);
    throw error;
  }
}

module.exports = {
  directus,
  authenticateDirectus,
  getContent,
  createContent,
  updateContent,
  deleteContent
};
