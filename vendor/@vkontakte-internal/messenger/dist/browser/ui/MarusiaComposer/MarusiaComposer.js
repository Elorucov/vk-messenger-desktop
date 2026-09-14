import '../../ui/MarusiaComposer/MarusiaComposer.css';
import React, { useCallback, useEffect, useRef, useState, } from 'react';
import { useBrowserEnv, useDispatch, useViewer } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { MarusiaButton } from '../../ui/MarusiaButton/MarusiaButton';
import { Editor, sanitizeText } from '../../ui/ComposerInput/ComposerEditor';
import { Icon24HelpOutline } from '@vkontakte/icons';
import { MarusiaSuggests } from '../../ui/MarusiaSuggests/MarusiaSuggests';
import cx from 'classnames';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const MarusiaComposer = ({ isNewConvo, instanceId, entrypoint, isCompactView, }) => {
    const { lang, marusia, analyticsAppName } = useBrowserEnv();
    const dispatch = useDispatch();
    const viewer = useViewer();
    const { isMobileLayout } = useLayoutData();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewer, isMobileLayout);
    const [inputText, setInputText] = useState('');
    const [actionsDisabled, setActionsDisabled] = useState(false);
    const [isEmpty, setEmpty] = useState(true);
    const typing = !!inputText.trim();
    const $editor = useRef(null);
    const createEditor = useCallback((node) => {
        if (!node) {
            return;
        }
        $editor.current = new Editor(node);
        $editor.current?.setDisabled(true);
        const checkIsEmpty = (text) => {
            setEmpty(text.length === 0);
        };
        $editor.current.onContentChange(checkIsEmpty);
    }, []);
    const updateText = useCallback((text) => {
        $editor.current?.resetText(text);
        setInputText(text);
    }, []);
    const sendMessage = useCallback((text, payload) => {
        dispatch({
            type: 'UserHitSend',
            peerId: Peer.MARUSIA_PEER_ID,
            entrypoint,
            text,
            timestamp: Date.now(),
            extra: {
                botPayload: JSON.stringify(payload),
            },
            attaches: {},
            analyticsAppName,
        });
        updateText('');
    }, [analyticsAppName, dispatch, entrypoint, updateText]);
    const setDisabled = useCallback((isDisabled) => {
        $editor.current?.setDisabled(isDisabled);
    }, []);
    useEffect(() => {
        marusia?.handleAction({
            type: 'enter_dialog',
            payload: {
                isNewConvo,
            },
        });
    }, [marusia, isNewConvo]);
    useEffect(() => {
        const unsubscribe = marusia?.subscribe((event) => {
            switch (event.type) {
                case 'phrase_start':
                    setDisabled(true);
                    setActionsDisabled(true);
                    updateText(event.payload.text);
                    break;
                case 'phrase_update':
                    updateText(event.payload.text);
                    break;
                case 'phrase_finish':
                    setDisabled(false);
                    setActionsDisabled(false);
                    updateText(event.payload.text);
                    break;
                case 'session_create':
                    setDisabled(false);
                    $editor.current?.focus();
                    break;
                case 'send_message':
                    if (event.payload.instanceId === instanceId &&
                        event.payload.text !== '') {
                        sendMessage(event.payload.text, event.payload.payload);
                    }
                    else {
                        updateText('');
                    }
                    break;
                default:
                    break;
            }
        });
        return unsubscribe;
    }, [marusia, sendMessage, updateText, setDisabled, instanceId]);
    const handleSendMessage = useCallback(() => {
        if (!$editor.current) {
            return;
        }
        const messageText = sanitizeText($editor.current.getText());
        if (!messageText) {
            return;
        }
        sendMessage(messageText, {
            communication_type: 'text',
            voice_assistant: {
                support_process_commands_by_ids: true,
            },
        });
    }, [sendMessage]);
    const handleHelpClick = useCallback(() => {
        marusia?.handleAction({
            type: 'open_help_modal',
            payload: {
                title: lang.use('me_marusia_skills_title'),
                instanceId,
            },
        });
    }, [marusia, lang, instanceId]);
    useEffect(() => $editor.current?.onContentChange((text) => {
        setInputText(text);
    }), []);
    // Подписываемся на вставку, чтобы вставляемый контент очищался от стилей
    useEffect(() => $editor.current?.onPaste(() => { }), []);
    useEffect(() => $editor.current?.onMouseDown(), []);
    useEffect(() => {
        const handleKeyCombo = (keyCombo, event) => {
            if (!$editor.current) {
                return;
            }
            switch (keyCombo) {
                case 'Mod+Enter': {
                    if (isCtrlSubmitEnabled) {
                        handleSendMessage();
                    }
                    return;
                }
                case 'Enter': {
                    if (!isCtrlSubmitEnabled) {
                        event.preventDefault();
                        handleSendMessage();
                    }
                    return;
                }
                default:
                    return;
            }
        };
        return $editor.current?.onKeyCombo(handleKeyCombo);
    }, [isCtrlSubmitEnabled, handleSendMessage]);
    useEffect(() => {
        $editor.current?.focus();
        return () => {
            $editor.current = null;
        };
    }, []);
    return (React.createElement("div", { className: cx('MarusiaComposer', {
            'MarusiaComposer--compact': isCompactView,
        }) },
        React.createElement(MarusiaSuggests, { isCompactView: isCompactView, instanceId: instanceId }),
        React.createElement("div", { className: "MarusiaComposer__field" },
            React.createElement("button", { className: "MarusiaHelpButton", onClick: handleHelpClick },
                React.createElement(Icon24HelpOutline, null)),
            React.createElement("span", { ref: createEditor, className: cx('MarusiaComposer__input', isEmpty && 'MarusiaComposer__input--placeholdered'), "data-placeholder": lang.use('me_fc_composer_input_placeholder'), contentEditable: true }),
            React.createElement(MarusiaButton, { sendMessage: handleSendMessage, typing: typing && !actionsDisabled, instanceId: instanceId }))));
};
//# sourceMappingURL=MarusiaComposer.js.map