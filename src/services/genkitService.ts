import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {openAI} from '@genkit-ai/compat-oai/openai';
import {config} from '../config.js';

export const configureGenkit = () => {
  return genkit({
    plugins: [
      googleAI({apiKey: config.gemini.apiKey}),
      openAI({apiKey: config.openai.apiKey}),
    ],
  });
};

