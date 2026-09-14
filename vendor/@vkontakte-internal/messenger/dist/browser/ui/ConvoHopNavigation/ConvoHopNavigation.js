import './ConvoHopNavigation.css';
import React from 'react';
import cx from 'classnames';
import * as Convo from '../../../core/model/Convo';
import { Icon20MentionOutline, Icon20Dropdown } from '@vkontakte/icons';
import { HopNavigationButton } from '../../ui/HopNavigationButton/HopNavigationButton';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { ReactionHopNavigation } from '../../ui/ReactionHopNavigation/ReactionHopNavigation';
export const ConvoHopNavigation = ({ convo, onReactionsClick, onMentionsClick, onUnreadClick, onReactionsReadAllClick, isUnreadVisible, className, }) => {
    const featureFlags = useFeatureFlags();
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('ConvoHopNavigation', className) },
        featureFlags.vkm_reactions && (React.createElement(ReactionHopNavigation, { count: convo.unreadReactions.size, isVisible: Convo.hasUnreadReactions(convo), onClick: onReactionsClick, onReactionsReadAllClick: onReactionsReadAllClick, title: lang.use('me_convo_hop_reaction', {
                num: convo.unreadReactions.size,
            }) })),
        convo.kind === 'ChatConvo' && (React.createElement(HopNavigationButton, { count: convo.unreadMentions.size, isVisible: Convo.hasUnreadMentions(convo) && isUnreadVisible, icon: React.createElement(Icon20MentionOutline, null), onClick: onMentionsClick, title: lang.use('me_convo_hop_mention', {
                num: convo.unreadMentions.size,
            }) })),
        React.createElement(HopNavigationButton, { count: convo.unreadCount, isVisible: isUnreadVisible, isCounterVisible: convo.unreadCount !== 0, icon: React.createElement(Icon20Dropdown, null), onClick: onUnreadClick, title: convo.unreadCount === 0
                ? lang.use('me_convo_hop_last')
                : lang.use('me_convo_hop_last_unread', {
                    num: convo.unreadCount,
                }) })));
};
export const ConvoPostponedHopNavigation = ({ isVisible, className, onClick }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('ConvoHopNavigation', className) },
        React.createElement(HopNavigationButton, { count: 0, isCounterVisible: false, isVisible: isVisible, icon: React.createElement(Icon20Dropdown, null), onClick: onClick, title: lang.use('me_convo_hop_last') })));
};
//# sourceMappingURL=ConvoHopNavigation.js.map