import { nanoid } from 'nanoid';
export class Stack {
    history;
    index = 0;
    listeners;
    constructor() {
        this.history = [];
        this.listeners = createEvents();
    }
    pop = (count = 1) => {
        const removedItems = this.history.splice(-count, count);
        this.onItemsRemove(removedItems);
    };
    forcedRemove = (removePredicate) => {
        const items = this.history.reduce((result, item) => {
            const shouldRemove = removePredicate(item);
            if (shouldRemove) {
                result.toRemove.push(item);
            }
            else {
                result.actualHistory.push(item);
            }
            return result;
        }, {
            actualHistory: [],
            toRemove: [],
        });
        this.history = items.actualHistory;
        this.onItemsRemove(items.toRemove);
    };
    push(item) {
        this.history.push(item);
        this.index = this.history.length - 1;
        this.listeners.call({ action: 'add', payload: item });
    }
    goBack(count = 1) {
        this.index -= count;
    }
    subscribe(listener) {
        return this.listeners.push(listener);
    }
    get lastElement() {
        return this.history[this.history.length - 1] || null;
    }
    get currentElement() {
        return this.history[this.index] || null;
    }
    findIndex(itemId) {
        const index = this.history.findIndex((item) => item.modalId === itemId);
        return index !== -1 ? index : null;
    }
    get size() {
        return this.history.length;
    }
    onItemsRemove(removedItems) {
        this.index = this.history.length - 1;
        this.listeners.call({ action: 'remove', payload: removedItems });
        if (this.lastElement) {
            this.listeners.call({ action: 'add', payload: this.lastElement });
        }
    }
}
function createEvents() {
    let handlers = [];
    return {
        get length() {
            return handlers.length;
        },
        push(fn) {
            handlers.push(fn);
            return function () {
                handlers = handlers.filter((handler) => handler !== fn);
            };
        },
        call(arg) {
            handlers.forEach((fn) => fn && fn(arg));
        },
    };
}
export function resolveModalId(id) {
    return id;
}
export function createModalId() {
    return nanoid();
}
export function createGroupId() {
    return nanoid();
}
//# sourceMappingURL=Modals.js.map