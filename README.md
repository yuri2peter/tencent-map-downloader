# tencent-map-downloader

疼逊瓦片地图下载器

## 快速开始

使用 [releases](https://github.com/yuri2peter/tencent-map-downloader/releases) 中发布的便携版 windows 命令行工具。

## 进阶

`index.ts`中的`quickStart`工具函数是对`src/downloader`函数的简单封装，足以应付大部分场景。

您也可以选择不使用`quickStart`，直接对`downloader`进行调用，以实现进阶需求。

## 其他

- 本工具仅供编程学习、交流使用。若由于其他使用形式引发不良后果，请自行承担。
- 中国全境地图坐标参考：53.92237,72.682357 | 14.789894,135.70137
- 合肥市区坐标参考：32.02375,116.974057 | 31.695634,117.635832
- 如何渲染地图？请参考旧版项目[v0.9.0](https://github.com/yuri2peter/tencent-map-downloader/tree/v0.9.0)
