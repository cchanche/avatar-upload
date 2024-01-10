import { Logger } from '../utils';
import * as path from 'path';
import sharp from 'sharp';

export const createBadge = async (
  params: {
    sourceImageFilePath: string;
    outputDirectoryPath: string;
    maskFilePath: string;
    imageSize: number;
  },
  options?: { logger?: Logger },
) => {
  const { imageSize, sourceImageFilePath, outputDirectoryPath, maskFilePath } =
    params || {};
  const { logger } = options || {};

  const fileEntry = path.parse(path.basename(sourceImageFilePath));

  // Read & convert to png with sharp
  logger?.log(`Process : ${fileEntry.base}...`);
  const image = sharp(path.resolve(sourceImageFilePath));

  const meta = await image.metadata();

  if (meta.format !== 'png') {
    logger?.log(`  Detected file format : ${meta.format}`);
    logger?.log(`  Convert to png...`);
    image.png({
      palette: true, // enable alpha-transparency
      quality: 50, // be fast
    });
  }

  // no-op if the image already has an alpha channel
  image.ensureAlpha(); // ensure alpha-transparency

  /**
   * Scale the image some, potentially clipping some parts
   *
   * @see https://sharp.pixelplumbing.com/api-resize
   */
  image.resize(imageSize, imageSize, { fit: 'cover' });

  // Mask the image with another (from top-left corner)
  image.composite([{ input: maskFilePath, blend: 'xor' }]);

  const writeFilePath = path.join(
    outputDirectoryPath,
    `${fileEntry.name}_badge.png`,
  );
  // Save and overwrite the image
  await image.toFile(writeFilePath);
  logger?.log(`  Wrote file ${writeFilePath}`);
};
