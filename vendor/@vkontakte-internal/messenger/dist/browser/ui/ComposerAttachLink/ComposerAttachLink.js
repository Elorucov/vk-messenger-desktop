import '../../ui/ComposerAttachLink/ComposerAttachLink.css';
import { Icon20LinkCircleOutline, Icon24Link } from '@vkontakte/icons';
import { useBrowserEnv, usePixelDensity } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { PhotoItem } from '../../ui/PhotoItem/PhotoItem';
import * as Attach from '../../../core/model/Attach';
import React from 'react';
const PREVIEW_SIZE = 32;
export const ComposerAttachLink = ({ link, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    const isDense = usePixelDensity();
    const previewSize = getPreviewSize(isDense);
    const picture = Attach.preview(link, previewSize, 0, true);
    const photo = picture && (React.createElement(PhotoItem, { alt: link.title, className: "ComposerAttachLink__photo", src: picture.url, width: PREVIEW_SIZE, height: PREVIEW_SIZE, cover: true }));
    return (React.createElement(ComposerAttachCard, { icon: photo ||
            (isCompactView ? (React.createElement(Icon20LinkCircleOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24Link, null) }))), main: lang.use('me_attaches_link'), secondary: link.title || lang.use('me_attaches_link_title_fallback') }));
};
function getPreviewSize(isDense) {
    return isDense && typeof window !== 'undefined'
        ? PREVIEW_SIZE * (window.devicePixelRatio || 1)
        : PREVIEW_SIZE;
}
//# sourceMappingURL=ComposerAttachLink.js.map