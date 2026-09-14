import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2,"style":3}]} */
import { createRef, Component, Children, } from 'react';
import Spinner from '../Spinner/Spinner';
import { throttle, classNames as cx } from '@vkontakte/vkjs';
// Бесконечный скролл и виртуализированный список.
export default class InfiniteScroll extends Component {
    constructor(props) {
        super(props);
        this.container = null;
        this.intersectionObserver = null;
        this.loading = false;
        this.checkLoad = throttle(async (scrollData) => {
            const [scrollTop, scrollHeight, clientHeight] = scrollData;
            if (this.loading) {
                return;
            }
            if (!this.props.virtualized && !this.props.hasMore) {
                if (this.props.onScroll) {
                    return;
                }
                return this.detachListeners();
            }
            if (scrollHeight - scrollTop - clientHeight <= this.getPropsWithDefault().threshold) {
                this.loading = true;
                await this.props.loadMore();
                this.loading = false;
            }
        }, 34);
        this.onScroll = (event) => {
            const scrollData = this.getScrollData();
            if (this.props.onScroll) {
                this.props.onScroll(event);
            }
            if (this.props.virtualized) {
                this.processChildren(this.props.children, scrollData);
            }
            if (this.props.hasMore) {
                this.checkLoad(scrollData);
            }
        };
        this.applyObserver = (ref) => {
            if (!this.props.useIntersectionObserver) {
                return;
            }
            if (!this.intersectionObserver) {
                this.intersectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(async (entry) => {
                        if (entry.isIntersecting && !this.loading) {
                            this.loading = true;
                            await this.props.loadMore();
                            this.loading = false;
                        }
                    });
                });
            }
            if (this.spinnerRef.current) {
                this.intersectionObserver.unobserve(this.spinnerRef.current);
            }
            this.spinnerRef.current = ref;
            if (this.spinnerRef.current) {
                this.intersectionObserver.observe(this.spinnerRef.current);
            }
        };
        this.getRef = (container) => {
            this.container = container;
            if (this.props.virtualized) {
                this.setState(this.getChildrenData(this.props.children, this.getScrollData()));
            }
        };
        this.getPropsWithDefault = () => ({ ...InfiniteScroll.defaultProps, ...this.props });
        this.useWindowScroll = props.useWindowScroll;
        if (props.virtualized) {
            this.state = {
                before: 0,
                after: Children.count(props.children),
                start: 0,
                end: 0,
            };
        }
        this.spinnerRef = createRef();
    }
    static { this.defaultProps = {
        className: '',
        hasMore: true,
        itemHeight: 55,
        threshold: 100,
        useCapture: false,
        useWindowScroll: false,
        virtualized: false,
    }; }
    getScrollData() {
        const el = this.useWindowScroll ? document.documentElement : this.container;
        return [this.getScrollTop(), el ? el.scrollHeight : 0, el ? el.clientHeight : 0];
    }
    getScrollTop() {
        const doc = document.documentElement || document.body.parentNode || document.body;
        if (this.useWindowScroll) {
            return window.pageYOffset !== undefined ? window.pageYOffset : doc.scrollTop;
        }
        if (this.container) {
            return this.container.scrollTop;
        }
        return 0;
    }
    attachListeners() {
        const scrollContainer = this.useWindowScroll ? window : this.container;
        if (this.container) {
            scrollContainer?.addEventListener('scroll', this.onScroll, this.props.useCapture);
            scrollContainer?.addEventListener('resize', this.onScroll, this.props.useCapture);
        }
    }
    detachListeners() {
        const scrollContainer = this.useWindowScroll ? window : this.container;
        if (this.container) {
            scrollContainer?.removeEventListener('scroll', this.onScroll, this.props.useCapture);
            scrollContainer?.removeEventListener('resize', this.onScroll, this.props.useCapture);
        }
    }
    processChildren(children, scrollData) {
        const s = this.state;
        const newState = this.getChildrenData(children, scrollData ?? this.getScrollData());
        const { start, end, before, after } = newState;
        if (start !== s.start || end !== s.end || before !== s.before || after !== s.after) {
            this.setState(newState);
        }
    }
    getScrollContainerHeight(scrollContainer) {
        if (!scrollContainer) {
            return null;
        }
        return this.useWindowScroll || scrollContainer instanceof Window
            ? window.innerHeight
            : scrollContainer.offsetHeight;
    }
    getChildrenData(children, [scrollTop, scrollHeight, clientHeight]) {
        const scrollContainer = this.useWindowScroll ? window : this.container;
        const scrollContainerHeight = this.getScrollContainerHeight(scrollContainer);
        const len = Children.count(children);
        if (!scrollContainer || scrollHeight === 0 || clientHeight === 0) {
            return {
                start: 0,
                end: 0,
                before: 0,
                after: len,
            };
        }
        clientHeight = Math.max(clientHeight, scrollContainerHeight || 0);
        const itemHeight = this.getPropsWithDefault().itemHeight;
        const start = Math.max(Math.floor(scrollTop / itemHeight) - 1, 0);
        const end = Math.min(Math.floor((scrollTop + 2 * clientHeight) / itemHeight + 1), len);
        const res = {
            start,
            end,
            before: start,
            after: len - end,
        };
        return res;
    }
    // TODO: [Fix me] Don't use deprecated React methods
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.virtualized) {
            this.processChildren(nextProps.children);
        }
    }
    componentDidMount() {
        if (this.props.useIntersectionObserver) {
            return;
        }
        this.attachListeners();
    }
    componentWillUnmount() {
        this.detachListeners();
    }
    render() {
        const { children, className, hasMore, itemHeight, loader, spinnerColor, style, virtualized } = this.getPropsWithDefault();
        return (_jsxs("div", { className: cx('InfiniteScroll', className), ref: this.getRef, style: style, children: [virtualized && this.state.before > 0 && (_jsx("div", { style: { height: this.state.before * itemHeight } }, "before")), this.props.virtualized
                    ? [].concat(children).slice(this.state.start, this.state.end)
                    : this.props.children, this.props.virtualized && this.state.after > 0 && (_jsx("div", { style: { height: this.state.after * itemHeight } }, "after")), hasMore &&
                    (loader || (_jsx("div", { ref: this.applyObserver, className: "InfiniteScroll__loader", children: _jsx(Spinner, { color: spinnerColor }) }, "loader")))] }));
    }
}
//# sourceMappingURL=InfiniteScroll.js.map