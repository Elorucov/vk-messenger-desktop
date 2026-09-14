import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { API as StickersAPI } from '@vkontakte-internal/sticker-picker';
import { useBrowserEnv, useDispatch, useOwner, useFeatureFlags, } from '../../hooks/misc';
import { IApi } from '../../../data/env/IApi';
import { StaticUpdatesManager, UpdatesSource, StickersQueueEventType, } from '@vkontakte-internal/api';
import { isDev } from '../../../core/utils/misc';
import * as Peer from '../../../core/model/Peer';
const StickersApiContext = React.createContext(null);
export const StickersApiProvider = ({ children, }) => {
    const { api } = useBrowserEnv();
    const dispatch = useDispatch();
    const owner = useOwner();
    const featureFlags = useFeatureFlags();
    const isPromotedStickersDisabled = !featureFlags.vas_promoted_stickers;
    const handelAPIRequest = useCallback((method, params = {}) => api
        .fetchForExternalLibs(method, params, {
        timeout: 30 * 1000,
        retries: 5,
    })
        .catch((error) => {
        if (error instanceof IApi.RequestError) {
            return Promise.reject(error.apiError);
        }
        if (error instanceof IApi.ExecuteErrors) {
            return Promise.reject({
                errors: error.list.map((err) => err.apiError),
            });
        }
        return Promise.reject(error);
    }), [api]);
    const stickersApi = useMemo(() => {
        return new StickersAPI({
            onAPIRequest: handelAPIRequest,
            userId: owner.id,
        });
    }, [handelAPIRequest, owner.id]);
    const saveStockItems = useCallback(async () => {
        const stockItems = await stickersApi.cache.getStockItems({ active: true });
        if (!stockItems) {
            return;
        }
        const stickers = stockItems.reduce((stickers, stockItem) => [
            ...stickers,
            ...(stockItem.product.stickers || []),
        ], []);
        dispatch({
            type: 'StickersCacheReceived',
            stickers,
        });
    }, [dispatch, stickersApi.cache]);
    useEffect(() => {
        saveStockItems();
        return stickersApi.cache.stickersAsync.subscribe(async (key) => {
            if (key === 'stockItems') {
                saveStockItems();
            }
        });
    }, [dispatch, saveStockItems, stickersApi.cache]);
    const reloadCache = useCallback(() => {
        stickersApi.cache.reload();
    }, [stickersApi]);
    useEffect(() => {
        /**
         * TODO: https://jira.mvk.com/browse/VAS-10290
         * подписка на изменения не будет работать локально, потому что
         * @vkontakte-internal/api не принимает кастомный прокси-метод для updates
         */
        if (!Peer.isUserPeerId(owner.id) || isPromotedStickersDisabled || isDev) {
            return;
        }
        const manager = StaticUpdatesManager.setup(stickersApi, {
            userId: owner.id,
        });
        manager.start(UpdatesSource.STICKERS);
        manager.queues[UpdatesSource.STICKERS].addEventListener(StickersQueueEventType.CACHE_UPDATE, reloadCache, undefined, 'reforged-cache-reload');
        return () => {
            manager.stop(UpdatesSource.STICKERS);
            manager.queues[UpdatesSource.STICKERS].removeEventListener(StickersQueueEventType.CACHE_UPDATE, reloadCache, 'reforged-cache-reload');
        };
    }, [owner.id, stickersApi, reloadCache, isPromotedStickersDisabled]);
    return (React.createElement(StickersApiContext.Provider, { value: stickersApi }, children));
};
export function useStickersApi() {
    const stickersConfig = useContext(StickersApiContext);
    if (!stickersConfig) {
        throw new Error('StickersApiProvider не добавлен в дерево Реакта!');
    }
    return stickersConfig;
}
//# sourceMappingURL=StickersApiContext.js.map