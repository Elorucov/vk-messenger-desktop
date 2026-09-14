import { LOGIN_DOMAIN, OAUTH_DOMAIN, VKID_DOMAIN } from '../../constants.js';
import { ConfigAuthMode, ConfigResponseMode } from './types.js';

class Config {
    store = {
        app: 0,
        redirectUrl: '',
        mode: ConfigAuthMode.Redirect,
        responseMode: ConfigResponseMode.Redirect,
        __loginDomain: LOGIN_DOMAIN,
        __oauthDomain: OAUTH_DOMAIN,
        __vkidDomain: VKID_DOMAIN
    };
    set(config) {
        this.store = {
            ...this.store,
            ...config
        };
        return this;
    }
    get() {
        return this.store;
    }
}

export { Config };
