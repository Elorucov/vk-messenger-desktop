import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUISearch":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Search as VKUISearch } from '@vkontakte/vkui';
import { SearchSkeleton } from './SearchSkeleton/SearchSkeleton';
import styles from './Search.module.css';
const modeModifiersMap = {
    default: undefined,
    outline: styles.rootModeOutline,
    transparent: styles.rootModeTransparent,
};
const SearchComponent = ({ className, mode = 'default', ...restProps }) => {
    return _jsx(VKUISearch, { ...restProps, className: classNames(modeModifiersMap[mode], className) });
};
export const Search = Object.assign(SearchComponent, VKUISearch, {
    Skeleton: SearchSkeleton,
});
//# sourceMappingURL=Search.js.map