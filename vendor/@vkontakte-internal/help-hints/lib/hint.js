export class HelpHint {
    constructor(hint) {
        this.hint = hint;
    }
    /**
     * ID
     */
    get id() {
        return this.hint.id;
    }
    /**
     * Заголовок
     */
    get title() {
        return this.hint.title;
    }
    /**
     * Описание
     */
    get description() {
        return this.hint.description;
    }
    getResource(resourceKey) {
        return this.hint.resources?.find(({ key }) => key === resourceKey)?.value;
    }
}
//# sourceMappingURL=hint.js.map