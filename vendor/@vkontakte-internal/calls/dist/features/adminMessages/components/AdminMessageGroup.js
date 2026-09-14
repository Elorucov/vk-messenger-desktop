import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { AdminMessage } from './AdminMessage';
import styles from './AdminMessageGroup.module.css';
export const AdminMessageGroup = ({ isStandalone, messages, onClose, }) => {
    return (_jsx("div", { className: classNames(styles.container, { [styles.standalone]: isStandalone }), children: messages.map((message) => (_jsx(AdminMessage, { message: message, onClose: onClose }, `${message.timeReceived}${message.text}`))) }));
};
//# sourceMappingURL=AdminMessageGroup.js.map