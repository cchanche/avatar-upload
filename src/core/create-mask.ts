import sharp from 'sharp';
import { Logger } from '../utils';
import * as path from 'path';
import { getDistance } from '.';
import * as fs from 'fs';

export type ArrayColor = [number, number, number, number];

export const createMask = async (
  params: { imageSize: number },
  options?: { logger?: Logger; tempFolderName?: string },
) => {
  const { imageSize } = params || {};
  const { logger, tempFolderName } = options || {};

  const maskColor: { inner: ArrayColor; outer: ArrayColor } = {
    outer: [0, 0, 0, 255], // opaque black
    inner: [0, 0, 0, 0], // transparent (white)
  };

  let mask = sharp({
    create: {
      width: imageSize,
      height: imageSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 255 },
    },
  });

  const center: [number, number] = [imageSize / 2, imageSize / 2];

  const maskData = await mask.raw().toBuffer({ resolveWithObject: true });
  const pixelArray = new Uint8ClampedArray(maskData.data);

  const pixelArraySize = imageSize * imageSize * 4;
  if (pixelArraySize !== pixelArray.length) {
    logger?.warn('There was a problem creating the mask');
    process.exit(1);
  }

  // White circle inside black background
  let currentPixelIsAt = 0;
  for (let x = 0; x < imageSize; x++) {
    for (let y = 0; y < imageSize; y++) {
      const distanceToCenter = getDistance(center, [x, y]);

      // centered on the image-center, the circle has a radius of half the image's size
      const shouldBeTransparent = distanceToCenter > imageSize / 2;

      const color = shouldBeTransparent ? maskColor.outer : maskColor.inner;

      // Insert color
      for (let c = 0; c < maskData.info.channels; c++) {
        pixelArray[currentPixelIsAt + c] = color[c];
      }

      // Increment pixel intex
      currentPixelIsAt += maskData.info.channels;
    }
  }

  // Parse-back the modified pixel-array
  const { width, height, channels } = maskData.info;
  mask = sharp(pixelArray, { raw: { width, height, channels } });

  // Save mask
  const OUTPUT_FOLDER_PATH = tempFolderName || 'tmp';
  if (!fs.existsSync(OUTPUT_FOLDER_PATH)) {
    logger?.log('Mask-output folder does not exists. Creating...');
    fs.mkdirSync(OUTPUT_FOLDER_PATH);
    logger?.log('Created folder ' + OUTPUT_FOLDER_PATH);
  }

  const maskFilePath = path.join(OUTPUT_FOLDER_PATH, `badge-mask.png`);
  await mask.toFile(maskFilePath);

  logger?.log(`Wrote mask to ${maskFilePath}`);

  return { maskFilePath, maskColor };
};
