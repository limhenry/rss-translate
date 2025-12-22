import {BaseProvider} from './baseProvider.js';
import {configureGenkit} from '../genkitService.js';
import {z} from 'zod';
import {ModelReference} from '@genkit-ai/ai/model';

const ai = configureGenkit();

export class GenkitProvider extends BaseProvider {
  private logging: boolean;

  constructor(
    private model: ModelReference<z.ZodTypeAny>,
    logging = false,
  ) {
    super();
    this.logging = logging;
  }

  async translateBatch(
      texts: string[],
      sourceLanguage: string,
      targetLanguage: string,
  ): Promise<string[]> {
    const prompt = `Translate the following array of texts from ` +
      `${sourceLanguage} to ${targetLanguage}. Return the result as a JSON ` +
      `array of strings. ["${texts.join('", "')}"]`;

    if (this.logging) {
      console.log('[GenkitProvider] Request:', {
        model: this.model.name,
        prompt,
      });
    }

    const result = await ai.generate({
      model: this.model,
      prompt: prompt,
      output: {
        schema: z.array(z.string()),
      },
    });

    if (this.logging) {
      console.log('[GenkitProvider] Response:', result.output);
    }

    return result.output || [];
  }
}
