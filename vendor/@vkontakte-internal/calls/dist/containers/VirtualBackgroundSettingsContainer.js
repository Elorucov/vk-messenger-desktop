import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useCallback, useEffect, useState } from 'react';
import { VirtualBackgroundSettingsModal } from '../components/VirtualBackgroundSettingsModal/VirtualBackgroundSettingsModal';
import { VirtualBackgroundSettings } from '../components/VirtualBackgroundSettings/VirtualBackgroundSettings';
import { useSettingsItems } from '../components/VirtualBackgroundSettings/hooks/useSettingsItems';
import { useBackgroundEffects } from '../components/VirtualBackgroundSettings/hooks/useBackgroundEffects';
import { useInitialBackgroundEffect } from '../components/VirtualBackgroundSettings/hooks/useInitialBackgroundEffect';
import { useSavedSettings } from '../components/VirtualBackgroundSettings/hooks/useSavedSettings';
import { useBackgroundsList } from '../components/VirtualBackgroundSettings/hooks/useBackgroundsList';
import { ErrorBoundary } from '../components/VirtualBackgroundSettings/ErrorBoundary';
import { modalHasType, ModalType } from '@vkontakte-internal/calls-core';
import { useCloseModal } from '../hooks/useCloseModal';
import { useCurrentUserStream } from '../hooks/useCurrentUserStream';
import { useUserBackgrounds } from '../hooks/useUserBackgrounds';
import { UploadBackgroundErrorContainer } from './UploadBackgroundErrorContainer';
import { UploadBackgroundPhotoContainer } from './UploadBackgroundPhotoContainer';
import { useVideoOptions } from '../hooks/useVideoOptions';
import { effectStorage } from '../helpers/localStorage';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { getIsSferum, getModal, getPhotos } from '../selectors';
const VirtualBackgroundSettingsContainerComponent = () => {
    const SDK = useCallsSDK();
    /**
     * флаг, что пользователь первоначально открыл меню настроек фона.
     * будет сброшен только при нажатии на кнопки "сохранить" или "отмена"
     */
    const [settingsOpened, setSettingsOpened] = useState(false);
    /** выбранное модальное окно */
    const modal = useTypedSelector(getModal);
    /** список фотографий пользователя */
    const photos = useTypedSelector(getPhotos);
    /** признак, что приложение открыли из сферума */
    const isSferum = useTypedSelector(getIsSferum);
    const { backgroundList } = useBackgroundsList({ photos });
    const onClose = useCloseModal();
    const { userStream, isVideoEnabled } = useCurrentUserStream();
    const { chosen, setChosen, onClick: onChooseBackground, onSuccessPhotoUpload, } = useSettingsItems({ backgroundList });
    const { onCancelSettings, loadingUpload: loading, onAddBackground, onDeleteBackground, onSaveSettings, } = useUserBackgrounds({ photos, onSuccessPhotoUpload, isSferum });
    const { onSettingsChange } = useBackgroundEffects({ SDK });
    useInitialBackgroundEffect({
        onSettingsChange,
        userStream,
        backgroundList,
        isVideoEnabled,
    });
    const { onRestoreSettings, onApplySettings } = useSavedSettings({
        chosen,
        onSettingsChange,
        settingsOpened,
        setChosen,
        backgroundList,
        isVideoEnabled,
    });
    const { videoOptions, onRestoreSettings: onRestoreVideoOptions, onSaveSettings: onSaveVideoOptions, onChangeVideoOption, } = useVideoOptions();
    useEffect(() => {
        // при монтировании вычищаем timestamp выбранного эффекта
        effectStorage.clearEffectTs();
    }, []);
    useEffect(() => {
        if (modalHasType(modal, ModalType.VIRUTAL_BACKGROUND) && !settingsOpened) {
            setSettingsOpened(true);
        }
    }, [modal]);
    /** пользователь сохраняет настройки */
    const onSubmit = useCallback(() => {
        onSaveSettings();
        onClose();
        setSettingsOpened(false);
        onApplySettings();
        onSaveVideoOptions();
    }, [onSaveSettings, onClose, onApplySettings, onSaveVideoOptions]);
    /** пользователь сбрасывает настройки */
    const onCancel = useCallback(() => {
        onCancelSettings();
        onClose();
        setSettingsOpened(false);
        onRestoreSettings();
        onRestoreVideoOptions();
    }, [onCancelSettings, onClose, onRestoreSettings, onRestoreVideoOptions]);
    return (_jsxs(ErrorBoundary, { onError: onCancel, children: [modalHasType(modal, ModalType.VIRUTAL_BACKGROUND) && (_jsx(VirtualBackgroundSettingsModal, { onClose: onCancel, onSubmit: onSubmit, onChangeVideoOption: onChangeVideoOption, videoOptions: videoOptions, children: _jsx(VirtualBackgroundSettings, { chosen: chosen, backgroundList: backgroundList, onDeleteBackground: onDeleteBackground, onChooseBackground: onChooseBackground, videoOptions: videoOptions, isSferum: isSferum, SDK: SDK }) })), modalHasType(modal, ModalType.UPLOAD_BACKGROUND_PHOTO) && (_jsx(UploadBackgroundPhotoContainer, { onAddBackground: onAddBackground, loading: loading })), modalHasType(modal, ModalType.UPLOAD_BACKGROUND_ERROR) && _jsx(UploadBackgroundErrorContainer, {})] }));
};
export const VirtualBackgroundSettingsContainer = memo(VirtualBackgroundSettingsContainerComponent);
//# sourceMappingURL=VirtualBackgroundSettingsContainer.js.map