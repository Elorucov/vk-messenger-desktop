import { VmojiQueueEvent } from './base';
export function handleVmojiQueueEvent(updates, { data }) {
    const { type, query_id } = data;
    if (query_id) {
        updates.dispatchEvent(new VmojiQueueEvent(query_id, data));
    }
    updates.dispatchEvent(new VmojiQueueEvent(type, data));
}
//# sourceMappingURL=index.js.map