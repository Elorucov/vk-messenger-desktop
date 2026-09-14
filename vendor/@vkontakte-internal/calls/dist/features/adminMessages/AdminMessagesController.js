import { makeAutoObservable } from 'mobx';
export class AdminMessagesController {
    static getInstance() {
        AdminMessagesController.instance ??= new AdminMessagesController();
        return AdminMessagesController.instance;
    }
    constructor() {
        this.messages = new Set();
        makeAutoObservable(this);
    }
    addMessage(text, author) {
        const { is_nft, peerId, photo, name } = author;
        this.messages.add({
            text,
            timeReceived: Date.now(),
            author: {
                isNft: !!is_nft,
                name,
                peerId,
                photo,
            },
        });
    }
    delete(message) {
        this.messages.delete(message);
    }
    clear() {
        this.messages.clear();
    }
}
//# sourceMappingURL=AdminMessagesController.js.map