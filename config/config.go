package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Logging      bool
	RedisHost    string
	RedisPort    int
	GoogleAPIKey string
}

// LoadEnv loads environment variables from a .env file if it exists.
func LoadEnv(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		return // Ignore if the file doesn't exist (e.g. in production containers)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			// Strip quotes if present
			if (strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"")) ||
				(strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'")) {
				val = val[1 : len(val)-1]
			}
			// Set the environment variable if not already set
			if os.Getenv(key) == "" {
				os.Setenv(key, val)
			}
		}
	}
}

func LoadConfig() *Config {
	logging, _ := strconv.ParseBool(os.Getenv("LOGGING"))
	
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}
	
	redisPort := 6379
	if redisPortStr := os.Getenv("REDIS_PORT"); redisPortStr != "" {
		if p, err := strconv.Atoi(redisPortStr); err == nil {
			redisPort = p
		}
	}

	return &Config{
		Logging:      logging,
		RedisHost:    redisHost,
		RedisPort:    redisPort,
		GoogleAPIKey: os.Getenv("GOOGLE_API_KEY"),
	}
}
