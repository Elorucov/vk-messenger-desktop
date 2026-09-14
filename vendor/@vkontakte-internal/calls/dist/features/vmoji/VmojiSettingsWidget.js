import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { ErrorBoundary } from '../../components/VirtualBackgroundSettings/ErrorBoundary';
import { modalHasType, ModalType } from '@vkontakte-internal/calls-core';
import { useCloseModal } from '../../hooks/useCloseModal';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getModal } from '../../selectors';
import { useVmojiSettingsModel, VmojiSettingsModelProvider } from './VmojiSettingsModel';
import { VmojiSettingsModal } from './components/VmojiSettingsModal/VmojiSettingsModal';
import { VmojiSettings } from './components/VmojiSettings/VmojiSettings';
const VmojiSettingsContainer = observer(function VmojiSettingsContainer() {
    const model = useVmojiSettingsModel();
    const { isVmojiCapture, isVmojiPreviewGenerated, loadingStatus, myAnimatedAvatarUrl, vmojiPreviewSrc } = model;
    /** выбранное модальное окно */
    const modal = useTypedSelector(getModal);
    const onClose = useCloseModal();
    useEffect(() => {
        if (modalHasType(modal, ModalType.VMOJI)) {
            // подгружаем id при открытии модалки
            model.loadCharacterId();
        }
    }, [modal]);
    const onEdit = () => {
        model.startEditCharacter();
        onClose();
    };
    const onCreate = () => {
        model.startCreateCharacter();
        onClose();
    };
    return (_jsx(ErrorBoundary, { onError: onClose, children: modalHasType(modal, ModalType.VMOJI) && (_jsx(VmojiSettingsModal, { onClose: onClose, children: _jsx(VmojiSettings, { isVmojiCreated: !!myAnimatedAvatarUrl, isVmojiPreviewGenerated: isVmojiPreviewGenerated, isVmojiCapture: isVmojiCapture, vmojiPreviewSrc: vmojiPreviewSrc, loadingStatus: loadingStatus, onToggle: model.toggleMyVmoji, onEdit: onEdit, onCreate: onCreate }) })) }));
});
export const VmojiSettingsWidget = createWidget(VmojiSettingsModelProvider, VmojiSettingsContainer);
//# sourceMappingURL=VmojiSettingsWidget.js.map