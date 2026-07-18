package services

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheService struct {
	client *redis.Client
}

func NewCacheService(host string, port int) *CacheService {
	client := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%d", host, port),
	})
	return &CacheService{client: client}
}

func (s *CacheService) Get(ctx context.Context, key string) (string, error) {
	return s.client.Get(ctx, key).Result()
}

func (s *CacheService) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return s.client.Set(ctx, key, value, ttl).Err()
}

// MGet retrieves multiple keys in a single round-trip.
func (s *CacheService) MGet(ctx context.Context, keys []string) ([]string, error) {
	if len(keys) == 0 {
		return nil, nil
	}
	vals, err := s.client.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, err
	}

	result := make([]string, len(keys))
	for i, val := range vals {
		if val != nil {
			if str, ok := val.(string); ok {
				result[i] = str
			}
		}
	}
	return result, nil
}

// MSet sets multiple key-value pairs in a single pipelined operation.
func (s *CacheService) MSet(ctx context.Context, keyValues map[string]string, ttl time.Duration) error {
	if len(keyValues) == 0 {
		return nil
	}

	pipe := s.client.Pipeline()
	for k, v := range keyValues {
		pipe.Set(ctx, k, v, ttl)
	}
	_, err := pipe.Exec(ctx)
	return err
}
