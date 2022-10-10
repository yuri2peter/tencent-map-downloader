// 角度转弧度
function angdegToRadians(angdeg: number) {
  return (angdeg / 180.0) * Math.PI;
}

//max.y=2的n次方减1，除0之外
const arr = [
  0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767,
  65535, 131071, 262143, 524287, 1048595, 2097151, 4194303, 8388607,
];

/**
 * 计算最小的y所对应的行列值
 */
function minytotile(miny: number, zoom: number): number {
  const n = Math.pow(2, zoom);
  const tileY =
    ((1 -
      Math.log(
        Math.tan(angdegToRadians(miny)) + 1 / Math.cos(angdegToRadians(miny))
      ) /
        Math.PI) /
      2) *
    n;
  const y = Math.ceil(tileY);
  return arr[zoom] - y;
}

/**
 * 计算最大的y所对应的行列值
 */
function maxytotile(maxy: number, zoom: number): number {
  const n = Math.pow(2, zoom);
  const tileY =
    ((1 -
      Math.log(
        Math.tan(angdegToRadians(maxy)) + 1 / Math.cos(angdegToRadians(maxy))
      ) /
        Math.PI) /
      2) *
    n;
  const y = Math.floor(tileY);
  return arr[zoom] - y;
}

/**
 * 计算最小的x所对应的行列值
 * @return
 */
function minxtotile(minx: number, zoom: number): number {
  const n = Math.pow(2, zoom);
  const tileX = ((minx + 180) / 360) * n;
  const x = Math.floor(tileX);
  return x;
}

/**
 * 计算最大的x所对应的行列值
 */
function maxxtotile(maxx: number, zoom: number): number {
  const n = Math.pow(2, zoom);
  const tileX = ((maxx + 180) / 360) * n;
  const x = Math.ceil(tileX);
  return x;
}
