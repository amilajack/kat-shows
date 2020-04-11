import Torrent, {
  findShowUrl,
  findEpisodeId,
  parseShows,
  formatShowNameToUrl,
  BASE_URL,
} from '../src/Torrent';

function assertTorrentsFormat(torrents) {
  expect(torrents).toBeInstanceOf(Array);
  const torrent = torrents[0];
  // expect(torrent).to.be.an('object');
  expect(torrent).toHaveProperty('magnet');
  expect(torrent.magnet).toContain('magnet:?');
  expect(torrent).toHaveProperty('seeders');
  expect(torrent).toHaveProperty('leechers');
}

describe('API', () => {
  describe('Parser', () => {
    it('should return promise', async () => {
      expect(findShowUrl('game of thrones')).toBeInstanceOf(Promise);
    });

    it('should correctly format show names to url slugs', () => {
      expect(formatShowNameToUrl('Game of Thrones')).toEqual(
        '/game-of-thrones'
      );
    });

    it('should parse shows page and return array of show urls', async () => {
      const showUrls = await parseShows();
      // expect(showUrls).to.be.an('array');
      const formattedShowUrl = formatShowNameToUrl('game of thrones');

      // for (const url of showUrls) {
      //   expect(url).to.be.a('string');
      // }

      const showUrl = showUrls.find((item) => item.includes(formattedShowUrl));

      expect(showUrl).toEqual('/game-of-thrones-tv11489/');
    });

    it('should find show url and return array of links', async () => {
      const showName = 'game of thrones';
      const parsedShows = await parseShows();
      const showUrl = parsedShows.find((item) =>
        item.includes(formatShowNameToUrl(showName))
      );

      expect(parsedShows).toBeInstanceOf(Array);

      // for (const eachShowUrl of parsedShows) {
      //   expect(eachShowUrl).to.be.an('string');
      // }

      expect(showUrl).toBeInstanceOf(String);
    });

    it('should return a url: 1', async () => {
      expect(await findShowUrl('game of thrones')).toEqual(
        `${BASE_URL}/game-of-thrones-tv11489/`
      );
    });

    it('should return a url: 2', async () => {
      expect(await findShowUrl('prison break')).toEqual(
        `${BASE_URL}/prison-break-tv2769/`
      );
    });

    it('should find shows with capitalized params', async () => {
      expect(await findShowUrl('American Dad')).toEqual(
        `${BASE_URL}/american-dad%21-tv1260/`
      );
    });

    it('should return movies', async () => {
      expect(await findEpisodeId('Game of thrones', '02', '02')).toEqual(
        '237994168'
      );
    });

    it('should return movies with lowercase query', async () => {
      expect(await findEpisodeId('game of thrones', '02', '02')).toEqual(
        '237994168'
      );
    });

    it('should return object with magnet, seeders, leechers: 1', async () => {
      const torrents = await Torrent('Game of thrones', '02', '02');
      assertTorrentsFormat(torrents);
    });

    it('should return object with magnet, seeders, lowercase query', async () => {
      const torrents = await Torrent('game of thrones', '02', '02');
      assertTorrentsFormat(torrents);
    });

    it('should return object with magnet, seeders, leechers: 2', async () => {
      const torrents = await Torrent('Game of thrones', '06', '01');
      assertTorrentsFormat(torrents);
      expect(torrents[0].seeders).toBeGreaterThan(200);
      expect(torrents[2].seeders).toBeGreaterThan(200);
    });
  });
});
