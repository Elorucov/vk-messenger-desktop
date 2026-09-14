import { useState, useCallback } from 'react';
import { useModal } from './useModal';
import { useBrowserEnv, useFeatureFlags } from './misc';
/**
  Хук для управления открытием модалки соавторов клипа

  Подробнее в https://jira.mvk.com/browse/ME-77989
*/
export function useClipCoOwnersModal() {
    const { vkcom_me: { clipCoOwnersBoxRenderer } = {} } = useBrowserEnv();
    const { vkm_clip_co_owners_modal } = useFeatureFlags();
    const [clipId, setClipId] = useState(null);
    const modal = useModal();
    const open = useCallback((activeClipId) => {
        if (!clipCoOwnersBoxRenderer || !vkm_clip_co_owners_modal) {
            return;
        }
        setClipId(activeClipId);
        modal.open();
    }, [modal, clipCoOwnersBoxRenderer, vkm_clip_co_owners_modal]);
    const close = useCallback(() => {
        modal.close();
        setClipId(null);
    }, [modal]);
    return {
        open,
        close,
        clipId,
        isActive: modal.isActive,
    };
}
//# sourceMappingURL=useClipCoOwnersModal.js.map