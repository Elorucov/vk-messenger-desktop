import './SferumMigrateToMaxComposer.css';
import React from 'react';
import { Icon24ChevronCompactRight } from '@vkontakte/icons';
import { Subhead } from '@vkontakte-internal/vkcom-kit';
import { ExternalLink } from '../../ui/Link/Link';
import { AssetImg } from '../../ui/AssetImg/AssetImg';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
export const SferumMigrateToMaxComposer = ({ convo, }) => {
    const hasLink = Boolean(convo.transitionData?.link);
    const href = convo.transitionData?.link ?? '#';
    return (React.createElement(ExternalLink, { href: href, disabled: !hasLink, className: "SferumMigrateToMaxComposer" },
        React.createElement(AssetImg, { width: 28, height: 28, fileName: "static/png/drawable-xxhdpi/logo_max_x_sferum_80.png" }),
        React.createElement(Subhead, { className: "SferumMigrateToMaxComposer__text" },
            React.createElement(FormattedLangKey, { values: { bold: (text) => React.createElement("b", null, text) }, langkey: hasLink
                    ? 'me_sferum_offboarding_input_banner_with_link'
                    : 'me_sferum_offboarding_input_banner' })),
        hasLink && React.createElement(Icon24ChevronCompactRight, null)));
};
//# sourceMappingURL=SferumMigrateToMaxComposer.js.map