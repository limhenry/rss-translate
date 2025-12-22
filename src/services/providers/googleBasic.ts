import fetch from 'node-fetch';
import {BaseProvider} from './baseProvider.js';

interface GoogleTranslateResponse {
  data: {
    translations: {
      translatedText: string;
    }[];
  };
}

export class GoogleBasicProvider extends BaseProvider {
  private apiKey: string;
  private logging: boolean;
  private apiUrl =
    'https://translation.googleapis.com/language/translate/v2';

  constructor(apiKey: string, logging = false) {
    super();
    this.apiKey = apiKey;
    this.logging = logging;
    if (!this.apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }
  }

  async translateBatch(
      texts: string[],
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string[]> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    const body = {
      q: texts,
      source: sourceLanguage,
      target: targetLanguage,
    };

    if (this.logging) {
      console.log('[GoogleBasicProvider] Request:', {url, body});
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

    if (this.logging) {
      console.log('[GoogleBasicProvider] Response:', result);
    }

    return result.data.translations.map((t) => t.translatedText);
  }
}
