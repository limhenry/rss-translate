import {Provider} from './provider.js';

export abstract class BaseProvider implements Provider {
  abstract translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string[]>;

  async translate(
      text: string,
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string> {
    const result = await this.translateBatch(
        [text],
        sourceLanguage,
        targetLanguage,
    );
    return result[0];
  }
}
