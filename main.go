package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"rss-translate/config"
	"rss-translate/services"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func main() {
	// Load local .env file if it exists
	config.LoadEnv(".env")

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize services
	cacheService := services.NewCacheService(cfg.RedisHost, cfg.RedisPort)
	translationService := services.NewTranslationService(cacheService, cfg)
	rssService := services.NewRssService(translationService)

	// Set up router
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Only allow GET requests
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		query := r.URL.Query()
		urlStr := query.Get("url")
		sl := query.Get("sl")
		tl := query.Get("tl")
		prefix := query.Get("prefix")

		if urlStr == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "url parameter is required"})
			return
		}

		ctx := r.Context()
		translatedXML, err := rssService.TranslateRss(ctx, urlStr, sl, tl, prefix)
		if err != nil {
			log.Printf("[Error] Translation failed: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to translate RSS feed"})
			return
		}

		w.Header().Set("Content-Type", "application/xml")
		w.WriteHeader(http.StatusOK)
		w.Write(translatedXML)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	addr := "0.0.0.0:" + port
	fmt.Printf("Server listening on http://localhost:%s\n", port)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
