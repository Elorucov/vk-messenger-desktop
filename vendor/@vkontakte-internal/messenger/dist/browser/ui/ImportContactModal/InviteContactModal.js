import React, { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@vkontakte/vkui';
import cx from 'classnames';
import { VKME_APP_INSTALL_LINK } from '../../../core/config/config';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { CopyText } from '../../ui/CopyText/CopyText';
import '../../ui/ImportContactModal/InviteContactModal.css';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
const HAS_COPIED_BLINK_DURATION = 2000;
/**
 * Модалка, предлагающая пригласить пользователя в VK ME, если он не был
 * найден в ВК по номеру телефона.
 */
export const InviteContactModal = ({ contactPhone, onClose, onBack }) => {
    const { lang } = useBrowserEnv();
    const [hasCopied, setHasCopied] = useState(false);
    const hasCopiedNotifyTimeout = useRef(null);
    const onCopy = () => {
        setHasCopied(true);
        if (hasCopiedNotifyTimeout.current) {
            clearTimeout(hasCopiedNotifyTimeout.current);
        }
        hasCopiedNotifyTimeout.current = setTimeout(() => setHasCopied(false), HAS_COPIED_BLINK_DURATION);
    };
    useEffect(() => {
        return () => {
            if (hasCopiedNotifyTimeout.current) {
                clearTimeout(hasCopiedNotifyTimeout.current);
            }
        };
    }, []);
    const { isMobileLayout } = useLayoutData();
    const isModalFullScreen = isMobileLayout;
    return (React.createElement(ModalInterface, { title: lang.use('me_contacts_invite_modal_title'), closeLabel: lang.use('me_close'), onClose: onClose, contextClass: 'MEConfig', backLabel: lang.use('me_back'), onBack: onBack, withCustomLayout: true },
        React.createElement("div", { className: cx('InviteContactModal', {
                'InviteContactModal--fullScreen': isModalFullScreen,
            }) },
            React.createElement("div", { className: "InviteContactModal__textWrapper" },
                React.createElement("p", { className: "InviteContactModal__text" },
                    React.createElement(FormattedLangKey, { langkey: "me_contacts_invite_modal_user_not_found", values: {
                            phone: (React.createElement("span", { className: "InviteContactModal__phone" }, contactPhone)),
                        } })),
                React.createElement("p", { className: "InviteContactModal__text" }, lang.use('me_contacts_invite_modal_app_promo'))),
            React.createElement(Input, { className: "InviteContactModal__linkBox", value: VKME_APP_INSTALL_LINK, readOnly: true, autoFocus: true, type: "text" }),
            React.createElement("div", { className: "InviteContactModal__linkCopyWrapper" },
                React.createElement(CopyText, { onCopyDone: onCopy, text: VKME_APP_INSTALL_LINK },
                    React.createElement(Button, { mode: "secondary", size: "m" }, lang.use('me_contacts_invite_modal_link_copy'))),
                React.createElement("span", { className: cx('InviteContactModal__linkCopyNotice', {
                        'InviteContactModal__linkCopyNotice--blink': hasCopied,
                    }) }, lang.use('me_contacts_invite_modal_link_copied'))))));
};
//# sourceMappingURL=InviteContactModal.js.map