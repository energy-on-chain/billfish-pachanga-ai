/**
 * cache.js — Redis-backed response cache for read-only API endpoints.
 *
 * init(client)          — wire up a connected redis client (call once in server.js)
 * get(key)              → parsed value or null
 * set(key, value, ttl)  — stores JSON, default 60 s TTL
 * invalidate(key)       — deletes one key
 * middleware(ttl)       → Express middleware that caches successful POST responses
 *
 * All methods fail silently — if Redis is unavailable the app keeps working,
 * just without caching.
 */

'use strict';

let _client = null;

function init(client) {
  _client = client;
}

async function get(key) {
  if (!_client) return null;
  try {
    const raw = await _client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[cache] get error:', err.message);
    return null;
  }
}

async function set(key, value, ttl = 60) {
  if (!_client) return;
  try {
    await _client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (err) {
    console.warn('[cache] set error:', err.message);
  }
}

async function invalidate(key) {
  if (!_client) return;
  try {
    await _client.del(key);
  } catch (_) {}
}

/**
 * Express middleware. Caches successful (2xx) POST responses for `ttl` seconds.
 * Cache key = route path + serialised request body.
 * Adds X-Cache: HIT / MISS header for observability.
 */
function middleware(ttl = 60) {
  return async (req, res, next) => {
    if (!_client) return next();

    const key = `cache:${req.path}:${JSON.stringify(req.body)}`;

    const cached = await get(key);
    if (cached !== null) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Intercept res.json to store the response before it is sent
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        set(key, data, ttl);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

module.exports = { init, get, set, invalidate, middleware };
