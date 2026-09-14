import { Icon28BlockOutline, Icon28CancelCircleOutline, Icon28DeleteOutline, Icon28HideOutline, Icon28InfoOutline, Icon28LockOutline, Icon28ReceiptOutline, Icon56BlockOutline, Icon56CancelCircleOutline, Icon56DeleteOutline, Icon56HideOutline, Icon56InfoOutline, Icon56LockOutline, Icon56RecentOutline, } from '@vkontakte/icons';
import React from 'react';
export const RestrictionIcon = ({ name, disclaimerType, small }) => {
    const icons = getIcon(name, disclaimerType);
    return icons[small ? 0 : 1];
};
function getIcon(name, disclaimerType) {
    switch (name) {
        case 'hide_outline':
            return [React.createElement(Icon28HideOutline, null), React.createElement(Icon56HideOutline, null)];
        case 'recent_outline':
            return [React.createElement(Icon28ReceiptOutline, null), React.createElement(Icon56RecentOutline, null)];
        case 'delete_outline':
            return [React.createElement(Icon28DeleteOutline, null), React.createElement(Icon56DeleteOutline, null)];
        case 'info_outline':
            return [React.createElement(Icon28InfoOutline, null), React.createElement(Icon56InfoOutline, null)];
        case 'lock_outline':
            return [React.createElement(Icon28LockOutline, null), React.createElement(Icon56LockOutline, null)];
        case 'cancel_circle_outline':
            return [React.createElement(Icon28CancelCircleOutline, null), React.createElement(Icon56CancelCircleOutline, null)];
        case 'do_not_disturb_outline':
            return [React.createElement(Icon28BlockOutline, null), React.createElement(Icon56BlockOutline, null)];
        default:
            break;
    }
    switch (disclaimerType) {
        case -3: // Потенциально спорный контент. Изображение может считаться недопустимым по законодательству РФ
        case 3:
        case 4: // Эта фотография может показаться оскорбительной или быть неприятной для просмотра
        case 6: // Изображение может считаться недопустимым для лиц младше 18 лет
            return [React.createElement(Icon28HideOutline, null), React.createElement(Icon56HideOutline, null)];
        case 1:
        case 2:
            return [React.createElement(Icon28BlockOutline, null), React.createElement(Icon56BlockOutline, null)];
        default:
            break;
    }
    return [React.createElement(Icon28BlockOutline, null), React.createElement(Icon56BlockOutline, null)];
}
//# sourceMappingURL=RestrictionIcon.js.map