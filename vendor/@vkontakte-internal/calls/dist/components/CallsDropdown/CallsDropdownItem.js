import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch } from '@vkontakte-internal/vkcom-kit';
import { classNames as cx, isUndefined } from '@vkontakte/vkjs';
import { isBoolean, vou } from '../../helpers/helpers';
import { useLang } from '../../hooks/useLang';
export const DropdownItem = ({ item, setOpen }) => {
    const { getLang } = useLang();
    const { disabled = false } = item;
    const className = cx('CallsDropdown__button', {
        'CallsDropdown__button--disabled': disabled,
    });
    if ('href' in item) {
        return (
        // TODO: Поменять a на Link
        // eslint-disable-next-line react/forbid-elements
        _jsx("a", { href: item.href, rel: "noopener noreferrer", target: "_blank", onClick: disabled
                ? undefined
                : (event) => {
                    event.stopPropagation();
                    if ('onClick' in item && item.onClick !== undefined) {
                        item.onClick(event);
                    }
                    setOpen?.(false);
                }, className: className, children: item.text }));
    }
    if ('onClick' in item) {
        const titleClassName = cx('CallsDropdown__row-title', item.titleClassName);
        return (_jsxs("button", { "aria-checked": vou(isBoolean(item.isEnabled), !!item.isEnabled), role: vou(isBoolean(item.isEnabled), 'checkbox'), "data-testid": item.dataTestId, onClick: disabled
                ? undefined
                : (event) => {
                    event.stopPropagation();
                    item.onClick(event);
                    // Если есть switcher - не закрываем окно настроек при клике
                    if (!isBoolean(item.isEnabled) || item.notKeepOpen) {
                        setOpen?.(false);
                    }
                }, className: className, children: [_jsx("div", { className: titleClassName, children: item.text }), !isUndefined(item.isEnabled) && !item.isAlternativeSwitch && (_jsx(Switch, { className: "CallsDropdown__switch", tabIndex: -1, checked: item.isEnabled, onClick: (event) => event.stopPropagation(), readOnly: true })), !isUndefined(item.isEnabled) && item.isAlternativeSwitch && (_jsx("div", { className: "CallsDropdown__switch--alternative", children: item.isEnabled
                        ? // Вкл
                            getLang('calls_toggle_on')
                        : // Откл
                            getLang('calls_toggle_off') }))] }));
    }
    return null;
};
/**
 * получает полоску-разделитель
 * @param isListEdge проверяет, что не находится в (начале|конце) cпика
 */
export const Separator = ({ isListEdge }) => {
    return _jsx("div", { className: cx({ CallsDropdown__separator: !isListEdge }) });
};
//# sourceMappingURL=CallsDropdownItem.js.map