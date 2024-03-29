import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';

const envFile = path.join(__dirname, '../.env');
fs.ensureFileSync(envFile);

dotenv.config({ path: envFile });

const env = process.env as unknown as {};

export const IS_PROD = process.env.NODE_ENV === 'production';
export const ROOT_PATH: string = path.resolve(__dirname, '../');
