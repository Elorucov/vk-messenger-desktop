import '../../ui/FoldersViewSettings/FoldersViewSettingsSkeleton.css';
import React from 'react';
import { useColorScheme, classNames as cx } from '@vkontakte/vkui';
export const FoldersViewSettingsSkeleton = ({ mode, itemsOnly = false, blinking = false }) => {
    const theme = useColorScheme();
    const rows = [...Array(mode === 'vertical' ? 2 : 1)];
    const folders = [...Array(mode === 'vertical' ? 2 : 3)];
    const titleWidth = mode === 'vertical' ? 86 : 146;
    const contentWidth = mode === 'vertical' ? 56 : 82;
    return (React.createElement("div", { className: cx(`FoldersViewSettingsSkeleton`, `FoldersViewSettingsSkeleton--${theme}`, `FoldersViewSettingsSkeleton--${mode}`, {
            'FoldersViewSettingsSkeleton--blinking': blinking,
        }) },
        itemsOnly ? null : (React.createElement("div", { className: "FoldersViewSettingsSkeleton__folders" }, folders.map((f, i) => (React.createElement(FolderSkeletonItem, { key: i, width: 32, height: mode === 'vertical' ? 32 : 8, bg: "vkui--color_background_accent" }))))),
        React.createElement("div", { className: "FoldersViewSettingsSkeleton__items" }, rows.map((o, i) => (React.createElement("div", { className: "FoldersViewSettingsSkeleton__item", key: i },
            React.createElement("div", { className: "FoldersViewSettingsSkeleton__itemAvatar" },
                React.createElement(FolderSkeletonItem, { width: 40, height: 40 })),
            React.createElement("div", { className: "FoldersViewSettingsSkeleton__itemContent" },
                React.createElement(FolderSkeletonItem, { width: titleWidth, height: 8 }),
                React.createElement(FolderSkeletonItem, { width: contentWidth, height: 8 }))))))));
};
const FolderSkeletonItem = ({ width, height, bg }) => {
    return (React.createElement("div", { className: "FoldersViewSettingsSkeleton__row", style: {
            width: `${width}px`,
            height: `${height}px`,
            background: bg ? `var(--${bg})` : undefined,
            borderRadius: `${height}px`,
        } }));
};
//# sourceMappingURL=FoldersViewSettingsSkeleton.js.map