import {FastifyInstance} from 'fastify';
import {RssService} from './services/rssService.js';

export const rssRoutes = async (
    server: FastifyInstance,
    options: {rssService: RssService},
) => {
  const {rssService} = options;

  server.get('/', async (request, reply) => {
    const {url, sl, tl} = request.query as {
      url: string;
      sl: string;
      tl: string;
    };

    if (!url) {
      return reply.status(400).send({error: 'url parameter is required'});
    }

    try {
      const translatedRss = await rssService.translateRss(url, sl, tl);
      reply.header('Content-Type', 'application/xml');
      reply.send(translatedRss);
    } catch (error) {
      console.error(error);
      reply.status(500).send({error: 'Failed to translate RSS feed'});
    }
  });
};
