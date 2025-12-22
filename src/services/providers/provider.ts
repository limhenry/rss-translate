export interface Provider {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;
  translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]>;
}
