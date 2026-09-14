import React, { useCallback, useMemo, useState, } from 'react';
import * as Peer from '../../../core/model/Peer';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import { Button } from '@vkontakte/vkui';
import { Icon20CheckCircleOutline, Icon20CopyOutline, Icon24CheckCircleOff, Icon24CheckCircleOn, } from '@vkontakte/icons';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { PeerSubhead } from '../../ui/PeerSubhead/PeerSubhead';
import { classNames as cx } from '@vkontakte/vkjs';
import './PrivateMessageInviteModal.css';
import { AnimatedCounter } from '../../ui/AnimatedCounter/AnimatedCounter';
import { CopyText } from '../../ui/CopyText/CopyText';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MAX_INT_32 } from '../../../core/utils/misc';
import { getOwnerGroupId } from '../../../data/store/State';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { useApiFetchMany } from '../../hooks/useApiFetch';
export const PrivateMessageInviteModal = ({ peerIds, inviteLink, onClose, onComplete, }) => {
    const { lang, analyticsAppName } = useBrowserEnv();
    const apiFetchMany = useApiFetchMany();
    const [selectedPeers, setSelectedPeers] = useState(new Set());
    const peers = usePeers();
    const snackbar = useSnackbar();
    const owner = useOwner();
    const [isSending, setSending] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const peerList = useMemo(() => peerIds
        .map((peerId) => peers.get(peerId))
        .filter((peer) => peer !== undefined), [peerIds, peers]);
    const peersWithOpenPMCount = useMemo(() => peerList.filter((peer) => Peer.canSendPrivateMessage(peer)).length, [peerList]);
    const textKey = useMemo(() => {
        if (peersWithOpenPMCount === 0) {
            return 'me_private_msg_link_text_none';
        }
        if (peersWithOpenPMCount === peerList.length) {
            return 'me_private_msg_link_text_all';
        }
        return 'me_private_msg_link_text_some';
    }, [peersWithOpenPMCount, peerList.length]);
    /**
     * Находим следующий элемент(навигация вниз), который можно выбрать с клавиатуры
     * Нужен, чтобы пропускать пользователей, у которых закрыта личка
     */
    const getNextFocusable = () => {
        const index = peerIds.slice(focusedIndex + 1).findIndex((peerId) => {
            const peer = peers.get(peerId);
            if (!peer) {
                return false;
            }
            if (peer.kind !== 'User' && peer.kind !== 'Contact') {
                return false;
            }
            return Peer.canSendPrivateMessage(peer);
        });
        return index !== undefined ? index + focusedIndex + 1 : focusedIndex;
    };
    /**
     * Находим предыдущий элемент(навигация вверх), который можно выбрать с клавиатуры
     * Нужен, чтобы пропускать пользователей, у которых закрыта личка
     */
    const getPrevFocusable = () => {
        const arr = peerIds.slice().reverse();
        const index = arr
            .slice(peerIds.length - focusedIndex)
            .findIndex((peerId) => {
            const peer = peers.get(peerId);
            if (!peer) {
                return false;
            }
            if (peer.kind !== 'User' && peer.kind !== 'Contact') {
                return false;
            }
            return Peer.canSendPrivateMessage(peer);
        });
        return index !== undefined ? focusedIndex - index - 1 : focusedIndex;
    };
    /**
     * Обрабатываем навигацию с клавиатуры по списку
     */
    const keyDownHandler = (keyCombo, e) => {
        e.stopPropagation();
        switch (keyCombo) {
            case 'Space': {
                e.preventDefault();
                const peerId = peerIds[focusedIndex];
                if (peerId === undefined) {
                    return;
                }
                handleItemClick(peerId);
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                setFocusedIndex(getPrevFocusable());
                break;
            }
            case 'ArrowDown': {
                e.preventDefault();
                setFocusedIndex(getNextFocusable());
                break;
            }
            default:
                break;
        }
    };
    const handleItemClick = useCallback((peerId) => {
        const peer = peers.get(peerId);
        if (!peer) {
            return;
        }
        if (peer.kind !== 'User' && peer.kind !== 'Contact') {
            return;
        }
        if (!Peer.canSendPrivateMessage(peer)) {
            return;
        }
        if (selectedPeers.has(peerId)) {
            selectedPeers.delete(peerId);
        }
        else {
            selectedPeers.add(peerId);
        }
        setSelectedPeers(new Set([...selectedPeers]));
    }, [peers, selectedPeers]);
    const handleCopyDone = useCallback(() => {
        snackbar({
            message: lang.use('me_invite_link_copied'),
            before: (React.createElement(Icon20CheckCircleOutline, { fill: "var(--vkui--color_icon_accent)" })),
        });
    }, [snackbar, lang]);
    /**
     * Отправляем в личку пользователям сообщение с ссылкой на вход в чат
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSending(true);
        // Не можем тут использовать эффект UserHitSend, т.к. там нужна загруженная конва
        // А тут с большой вероятностью конвы может не быть
        try {
            const reqs = [...selectedPeers].map((peerId) => ({
                method: 'messages.send',
                params: {
                    peer_id: peerId,
                    message: inviteLink,
                    random_id: Math.floor(Math.random() * MAX_INT_32),
                    group_id: getOwnerGroupId(owner.id),
                    entrypoint: 'convo_invite',
                    from: analyticsAppName,
                },
            }));
            await apiFetchMany(reqs);
        }
        catch (e) {
            // do nothing
        }
        finally {
            setSending(false);
            onComplete();
        }
    }, [
        selectedPeers,
        apiFetchMany,
        inviteLink,
        owner.id,
        analyticsAppName,
        onComplete,
    ]);
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_private_msg_link_title'), withCustomLayout: true, buttons: [
            React.createElement(CopyText, { key: "copy", text: inviteLink, onCopyDone: handleCopyDone },
                React.createElement(Button, { mode: "secondary", before: React.createElement(Icon20CopyOutline, null) }, lang.use('me_private_msg_link_copy'))),
            React.createElement(Button, { key: "send", mode: "primary", disabled: selectedPeers.size === 0, onClick: handleSubmit, loading: isSending, after: selectedPeers.size ? (React.createElement(AnimatedCounter, { count: selectedPeers.size, className: "PrivateMessageInvite__counter" })) : null }, lang.use('me_private_msg_link_send')),
        ] },
        React.createElement("div", { className: "PrivateMessageInvite" },
            React.createElement("p", { className: "PrivateMessageInvite__text" }, lang.use(textKey, {
                num: peerIds.length,
                values: {
                    count: peerIds.length.toString(),
                },
            })),
            React.createElement("ul", { role: "listbox", tabIndex: 0, onKeyDown: onElementKeyDownFactory(keyDownHandler), className: "PrivateMessageInvite__list" }, [...peerList].map((peer, i) => (React.createElement(PeerItem, { key: peer.id, peer: peer, isSelected: selectedPeers.has(peer.id), isFocused: focusedIndex === i, onClick: handleItemClick })))))));
};
const PeerItem = ({ peer, isSelected, isFocused, onClick, }) => {
    const { lang } = useBrowserEnv();
    const canPrivateMessage = Peer.canSendPrivateMessage(peer);
    const handleClick = (e) => {
        e.preventDefault();
        onClick?.(peer.id);
    };
    return (React.createElement("li", { tabIndex: -1, role: "option", "aria-checked": isSelected, "aria-selected": isFocused, onClick: handleClick, className: cx('PrivateMessageInviteItem', {
            'PrivateMessageInviteItem--cantWrite': !canPrivateMessage,
        }) },
        React.createElement("label", { className: "PrivateMessageInviteItem__wrapper" },
            React.createElement("div", { className: "PrivateMessageInviteItem__before" },
                React.createElement(PeerAvatar, { size: 40, peer: peer })),
            React.createElement("div", { className: "PrivateMessageInviteItem__content" },
                React.createElement("div", { className: "PrivateMessageInviteItem__title" }, Peer.name(peer)),
                React.createElement("div", { className: "PrivateMessageInviteItem__subtitle" }, canPrivateMessage ? (React.createElement(PeerSubhead, { peer: peer, showScreenName: false })) : (lang.use('me_private_msg_link_closed', {
                    sex: peer.kind === 'User' ? peer.sex : 'unknown',
                })))),
            canPrivateMessage && (React.createElement("div", { className: "PrivateMessageInviteItem__after" }, isSelected ? (React.createElement(Icon24CheckCircleOn, { color: "var(--vkui--color_accent_blue)" })) : (React.createElement(Icon24CheckCircleOff, { color: "var(--vkui--color_icon_tertiary)" })))),
            React.createElement("input", { tabIndex: -1, type: "checkbox", checked: isSelected, onChange: handleClick, value: peer.id, className: "PrivateMessageInviteItem__control" }))));
};
//# sourceMappingURL=PrivateMessageInviteModal.js.map