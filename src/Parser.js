/* eslint newline-per-chained-call: 0 */

/**
 * Parse all pages
 *
 * @todo: support callbacks with callbackify
 */
import cheerio from 'cheerio';
import fetch from 'isomorphic-fetch';
import { baseUrl } from './Torrent';


export function _parseTorrentIsVIP(element) {
  return (
    element.find('img[title="VIP"]').attr('title') === 'VIP'
  );
}

export function _parseTorrentIsTrusted(element) {
  return (
    element.find('img[title="Trusted"]').attr('title') === 'Trusted'
  );
}

export function isTorrentVerified(element) {}

export function parsePage(url, parseCallback, filter = {}) {
  const attempt = (error) => {
    if (error) console.log(error);

    return fetch(url, {
      mode: 'no-cors'
    })
    .then(response => response.text());
  };
}
