import { exhaustivenessCheck, isDev } from '../utils/misc';
import { castDraft } from 'immer';
// #region GETTERS
/**
 * Проверяет, пуста ли история.
 */
export function isEmpty(history) {
    const { confirmed, pending } = history;
    return confirmed.length === 0 && pending.length === 0;
}
export function lastNode({ history, withPending, withDeleted, withFailed, }) {
    const { confirmed, pending } = history;
    if (withPending) {
        for (let i = pending.length - 1; i >= 0; i--) {
            const pendingNode = pending[i];
            if (pendingNode && (withFailed || !pendingNode.item.hasFailed)) {
                return pendingNode;
            }
        }
    }
    for (let i = confirmed.length - 1; i >= 0; i--) {
        const node = confirmed[i];
        // Такого случаться не будет, если мы корректно обходим цикл
        if (!node) {
            throw new Error('item по индексу не существует');
        }
        switch (node.kind) {
            case 'Node': {
                return node;
            }
            case 'DeletedNode': {
                if (withDeleted) {
                    return node;
                }
                continue;
            }
            case 'GapNode':
                return undefined;
            default:
                return exhaustivenessCheck(node);
        }
    }
    return undefined;
}
/**
 * Последний cmid истории.
 */
export function lastCmid(history) {
    const lastNode = lastConfirmedNode(history);
    if (lastNode === undefined) {
        return undefined;
    }
    switch (lastNode.kind) {
        case 'GapNode': {
            return lastNode.toCmid;
        }
        case 'Node':
        case 'DeletedNode': {
            return nodeCmid(lastNode);
        }
        default:
            return exhaustivenessCheck(lastNode);
    }
}
/**
 * Последний узел истории.
 */
export function lastConfirmedNode(history) {
    const { confirmed } = history;
    return confirmed[confirmed.length - 1];
}
/**
 * Поиск узла в истории по cmid.
 * Если вернулся GapNode - значит узел еще не загружен.
 * Если вернулся undefined или DeletedNode - значит узел удален.
 */
export function findNodeByCmid(history, cmid) {
    const { confirmed } = history;
    const index = confirmed.findIndex((node) => {
        switch (node.kind) {
            case 'GapNode': {
                return node.fromCmid <= cmid && node.toCmid >= cmid;
            }
            case 'Node':
            case 'DeletedNode': {
                return nodeCmid(node) === cmid;
            }
            default:
                return exhaustivenessCheck(node);
        }
    });
    const node = confirmed[index];
    if (node?.kind === 'Node') {
        return { status: 'Node', node, index };
    }
    if (node === undefined || node.kind === 'DeletedNode') {
        return node !== undefined && index !== undefined
            ? {
                status: 'Deleted',
                node,
                index,
            }
            : { status: 'Deleted' };
    }
    return {
        status: 'NotLoaded',
        node,
        index,
    };
}
/**
 * Возвращает слайс истории вокруг cmid.
 * Если cmid попал в гэп узел, то вернет undefined, как индикатор того,
 * что для этого cmid история не загружена.
 * Иначе вернет слайс истории: окружающие переданный cmid узлы (не гэпы),
 * и соседние с этими узлами гэпы.
 */
