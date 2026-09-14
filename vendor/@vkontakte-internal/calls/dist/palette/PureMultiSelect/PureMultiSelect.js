import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}]} */
// @ts-nocheck
import { PureComponent } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import InfiniteScroll from '../InfiniteScroll/InfiniteScroll';
import ListItem from '../ListItem/ListItem';
import TokenInput from '../TokenInput/TokenInput';
/**
 * Кастомный селект с возможностью выбрать несколько пунктов, поиском, бесконечным скроллом и возможностью кастомного рендера элемента списка
 */
export default class PureMultiSelect extends PureComponent {
    constructor(props) {
        super(props);
        /**
         * Обработчик на удаление выбранного элемента
         */
        this.onRemoveToken = (e) => {
            const prevSearchHeight = this.searchContainer && this.searchContainer.offsetHeight;
            // Дожидаемся, когда все элементы отрендерятся
            this.props.onRemoveToken(e.target.getAttribute('data-id')).then(() => {
                if (prevSearchHeight || prevSearchHeight === 0) {
                    this.updateScroll(prevSearchHeight);
                }
            });
        };
        /**
         * Обработчик на ввод текста в поле поиска
         *
         * @param {Event} e event
         * @return {void}
         */
        this.onChange = (e) => {
            const newValue = e.target.value;
            if (newValue !== this.value) {
                this.value = newValue;
                this.props.onChange(e);
                this.scrollContainer.scrollTop = 0;
            }
        };
        /**
         * Обработчик клика по саггесту
         */
        this.onSelect = (e) => {
            const prevSearchHeight = this.searchContainer && this.searchContainer.offsetHeight;
            // Дожидаемся, когда все элементы отрендерятся
            this.props.onSelect(e.currentTarget.getAttribute('data-id')).then(() => {
                if (prevSearchHeight || prevSearchHeight === 0) {
                    this.updateScroll(prevSearchHeight);
                }
            });
        };
        this.updateScroll = (prevSearchHeight) => {
            const nextSearchHeight = this.searchContainer.offsetHeight;
            // Ставим фокус в инпут
            this.searchContainer.querySelector('#' + this.inputId).focus();
            // Скроллим поисковую секцию вниз до инпута
            this.searchContainer.scrollTop = this.searchContainer.scrollHeight;
            // Если изменилась высота поиска, то делаем поправку в скролле списка
            if (prevSearchHeight !== nextSearchHeight) {
                this.scrollContainer.scrollTop = this.scrollContainer.scrollTop + nextSearchHeight - prevSearchHeight;
            }
        };
        this.searchContainerRef = (el) => {
            this.searchContainer = el;
        };
        this.scrollContainerRef = (c) => {
            let el = c;
            if (c && c.container) {
                el = c;
                while (el.container) {
                    el = el.container;
                }
            }
            this.scrollContainer = el;
        };
        this.value = props.value;
        this.inputId = 'token-input-' + Math.floor(Math.random() * 1e6).toString(16);
    }
    static { this.defaultProps = {
        removeTokenPlaceholder: '',
        placeholder: '',
        value: '',
        useInfiniteScroll: false,
        notFoundText: 'Not found',
        useSuggestsWrapper: false,
    }; }
    render() {
        const { className, tokens, onSelect, renderToken, onRemoveToken, removeTokenPlaceholder, value, placeholder, useInfiniteScroll, loadMore, hasMore, virtualized, notFoundText, children, emptyText, isSearching, renderSuggest, useSuggestsWrapper, data, renderInput, opened, badge, disableEmptyList, ...props } = this.props;
        const ListWrapperComponent = useInfiniteScroll ? InfiniteScroll : 'div';
        const infiniteScrollProps = useInfiniteScroll
            ? { loadMore, hasMore, virtualized, useCapture: false }
            : {};
        const concatedChildren = children ? [].concat(children) : [];
        const isNotFound = (!data && concatedChildren.length === 0) ||
            (!!data && data.length === 0 && (value || emptyText) && !isSearching);
        const suggestsContent = (_jsxs(_Fragment, { children: [isNotFound && !disableEmptyList && (_jsx("div", { className: "MultiSelect__empty", children: _jsx("div", { className: "MultiSelect__emptyIn", children: value ? notFoundText : emptyText }) })), _jsx(ListWrapperComponent, { className: "MultiSelect__scroll", ref: this.scrollContainerRef, ...infiniteScrollProps, children: data
                        ? data.map((item) => renderSuggest(item, this.onSelect))
                        : concatedChildren.map((item) => {
                            if (renderSuggest) {
                                return renderSuggest(item, this.onSelect);
                            }
                            return (_jsx(ListItem, { className: "MultiSelect__suggestsItem", "data-id": item.props['data-id'], onClick: this.onSelect, children: item }, item.key));
                        }) })] }));
        const input = renderInput ? (renderInput()) : (_jsx("div", { className: "MultiSelect__search", ref: this.searchContainerRef, children: _jsx(TokenInput, { id: this.inputId, tokens: tokens, onRemoveToken: onRemoveToken, removeTokenAriaLabel: removeTokenPlaceholder, placeholder: placeholder, onChange: this.onChange, onSubmit: () => { } /* @TODO select first */, renderToken: renderToken, value: value, ...props, className: "MultiSelect__searchInput" }) }));
        return (_jsxs("div", { className: cx('MultiSelect', className), children: [input, badge, (opened === undefined || opened === true) &&
                    (useSuggestsWrapper ? (_jsx("div", { className: "MultiSelect__suggestsWrapper", children: suggestsContent })) : (suggestsContent))] }));
    }
}
//# sourceMappingURL=PureMultiSelect.js.map