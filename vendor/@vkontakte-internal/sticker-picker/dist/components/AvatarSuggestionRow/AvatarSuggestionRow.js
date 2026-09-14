import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { Headline, InnerHTML, Paragraph, useAppearance, } from '@vkontakte-internal/vkcom-kit';
import { $stickersVerticalGap } from '../../model/stickers/variant';
import { $avatarSuggestion } from '../../model/helpHint/avatarSuggestionBanner/info';
import { hideHelpHint } from '../../model/helpHint/hide';
import { HelpHintIdTypes } from '../../model/helpHint/helpHint';
import { useStickersKeyboard } from '../../hooks/stickersKeyboard';
import styles from './AvatarSuggestionRow.module.css';
export const AvatarSuggestionRow = ({ Component, ...props }) => {
    const appearance = useAppearance();
    const { onVmojiSuggestionClick } = useStickersKeyboard();
    const avatarSuggestion = useStore($avatarSuggestion);
    const stickersVerticalGap = useStore($stickersVerticalGap);
    if (!onVmojiSuggestionClick) {
        return null;
    }
    const handleDismiss = (event) => {
        event.preventDefault();
        event.stopPropagation();
        hideHelpHint(HelpHintIdTypes.VMOJI_AVATAR_SUGGESTION);
    };
    const src = avatarSuggestion?.resources?.find((item) => item.key === `image_${appearance}`)?.value;
    const title = avatarSuggestion?.title;
    const description = avatarSuggestion?.description;
    return (_jsx(Component, { style: {
            '--stickers-vertical-gap': `${stickersVerticalGap}px`,
        }, className: styles.banner, asideMode: "dismiss", onDismiss: handleDismiss, onClick: onVmojiSuggestionClick, mode: "image", imageTheme: "light", before: _jsx("div", { className: styles.placeholder }), background: _jsx("div", { className: styles.character, style: {
                backgroundImage: `url('${src}')`,
            } }), header: title && _jsx(Headline, { level: "1", children: title }), subheader: description && (_jsx(Paragraph, { children: _jsx(InnerHTML, { children: description }) })), ...props }));
};
//# sourceMappingURL=AvatarSuggestionRow.js.map