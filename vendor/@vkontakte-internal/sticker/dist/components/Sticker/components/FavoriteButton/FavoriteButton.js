import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Icon20Favorite } from '@vkontakte/icons';
import styles from './FavoriteButton.module.css';
export function FavoriteButton({ active, className, ...props }) {
    return (_jsx(Icon20Favorite, { className: classNames(styles.favorite, {
            [styles.active]: active,
        }, className), ...props }));
}
//# sourceMappingURL=FavoriteButton.js.map