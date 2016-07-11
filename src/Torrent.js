/**
 * Parse all pages
 */
import cheerio from 'cheerio';
import fetch from 'isomorphic-fetch';


export const baseUrl = 'https://kat.cr';

export async function parseShows() {
  try {
    const showsHtml = await fetch(`${baseUrl}/tv/show`, {
      mode: 'no-cors'
    })
    .then(response => response.text());

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
  } catch (err) {
    console.log(err);
  }
}

export async function findShowUrl(showName) {
  if (process.env.NODE_ENV !== 'production') console.log({ showName });
  if (!showName) throw new Error('Show name param required');

  const parsedShows = await parseShows();
  const formattedShowUrl = (`/${showName}`).toLowerCase().replace(/ /g, '-');

  const showUrl = parsedShows.find(
    showUrls => showUrls.includes(formattedShowUrl)
  );

  if (process.env.NODE_ENV !== 'production') {
    console.log({ showName, showUrl, formattedShowUrl, parsedShows });
  }

  if (!showUrl) {
    throw new Error('A show could not be found');
  }

  return `${baseUrl}${showUrl}`;
}

export async function findEpisodeId(showName, season, episode) {
  const showUrl = await findShowUrl(showName);
  const episodeTorrentsHtml = await fetch(showUrl, {
    mode: 'no-cors'
  })
  .then(response => response.text());

  const $ = cheerio.load(episodeTorrentsHtml);

  const episodeUrl = $('.doublecelltable')
    .find(`h3:contains('Season ${season}')`)
    .next()
    .find(`.versionsEpNo:contains('Episode ${episode}')`)
    .parent()
    .attr('onclick');

  const indexes = [];
  const ids = [];

  for (let i = 0; i < episodeUrl.length; i++) {
    if (episodeUrl[i] === "'") indexes.push(i);
  }

  for (let i = indexes[0] + 1; i < indexes[1]; i++) {
    ids.push(episodeUrl[i]);
  }

  return ids.join('');
}

export default async function parseTorrent(showName, season, episode) {
  const episodeId = await findEpisodeId(showName, season, episode);

  const torrentsHtml = await fetch(`${baseUrl}/media/getepisode/${episodeId}`)
    .then(res => res.text());

  const $ = cheerio.load(torrentsHtml);

  const torrents = $("table tr:not('.firstr')").map(function formatTorrents() {
    return {
      magnet: $(this).find('[title="Torrent magnet link"]').attr('href'),
      seeders: parseInt($(this).find('.green.center').text(), 10),
      leechers: parseInt($(this).find('.red.lasttd.center').text(), 10)
    };
  }).get();

  return torrents;
}
