import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { useLangs } from '@vkontakte-internal/plugins';
import { Div, Group, Header, Placeholder, Skeleton } from '@vkontakte-internal/vkcom-kit';
import { observer } from 'mobx-react-lite';
import { InfiniteScroll } from '../../components/InfiniteScroll';
import { TranscribedCall } from './components';
import { TranscribedCallsSectionModelProvider, useTranscribedCallsSectionModel } from './models';
const TranscribedCallsView = observer(function TranscribedCallsView() {
    const langs = useLangs();
    const vm = useTranscribedCallsSectionModel();
    if (vm.isShowSkeleton) {
        return (_jsx(Group, { children: _jsx(Skeleton, { height: 300 }) }));
    }
    return (_jsxs(Group, { header: _jsx(Header, { separator: true, "data-testid": "calls_decoding_page_header", children: langs.getLang('calls_decoded_page_title') }), children: [!vm.isEmpty && (_jsx(InfiniteScroll, { loadMore: vm.loadMore, hasMore: vm.hasNext, children: vm.blocks.map(({ title, transcriptions }) => (_jsx(Group, { mode: "plain", header: _jsx(Header, { mode: "tertiary", children: title }), children: transcriptions.map((transcription) => {
                        const { name = '', doc_id, doc_url, subtitle } = transcription;
                        return (_jsx(TranscribedCall, { title: doc_url ? name : langs.getLang('calls_decoded_page_deleted_item'), subtitle: subtitle, id: doc_id, fileUrl: doc_url, isDeleted: !doc_url, onDownload: (_, url) => vm.downloadTranscription(url), onDelete: (id) => vm.deleteTranscription(id) }, doc_id));
                    }) }, title))) })), vm.isEmpty && !vm.loading && (_jsx(Div, { children: _jsx(Placeholder, { children: langs.getLang('calls_decoded_page_empty_list') }) }))] }));
});
export const TranscribedCallsSection = createWidget(TranscribedCallsSectionModelProvider, TranscribedCallsView);
//# sourceMappingURL=TranscribedCallsSection.js.map