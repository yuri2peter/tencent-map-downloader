import path from 'path';
import fs from 'fs-extra';
import logUpdate from 'log-update';
import Jimp from 'jimp';
import { ROOT_PATH } from '../constant';
import { getETA } from './utils';

export async function transToDarkBlueTiles({
  fromDir,
  toDir,
  useCache = false,
  clearDistBeforeStart = false,
}: {
  fromDir: string;
  toDir: string;
  useCache?: boolean;
  clearDistBeforeStart?: boolean;
}) {
  // TODO 遍历文件夹，然后转换像素
  console.log('目标目录：' + toDir);
  // 清空目标目录
  if (clearDistBeforeStart) {
    console.log('已清空目录');
    await fs.emptyDir(toDir);
  }
  const scanResults = await deepDirScan(fromDir);
  const sum = scanResults.length;
  let countFinished = 0;
  let startTime = new Date().getTime();

  for (const fileInfo of scanResults) {
    const pathTo = path.join(toDir, fileInfo.relativePath);
    const pathToCache = path.resolve(
      ROOT_PATH,
      `cache/dark_blue`,
      fileInfo.relativePath
    );
    // 如果已存在
    if (fs.existsSync(pathTo)) {
      countFinished++;
    } else if (useCache && fs.existsSync(pathToCache)) {
      // 尝试使用缓存
      fs.ensureFileSync(pathTo);
      fs.cpSync(pathToCache, pathTo);
      countFinished++;
    } else {
      // 生成
      await transDarkBlueTile(fileInfo.absolutePath, pathTo);
      fs.cpSync(pathTo, pathToCache);
      countFinished++;
    }

    logUpdate(
      [
        // 主题
        'dark_blue',
        // 进度百分比
        `${Math.floor((countFinished / sum) * 100)}%`,
        // ETA
        `ETA ${Math.ceil(
          getETA(startTime, countFinished / sum) / 1000 / 60
        )} mins`,
        // 完成数量统计
        `${countFinished} / ${sum}`,
        // 区块
        fileInfo.relativePath,
      ].join(' | ')
    );
  }
  logUpdate.clear();
}

async function transDarkBlueTile(pathFrom: string, pathTo: string) {
  const image = await Jimp.read(pathFrom);
  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (x, y, idx) {
      // 原像素
      const red1 = this.bitmap.data[idx + 0];
      const green1 = this.bitmap.data[idx + 1];
      const blue1 = this.bitmap.data[idx + 2];

      // 目标色
      const red2 = 8 - 39;
      const green2 = 36 - 45;
      const blue2 = 62 - 57;

      // 融合比例
      // const weight = 0.45;

      // 修改像素
      this.bitmap.data[idx + 0] = pixelColorFix(red1 + red2);
      this.bitmap.data[idx + 1] = pixelColorFix(green1 + green2);
      this.bitmap.data[idx + 2] = pixelColorFix(blue1 + blue2);

      // rgba values run from 0 - 255
      // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
    }
  );
  await image.writeAsync(pathTo);
}

// 融合颜色
function pixelColorMix(a: number, b: number, w: number) {
  return a * (1 - w) + b * w;
}

// 颜色值限制到0~255
function pixelColorFix(color: number) {
  const c = Math.floor(color);
  if (c > 255) return 255;
  if (c < 0) return 0;
  return c;
}

// 遍历文件夹
async function deepDirScan(
  dir: string,
  _results: {
    absolutePath: string;
    relativePath: string;
    fileName: string;
    size: number;
  }[] = [],
  _relativePath: string = ''
) {
  const files = await fs.readdir(path.join(dir, _relativePath));
  for (const file of files) {
    const stats = await fs.stat(path.join(dir, _relativePath, file));
    const isDir = stats.isDirectory();
    if (isDir) {
      // 递归
      await deepDirScan(dir, _results, path.join(_relativePath, file));
    } else {
      // 记录文件
      _results.push({
        absolutePath: path.join(dir, _relativePath, file),
        relativePath: path.join(_relativePath, file),
        fileName: file,
        size: stats.size,
      });
    }
  }
  return _results;
}
