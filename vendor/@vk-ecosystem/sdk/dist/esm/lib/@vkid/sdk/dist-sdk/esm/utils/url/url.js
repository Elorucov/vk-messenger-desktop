import { querystring } from '../../lib/@vkontakte/vkjs/lib/es6/querystring.js';
import { VERSION } from '../../constants.js';
import { uuid } from '../uuid.js';

const getVKIDUrl = (module, params, config)=>{
    const queryParams = {
        ...params,
        uuid: params.uuid || uuid(),
        v: VERSION,
        sdk_type: 'vkid',
        app_id: config.app,
        redirect_uri: config.redirectUrl,
        redirect_state: config.state,
        debug: config.__debug ? 1 : null,
        localhost: config.__localhost ? 1 : null
    };
    const queryParamsString = querystring.stringify(queryParams, {
        skipNull: true
    });
    return `https://${config.__vkidDomain}/${module}?${queryParamsString}`;
};
const getRedirectWithPayloadUrl = (payload, config)=>{
    const redirectUrlFromConfig = config.get().redirectUrl;
    const containsQuery = redirectUrlFromConfig.includes('?');
    let params = `payload=${encodeURIComponent(JSON.stringify(payload))}`;
    if (config.get().state) {
        params += `&state=${config.get().state}`;
    }
    return `${redirectUrlFromConfig}${containsQuery ? '&' : '?'}${params}`;
};

export { getRedirectWithPayloadUrl, getVKIDUrl };
