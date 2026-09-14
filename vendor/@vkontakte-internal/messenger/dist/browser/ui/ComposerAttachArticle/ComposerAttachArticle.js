import { Icon20ArticleOutline, Icon24ArticleOutline } from '@vkontakte/icons';
import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
export const ComposerAttachArticle = ({ article, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20ArticleOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24ArticleOutline, null) })), main: lang.use('me_attaches_article'), secondary: article.title }));
};
//# sourceMappingURL=ComposerAttachArticle.js.map