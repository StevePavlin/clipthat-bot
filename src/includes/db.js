import pgpromise from 'pg-promise';
import { log } from "./index";
import { config } from "./config";


export const pgp = pgpromise({


  error: (err, e) => {
    log.error('SQL Error', err, e.query, e.params);
  }

});

export const db = pgp(config.postgres +
  (config.env !== 'development' ? '?ssl=true&poolSize=5' : ''));