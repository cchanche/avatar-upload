import * as path from 'path';
import * as fs from 'fs';
import { Logger, argparse } from './utils';
import { createBadge, createMask, getIOFolders } from './core';

export const create = async (
  params: ReturnType<typeof argparse>,
  options?: { logger?: Logger },
) => {
  const { imageSize } = params;
  const { logger } = options || {};

  const { IMG_INPUT_FOLDER_PATH, IMG_OUTPUT_FOLDER_PATH } = getIOFolders({
    logger,
  });

  logger?.log('Reading image entries...');
  const entries = fs.readdirSync(IMG_INPUT_FOLDER_PATH, {
    withFileTypes: true,
  });

  const images = entries.filter((e) => e.isFile());

  logger?.log('Found images :');
  for (const img of images) {
    logger?.log(`  ${img.name}`);
  }

  const { maskFilePath } = await createMask({ imageSize }, { logger });

  // Process input images
  for (const dirent of images) {
    await createBadge(
      {
        imageSize,
        maskFilePath,
        outputDirectoryPath: IMG_OUTPUT_FOLDER_PATH,
        sourceImageFilePath: path.join(IMG_INPUT_FOLDER_PATH, dirent.name),
      },
      { logger },
    );
  }
};
