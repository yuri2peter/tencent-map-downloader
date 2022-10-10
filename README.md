# tencent-map-downloader

疼训瓦片地图下载器

## 安装

```
npm ci
```

## 快速开始

1. 访问 [腾讯在线地图选点工具](https://lbs.qq.com/getPoint/) 复制目标区域的左上角和右下角的经纬度。
2. 修改`index.ts`中`p1, p2`的值。
```ts
// index.ts
import { quickStart } from './src/quickStart';

type Latlgt = [number, number];

async function main() {
  // 腾讯在线地图选点工具 https://lbs.qq.com/getPoint/
  const p1: Latlgt = [32.0136, 116.918519]; // 格式[纬度, 经度]， 第一个点（左上）的经纬度
  const p2: Latlgt = [31.694497, 117.583144]; // 格式[纬度, 经度]， 第二个点（右下）的经纬度
  
  await quickStart(p1, p2, __dirname);
}

main();

```
3. 运行`npm start`等待脚本自动执行即可。

## 进阶

`index.ts`中的`quickStart`工具函数是对`src/downloader`函数的简单封装，足以应付大部分场景。

您也可以选择不使用`quickStart`，直接对`downloader`进行调用，以实现进阶需求。

## 其他

本工具仅供编程学习、交流使用。若由于其他使用形式引发不良后果，请自行承担。