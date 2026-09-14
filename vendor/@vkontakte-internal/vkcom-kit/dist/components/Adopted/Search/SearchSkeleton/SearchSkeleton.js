import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useAdaptivity } from '@vkontakte/vkui';
import { Skeleton } from '../../../Skeleton/Skeleton';
import styles from './SearchSkeleton.module.css';
export const SearchSkeleton = ({ className, ...restProps }) => {
    const { sizeY } = useAdaptivity();
    return (_jsx("div", { className: classNames(styles.root, className), children: _jsx(Skeleton, { ...restProps, className: classNames(styles.search, sizeY === 'compact' && styles.searchCompact) }) }));
};
//# sourceMappingURL=SearchSkeleton.js.map