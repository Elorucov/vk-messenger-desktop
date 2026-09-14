import React from 'react';
import { FieldGroup } from '../../ui/FieldGroup/FieldGroup';
import { Icon20NotificationOutline } from '@vkontakte/icons';
import cx from 'classnames';
import './InformationBanner.css';
export const InformationBanner = ({ type = 'primary', title, subtitle, icon = React.createElement(Icon20NotificationOutline, null), action, }) => {
    return (React.createElement(FieldGroup, null,
        React.createElement("div", { className: "InformationBanner__container" },
            React.createElement("div", { className: cx('InformationBanner__icon', {
                    'InformationBanner__icon--primary': type === 'primary',
                    'InformationBanner__icon--danger': type === 'danger',
                }) }, icon),
            React.createElement("div", { className: "InformationBanner__content" },
                React.createElement("div", { className: "InformationBanner__text" },
                    React.createElement("div", { className: "InformationBanner__title" }, title),
                    React.createElement("div", { className: "InformationBanner__subtitle" }, subtitle)),
                React.createElement("div", { className: "InformationBanner__action" }, action)))));
};
//# sourceMappingURL=InformationBanner.js.map