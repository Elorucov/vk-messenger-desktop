import './ComposerAttachDoc.css';
import React from 'react';
import { ComposerAttachCard, ComposerFileAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20DocumentOutline } from '@vkontakte/icons';
import { formatFileSize } from '../../../core/utils/misc';
import { ComposerAttachPreviewMeta } from '../../ui/ComposerAttachPreviewMeta/ComposerAttachPreviewMeta';
import { ComposerAttachTools } from '../../ui/ComposerAttachTools/ComposerAttachTools';
import { ComposerAttachPreview } from '../../ui/ComposerAttachPreview/ComposerAttachPreview';
import cx from 'classnames';
export const ComposerAttachDoc = ({ doc, isCompactView, source, }) => {
    const docInfo = getDocInfo(doc);
    if (doc.image) {
        return (React.createElement("div", { className: cx('ComposerAttachDoc', {
                'ComposerAttachDoc--withTools': !isCompactView,
            }) },
            React.createElement(ComposerAttachPreview, { media: doc }),
            React.createElement(ComposerAttachPreviewMeta, { bottom: true, left: true },
                React.createElement("span", { className: "ComposerAttachDoc__meta" }, docInfo)),
            !isCompactView && doc.kind !== 'OptimisticDoc' && (React.createElement(ComposerAttachTools, { source: source, media: doc }))));
    }
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20DocumentOutline, null)) : (React.createElement(ComposerFileAttachCardIcon, { ext: doc.ext })), main: doc.title, secondary: isCompactView ? docInfo : formatFileSize(doc.size), isCompactView: isCompactView }));
};
function getDocInfo(doc) {
    return `${doc.ext.toUpperCase()} · ${formatFileSize(doc.size)}`;
}
//# sourceMappingURL=ComposerAttachDoc.js.map