import '../../ui/Clip/Clip.css';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { Icon20DocumentOutline, Icon20PictureOutline, Icon20PollOutline, Icon20VideocamOutline, Icon20ServicesOutline, Icon20GiftOutline, Icon20PlaceOutline, Icon20MusicOutline, Icon20CupOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useOwner, useViewer } from '../../hooks/misc';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { DropAreaContext } from '../../ui/DropArea/DropArea';
import { IMAGE_TYPES, VIDEO_TYPES, isImage } from '../../../data/env/Uploader';
import { getImageSizeByFile } from '../../utils/files';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { useSendUserActivity } from '../../hooks/useComposer';
import { useRouter } from '../../ui/Router/Router';
const MAX_IMAGE_SIZE_SUM = 10000;
export const Clip = ({ addFileAttachments, addMiniApp, addPoll, onOpenFilePicker, onOpenPhotoPicker, onOpenVideoPicker, onOpenGiftPicker, onOpenGeoPicker, onOpenAudioPicker, isLocalPhotoPickerEnabled = false, isLocalVideoPickerEnabled = false, setOnOpenNativeFilePickerCallback, classNames, children, isConvoOwner, isCompactView, peerId, addAchievement, }) => {
    const { type } = useContext(DropAreaContext);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { lang, envFeatureFlags } = useBrowserEnv();
    const { viewer, profileType } = useViewer();
    const owner = useOwner();
    const isEdu = Viewer.isEdu(profileType);
    const isFavorites = peerId && Peer.isFavorites(peerId, owner.id);
    const isUserConvo = peerId && Peer.isUserPeerId(peerId) && !isFavorites;
    const isContactConvo = peerId && Peer.isContactPeerId(peerId);
    const showFileSelectionModal = useCallback((type) => {
        if (!ref.current) {
            return;
        }
        ref.current.name = type;
        switch (type) {
            case 'photo':
                ref.current.accept = IMAGE_TYPES.join(',');
                break;
            case 'video':
                ref.current.accept = VIDEO_TYPES.join(',');
                break;
            case 'doc':
                ref.current.accept = '*';
                break;
            default:
                exhaustivenessCheck(type);
        }
        /**
         * Инпут не контролируемый, так как находится в дропдауне,
         * который превентит любой клик внутри по инпутам
         */
        ref.current.value = '';
        ref.current.click();
    }, []);
    useEffect(() => {
        if (open) {
            setOnOpenNativeFilePickerCallback?.(showFileSelectionModal);
        }
    }, [open, setOnOpenNativeFilePickerCallback, showFileSelectionModal]);
    useEffect(() => () => setOnOpenNativeFilePickerCallback?.(undefined), [setOnOpenNativeFilePickerCallback]);
    const handleFileInputChange = async ({ target: { files: fileList, name }, }) => {
        const files = Array.from(fileList || []);
        if (!files.length) {
            return;
        }
        const imagesAsFiles = [];
        const restFiles = [];
        for (const file of files) {
            if (!isImage(file)) {
                restFiles.push(file);
                continue;
            }
            try {
                const { width, height } = await getImageSizeByFile(file);
                if (width + height >= MAX_IMAGE_SIZE_SUM) {
                    imagesAsFiles.push(file);
                }
                else {
                    restFiles.push(file);
                }
            }
            catch {
                restFiles.push(file);
            }
        }
        addFileAttachments(restFiles, { asFiles: name === 'doc' });
        addFileAttachments(imagesAsFiles, { asFiles: true });
    };
    const { screenRoute } = useRouter();
    const isPostponedScreen = envFeatureFlags.isPostponedMessagesAvailable &&
        screenRoute.kind === 'ConvoRoute' &&
        Boolean(screenRoute.postponed);
    const updateUserActivity = useSendUserActivity(Peer.resolveId(peerId), isPostponedScreen);
    const sendChoosingFileActivity = useCallback(() => {
        if (peerId !== undefined) {
            updateUserActivity('choosing_file');
        }
    }, [peerId, updateUserActivity]);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        React.createElement(ActionsMenuAction, { onClick: () => {
                sendChoosingFileActivity();
                (onOpenPhotoPicker || (() => showFileSelectionModal('photo')))();
            }, title: lang.use('me_fc_add_photo'), leftIcon: React.createElement(Icon20PictureOutline, null), type: "secondary" }),
        isLocalPhotoPickerEnabled && (React.createElement(ActionsMenuAction, { onClick: () => {
                sendChoosingFileActivity();
                showFileSelectionModal('photo');
            }, title: lang.use('me_fc_add_photo_local'), leftIcon: React.createElement(Icon20PictureOutline, null), type: "secondary" })),
        React.createElement(ActionsMenuAction, { onClick: () => {
                sendChoosingFileActivity();
                (onOpenVideoPicker || (() => showFileSelectionModal('video')))();
            }, title: lang.use('me_fc_add_video'), leftIcon: React.createElement(Icon20VideocamOutline, null), type: "secondary" }),
        isLocalVideoPickerEnabled && (React.createElement(ActionsMenuAction, { onClick: () => {
                sendChoosingFileActivity();
                showFileSelectionModal('video');
            }, title: lang.use('me_fc_add_video_local'), leftIcon: React.createElement(Icon20VideocamOutline, null), type: "secondary" })),
        onOpenAudioPicker && (React.createElement(ActionsMenuAction, { onClick: () => {
                sendChoosingFileActivity();
                onOpenAudioPicker();
            }, title: lang.use('me_fc_add_audio'), leftIcon: React.createElement(Icon20MusicOutline, null), type: "secondary" })),
        !isEdu &&
            peerId &&
            owner.kind !== 'Group' &&
            (Peer.isChatPeerId(peerId) || Peer.isUserPeerId(peerId)) &&
            addMiniApp &&
            !isConvoOwner &&
            !isCompactView && (React.createElement(ActionsMenuAction, { title: lang.use('me_fc_add_miniapp'), onClick: addMiniApp, leftIcon: React.createElement(Icon20ServicesOutline, null), type: "secondary" })),
        React.createElement(ActionsMenuAction, { onClick: () => {
                sendChoosingFileActivity();
                (onOpenFilePicker || (() => showFileSelectionModal('doc')))();
            }, title: lang.use('me_fc_add_document'), leftIcon: React.createElement(Icon20DocumentOutline, null), type: "secondary" }),
        onOpenGeoPicker && (React.createElement(ActionsMenuAction, { onClick: onOpenGeoPicker, title: lang.use('me_fc_add_map'), leftIcon: React.createElement(Icon20PlaceOutline, null), type: "secondary" })),
        addPoll && (React.createElement(ActionsMenuAction, { onClick: addPoll, title: lang.use('me_fc_add_poll'), leftIcon: React.createElement(Icon20PollOutline, null), type: "secondary" })),
        isUserConvo && onOpenGiftPicker && (React.createElement(ActionsMenuAction, { onClick: () => onOpenGiftPicker(peerId), title: lang.use('me_fc_add_gift'), leftIcon: React.createElement(Icon20GiftOutline, null), type: "secondary" })),
        isEdu &&
            viewer.isVerified &&
            !isFavorites &&
            !isContactConvo &&
            addAchievement && (React.createElement(ActionsMenuAction, { onClick: addAchievement, title: lang.use('me_add_achievement'), leftIcon: React.createElement(Icon20CupOutline, null), type: "secondary" })))), [
        lang,
        isLocalPhotoPickerEnabled,
        isLocalVideoPickerEnabled,
        onOpenAudioPicker,
        isEdu,
        peerId,
        owner.kind,
        addMiniApp,
        isConvoOwner,
        isCompactView,
        onOpenGeoPicker,
        addPoll,
        isUserConvo,
        onOpenGiftPicker,
        viewer.isVerified,
        isFavorites,
        isContactConvo,
        addAchievement,
        sendChoosingFileActivity,
        onOpenPhotoPicker,
        showFileSelectionModal,
        onOpenVideoPicker,
        onOpenFilePicker,
    ]);
    /**
     * Включать и выключать фокустрап приходится из-за того, что он "ворует" фокус у композера.
     * Например, вы выделяете мышкой текст в композере и вконце цепляете Clip ховером - в этот
     * момент ховер с композера снимается, а вы пытаясь удалить текст - возвращаетесь по истории назад, вместо удаления.
     */
    const [enableFocusTrap, setEnableFocusTrap] = useState(false);
    useEffect(() => {
        /**
         * Скрепка открывается и закрывается по клику, однако, когда активируется
         * дропзона, дропдаун не закроется сам. Ему нужно помочь.
         *
         * Закрываем скрепку, когда активируется дроп-зона
         */
        if (open && type) {
            setOpen(false);
            setEnableFocusTrap(false);
        }
    }, [open, type]);
    return (React.createElement(Dropdown, { open: open, onOpen: () => setOpen(true), onClose: () => {
            setOpen(false);
            setEnableFocusTrap(false);
        }, align: "left", position: "top", hideOnClick: true, openType: "hover-click", delay: 200, classNames: classNames, enableFocusTrap: enableFocusTrap, content: React.createElement(ActionsMenu, { className: "Clip__ActionsMenu" }, actionsList) },
        React.createElement("div", { onClick: () => setEnableFocusTrap(true) }, children),
        React.createElement("input", { ref: ref, className: "Clip__input", type: "file", multiple: true, onChange: handleFileInputChange, onClick: (e) => e.stopPropagation() })));
};
//# sourceMappingURL=Clip.js.map