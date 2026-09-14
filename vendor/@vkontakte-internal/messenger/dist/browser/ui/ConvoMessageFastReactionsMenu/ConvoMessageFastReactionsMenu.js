import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon20SmileAddOutline } from '@vkontakte/icons';
import cx from 'classnames';
import { MessageReactionPickerExpandableContainer } from '../../ui/MessageReactionPickerExpandableContainer/MessageReactionPickerExpandableContainer';
import { MessageReactionPickerExtended } from '../../ui/MessageReactionPickerExtended/MessageReactionPickerExtended';
import { Portal } from '../../ui/Portal/Portal';
import { useLayer } from '../../ui/Layer/Layer';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import './ConvoMessageFastReactionsMenu.css';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
export const ConvoMessageFastReactionsMenu = ({ className, triggerClassName, isDisabled, isCompact, isPreopened, reactions, activeReactionId, cmid, peerId, offsetLeft, offsetTop, onReactionClick, onClose, }) => {
    const { lang, stats } = useBrowserEnv();
    const { settings } = useViewer();
    const layer = useLayer();
    const $trigger = useRef(null);
    const $reactions = useRef(null);
    const [domRect, setDomRect] = useState(undefined);
    const [isPickerOpened, setIsPickerOpened] = useState(isPreopened);
    const [isPickerExtended, setIsPickerExtended] = useState(settings.autoExtendReactionPicker);
    const hidingTimeout = useRef(null);
    const declineExtendTimeout = useRef(null);
    const offsetLeftComputed = domRect
        ? `${domRect.x + domRect.width + (offsetLeft || 0)}px`
        : '0';
    const offsetTopComputed = domRect
        ? `${domRect.y - domRect.height + (offsetTop || 0)}px`
        : '0';
    const undoHiding = () => {
        if (hidingTimeout.current !== null) {
            clearTimeout(hidingTimeout.current);
        }
    };
    const open = () => {
        undoHiding();
        setIsPickerOpened(true);
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'attempt_to_react',
                    peer_id: peerId,
                    conversation_message_id: cmid,
                    label: getLogEventLabel(),
                },
            },
        });
    };
    const hideAfterDelay = () => {
        undoHiding();
        hidingTimeout.current = setTimeout(() => {
            onClose?.();
            setIsPickerOpened(false);
            declineExtendTimeout.current = setTimeout(() => {
                setIsPickerExtended(settings.autoExtendReactionPicker || false);
            }, 500);
        }, 1000);
    };
    const hideImmediately = useCallback(() => {
        undoHiding();
        if (declineExtendTimeout.current) {
            clearTimeout(declineExtendTimeout.current);
        }
        onClose?.();
        setIsPickerOpened(false);
    }, [onClose]);
    useEffect(() => {
        if (!isPickerOpened) {
            return;
        }
        const hideOnWheel = ({ target }) => {
            if (target instanceof Node && $reactions.current?.contains(target)) {
                return;
            }
            hideImmediately();
        };
        window.addEventListener('wheel', hideOnWheel, true);
        return () => {
            window.removeEventListener('wheel', hideOnWheel, true);
        };
    }, [$reactions, isPickerOpened, hideImmediately]);
    useEffect(() => {
        return () => {
            if (hidingTimeout.current !== null) {
                clearTimeout(hidingTimeout.current);
            }
            if (declineExtendTimeout.current !== null) {
                clearTimeout(declineExtendTimeout.current);
            }
        };
    }, []);
    useEffect(() => {
        if (!isPickerOpened) {
            return;
        }
        const timeout = setTimeout(() => {
            setDomRect($trigger.current?.getBoundingClientRect());
        }, 0);
        return () => {
            clearTimeout(timeout);
        };
    }, [isPickerOpened]);
    return (React.createElement("div", { className: className, onClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
        } },
        React.createElement("button", { ref: $trigger, "aria-label": lang.use('me_aria_convo_clip_reactions_menu_trigger'), className: cx('ConvoMessageFastReactionsMenu__trigger', {
                'ConvoMessageFastReactionsMenu__trigger--disabled': isDisabled,
            }, triggerClassName), onClick: (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isDisabled) {
                    return;
                }
                if (isPickerOpened) {
                    hideImmediately();
                }
                else {
                    open();
                }
            }, onMouseOver: undoHiding, onMouseLeave: hideAfterDelay },
            React.createElement(Icon20SmileAddOutline, null)),
        domRect && (React.createElement(Portal, { portalTarget: layer },
            React.createElement("div", { ref: $reactions, className: "ConvoMessageFastReactionsMenu__reactions", onMouseLeave: hideAfterDelay, onMouseOver: undoHiding },
                React.createElement(MessageReactionPickerExpandableContainer, { isVisible: isPickerOpened, offsetLeft: offsetLeftComputed, offsetTop: offsetTopComputed, content: ({ width, onHeightChange }) => (React.createElement(MessageReactionPickerExtended, { isExtended: isPickerExtended, isVisible: isPickerOpened, reactions: reactions, onClick: (reactionId) => onReactionClick?.(reactionId, isPreopened ? 'suggest' : 'floating_button'), active: activeReactionId, withDecorativeBubbles: true, withShadow: true, width: isCompact ? 250 : width, onHeightChange: onHeightChange, onExtendClick: () => setIsPickerExtended(true) })) }))))));
};
//# sourceMappingURL=ConvoMessageFastReactionsMenu.js.map