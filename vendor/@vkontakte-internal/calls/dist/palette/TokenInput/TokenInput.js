import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}],"label":["global",{"className":1}],"span":["global",{"className":2}],"button":["global",{"className":1}],"input":["global",{"className":1}]} */
import { useCallback, useRef, } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon16Cancel } from '@vkontakte/icons';
export default function TokenInput({ id = 'token-input', name = 'tokens', tokens, onRemoveToken, removeTokenAriaLabel = 'Remove item', renderToken, onChange, value, placeholder = '', onSubmit, className = '', ...restProps }) {
    const inputRef = useRef(null);
    const onChangeHandler = useCallback((e) => {
        return onChange(e);
    }, [onChange]);
    const onKeyDownHandler = useCallback((e) => {
        if (e.key === 'Esc' && inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.blur();
            onChange(e);
            e.stopPropagation();
        }
        if (e.key === 'Enter') {
            onSubmit();
        }
    }, [onSubmit]);
    const onRemoveHandler = useCallback((e) => {
        const target = e.target;
        if (!target) {
            return;
        }
        const dataContainer = target.closest?.('[data-id]');
        if (!dataContainer) {
            return;
        }
        const id = dataContainer.dataset.id;
        if (id) {
            onRemoveToken(id);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [onRemoveToken]);
    return (_jsxs("div", { className: cx('TokenInput', className), children: [_jsx("label", { htmlFor: id, className: "TokenInput__back" }), tokens.map((token) => (_jsxs("span", { className: "TokenInput__token", children: [Boolean(name) && _jsx("input", { type: "hidden", name: name + '[]', value: token.value || token.id }), _jsx("span", { className: "TokenInput__label", children: renderToken ? renderToken(token) : token.text }), !token.locked && (_jsx("button", { "data-id": token.id, className: "TokenInput__remove", onClick: onRemoveHandler, "aria-label": removeTokenAriaLabel, children: _jsx(Icon16Cancel, {}) }))] }, token.id))), _jsx("div", { className: "TokenInput__caret", children: _jsx("div", { className: "TokenInput__caretIn", children: _jsx("input", { ...restProps, id: id, type: "text", value: value, onChange: onChangeHandler, onPaste: onChangeHandler, placeholder: tokens.length === 0 ? placeholder : '', onKeyDown: onKeyDownHandler, className: "TokenInput__input", ref: inputRef }) }) })] }));
}
//# sourceMappingURL=TokenInput.js.map