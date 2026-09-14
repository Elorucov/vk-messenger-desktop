import '../../ui/AttachWallHistory/AttachWallHistory.css';
import React from 'react';
import { Icon20ArticleOutline } from '@vkontakte/icons';
import { OpenPostButton } from '../../ui/AttachWall/AttachWall';
export const AttachWallHistory = ({ wallHistory, title, meta, }) => {
    return (React.createElement(OpenPostButton, { className: "AttachWallHistory", attach: wallHistory },
        React.createElement("figure", { className: "AttachWallHistory__icon" },
            React.createElement(Icon20ArticleOutline, null)),
        React.createElement("div", { className: "AttachWallHistory__title" }, title),
        React.createElement("div", { className: "AttachWallHistory__meta" }, meta)));
};
//# sourceMappingURL=AttachWallHistory.js.map