export function around(history, cmid) {
    const { confirmed, pending } = history;
    const first = confirmed[0];
    if (!first) {
        return {
            nodes: [],
            pendingNodes: pending.length > 0 ? pending : undefined,
        };
    }
    if (first.kind === 'GapNode' && first.toCmid >= cmid) {
        return undefined;
    }
    let found = false;
    let startIndex = 0;
    let prevGap = first.kind === 'GapNode'
        ? first
        : /**
           * Создадим фейковый геп, чтобы алгоритм был проще.
           * cmid в чатах и каналах начинаются от 1, но в случае если в функцию передастся
           * cmid меньше 1 - алгоритм все равно должен работать.
           * Для этого вычисляем его по логике ниже
           */
            {
                kind: 'GapNode',
                fromCmid: Math.min(cmid - 1, 0),
                toCmid: Math.min(cmid - 1, 0),
            };
    let endIndex;
    for (endIndex = startIndex; endIndex < confirmed.length; endIndex++) {
        const node = confirmed[endIndex];
        // Такого случаться не будет, если мы корректно обходим цикл
        if (!node) {
            throw new Error('item по индексу не существует');
        }
        if (node.kind !== 'GapNode') {
            if (endIndex === confirmed.length - 1 && prevGap.toCmid < cmid) {
                found = true;
                break;
            }
            continue;
        }
        if (prevGap.toCmid < cmid && node.fromCmid > cmid) {
            found = true;
            break;
        }
        startIndex = endIndex;
        prevGap = node;
    }
    if (!found) {
        return undefined;
    }
    return confirmed.slice(startIndex, endIndex + 1).reduce((acc, node, index, self) => {
        if (node.kind === 'GapNode') {
            if (index === 0) {
                acc.topGap = node;
            }
            else if (index === self.length - 1) {
                acc.bottomGap = node;
            }
            else {
                throw new Error('В середине результата History.around не может быть гэпов');
            }
            return acc;
        }
        acc.nodes.push(node);
        if (index === self.length - 1 &&
            acc.bottomGap === undefined &&
            pending.length > 0) {
            acc.pendingNodes = pending;
        }
        return acc;
    }, {
        nodes: [],
    });
}
// Для изменения узла, например при неуспешной отправке.
export function findPendingNode(history, randomId) {
    const { pending } = history;
    return pending.find((node) => node.item.randomId === randomId);
}
/**
 * Ищет ближайщую ноду в истории в рамках одного слайса
 * preferAfter: предпочитать ноду до/после указанного cmid
 */
export function findClosestNodeInSlice(historySlice, cmid, preferAfter = false) {
    for (let i = 0; i < historySlice.nodes.length; i++) {
        const node = historySlice.nodes[i];
        if (!node) {
            continue;
        }
        const curNodeCmid = nodeCmid(node);
        const nextNode = historySlice.nodes[i + 1];
        const nextNodeCmid = nextNode && nodeCmid(nextNode);
        if ((i === 0 && cmid < curNodeCmid) ||
            (i === historySlice.nodes.length - 1 && cmid > curNodeCmid) ||
            cmid === curNodeCmid) {
            return node;
        }
        if (nextNodeCmid && curNodeCmid < cmid && cmid < nextNodeCmid) {
            return preferAfter ? nextNode : node;
        }
    }
    return;
}
// #endregion
// #region SETTERS
/**
 * Добавляет переданный элемент в конец истории.
 * Иногда бывают случаи, что сообщение нужно добавить не в конец истории,
 * из-за того, что мы перед обработкой евентов LP можем получить чат по
 * getLongPollHistory и добавить в конец гэп с большим cmid'ом, чем сообщение
 * из евента.
 * см. https://jira.mvk.com/browse/ME-47195 .
 */
export function append(history, historyItem, randomId) {
    const item = castDraft(historyItem);
    if (randomId !== undefined) {
        removePending(history, randomId);
    }
    insertSlice(history, formatSlice([{ kind: 'Node', item }], lastCmid(history)));
}
/**
 * Замена элемента неудаленного узла истории.
 * Если элемент удален - кидает ошибку.
 * Если элемент не загружен или его нет в истории - не делает ничего.
 */
export function replace(history, updatedItem) {
    const { confirmed } = history;
    const updated = castDraft(updatedItem);
    const { status, node, index } = findNodeByCmid(history, updated.cmid);
    if (status === 'NotLoaded') {
        return;
    }
    if (status === 'Deleted') {
        if (isDev) {
            throw new Error(`Попытка заменить удаленный узел истории`);
        }
        return;
    }
    confirmed[index] = {
        kind: 'Node',
        item: updated,
    };
    return node.item;
}
/**
 * Удаление узла.
 * isRestorable отвечает за то, можно ли будет этот узел восстановить.
 */
