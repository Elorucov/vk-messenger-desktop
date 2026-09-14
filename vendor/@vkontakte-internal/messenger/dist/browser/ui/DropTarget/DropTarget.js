import '../../ui/DropTarget/DropTarget.css';
import React, { useMemo, useState } from 'react';
import { Icon56CameraOutline, Icon56DocumentOutline, Icon56VideocamOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import cx from 'classnames';
export const DropTarget = ({ type, isCompressed = false, onDrop, }) => {
    const { lang } = useBrowserEnv();
    const [isHovered, setHovered] = useState(false);
    const { title, text, icon } = useMemo(() => {
        switch (type) {
            case 'image':
                return isCompressed
                    ? {
                        title: lang.use('me_drop_here_quick_way'),
                        text: lang.use('me_drop_here_photos'),
                        icon: React.createElement(Icon56CameraOutline, null),
                    }
                    : {
                        title: lang.use('me_drop_here_without_compression'),
                        text: lang.use('me_drop_here_photos_as_doc'),
                        icon: React.createElement(Icon56DocumentOutline, null),
                    };
            case 'video':
                return isCompressed
                    ? {
                        title: lang.use('me_drop_here_quick_way'),
                        text: lang.use('me_drop_here_videos'),
                        icon: React.createElement(Icon56VideocamOutline, null),
                    }
                    : {
                        title: lang.use('me_drop_here_without_compression'),
                        text: lang.use('me_drop_here_videos_as_doc'),
                        icon: React.createElement(Icon56DocumentOutline, null),
                    };
            case 'audio':
            case 'doc':
                return {
                    title: lang.use('me_drop_here_without_compression'),
                    text: lang.use('me_drop_here_doc'),
                    icon: React.createElement(Icon56DocumentOutline, null),
                };
            case 'mixed':
                return isCompressed
                    ? {
                        title: lang.use('me_drop_here_quick_way'),
                        text: lang.use('me_drop_here_media'),
                        icon: React.createElement(Icon56CameraOutline, null),
                    }
                    : {
                        title: lang.use('me_drop_here_without_compression'),
                        text: lang.use('me_drop_here_doc'),
                        icon: React.createElement(Icon56DocumentOutline, null),
                    };
            default:
                exhaustivenessCheck(type);
        }
    }, [type, isCompressed, lang]);
    return (React.createElement("div", { className: cx('DropTarget', {
            'DropTarget--hovered': isHovered,
        }), onDrop: onDrop, onDragEnter: () => setHovered(true), onDragLeave: () => setHovered(false) },
        React.createElement("div", { className: "DropTarget__border" },
            React.createElement("svg", { width: "100%", height: "100%", xmlns: "http://www.w3.org/2000/svg", preserveAspectRatio: "none" },
                React.createElement("rect", { x: "0", y: "0", rx: "8px", ry: "8px", width: "100%", height: "100%" }))),
        React.createElement("div", { className: "DropTarget__area" },
            React.createElement("i", { role: "img", className: "DropTarget__icon" }, icon),
            React.createElement("div", { className: "DropTarget__info" },
                React.createElement("span", { className: "DropTarget__infoTitle" }, title),
                React.createElement("span", { className: "DropTarget__infoText" }, text)))));
};
//# sourceMappingURL=DropTarget.js.map