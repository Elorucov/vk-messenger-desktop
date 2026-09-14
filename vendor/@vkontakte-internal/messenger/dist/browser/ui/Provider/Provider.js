import React, { useCallback, useEffect, useMemo } from 'react';
import { BrowserEnvProvider, OwnerProvider, InsertIntoCacheProvider, StoreProvider, } from '../../hooks/misc';
import { ModalsProvider } from '../../ui/Modals/Modals';
import { RouterProvider } from '../../ui/Router/Router';
import { ImagesLayoutProvider } from '../../ui/ConvoHistory/ImagesLayoutContext';
import { Stack } from '../../../data/env/Modals';
import { LayoutDataProvider, } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { StickersApiProvider } from '../../ui/StickersApiContext/StickersApiContext';
import { StickerEmojiMenuProvider } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import { useStickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickersConfigProvider } from '../../hooks/useStickersConfig';
import { NowContextProvider } from '../../hooks/useNow';
import { StickersPopupAnimationContextProvider } from '../../hooks/useStickersPopupAnimation';
import { throttle } from '../../../core/utils/misc';
export const Provider = ({ children, env, store, state, owner, layoutMode, imagesLayoutEdgeSizes, }) => {
    const insertIntoCache = useCallback((values) => {
        store.dispatch({ type: 'CacheUpdateReceived', ...values });
    }, [store]);
    useEffect(() => {
        const throttled = throttle(function () {
            store.dispatch({
                type: 'ContainerSizeUpdate',
                width: document.body.clientWidth,
            });
        }, 200, true);
        throttled();
        window.addEventListener('resize', throttled);
        return () => {
            window.removeEventListener('resize', throttled);
        };
    }, [store]);
    const modalsStacks = useMemo(() => ({
        popup: env.modals.stack,
        rightPanel: new Stack(),
    }), [env.modals.stack]);
    const stickerEmojiMenu = useStickerEmojiMenuPopper();
    return (React.createElement(StoreProvider, { value: store },
        React.createElement(BrowserEnvProvider, { value: env },
            React.createElement(LayoutDataProvider, { mode: layoutMode },
                React.createElement(ImagesLayoutProvider, { value: imagesLayoutEdgeSizes },
                    React.createElement(RouterProvider, null,
                        React.createElement(ModalsProvider, { stacks: modalsStacks },
                            React.createElement(OwnerProvider, { value: owner },
                                React.createElement(StickersApiProvider, null,
                                    React.createElement(StickersConfigProvider, { forceStickersReload: state.forceStickersReload },
                                        React.createElement(StickerEmojiMenuProvider, { value: stickerEmojiMenu },
                                            React.createElement(StickersPopupAnimationContextProvider, null,
                                                React.createElement(InsertIntoCacheProvider, { value: insertIntoCache },
                                                    React.createElement(NowContextProvider, null, children))))))))))))));
};
//# sourceMappingURL=Provider.js.map