import fetch from 'node-fetch';
import {parseStringPromise, Builder} from 'xml2js';
import {TranslationService} from './translationService.js';

interface RssItem {
  title: string[];
  link?: string[];
}

export class RssService {
  constructor(private translationService: TranslationService) {}

  async translateRss(
      url: string,
      sourceLanguage: string,
      targetLanguage: string,
      linkPrefix?: string,
  ): Promise<string> {
    const response = await fetch(url);
    const xml = await response.text();
    const rss = await parseStringPromise(xml);
    const builder = new Builder();

    const items: RssItem[] | undefined = rss.rss?.channel?.[0]?.item;

    if (!items || items.length === 0) {
      return builder.buildObject(rss);
    }

    const titles = items.map((item) => item.title[0]);
    const translatedTitles = await this.translationService.translateBatch(
        titles,
        sourceLanguage,
        targetLanguage,
    );
    items.forEach((item, index) => {
      if (translatedTitles[index]) {
        item.title[0] = translatedTitles[index];
      }
      if (linkPrefix && item.link?.[0]) {
        item.link[0] = linkPrefix + item.link[0];
      }
    });

    return builder.buildObject(rss);
  }
}
