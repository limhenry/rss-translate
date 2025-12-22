import {v3} from '@google-cloud/translate';
import {BaseProvider} from './baseProvider.js';

const {TranslationServiceClient} = v3;

interface GoogleAdvancedConfig {
  projectId: string;
  location: string;
}

export class GoogleAdvancedProvider extends BaseProvider {
  private client: v3.TranslationServiceClient;
  private projectId: string;
  private location: string;
  private logging: boolean;

  constructor(config: GoogleAdvancedConfig, logging = false) {
    super();
    this.client = new TranslationServiceClient();
    this.projectId = config.projectId;
    this.location = config.location;
    this.logging = logging;

    if (!this.projectId || !this.location) {
      throw new Error(
          'GOOGLE_PROJECT_ID and GOOGLE_LOCATION must be set for the ' +
          'advanced provider',
      );
    }
  }

  async translateBatch(
      texts: string[],
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string[]> {
    const request = {
      parent: `projects/${this.projectId}/locations/${this.location}`,
      contents: texts,
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    };

    if (this.logging) {
      console.log('[GoogleAdvancedProvider] Request:', request);
    }

    try {
      const [response] = await this.client.translateText(request);

      if (this.logging) {
        console.log('[GoogleAdvancedProvider] Response:', response);
      }

      return (
        response.translations?.map((t) => t.translatedText || '') || []
      );
    } catch (error) {
      console.error('Error translating with Google Advanced:', error);
      throw error;
    }
  }
}
