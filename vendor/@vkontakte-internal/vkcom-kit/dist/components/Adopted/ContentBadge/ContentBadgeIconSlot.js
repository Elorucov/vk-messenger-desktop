import { jsx as _jsx } from "react/jsx-runtime";
import { useContentBadgeContext } from './ContentBadgeContext';
import styles from './ContentBadgeIconSlot.module.css';
const iconsClassNames = {
    s: undefined,
    m: styles.rootSizeM,
    l: styles.rootSizeL,
};
const singleIconClassNames = {
    s: undefined,
    m: styles.rootSingleIconSizeM,
    l: styles.rootSingleIconSizeL,
};
export const ContentBadgeIconSlot = ({ getRootRef, children, }) => {
    const { size, isSingleChild } = useContentBadgeContext();
    if (size === 's') {
        return null;
    }
    return (_jsx("div", { ref: getRootRef, className: isSingleChild ? singleIconClassNames[size] : iconsClassNames[size], children: children }));
};
//# sourceMappingURL=ContentBadgeIconSlot.js.map