export function remove(history, cmid, options) {
    const { confirmed } = history;
    const { status, node, index } = findNodeByCmid(history, cmid);
    if (status === 'NotLoaded' || status === 'Deleted') {
        return;
    }
    if (options.isRestorable) {
        if (node.kind === 'Node') {
            confirmed[index] = {
                kind: 'DeletedNode',
                isSpam: options.isSpam,
                restorable: node.item,
            };
        }
    }
    else {
        confirmed.splice(index, 1);
    }
}
export function appendPending(history, pendingItem) {
    const { pending } = history;
    pending.push({ kind: 'PendingNode', item: castDraft(pendingItem) });
}
export function removePending(history, randomId) {
    const { pending } = history;
    const index = pending.findIndex((node) => node.item.randomId === randomId);
    if (index !== -1) {
        pending.splice(index, 1);
    }
}
/**
 * Восстановление удаленного узла в истории.
 * Если узел есть в истории и он не удален - функция не делает ничего.
 * Если узел не загружен или его нет в истории - добавляет его.
 */
export function restore(history, cmid, item) {
    const { confirmed } = history;
    const { status, node, index } = findNodeByCmid(history, cmid);
    if (status === 'NotLoaded') {
        return;
    }
    if (status === 'Node') {
        return;
    }
    if (item !== undefined) {
        const nodes = [
            {
                kind: 'Node',
                item,
            },
        ];
        insertSlice(history, formatSlice(nodes, lastCmid(history)));
        return;
    }
    if (node === undefined) {
        return;
    }
    confirmed[index] = {
        kind: 'Node',
        item: node.restorable,
    };
}
function formatSlice(nodes, historyLastCmid) {
    const firstNode = nodes[0];
    const firstNodeCmid = firstNode && nodeCmid(firstNode);
    const lastNode = nodes[nodes.length - 1];
    const lastNodeCmid = lastNode && nodeCmid(lastNode);
    return {
        topGap: firstNodeCmid !== undefined && firstNodeCmid > 1
            ? { kind: 'GapNode', fromCmid: 1, toCmid: firstNodeCmid - 1 }
            : undefined,
        nodes,
        bottomGap: historyLastCmid !== undefined &&
            lastNodeCmid !== undefined &&
            lastNodeCmid < historyLastCmid
            ? {
                kind: 'GapNode',
                fromCmid: lastNodeCmid + 1,
                toCmid: historyLastCmid,
            }
            : undefined,
    };
}
const LAST_ITEM_COUNT = 0.2;
const AROUND_ITEM_FORWARD_COUNT = 0.2;
/**
 * Удаление части истории, если в истории стало храниться больше узлов, чем threshold.
 * Если передан aroundCmid, то оставляем узлы вокруг него и в конце истории в пропорции
 * 80/20, а иначе оставляем узлы только в конце истории.
 */
export function cleanup(history, threshold, aroundCmid) {
    const { confirmed: prevConfirmed } = history;
    if (prevConfirmed.length < threshold) {
        return;
    }
    const lastItemCmid = lastCmid(history);
    if (lastItemCmid === undefined) {
        return;
    }
    const restCount = Math.floor(threshold / 1.5);
    const newHistory = {
        confirmed: [{ kind: 'GapNode', fromCmid: 1, toCmid: lastItemCmid }],
        pending: [],
    };
    const lastItemSlice = lastItemCmid === undefined ? undefined : around(history, lastItemCmid);
    const aroundItemSlice = aroundCmid === undefined ? undefined : around(history, aroundCmid);
    if (lastItemSlice !== undefined) {
        const newLastItemSliceNodes = aroundItemSlice === undefined
            ? lastItemSlice.nodes.slice(-restCount)
            : lastItemSlice.nodes.slice(-Math.floor(restCount * LAST_ITEM_COUNT));
        insertSlice(newHistory, formatSlice(newLastItemSliceNodes, lastItemCmid));
    }
    if (aroundItemSlice !== undefined) {
        const aroundItemIndex = aroundItemSlice.nodes.findIndex((node) => nodeCmid(node) === aroundCmid);
        if (aroundItemIndex !== -1) {
            const sliceStart = Math.max(aroundItemIndex - Math.floor(restCount * AROUND_ITEM_FORWARD_COUNT), 0);
            // Более поздние сообщения потенциально более интересны пользователю,
            // поэтому пытаемся их сохранить в больше количестве, чем ранние.
            const newAroundItemSliceNodes = aroundItemSlice.nodes.slice(sliceStart, aroundItemIndex +
                Math.floor(restCount *
                    (1 -
                        AROUND_ITEM_FORWARD_COUNT -
                        (lastItemSlice === undefined ? 0 : LAST_ITEM_COUNT))));
            insertSlice(newHistory, formatSlice(newAroundItemSliceNodes, lastItemCmid));
        }
    }
    history.confirmed = newHistory.confirmed;
}
/**
 * Вставка узлов в историю.
 * Если insert начинается (или кончается) не гэпом, то подразумевается,
 * что это обновленное начало (или конец) истории.
 */
