import path from 'path';
import request from 'request';
import fs from 'fs-extra';
import {
  maxxtotile,
  minxtotile,
  maxytotile,
  minytotile,
} from './latLngToTileUtil';

interface GisPoint {
  longitude: number;
  latitude: number;
}

interface Params {
  leftTopPoint: GisPoint; // 左上角坐标
  rightBottomPoint: GisPoint; // 右下角坐标
  minZoom?: number; // 最小zoom
  maxZoom?: number; // 最大zoom
  savePath: string; // 保存的目录
  theme?: 'light' | 'dark'; // 亮色 or 深色
  clearDistBeforeStart?: Boolean; // 是否在开始前清空目标目录
}

/**
 * 下载地图
 * @param params
 */
export async function downloader(params: Params) {
  const {
    leftTopPoint,
    rightBottomPoint,
    minZoom = 3,
    maxZoom = 17,
    theme = 'light',
    savePath,
    clearDistBeforeStart,
  } = params;
  const styleid = theme === 'light' ? '1' : '4';

  const maxLon = rightBottomPoint.longitude;
  const minLon = leftTopPoint.longitude;
  const maxLat = leftTopPoint.latitude;
  const minLat = rightBottomPoint.latitude;

  if (clearDistBeforeStart) {
    await fs.emptyDir(savePath);
  }
  for (let z = minZoom; z < maxZoom; z++) {
    const maxXTile = maxxtotile(maxLon, z);
    const minXTile = minxtotile(minLon, z);
    const maxYTile = maxytotile(maxLat, z);
    const minYTile = minytotile(minLat, z);
    for (let x = minXTile; x < maxXTile; x++) {
      for (let y = minYTile; y < maxYTile; y++) {
        const finalZ = z;
        const finalX = x;
        const finalY = y;
        const filePath = getFilePath(finalZ, finalX, finalY, savePath);
        await tryDownloadImage(z, x, y, styleid, filePath);
      }
    }
  }
}

// 图片保存地址
function getFilePath(z: number, x: number, y: number, dirPath: string) {
  return path.resolve(dirPath, `${z}/${x}/${y}.png`);
}

// 下载图片
async function tryDownloadImage(
  z: number,
  x: number,
  y: number,
  styleid: string,
  filePath: string
): Promise<Boolean> {
  const img_url = `http://rt1.map.gtimg.com/tile?z=${z}&x=${x}&y=${y}&styleid=${styleid}&version=117`;
  if (fs.pathExistsSync(filePath)) {
    console.log('跳过' + img_url);
    return true;
  }
  fs.ensureFileSync(filePath);
  //  conn.setRequestProperty(
  //    'User-Agent',
  //    'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT; DigExt)'
  //  );
  return new Promise((resolve, reject) => {
    request(img_url)
      .pipe(fs.createWriteStream(filePath))
      .on('close', function () {
        console.log('已保存' + img_url);
        resolve(true);
      });
  });
}
