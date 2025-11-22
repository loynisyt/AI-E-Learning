// importDirectus.js
const { getContent, createContent, updateContent } = require('./lib/directus');
const data = require('./seedData.json'); // Twój JSON

/**
 * Upsert (create or update) kolekcji
 * @param {string} collectionName - nazwa kolekcji w Directus
 * @param {Array} items - tablica rekordów
 * @param {string} uniqueField - pole unikalne, po którym sprawdzamy istnienie
 */
async function upsertCollection(collectionName, items, uniqueField = 'id') {
  console.log(`Importing/updating collection: ${collectionName}`);

  for (const item of items) {
    try {
      let existing = null;

      if (item[uniqueField]) {
        const results = await getContent(collectionName, { filter: { [uniqueField]: { _eq: item[uniqueField] } } });
        existing = results[0] || null;
      }

      if (existing) {
        await updateContent(collectionName, existing.id, item);
        console.log(`  🔄 Updated: ${collectionName} ${item[uniqueField]}`);
      } else {
        await createContent(collectionName, item);
        console.log(`  ✔ Created: ${collectionName} ${item[uniqueField]}`);
      }
    } catch (err) {
      console.error(`  ✖ Failed: ${collectionName} ${item[uniqueField]}`);
      console.error(err.response?.data || err.message || err);
    }
  }
}

async function importAll() {
  if (data.roles) await upsertCollection('roles', data.roles);
  if (data.users) await upsertCollection('users', data.users);
  if (data.courses) await upsertCollection('courses', data.courses);
  if (data.lessons) await upsertCollection('lessons', data.lessons);
  if (data.modules) await upsertCollection('modules', data.modules);
  if (data.submodules) await upsertCollection('submodules', data.submodules);
  if (data.topics) await upsertCollection('topics', data.topics);
  if (data.ai_tools) await upsertCollection('ai_tools', data.ai_tools);
  if (data.exercises) await upsertCollection('exercises', data.exercises);
  if (data.user_progress) await upsertCollection('user_progress', data.user_progress);
  if (data.chats) await upsertCollection('chats', data.chats);
  if (data.messages) await upsertCollection('messages', data.messages);

  console.log('✅ All collections imported/updated');
}

importAll().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
