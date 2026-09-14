import { useApiFetch } from '../../hooks/useApiFetch';
import { useEffect, useState } from 'react';
import * as TextChunk from '../../../core/model/TextChunk';
import * as Channel from '../../../core/model/Channel';
export const useReportReasons = ({ source, sourceId, sourceOwnerId, }) => {
    const apiFetch = useApiFetch();
    const [content, setContent] = useState({
        categories: [],
        header: '',
        moreInfo: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const loadReasons = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch('reports.getReportFormData', {
                    source,
                    source_id: sourceId,
                    source_owner_id: sourceOwnerId,
                });
                const categories = res.reason_categories.map((apiReasonCategory) => {
                    const reasons = [];
                    for (const apiReason of apiReasonCategory.reasons) {
                        if (!Channel.isReportReasonId(apiReason.id)) {
                            continue;
                        }
                        void reasons.push({
                            id: apiReason.id,
                            label: apiReason.label,
                            description: apiReason.description,
                        });
                    }
                    return {
                        label: apiReasonCategory.label,
                        description: apiReasonCategory.description,
                        explanation: apiReasonCategory.explanation,
                        moreInfo: parseMoreInfo(apiReasonCategory.more || ''),
                        commentField: apiReasonCategory.comment_field
                            ? parseCommentField(apiReasonCategory.comment_field)
                            : undefined,
                        reasons,
                    };
                });
                setContent({
                    categories,
                    moreInfo: parseMoreInfo(res.more),
                    header: res.header,
                });
            }
            catch { }
            setIsLoading(false);
        };
        loadReasons();
    }, [apiFetch, source, sourceId, sourceOwnerId]);
    return {
        ...content,
        isLoading,
    };
};
const parseMoreInfo = (text) => TextChunk.fromServerText(text).filter((chunk) => chunk.kind === 'Text' || chunk.kind === 'Url');
const parseCommentField = ({ is_multiline: isMultiline, is_required: isRequired, label, description, placeholder, }) => {
    return {
        isMultiline,
        isRequired,
        label,
        description,
        placeholder,
    };
};
//# sourceMappingURL=useReportReasons.js.map