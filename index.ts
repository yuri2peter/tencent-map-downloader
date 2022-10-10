import { downloader } from './src/downloader';

async function main() {
  const params = {
    leftTopPoint: {
      longitude: 117.1452,
      latitude: 31.8511,
    },
    rightBottomPoint: {
      longitude: 117.1856,
      latitude: 31.8318,
    },
    savePath: __dirname + '/dist',
    minZoom: 3,
    maxZoom: 17,
    theme: 'light' as 'light',
    clearDistBeforeStart: true,
  };
  downloader(params);
}
main();
