export class StickerContext {
    constructor(sticker) {
        if (!sticker) {
            return;
        }
        if ('id' in sticker) {
            this.ugc = sticker;
        }
        else if ('sticker_id' in sticker) {
            this.base = sticker;
        }
    }
    get rawData() {
        return this.ugc || this.base;
    }
    get isUGC() {
        return Boolean(this.ugc);
    }
    get isPopup() {
        return Boolean(this.base?.popup);
    }
    get isBase() {
        return Boolean(this.base);
    }
    get id() {
        return this.base?.sticker_id || this.ugc?.id;
    }
    get ownerId() {
        return this.ugc?.owner_id;
    }
    get packId() {
        return this.base?.product_id || this.ugc?.pack_id;
    }
    get images() {
        return this.base?.images || this.ugc?.images;
    }
    get imagesWithBackground() {
        return this.base?.images_with_background || this.base?.images || this.ugc?.images;
    }
    get animations() {
        return this.base?.animations;
    }
    get animationUrl() {
        return this.base?.animation_url;
    }
    get imageConfigContext() {
        return this.base?.image_config_context;
    }
    get isAllowed() {
        if (this.isUGC) {
            return true;
        }
        return this.base?.is_allowed;
    }
    get isActiveAgeRestriction() {
        return this.ugc?.active_restriction === 'age_18';
    }
    get isBanned() {
        return this.ugc?.status === 'banned';
    }
    get isRejected() {
        return this.ugc?.status === 'rejected';
    }
    get isDeleted() {
        return Boolean(this.ugc?.is_deleted);
    }
    get isClaimed() {
        return Boolean(this.ugc?.is_claimed);
    }
    get popupLayers() {
        return this.base?.popup?.layers;
    }
}
export function getStickerContext(...args) {
    return new StickerContext(...args);
}
//# sourceMappingURL=index.js.map