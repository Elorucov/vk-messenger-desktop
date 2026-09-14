import { isMac } from './misc';
export var Modifier;
(function (Modifier) {
    Modifier["Mod"] = "Mod";
    Modifier["Alt"] = "Alt";
    Modifier["Shift"] = "Shift";
    Modifier["Meta"] = "Meta";
})(Modifier || (Modifier = {}));
/**
 * Клавиши, которые обрабатываются модульными подписками и на html-элементах
 * в фокусе.
 * Клавиши прописываются с разделителем "+".
 * Первыми указываются модификаторы клавиши из енама Modifier в порядке
 * следования внутри енама.
 * Далее указываются значения либо из event.key,
 * либо из event.code без подстрок 'Key' / 'Digit' / 'Numpad' в начале.
 * Если это буква, то указывать в верхнем регистре.
 */
const moduleKeyCombo = [
    Modifier.Shift,
    Modifier.Mod,
    'ArrowDown',
    'ArrowUp',
    `${Modifier.Mod}+ArrowDown`,
    `${Modifier.Mod}+ArrowUp`,
    'Enter',
    'Escape',
    'Backspace',
    `${Modifier.Shift}+Enter`,
    `${Modifier.Mod}+Enter`,
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    `${Modifier.Shift}+Tab`,
    'Space',
    `${Modifier.Mod}+B`,
    `${Modifier.Mod}+U`,
    `${Modifier.Mod}+I`,
    `${Modifier.Mod}+S`,
    `${Modifier.Mod}+K`,
    `${Modifier.Mod}+Equal`,
    `${Modifier.Mod}+${Modifier.Shift}+Equal`,
    `${Modifier.Mod}+Minus`,
    `${Modifier.Mod}+${Modifier.Shift}+Minus`,
    'PageUp',
    'PageDown',
    'Home',
    'End',
];
export const isModuleKeyCombo = (keyCombo) => moduleKeyCombo.includes(keyCombo);
/**
 * Значения в GlobalKeyCombo прописываются в порядке следования
 * енамов: Modifier, LangPersistentKey, CharKey с символами и в порядке следования
 * символов внутри енамов.
 * Если сочетание есть и в globalKeyCombo и в moduleKeyCombo, то в будет вызван
 * обработчик глобальной подписки, а не модульной. Потому что не может
 * гарантировать что обработчик модульной подписки обработает это сочетание.
 */
const globalKeyCombo = [
    `${Modifier.Mod}+${Modifier.Shift}+F`,
    `${Modifier.Mod}+/`,
];
export const isGlobalKeyCombo = (keyCombo) => globalKeyCombo.includes(keyCombo);
export const getKeyCombo = (event) => {
    // Автокомплит вызывает событие keydown, но без полей key, code и т.д.,
    // поэтому код ниже упадет и для этого оборачиваем в try catch.
    try {
        const keys = [];
        Object.values(Modifier).forEach((key) => {
            if (modifiersConditions[key](event)) {
                keys.push(key);
            }
        });
        const modifierKeys = ['Meta', 'Control', 'Alt', 'Shift'];
        const isModifiersOnly = modifierKeys.includes(event.key);
        if (isModifiersOnly) {
            const modifiers = keys.join('+');
            return {
                key: modifiers,
                code: modifiers,
            };
        }
        const codeType = ['Key', 'Digit', 'Numpad'].find((code) => event.code.startsWith(code));
        const eventCode = codeType ? event.code.slice(codeType.length) : event.code;
        const eventKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;
        return {
            key: [...keys, eventKey].join('+'),
            code: [...keys, eventCode].join('+'),
        };
    }
    catch (e) {
        return;
    }
};
export const getModuleKeyCombo = (event) => {
    const keyCombo = getKeyCombo(event);
    if (!keyCombo) {
        return null;
    }
    const { key, code } = keyCombo;
    return [key, code].find(isModuleKeyCombo) ?? null;
};
export const getGlobalKeyCombo = (event) => {
    const keyCombo = getKeyCombo(event);
    if (!keyCombo) {
        return null;
    }
    const { key, code } = keyCombo;
    return [key, code].find(isGlobalKeyCombo) ?? null;
};
export const isCharKey = (event) => {
    // Автокомплит вызывает событие keydown, но без полей key, code и т.д.,
    // поэтому код ниже упадет и для этого оборачиваем в try catch.
    try {
        for (const key of Object.values(Modifier)) {
            if (key !== Modifier.Shift && modifiersConditions[key](event)) {
                return false;
            }
        }
        // Если это не символьная клавиша
        if (event.key.length !== 1) {
            return false;
        }
        return true;
    }
    catch (e) {
        return false;
    }
};
const isMetaModifier = (event) => event.key === 'Meta' || event.metaKey;
const isControlModifier = (event) => event.key === 'Control' || event.ctrlKey;
const modifiersConditions = {
    [Modifier.Mod]: (event) => isMac ? isMetaModifier(event) : isControlModifier(event),
    [Modifier.Alt]: (event) => event.key === 'Alt' || event.altKey,
    [Modifier.Shift]: (event) => event.key === 'Shift' || event.shiftKey,
    [Modifier.Meta]: (event) => isMac ? isControlModifier(event) : isMetaModifier(event),
};
const LTR_TO_RTL_KEYS = {
    ArrowLeft: 'ArrowRight',
    ArrowRight: 'ArrowLeft',
};
export function localizeNavigationKey(key, rootOrDirection) {
    let dir;
    switch (true) {
        case typeof rootOrDirection === 'string':
            dir = rootOrDirection;
            break;
        case rootOrDirection instanceof HTMLElement:
            dir = getComputedStyle(rootOrDirection).direction;
            break;
        default:
        // Ничего не делаем.
    }
    return dir === 'rtl' ? LTR_TO_RTL_KEYS[key] ?? key : key;
}
//# sourceMappingURL=keyBoardCombos.js.map