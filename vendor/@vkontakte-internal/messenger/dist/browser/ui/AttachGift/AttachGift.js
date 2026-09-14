import '../../ui/AttachGift/AttachGift.css';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Icon16Gift, Icon16PaletteOutline, Icon16Smile, Icon16StickerSmileOutline, } from '@vkontakte/icons';
import { usePixelDensity, useBrowserEnv, useFeatureFlags, useViewer, } from '../../hooks/misc';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import { Link } from '../../ui/Link/Link';
import { AttachText } from '../../ui/AttachText/AttachText';
import { AttachGiftRandomStickerPackButtonsNew } from '../../ui/AttachGiftRandomStickerPackButtonsNew/AttachGiftRandomStickerPackButtonsNew';
import { AttachGiftForeignMessageButtons } from '../../ui/AttachGiftForeignMessageButtons/AttachGiftForeignMessageButtons';
import { AttachGiftButtons } from '../../ui/AttachGiftButtons/AttachGiftButtons';
import { Flex, Footnote, Subhead } from '@vkontakte/vkui';
import { GIFTS_RANDOM_STICKER_PACK_GIFT_ID } from '../../../core/config/config';
import { useLottie } from '@vkontakte-internal/rlottie';
import { useAppearance, } from '@vkontakte-internal/vkcom-kit';
import { LimitedGiftLayer } from '../../ui/LimitedGiftLayer/LimitedGiftLayer';
import { rarityIconMap } from './rarityIconMap';
import classNames from 'classnames';
function getGiftAnimation(gift, theme) {
    const url = (gift.animation?.sources.find((animationSource) => animationSource.theme === theme) ?? gift.animation?.sources?.[0])?.url || '';
    if (!url) {
        return url;
    }
    const { origin, host } = window.location;
    if (host === 'localhost') {
        return `${origin}/giftsProxy${new URL(url).pathname}`;
    }
    return url;
}
function getGiftBackground(gift, theme) {
    return (gift.backgrounds?.find((background) => background.theme === theme) ??
        gift.backgrounds?.[0]);
}
function getGiftBackgroundImage(backgroundItem, size) {
    if (!backgroundItem.image) {
        return undefined;
    }
    return (backgroundItem.image.sources.find((img) => img.width >= size * devicePixelRatio &&
        img.height >= size * devicePixelRatio) ??
        backgroundItem.image.sources.find((img) => img.width >= size && img.height >= size) ??
        backgroundItem.image.sources?.[backgroundItem.image.sources.length - 1]);
}
function getThumbSource(size, image) {
    return image.find((img) => img.width === size)?.url;
}
const checkImgComplete = (src) => {
    if (!src) {
        return false;
    }
    const img = new Image();
    img.src = src;
    return img.complete;
};
const BASE_SIZE = 208;
const ensureUserId = (peerId) => Peer.isUserPeerId(peerId) ? peerId : undefined;
export const AttachGift = ({ message, gift, isContrastTheme = false, children, }) => {
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const isDense = usePixelDensity();
    const picture = Attach.preview(gift, getExpectedWidth(isDense));
    const featureFlags = useFeatureFlags();
    const theme = useAppearance();
    const isLimitedGiftsEnabled = featureFlags.vas_limited_gifts;
    const isLimitedGift = isLimitedGiftsEnabled && !!gift.rarity;
    const animationUrl = getGiftAnimation(gift, theme);
    const backgroundItem = getGiftBackground(gift, theme);
    const backgroundImage = backgroundItem
        ? getGiftBackgroundImage(backgroundItem, BASE_SIZE)
        : undefined;
    const viewSize = BASE_SIZE;
    const imageSize = isLimitedGift ? BASE_SIZE - 32 : BASE_SIZE;
    const { lottieContainerRef, lottieLoaded, lottieError, lottieRendered } = useLottie({
        group: 'gift',
        width: imageSize,
        height: imageSize,
        loop: true,
        autoplay: true,
        upscale: true,
        name: animationUrl || '',
        animationUrl,
    });
    const isStatic = !lottieLoaded || !animationUrl || lottieError || !lottieRendered;
    const isRandomPackGift = gift.id === GIFTS_RANDOM_STICKER_PACK_GIFT_ID;
    const buttons = useMemo(() => {
        if (message.kind === 'Foreign') {
            return (React.createElement(AttachGiftForeignMessageButtons, { gift: gift, isContrastTheme: isContrastTheme }));
        }
        if (isRandomPackGift) {
            return (React.createElement(AttachGiftRandomStickerPackButtonsNew, { message: message, gift: gift }));
        }
        return React.createElement(AttachGiftButtons, { message: message, gift: gift });
    }, [isRandomPackGift, message, gift, isContrastTheme]);
    const getTextIcon = () => {
        if (gift.rarity) {
            return rarityIconMap[gift.rarity.type];
        }
        if (gift.isStickerStyle) {
            return React.createElement(Icon16PaletteOutline, null);
        }
        if (gift.isStickerPack || isRandomPackGift) {
            return React.createElement(Icon16StickerSmileOutline, null);
        }
        if (gift.type === 'image_status' || gift.type === 'image_status_pack') {
            return React.createElement(Icon16Smile, null);
        }
        return React.createElement(Icon16Gift, null);
    };
    const getGiftView = () => {
        return (React.createElement(Flex, { justify: "center", align: "center", style: {
                width: `${viewSize}px`,
                height: `${viewSize}px`,
            }, getRootRef: lottieContainerRef, className: "AttachGift__viewContainer" }, isStatic && (React.createElement("img", { src: picture?.url ?? '', width: imageSize, height: imageSize, alt: lang.use('me_attaches_gift'), className: "AttachGift__imageContainer", onLoad: handleImageLoaded, onError: handleImageLoaded }))));
    };
    // Загрузка статичного изображения
    const [isImageLoaded, setIsImageLoaded] = useState(() => {
        return checkImgComplete(picture?.url);
    });
    const handleImageLoaded = () => {
        setIsImageLoaded(true);
    };
    // Загрузка представления подарка – статичного изображения или анимации
    const [isViewLoaded, setIsViewLoaded] = useState(() => {
        return isImageLoaded;
    });
    const handleViewLoaded = () => {
        setIsViewLoaded(true);
    };
    useLayoutEffect(() => {
        if (!isViewLoaded && (!isStatic || isImageLoaded)) {
            handleViewLoaded();
        }
    }, [isViewLoaded, isStatic, isImageLoaded]);
    // Загрузка изображения для бэкграунда подарка (может быть не у всех подарков)
    const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(() => {
        return checkImgComplete(backgroundImage?.url);
    });
    const handleBackgroundLoad = () => {
        setIsBackgroundLoaded(true);
    };
    const isAssetsLoaded = isBackgroundLoaded && isViewLoaded;
    const linkToParams = useMemo(() => {
        if (isLimitedGift) {
            const giftLayout = {
                id: gift.id,
                thumb_48: getThumbSource(48, gift.image),
                thumb_96: getThumbSource(96, gift.image),
                thumb_256: getThumbSource(256, gift.image),
                thumb_512: getThumbSource(512, gift.image),
                background: gift.backgrounds,
                animation: gift.animation,
                rarity: gift.rarity,
            };
            if (message.kind === 'Foreign') {
                return {
                    kind: 'GiftDetailsProxyRoute',
                    giftId: gift.id,
                    peerId: message.peerId,
                    receiverId: undefined,
                    senderId: ensureUserId(message.authorId),
                    gift: giftLayout,
                };
            }
            return {
                kind: 'GiftDetailsProxyRoute',
                giftId: gift.id,
                peerId: message.peerId,
                receiverId: message.isOut ? ensureUserId(message.peerId) : viewer.id,
                senderId: message.isOut
                    ? ensureUserId(message.authorId)
                    : ensureUserId(message.peerId),
                gift: giftLayout,
            };
        }
        return { kind: 'AttachProxyRoute', attach: gift };
    }, [gift, message, isLimitedGift, viewer.id]);
    return (React.createElement(Flex, { direction: "column", gap: 8, justify: "center", align: "center" },
        React.createElement(Flex, { Component: Link, 
            // @ts-expect-error не кастятся пропсы Link
            to: linkToParams, className: classNames('AttachGift__view', {
                'AttachGift__view--limited': isLimitedGift,
            }), style: {
                background: !backgroundImage ? backgroundItem?.color : undefined,
                // Загружаем плавно только если есть изображение на бэкграунде
                opacity: isAssetsLoaded || !backgroundImage ? 1 : 0,
            } },
            backgroundImage && (React.createElement("img", { src: backgroundImage.url, style: {
                    width: BASE_SIZE,
                    height: BASE_SIZE,
                }, alt: "", onLoad: handleBackgroundLoad, onError: handleBackgroundLoad, className: "AttachGift__background" })),
            isLimitedGift ? (React.createElement(LimitedGiftLayer, { size: viewSize - 16, gift: gift, isReady: isAssetsLoaded }, getGiftView())) : (getGiftView())),
        React.createElement(Flex, { gap: 6 },
            getTextIcon(),
            React.createElement(Subhead, { inline: true },
                React.createElement(AttachText, { attach: gift }))),
        Boolean(children) && (React.createElement(Footnote, { className: "AttachGift__text" }, children)),
        buttons));
};
function getExpectedWidth(isDense) {
    return isDense && typeof window !== 'undefined'
        ? BASE_SIZE * (window.devicePixelRatio || 1)
        : BASE_SIZE;
}
//# sourceMappingURL=AttachGift.js.map