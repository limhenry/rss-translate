import {Redis} from 'ioredis';

interface RedisConfig {
  host: string;
  port: number;
}

export class CacheService {
  private redis: Redis;

  constructor(redisConfig: RedisConfig) {
    this.redis = new Redis(redisConfig.port, redisConfig.host);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    const fourteenDaysInSeconds = 14 * 24 * 60 * 60;
    await this.redis.set(key, value, 'EX', fourteenDaysInSeconds);
  }
}
