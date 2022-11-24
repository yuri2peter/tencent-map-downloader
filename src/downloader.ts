import path from 'path';
import request from 'request';
import logUpdate from 'log-update';
import fs from 'fs-extra';
import {
  maxxtotile,
  minxtotile,
  maxytotile,
  minytotile,
} from './latLngToTileUtil';
import { getETA, waitUntil } from './utils';
import { ROOT_PATH } from '../constant';

const defaultConcurrency = 12;

interface GisPoint {
  longitude: number;
  latitude: number;
}

export interface DownloaderParams {
  leftTopPoint: GisPoint; // 左上角坐标
  rightBottomPoint: GisPoint; // 右下角坐标
  minZoom?: number; // 最小zoom，最小3
  maxZoom?: number; // 最大zoom，最大18
  savePath: string; // 保存的目录
  theme?: 'light' | 'dark'; // 亮色 or 深色
  clearDistBeforeStart?: Boolean; // 是否在开始前清空目标目录
  withWorldMap?: Boolean; // 是否添加世界地图的底图
  concurrency?: number; // 下载并发数，默认defaultConcurrency。并发数太大会导致频繁下载失败
  checkMode?: Boolean; // 是否在检查模式。该模式下，将会减少打印内容，用于检查地图是否有缺漏
  useCache?: boolean; // 是否启用缓存
}

/**
 * 下载地图
 * @param params
 */
export async function downloader(params: DownloaderParams) {
  const { withWorldMap, savePath, clearDistBeforeStart, checkMode } = params;
  console.log('目标目录：' + savePath);
  // 清空目标目录
  if (!checkMode && clearDistBeforeStart) {
    console.log('已清空目录');
    await fs.emptyDir(savePath);
  }
  // 下载底图
  if (withWorldMap) {
    console.log(`正在${checkMode ? '检查' : '下载'}世界底图...`);
    await work({
      ...params,
      leftTopPoint: { longitude: -179, latitude: 89 },
      rightBottomPoint: { longitude: 179, latitude: -89 },
      minZoom: 3,
      maxZoom: 6,
    });
  }
  console.log(`正在${checkMode ? '检查' : '下载'}目标区域地图...`);
  await work(params);
  console.log('任务完成.');
}

async function work(params: DownloaderParams) {
  const {
    leftTopPoint,
    rightBottomPoint,
    minZoom = 3, // 最小3
    maxZoom = 18, // 最大18
    theme = 'light',
    savePath,
    concurrency = defaultConcurrency, // 并发数太大会导致频繁下载失败
    checkMode,
    useCache = false,
  } = params;
  const styleid = theme === 'light' ? '1' : '4';

  const maxLon = rightBottomPoint.longitude;
  const minLon = leftTopPoint.longitude;
  const maxLat = leftTopPoint.latitude;
  const minLat = rightBottomPoint.latitude;

  // 统计数量
  let sum = 0;
  for (let z = minZoom; z <= maxZoom; z++) {
    const maxXTile = maxxtotile(maxLon, z) + 1;
    const minXTile = minxtotile(minLon, z) - 1;
    const maxYTile = maxytotile(maxLat, z) + 1;
    const minYTile = minytotile(minLat, z) - 1;
    for (let x = minXTile; x <= maxXTile; x++) {
      for (let y = minYTile; y <= maxYTile; y++) {
        if (x < 0 || y < 0) {
          continue;
        }
        sum++;
      }
    }
  }
  // 下载瓦片
  let startTime = new Date().getTime();
  let countFinished = 0;
  let countError = 0;
  let countRuning = 0;

  for (let z = minZoom; z <= maxZoom; z++) {
    const maxXTile = maxxtotile(maxLon, z) + 1;
    const minXTile = minxtotile(minLon, z) - 1;
    const maxYTile = maxytotile(maxLat, z) + 1;
    const minYTile = minytotile(minLat, z) - 1;
    for (let x = minXTile; x <= maxXTile; x++) {
      for (let y = minYTile; y <= maxYTile; y++) {
        if (x < 0 || y < 0) {
          continue;
        }
        const finalZ = z;
        const finalX = x;
        const finalY = y;
        const filePath = getFilePath(finalZ, finalX, finalY, savePath);
        let success = true;
        await waitUntil(() => countRuning < concurrency);
        countRuning++;
        tryDownloadImage({
          z,
          x,
          y,
          styleid,
          filePath,
          useCache,
        })
          .catch((err) => {
            success = false;
            countError++;
          })
          .finally(() => {
            countRuning--;
            countFinished++;
            if (!checkMode) {
              logUpdate(
                [
                  // 主题
                  theme,
                  // 进度百分比
                  `${Math.floor((countFinished / sum) * 100)}%`,
                  // ETA
                  `ETA ${Math.ceil(
                    getETA(startTime, countFinished / sum) / 1000 / 60
                  )} mins`,
                  // 完成数量统计
                  `${countFinished} / ${sum}`,
                  // 区块
                  `${z}/${x}/${y}`,
                  // 状态
                  success ? 'ok' : 'error',
                ].join(' | ')
              );
            }
          });
      }
    }
  }
  await waitUntil(() => countRuning === 0);
  logUpdate.clear();
  console.log('下载失败次数：' + countError);
}

// 图片保存地址
function getFilePath(z: number, x: number, y: number, dirPath: string) {
  return path.resolve(dirPath, `${z}/${x}/${y}.png`);
}

// 下载图片
function tryDownloadImage({
  z,
  x,
  y,
  styleid,
  filePath,
  useCache,
}: {
  z: number;
  x: number;
  y: number;
  styleid: string;
  filePath: string;
  useCache: boolean;
}): Promise<Boolean> {
  const img_url = `http://rt1.map.gtimg.com/tile?z=${z}&x=${x}&y=${y}&styleid=${styleid}&version=117`;
  return new Promise((resolve, reject) => {
    // 如果文件已存在
    if (fs.pathExistsSync(filePath)) {
      resolve(true);
      return;
    }
    let cacheFilePath = '';
    if (useCache) {
      // 获取缓存文件路径
      const theme = styleid === '1' ? 'light' : 'dark';
      cacheFilePath = getFilePath(
        z,
        x,
        y,
        path.resolve(ROOT_PATH, `cache/${theme}`)
      );
      // 如果缓存已存在
      if (fs.pathExistsSync(cacheFilePath)) {
        fs.ensureFileSync(filePath);
        fs.cpSync(cacheFilePath, filePath);
        resolve(true);
        return;
      }
    }

    // 如果文件不存在
    fs.ensureFileSync(filePath);
    const fileStream = fs.createWriteStream(filePath);
    let success = true;
    request(
      img_url,
      {
        timeout: 9000,
        headers: {
          'User-Agent':
            'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT; DigExt)',
        },
      },
      (err) => {
        if (err) {
          success = false;
          fileStream.close();
        }
      }
    )
      // 保存文件
      .pipe(fileStream)
      .on('close', function () {
        if (success) {
          resolve(true);
          if (useCache && cacheFilePath) {
            // 保存缓存
            fs.ensureFileSync(cacheFilePath);
            fs.cpSync(filePath, cacheFilePath);
          }
        } else {
          fs.removeSync(filePath);
          reject('network error');
        }
      });
  });
}
