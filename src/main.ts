import { create } from './main-create';
import { test } from './main-test';
import { Logger, argparse } from './utils';

export const handler = (async () => {
  const logger = new Logger('avatar');

  const { imageSize, program } = argparse({
    logger,
  });

  switch (program) {
    case 'create':
      await create({ imageSize, program }, { logger });
      break;
    case 'test':
      await test({ imageSize, program }, { logger });
      break;

    default:
      break;
  }
})();
