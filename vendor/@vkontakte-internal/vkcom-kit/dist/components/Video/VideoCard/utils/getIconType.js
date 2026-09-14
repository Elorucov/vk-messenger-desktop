export const getIconType = ({ isProcessing, isPrivacyLocked, }) => {
    if (isProcessing) {
        return 'processing';
    }
    if (isPrivacyLocked === true) {
        return 'private';
    }
    if (isPrivacyLocked) {
        return isPrivacyLocked;
    }
    return;
};
//# sourceMappingURL=getIconType.js.map