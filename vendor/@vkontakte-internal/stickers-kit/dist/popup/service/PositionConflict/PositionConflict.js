import { makeAutoObservable } from 'mobx';
export class PositionConflict {
    constructor() {
        this.blocks = [];
        this.addConflictBlock = (conflictBlock) => {
            this.blocks.push(conflictBlock);
        };
        this.removeConflictBlockBySelector = (selector) => {
            this.blocks.filter((block) => block.blockSelector === selector);
        };
        makeAutoObservable(this);
    }
}
//# sourceMappingURL=PositionConflict.js.map