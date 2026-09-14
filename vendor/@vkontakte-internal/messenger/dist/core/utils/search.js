import * as Translator from '../model/Translator';
/**
 * Получает варианты написания слов при заполнении поискового индекса
 * На вход ожидается массив строк в нижнем регистре
 *
 * @param words Массив слов
 */
export function getWordsVariants(words, withLocalCase = true, withTranslit = true) {
    const result = [];
    for (const word of words) {
        const replaced = word.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
        if (replaced !== word) {
            result.push(replaced);
        }
        if (withTranslit) {
            Translator.toTranslit(word, withLocalCase).forEach((item) => {
                if (item !== word) {
                    result.push(item);
                }
            });
        }
        result.push(word);
    }
    return result;
}
//# sourceMappingURL=search.js.map