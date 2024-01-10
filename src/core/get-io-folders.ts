import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../utils';

export const getIOFolders = (options: {
  folderName?: {
    /**
     * Input Folder
     * @default 'input'
     */
    input?: string;
    /**
     * Ouptut Folder
     * @default 'output'
     */
    output?: string;
  };
  logger?: Logger;
}) => {
  const { logger } = options || {};

  const IMG_INPUT_FOLDER = options?.folderName?.input || 'input';
  const IMG_INPUT_FOLDER_PATH = path.resolve(IMG_INPUT_FOLDER);

  const IMG_OUTPUT_FOLDER = options?.folderName?.output || 'output';
  const IMG_OUTPUT_FOLDER_PATH = path.resolve(IMG_OUTPUT_FOLDER);

  // Check input & output folders
  if (!fs.existsSync(IMG_INPUT_FOLDER_PATH)) {
    logger?.log('Source folder does not exists. Creating...');
    fs.mkdirSync(IMG_INPUT_FOLDER_PATH);
    logger?.log('Created folder ' + IMG_INPUT_FOLDER_PATH);
    logger?.warn(`Please copy your input files to ${IMG_INPUT_FOLDER_PATH}`);
    process.exit(1);
  } else {
    logger?.log('Input folder is at ' + IMG_INPUT_FOLDER_PATH);
  }

  if (!fs.existsSync(IMG_OUTPUT_FOLDER_PATH)) {
    logger?.log('Output folder does not exists. Creating...');
    fs.mkdirSync(IMG_OUTPUT_FOLDER_PATH);
    logger?.log('Created folder ' + IMG_OUTPUT_FOLDER_PATH);
  } else {
    logger?.log('Output folder is at ' + IMG_OUTPUT_FOLDER_PATH);
  }

  return { IMG_INPUT_FOLDER_PATH, IMG_OUTPUT_FOLDER_PATH };
};
