import { useUnit } from 'effector-react';
import { $packs } from './model/packs';
import { useLangPackId } from './context';
export function useLangPack() {
    const id = useLangPackId();
    if (!id) {
        throw new Error('Отсутствует обертка LangPackProvider');
    }
    const packs = useUnit($packs);
    const pack = packs[id];
    const translate = (key, variables) => {
        if (!key || !pack) {
            // Рендерим неразрывной пробел для растягивания блока с текстом сразу на нужную высоту
            return ' ';
        }
        const { keys } = pack;
        if (!(key in keys)) {
            return key;
        }
        let translation = String(keys[key]);
        if (variables) {
            translation = translation.replace(/{([^]+?)}/g, (_, field) => {
                const value = variables[field];
                if (value === undefined) {
                    return '';
                }
                return String(value);
            });
        }
        return translation;
    };
    return {
        translate,
        pack,
    };
}
//# sourceMappingURL=useLangPack.js.map