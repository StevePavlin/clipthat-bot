import { config } from '../config';
import { publisher, subscriber, redisClient } from "./redis";
import Queue from 'bull';


export function createQueue(name) {
  return new Queue(name, config.redisUrl, {
    prefix: 'clipthat',
    createClient: (type) => {
      switch (type) {
        case 'client':
          return publisher;
        case 'subscriber':
          return subscriber;
        default:
          return redisClient;
      }
    }

  })
}

export async function addQueueJob(namespace, data = {}, customOptions = {}) {
  const queue = await createQueue(namespace);

  await queue.add(data, Object.assign(
    {
      attempts: 13,
      removeOnComplete: true,
      removeOnFail: true,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }, customOptions)
  );

  await queue.close();
}