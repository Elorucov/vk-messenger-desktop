import React from 'react';
import { Icon20QuestionOutline, Icon24QuestionOutline } from '@vkontakte/icons';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { useBrowserEnv } from '../../hooks/misc';
export const ComposerAttachQuestion = ({ isCompactView, question, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20QuestionOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24QuestionOutline, null) })), main: question, secondary: lang.use('me_attaches_question') }));
};
//# sourceMappingURL=ComposerAttachQuestion.js.map