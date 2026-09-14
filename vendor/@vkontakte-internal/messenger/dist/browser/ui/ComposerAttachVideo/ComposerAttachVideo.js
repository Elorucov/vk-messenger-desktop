import '../../ui/ComposerAttachVideo/ComposerAttachVideo.css';
import React from 'react';
import { formatDuration } from '../../../core/utils/misc';
import { Icon12Play } from '@vkontakte/icons';
import { ComposerAttachPreviewMeta } from '../../ui/ComposerAttachPreviewMeta/ComposerAttachPreviewMeta';
import { ComposerAttachPreview } from '../../ui/ComposerAttachPreview/ComposerAttachPreview';
import { ComposerAttachTools } from '../../ui/ComposerAttachTools/ComposerAttachTools';
import cx from 'classnames';
export const ComposerAttachVideo = ({ video, isCompactView, source, }) => {
    const { duration } = video;
    return (React.createElement("div", { className: cx('ComposerAttachVideo', {
            'ComposerAttachVideo--withTools': !isCompactView,
        }) },
        React.createElement(ComposerAttachPreview, { media: video }),
        !!duration && (React.createElement(ComposerAttachPreviewMeta, { bottom: true, left: true },
            !isCompactView && (React.createElement("i", { className: "ComposerAttachVideo__videoPlay" },
                React.createElement(Icon12Play, null))),
            formatDuration(duration))),
        !isCompactView && video.kind !== 'OptimisticVideo' && (React.createElement(ComposerAttachTools, { media: video, source: source }))));
};
//# sourceMappingURL=ComposerAttachVideo.js.map