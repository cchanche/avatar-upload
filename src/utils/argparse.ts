import { ArgumentParser } from 'argparse';
import { Logger } from './logger';

export const argparse = (options?: { logger?: Logger }) => {
  const { logger } = options || {};

  const mainParser = new ArgumentParser();

  type MainArgs = {
    subparser_name: 'create' | 'test';
  };
  type CreateArgs = {
    size: string;
  };
  type TestArgs = {
    size: string;
  };

  const defaultCreateArgs: CreateArgs = { size: '512' };
  const defaultTestArgs: TestArgs = { size: '512' };

  const subparsers = mainParser.add_subparsers({
    help: 'this is helpful',
    dest: 'subparser_name',
    required: true,
  });

  const createParser = subparsers.add_parser('create', {
    help: 'Create badges from input folder',
  });
  const testParser = subparsers.add_parser('test', {
    help: 'Test images from the given folder are badges',
  });

  createParser.add_argument('-s', '--size', {
    help: "The image's dimension",
    default: defaultCreateArgs.size,
  });

  testParser.add_argument('-s', '--size', {
    help: "The image's dimension",
    default: defaultTestArgs.size,
  });

  const mainArgs: MainArgs & CreateArgs & TestArgs = Object.assign(
    {},
    mainParser.parse_args(),
  );

  // Parse image-size
  let size: number | undefined = undefined;
  const defaultArgs =
    mainArgs.subparser_name === 'create' ? defaultCreateArgs : defaultTestArgs;
  try {
    size = parseInt(mainArgs.size);
  } catch (err) {
    logger?.warn(`Could not parse the size from given string : "${size}"`);
    logger?.warn(`Using default size instead : "${defaultArgs.size}"`);
  }

  return { imageSize: size || 512, program: mainArgs.subparser_name };
};
