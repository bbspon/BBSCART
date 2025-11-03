// config/redisClient.js
const { createClient } = require('@redis/client');

const REDIS_ENABLED = String(process.env.REDIS_ENABLED || '').toLowerCase() === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client = null;

async function getRedis() {
  if (!REDIS_ENABLED) return null; // dev: skip silently
  if (client) return client;

  client = createClient({ url: REDIS_URL });
  client.on('error', (err) => console.error('❌ Redis Client Error:', err));
  await client.connect();
  console.log('✅ Redis connected');
  return client;
}

module.exports = { getRedis };


