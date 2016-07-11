/**
 * Test all high level methods
 *
 * @todo: reduced the number of api calls by querying once and running multiple
 *        tests against that query. ideally, this would be done in a 'before'
 *        function
 */

/*
 eslint no-unused-expressions: 0, new-cap: 0 no-console: 0, func-names: 0, no-use-before-define: 0
*/
import { expect } from 'chai';
import Torrent, {
  findShowUrl, findEpisodeId, parseShows
} from '../src/Torrent';


describe('api', () => {
  describe('Parser', () => {
    it('should return promise', async done => {
      try {
        expect(findShowUrl('game of thrones')).to.be.a('promise');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should find show url and return array of links', async done => {
      try {
        const showName = 'game of thrones';
        const parsedShows = await parseShows();
        const showUrl = parsedShows.find(
          item => item.includes((`/${showName}`).toLowerCase().replace(/ /g, '-'))
        );

        expect(parsedShows).to.be.an('array');

        for (const eachShowUrl of parsedShows) {
          expect(eachShowUrl).to.be.an('string');
        }

        expect(showUrl).to.be.an('string');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return a url: 1', async done => {
      try {
        expect(await findShowUrl('game of thrones'))
          .to
          .equal('https://kat.cr/game-of-thrones-tv11489/');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return a url: 2', async done => {
      try {
        expect(await findShowUrl('prison break'))
          .to.equal('https://kat.cr/prison-break-tv2769/');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should find shows with capitalized params', async done => {
      try {
        expect(await findShowUrl('American Dad'))
          .to.equal('https://kat.cr/american-dad%21-tv1260/');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return movies', async done => {
      try {
        expect(await findEpisodeId('Game of thrones', '02', '02'))
          .to.equal('237994168');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return movies with lowercase query', async done => {
      try {
        expect(await findEpisodeId('game of thrones', '02', '02'))
          .to.equal('237994168');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return object with magnet, seeders, leechers: 1', async done => {
      try {
        const torrents = await Torrent('Game of thrones', '02', '02');
        assertTorrentsFormat(torrents);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return object with magnet, seeders, lowercase query', async done => {
      try {
        const torrents = await Torrent('game of thrones', '02', '02');
        assertTorrentsFormat(torrents);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return object with magnet, seeders, leechers: 2', async done => {
      try {
        const torrents = await Torrent('Game of thrones', '06', '01');
        assertTorrentsFormat(torrents);
        expect(torrents[0].seeders).to.be.greaterThan(200);
        expect(torrents[2].seeders).to.be.greaterThan(200);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

function assertTorrentsFormat(torrents) {
  expect(torrents).to.be.an('array');

  const torrent = torrents[0];
  expect(torrent).to.be.an('object');
  expect(torrent).to.have.deep.property('magnet').that.is.a('string');
  expect(torrent.magnet).to.include('magnet:?');
  expect(torrent).to.have.deep.property('seeders').that.is.a('number');
  expect(torrent).to.have.deep.property('leechers').that.is.a('number');
}
