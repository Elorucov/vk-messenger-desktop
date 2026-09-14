import * as Peer from '../../../core/model/Peer';
import React, { useRef } from 'react';
import { Provider } from '../../ui/Provider/Provider';
import { AvatarAreaSelectorModal, } from '../../ui/AvatarAreaSelectorModal/AvatarAreaSelectorModal';
import { ThemeProvider } from '../../ui/ThemeProvider/ThemeProvider';
export const ImageAreaSelectorApp = ({ env, store, ...rest }) => {
    const state = store.getState();
    const owner = Peer.safeGet(state.peers, state.ownerId);
    const $imagesLayoutEdgeSizes = useRef({
        width: 250,
        minHeight: 50,
        maxSingleHeight: 250,
        preferredRatio: 1,
    });
    return (React.createElement(Provider, { env: env, state: state, store: store, owner: owner, layoutMode: "two-column", imagesLayoutEdgeSizes: $imagesLayoutEdgeSizes.current },
        React.createElement(ThemeProvider, { theme: state.viewer.settings.theme, locale: env.lang.locale },
            React.createElement(AvatarAreaSelectorModal, { ...rest, contextClass: "MEConfig MEAppConfig vkui__portal-root" }))));
};
//# sourceMappingURL=ImageAreaSelectorApp.js.map