export function insert(history, insert) {
    if (insert.length === 0) {
        history.confirmed = [];
        return;
    }
    if (history.confirmed.length === 0) {
        history.confirmed = castDraft(insert);
        return;
    }
    syncLastHistoryItem(history, insert);
    const gapsIndexes = insert.reduce((res, node, index) => {
        if (index === 0 && node.kind !== 'GapNode') {
            res.push(-1);
        }
        if (index === insert.length - 1 && node.kind !== 'GapNode') {
            res.push(insert.length);
        }
        if (node.kind === 'GapNode') {
            res.push(index);
        }
        return res;
    }, []);
    gapsIndexes.forEach((gapIndex, index, self) => {
        const nextGapIndex = self[index + 1];
        if (nextGapIndex !== undefined) {
            const topGap = insert[gapIndex];
            const bottomGap = insert[nextGapIndex];
            const nodes = insert
                .slice(gapIndex + 1, nextGapIndex)
                .reduce((arr, node) => {
                if (node.kind === 'GapNode') {
                    throw new Error('Не может быть гэп узлов между гэпами');
                }
                arr.push(node);
                return arr;
            }, []);
            if (topGap !== undefined && topGap.kind !== 'GapNode') {
                throw new Error('Не гэп используется как гэп');
            }
            if (bottomGap !== undefined && bottomGap.kind !== 'GapNode') {
                throw new Error('Не гэп используется как гэп');
            }
            insertSlice(history, {
                topGap,
                bottomGap,
                nodes,
            });
        }
    });
}
function syncLastHistoryItem(history, insert) {
    const { confirmed } = history;
    const lastCurrent = confirmed[confirmed.length - 1];
    const lastInsert = insert[insert.length - 1];
    if (lastCurrent === undefined || lastInsert === undefined) {
        return;
    }
    const lastInsertCmid = lastInsert.kind === 'GapNode' ? lastInsert.toCmid : nodeCmid(lastInsert);
    const lastCurrentCmid = lastCurrent.kind === 'GapNode' ? lastCurrent.toCmid : nodeCmid(lastCurrent);
    // Не удаляем восстанавливаемые узлы в конце истории,
    // при получении беседы из glph.
    // https://jira.mvk.com/browse/ME-41188
    if (lastCurrent.kind !== 'GapNode' && lastCurrentCmid > lastInsertCmid) {
        if (lastInsert.kind === 'GapNode') {
            lastInsert.toCmid = lastCurrentCmid;
        }
        else {
            insert.push({
                kind: 'GapNode',
                fromCmid: lastInsertCmid + 1,
                toCmid: lastCurrentCmid,
            });
        }
    }
    /**
     * В случае, если полученное последнее сообщение больше последнего текущего более,
     * чем на 1, то мы будем знать, что надо загрузить еще сообщения между ними.
     */
    if (lastInsertCmid > lastCurrentCmid) {
        if (lastCurrent.kind === 'GapNode') {
            lastCurrent.toCmid = lastInsertCmid;
        }
        else {
            confirmed.push({
                kind: 'GapNode',
                fromCmid: lastCurrentCmid + 1,
                toCmid: lastInsertCmid,
            });
        }
    }
}
function insertSlice(history, insert) {
    const { confirmed } = history;
    let insertStartIndex = -1;
    let insertEndIndex = undefined;
    if (insert.topGap !== undefined) {
        insertStartIndex = findInsertionIndex(history, insert.topGap.toCmid);
        const startInsertFromNode = confirmed[insertStartIndex];
        // Не включаем узел, если его cmid больше нижней границы верхнего гэпа.
        // Так как после нижней границы верхнего гэпа у нас уже есть история.
        if (startInsertFromNode !== undefined) {
            const startInsertFromNodeCmid = startInsertFromNode.kind === 'GapNode'
                ? startInsertFromNode.fromCmid
                : nodeCmid(startInsertFromNode);
            if (startInsertFromNodeCmid > insert.topGap.toCmid) {
                insertStartIndex--;
            }
        }
        // Для корректной работы, в случае если и topGap и bottomGap слайса нашлись
        // в одном гэпе истории этот гэп истории разбиваем на 2.
        // Чтобы bottomGap точно нашелся не в этом гэпе.
        if (startInsertFromNode?.kind === 'GapNode' &&
            startInsertFromNode.fromCmid <= insert.topGap.toCmid &&
            startInsertFromNode.toCmid > insert.topGap.toCmid) {
            confirmed.splice(insertStartIndex, 0, {
                kind: 'GapNode',
                fromCmid: startInsertFromNode.fromCmid,
                toCmid: insert.topGap.toCmid,
            });
            startInsertFromNode.fromCmid = insert.topGap.toCmid + 1;
        }
    }
    if (insert.bottomGap !== undefined) {
        insertEndIndex = findInsertionIndex(history, insert.bottomGap.fromCmid);
        const endInsertToNode = confirmed[insertEndIndex];
        if (endInsertToNode?.kind === 'GapNode' &&
            endInsertToNode.fromCmid < insert.bottomGap.fromCmid) {
            endInsertToNode.fromCmid = insert.bottomGap.fromCmid;
        }
    }
    const result = [
        ...confirmed.slice(0, insertStartIndex + 1),
        ...castDraft(insert.nodes),
        ...(insertEndIndex !== undefined ? confirmed.slice(insertEndIndex) : []),
    ];
    history.confirmed = result;
}
function findInsertionIndex(history, cmid) {
    const { confirmed } = history;
    for (let index = 0; index < confirmed.length; index++) {
        const node = confirmed[index];
        const prev = confirmed[index - 1];
        if (!node) {
            return -1;
        }
        if (index === 0) {
            const isUnderFirstNode = node.kind === 'GapNode' ? node.fromCmid > cmid : nodeCmid(node) > cmid;
            if (isUnderFirstNode) {
                return -1;
            }
        }
        if (node.kind === 'GapNode') {
            if (cmid >= node.fromCmid && cmid <= node.toCmid) {
                return index;
            }
        }
        const currentCmid = node.kind === 'GapNode' ? node.fromCmid : nodeCmid(node);
        if (currentCmid === cmid) {
            return index;
        }
        if (prev === undefined) {
            continue;
        }
        const prevCmid = prev.kind === 'GapNode' ? prev.toCmid : nodeCmid(prev);
        if (currentCmid > cmid && prevCmid < cmid) {
            return index;
        }
    }
    // Если не вышли ранее, значит элемент за пределами истории
    return confirmed.length;
}
/**
 * Возвращает cmid узлов истории, у которых он есть.
 */
