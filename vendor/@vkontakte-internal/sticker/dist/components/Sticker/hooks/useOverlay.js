import { jsx as _jsx } from "react/jsx-runtime";
import { BannedOverlay } from '../components/Overlay/BannedOverlay/BannedOverlay';
import { DeletedOverlay } from '../components/Overlay/DeletedOverlay/DeletedOverlay';
import { ModerationOverlay } from '../components/Overlay/ModerationOverlay/ModerationOverlay';
import { AgeRestrictedOverlay } from '../components/Overlay/AgeRestrictedOverlay/AgeRestrictedOverlay';
export function useOverlay({ isUGC, isDeleted, isBanned, isRejected, isClaimed, isActiveAgeRestriction, }) {
    if (!isUGC) {
        return null;
    }
    if (isDeleted) {
        return _jsx(DeletedOverlay, {});
    }
    if (isBanned || isRejected) {
        return _jsx(BannedOverlay, {});
    }
    if (isClaimed) {
        return _jsx(ModerationOverlay, {});
    }
    if (isActiveAgeRestriction) {
        return _jsx(AgeRestrictedOverlay, {});
    }
    return null;
}
//# sourceMappingURL=useOverlay.js.map