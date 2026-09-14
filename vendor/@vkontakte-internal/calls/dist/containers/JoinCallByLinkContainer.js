import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { CallStatSource, EMPTY_USER_ID, useCallsBridge } from '@vkontakte-internal/calls-core';
import { ModalJoinCallByLink } from '../components/ModalJoinCallByLink/ModalJoinCallByLink';
import { useConfig } from '../services/config';
import { getLSSkipJoinCallPrompt as getLSJoinInBrowser } from '../hooks/useSkipJoinCallPrompt';
export const JoinCallByLinkContainer = ({ initialJoinLink = '', onJoin: onJoinFromProps, onClose, }) => {
    const [joinLink, setJoinLink] = useState(initialJoinLink);
    const [password, setPassword] = useState('');
    const { sferum } = useConfig();
    // TODO: убрать использования истории
    const bridge = useCallsBridge();
    // для всех точек входа на экране/модалке истории: p2p, активные, запланированные, история
    const onJoinFromBridge = useCallback((joinLink, vkId = EMPTY_USER_ID, source, forceBrowserJoin = false) => {
        if (joinLink) {
            bridge.showJoinPopup(joinLink, source);
            return;
        }
        const shouldJoinInBrowser = forceBrowserJoin || getLSJoinInBrowser() || sferum;
        if (!shouldJoinInBrowser) {
            bridge.showStartCallModal({ vkId, joinLink, entryPoint: source });
            return;
        }
        if (!vkId) {
            return;
        }
        const isGroupCall = vkId > 2e9;
        if (isGroupCall) {
            bridge.startGroupCall(vkId, undefined, null, false, source);
            return;
        }
        bridge.call({ vkId, entryPoint: source });
    }, [bridge, sferum]);
    const isPasswordInputActive = Boolean(initialJoinLink);
    const [isLoading, setIsLoading] = useState(false);
    const onJoin = (joinLinkWithPassword) => {
        setIsLoading(true);
        if (onJoinFromProps) {
            onJoinFromProps(joinLinkWithPassword);
        }
        else {
            onJoinFromBridge(joinLinkWithPassword, 0, CallStatSource.JOIN_BY_LINK_POPUP);
        }
        onClose();
    };
    const handleContinue = () => {
        const isLink = joinLink.includes('call');
        let joinLinkWithPassword;
        if (isLink) {
            joinLinkWithPassword = joinLink;
        }
        else {
            joinLinkWithPassword = sferum
                ? `https://sferum.ru/?call=${joinLink}`
                : `${window.location.origin}/call/${joinLink}`;
        }
        if (password) {
            joinLinkWithPassword += sferum ? `&p=${password}` : `?p=${password}`;
        }
        onJoin(joinLinkWithPassword);
    };
    const handleInputJoinLink = (e) => {
        setJoinLink(e.target.value);
    };
    const handleInputPassword = (e) => {
        setPassword(e.target.value);
    };
    return (_jsx(ModalJoinCallByLink, { handleClose: () => onClose(true), handleContinue: handleContinue, handleInputJoinLink: handleInputJoinLink, handleInputPassword: handleInputPassword, joinLink: joinLink, password: password, isPasswordInputActive: isPasswordInputActive, isLoading: isLoading }));
};
//# sourceMappingURL=JoinCallByLinkContainer.js.map