export function nodeCmid(node) {
    switch (node.kind) {
        case 'Node':
            return node.item.cmid;
        case 'DeletedNode':
            return node.restorable.cmid;
        default:
            exhaustivenessCheck(node);
    }
}
/**
 * Возвращает sentAt узлов истории, у которых он есть.
 */
export function nodeSentAt(node) {
    switch (node.kind) {
        case 'Node':
            return node.item.sentAt;
        case 'DeletedNode':
            return node.restorable.sentAt;
        case 'PendingNode':
            return node.item.sentAt;
        default:
            exhaustivenessCheck(node);
    }
}
export function appendPostponed(history, historyItem, randomId) {
    if (randomId !== undefined) {
        removePending(history, randomId);
    }
    const { confirmed } = history;
    const item = { kind: 'Node', item: castDraft(historyItem) };
    sortConfirmedPostponed(history, [...confirmed, item]);
}
export function sortConfirmedPostponed(history, confirmed) {
    const confirmedToSort = confirmed || history.confirmed;
    history.confirmed = confirmedToSort.sort((a, b) => {
        if (a.kind === 'Node' && b.kind === 'Node') {
            if (a.item.sentAt !== b.item.sentAt) {
                return b.item.sentAt - a.item.sentAt;
            }
            // если даты отправления равны, то отображаем в порядке создания сообщения
            return b.item.cmid - a.item.cmid;
        }
        return 0;
    });
}
//# sourceMappingURL=History.js.map