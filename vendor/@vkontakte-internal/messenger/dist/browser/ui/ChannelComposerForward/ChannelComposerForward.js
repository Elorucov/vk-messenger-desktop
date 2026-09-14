import React from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ComposerOverMessage } from '../../ui/ComposerOverMessage/ComposerOverMessage';
import { ChannelPostPreview } from '../../ui/ChannelPostPreview/ChannelPostPreview';
export const ChannelComposerForward = React.memo(({ className, channelId, forward }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    if (!forward) {
        return null;
    }
    const post = forward.items[0];
    const onRemoveForward = () => {
        dispatch({
            type: 'UserClearedChannelComposerDraft',
            channelId,
        });
    };
    return (React.createElement(ComposerOverMessage, { className: className, title: lang.use('me_channel_composer_forward_title'), content: React.createElement(ChannelPostPreview, { post: post }), isCompactView: false, highlighted: true, date: post.sentAt, onRemove: onRemoveForward }));
});
//# sourceMappingURL=ChannelComposerForward.js.map