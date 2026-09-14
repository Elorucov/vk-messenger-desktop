import React, { useState, useMemo, useCallback } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { ConvoPicker, getItemId, } from '../../ui/ConvoPicker/ConvoPicker';
import { PeerChipsSearchInput } from '../../ui/PeerChipsSearchInput/PeerChipsSearchInput';
import { PickerSearchInput } from '../../ui/PickerSearchInput/PickerSearchInput';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Button } from '@vkontakte/vkui';
import './ConvoPickerModal.css';
export const ConvoPickerModal = ({ initialPeerIds, withChips = false, sublistsPeerIds, onClose, onBack, onSubmit, }) => {
    const [peerIds, setPeerIds] = useState(initialPeerIds);
    const { lang } = useBrowserEnv();
    const preparedPeerIds = useMemo(() => {
        return Array.from(new Set(peerIds.concat(sublistsPeerIds)));
    }, [peerIds, sublistsPeerIds]);
    const checkDisabledItem = useCallback((item) => {
        if (sublistsPeerIds.length === 0) {
            return false;
        }
        const id = getItemId(item);
        const resolvedPeerId = Peer.resolveId(Number(id));
        if (sublistsPeerIds.includes(resolvedPeerId)) {
            return true;
        }
        return false;
    }, [sublistsPeerIds]);
    const handleSubmit = (peerIds, sublistsPeerIds) => {
        onSubmit(peerIds.filter((peerId) => !sublistsPeerIds.includes(peerId)));
    };
    return (React.createElement(ModalInterface, { title: lang.use('me_folder_convo_select_title'), onClose: onClose, closeLabel: lang.use('me_close'), onBack: onBack, backLabel: lang.use('me_back'), withCustomLayout: true, contextClass: "MEConfig", buttons: [
            React.createElement(Button, { key: "confirm", onClick: () => handleSubmit(peerIds, sublistsPeerIds), disabled: peerIds.length === 0 }, lang.use('me_folder_convo_select_confirm')),
        ] },
        React.createElement("div", { className: "ConvoPickerModal__convoPicker" },
            React.createElement(ConvoPicker, { searchRenderer: withChips ? PeerChipsSearchInput : PickerSearchInput, selectedPeerIds: preparedPeerIds, onSelectionChange: (ids) => setPeerIds(ids), sublistsPeerIds: sublistsPeerIds, strategy: "multiple", checkDisabledItem: checkDisabledItem, listFilter: Convo.canAddToFolder }))));
};
//# sourceMappingURL=ConvoPickerModal.js.map