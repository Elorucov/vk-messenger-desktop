import '../../ui/PostCommentNegativePlaceholder/PostCommentNegativePlaceholder.css';
import React from 'react';
import { PostCommentLayout } from '../../ui/PostComment/PostComment';
import { useLottie } from '@vkontakte-internal/rlottie';
import { Avatar, Footnote, Headline, Spinner } from '@vkontakte/vkui';
import cx from 'classnames';
const CommentNegativePlaceholderAvatar = ({ animationUrl, }) => {
    const { lottieContainerRef } = useLottie({
        group: 'channel_negative_comments',
        loop: true,
        autoplay: true,
        upscale: true,
        name: animationUrl || 'channel_negative_comments',
        animationUrl,
    });
    return (React.createElement(Avatar, { size: 28, className: "PostCommentNegativePlaceholderAvatar" },
        React.createElement("div", { ref: lottieContainerRef, className: "PostCommentNegativePlaceholderAvatar__lottie" })));
};
export const CommentNegativePlaceholder = (props) => {
    const { placeholder, onClick, className, isLoading, ...rest } = props;
    if (isLoading) {
        return React.createElement(Spinner, { size: "s" });
    }
    return (React.createElement("div", { ...rest, className: cx('PostCommentNegative__wrapper', className), onClick: onClick, role: "button", "data-testId": "post_comments_history_load_more" },
        React.createElement(PostCommentLayout, { avatar: React.createElement(CommentNegativePlaceholderAvatar, { animationUrl: placeholder.animation }) },
            placeholder.title && React.createElement(Headline, null, placeholder.title),
            placeholder.subtitle && (React.createElement(Footnote, { weight: "3", className: "PostCommentNegativePlaceholder__subtitle" }, placeholder.subtitle)))));
};
//# sourceMappingURL=PostCommentNegativePlaceholder.js.map