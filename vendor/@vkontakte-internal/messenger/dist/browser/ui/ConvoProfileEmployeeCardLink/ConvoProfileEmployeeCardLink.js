import React from 'react';
import cx from 'classnames';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { Icon20UserSquareOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/ConvoProfileEmployeeCardLink/ConvoProfileEmployeeCardLink.css';
import * as Attach from '../../../core/model/Attach';
import { Link } from '../../ui/Link/Link';
import { EMPLOYEE_CARD_MINI_APP_ID } from '../../../core/config/config';
/**
 * Ссылка на карточку сотрудника
 */
export const ConvoProfileEmployeeCardLink = ({ peerId, className }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(InfoCell, { left: React.createElement("div", { className: "ConvoProfileEmployeeCardLink__icon" },
            React.createElement(Icon20UserSquareOutline, null)), className: cx('ConvoProfileEmployeeCardLink', className) },
        React.createElement(Link, { className: "ConvoProfileEmployeeCardLink__link", to: {
                kind: 'MiniAppModal',
                miniAppId: Attach.resolveMiniAppId(EMPLOYEE_CARD_MINI_APP_ID),
                hash: `user_id=${peerId}`,
            } }, lang.use('me_employees_open_employee_card'))));
};
//# sourceMappingURL=ConvoProfileEmployeeCardLink.js.map