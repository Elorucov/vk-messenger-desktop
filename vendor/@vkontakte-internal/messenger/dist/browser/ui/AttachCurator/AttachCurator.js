import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { AttachCard, getExpectedAttachPhotoWidth, } from '../../ui/AttachCard/AttachCard';
import { Icon24ExternalLinkOutline } from '@vkontakte/icons';
export const AttachCurator = ({ attach, isInBubble, isOut, }) => {
    const { url, title = '', subtitle = '' } = attach;
    const picture = Attach.preview(attach, getExpectedAttachPhotoWidth(), 0);
    return (React.createElement(AttachCard, { attach: attach, href: url, title: title, subtitle: subtitle, picture: picture?.url, picturePlaceholder: React.createElement(Icon24ExternalLinkOutline, null), alt: title, isInBubble: isInBubble, isOut: isOut }));
};
//# sourceMappingURL=AttachCurator.js.map