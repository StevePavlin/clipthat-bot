import snoowrap from "snoowrap";
import pkg from '../../package.json';
import { config } from "./config";

export const reddit = new snoowrap(Object.assign({
  userAgent: `ClipThatBot/${pkg.version}`
}, config.reddit));