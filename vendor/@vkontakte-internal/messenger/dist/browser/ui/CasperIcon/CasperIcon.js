import { Icon16Ghost } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/CasperIcon/CasperIcon.css';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import cx from 'classnames';
import React from 'react';
export const CasperIcon = ({ className, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('CasperIcon__container', className) },
        React.createElement(Tooltip, { content: React.createElement("span", { className: "CasperIcon__tooltip" }, lang.use('me_casper_chat_info')), position: "top", align: "center" },
            React.createElement("span", { className: "CasperIcon__icon" },
                React.createElement(Icon16Ghost, null)))));
};
//# sourceMappingURL=CasperIcon.js.map