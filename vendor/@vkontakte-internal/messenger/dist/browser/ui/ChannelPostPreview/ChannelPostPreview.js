import '../../ui/ChannelPostPreview/ChannelPostPreview.css';
import React from 'react';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import * as Post from '../../../core/model/Post';
import * as Attach from '../../../core/model/Attach';
import { AttachText } from '../../ui/AttachText/AttachText';
import cx from 'classnames';
import { PlainText } from '../../ui/PlainText/PlainText';
export const ChannelPostPreview = ({ post, isDeleted, className, }) => {
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    if (!post) {
        return (React.createElement(EmptyChannelPostPreview, { className: className, text: lang.use('me_channels_list_item_placeholder') }));
    }
    if (isDeleted) {
        return (React.createElement(EmptyChannelPostPreview, { className: className, text: lang.use('me_channel_post_deleted') }));
    }
    if (post.kind === 'Normal' && post.donut?.placeholder) {
        return (React.createElement(EmptyChannelPostPreview, { className: className, text: featureFlags.vkm_channel_donut_redesign && post.donut?.paywall
                ? post.donut?.paywall?.hint_text
                : lang.use('me_channels_list_item_donut_placeholder') }));
    }
    if (Post.isEmpty(post)) {
        return (React.createElement("span", { className: cx('ChannelPostPreview', className) },
            React.createElement("span", { className: "ChannelPostPreview__empty" }, lang.use('me_empty_post'))));
    }
    const attachmentPreview = getAttachmentPreview(post, lang);
    return (React.createElement("span", { className: cx('ChannelPostPreview', className) },
        React.createElement(PlainText, { chunks: post.chunks, multiline: false }),
        attachmentPreview && (React.createElement("span", { className: "ChannelPostPreview__attach" },
            post.chunks.length > 0 && ' [',
            attachmentPreview,
            post.chunks.length > 0 && ']'))));
};
export function getAttachmentPreview(post, lang) {
    const attachmentKindsCount = Attach.kindsCount(post.attaches);
    const attachmentsCount = Attach.count(post.attaches);
    if (attachmentKindsCount > 1) {
        // X вложений
        return lang.use('me_attaches_attaches', {
            num: attachmentsCount,
        });
    }
    const attach = Object.values(post.attaches)[0];
    if (attach) {
        return React.createElement(AttachText, { attach: attach });
    }
    return null;
}
function EmptyChannelPostPreview({ className, text, }) {
    return (React.createElement("span", { className: cx('ChannelPostPreview', className) },
        React.createElement("span", { className: "ChannelPostPreview__empty" }, text)));
}
//# sourceMappingURL=ChannelPostPreview.js.map