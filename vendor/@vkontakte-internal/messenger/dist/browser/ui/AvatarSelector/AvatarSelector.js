import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { IMAGE_TYPES, preloadImage, Uploader } from '../../../data/env/Uploader';
import { useBrowserEnv, useCommunityMessagingWithToggle, useFeatureFlags, useOwner, usePeers, usePrevious, useViewer, } from '../../hooks/misc';
import '../../ui/AvatarSelector/AvatarSelector.css';
import { Icon20DeleteOutline, Icon20PictureOutline, Icon20WriteOutline, Icon28CameraAddOutline, Icon20Stars, } from '@vkontakte/icons';
import { blobToImageUrl, fileToStaticImageUrl, getImageSizeByFile, } from '../../utils/files';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { useSubModal } from '../../hooks/useModal';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Link } from '../../ui/Link/Link';
import { STICKER_IMAGE_EDITOR_MINI_APP_ID } from '../../../core/config/config';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { useRouter } from '../../ui/Router/Router';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
const DEFAULT_NO_IMAGE = React.createElement(Icon28CameraAddOutline, null);
const IMAGE_MIN_SIZE = 200;
const IMAGE_MAX_SIZE = 7000;
const MIN_ASPECT_RATIO = 0.25;
const MAX_ASPECT_RATIO = 3;
export const AvatarSelector = ({ size = 72, peerId, isLoading, onSelection, onUpload, onRemove, isDisabled = false, isEditing = false, noImage, }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const { lang, uploader, imageAreaSelector } = useBrowserEnv();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const errorModal = useSubModal();
    const { id: ownerId } = useOwner();
    const { viewer, profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const { navigate } = useRouter();
    const featureFlags = useFeatureFlags();
    const peers = usePeers();
    const peer = useMemo(() => (peerId ? Peer.safeGet(peers, peerId) : null), [peers, peerId]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const previousFile = usePrevious(file);
    const previousPreview = usePrevious(preview);
    const isUploading = !!(file && !preview);
    const isBusy = isLoading || isUploading;
    const photoAttachId = useMemo(() => {
        if (preview) {
            // @todo Разобраться почему фотки только что загруженных вложений не открываются
            return null;
        }
        if (!peer) {
            return null;
        }
        if (peer.kind !== 'User') {
            // ID фото есть только у пользователей (так работает сервер)
            return null;
        }
        if (!peer.photoId) {
            return null;
        }
        return peer.photoId;
    }, [preview, peer]);
    const hasPhoto = useMemo(() => {
        if (preview) {
            return true;
        }
        if (!peer) {
            return false;
        }
        switch (peer.kind) {
            case 'Chat':
                return Peer.hasPhoto(peer) && !peer.hasDefaultPhoto;
            case 'User':
                return Peer.hasPhoto(peer) && !peer.hasDefaultPhoto && peer.photoId;
            default:
                return Peer.hasPhoto(peer);
        }
    }, [preview, peer]);
    const clearFileInput = () => {
        /**
         * Очищаем файл инпут
         */
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };
    const clear = () => {
        setFile(null);
        setPreview(null);
        onRemove?.();
    };
    const onFileSelection = async (event) => {
        const file = event.target.files?.item(0) || null;
        if (!file) {
            // Исключительный сценарий
            return;
        }
        const isValidImage = await validateImage(file);
        if (!isValidImage) {
            errorModal.open();
            clearFileInput();
            return;
        }
        if (!imageAreaSelector || !featureFlags.vkm_avatar_area_selector) {
            setFile(file);
            return;
        }
        try {
            const baseUrl = await fileToStaticImageUrl(file);
            const imageSize = await getImageSizeByFile(file);
            const blob = await imageAreaSelector.open({
                cropArea: {
                    height: IMAGE_MIN_SIZE,
                    width: IMAGE_MIN_SIZE,
                },
                imageSrc: baseUrl,
                imageSize,
                mode: 'circle',
            });
            if (blob) {
                const areaFile = new File([blob], file.name, {
                    type: blob.type,
                });
                setFile(areaFile);
            }
        }
        catch {
            errorModal.open();
            clearFileInput();
        }
    };
    const uploadPreview = useCallback((file) => {
        try {
            uploader.uploadFiles([file], {}, {
                groupId: Peer.isGroupPeerId(ownerId) ? ownerId : undefined,
                viewerId: viewer.id,
                targetPeerId: viewer.id,
            }, {
                onUploadFinish: (result) => {
                    const { photos } = Uploader.buildAttachments(Array.from(result.values()));
                    if (!photos) {
                        // Исключительный сценарий
                        throw new Error('Неожиданный ответ системы загрузки файлов, загруженные аттачи не вернулись');
                    }
                    setPreview(photos[0]);
                },
            });
        }
        catch (e) {
            // Исключительный сценарий
            // @todo Обработка исключительного сценария
            setFile(null);
        }
    }, [ownerId, uploader, viewer.id]);
    const selectImage = () => {
        setDropdownOpen(false);
        // Очищаем инпут перед открытием, чтобы выбор того же файла триггерил onChange
        clearFileInput();
        inputRef.current?.click();
    };
    useEffect(() => {
        setPreview(null);
        if (!file) {
            return;
        }
        uploadPreview(file);
    }, [file, uploadPreview]);
    useEffect(() => {
        if (file === null || file === previousFile) {
            return;
        }
        onSelection(file);
    }, [file, previousFile, onSelection]);
    useEffect(() => {
        if (preview === null || preview === previousPreview) {
            return;
        }
        onUpload?.(preview);
    }, [preview, previousPreview, onUpload]);
    const renderPreview = () => {
        if (!preview && !file) {
            if (noImage && !hasPhoto) {
                // Кастомный шаблон дефолтного фото в приоритете
                return noImage;
            }
            // Если может быть доступно только дефолтное изображение
            if (peer !== null) {
                return React.createElement(PeerAvatar, { peer: peer, size: size });
            }
            return DEFAULT_NO_IMAGE;
        }
        if (preview?.photo) {
            return (React.createElement(BasicAvatar, { picture: preview.photo, alt: "", size: size, className: "AvatarSelector__preview", content: peer ? Peer.name(peer) : '' }));
        }
        let url = null;
        if (file) {
            url = blobToImageUrl({ blob: file });
        }
        if (!url) {
            if (noImage) {
                // Кастомный шаблон дефолтного фото в приоритете
                return noImage;
            }
            return DEFAULT_NO_IMAGE;
        }
        return React.createElement("img", { alt: "", src: url, className: "AvatarSelector__preview" });
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Dropdown, { disableInert: true, enableFocusTrap: true, openType: "click", hideOnClick: true, hideOnWheel: true, hideOnMouseLeave: true, adaptive: true, open: isDropdownOpen, onOpen: () => setDropdownOpen(true), onClose: () => setDropdownOpen(false), content: React.createElement(ActionsMenu, null,
                !isBusy && photoAttachId && (React.createElement(Link, { to: {
                        kind: 'PhotoModal',
                        ownerId: viewer.id,
                        id: photoAttachId,
                    }, preventDefault: false, stopPropagation: false, className: "AvatarSelector__dropDownLink" },
                    React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20PictureOutline, null), type: "secondary", title: lang.use('me_open_photo'), disabled: isDisabled }))),
                React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20WriteOutline, null), type: "secondary", disabled: isUploading || isDisabled, title: lang.use(hasPhoto ? 'me_update_photo' : 'me_upload_photo'), onClick: selectImage }),
                !isCommunityMessaging && peerId && peer?.kind === 'Chat' && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20Stars, null), disabled: isBusy || isDisabled, type: "secondary", title: lang.use('me_create_from_sticker'), onClick: () => {
                        setDropdownOpen(false);
                        navigate({
                            kind: 'MiniAppModal',
                            miniAppId: Attach.resolveMiniAppId(STICKER_IMAGE_EDITOR_MINI_APP_ID),
                            hash: `peer=${peerId}`,
                        });
                    } })),
                hasPhoto && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger", disabled: isBusy || isDisabled, title: lang.use('me_remove_photo'), onClick: clear }))), forceUpdateContent: true, align: "left", position: "bottom" },
            React.createElement("div", { className: cx('AvatarSelector', `AvatarSelector--size-${size}`, {
                    AvatarSelector__loading: isBusy,
                    'AvatarSelector--disabled': isDisabled,
                }), "data-testid": "avatar-selector" },
                isBusy && (React.createElement(OptimizedSpinner, { className: "AvatarSelector__loader", size: "s" })),
                React.createElement("div", { className: cx('AvatarSelector__image', {
                        'AvatarSelector__image--dark': isEdu && peer?.kind === 'User',
                    }) }, renderPreview()),
                hasPhoto && (React.createElement(VisuallyHidden, null,
                    React.createElement("button", { disabled: isBusy || isDisabled, "aria-label": lang.use('me_remove_photo'), onClick: clear }))),
                React.createElement("button", { 
                    // Добавим ключ, чтобы кнопка сбросила стейт ховера после загрузки
                    key: `${isBusy}`, className: cx('AvatarSelector__button', {
                        AvatarSelector__buttonEditing: isEditing,
                    }), onClick: selectImage, disabled: isBusy, "aria-label": lang.use(hasPhoto ? 'me_update_photo' : 'me_upload_photo') },
                    React.createElement(Icon28CameraAddOutline, { "aria-hidden": true })),
                React.createElement("input", { ref: inputRef, "aria-hidden": true, tabIndex: -1, type: "file", className: "AvatarSelector__input", onChange: onFileSelection, accept: IMAGE_TYPES.join() }))),
        errorModal.isActive && (React.createElement(ModalInterface, { onClose: errorModal.close, closeLabel: lang.use('me_close'), onBack: errorModal.close, contextClass: "MEConfig", title: lang.use('me_avatar_selector_error_title'), isDarkBody: true },
            React.createElement("div", { className: "AvatarSelector__errorText" }, lang.use('me_avatar_selector_error_text'))))));
};
async function validateImage(file) {
    try {
        const image = await preloadImage(file);
        return validateImageSize(image);
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
function validateImageSize({ width, height }) {
    const aspectRatio = width / height;
    /**
     * Первое условие: по ширине и высоте
     */
    const isAboveMinimumSize = width >= IMAGE_MIN_SIZE && height >= IMAGE_MIN_SIZE;
    const isBelowMaximumSize = width <= IMAGE_MAX_SIZE && height <= IMAGE_MAX_SIZE;
    const isValidSize = isAboveMinimumSize && isBelowMaximumSize;
    /**
     * Второе условие: по соотношению сторон
     */
    const isValidAspectRatio = MIN_ASPECT_RATIO < aspectRatio && aspectRatio < MAX_ASPECT_RATIO;
    return isValidSize && isValidAspectRatio;
}
//# sourceMappingURL=AvatarSelector.js.map