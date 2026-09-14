import React, { useState } from 'react';
import { Button, ButtonGroup, Image, Subhead, Title } from '@vkontakte/vkui';
import { useBrowserEnv, useViewport, useOwner } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon56ErrorOutline } from '@vkontakte/icons';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { sendWidgetToChats, getSnackbarProps, createSendToChatError, } from '../../ui/MiniAppPicker/helpers';
import { useMiniAppWidgetAppIconUrl } from '../../hooks/useMiniAppWidgetAppIconUrl';
import { useApiFetch, useApiFetchMany } from '../../hooks/useApiFetch';
import '../../ui/MiniAppPickerConfirmModal/MiniAppPickerConfirmModal.css';
export const MiniAppPickerConfirmModal = ({ app, pickerPayload, onCancel, onClose, onSuccess, onRepeat, peerId, closePicker, fromApp, closeOnSuccess, apiError, setApiError, multichat, }) => {
    const { lang, analyticsAppName } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchMany = useApiFetchMany();
    const snackbar = useSnackbar();
    const owner = useOwner();
    const [width] = useViewport({ debounced: true });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { title } = app;
    const appIconUrl = useMiniAppWidgetAppIconUrl(app);
    const onManualClose = (apiError) => {
        if (onCancel) {
            const [errorType, errorInfo] = createSendToChatError(apiError);
            onCancel(errorType, errorInfo);
        }
    };
    const sendApp = async () => {
        setLoading(true);
        try {
            await sendWidgetToChats({
                apiFetch,
                apiFetchMany,
                app,
                owner,
                payload: pickerPayload,
                peers: [peerId],
                appName: analyticsAppName,
            });
            onClose();
            onSuccess?.();
            if (fromApp && closeOnSuccess) {
                closePicker();
            }
            else {
                snackbar(getSnackbarProps({
                    lang,
                    success: true,
                    closeParent: closePicker,
                }));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error && (error.message || error.toString());
            setApiError?.(errorMessage || '');
            if (width >= 640) {
                setError(true);
            }
            else {
                onClose();
                snackbar(getSnackbarProps({
                    lang,
                    success: false,
                    repeatAction: onRepeat,
                    onManualClose,
                    errorMessage: errorMessage || '',
                }));
            }
        }
        finally {
            setLoading(false);
        }
    };
    const openChatsModal = () => {
        setLoading(true);
        onClose();
        onSuccess?.();
    };
    const onCancelButtonClick = () => {
        onClose();
        onManualClose(apiError);
    };
    return (React.createElement(ModalView, { onEscape: onCancelButtonClick },
        React.createElement(ModalBackdrop, { onClick: onCancelButtonClick },
            React.createElement(ModalPanel, { className: "MiniAppPickerConfirmModal__modalPanel" },
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "MiniAppPickerConfirmModal__confirmBody" },
                        React.createElement("div", { className: "MiniAppPickerConfirmModal__confirmBodyImage" }, error ? (React.createElement(Icon56ErrorOutline, { fill: "var(--vkui--color_icon_negative)" })) : (React.createElement(Image, { size: 80, borderRadius: "m", src: appIconUrl, alt: title }))),
                        React.createElement(Title, { level: "2", weight: "2", style: { marginBottom: 16 }, Component: "h2", useAccentWeight: true }, lang.use(error
                            ? 'me_miniapps_picker_fail_snackbar_title'
                            : 'me_mini_miniapps_picker_confirm_title', {
                            values: {
                                title,
                            },
                        })),
                        React.createElement(Subhead, { style: {
                                color: 'var(--vkui--color_text_subhead)',
                                marginBottom: 32,
                            } }, lang.use(error
                            ? 'me_miniapps_picker_fail_snackbar_subtitle'
                            : 'me_mini_miniapps_picker_confirm_subtitle')),
                        React.createElement(ButtonGroup, { mode: width > 350 ? 'horizontal' : 'vertical', stretched: true, gap: "m" },
                            React.createElement(Button, { mode: "secondary", size: "l", stretched: true, onClick: onCancelButtonClick }, lang.use('me_mini_miniapps_picker_confirm_cancel')),
                            React.createElement(Button, { loading: loading, disabled: loading, size: "l", stretched: true, onClick: multichat ? openChatsModal : sendApp }, multichat
                                ? lang.use('me_mini_miniapps_picker_confirm_open_chat_selector')
                                : lang.use('me_mini_miniapps_picker_confirm_submit')))))))));
};
//# sourceMappingURL=MiniAppPickerConfirmModal.js.map