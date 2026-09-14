import React, { useEffect, useState, useMemo } from 'react';
import { Placeholder, Text, Button } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv, useViewport } from '../../hooks/misc';
import { MiniAppPickerSkeleton } from '../../ui/MiniAppPickerSkeleton/MiniAppPickerSkeleton';
import { MiniAppPickerGroup } from '../../ui/MiniAppPickerGroup/MiniAppPickerGroup';
import { useSubModal } from '../../hooks/useModal';
import { MiniAppPickerConfirmModal } from '../../ui/MiniAppPickerConfirmModal/MiniAppPickerConfirmModal';
import { fromApiPickerList } from '../../../data/converter/MiniAppsConverter';
import { useApiFetch } from '../../hooks/useApiFetch';
import '../../ui/MiniAppPicker/MiniAppPicker.css';
export const ATTACH_PICKER_REFERER = 'im_attach_picker';
export const MiniAppPicker = ({ onClose, peerId, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const [apps, setApps] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeAppId, setActiveAppId] = useState(0);
    const confirmationModal = useSubModal();
    const [width] = useViewport({ debounced: true });
    const loadPickerList = async () => {
        setError(false);
        setLoading(true);
        try {
            const pickerList = await apiFetch('apps.getAttachPickerList', {
                peer_id: peerId,
                type: 'mini_apps',
            });
            const { apps, widgets } = fromApiPickerList(pickerList);
            setApps(apps);
            setWidgets(widgets);
        }
        catch (_) {
            setError(true);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void loadPickerList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const count = apps.length + widgets.length;
    const activeApp = useMemo(() => {
        return widgets.find(({ app }) => app && app.id === activeAppId);
    }, [activeAppId, widgets]);
    const addApp = (appId) => {
        setActiveAppId(appId);
        confirmationModal.open();
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(ModalInterface, { withCustomLayout: true, onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_miniapps_picker_title') },
            React.createElement("div", { className: "MiniAppPicker__modalBody" },
                loading && React.createElement(MiniAppPickerSkeleton, null),
                error && !loading && (React.createElement("div", { className: "MiniAppPicker__placeholder" },
                    React.createElement(Placeholder, { stretched: true, action: React.createElement(Button, { mode: "tertiary", onClick: loadPickerList }, lang.use('me_miniapp_picker_repeat_btn')) },
                        React.createElement(Text, { style: {
                                color: 'var(--vkui--color_text_subhead)',
                            } }, lang.use('me_miniapp_picker_error_loading_title'))))),
                widgets.length > 0 && (React.createElement(MiniAppPickerGroup, { type: "widgets", onClose: onClose, items: widgets, count: count, onSendApp: addApp, withSeparator: apps.length > 0, withFooter: apps.length === 0, isCompact: width < 640, peerId: peerId })),
                apps.length > 0 && (React.createElement(MiniAppPickerGroup, { type: "apps", items: apps, count: count, onClose: onClose, peerId: peerId })))),
        confirmationModal.isActive && activeApp && activeApp.app && (React.createElement(MiniAppPickerConfirmModal, { onClose: confirmationModal.close, onRepeat: confirmationModal.open, pickerPayload: {
                actionHash: activeApp.actionHash,
                actionTitle: activeApp.actionTitle,
            }, app: activeApp.app, peerId: peerId, closePicker: onClose }))));
};
//# sourceMappingURL=MiniAppPicker.js.map