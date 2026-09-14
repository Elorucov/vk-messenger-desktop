import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useReducer } from 'react';
import { APIGate } from '../../model/api';
import { API } from '../../utils/api';
import { isStaticUpdatesManagerEnabled } from '../../utils/userEnv';
import { StaticUpdatesManager, UpdatesSource, StickersQueueEventType } from '@vkontakte-internal/api';
import { stickersUGCOwnerUpdateHandler } from '../../utils/api/updates/stickers/ugcOwnerUpdate';
import { stickersUGCStickerUpdateHandler } from '../../utils/api/updates/stickers/ugcStickerUpdate';
export function APIProvider({ userId, peerId, onAPIRequest, language, children, context, logError, }) {
    const [api, setAPI] = useReducer((state, update) => {
        state.cache.destroy();
        return update;
    }, new API({
        userId,
        peerId,
        onAPIRequest,
        language,
        context,
        logError,
    }));
    useEffect(() => {
        const api = new API({
            userId,
            peerId,
            onAPIRequest,
            language,
            context,
            logError,
        });
        setAPI(api);
        api.cache.reload();
        if (!isStaticUpdatesManagerEnabled()) {
            return;
        }
        const manager = StaticUpdatesManager.setup(api, {
            userId,
        });
        manager.start(UpdatesSource.STICKERS);
        const ugcOwnerUpdateHandlerWithBindedApi = stickersUGCOwnerUpdateHandler.bind(api);
        const ugcStickerUpdateHandlerWithBindedApi = stickersUGCStickerUpdateHandler.bind(api);
        const stickersQueue = manager.queues[UpdatesSource.STICKERS];
        stickersQueue.addEventListener(StickersQueueEventType.UGC_OWNER_UPDATE, ugcOwnerUpdateHandlerWithBindedApi);
        stickersQueue.addEventListener(StickersQueueEventType.UGC_STICKER_UPDATE, ugcStickerUpdateHandlerWithBindedApi);
        return () => {
            manager.stop(UpdatesSource.STICKERS);
            stickersQueue.removeEventListener(StickersQueueEventType.UGC_OWNER_UPDATE, ugcOwnerUpdateHandlerWithBindedApi);
            stickersQueue.removeEventListener(StickersQueueEventType.UGC_STICKER_UPDATE, ugcStickerUpdateHandlerWithBindedApi);
        };
    }, [userId, peerId, language, onAPIRequest, context, logError]);
    useEffect(() => {
        if (isStaticUpdatesManagerEnabled()) {
            return;
        }
        api.updates.start();
        return () => {
            api.updates.stop();
        };
    }, [api]);
    return (_jsxs(_Fragment, { children: [_jsx(APIGate, { api: api }), children] }));
}
//# sourceMappingURL=APIProvider.js.map