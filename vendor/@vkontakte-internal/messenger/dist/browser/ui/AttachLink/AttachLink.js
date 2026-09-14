import '../../ui/AttachLink/AttachLink.css';
import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { AttachCard, getExpectedAttachPhotoWidth, } from '../../ui/AttachCard/AttachCard';
import { Icon24ExternalLinkOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const AttachLink = ({ link: attach, isInBubble, isOut, }) => {
    const { lang } = useBrowserEnv();
    const { url, subtitle, title: attachTitle } = attach;
    const picture = Attach.preview(attach, getExpectedAttachPhotoWidth(), 0, true);
    const title = attachTitle || lang.use('me_attaches_link_title_fallback');
    return (React.createElement(AttachCard, { attach: attach, href: url, title: title, subtitle: subtitle, picture: picture?.url, picturePlaceholder: React.createElement(Icon24ExternalLinkOutline, null), alt: title, isInBubble: isInBubble, isOut: isOut }));
};
//# sourceMappingURL=AttachLink.js.map