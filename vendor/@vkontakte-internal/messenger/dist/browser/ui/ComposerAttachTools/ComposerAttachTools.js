import '../../ui/ComposerAttachTools/ComposerAttachTools.css';
import React, { useMemo } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon24PenOutline, Icon28MagnifierPlus } from '@vkontakte/icons';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Link, ExternalLink } from '../../ui/Link/Link';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useRouter } from '../../ui/Router/Router';
export const ComposerAttachTools = ({ media, source, }) => {
    const { lang } = useBrowserEnv();
    const { screenRoute } = useRouter();
    const mediaContent = useMemo(() => {
        switch (media.kind) {
            case 'Photo':
                return (React.createElement(Tooltip, { content: lang.use('me_composer_attach_photo_open_tooltip'), position: "top", align: "center" },
                    React.createElement(Link, { "aria-label": lang.use('me_composer_attach_photo_open_tooltip'), className: "ComposerAttachToolsItem", to: {
                            kind: 'AttachMediaProxyRoute',
                            attach: media,
                            source: {
                                kind: source,
                            },
                        } },
                        React.createElement(Icon28MagnifierPlus, null))));
            case 'Video':
                return (React.createElement(Tooltip, { content: lang.use('me_composer_attach_photo_open_tooltip'), position: "top", align: "center" },
                    React.createElement(Link, { "aria-label": lang.use('me_composer_attach_photo_open_tooltip'), className: "ComposerAttachToolsItem", to: {
                            kind: 'AttachMediaProxyRoute',
                            attach: media,
                            source: {
                                kind: source,
                            },
                        } },
                        React.createElement(Icon28MagnifierPlus, null))));
            case 'Doc':
                return (React.createElement(Tooltip, { content: lang.use('me_composer_attach_photo_open_tooltip'), position: "top", align: "center" },
                    React.createElement(ExternalLink, { "aria-label": lang.use('me_composer_attach_photo_open_tooltip'), className: "ComposerAttachToolsItem", href: media.url },
                        React.createElement(Icon28MagnifierPlus, null))));
            case 'Poll':
                return (React.createElement(Tooltip, { content: lang.use('me_composer_attach_edit_tooltip'), position: "top", align: "center" },
                    React.createElement(Link, { "aria-label": lang.use('me_composer_attach_edit_tooltip'), className: "ComposerAttachToolsItem", to: { ...screenRoute, createPoll: true }, preventDefault: true },
                        React.createElement(Icon24PenOutline, null))));
            default:
                exhaustivenessCheck(media);
        }
    }, [media, screenRoute, lang, source]);
    return (React.createElement("div", { className: "ComposerAttachToolsContainer" },
        React.createElement("div", { className: "ComposerAttachTools" }, mediaContent)));
};
//# sourceMappingURL=ComposerAttachTools.js.map