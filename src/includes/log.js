import Winston from 'winston';

const logger = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)({
      colorize: true
    })
  ]
});

export const log = logger;