import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// redisClient.on('connect', () => {
//     console.log('Redis Connected');
// });

// redisClient.on('error', (err) => {
//     console.error('Redis connection error:', err);
// });

const redisClient = {
    setex: async () => { },
    get: async () => null,
    on: () => { }
} as any;

export default redisClient;
