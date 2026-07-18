package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/beevik/etree"
)

type RssService struct {
	translationService *TranslationService
}

func NewRssService(translationService *TranslationService) *RssService {
	return &RssService{
		translationService: translationService,
	}
}

func (s *RssService) TranslateRss(ctx context.Context, url, sourceLanguage, targetLanguage, linkPrefix string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch RSS feed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch RSS feed, status: %s", resp.Status)
	}

	xmlData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read RSS feed body: %w", err)
	}

	doc := etree.NewDocument()
	if err := doc.ReadFromBytes(xmlData); err != nil {
		return nil, fmt.Errorf("failed to parse XML: %w", err)
	}

	root := doc.Root()
	if root == nil {
		return nil, fmt.Errorf("empty XML document")
	}

	channel := root.SelectElement("channel")
	if channel == nil {
		return xmlData, nil
	}

	items := channel.SelectElements("item")
	if len(items) == 0 {
		return xmlData, nil
	}

	titles := make([]string, len(items))
	for i, item := range items {
		titleElement := item.SelectElement("title")
		if titleElement != nil {
			titles[i] = titleElement.Text()
		}
	}

	translatedTitles, err := s.translationService.TranslateBatch(ctx, titles, sourceLanguage, targetLanguage)
	if err != nil {
		return nil, fmt.Errorf("failed to translate titles: %w", err)
	}

	for i, item := range items {
		titleElement := item.SelectElement("title")
		if titleElement != nil && i < len(translatedTitles) && translatedTitles[i] != "" {
			titleElement.SetText(translatedTitles[i])
		}

		if linkPrefix != "" {
			linkElement := item.SelectElement("link")
			if linkElement != nil {
				linkElement.SetText(linkPrefix + linkElement.Text())
			}
		}
	}

	var buf bytes.Buffer
	if _, err := doc.WriteTo(&buf); err != nil {
		return nil, fmt.Errorf("failed to serialize XML: %w", err)
	}

	return buf.Bytes(), nil
}
