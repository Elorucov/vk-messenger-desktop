import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { BroadcastHistoryModalProvider, useBroadcastHistoryModal } from './models';
import { List, Pagination, Placeholder, VideoCard, VideoCardSkeleton, ModalFooter, Div, ModalBody, ModalBox, ModalHeader, } from '@vkontakte-internal/vkcom-kit';
import { ModalPortalToBody, ModalBackdrop } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { useMemo } from 'react';
const BroadcastHistoryModalView = observer(function BroadcastHistoryModalView() {
    const model = useBroadcastHistoryModal();
    const langs = useLangs();
    const skeletons = useMemo(() => {
        return Array.from({ length: model.broadcastsIds.length }).map((_, index) => (_jsx(VideoCardSkeleton, { direction: "horizontal", size: "s", singleLineTitle: true }, index)));
    }, [model.broadcastsIds.length]);
    const listContent = () => {
        if (model.hasError) {
            return _jsx(Placeholder, { children: langs.getLang('calls_error_loading_broadcast_records') });
        }
        if (model.loading) {
            return _jsx(_Fragment, { children: skeletons });
        }
        if (model.videoPreviews.length) {
            return model.videoPreviews.map((video) => (
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
            _jsx(VideoCard, { video: video, direction: "horizontal", size: "s", onVideoOpen: () => model.onVideoOpen(video) }, video.id)));
        }
        return _jsx(Placeholder, { children: langs.getLang('calls_history_dropdown_broadcasts_modal_placeholder') });
    };
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: model.closeModal, children: _jsxs(ModalBox, { width: 620, maxHeight: 628, children: [_jsx(ModalHeader, { closeAriaLabel: langs.getLang('calls_close'), onClose: model.closeModal, children: model.callTitle }), _jsx(ModalBody, { insetLevel: 1, children: _jsx(Div, { mode: "horizontal", spacing: 8, children: _jsx(List, { gap: 8, children: listContent() }) }) }), model.totalPages > 1 && (_jsx(ModalFooter, { children: _jsx(Pagination, { disabled: model.loading, currentPage: model.page, totalPages: model.totalPages, onChange: model.onPageChange }) }))] }) }) }));
});
export const BroadcastHistoryModal = createWidget(BroadcastHistoryModalProvider, BroadcastHistoryModalView);
//# sourceMappingURL=BroadcastHistoryModal.js.map