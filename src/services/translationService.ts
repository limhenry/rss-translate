import fetch from 'node-fetch';
import {CacheService} from './cacheService.js';
import {config} from '../config.js';

interface GoogleTranslateResponse {
  data: {
    translations: {
      translatedText: string;
    }[];
  };
}

export class TranslationService {
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(private cacheService: CacheService) {}

  async translate(
      text: string,
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string> {
    const cacheKey = `${text}:${sourceLanguage}:${targetLanguage}`;
    const cachedTranslation = await this.cacheService.get(cacheKey);

    if (cachedTranslation) {
      return cachedTranslation;
    }

    const result = await this.translateBatch(
        [text],
        sourceLanguage,
        targetLanguage,
    );
    return result[0];
  }

  async translateBatch(
      texts: string[],
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    const translations: (string | null)[] = await Promise.all(
        texts.map(async (text) => {
          const cacheKey = `${text}:${sourceLanguage}:${targetLanguage}`;
          const cached = await this.cacheService.get(cacheKey);
          return cached;
        }),
    );

    const textsToTranslate = texts.filter((_, index) => !translations[index]);
    if (textsToTranslate.length > 0) {
      const newTranslations = await this.callGoogleTranslate(
          textsToTranslate,
          sourceLanguage,
          targetLanguage,
      );

      await Promise.all(
          textsToTranslate.map(async (text, index) => {
            const cacheKey = `${text}:${sourceLanguage}:${targetLanguage}`;
            await this.cacheService.set(cacheKey, newTranslations[index]);
            let originalIndex = 0;
            for (let i = 0; i < translations.length; i++) {
              if (texts[i] === text) {
                originalIndex = i;
                break;
              }
            }
            translations[originalIndex] = newTranslations[index];
          }),
      );
    }

    return translations.map((t) => t || '');
  }

  private async callGoogleTranslate(
      texts: string[],
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string[]> {
    if (!config.google.apiKey) {
      throw new Error('Google API key is not configured.');
    }

    const url = `${this.apiUrl}?key=${config.google.apiKey}`;
    const body = {
      q: texts,
      source: sourceLanguage,
      target: targetLanguage,
    };

    if (config.logging) {
      console.log('[TranslationService] Request:', {url, body});
    }

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'},
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
          `Google Translation API error: ${response.statusText} - ${errorBody}`,
      );
    }

    const result = (await response.json()) as GoogleTranslateResponse;

    if (config.logging) {
      console.log('[TranslationService] Response:', result);
    }

    return result.data.translations.map((t) => t.translatedText);
  }
}
