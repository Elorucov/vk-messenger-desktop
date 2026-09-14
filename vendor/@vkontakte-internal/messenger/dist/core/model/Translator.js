/**
 * Дефолтный словарь транслита
 */
const DICTIONARY_TRANSLIT = {
    u1072: 'a', // а
    u1073: 'b', // б
    u1074: 'v', // в
    u1075: 'g', // г
    u1076: 'd', // д
    u1077: 'e', // е
    u1105: 'yo', // ё
    u1078: 'zh', // ж
    u1079: 'z', // з
    u1080: 'i', // и
    u1081: 'y', // й
    u1082: 'k', // к
    u1083: 'l', // л
    u1084: 'm', // м
    u1085: 'n', // н
    u1086: 'o', // о
    u1087: 'p', // п
    u1088: 'r', // р
    u1089: 's', // с
    u1090: 't', // т
    u1091: 'u', // у
    u1092: 'f', // ф
    u1093: 'kh', // х
    u1094: 'ts', // ц
    u1095: 'ch', // ч
    u1096: 'sh', // ш
    u1097: 'shch', // щ
    u1098: "'", // ъ
    u1099: 'y', // ы
    u1100: "'", // ь
    u1101: 'e', // э
    u1102: 'yu', // ю
    u1103: 'ya', // я
};
/**
 * Словарь транслита на vkcom
 */
const DICTIONARY_TRANSLIT_VKCOM = {
    ...DICTIONARY_TRANSLIT,
    u1093: 'h', // х
    u1097: 'sh', // щ
    u1098: '', // ъ
    u1100: '', // ь
    u1105: 'e', // ё
};
/**
 * Словарь неправильной раскладкки на кириллице
 */
const DICTIONARY_LOCAL_CASE = {
    u102: 'а',
    u44: 'б',
    u100: 'в',
    u117: 'г',
    u108: 'д',
    u116: 'е',
    u92: 'ё',
    u59: 'ж',
    u112: 'з',
    u98: 'и',
    u113: 'й',
    u114: 'к',
    u107: 'л',
    u118: 'м',
    u121: 'н',
    u106: 'о',
    u103: 'п',
    u104: 'р',
    u99: 'с',
    u110: 'т',
    u101: 'у',
    u97: 'ф',
    u91: 'х',
    u119: 'ц',
    u120: 'ч',
    u105: 'ш',
    u111: 'щ',
    u93: 'ъ',
    u109: 'ь',
    u115: 'ы',
    u39: 'э',
    u46: 'ю',
    u122: 'я',
    // Заглавные буквы в неправильной раскладке
    u60: 'б',
    u126: 'ё',
    u58: 'ж',
    u123: 'х',
    u125: 'ъ',
    u34: 'э',
    u62: 'ю',
    // Символы
    u64: '"',
    u35: '№',
    u36: ';',
    u37: '%',
    u94: ':',
    u38: '?',
    u63: ',',
    u47: '.',
};
/**
 * Словарь транслита с vk.com для транслитерации строки с латинскими символами
 */
const DICTIONARY_LATIN_TRANSLIT = {
    yo: 'ё',
    YO: 'Ё',
    zh: 'ж',
    ZH: 'Ж',
    kh: 'х',
    KH: 'Х',
    ts: 'ц',
    TS: 'Ц',
    ch: 'ч',
    CH: 'Ч',
    sch: 'щ',
    SCH: 'Щ',
    shch: 'щ',
    SHCH: 'Щ',
    sh: 'ш',
    SH: 'Ш',
    eh: 'э',
    EH: 'Э',
    yu: 'ю',
    YU: 'Ю',
    ya: 'я',
    YA: 'Я',
    "'": 'ь',
    a: 'а',
    A: 'А',
    b: 'б',
    B: 'Б',
    v: 'в',
    V: 'В',
    g: 'г',
    G: 'Г',
    d: 'д',
    D: 'Д',
    e: 'е',
    E: 'Е',
    z: 'з',
    Z: 'З',
    i: 'и',
    I: 'И',
    j: 'й',
    J: 'Й',
    k: 'к',
    K: 'К',
    l: 'л',
    L: 'Л',
    m: 'м',
    M: 'М',
    n: 'н',
    N: 'Н',
    o: 'о',
    O: 'О',
    p: 'п',
    P: 'П',
    r: 'р',
    R: 'Р',
    s: 'с',
    S: 'С',
    t: 'т',
    T: 'Т',
    u: 'у',
    U: 'У',
    f: 'ф',
    F: 'Ф',
    h: 'х',
    H: 'Х',
    c: 'ц',
    C: 'Ц',
    y: 'ы',
    Y: 'Ы',
};
export function dictionaryConvert({ dictionary, value, }) {
    return Object.entries(dictionary).reduce((result, [chunk, replacement]) => {
        return result.replace(new RegExp(chunk, 'g'), replacement);
    }, value);
}
export function dictionaryLatinConvert({ value }) {
    return dictionaryConvert({ value, dictionary: DICTIONARY_LATIN_TRANSLIT });
}
/**
 * Получает все уникальные варианты строк с использованием имеющихся словарей
 * Используется при добавлении в поисковый индекс
 */
export function toTranslit(str, local) {
    str = str.toLowerCase().trim();
    const dictionaries = [DICTIONARY_TRANSLIT, DICTIONARY_TRANSLIT_VKCOM];
    if (local) {
        dictionaries.push(DICTIONARY_LOCAL_CASE);
    }
    return dictionaries.reduce((acc, dictionary) => {
        const variant = convert(str, dictionary);
        if (variant === str) {
            return acc;
        }
        if (acc.includes(variant)) {
            return acc;
        }
        acc.push(variant);
        return acc;
    }, []);
}
/**
 * Восстанавливает кириллицу из неправильной раскладки
 * Используется в рантайме поиска, чтобы упростить манипуляции регистром букв,
 * которым в английской раскладке соответствуют небуквенные символы
 */
export function toLocalCase(str) {
    str = str.toLowerCase().trim();
    return convert(str, DICTIONARY_LOCAL_CASE);
}
/**
 * Функция конвертации по словарю.
 * Принимает на вход строку в нижнем регистре, используется только в рамках модели
 */
function convert(str, dictionary) {
    let result = '';
    for (const letter of str) {
        const replaced = dictionary['u' + letter.codePointAt(0)];
        result += typeof replaced !== 'undefined' ? replaced : letter;
    }
    return result;
}
//# sourceMappingURL=Translator.js.map