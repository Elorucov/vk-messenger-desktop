import type { IQueueParams } from '../../types/queue';
import type { Logger } from '../Logger';

export const WAIT_TIME = 25;

export function createUrl(urlsData: IQueueParams[], logger?: Logger) {
  const baseUrl = urlsData[0].url;
  const userId = urlsData[0].id;
  let key = urlsData[0].key;
  let timestamp = `${urlsData[0].ts}`;
  for (let i = 1; i < urlsData.length; ++i) {
    if (urlsData[i].id !== userId) {
      const message = `Invalid userId pair: ${userId}, ${urlsData[i].id}`;
      logger?.error(message);
      throw new Error(message);
    }
    if (urlsData[i].url !== baseUrl) {
      const message = `Invalid baseUrl pair: ${baseUrl}, ${urlsData[i].url}`;
      logger?.error(message);
      throw new Error(message);
    }
    key += `${urlsData[i].key}`;
    timestamp += `_${urlsData[i].ts}`;
  }
  return `${baseUrl}?act=a_check&key=${key}&id=${userId}&ts=${timestamp}&wait=${WAIT_TIME}`;
}
