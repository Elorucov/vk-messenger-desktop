import React, { useCallback, useId, useMemo, useState } from 'react';
import { useBrowserEnv, useConvo, usePeers, useViewer, } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { ConvoMessage } from '../../ui/ConvoMessage/ConvoMessage';
import { ConvoStack } from '../../ui/ConvoStack/ConvoStack';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { Button } from '@vkontakte/vkui';
import * as Peer from '../../../core/model/Peer';
import '../../ui/ModalMessage/ModalMessage.css';
import { MessageReactionAnimationProvider, } from '../../hooks/useMessageReactionAnimation';
import { getMediaAttachLinkPayload } from '../../ui/ConvoHistoryMessageBlock/ConvoHistoryMessageBlock';
import * as ThemeStyle from '../../../core/model/ThemeStyle';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import cx from 'classnames';
export const ModalMessage = ({ modalMessage, useModal = false, isCompact, onForeignMessageOpen, onForeignMessageClose, openClipCoOwnersModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, }) => {
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const { replace, navigate, screenRoute } = useRouter();
    const { message } = modalMessage;
    const errorMsg = message ? '' : lang.use('me_message_deleted');
    const handleScrollToMessage = ({ peerId, cmid, }) => {
        if (screenRoute.kind === 'ConvoRoute') {
            navigate({ ...screenRoute, peerId, cmid });
        }
    };
    const handleClose = useCallback(() => {
        replace({ kind: 'EmptyRuntimeRoute' });
    }, [replace]);
    let author, peer;
    if (message) {
        author = Peer.safeGet(peers, message.authorId);
        peer = Peer.safeGet(peers, message.peerId);
    }
    const [activeAnimations, setActiveAnimations] = useState([]);
    const activeAnimationsContextValue = useMemo(() => ({ activeAnimations, setActiveAnimations }), [activeAnimations]);
    const getMediaAttachLinkPayloadWrapper = useCallback((params) => message
        ? getMediaAttachLinkPayload(message.cmid, message.peerId, params)
        : undefined, [message]);
    return errorMsg ? (React.createElement(ErrorContainer, { useModal: useModal, onClose: handleClose, errorMsg: errorMsg })) : !message || !peer || !author ? null : (React.createElement(MessageReactionAnimationProvider, { value: activeAnimationsContextValue },
        React.createElement(Container, { useModal: useModal, onClose: handleClose, peerId: peer.id },
            React.createElement(ConvoStack, { peerId: author.id, isOut: message.isOut, isCentered: false, isOneToOneConvo: false, selected: [] },
                React.createElement(ConvoMessage, { peerId: peer.id, author: author, message: message, isUnread: false, unreadReactionId: undefined, isHead: true, isSelected: false, isCompact: isCompact, onScrollToMessage: handleScrollToMessage, onOpenMessageInModal: onForeignMessageOpen, onCloseMessageInModal: onForeignMessageClose, onKeyboardSend: () => { }, isInsideCasper: false, isUsedInModal: true, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, openClipCoOwnersModal: openClipCoOwnersModal, onOpenForwardedMessageInModal: onOpenForwardedMessageModal, onCloseForwardedMessageInModal: onCloseForwardedMessageModal })))));
};
const Container = ({ useModal, onClose, children, peerId, }) => {
    const { lang } = useBrowserEnv();
    const modalTitleId = useId();
    const { settings } = useViewer();
    const convo = useConvo(peerId);
    const { isThemed, themeAppearance, themeBackground } = useCurrentThemeStyle({
        forceThemeStyleId: convo?.styleId !== ThemeStyle.SYSTEM_STYLE_ID && settings.showThemeStyles
            ? convo?.styleId
            : undefined,
    });
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    if (!useModal) {
        return React.createElement(React.Fragment, null, children);
    }
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose, isBodyScrollDisabled: true, stickersPopupRootContainerId: "popup-sticker-modal-message-container" },
            React.createElement(ModalPanel, { className: "ModalMessage", ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: onClose, title: lang.use('me_pinned_message'), titleId: modalTitleId }),
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: cx('ModalMessage__themeWrapper', {
                            MEAppThemeStylesContrastEnable: isThemed,
                        }) },
                        themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
                        React.createElement("div", { className: "ModalMessage__body", role: "menu", style: themeAppearanceStyles }, children)))))));
};
const ErrorContainer = ({ errorMsg, useModal, onClose, }) => {
    const { lang } = useBrowserEnv();
    const content = React.createElement("div", { className: "ModalMessage__error" }, errorMsg);
    if (!useModal) {
        return content;
    }
    return (React.createElement(ModalDialog, { buttons: React.createElement(Button, { onClick: onClose }, lang.use('me_close')), title: lang.use('me_error_title'), closeLabel: lang.use('me_close'), content: content, onClose: onClose }));
};
//# sourceMappingURL=ModalMessage.js.map