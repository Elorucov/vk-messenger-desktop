import '../../ui/ComposerAttachPhoto/ComposerAttachPhoto.css';
import React from 'react';
import { ComposerAttachPreview } from '../../ui/ComposerAttachPreview/ComposerAttachPreview';
import { ComposerAttachTools } from '../../ui/ComposerAttachTools/ComposerAttachTools';
export const ComposerAttachPhoto = ({ photo, isCompactView, source, }) => {
    return (React.createElement("div", { className: "ComposerAttachPhoto" },
        React.createElement(ComposerAttachPreview, { media: photo }),
        !isCompactView && photo.kind !== 'OptimisticPhoto' && (React.createElement(ComposerAttachTools, { media: photo, source: source }))));
};
//# sourceMappingURL=ComposerAttachPhoto.js.map