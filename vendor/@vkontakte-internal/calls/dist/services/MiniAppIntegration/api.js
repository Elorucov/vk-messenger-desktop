import { createApi } from '../../helpers/apiGetter';
export const getApp = async (appId, url) => await createApi('apps.get')({
    app_id: appId,
    platform: 'web',
    url,
});
//# sourceMappingURL=api.js.map