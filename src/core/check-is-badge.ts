import { Logger } from '../utils';
import * as path from 'path';
import sharp from 'sharp';
import { ArrayColor } from './create-mask';

export const checkIsBadge = async (
  params: {
    sourceImageFilePath: string;
    maskFilePath: string;
    maskColor: {
      inner: ArrayColor;
      outer: ArrayColor;
    };
    imageSize: number;
  },
  options?: { logger?: Logger },
) => {
  const { imageSize, sourceImageFilePath, maskFilePath, maskColor } =
    params || {};
  const { logger } = options || {};

  const fileEntry = path.parse(path.basename(sourceImageFilePath));

  // Read & convert to png with sharp
  logger?.log(`Process : ${fileEntry.base}...`);
  const image = sharp(path.resolve(sourceImageFilePath));

  const meta = await image.metadata();

  if (meta.format !== 'png') {
    throw new Error('Image format is incorrect');
  }

  if (meta.channels !== 4) {
    throw new Error('Image does not support transparency');
  }

  if (meta.height !== imageSize) {
    throw new Error('Image height is incorrect');
  }

  if (meta.width !== imageSize) {
    throw new Error('Image Width is incorrect');
  }

  // Check that individual pixels match the mask
  const imageData = await image.raw().toBuffer({ resolveWithObject: true });
  const pixelArray = new Uint8ClampedArray(imageData.data);

  const maskData = await sharp(maskFilePath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const maskPixelArray = new Uint8ClampedArray(maskData.data);

  const pixelArraySize = imageSize * imageSize * 4;

  if (
    pixelArraySize !== pixelArray.length ||
    pixelArraySize !== maskPixelArray.length
  ) {
    throw new Error('There was a problem fetching raw data');
  }

  let currentPixelIsAt = 0;
  for (let x = 0; x < imageSize; x++) {
    for (let y = 0; y < imageSize; y++) {
      const maskRChannel = maskPixelArray[currentPixelIsAt + 0];
      const maskGChannel = maskPixelArray[currentPixelIsAt + 1];
      const maskBChannel = maskPixelArray[currentPixelIsAt + 2];
      const maskAChannel = maskPixelArray[currentPixelIsAt + 3];
      const imagAChannel = pixelArray[currentPixelIsAt + 3];

      // Whether currentPixel in the mask is in the outer section of the mask
      const shouldBeTransparent =
        maskRChannel === maskColor.outer.at(0) &&
        maskGChannel === maskColor.outer.at(1) &&
        maskBChannel === maskColor.outer.at(2) &&
        maskAChannel === maskColor.outer.at(3);

      if (shouldBeTransparent) {
        // Whether currentPixel in the image is transparent
        const isCurrentTransparent = imagAChannel === 0;
        if (!isCurrentTransparent) {
          throw new Error(
            `Pixel at [${x}, ${y}] does not have the correct alpha-value`,
          );
        }
      }

      // Increment pixel intex
      currentPixelIsAt += meta.channels;
    }
  }
};
