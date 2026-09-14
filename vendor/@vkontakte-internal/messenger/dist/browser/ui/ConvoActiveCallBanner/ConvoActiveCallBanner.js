import '../../ui/ConvoActiveCallBanner/ConvoActiveCallBanner.css';
import React, { useState, useMemo, memo } from 'react';
import { BannerPanel, BannerButtons } from '../../ui/BannerPanel/BannerPanel';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { Icon16Phone } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { CallParticipantsStack } from '../../ui/CallParticipantsStack/CallParticipantsStack';
export const ConvoActiveCallBanner = memo(({ activeCall }) => {
    const { lang, calls, vkDomain } = useBrowserEnv();
    const peers = usePeers();
    const [visible, setVisible] = useState(true);
    const { joinLink, vkJoinLink, participants: { list: participantsList, count: participantsCount }, } = activeCall;
    const buttons = useMemo(() => {
        if (!joinLink || !calls) {
            return [];
        }
        return [
            React.createElement(Button, { key: "join", className: "ConvoActiveCallBanner__button", mode: "secondary", onClick: () => calls.showJoinPopup(vkJoinLink || `https://${vkDomain}/call/join/${joinLink}`, 'join_popup'), "aria-label": lang.use('me_open_call_aria_label') }, lang.use('me_group_call_join')),
        ];
    }, [joinLink, vkJoinLink, vkDomain, calls, lang]);
    const participantPhotos = useMemo(() => participantsList
        .map((peerId) => peers.get(peerId)?.photo)
        .filter((photo) => photo !== undefined), [participantsList, peers]);
    return (React.createElement(BannerPanel, { mode: "oneLine", isVisible: visible, onBannerClose: () => setVisible(false) },
        participantsCount > 0 ? (React.createElement(CallWithParticipants, { participantPhotos: participantPhotos, participantsCount: participantsCount })) : (React.createElement(EmptyCall, null)),
        React.createElement(BannerButtons, { buttons: buttons })));
});
const EmptyCall = () => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "ConvoActiveCallBanner" },
        React.createElement(Icon16Phone, { className: "ConvoActiveCallBanner__icon" }),
        React.createElement("span", { className: "ConvoActiveCallBanner__title" }, lang.use('me_group_call'))));
};
const CallWithParticipants = ({ participantPhotos, participantsCount }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "ConvoActiveCallBanner" },
        React.createElement(CallParticipantsStack, { participantsCount: participantsCount, photos: participantPhotos, className: "ConvoActiveCallBanner__icon" }),
        React.createElement("div", { className: "ConvoActiveCallBanner__description" },
            React.createElement("span", { className: "ConvoActiveCallBanner__title" }, lang.use('me_group_call')),
            React.createElement("span", { className: "ConvoActiveCallBanner__count" }, lang.use('me_group_call_participant_count', {
                num: participantsCount,
            })))));
};
//# sourceMappingURL=ConvoActiveCallBanner.js.map