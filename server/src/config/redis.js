const Redis = require('ioredis');
const logger = require('./logger');

let redis;

async function connectRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true, retryStrategy: (t) => Math.min(t * 50, 2000) });
  await redis.connect();
  redis.on('error', (err) => logger.error('Redis error:', err));
  logger.info('Redis connected');
  return redis;
}

function getRedis() {
  if (!redis) throw new Error('Redis not initialized');
  return redis;
}

const redisHelpers = {
  async set(key, value, ttl) { ttl ? await getRedis().setex(key, ttl, value) : await getRedis().set(key, value); },
  async get(key) { return getRedis().get(key); },
  async del(key) { await getRedis().del(key); },
  async exists(key) { return (await getRedis().exists(key)) === 1; },
  async incr(key, ttl) {
    const count = await getRedis().incr(key);
    if (ttl && count === 1) await getRedis().expire(key, ttl);
    return count;
  },
};

module.exports = { connectRedis, getRedis, redisHelpers };
