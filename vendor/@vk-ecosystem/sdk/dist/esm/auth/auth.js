import { Auth as Auth$1 } from '../lib/@vkid/sdk/dist-sdk/esm/auth/auth.js';
import { ConfigAuthMode, ConfigResponseMode } from '../lib/@vkid/sdk/dist-sdk/esm/core/config/types.js';
import { deleteUnnecessaryFields } from '../lib/@vkid/sdk/dist-sdk/esm/utils/fields.js';
import { makeInitStatsInfo } from './utils.js';

class Auth extends Auth$1 {
    login = (params)=>{
        Auth$1.__config = Auth.__config;
        const config = Auth.__config;
        const { mode } = config.get();
        if (mode === ConfigAuthMode.InNewTab) {
            config.set({
                responseMode: ConfigResponseMode.Callback
            });
        }
        // в vk.com много мест где в рамках одной страницы мы вызываем кучу разных action
        if (params?.redirectUrl) {
            config.set({
                redirectUrl: params?.redirectUrl
            });
        }
        const loginParams = deleteUnnecessaryFields([
            'entry',
            'redirectUrl'
        ], {
            ...params
        });
        return super.login({
            ...loginParams,
            is_redesigned: params?.isRedesigned,
            initial_stats_info: makeInitStatsInfo(params?.entry)
        });
    };
}

export { Auth };
