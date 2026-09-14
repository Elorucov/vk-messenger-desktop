import '../../ui/SpaceMembersPickerModal/SpaceMembersPickerModal.css';
import React, { useCallback, useMemo, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv, useInsertIntoCache, usePeers, useViewer, } from '../../hooks/misc';
import { PeersPicker } from '../../ui/PeersPicker/PeersPicker';
import { useSubModal } from '../../hooks/useModal';
import { ConfirmationModal } from '../../ui/ConfirmationModal/ConfirmationModal';
import { isDeepEqual } from '../../../core/utils/misc';
import { useApiFetch } from '../../hooks/useApiFetch';
const SPEAKERS_LIMIT = 30;
export const SpaceMembersPickerModal = ({ spaceId, initialPeerIds = [], title, onClose, onSubmit, modalGroupId, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const { id: viewerId } = useViewer();
    const peers = usePeers();
    const insertIntoCache = useInsertIntoCache();
    const exitConfirmationModal = useSubModal(modalGroupId);
    const [peerIds, setPeerIds] = useState(initialPeerIds);
    const peerIdsSet = useMemo(() => new Set(peerIds), [peerIds]);
    const handleSetPeerIds = useCallback((peerIds) => {
        // Это нужно сделать, так как PeersPicker может работать с контактами в том числе,
        // но в нашем случае могут быть только User
        const ids = peerIds.filter((id) => Peer.isUserPeerId(id));
        setPeerIds(ids);
    }, []);
    const fetchPeers = useCallback(async ({ query, offset }) => {
        const response = await (query
            ? apiFetch('spaces.searchMembers', {
                space_id: spaceId,
                extended: 1,
                q: query,
            }, { retries: 1 })
            : apiFetch('spaces.getMembers', {
                space_id: spaceId,
                extended: 1,
                offset,
            }));
        insertIntoCache({
            profiles: response?.profiles,
        });
        const peerIds = response?.items.reduce((peerIds, member) => {
            if (member.profile_id) {
                peerIds.push(Peer.resolveRealId('User', member.profile_id));
            }
            return peerIds;
        }, []);
        return {
            totalCount: 'count' in response ? response.count : response.total_count,
            peerIds: peerIds,
        };
    }, [apiFetch, spaceId, insertIntoCache]);
    const listFilter = useCallback((peerId) => peerId !== viewerId, [viewerId]);
    const checkDisabledItem = useCallback((peerId) => {
        // Невозможный сценарий, поддерживаем типы PeersPicker
        if (!Peer.isUserPeerId(peerId)) {
            return false;
        }
        // Выбранный элемент не может быть disabled
        if (peerIdsSet.has(peerId)) {
            return false;
        }
        // Не даем выбрать больше, чем допустимо
        if (peerIdsSet.size >= SPEAKERS_LIMIT) {
            return true;
        }
        const peer = peers.get(peerId);
        // Не можем выбрать спикером
        if (peer && !canSetPeerAsSpeaker(peer)) {
            return true;
        }
        return false;
    }, [peers, peerIdsSet]);
    const getItemDescription = useCallback((peerId) => {
        const peer = peers.get(peerId);
        if (peer && !canSetPeerAsSpeaker(peer)) {
            return lang.use('me_space_room_form_speaker_call_forbidden');
        }
        return undefined;
    }, [lang, peers]);
    const closeWithConfirm = useCallback(() => {
        const shouldShowConfirm = !isDeepEqual(peerIds, initialPeerIds);
        if (shouldShowConfirm) {
            return exitConfirmationModal.open();
        }
        onClose();
    }, [onClose, exitConfirmationModal, peerIds, initialPeerIds]);
    const handleSubmit = () => {
        onSubmit(peerIds);
    };
    if (exitConfirmationModal.isActive) {
        return (React.createElement(ConfirmationModal
        // SPC-TODO: еще нет текстов
        , { 
            // SPC-TODO: еще нет текстов
            title: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0432\u044B\u0445\u043E\u0434", text: 'Данные не сохранятся', confirmText: "\u0412\u044B\u0439\u0442\u0438", onConfirm: () => {
                exitConfirmationModal.close();
                onClose();
            }, onClose: exitConfirmationModal.close }));
    }
    return (React.createElement(ModalInterface, { title: title ?? lang.use('me_space_members_picker_modal_title_default'), onClose: closeWithConfirm, closeLabel: lang.use('me_close'), onBack: onClose, withCustomLayout: true, contextClass: "MEConfig", buttons: [
            React.createElement(Button, { size: "m", mode: "secondary", onClick: onClose }, lang.use('me_cancel')),
            React.createElement(Button, { size: "m", onClick: handleSubmit }, lang.use('me_complete')),
        ], footerHint: lang.use('me_space_room_form_speakers_limit', {
            values: {
                current: `${peerIds.length}`,
                max: `${SPEAKERS_LIMIT}`,
            },
        }) },
        React.createElement("div", { className: "SpaceMembersPickerModal__form" },
            React.createElement(PeersPicker, { className: "SpaceMembersPickerModal__picker", strategy: "multiple", selectedPeerIds: peerIds, controlSide: "right", onPeersSelectionChange: handleSetPeerIds, customFetchPeers: fetchPeers, customLangs: {
                    emptyResults: lang.use('me_picker_peer_list_empty'),
                }, limit: SPEAKERS_LIMIT, viewerAsFavorites: false, listFilter: listFilter, checkDisabledItem: checkDisabledItem, getItemDescription: getItemDescription, searchInputPlaceholder: lang.use('me_space_members_picker_input_placeholder') }))));
};
const canSetPeerAsSpeaker = (peer) => 'canCall' in peer && peer.canCall;
//# sourceMappingURL=SpaceMembersPickerModal.js.map