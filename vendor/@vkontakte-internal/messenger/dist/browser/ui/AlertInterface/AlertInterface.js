import '../../ui/AlertInterface/AlertInterface.css';
import React from 'react';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { Alert as VKUIAlert, } from '@vkontakte/vkui';
/**
 * Обёртка в `ModalView` для компонента `Alert` из VK UI. Альтернатива
 * `ModalInterface`.
 */
export const AlertInterface = ({ onClose, contextClass, portalTarget, isHidden, hasClearBackdrop, description, descriptionClass, stopPropagation, ...alertProps }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { onEscape: onClose, contextClass: contextClass, portalTarget: portalTarget, isHidden: isHidden },
        React.createElement(ModalBackdrop, { onClick: onClose, isClear: hasClearBackdrop, stopPropagation: stopPropagation },
            React.createElement(VKUIAlert, { dismissLabel: lang.use('me_close'), ...alertProps, onClose: onClose, description: React.createElement("div", { className: cx('AlertInterface__text', descriptionClass) }, description) }))));
};
//# sourceMappingURL=AlertInterface.js.map