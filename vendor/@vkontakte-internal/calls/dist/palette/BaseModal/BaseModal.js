import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}]} */
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { classNames as cx } from '@vkontakte/vkjs';
export class BaseModal extends Component {
    constructor() {
        super(...arguments);
        this._bodyHiddenOverflowClass = '';
        this._scrollbarMeasureClass = '';
        this.calculatedPadding = '0';
        // Метод от d.walsh
        this.getScrollbarWidth = () => {
            const scrollDiv = document.createElement('div');
            scrollDiv.classList.add(this._scrollbarMeasureClass);
            document.body.appendChild(scrollDiv);
            const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        };
        // Подрезал у бутстрапа
        this.hideScrollBar = () => {
            const rect = document.body.getBoundingClientRect();
            const isBodyOverflowing = rect.left + rect.right < window.innerWidth;
            const scrollbarWidth = this.getScrollbarWidth();
            this.calculatedPadding = window.getComputedStyle(document.body).paddingRight;
            if (isBodyOverflowing) {
                document.body.style.paddingRight = `${parseFloat(this.calculatedPadding) + scrollbarWidth}px`;
            }
            document.body.classList.add(this._bodyHiddenOverflowClass);
        };
        this.showScrollBar = () => {
            document.body.style.paddingRight = this.calculatedPadding;
            document.body.classList.remove(this._bodyHiddenOverflowClass);
        };
        this.onDocumentKeyDown = (event) => {
            const { onClose } = this.props;
            if (event.key === 'Escape') {
                onClose();
            }
        };
        this.onBackdropClick = () => {
            const { onClose, onBackdropClick, disableBackdropClick } = this.props;
            if (disableBackdropClick) {
                return;
            }
            if (onBackdropClick) {
                onBackdropClick();
                return;
            }
            onClose();
        };
    }
    static { this.defaultProps = {
        className: '',
        children: null,
        disableBackdropClick: false,
        disableEscapeClose: false,
        disableBodyScroll: false,
    }; }
    componentDidMount() {
        const { disableEscapeClose, disableBodyScroll } = this.props;
        if (!disableEscapeClose) {
            document.body.addEventListener('keydown', this.onDocumentKeyDown);
        }
        if (disableBodyScroll) {
            // При интеграции в VKUI приложения, ко всем классам нужно добавлять перфиксы,
            // но плагин который это делает, добавляет их только к JSX className
            this._scrollbarMeasureClass = (_jsx("div", { className: "BaseModal__scrollbarMeasure" })).props.className;
            this._bodyHiddenOverflowClass = (_jsx("div", { className: "BaseModal__bodyHiddenOverflow" })).props.className;
            this.hideScrollBar();
        }
    }
    componentWillUnmount() {
        const { disableEscapeClose, disableBodyScroll } = this.props;
        if (!disableEscapeClose) {
            document.body.removeEventListener('keydown', this.onDocumentKeyDown);
        }
        if (disableBodyScroll) {
            this.showScrollBar();
        }
    }
    renderModal() {
        const { className, 'data-testid': testId } = this.props;
        const classNames = cx('BaseModal', className);
        return (_jsxs("div", { "data-testid": testId, className: classNames, "aria-modal": "true", children: [_jsx("div", { className: "BaseModal__backdrop", onClick: this.onBackdropClick }), _jsx("div", { className: "BaseModal__content", children: this.props.children })] }));
    }
    render() {
        return ReactDOM.createPortal(this.renderModal(), document.body);
    }
}
//# sourceMappingURL=BaseModal.js.map