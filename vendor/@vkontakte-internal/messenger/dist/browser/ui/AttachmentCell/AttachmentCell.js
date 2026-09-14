import { Button, Footnote, Headline } from '@vkontakte/vkui';
import '../../ui/AttachmentCell/AttachmentCell.css';
import React, { useCallback } from 'react';
import { PhotoItem } from '../../ui/PhotoItem/PhotoItem';
import cx from 'classnames';
export const AttachmentCell = ({ className, isAvailable = true, isClickable, isOut = false, isInBubble = false, title, subtitle, image, onClick, imageShape = 'square', icon, alt, imageDetailRightBottom: imageDetailLeftBottom, buttonRight, additionalBlock, }) => {
    isClickable = isClickable === undefined ? !buttonRight : isClickable;
    const getImageBlock = useCallback(() => {
        const photoItemSize = imageShape === 'roundWithBorder'
            ? 'calc(var(--attachmentCellImageHeight) - 5px)'
            : 'var(--attachmentCellImageHeight)';
        return (React.createElement("div", { className: cx('AttachmentCell__imageBlockContainer', {
                'AttachmentCell__imageBlockContainer--inOutBubble': isInBubble && isOut,
                'AttachmentCell__imageBlockContainer--roundWithBorder': imageShape === 'roundWithBorder',
                'AttachmentCell__imageBlockContainer--round': imageShape === 'round',
                'AttachmentCell__imageBlockContainer--square': imageShape === 'square',
            }) },
            React.createElement("div", { className: "AttachmentCell__imageBlockBackground" }),
            React.createElement("div", { className: cx('AttachmentCell__imageBlock') }, typeof image === 'string' ? (React.createElement(PhotoItem, { className: "AttachmentCell__photoItem", src: image, height: photoItemSize, width: photoItemSize, alt: alt, cover: true })) : (image)),
            icon && (React.createElement("div", { className: cx('AttachmentCell__icon', {
                    'AttachmentCell__icon--withImage': image,
                    'AttachmentCell__icon--roundWithBorder': imageShape === 'roundWithBorder',
                    'AttachmentCell__icon--round': imageShape === 'round',
                    'AttachmentCell__icon--square': imageShape === 'square',
                }) }, icon)),
            imageDetailLeftBottom && (React.createElement("div", { className: "AttachmentCell__imageDetailLeftBottom" }, imageDetailLeftBottom))));
    }, [imageShape, isInBubble, isOut, image, alt, icon, imageDetailLeftBottom]);
    const getSubtitle = useCallback(() => {
        if (Array.isArray(subtitle)) {
            return `${subtitle[0]} ᐧ ${subtitle[1]}`;
        }
        return subtitle;
    }, [subtitle]);
    return (React.createElement("div", { className: cx(className, 'AttachmentCell', {
            'AttachmentCell--withButton': buttonRight,
            'AttachmentCell--clickable': isClickable,
        }), onClick: onClick },
        getImageBlock(),
        React.createElement("div", { className: "AttachmentCell__infoBlockContainer" },
            React.createElement("div", { className: "AttachmentCell__infoBlock" }, isAvailable ? (React.createElement(React.Fragment, null,
                React.createElement(Headline, { level: "1", weight: "3", className: "AttachmentCell__headline", useAccentWeight: true }, title),
                React.createElement(Footnote, { className: cx('AttachmentCell__footnote', {
                        'AttachmentCell__footnote--inOutBubble': isInBubble && isOut,
                    }) }, getSubtitle()))) : (React.createElement(Headline, { level: "1", weight: "3", className: "AttachmentCell__headline AttachmentCell__headline--unavailable", useAccentWeight: true }, title))),
            additionalBlock && (React.createElement("div", { className: "AttachmentCell_additionalBlockContainer" }, additionalBlock))),
        buttonRight && (React.createElement("div", { className: "AttachmentCell_buttonContainer" }, buttonRight))));
};
export const AttachmentCellButton = (props) => (React.createElement(Button, { size: "s", mode: "primary", ...props }, props.children));
//# sourceMappingURL=AttachmentCell.js.map