// lib/directus.js
const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://directus:8055';
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

const client = axios.create({
  baseURL: `${DIRECTUS_URL}/items`,
  headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
});

/**
 * Authenticate with Directus (no-op for static token)
 */
async function authenticateDirectus() {
  console.log('Directus client initialized with static token');
}

/**
 * Get items from a Directus collection
 * @param {string} collection - Collection name
 * @param {Object} query - Query parameters
 * @returns {Array} Items from collection
 */
async function getContent(collection, params = {}) {
  try {
    const res = await client.get(`/${collection}`, { params });
    return res.data;
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
    const res = await client.post(`/${collection}`, data);
    return res.data;
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
    const res = await client.patch(`/${collection}/${id}`, data);
    return res.data;
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
    await client.delete(`/${collection}/${id}`);
  } catch (error) {
    console.error(`Error deleting ${collection}:`, error);
    throw error;
  }
}

module.exports = {
  authenticateDirectus,
  getContent,
  createContent,
  updateContent,
  deleteContent
};
