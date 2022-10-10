/**
 * 等待，直到checker返回true
 * @param checker 检查函数
 * @param interval 检查间隔
 * @param timeout 超时则报错，默认0表示不启用
 * @returns
 */
export async function waitUntil(
  checker: (() => boolean) | (() => Promise<boolean>),
  interval = 100,
  timeout = 0
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const checked = await checker();
    if (checked) {
      resolve();
      return;
    }
    let passed = false;
    const itv = setInterval(async () => {
      const checked = await checker();
      if (checked) {
        clearInterval(itv);
        passed = true;
        resolve();
      }
    }, interval);
    if (timeout) {
      setTimeout(() => {
        if (!passed) {
          clearInterval(itv);
          reject(new Error('Wait timeout.'));
        }
      }, timeout);
    }
  });
}

export async function sleep(after = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, after);
  });
}

export function getETA(startTime: number, progress: number) {
  const now = new Date().getTime();
  const duration = now - startTime;
  // d/p = r/(1-p), r = d/p*(1-p)
  const timeLeft = (duration / progress) * (1 - progress);
  return timeLeft;
}
