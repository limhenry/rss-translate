package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"rss-translate/config"
)

type GoogleTranslateRequest struct {
	Q      []string `json:"q"`
	Source string   `json:"source"`
	Target string   `json:"target"`
}

type GoogleTranslateResponse struct {
	Data struct {
		Translations []struct {
			TranslatedText string `json:"translatedText"`
		} `json:"translations"`
	} `json:"data"`
}

type TranslationService struct {
	cacheService *CacheService
	config       *config.Config
	apiUrl       string
}

func NewTranslationService(cacheService *CacheService, cfg *config.Config) *TranslationService {
	return &TranslationService{
		cacheService: cacheService,
		config:       cfg,
		apiUrl:       "https://translation.googleapis.com/language/translate/v2",
	}
}

func (s *TranslationService) Translate(ctx context.Context, text string, sourceLanguage, targetLanguage string) (string, error) {
	results, err := s.TranslateBatch(ctx, []string{text}, sourceLanguage, targetLanguage)
	if err != nil {
		return "", err
	}
	if len(results) > 0 {
		return results[0], nil
	}
	return "", nil
}

func (s *TranslationService) TranslateBatch(ctx context.Context, texts []string, sourceLanguage, targetLanguage string) ([]string, error) {
	if len(texts) == 0 {
		return []string{}, nil
	}

	// Prepare cache keys
	cacheKeys := make([]string, len(texts))
	for i, text := range texts {
		if text != "" {
			cacheKeys[i] = fmt.Sprintf("%s:%s:%s", text, sourceLanguage, targetLanguage)
		}
	}

	// Fetch from cache
	cachedVals, err := s.cacheService.MGet(ctx, cacheKeys)
	if err != nil {
		// Log cache error, but do not fail the request
		if s.config.Logging {
			log.Printf("[TranslationService] Cache MGet error: %v", err)
		}
		cachedVals = make([]string, len(texts))
	}

	// Identify missing translations
	var textsToTranslate []string
	var missingIndices []int
	for i, text := range texts {
		if text == "" {
			continue
		}
		if cachedVals[i] == "" {
			textsToTranslate = append(textsToTranslate, text)
			missingIndices = append(missingIndices, i)
		}
	}

	// If some texts are missing, call Google Cloud Translation API
	if len(textsToTranslate) > 0 {
		newTranslations, err := s.callGoogleTranslate(ctx, textsToTranslate, sourceLanguage, targetLanguage)
		if err != nil {
			return nil, err
		}

		// Save new translations to cache
		toCache := make(map[string]string)
		for i, text := range textsToTranslate {
			cacheKey := fmt.Sprintf("%s:%s:%s", text, sourceLanguage, targetLanguage)
			toCache[cacheKey] = newTranslations[i]
			cachedVals[missingIndices[i]] = newTranslations[i]
		}

		fourteenDays := 14 * 24 * time.Hour
		if err := s.cacheService.MSet(ctx, toCache, fourteenDays); err != nil {
			if s.config.Logging {
				log.Printf("[TranslationService] Cache MSet error: %v", err)
			}
		}
	}

	return cachedVals, nil
}

func (s *TranslationService) callGoogleTranslate(ctx context.Context, texts []string, sourceLanguage, targetLanguage string) ([]string, error) {
	if s.config.GoogleAPIKey == "" {
		return nil, fmt.Errorf("Google API key is not configured")
	}

	reqBody := GoogleTranslateRequest{
		Q:      texts,
		Source: sourceLanguage,
		Target: targetLanguage,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s?key=%s", s.apiUrl, s.config.GoogleAPIKey)

	if s.config.Logging {
		log.Printf("[TranslationService] Request: URL=%s, Body=%s", url, string(jsonData))
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Google Translation API error: %s - %s", resp.Status, string(respBody))
	}

	if s.config.Logging {
		log.Printf("[TranslationService] Response: %s", string(respBody))
	}

	var translateResp GoogleTranslateResponse
	if err := json.Unmarshal(respBody, &translateResp); err != nil {
		return nil, err
	}

	results := make([]string, len(translateResp.Data.Translations))
	for i, t := range translateResp.Data.Translations {
		results[i] = t.TranslatedText
	}

	return results, nil
}
