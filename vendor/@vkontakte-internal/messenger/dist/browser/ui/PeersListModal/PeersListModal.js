import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/PeersListModal/PeersListModal.css';
import React from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { PeersList } from '../../ui/PeersList/PeersList';
export const PeersListModal = ({ title, onClose, ...listProps }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { onClose: onClose, contextClass: "MEConfig", closeLabel: lang.use('me_close'), title: title, panelClass: "PeersListModal", withCustomLayout: true },
        React.createElement(PeersList, { ...listProps })));
};
//# sourceMappingURL=PeersListModal.js.map