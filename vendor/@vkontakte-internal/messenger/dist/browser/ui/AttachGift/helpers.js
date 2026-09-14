export function createGiftReplyReferrer(giftId) {
    return giftId ? `gift_reply_${giftId}` : 'gift_reply';
}
export function createGiftSendMoreReferrer(giftId) {
    return giftId ? `gift_another_more_${giftId}` : 'gift_another';
}
export function createRandomPackGiftReferrer() {
    return 'gift_random_pack';
}
export function isPackForChoiceGift(gift) {
    return gift.id === 10001;
}
export function isAnimatedPackForChoiceGift(gift) {
    return gift.id === 10002;
}
//# sourceMappingURL=helpers.js.map