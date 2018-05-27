import redis from 'redis';
import { config } from "../config";
import Promise from 'bluebird';

export const redisClient = Promise.promisifyAll(
  redis.createClient(config.redis)
);

export const publisher = Promise.promisifyAll(
  redis.createClient(config.redis)
);

export const subscriber = Promise.promisifyAll(
  redis.createClient(config.redis)
);