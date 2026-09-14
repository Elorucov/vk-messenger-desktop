import { Auth as Auth$1 } from './auth/auth.js';
import { Config } from './core/config/config.js';
import { Widget } from './core/widget/widget.js';

const globalConfig = new Config();
/** Export Auth */ Auth$1.__config = globalConfig;
const globalAuth = new Auth$1();
/** Export Core Widget */ Widget.__config = globalConfig;
Widget.__auth = globalAuth;

export { globalAuth as Auth, globalConfig as Config };
