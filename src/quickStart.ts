import path from 'path';
import { downloader } from './downloader';

type Latlgt = [number, number];

/**
 * 快速下载一个城市的地图。包括世界底图和亮色深色两个版本。
 * 文件保存在dist/map_tiles目录下
 * @param p1 左上角点
 * @param p2 右下角点
 * @param dirPath 根目录
 * @param zoomLevel 缩放等级
 */
export async function quickStart(
  p1: Latlgt,
  p2: Latlgt,
  dirPath: string,
  zoomLevel?: number
) {
  const commons = {
    leftTopPoint: {
      latitude: p1[0],
      longitude: p1[1],
    },
    rightBottomPoint: {
      latitude: p2[0],
      longitude: p2[1],
    },
    minZoom: 3,
    maxZoom: zoomLevel,
    clearDistBeforeStart: false,
    withWorldMap: true,
  };

  const pathLight = path.resolve(dirPath, 'dist/map-server/tiles_light');
  const pathDark = path.resolve(dirPath, 'dist/map-server/tiles_dark');

  console.log('====================================');
  console.log('下载浅色背景地图...');

  await downloader({
    ...commons,
    savePath: pathLight,
    theme: 'light',
    clearDistBeforeStart: true, // 自动清空目标目录
  });

  console.log('====================================');
  console.log('下载深色背景地图...');

  await downloader({
    ...commons,
    savePath: pathDark,
    theme: 'dark',
    clearDistBeforeStart: true, // 自动清空目标目录
  });

  // 再次下载，检查漏网之鱼，但是如果本次再下载失败则会被忽略
  console.log('====================================');
  console.log('检查浅色背景地图...');
  await downloader({
    ...commons,
    savePath: pathLight,
    theme: 'light',
    checkMode: true,
  });

  console.log('====================================');
  console.log('检查深色背景地图...');
  await downloader({
    ...commons,
    savePath: pathDark,
    theme: 'dark',
    checkMode: true,
  });

  console.log('====================================');
  console.log('全部任务已完成, 请检查dist目录.');
}
