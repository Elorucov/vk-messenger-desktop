import '../../ui/AttachChannelStub/AttachChannelStubPhotoVideo.css';
import React from 'react';
import cx from 'classnames';
import { Skeleton } from '@vkontakte/vkui';
import { ComposerAttachPreviewMeta } from '../../ui/ComposerAttachPreviewMeta/ComposerAttachPreviewMeta';
import { formatFileSize } from '../../../core/utils/misc';
export const AttachChannelStubPhotoVideo = ({ width, height, ext, size, className }) => {
    const meta = ext && size ? [ext.toUpperCase(), formatFileSize(size)].join(' · ') : null;
    return (React.createElement("div", { className: "AttachChannelStubPhotoVideo" },
        React.createElement(Skeleton, { className: cx('AttachChannelStubPhotoVideo__skeleton', className), width: width, height: height }),
        meta && (React.createElement(ComposerAttachPreviewMeta, { rounded: true, top: true, left: true },
            React.createElement("span", { className: "AttachChannelStubPhotoVideo__meta" }, meta)))));
};
//# sourceMappingURL=AttachChannelStubPhotoVideo.js.map