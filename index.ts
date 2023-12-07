import { quickStart } from './src/quickStart';

type Latlgt = [number, number];

async function main() {
  // 腾讯在线地图选点工具 https://lbs.qq.com/getPoint/
  const p1: Latlgt = [31.781473, 118.01271]; // 格式[纬度, 经度]， 第一个点（左上）的经纬度
  const p2: Latlgt = [31.668129, 118.173066]; // 格式[纬度, 经度]， 第二个点（右下）的经纬度

  await quickStart(p1, p2); // 含山县
}

main();
