import React from 'react';
import { HorizontalScroll } from '../../ui/HorizontalScroll/HorizontalScroll';
import { BotTemplateControls } from '../../ui/BotTemplateControls/BotTemplateControls';
import '../../ui/BotTemplateControls/BotTemplateList.css';
import cx from 'classnames';
export const BotTemplateList = ({ elements, onClick, onCallbackButtonClick, authorId, cmid, isCompact, }) => {
    return (React.createElement("div", { className: cx('BotTemplateList', {
            'BotTemplateList--compact': isCompact,
        }), onClick: (e) => e.stopPropagation() },
        React.createElement(HorizontalScroll, { showArrows: true, showLeftBorder: true, showRightBorder: !isCompact, arrowScrollStep: 260, arrowSize: "s", bordersColor: "secondary" },
            React.createElement("div", { className: "BotTemplateList__wrapper" }, elements.map((element, id) => (React.createElement("div", { className: "BotTemplateList__item", key: id },
                React.createElement(BotTemplateControls, { authorId: authorId, cmid: cmid, template: element, onClick: onClick, onCallbackButtonClick: onCallbackButtonClick }))))))));
};
//# sourceMappingURL=BotTemplateList.js.map