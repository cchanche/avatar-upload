import * as path from 'path';
import * as fs from 'fs';
import { Logger, argparse } from './utils';
import { checkIsBadge, createMask, getIOFolders } from './core';

export const test = async (
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

  const { maskFilePath, maskColor } = await createMask(
    { imageSize },
    { logger },
  );

  // Process input images
  for (const dirent of images) {
    try {
      await checkIsBadge(
        {
          imageSize,
          maskColor,
          maskFilePath,
          sourceImageFilePath: path.join(IMG_INPUT_FOLDER_PATH, dirent.name),
        },
        { logger },
      );
    } catch (err) {
      logger?.warn((err as Error).message);
      continue;
    }

    // File is a badge, copy
    logger?.log(`${dirent.name} is a badge, copying...`);
    fs.copyFileSync(
      path.join(IMG_INPUT_FOLDER_PATH, dirent.name),
      path.join(IMG_OUTPUT_FOLDER_PATH, dirent.name),
    );
  }
};
