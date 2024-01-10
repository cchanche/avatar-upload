import { ArgumentParser } from 'argparse';
import { Logger } from './logger';

export const argparse = (options?: { logger?: Logger }) => {
  const { logger } = options || {};

  const parser = new ArgumentParser({
    description: 'Populate all package env variables using nodejs',
  });

  type Args = {
    size: string;
  };

  const defaultArgs: Args = { size: '512' };

  parser.add_argument('-s', '--size', {
    help: "The image's dimension",
    default: defaultArgs.size,
  });

  const args: Args = Object.assign({}, parser.parse_args());

  let size: number | undefined = undefined;
  try {
    size = parseInt(args.size);
  } catch (err) {
    logger?.warn(`Could not parse the size from given string : "${size}"`);
    logger?.warn(`Using default size instead : "${defaultArgs.size}"`);
  }

  return { imageSize: size || 512 };
};
