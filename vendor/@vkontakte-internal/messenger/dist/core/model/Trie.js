import { getWordsVariants } from '../utils/search';
import * as Translator from './Translator';
import { exhaustivenessCheck } from '../utils/misc';
/**
 * Создает узел префиксного дерева
 */
export function create() {
    return {
        items: new Set(),
        branches: {},
    };
}
/**
 * Добавляет элемент в поисковый индекс
 *
 * @param trie Префиксное дерево
 * @param item Элемент для добавления
 * @param parser Функция для получения id элемента и массива всех строк, по которым элемент должен попасть в индекс
 */
export function add(trie, item, parser) {
    if (Array.isArray(item)) {
        item.forEach((str) => add(trie, str, parser));
    }
    else {
        const { id, strings } = parser(item);
        getWordsVariants(strings, false, false).forEach((word) => {
            let node = trie;
            node.items.add(id); // В корне лежат все результаты
            Array.from(word.trim().toLowerCase()).forEach((letter) => {
                let nextNode = node.branches[letter];
                if (!nextNode) {
                    nextNode = node.branches[letter] = create();
                }
                nextNode.items.add(id);
                node = nextNode;
            });
        });
    }
    return trie;
}
/**
 * Ищет по поисковому индексу
 *
 * @param trie Префиксное дерево
 * @param query Поисковый запрос
 */
export function search(trie, query, options = { direct: true, localCased: true, translit: true }) {
    // Прямой поиск по запросу
    const directSearch = options.direct && searchQuery(trie, byWords(query));
    // Поиск по смене раскладки
    const localCasedSearch = options.localCased &&
        searchQuery(trie, byWords(Translator.toLocalCase(query)));
    // Поиск по транслиту
    const translitSearch = [];
    if (options.translit) {
        translitSearch.push(...searchQuery(trie, Translator.toTranslit(query).reduce((result, query) => {
            result.push(...byWords(query));
            return result;
        }, [])));
        translitSearch.push(...searchQuery(trie, byWords(Translator.dictionaryLatinConvert({ value: query }))));
    }
    return new Set([
        ...(directSearch || []),
        ...(localCasedSearch || []),
        ...(translitSearch || []),
    ]);
}
/**
 * Ищет в дереве по слову
 *
 * @param trie Префиксное дерево
 * @param words Поисковый запрос (по словам)
 */
function searchQuery(trie, words) {
    let results = null;
    for (const word of words) {
        const currentResults = searchWord(trie, word);
        if (!results) {
            results = new Set([...currentResults]);
        }
        else {
            // Если слов больше, чем одно, находим пересечение результатов
            for (const result of results) {
                if (!currentResults.has(result)) {
                    results.delete(result);
                }
            }
        }
    }
    return results || new Set();
}
/**
 * Ищет в дереве по слову
 *
 * @param trie Префиксное дерево
 * @param word Поисковый запрос (одно слово)
 */
function searchWord(trie, word) {
    let node = trie;
    const q = word.trim().toLowerCase();
    for (const letter of q) {
        const nextNode = node.branches[letter];
        if (!nextNode) {
            return new Set();
        }
        node = nextNode;
    }
    return node.items;
}
export function peerWords(peer, withScreenName = true) {
    const words = [];
    switch (peer.kind) {
        case 'Chat':
            words.push(...byWords(peer.title));
            break;
        case 'Group':
            if (withScreenName && peer.screenName) {
                words.push(peer.screenName);
            }
            words.push(...byWords(peer.name));
            break;
        case 'User':
            if (withScreenName && peer.screenName) {
                words.push(peer.screenName);
            }
            words.push(...byWords(peer.firstName));
            words.push(...byWords(peer.lastName));
            break;
        case 'Contact':
            words.push(...byWords(peer.name));
            break;
        default:
            exhaustivenessCheck(peer);
    }
    return words;
}
export function byWords(str) {
    return str.trim().toLowerCase().split(/\s+/g);
}
//# sourceMappingURL=Trie.js.map