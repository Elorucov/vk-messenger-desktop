import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { createContext, Component } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
export const ScrollContext = createContext({
    createScroll: () => ({
        update: () => { },
        destroy: () => { },
    }),
});
export class Scroll extends Component {
    constructor() {
        super(...arguments);
        this.getWrapperRef = (el) => {
            this.wrapper = el;
        };
    }
    static { this.contextType = ScrollContext; }
    static { this.defaultProps = {
        isNative: false,
        isShadows: false,
        neverHide: false,
    }; }
    componentDidMount() {
        const { isNative, isShadows, neverHide, onScroll } = this.props;
        if (this.wrapper && !this.scroller && this.context && this.context.createScroll) {
            this.scroller = this.context.createScroll(this.wrapper, {
                shadows: isShadows,
                nativeScroll: isNative,
                hidden: !neverHide,
                onScroll,
            });
        }
    }
    componentDidUpdate() {
        if (this.scroller) {
            this.scroller.update();
        }
    }
    componentWillUnmount() {
        if (this.scroller) {
            this.scroller.destroy();
            this.scroller = undefined;
        }
    }
    render() {
        const { children, isNative, isShadows, neverHide, className = '', ...props } = this.props;
        return (_jsx("div", { ...props, className: cx('Scroll', className), ref: this.getWrapperRef, children: children }));
    }
}
//# sourceMappingURL=Scroll.js.map