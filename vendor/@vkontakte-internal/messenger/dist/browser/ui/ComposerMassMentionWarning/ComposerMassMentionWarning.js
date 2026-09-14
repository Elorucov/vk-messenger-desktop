import React from 'react';
import { CardInline } from '../../ui/CardInline/CardInline';
import { Icon16Cancel, Icon28MentionOutline } from '@vkontakte/icons';
import './ComposerMassMentionWarning.css';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
export const ComposerMassMentionWarning = ({ membersCount, isCompactView, onClose, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(CardInline, { className: cx('ComposerMassMentionWarning', {
            'ComposerMassMentionWarning--compact': isCompactView,
        }), image: React.createElement("div", { className: "ComposerMassMentionWarning__image" },
            React.createElement(Icon28MentionOutline, null)), content: React.createElement(React.Fragment, null,
            React.createElement("div", { className: "ComposerMassMentionWarning__caption" }, lang.use('me_composer_autocomplete_warning_caption')),
            React.createElement("div", { className: "ComposerMassMentionWarning__description" }, lang.use('me_composer_autocomplete_warning_description', {
                // -1 участник, потому что текущий пользователь тоже является участником беседы
                num: membersCount - 1,
            }))), actions: React.createElement("div", { className: "ComposerMassMentionWarning__actions" },
            React.createElement("button", { className: "ComposerMassMentionWarning__action", onClick: onClose },
                React.createElement(Icon16Cancel, null))) }));
};
//# sourceMappingURL=ComposerMassMentionWarning.js.map