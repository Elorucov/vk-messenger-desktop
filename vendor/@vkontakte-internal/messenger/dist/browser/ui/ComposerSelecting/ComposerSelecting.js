import '../../ui/ComposerSelecting/ComposerSelecting.css';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, useImperativeHandle, } from 'react';
import cx from 'classnames';
import { useFocusState } from 'react-focus-lock';
import { Icon24Cancel, Icon20DeleteOutline, Icon20FavoriteOutline, Icon20ReportOutline, Icon20UnfavoriteOutline, Icon24MoreHorizontal, Icon24ReplyOutline, Icon24ShareOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useCombinedRefs, useDispatch, useOwner, } from '../../hooks/misc';
import { Button } from '@vkontakte/vkui';
import * as Convo from '../../../core/model/Convo';
import { useModal } from '../../hooks/useModal';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { DeleteMessageModal } from '../../ui/DeleteMessageModal/DeleteMessageModal';
import { useResizeObserver, } from '../../hooks/useResizeObserver';
import { onElementKeyDownFactory } from '../../utils/elementKeyDown';
export const FORWARDED_COUNT_LIMIT = 100;
const WIDE_WIDTH = 450;
const ComposerSelectingBase = ({ controlHandleRef, isNavigating, selected, handleCancelSelecting, onNavigationStart, renderControls, }) => {
    const { lang } = useBrowserEnv();
    const composerContainerRef = useRef(null);
    const [isWide, setIsWide] = useState(false);
    const { observe } = useResizeObserver();
    useLayoutEffect(() => {
        const el = composerContainerRef.current;
        if (el === null) {
            return;
        }
        const onResize = (entry) => {
            const width = entry.contentBoxSize[0]?.inlineSize ?? 0;
            setIsWide(width >= WIDE_WIDTH);
        };
        return observe(el, onResize);
    }, [observe]);
    useImperativeHandle(controlHandleRef, () => ({
        focus: () => composerContainerRef.current?.focus({ preventScroll: true }),
    }), [composerContainerRef]);
    const { active: isFocused, ref: composerContainerFocusRef, onFocus, } = useFocusState();
    const ref = useCombinedRefs(composerContainerRef, composerContainerFocusRef);
    const onKeyDown = onElementKeyDownFactory((keyCombo, event) => {
        if (!onNavigationStart || keyCombo !== 'ArrowUp')
            return;
        event.preventDefault();
        onNavigationStart();
    });
    return (React.createElement("div", { ref: ref, role: "complementary", "aria-label": lang.use('me_aria_composer_selecting_label'), tabIndex: isFocused ? 0 : -1, className: cx('ComposerSelecting', {
            'ComposerSelecting--navigating': isNavigating,
        }), onFocus: onFocus, onKeyDown: onKeyDown },
        React.createElement("div", { className: "ComposerSelecting__selectedCount" },
            React.createElement("button", { type: "button", "aria-label": lang.use('me_messages_selection_cancel'), className: "ComposerSelecting__action", onClick: handleCancelSelecting },
                React.createElement(Icon24Cancel, null)),
            React.createElement("span", { className: "ComposerSelecting__buttonText" },
                selected.length,
                lang.use('me_chat_selected_messages_count', {
                    num: selected.length,
                }))),
        React.createElement("div", { className: "ComposerSelecting__controls" }, renderControls(isWide))));
};
export const ComposerSelectingNormal = ({ controlHandleRef, convo, isNavigating, selected, handleCancelSelecting, onForward, onForwardHere, onOpenReport, setKeyboardOpened, onNavigationStart, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const deleteMessageModal = useModal();
    const { id: ownerId, kind: ownerKind } = useOwner();
    const canForwardFrom = Convo.canForwardFrom(convo);
    const isForwardDisabled = selected.length > FORWARDED_COUNT_LIMIT ||
        selected.some((message) => message.expireTTL !== undefined) ||
        selected.some((message) => !!message.attaches.widget);
    const isReplyDisabled = selected.some((message) => !!message.attaches.widget);
    const isAllImportant = selected.every((msg) => msg.isImportant);
    const isMarkImportantButtonShowing = selected.every((msg) => !msg.expireTTL && !msg.attaches.widget) &&
        !Convo.isCasper(convo) &&
        ownerKind !== 'Group';
    const handleModalClose = useCallback((event) => {
        event?.stopPropagation();
        if (deleteMessageModal.isActive) {
            deleteMessageModal.close();
        }
    }, [deleteMessageModal]);
    const handleAction = useCallback((userAction) => {
        switch (userAction) {
            case 'spam': {
                onOpenReport();
                break;
            }
            case 'mark_important':
            case 'unmark_important': {
                dispatch({
                    type: 'UserChangedMessage',
                    cmids: selected.map((msg) => msg.cmid),
                    peerId: convo.peerId,
                    userAction,
                });
                handleCancelSelecting();
                break;
            }
            case 'delete': {
                // Если можем удалить все сообщения для всех, откроем модалку с выбором
                if (selected.every((msg) => Convo.canDeleteMessageForAll(convo, msg, ownerId))) {
                    deleteMessageModal.open();
                    break;
                }
                dispatch({
                    type: 'UserDeleteMessage',
                    userAction: 'delete',
                    messages: selected,
                    peerId: convo.peerId,
                    deleteType: 'local',
                });
                handleModalClose();
                break;
            }
            case 'reply': {
                if (selected.length === 1 && selected[0]) {
                    handleCancelSelecting();
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'reply',
                        reply: selected[0],
                        peerId: convo.peerId,
                        isPostponed: false,
                    });
                    setKeyboardOpened(false);
                }
                break;
            }
            case 'forward': {
                if (selected.length > 0) {
                    onForward();
                }
                break;
            }
            case 'forward_here':
                if (selected.length > 0) {
                    onForwardHere();
                }
                break;
            default:
                exhaustivenessCheck(userAction);
        }
    }, [
        onForwardHere,
        handleCancelSelecting,
        dispatch,
        convo,
        handleModalClose,
        onForward,
        ownerId,
        selected,
        deleteMessageModal,
        setKeyboardOpened,
        onOpenReport,
    ]);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ReportOutline, null), title: lang.use('me_message_action_spam'), onClick: () => handleAction('spam'), type: "danger" }),
        React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_fc_delete_message_button'), onClick: () => handleAction('delete'), type: "danger" }),
        isMarkImportantButtonShowing && (React.createElement(React.Fragment, null,
            React.createElement(ActionsMenuSeparator, null),
            isAllImportant ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20UnfavoriteOutline, null), title: lang.use('me_message_action_mark_unimportant'), onClick: () => handleAction('unmark_important'), type: "secondary" })) : (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20FavoriteOutline, null), title: lang.use('me_message_action_mark_important'), onClick: () => handleAction('mark_important'), type: "secondary" })))))), [lang, handleAction, isAllImportant, isMarkImportantButtonShowing]);
    return (React.createElement(React.Fragment, null,
        deleteMessageModal.isActive && (React.createElement(DeleteMessageModal, { peerId: convo.peerId, messages: selected, handleModalClose: handleModalClose, isPostponed: false })),
        React.createElement(ComposerSelectingBase, { selected: selected, handleCancelSelecting: handleCancelSelecting, controlHandleRef: controlHandleRef, isNavigating: isNavigating, onNavigationStart: onNavigationStart, renderControls: (isWide) => (React.createElement(React.Fragment, null,
                convo.canWrite.allowed &&
                    (selected.length === 1 ? (React.createElement(Button, { type: "button", "aria-label": lang.use('me_message_action_reply'), appearance: "neutral", mode: "tertiary", before: React.createElement(Icon24ReplyOutline, null), disabled: isReplyDisabled, onClick: () => handleAction('reply'), className: "ComposerSelecting__button" }, isWide && (React.createElement("span", { className: "ComposerSelecting__buttonText" }, lang.use('me_message_action_reply'))))) : (canForwardFrom && (React.createElement(Button, { type: "button", "aria-label": lang.use('me_message_action_forward_here'), appearance: "neutral", mode: "tertiary", before: React.createElement(Icon24ReplyOutline, null), disabled: isForwardDisabled, onClick: () => handleAction('forward_here'), className: "ComposerSelecting__button" }, isWide && (React.createElement("span", { className: "ComposerSelecting__buttonText" }, lang.use('me_message_action_forward_here'))))))),
                canForwardFrom && (React.createElement(Button, { type: "button", "aria-label": lang.use('me_message_action_forward'), appearance: "neutral", mode: "tertiary", before: React.createElement(Icon24ShareOutline, null), disabled: isForwardDisabled, onClick: () => handleAction('forward'), className: "ComposerSelecting__button" }, isWide && (React.createElement("span", { className: "ComposerSelecting__buttonText" }, lang.use('me_message_action_forward'))))),
                React.createElement(Dropdown, { content: React.createElement(ActionsMenu, null, actionsList), align: "right", hideOnClick: true },
                    React.createElement("button", { type: "button", "aria-label": lang.use('me_messages_selection_other_actions'), className: "ComposerSelecting__action" },
                        React.createElement(Icon24MoreHorizontal, null))))) })));
};
export const ComposerSelectingPostponed = ({ controlHandleRef, convo, isNavigating, selected, handleCancelSelecting, onNavigationStart, }) => {
    const { lang } = useBrowserEnv();
    const deleteMessageModal = useModal();
    const handleModalClose = useCallback((event) => {
        event?.stopPropagation();
        if (deleteMessageModal.isActive) {
            deleteMessageModal.close();
        }
    }, [deleteMessageModal]);
    return (React.createElement(React.Fragment, null,
        deleteMessageModal.isActive && (React.createElement(DeleteMessageModal, { peerId: convo.peerId, messages: selected, handleModalClose: handleModalClose, isPostponed: true })),
        React.createElement(ComposerSelectingBase, { selected: selected, handleCancelSelecting: handleCancelSelecting, controlHandleRef: controlHandleRef, isNavigating: isNavigating, onNavigationStart: onNavigationStart, renderControls: (isWide) => (React.createElement(Button, { type: "button", "aria-label": lang.use('me_fc_delete_message_button'), appearance: "negative", mode: "tertiary", before: React.createElement(Icon20DeleteOutline, { fill: "var(--vkui--color_text_negative)" }), onClick: deleteMessageModal.open, className: "ComposerSelecting__button" }, isWide && (React.createElement("span", { className: "ComposerSelecting__buttonText" }, lang.use('me_fc_delete_message_button'))))) })));
};
//# sourceMappingURL=ComposerSelecting.js.map