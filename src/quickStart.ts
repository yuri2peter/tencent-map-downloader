import path from 'path';
import { ROOT_PATH } from './configs';
import { downloader } from './downloader';
import { transToDarkBlueTiles } from './transDarkBlueTiles';

type Latlgt = [number, number];

/**
 * 快速下载一个城市的地图。包括世界底图和亮色深色两个版本。
 * 文件保存在dist/map-server目录下
 * @param p1 左上角点
 * @param p2 右下角点
 * @param dirPath 根目录
 * @param zoomLevel 缩放等级
 */
export async function quickStart(p1: Latlgt, p2: Latlgt, zoomLevel?: number) {
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
    useCache: true,
  };
  const outputDirName = 'output';
  const pathLight = path.resolve(
    ROOT_PATH,
    outputDirName,
    'map-server/tiles_light'
  );
  const pathDark = path.resolve(
    ROOT_PATH,
    outputDirName,
    'map-server/tiles_dark'
  );
  const pathDarkBlue = path.resolve(
    ROOT_PATH,
    outputDirName,
    'map-server/tiles_dark_blue'
  );

  const downloadTilesLight = async () => {
    console.log('====================================');
    console.log('下载浅色背景地图...');

    await downloader({
      ...commons,
      savePath: pathLight,
      theme: 'light',
      clearDistBeforeStart: true, // 自动清空目标目录
    });
  };

  const downloadTilesDark = async () => {
    console.log('====================================');
    console.log('下载深色背景地图...');

    await downloader({
      ...commons,
      savePath: pathDark,
      theme: 'dark',
      clearDistBeforeStart: true, // 自动清空目标目录
    });
  };

  const checkTilesLight = async () => {
    console.log('====================================');
    console.log('检查浅色背景地图...');
    await downloader({
      ...commons,
      savePath: pathLight,
      theme: 'light',
      checkMode: true,
    });
  };

  const checkTilesDark = async () => {
    console.log('====================================');
    console.log('检查深色背景地图...');
    await downloader({
      ...commons,
      savePath: pathDark,
      theme: 'dark',
      checkMode: true,
    });
  };

  const genTilesDarkBlue = async () => {
    console.log('====================================');
    console.log('生成深蓝色背景地图...');
    await transToDarkBlueTiles({
      fromDir: pathDark,
      toDir: pathDarkBlue,
      useCache: true,
      clearDistBeforeStart: true, // 自动清空目标目录
    });
  };

  await downloadTilesLight();
  await checkTilesLight();
  await downloadTilesDark();
  await checkTilesDark();
  await genTilesDarkBlue();
  console.log('====================================');
  console.log('全部任务已完成, 请检查dist目录.');
}
