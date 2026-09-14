import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { isInteractive as isInteractiveFn } from '../../../utils/isInteractive';
import { Tappable } from '../../Adopted';
import styles from './SnippetCard.module.css';
export const SnippetCard = ({ children, className, ...restProps }) => {
    const isInteractive = isInteractiveFn(restProps);
    const Component = isInteractive ? 'a' : undefined;
    return (_jsx(Tappable, { ...restProps, Component: Component, hasHover: isInteractive, hasActive: isInteractive, className: classNames(styles.container, className), children: children }));
};
//# sourceMappingURL=SnippetCard.js.map