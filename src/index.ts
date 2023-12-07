import inquirer from 'inquirer';
import { uncaughtErrorHandle } from './utils/miscs';
import { z } from 'zod';
import { quickStart } from './quickStart';

uncaughtErrorHandle();

async function main() {
  const answer1 = await inquirer.prompt([
    {
      type: 'input',
      name: 'p1',
      message:
        '欢迎使用《腾讯地图瓦片下载工具》      ----Yuri2\n\n访问该网站拾取目标区域的坐标点 https://lbs.qq.com/getPoint/\n\n坐标点形如（注意是英文逗号）：32.227054,117.257865\n\n请输入第一个坐标点（左上角）：',
    },
    {
      type: 'input',
      name: 'p2',
      message: '请输入第二个坐标点（右下角）：',
    },
  ]);
  const pSchema = z
    .string()
    .regex(/^\d+\.\d+,\d+\.\d+$/)
    .transform((data) => {
      const [firstNum, secondNum] = data.split(',').map(Number);
      return [firstNum, secondNum] as [number, number];
    });
  const parseResults = z
    .object({
      p1: pSchema,
      p2: pSchema,
    })
    .safeParse(answer1);
  if (!parseResults.success) {
    console.log('【错误】坐标点格式错误，请重新运行。');
    return;
  }
  const answer2 = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '下载时会清空历史下载结果，确认现在开始下载吗？',
    },
  ]);
  if (!answer2.confirmed) {
    console.log('【终止】已终止操作，请重新运行。');
    return;
  }
  console.log(
    '【开始】下载任务已开始，请耐心等待。如果下载的地图不是最新，请尝试删除cache目录后重新开始任务。'
  );
  const {
    data: { p1, p2 },
  } = parseResults;
  quickStart(p1, p2);
}
main();
