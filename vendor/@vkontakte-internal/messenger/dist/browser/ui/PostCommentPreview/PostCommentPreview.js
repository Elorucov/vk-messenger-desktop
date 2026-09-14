import '../../ui/PostCommentPreview/PostCommentPreview.css';
import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import * as Comment from '../../../core/model/Comment';
import { AttachText } from '../../ui/AttachText/AttachText';
import cx from 'classnames';
export const PostCommentPreview = ({ comment, className, }) => {
    const { lang } = useBrowserEnv();
    const attachmentKindsCount = getAttachmentKindsCount(comment);
    const hasAttaches = attachmentKindsCount !== 0;
    const plainText = Comment.toPlainText(comment, { multiline: false });
    let attachText = '';
    if (attachmentKindsCount > 1) {
        // X вложений
        attachText = lang.use('me_attaches_attaches', {
            num: attachmentKindsCount,
        });
    }
    else if (hasAttaches) {
        const attach = Object.values(comment.attaches)[0];
        if (attach) {
            attachText = React.createElement(AttachText, { attach: attach });
        }
    }
    return (React.createElement("span", { className: cx('PostCommentPreview', className) }, Comment.isEmpty(comment) ? (React.createElement("span", { className: "PostCommentPreview__empty" }, lang.use('me_empty_post'))) : (React.createElement(React.Fragment, null,
        plainText,
        hasAttaches && comment.chunks.length === 0 && (React.createElement("span", { className: "PostCommentPreview__attach" },
            " ",
            attachText))))));
};
function getAttachmentKindsCount(comment) {
    return Object.keys(comment.attaches).length;
}
//# sourceMappingURL=PostCommentPreview.js.map