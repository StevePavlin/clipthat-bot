import { log } from "./includes";
import { Scanner, Uploader } from "./classes";


log.info(`Starting up...`);

new Scanner().run();
new Uploader().listen();