/* eslint-disable no-console */
export const logger = {
  info: (...args: unknown[]) => console.info('[INFO]', ...args as any),
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args as any),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args as any),
  debug: (...args: unknown[]) => console.debug('[DEBUG]', ...args as any),
};

export default logger;
