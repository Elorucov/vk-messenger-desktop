import '../../ui/AttachSticker/AttachSticker.css';
import React from 'react';
import { StickerRich, Theme, } from '@vkontakte-internal/sticker';
import cx from 'classnames';
import { useStickerPackOpener } from '../../hooks/useStickerPackOpener';
import { usePopupProps } from '../../ui/AttachSticker/hooks/usePopupProps';
import { useColorScheme } from '@vkontakte/vkui';
import { useStickersConfig } from '../../hooks/useStickersConfig';
import { usePopupSticker } from '@vkontakte-internal/stickers-kit';
import { observer } from 'mobx-react-lite';
import { useViewer } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { useStickerEmojiMenu } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
export const AttachSticker = ({ sticker, size, packId, openStickerPackOnClick = true, onClick, iconPosition, availableDisabledMode, forceBorder, message, commentId, commentPeerId, noBackground, referrer, loading, }) => {
    const { navigate } = useRouter();
    const { openStickerPackInPicker, proxyRoute } = useStickerPackOpener({
        enabled: openStickerPackOnClick && !onClick,
        stickerId: sticker.id,
        stickerPackId: sticker.item.product_id || packId,
        referrer,
        messageAuthorId: message?.authorId || commentPeerId,
        vmojiCharacterId: sticker.item?.vmoji?.character_id,
    });
    if (openStickerPackInPicker) {
        return (React.createElement(ExternalAttachSticker, { sticker: sticker, size: size, onClick: (e) => {
                e.stopPropagation();
                openStickerPackInPicker();
            }, forceBorder: forceBorder, iconPosition: iconPosition, message: message, noBackground: true, commentId: commentId, loading: loading }));
    }
    if (proxyRoute) {
        return (React.createElement(ExternalAttachSticker, { sticker: sticker, size: size, onClick: () => navigate(proxyRoute), availableDisabledMode: availableDisabledMode, iconPosition: iconPosition, forceBorder: forceBorder, message: message, noBackground: true, commentId: commentId, loading: loading }));
    }
    return (React.createElement(ExternalAttachSticker, { sticker: sticker, size: size, onClick: onClick, iconPosition: iconPosition, availableDisabledMode: availableDisabledMode, forceBorder: forceBorder, message: message, commentId: commentId, noBackground: noBackground, loading: loading }));
};
const ExternalAttachSticker = observer(({ sticker, size, onClick, noBackground = false, iconPosition = 'rightAbsolute', availableDisabledMode, forceBorder, message, commentId, loading, }) => {
    const viewer = useViewer();
    const theme = useColorScheme();
    const config = useStickersConfig();
    const { popupStore: popupStickerService } = usePopupSticker();
    const { isOpen: isStickerEmojiMenuOpen } = useStickerEmojiMenu();
    const { popupProps, wrapperProps } = usePopupProps({
        sticker,
        iconPosition,
        popupStickerService,
        message,
        commentId,
        blockAnimation: isStickerEmojiMenuOpen,
    });
    return (React.createElement(StickerRich, { baseStickerProps: {
            size,
            sticker: sticker.item,
            onClick: (e) => {
                onClick && onClick(e);
            },
            className: cx('AttachSticker', {
                // проп plain отключает не только фон, но и cursor: pointer
                'AttachSticker--clickable': onClick && noBackground,
                'AttachSticker--loading': loading,
            }),
            defaultConfigId: config?.default_id,
            configs: config?.items,
            theme: theme === 'dark' || forceBorder ? Theme.DARK : Theme.LIGHT,
            plain: noBackground,
            disabled: availableDisabledMode && !sticker.item.is_allowed,
            noAnimation: !viewer.settings.isStickersAnimationEnabled,
        }, wrapperProps: {
            ...wrapperProps,
            onContentClick: wrapperProps.onContentClick
                ? (event) => {
                    if (wrapperProps.onContentClick) {
                        event.stopPropagation();
                        event.preventDefault();
                        wrapperProps.onContentClick?.(event);
                    }
                    else {
                        onClick?.(event);
                    }
                }
                : undefined,
            wrapperClassName: 'AttachStickerWrapper',
            contentClassName: cx('AttachSticker__iconClass', {
                'AttachStickerWrapper__iconClass--not-clickable': !wrapperProps.onContentClick,
            }),
        }, popupProps: popupProps }));
});
//# sourceMappingURL=AttachSticker.js.map