export class PackContext {
    #options;
    #pack;
    #product;
    #stockItem;
    constructor({ pack, ...options }) {
        this.#options = options;
        if (!pack) {
            return;
        }
        if ('product' in pack) {
            this.#stockItem = pack;
            this.#product = pack.product;
        }
        else if ('id' in pack && 'type' in pack) {
            this.#product = pack;
        }
        else {
            this.#pack = pack;
        }
    }
    get rawData() {
        return this.#pack || this.#stockItem || this.#product;
    }
    get isPack() {
        return Boolean(this.#pack);
    }
    get isProduct() {
        return Boolean(this.#product);
    }
    get isStockItem() {
        return Boolean(this.#stockItem);
    }
    get isStoreItem() {
        return this.isProduct || this.isStockItem;
    }
    get stockItem() {
        return this.#stockItem;
    }
    get id() {
        const redefined = this.#options?.redefine?.id;
        if (redefined !== undefined) {
            return redefined;
        }
        const productId = this.#product?.id;
        if (productId !== undefined) {
            return productId;
        }
        return this.#pack?.id;
    }
    setHint(hint) {
        if (!this.#options) {
            return this;
        }
        this.#options.hint = hint;
        return this;
    }
    get hintId() {
        return this.#options?.hint?.id;
    }
    get hintWidth() {
        return this.#options?.hint?.width;
    }
    get index() {
        return this.#options?.index;
    }
    get referrer() {
        return this.#options?.referrer;
    }
    get tooltip() {
        return this.#options?.tooltip;
    }
    get title() {
        return this.#options?.redefine?.title || this.#product?.title || '';
    }
    get stickers() {
        return this.#options?.redefine?.stickers || this.#pack?.stickers || this.#product?.stickers;
    }
    get baseId() {
        return this.#product?.base_id;
    }
    get isStyle() {
        return this.baseId !== undefined;
    }
    get hasStyles() {
        return Boolean(this.styleIds?.length);
    }
    get styleIds() {
        return this.#product?.style_ids;
    }
    get canGift() {
        return Boolean(this.#stockItem?.can_gift);
    }
    get vmojiAvatar() {
        return this.#product?.vmoji_avatar;
    }
    get isVmoji() {
        return Boolean(this.vmojiAvatar || this.#product?.is_vmoji);
    }
    get isPopup() {
        return this.#product?.is_popup;
    }
    get isNew() {
        return this.#product?.is_new;
    }
    get previews() {
        return this.#product?.previews;
    }
}
//# sourceMappingURL=index.js.map