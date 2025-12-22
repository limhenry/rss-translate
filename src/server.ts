import fastify from 'fastify';
import {rssRoutes} from './routes.js';
import {RssService} from './services/rssService.js';

export const buildServer = async (rssService: RssService) => {
  const server = fastify({
    logger: true,
  });

  server.register(rssRoutes, {rssService});

  return server;
};
