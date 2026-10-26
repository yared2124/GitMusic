import { Redis } from '@upstash/redis';
// Works with Upstash directly or the Vercel Marketplace integration (KV_* names). Null in local dev: falls back to memory.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;
