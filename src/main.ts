import * as path from 'path';
import * as fs from 'fs';
import { Logger } from './utils';
import Jimp from 'jimp';
import * as dotenv from 'dotenv';
import { getIOFolders } from './core';

// Parse .env into process.env
dotenv.config();

export const handler = (async () => {
  const logger = new Logger('image-upload');

  const { IMG_INPUT_FOLDER_PATH, IMG_OUTPUT_FOLDER_PATH: _ } = getIOFolders({
    logger,
  });

  logger.log('Reading image entries...');
  const entries = fs.readdirSync(IMG_INPUT_FOLDER_PATH, {
    withFileTypes: true,
  });

  const images = entries.filter((e) => e.isFile());

  logger.log('Found images :');
  for (const img of images) {
    logger.log(`  ${img.name}`);
  }

  for (const dirent of images) {
    logger.log(`Process : ${dirent.name}...`);
    // TODO
  }
})();
