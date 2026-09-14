import React, { useEffect, useRef, useState } from 'react';
import { escape } from '@vkontakte/vkjs';
import * as Channel from '../../../core/model/Channel';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useUrlFromBaseUrl, useChannels, } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ReportCategoriesList, ReportContentPreview, ReportModal, ReportModalFooter, ReportReasonsList, } from '../../ui/ReportModal/ReportModalBase';
import { Icon24CheckCircleOutline, Icon28ErrorCircleOutline, } from '@vkontakte/icons';
import { useReportReasons, } from '../../ui/ReportModal/useReportReasons';
import { Avatar, Button, FormItem, Spinner, Textarea } from '@vkontakte/vkui';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useNow } from '../../hooks/useNow';
import { EntitySnippet } from '@vkontakte-internal/vkcom-kit';
export const ReportConvoMessageModal = ({ peerId, messages, onClose, onSubmit, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const message = messages[0];
    const { categories, header, moreInfo, isLoading } = useReportReasons({
        source: 'message',
    });
    const handleCategorySelect = (category) => {
        const reason = category.reasons[0];
        if (!reason) {
            return;
        }
        dispatch({
            type: 'UserDeleteMessage',
            userAction: 'delete',
            messages: messages,
            peerId: peerId,
            deleteType: 'spam',
            reason: reason.id,
        });
        snackbar({
            message: lang.use('me_report_channel_modal_success'),
            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
        });
        onClose();
        onSubmit();
    };
    if (!message) {
        return null;
    }
    return (React.createElement(ReportModal, { header: header, preview: React.createElement(ReportContentPreview, { peerId: message.authorId, chunks: message.chunks, attaches: message.attaches, date: message.sentAt }), list: isLoading ? (React.createElement(Spinner, { size: "m", className: "ReportModal__spinner" })) : (React.createElement(ReportCategoriesList, { onCategorySelect: handleCategorySelect, reasonCategories: categories })), footer: React.createElement(ReportModalFooter, { chunks: moreInfo }), onClose: onClose }));
};
export const ReportChannelPostModal = ({ post, onClose, isCommunityChannel, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const [categoryLevel, setCategoryLevel] = useState(0);
    const channels = useChannels();
    const channel = channels.get(post.channelId);
    const channelParentGroupId = channel?.kind === 'Channel' ? channel?.parentId : undefined;
    const { categories, header, moreInfo, isLoading } = useReportReasons({
        source: isCommunityChannel ? 'channel' : 'wall',
        sourceId: post.cmid,
        sourceOwnerId: post.channelId,
    });
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [selectedReason, setSelectedReason] = useState(undefined);
    const handleReportConfirm = () => {
        const reason = selectedReason || selectedCategory?.reasons[0];
        if (!reason) {
            return;
        }
        dispatch({
            type: 'UserChangedChannelPost',
            cmid: post.cmid,
            channelId: post.channelId,
            userAction: {
                kind: 'report',
                reason: reason.id,
            },
        });
        snackbar({
            message: lang.use('me_report_channel_modal_success'),
            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
        });
        onClose();
    };
    const resetCategory = () => {
        setCategoryLevel(0);
        setSelectedCategory(undefined);
    };
    const preview = (React.createElement(ReportContentPreview, { chunks: post.chunks, attaches: post.attaches, 
        /**
         * хак для новых каналов. Пока каналы жестко связаны с соо, то мы можем в качестве id пира передать
         * parentid. И он будет корректно отображаться в модалке
         */
        peerId: Peer.resolveId(channelParentGroupId || post.channelId), date: post.sentAt }));
    useEffect(() => {
        if (selectedCategory) {
            setCategoryLevel(1);
        }
    }, [selectedCategory]);
    if (selectedCategory) {
        const showList = selectedCategory.reasons.length > 1;
        const subHeader = (!showList && selectedCategory.reasons[0]?.description) || undefined;
        return (React.createElement(ReportModal, { header: selectedCategory.explanation, subHeader: subHeader, preview: preview, list: showList ? (React.createElement(ReportReasonsList, { reasons: selectedCategory.reasons, selectedReasonId: selectedReason?.id, onReasonSelect: setSelectedReason })) : undefined, footer: React.createElement(ReportModalFooter, { chunks: selectedCategory.moreInfo }), buttons: [
                React.createElement(Button, { key: "cancel", size: "m", mode: "secondary", appearance: "accent", onClick: onClose }, lang.use('me_cancel')),
                React.createElement(Button, { key: "submit", size: "m", mode: "primary", appearance: "accent", disabled: !selectedReason && showList, onClick: handleReportConfirm }, lang.use('me_report_modal_button')),
            ], onClose: onClose }));
    }
    return (React.createElement(ReportModal, { level: categoryLevel, header: header, preview: preview, list: isLoading ? (React.createElement(Spinner, { size: "m", className: "ReportModal__spinner" })) : (React.createElement(ReportCategoriesList, { withChevron: true, reasonCategories: categories, onCategorySelect: setSelectedCategory })), footer: React.createElement(ReportModalFooter, { chunks: moreInfo }), onClose: onClose, onBack: resetCategory }));
};
export const ReportCommentModal = ({ comment, onClose, sourceOwnerId, onReport, }) => {
    const { lang } = useBrowserEnv();
    const [categoryLevel, setCategoryLevel] = useState(0);
    const { categories, header, moreInfo, isLoading } = useReportReasons({
        source: comment.channelType === "community_channel" /* ChannelType.COMMUNITY_CHANNEL */
            ? 'channel_comment'
            : 'comment',
        sourceId: comment.cmid,
        sourceOwnerId,
    });
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [selectedReason, setSelectedReason] = useState(undefined);
    const handleReportConfirm = () => {
        const reason = selectedReason || selectedCategory?.reasons[0];
        if (!reason) {
            return;
        }
        onReport(reason.id);
        onClose();
    };
    const resetCategory = () => {
        setCategoryLevel(0);
        setSelectedCategory(undefined);
    };
    const preview = (React.createElement(ReportContentPreview, { chunks: comment.chunks, attaches: comment.attaches, peerId: Peer.resolveId(comment.peerId), date: comment.sentAt }));
    useEffect(() => {
        if (selectedCategory) {
            setCategoryLevel(1);
        }
    }, [selectedCategory]);
    if (selectedCategory) {
        const showList = selectedCategory.reasons.length > 1;
        const subHeader = (!showList && selectedCategory.reasons[0]?.description) || undefined;
        return (React.createElement(ReportModal, { header: selectedCategory.explanation, subHeader: subHeader, preview: preview, list: showList ? (React.createElement(ReportReasonsList, { reasons: selectedCategory.reasons, selectedReasonId: selectedReason?.id, onReasonSelect: setSelectedReason })) : undefined, footer: React.createElement(ReportModalFooter, { chunks: selectedCategory.moreInfo }), buttons: [
                React.createElement(Button, { key: "cancel", size: "m", mode: "secondary", appearance: "accent", onClick: onClose }, lang.use('me_cancel')),
                React.createElement(Button, { key: "submit", size: "m", mode: "primary", appearance: "accent", disabled: !selectedReason && showList, onClick: handleReportConfirm }, lang.use('me_report_modal_button')),
            ], onClose: onClose }));
    }
    return (React.createElement(ReportModal, { level: categoryLevel, header: header, preview: preview, list: isLoading ? (React.createElement(Spinner, { size: "m", className: "ReportModal__spinner" })) : (React.createElement(ReportCategoriesList, { withChevron: true, reasonCategories: categories, onCategorySelect: setSelectedCategory })), footer: React.createElement(ReportModalFooter, { chunks: moreInfo }), onClose: onClose, onBack: resetCategory }));
};
export const ReportAttachModal = ({ attach, onClose, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const [categoryLevel, setCategoryLevel] = useState(0);
    let source = null;
    const attachPreview = {};
    switch (attach.kind) {
        case 'Video':
            source = 'video';
            attachPreview.videos = [attach];
            break;
        case 'Photo':
            source = 'photo';
            attachPreview.photos = [attach];
            break;
        default:
            exhaustivenessCheck(attach);
    }
    const { categories, header, moreInfo, isLoading } = useReportReasons({
        source,
        sourceId: attach.id,
        sourceOwnerId: attach.ownerId,
    });
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [selectedReason, setSelectedReason] = useState(undefined);
    const handleReportConfirm = () => {
        const reason = selectedReason || selectedCategory?.reasons[0];
        if (!reason) {
            return;
        }
        dispatch({
            type: 'UserReportAttach',
            attach,
            reason: reason.id,
        });
        snackbar({
            message: lang.use('me_report_attach_modal_success'),
            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
        });
        onClose();
    };
    const resetCategory = () => {
        setCategoryLevel(0);
        setSelectedCategory(undefined);
    };
    const preview = (React.createElement(ReportContentPreview, { chunks: [], attaches: attachPreview, peerId: Peer.resolveId(attach.ownerId), date: attach.uploadDate || now }));
    useEffect(() => {
        if (selectedCategory) {
            setCategoryLevel(1);
        }
    }, [selectedCategory]);
    if (selectedCategory) {
        const showList = selectedCategory.reasons.length > 1;
        const subHeader = (!showList && selectedCategory.reasons[0]?.description) || undefined;
        return (React.createElement(ReportModal, { header: selectedCategory.explanation, subHeader: subHeader, preview: preview, onClose: onClose, list: showList ? (React.createElement(ReportReasonsList, { reasons: selectedCategory.reasons, selectedReasonId: selectedReason?.id, onReasonSelect: setSelectedReason })) : undefined, footer: React.createElement(ReportModalFooter, { chunks: selectedCategory.moreInfo }), buttons: [
                React.createElement(Button, { key: "cancel", size: "m", mode: "secondary", appearance: "accent", onClick: onClose }, lang.use('me_cancel')),
                React.createElement(Button, { key: "submit", size: "m", mode: "primary", appearance: "accent", disabled: !selectedReason && showList, onClick: handleReportConfirm }, lang.use('me_report_modal_button')),
            ] }));
    }
    return (React.createElement(ReportModal, { level: categoryLevel, header: header, preview: preview, list: isLoading ? (React.createElement(Spinner, { size: "m", className: "ReportModal__spinner" })) : (React.createElement(ReportCategoriesList, { withChevron: true, reasonCategories: categories, onCategorySelect: setSelectedCategory })), footer: React.createElement(ReportModalFooter, { chunks: moreInfo }), onClose: onClose, onBack: resetCategory }));
};
export const ReportChannelModal = ({ channel, onClose, }) => {
    const { lang } = useBrowserEnv();
    const $reasonComment = useRef(null);
    const [categoryLevel, setCategoryLevel] = useState(0);
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const { categories, header, moreInfo, isLoading } = useReportReasons({
        source: isCommunityChannel ? 'community_channel' : 'wall',
        sourceOwnerId: channel.id,
    });
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [selectedReason, setSelectedReason] = useState(undefined);
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const handleReportConfirm = () => {
        const reason = selectedReason || selectedCategory?.reasons[0];
        if (!reason) {
            return;
        }
        const comment = escape($reasonComment.current?.value ?? '');
        dispatch({
            type: 'UserChangedChannel',
            channelId: channel.id,
            userAction: 'report',
            payload: {
                reason: reason.id,
                comment: comment.length ? comment : undefined,
            },
            onComplete: () => {
                snackbar({
                    message: lang.use('me_report_channel_modal_success'),
                    before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                });
            },
            onFail: () => {
                snackbar({
                    message: lang.use('me_report_modal_unexpected_error'),
                    before: (React.createElement(Icon28ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
                });
            },
        });
        onClose();
    };
    const resetCategory = () => {
        setCategoryLevel(0);
        setSelectedCategory(undefined);
    };
    const photoUrl = useUrlFromBaseUrl(channel?.photo, 80, 80);
    const preview = (React.createElement(EntitySnippet, { header: channel.name, caption: lang.use('me_channel_report_modal_caption'), after: React.createElement(Avatar, { size: 80, src: photoUrl }) }));
    useEffect(() => {
        if (selectedCategory) {
            setCategoryLevel(1);
        }
    }, [selectedCategory]);
    if (selectedCategory) {
        const showList = selectedCategory.reasons.length > 1;
        const subHeader = (!showList && selectedCategory.reasons[0]?.description) || undefined;
        const commentField = selectedCategory.commentField;
        return (React.createElement(ReportModal, { header: selectedCategory.explanation, subHeader: subHeader, preview: preview, level: categoryLevel, list: React.createElement(React.Fragment, null,
                showList && (React.createElement(ReportReasonsList, { reasons: selectedCategory.reasons, selectedReasonId: selectedReason?.id, onReasonSelect: setSelectedReason })),
                commentField && (React.createElement(FormItem, { top: commentField.label },
                    React.createElement(Textarea, { getRef: $reasonComment, required: commentField.isRequired, "aria-multiline": commentField.isMultiline, rows: commentField.isMultiline ? 2 : 1, placeholder: commentField.placeholder })))), footer: React.createElement(ReportModalFooter, { chunks: selectedCategory.moreInfo }), buttons: [
                React.createElement(Button, { key: "cancel", size: "m", mode: "secondary", appearance: "accent", onClick: onClose }, lang.use('me_cancel')),
                React.createElement(Button, { key: "submit", size: "m", mode: "primary", appearance: "accent", disabled: !selectedReason && showList, onClick: handleReportConfirm }, lang.use('me_report_modal_button')),
            ], onClose: onClose, onBack: resetCategory }));
    }
    return (React.createElement(ReportModal, { header: header, preview: preview, level: categoryLevel, list: isLoading ? (React.createElement(Spinner, { size: "m", className: "ReportModal__spinner" })) : (React.createElement(ReportCategoriesList, { withChevron: true, reasonCategories: categories, onCategorySelect: setSelectedCategory })), footer: React.createElement(ReportModalFooter, { chunks: moreInfo }), onClose: onClose, onBack: resetCategory }));
};
//# sourceMappingURL=ReportModal.js.map