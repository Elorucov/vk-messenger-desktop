export class PredefinedBackground {
    constructor(params) {
        this.params = params;
    }
    getMappedParams() {
        return {
            id: this.params.id,
            type: this.params.type,
            originalUrl: this.params.original,
            previewUrl: this.params.preview,
            isPredefined: true,
            tags: this.params.tags,
        };
    }
}
//# sourceMappingURL=PredefinedBackground.js.map