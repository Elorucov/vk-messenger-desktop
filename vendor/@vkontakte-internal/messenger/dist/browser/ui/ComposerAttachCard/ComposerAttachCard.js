import '../../ui/ComposerAttachCard/ComposerAttachCard.css';
import React from 'react';
import cx from 'classnames';
import { Icon24DocumentOutline, Icon24SongOutline } from '@vkontakte/icons';
export const ComposerAttachCardIcon = ({ icon }) => {
    return React.createElement("div", { className: "ComposerAttachCardIcon" }, icon);
};
export const ComposerFileAttachCardIcon = ({ ext }) => {
    const extClass = getExtensionClass(ext);
    return (React.createElement("div", { className: cx('ComposerAttachCardIcon', {
            [`ComposerAttachCardIcon--${extClass}`]: extClass,
        }), "data-ext": ext.toUpperCase() }, isAudio(ext) ? React.createElement(Icon24SongOutline, null) : React.createElement(Icon24DocumentOutline, null)));
};
export const ComposerAttachCard = ({ icon, main, secondary, isCompactView, }) => {
    return (React.createElement("div", { className: "ComposerAttachCard" },
        React.createElement("figure", { className: "ComposerAttachCard__icon" }, icon),
        React.createElement("div", { className: "ComposerAttachCard__text" },
            React.createElement("span", { className: cx('ComposerAttachCard__main', {
                    'ComposerAttachCard--overflow': isCompactView,
                    'ComposerAttachCard--overflowEllipsis': !isCompactView,
                }) }, main),
            React.createElement("span", { className: cx('ComposerAttachCard__secondary', {
                    'ComposerAttachCard--overflow': isCompactView,
                    'ComposerAttachCard--overflowEllipsis': !isCompactView,
                }) }, secondary))));
};
function getExtensionClass(ext) {
    switch (true) {
        case ext === 'pdf':
        case ext === 'css':
        case ext === 'html':
            return ext;
        case /^xlsx?$/.test(ext):
            return 'xls';
        case /^docx?$/.test(ext):
            return 'doc';
        case /^ppt[xm]?$/.test(ext):
            return 'ppt';
        default:
            return null;
    }
}
function isAudio(ext) {
    return [
        'audio',
        'aac',
        'fla',
        'flac',
        'mid',
        'midi',
        'ogg',
        'wav',
        'wave',
        'wma',
        'mp3',
    ].includes(ext);
}
//# sourceMappingURL=ComposerAttachCard.js.map