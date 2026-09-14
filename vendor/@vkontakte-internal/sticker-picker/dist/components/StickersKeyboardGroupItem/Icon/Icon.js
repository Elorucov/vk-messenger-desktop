import { jsx as _jsx } from "react/jsx-runtime";
import { Icon12PlayCircle } from '@vkontakte/icons';
import { isPopUpStickersEnabled } from '../../../utils/userEnv';
import styles from './Icon.module.css';
export const StickersKeyboardGroupItemIcon = ({ pack, ...props }) => {
    const { isPopup } = pack;
    let Icon;
    if (isPopup && isPopUpStickersEnabled()) {
        Icon = Icon12PlayCircle;
    }
    if (Icon) {
        return (_jsx("div", { className: styles.in, children: _jsx(Icon, { ...props }) }));
    }
    return null;
};
//# sourceMappingURL=Icon.js.map