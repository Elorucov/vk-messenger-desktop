import '../../ui/AttachPhotoAlbum/AttachPhotoAlbum.css';
import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon24PhotosStackOutline } from '@vkontakte/icons';
import { Link } from '../../ui/Link/Link';
import { getExpectedAttachPhotoWidth } from '../../ui/AttachCard/AttachCard';
export const AttachPhotoAlbum = ({ album, isInBubble, isOut, }) => {
    const { lang } = useBrowserEnv();
    const picture = Attach.preview(album, getExpectedAttachPhotoWidth(), 0);
    return (React.createElement(Link, { to: {
            kind: 'AttachProxyRoute',
            attach: album,
        }, className: "AttachPhotoAlbum" },
        React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, title: album.title, subtitle: [
                lang.use('me_attaches_album'),
                lang.use('me_attaches_album_photos', {
                    num: album.size,
                }),
            ], image: picture?.url || React.createElement(Icon24PhotosStackOutline, null) })));
};
//# sourceMappingURL=AttachPhotoAlbum.js.map