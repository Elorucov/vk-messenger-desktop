import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUICalendar":["@vkontakte/vkui",{"className":1}]} */
// TODO [@vkontakte/vkui@>=8.0.0]: Удалить когда проп добавят
import { classNames } from '@vkontakte/vkjs';
import { Calendar as VKUICalendar } from '@vkontakte/vkui';
import styles from './Calendar.module.css';
const doneButtonModesMap = {
    primary: styles.rootWithPrimaryButton,
    secondary: undefined,
};
export const Calendar = ({ doneButtonMode, className, onClose, onDoneButtonClick, ...restProps }) => {
    return (_jsx(VKUICalendar, { ...restProps, className: classNames(doneButtonMode && doneButtonModesMap[doneButtonMode], className), onDoneButtonClick: onClose || onDoneButtonClick }));
};
//# sourceMappingURL=Calendar.js.map