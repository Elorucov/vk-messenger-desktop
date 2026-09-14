import '../../ui/UsersStack/UsersStack.css';
import React, { useRef } from 'react';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
import { nanoid } from 'nanoid';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
export const UsersStack = ({ photos, size = 24, className, count, visibleCount = 3, children, }) => {
    const { lang } = useBrowserEnv();
    const uid = useRef(nanoid(5));
    if (photos.length === 0) {
        return null;
    }
    const displayCount = Math.max(0, count - visibleCount);
    const pathId = `meUsersStack${size}`;
    const clipPathUid = `${pathId}${uid.current}`;
    const clipPath = `url(#${clipPathUid})`;
    return (React.createElement("div", { className: cx('UsersStack', className), style: { '--usersStackItemSize': `${size}px` } },
        photos.slice(0, visibleCount).map((picture, index) => (React.createElement(BasicAvatar, { size: size, content: "", picture: picture, alt: "", key: index, className: "UsersStack__userItem", style: {
                clipPath: displayCount >= 1 || index !== 0 ? clipPath : undefined,
            } }))),
        displayCount >= 1 && (React.createElement("div", { className: "UsersStack__counter" },
            "+",
            lang.formatNumber(displayCount, 'short'))),
        children && React.createElement("span", { className: "UsersStack__rightText" }, children),
        React.createElement("svg", { className: "UsersStack__userItemSvg" },
            React.createElement("clipPath", { id: clipPathUid },
                React.createElement("use", { href: `#${pathId}`, style: displayCount < 1
                        ? {
                            transform: `scaleX(-1) translateX(-${size}px)`,
                        }
                        : undefined })))));
};
//# sourceMappingURL=UsersStack.js.map