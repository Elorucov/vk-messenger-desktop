import React, { memo } from 'react';
import { Icon24AddCircleOutline } from '@vkontakte/icons';
import { Clip } from '../../ui/Clip/Clip';
import { useVkcomMediaPickers } from '../../ui/ConvoComposer/useVkcomMediaPickers';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import { useRouter } from '../../ui/Router/Router';
import { EDU_ACHIEVEMENTS_MINI_APP_ID } from '../../../core/config/config';
import { useBrowserEnv } from '../../hooks/misc';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
export const ClipButton = memo(function ClipButton({ peerId, onlyNativePickers, addAttaches, openErrorModalWithLangKey, filePickerModal, miniAppPickerModal, isPostponed, isConvoOwner, isCompactView, addFileAttachments, }) {
    const { lang } = useBrowserEnv();
    const { screenRoute, navigate } = useRouter();
    const { onOpenPhotoPicker, onOpenVideoPicker, onOpenGiftPicker, onOpenGeoPicker, onOpenAudioPicker, isLocalPhotoPickerEnabled, isLocalVideoPickerEnabled, setOnOpenNativeFilePickerCallback, } = useVkcomMediaPickers(addAttaches, openErrorModalWithLangKey);
    const onAddAchievement = () => {
        navigate({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(EDU_ACHIEVEMENTS_MINI_APP_ID),
            hash: `conversation_id=${peerId}`,
        });
    };
    const getPickers = () => {
        if (onlyNativePickers) {
            return {};
        }
        return {
            setOnOpenNativeFilePickerCallback,
            onOpenPhotoPicker,
            onOpenVideoPicker,
            onOpenGiftPicker,
            onOpenGeoPicker,
            onOpenAudioPicker,
            onOpenFilePicker: filePickerModal.open,
            isLocalPhotoPickerEnabled,
            isLocalVideoPickerEnabled,
            addPoll: Peer.isChatPeerId(peerId)
                ? () => navigate({ ...screenRoute, createPoll: true })
                : undefined,
            addMiniApp: isPostponed ? undefined : miniAppPickerModal.open,
            addAchievement: onAddAchievement,
        };
    };
    const button = (React.createElement("button", { className: "ConvoComposer__button", "aria-label": lang.use('me_composer_file_picker_aria_label') },
        React.createElement(Icon24AddCircleOutline, null)));
    return (React.createElement(DeferredRendering, { fallback: button },
        React.createElement(Clip, { peerId: peerId, addFileAttachments: addFileAttachments, ...getPickers(), isConvoOwner: isConvoOwner, isCompactView: isCompactView, classNames: {
                wrapper: 'ConvoComposer__clip',
                portal: 'MEConfig',
            } }, button)));
});
//# sourceMappingURL=ClipButton.js.map