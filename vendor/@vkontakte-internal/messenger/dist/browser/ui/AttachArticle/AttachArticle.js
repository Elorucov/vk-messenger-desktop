import React from 'react';
import '../../ui/AttachArticle/AttachArticle.css';
import * as Attach from '../../../core/model/Attach';
import { Link } from '../../ui/Link/Link';
import { Button } from '@vkontakte/vkui';
import { Icon12OnlineVkmobile } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
export const AttachArticle = ({ article, isCompact, isForwarded, }) => {
    const { lang } = useBrowserEnv();
    const image = getBackgroundImage(article, isCompact);
    const title = getTitleSliced(article.title, isCompact, isForwarded);
    const isNotAvailable = ['deleted', 'banned', 'unknown'].includes(article.state);
    return (React.createElement(Link, { to: { kind: 'AttachProxyRoute', attach: article }, className: cx('AttachArticle', {
            'AttachArticle--notAvailable': isNotAvailable,
            'AttachArticle--compact': isCompact,
            'AttachArticle--forwarded': isForwarded,
        }), style: { backgroundImage: `url(${image?.url})` }, disabled: isNotAvailable },
        React.createElement("div", { className: "AttachArticle__content" },
            isNotAvailable && (React.createElement("div", { className: "AttachArticle__notAvailableCaption" }, lang.use('me_attaches_article_not_available_caption'))),
            React.createElement("div", { className: "AttachArticle__title" }, title),
            React.createElement("div", { className: "AttachArticle__author" }, article.author),
            !isNotAvailable && (React.createElement(Button, { className: "AttachArticle__readBtn", mode: "primary", appearance: "overlay", before: React.createElement(Icon12OnlineVkmobile, null) }, lang.use('me_attaches_article_read_button'))))));
};
function getTitleSliced(title, isCompact = false, isForwarded = false) {
    let maxLen;
    if (isCompact && isForwarded) {
        maxLen = 45;
    }
    else if (isCompact) {
        maxLen = 50;
    }
    else {
        maxLen = 80;
    }
    return title.length > maxLen ? `${title.slice(0, maxLen).trim()}...` : title;
}
function getBackgroundImage(article, isCompact = false) {
    const EXPECTED_COMPACT_WIDTH = 260 * window.devicePixelRatio;
    return Attach.preview(article, isCompact ? EXPECTED_COMPACT_WIDTH : Infinity, undefined, true);
}
//# sourceMappingURL=AttachArticle.js.map