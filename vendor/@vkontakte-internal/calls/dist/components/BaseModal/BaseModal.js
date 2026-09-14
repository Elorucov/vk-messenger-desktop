import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}],"button":["global",{"className":1}],"Icon24Cancel":["@vkontakte/icons",{"width":1,"height":1}]} */
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon24Cancel } from '@vkontakte/icons';
import { classNames as cx } from '@vkontakte/vkjs';
import { AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { KeyboardCodes } from '@vkontakte-internal/calls-core';
var ECssClasses;
(function (ECssClasses) {
    ECssClasses["Base"] = "CallsBaseModal";
    ECssClasses["Backdrop"] = "CallsBaseModal__backdrop";
    ECssClasses["Content"] = "CallsBaseModal__content";
    ECssClasses["Cross"] = "CallsModalHeader__cross";
})(ECssClasses || (ECssClasses = {}));
export class BaseModal extends Component {
    constructor() {
        super(...arguments);
        this.calculatedPadding = '0px';
        this._scrollbarMeasureClass = '';
        this._bodyHiddenOverflowClass = '';
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
            if (event.key === KeyboardCodes.Escape) {
                onClose();
            }
        };
        this.checkPreventCloseClasses = (event) => {
            if (!this.props.preventCloseClasses) {
                return false;
            }
            return this.props.preventCloseClasses.some((selector) => {
                return event.target?.closest?.(`.${selector}`);
            });
        };
        this.onBackdropClick = (event) => {
            const { onClose, onBackdropClick, disableBackdropClick } = this.props;
            if (disableBackdropClick) {
                return;
            }
            if (event.target instanceof Element &&
                (event.target.closest(`.${ECssClasses.Content}`) || this.checkPreventCloseClasses(event))) {
                return;
            }
            if (onBackdropClick) {
                onBackdropClick();
                return;
            }
            onClose();
        };
    }
    componentDidMount() {
        const { disableEscapeClose, disableBodyScroll } = this.props;
        if (!disableEscapeClose) {
            document.body.addEventListener('keydown', this.onDocumentKeyDown);
        }
        if (disableBodyScroll) {
            // При интеграции в VKUI приложения, ко всем классам нужно добавлять перфиксы,
            // но плагин который это делает, добавляет их только к JSX className
            this._scrollbarMeasureClass = (_jsx("div", { className: `${ECssClasses.Base}__scrollbarMeasure` })).props.className;
            this._bodyHiddenOverflowClass = (_jsx("div", { className: `${ECssClasses.Base}__bodyHiddenOverflow` })).props.className;
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
        const { className, enableCrossButton, onClose } = this.props;
        const classNames = cx(ECssClasses.Base, className);
        return (_jsx(_Fragment, { children: _jsxs("div", { className: classNames, role: "dialog", "aria-label": this.props.label || '', "aria-describedby": this.props.desribedby, "aria-modal": "true", tabIndex: -1, children: [_jsx("div", { className: ECssClasses.Backdrop, onClick: this.onBackdropClick }), _jsxs("div", { className: ECssClasses.Content, children: [enableCrossButton && (_jsxs("button", { className: ECssClasses.Cross, type: "button", onClick: onClose, children: [_jsx(Icon24Cancel, { width: 22, height: 22 }), "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"] })), _jsx(AppRootProvider, { children: this.props.children })] })] }) }));
    }
    render() {
        return ReactDOM.createPortal(this.renderModal(), document.body);
    }
}
//# sourceMappingURL=BaseModal.js.map