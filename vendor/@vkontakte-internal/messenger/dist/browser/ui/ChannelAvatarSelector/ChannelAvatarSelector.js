import '../../ui/ChannelAvatarSelector/ChannelAvatarSelector.css';
import React, { useCallback, useEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import { IMAGE_TYPES, preloadImage, Uploader } from '../../../data/env/Uploader';
import { useBrowserEnv, useFeatureFlags, usePrevious, useViewer, } from '../../hooks/misc';
import { Icon20WriteOutline, Icon28CameraAddOutline } from '@vkontakte/icons';
import { blobToImageUrl, fileToStaticImageUrl, getImageSizeByFile, } from '../../utils/files';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useSubModal } from '../../hooks/useModal';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Button } from '@vkontakte/vkui';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { BasicAvatar, } from '../../ui/BasicAvatar/BasicAvatar';
const DEFAULT_NO_IMAGE = React.createElement(Icon28CameraAddOutline, null);
const IMAGE_MIN_SIZE = 200;
const IMAGE_MAX_SIZE = 7000;
const MIN_ASPECT_RATIO = 0.25;
const MAX_ASPECT_RATIO = 3;
export const ChannelAvatarSelector = ({ size = 72, isLoading, onSelection, onUpload, isDisabled = false, isEditing = false, noImage, channel, }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const { lang, uploader, imageAreaSelector } = useBrowserEnv();
    const errorModal = useSubModal();
    const { vkm_avatar_area_selector } = useFeatureFlags();
    const { viewer } = useViewer();
    const { isMobileLayout } = useLayoutData();
    const isStaticEditingButton = !isMobileLayout || isEditing;
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const previousFile = usePrevious(file);
    const previousPreview = usePrevious(preview);
    const isUploading = !!(file && !preview);
    const isBusy = isLoading || isUploading;
    const hasPhoto = Boolean(channel?.photo);
    const clearFileInput = () => {
        /**
         * Очищаем файл инпут
         */
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };
    const onFileSelection = async (event) => {
        const files = event.target.files;
        if (!files) {
            // Исключительный сценарий
            return;
        }
        const file = files.item(0);
        if (!file) {
            // Исключительная ситуация
            return;
        }
        const isValidImage = await validateImage(file);
        if (!isValidImage) {
            errorModal.open();
            clearFileInput();
            return;
        }
        if (!imageAreaSelector || !vkm_avatar_area_selector) {
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
    }, [uploader, viewer.id]);
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
            if (noImage) {
                // Кастомный шаблон дефолтного фото в приоритете
                return noImage;
            }
            // Если может быть доступно только дефолтное изображение
            if (channel) {
                return (React.createElement(ChannelAvatar, { photo: channel.photo, name: channel.name, size: size }));
            }
            return DEFAULT_NO_IMAGE;
        }
        if (preview?.photo) {
            return (React.createElement(BasicAvatar, { picture: preview.photo, alt: "", size: size, className: "AvatarSelector__preview", content: channel.name }));
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
        return (React.createElement("img", { alt: lang.use('me_channel_avatar_selector', {
                values: { name: channel.name },
            }), src: url, className: "ChannelAvatarSelector__preview" }));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Dropdown, { hideOnClick: true, open: isDropdownOpen, onOpen: () => setDropdownOpen(true), onClose: () => setDropdownOpen(false), content: React.createElement(ActionsMenu, null,
                React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20WriteOutline, null), type: "primary", disabled: isUploading || isDisabled, title: lang.use(hasPhoto ? 'me_update_photo' : 'me_upload_photo'), onClick: selectImage })), forceUpdateContent: true, align: "left", position: "bottom" },
            React.createElement("div", { className: cx('ChannelAvatarSelector', `ChannelAvatarSelector--size-${size}`, {
                    ChannelAvatarSelector__loading: isBusy,
                }) },
                React.createElement(OptimizedSpinner, { className: "ChannelAvatarSelector__loader", size: "s" }),
                React.createElement("div", { className: "ChannelAvatarSelector__image" }, renderPreview()),
                isStaticEditingButton && (React.createElement("button", { 
                    // Добавим ключ, чтобы кнопка сбросила стейт ховера после загрузки
                    key: `${isBusy}`, className: cx('ChannelAvatarSelector__button', {
                        ChannelAvatarSelector__buttonEditing: isEditing,
                    }), onClick: selectImage, disabled: isBusy },
                    React.createElement(Icon28CameraAddOutline, null))),
                React.createElement("input", { ref: inputRef, type: "file", className: "ChannelAvatarSelector__input", onChange: onFileSelection, accept: IMAGE_TYPES.join() }))),
        errorModal.isActive && (React.createElement(ModalInterface, { onClose: errorModal.close, closeLabel: lang.use('me_close'), onBack: errorModal.close, contextClass: "MEConfig", title: lang.use('me_avatar_selector_error_title'), buttons: React.createElement(Button, { onClick: errorModal.close }, lang.use('me_close')) },
            React.createElement("div", { className: "ChannelAvatarSelector__errorText" }, lang.use('me_avatar_selector_error_text'))))));
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
//# sourceMappingURL=ChannelAvatarSelector.js.map