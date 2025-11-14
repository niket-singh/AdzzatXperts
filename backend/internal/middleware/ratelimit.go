package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Simple in-memory rate limiter
type rateLimiter struct {
	requests map[string][]time.Time
	mu       sync.RWMutex
}

var limiter = &rateLimiter{
	requests: make(map[string][]time.Time),
}

// RateLimitMiddleware limits requests per IP address
// Default: 100 requests per minute per IP
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	if requestsPerMinute == 0 {
		requestsPerMinute = 100
	}

	// Cleanup old entries every 5 minutes
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			limiter.mu.Lock()
			now := time.Now()
			for ip, timestamps := range limiter.requests {
				// Remove timestamps older than 1 minute
				valid := []time.Time{}
				for _, t := range timestamps {
					if now.Sub(t) < time.Minute {
						valid = append(valid, t)
					}
				}
				if len(valid) == 0 {
					delete(limiter.requests, ip)
				} else {
					limiter.requests[ip] = valid
				}
			}
			limiter.mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		now := time.Now()
		timestamps := limiter.requests[ip]

		// Remove timestamps older than 1 minute
		valid := []time.Time{}
		for _, t := range timestamps {
			if now.Sub(t) < time.Minute {
				valid = append(valid, t)
			}
		}

		// Check if rate limit exceeded
		if len(valid) >= requestsPerMinute {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
			return
		}

		// Add current request
		valid = append(valid, now)
		limiter.requests[ip] = valid

		c.Next()
	}
}
