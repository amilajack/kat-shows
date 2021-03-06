/**
 * Parse all pages
 */
import cheerio from 'cheerio';
import fetch from 'node-fetch';

export const BASE_URL = 'https://kickass.ws';

export function formatShowNameToUrl(showName) {
  return `/${showName}`.toLowerCase().replace(/ /g, '-');
}

export async function parseShows() {
  const showsHtml = await fetch(`${BASE_URL}/tv/shows`, {
    mode: 'no-cors',
  }).then((response) => response.text());

  const $ = cheerio.load(showsHtml);

  const items = $('.textcontent a.plain')
    .filter(function filterEmptyUrls() {
      return $(this).attr('href') !== '#' && !!$(this).attr('href');
    })
    .map(function parseShowsHtml() {
      return $(this).attr('href');
    })
    .get();

  return items;
}

export async function findShowUrl(showName) {
  if (!showName) throw new Error('Show name param required');

  const parsedShows = await parseShows();
  const formattedShowUrl = formatShowNameToUrl(showName);

  const showUrl = parsedShows.find((showUrls) =>
    showUrls.includes(formattedShowUrl)
  );

  if (!showUrl) {
    throw new Error('A show could not be found');
  }

  return `${BASE_URL}${showUrl}`;
}

export async function findEpisodeId(showName, season, episode) {
  const showUrl = await findShowUrl(showName);
  const episodeTorrentsHtml = await fetch(showUrl, {
    mode: 'no-cors',
  }).then((response) => response.text());

  const $ = cheerio.load(episodeTorrentsHtml);

  const episodeUrl = $('.doublecelltable')
    .find(`h3:contains('Season ${season}')`)
    .next()
    .find(`.versionsEpNo:contains('Episode ${episode}')`)
    .parent()
    .attr('onclick');

  const indexes = [];
  const ids = [];

  for (let i = 0; i < episodeUrl.length; i += 1) {
    if (episodeUrl[i] === "'") indexes.push(i);
  }

  for (let i = indexes[0] + 1; i < indexes[1]; i += 1) {
    ids.push(episodeUrl[i]);
  }

  return ids.join('');
}

export default async function parseTorrent(showName, season, episode) {
  const episodeId = await findEpisodeId(showName, season, episode);

  const torrentsHtml = await fetch(
    `${BASE_URL}/media/getepisode/${episodeId}`
  ).then((res) => res.text());

  const $ = cheerio.load(torrentsHtml);

  const torrents = $("table tr:not('.firstr')")
    .map(function formatTorrents() {
      return {
        magnet: $(this).find('[title="Torrent magnet link"]').attr('href'),
        metadata: $(this).find('[title="Torrent magnet link"]').attr('href'),
        seeders: parseInt($(this).find('.green.center').text(), 10),
        leechers: parseInt($(this).find('.red.lasttd.center').text(), 10),
      };
    })
    .get();

  return torrents;
}
