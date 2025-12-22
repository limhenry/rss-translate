import {buildServer} from './server.js';
import {config} from './config.js';
import {CacheService} from './services/cacheService.js';
import {TranslationService} from './services/translationService.js';
import {RssService} from './services/rssService.js';
import {configureGenkit} from './services/genkitService.js';

const start = async () => {
  configureGenkit();

  const cacheService = new CacheService(config.redis);
  const translationService = new TranslationService(cacheService);
  const rssService = new RssService(translationService);

  const server = await buildServer(rssService);
  try {
    await server.listen({port: 3000, host: '0.0.0.0'});
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
