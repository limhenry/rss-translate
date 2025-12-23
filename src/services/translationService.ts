import {CacheService} from './cacheService.js';
import {GoogleTranslateProvider} from './providers/googletranslate.js';
import {GenkitProvider} from './providers/genkit.js';
import {googleAI} from '@genkit-ai/google-genai';
import {openAI} from '@genkit-ai/compat-oai/openai';
import {config} from '../config.js';

export class TranslationService {
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

    const translatedText = await this.getProvider().translate(
        text,
        sourceLanguage,
        targetLanguage,
    );
    await this.cacheService.set(cacheKey, translatedText);
    return translatedText;
  }

  async translateBatch(
      texts: string[],
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string[]> {
    const translations: (string | null)[] = await Promise.all(
        texts.map(async (text) => {
          const cacheKey = `${text}:${sourceLanguage}:${targetLanguage}`;
          const cached = await this.cacheService.get(cacheKey);
          return cached;
        }),
    );

    const textsToTranslate = texts.filter((_, index) => !translations[index]);
    if (textsToTranslate.length > 0) {
      const newTranslations = await this.getProvider().translateBatch(
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

  private getProvider() {
    if (config.logging) {
      console.log(`Using translation provider: ${config.provider}`);
    }
    switch (config.provider) {
      case 'google_translate':
        if (!config.google.apiKey) {
          throw new Error('Google API key is not configured.');
        }
        return new GoogleTranslateProvider(
            config.google.apiKey,
            config.logging,
        );
      case 'gemini':
        return new GenkitProvider(
            googleAI.model(config.gemini.model),
            config.logging,
        );
      case 'openai':
        return new GenkitProvider(
            openAI.model(config.openai.model),
            config.logging,
        );
      default:
        throw new Error(`Unknown translation provider: ${config.provider}`);
    }
  }
}
