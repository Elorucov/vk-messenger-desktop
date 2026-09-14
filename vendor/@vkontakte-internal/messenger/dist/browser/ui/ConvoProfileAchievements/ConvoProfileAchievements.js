import React, { memo } from 'react';
import { useConvoAchievements } from '../../hooks/useConvoAchievements';
import './ConvoProfileAchievements.css';
import { useBrowserEnv } from '../../hooks/misc';
import { resolveMiniAppId } from '../../../core/model/Attach';
import { EDU_ACHIEVEMENTS_MINI_APP_ID } from '../../../core/config/config';
import cx from 'classnames';
import { Link } from '../../ui/Link/Link';
import { Separator } from '@vkontakte/vkui';
export const ConvoProfileAchievements = memo(({ convo, className }) => {
    const { lang } = useBrowserEnv();
    const { achievements } = useConvoAchievements(convo.peerId);
    if (!achievements || achievements.length === 0) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Separator, null),
        React.createElement("div", { className: cx('ConvoProfileAchievements', className) },
            React.createElement("div", { className: "ConvoProfileAchievements__header" },
                React.createElement("span", { className: "ConvoProfileAchievements__achievementsLabel" }, lang.use('me_achievements')),
                React.createElement(Link, { className: "ConvoProfileAchievements__showAll", to: {
                        kind: 'MiniAppModal',
                        miniAppId: resolveMiniAppId(EDU_ACHIEVEMENTS_MINI_APP_ID),
                        hash: `user_id=${convo.peerId}`,
                    } }, lang.use('me_achievements_show_all'))),
            React.createElement("div", { className: "ConvoProfileAchievements__achievementsList" }, achievements.map((x) => (React.createElement(Link, { className: "ConvoProfileAchievements__achievementsLink", to: {
                    kind: 'MiniAppModal',
                    miniAppId: resolveMiniAppId(EDU_ACHIEVEMENTS_MINI_APP_ID),
                    hash: `user_id=${convo.peerId}&achievement_id=${x.id}`,
                } },
                React.createElement("img", { key: x.id, src: x.logo, alt: x.title }))))))));
});
//# sourceMappingURL=ConvoProfileAchievements.js.map