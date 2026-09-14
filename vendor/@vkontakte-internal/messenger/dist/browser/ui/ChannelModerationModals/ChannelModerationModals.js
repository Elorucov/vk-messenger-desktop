import React from 'react';
import { useBrowserEnv, useDispatch, useChannel } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { useRouter } from '../../ui/Router/Router';
import { Button, ModalCard, ModalRoot } from '@vkontakte-internal/vkcom-kit';
import { IconIllustrationAgeLimit112h, IconIllustrationLgbt112h, IconIllustrationUnreliable112h, } from '@vkontakte-internal/icons-private';
import { AGE_LIMITS_MAPPING } from '../../ui/AdultBadge/AdultBadge';
import { useLayer } from '../../ui/Layer/Layer';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
export var CHANNEL_MAIN_MODALS;
(function (CHANNEL_MAIN_MODALS) {
    CHANNEL_MAIN_MODALS["ADULT_CONTENT_MODAL"] = "AdultContentModal";
    CHANNEL_MAIN_MODALS["CHANNEL_MODERATION_MODAL"] = "ChannelModerationModal";
    CHANNEL_MAIN_MODALS["FALSE_POST_INFORMATION_MODAL"] = "FalsePostInformationModal";
})(CHANNEL_MAIN_MODALS || (CHANNEL_MAIN_MODALS = {}));
const ModerationModals = ({ channel, activeModal, onClose, }) => {
    const { lang } = useBrowserEnv();
    const layer = useLayer();
    const dispatch = useDispatch();
    const { screenRoute, navigate } = useRouter();
    const ageLimit = channel.ageLimits
        ? AGE_LIMITS_MAPPING[channel.ageLimits]
        : '';
    const [titleLangKey, descriptionLangKey, linkUrlLangKey, linkTextLangKey] = getModerationBannerLangKeys(channel.warningNotification);
    const handleContinueButtonClick = () => {
        if (!channel.parentId || !channel.warningNotification) {
            return;
        }
        dispatch({
            type: 'UserAcceptedModerationWarning',
            channelId: channel.id,
            groupId: channel.parentId,
            notificationId: channel.warningNotification,
        });
        onClose();
    };
    const handleReturnButtonClick = () => {
        if ('parentRoute' in screenRoute && screenRoute.parentRoute) {
            navigate(screenRoute.parentRoute);
        }
        else {
            navigate({
                kind: 'MainRoute',
                organiser: screenRoute.organiser,
            });
        }
        onClose();
    };
    const handleOpenFalseInformationDetailsPage = () => {
        navigate({
            kind: 'RedirectRuntimeRoute',
            redirectUrl: lang.use('me_channel_safety_info_link'),
        });
    };
    return (React.createElement(ModalRoot, { usePortal: layer, activeModal: activeModal },
        React.createElement(ModalCard, { id: CHANNEL_MAIN_MODALS.ADULT_CONTENT_MODAL, onClose: onClose, style: {
                textAlign: 'center',
            }, actions: React.createElement(Button, { "data-testid": "adult_banner_ok_button", mode: "primary", size: "m", onClick: onClose }, lang.use('me_channel_age_limit_banner_button_text')), description: React.createElement("span", { "data-testid": "adult_banner_description" }, lang.use('me_channel_age_limit_banner_text', {
                values: {
                    n: ageLimit,
                },
            })), icon: React.createElement(IconIllustrationAgeLimit112h, null), title: React.createElement("span", { "data-testid": "adult_banner_title" }, lang.use('me_channel_age_limit_banner_title', {
                values: {
                    n: ageLimit,
                },
            })), titleComponent: "h2" }),
        React.createElement(ModalCard, { id: CHANNEL_MAIN_MODALS.CHANNEL_MODERATION_MODAL, onClose: handleReturnButtonClick, style: {
                textAlign: 'center',
            }, title: React.createElement("span", { "data-testid": "moderation_banner_title" }, lang.use(titleLangKey)), titleComponent: "h2", icon: channel.warningNotification === 5 ? (React.createElement(IconIllustrationLgbt112h, { "data-testid": "controversial_banner_icon" })) : (React.createElement(IconIllustrationUnreliable112h, { "data-testid": "false_information_banner_icon" })), description: React.createElement(FormattedLangKey, { "data-testid": "moderation_banner_description", langkey: descriptionLangKey, values: {
                    link: (React.createElement(Link, { className: "ModerationBanner_bannerPostLink", to: {
                            kind: 'ScreenNameProxyRoute',
                            screenName: lang.use(linkUrlLangKey),
                        } }, lang.use(linkTextLangKey))),
                } }), actions: React.createElement("div", { className: "ModerationBanner_buttonContainer" },
                React.createElement(Button, { "data-testid": "moderation_banner_return_button", mode: "primary", size: "m", onClick: handleReturnButtonClick }, 'parentRoute' in screenRoute && screenRoute.parentRoute
                    ? lang.use('me_channel_moderation_banner_return_button')
                    : lang.use('me_channel_moderation_banner_close_button')),
                React.createElement(Button, { "data-testid": "moderation_banner_continue_button", mode: "tertiary", size: "m", onClick: handleContinueButtonClick }, lang.use('me_channel_moderation_banner_continue_button'))) }),
        React.createElement(ModalCard, { id: CHANNEL_MAIN_MODALS.FALSE_POST_INFORMATION_MODAL, onClose: onClose, style: {
                textAlign: 'center',
            }, title: React.createElement("span", { "data-testid": "false_post_information_banner_title" }, lang.use('me_channel_post_false_information_title')), titleComponent: "h2", icon: React.createElement(IconIllustrationUnreliable112h, { "data-testid": "false_post_information_banner_icon" }), description: React.createElement("span", { "data-testid": "false_post_banner_description" }, lang.use('me_channel_post_false_information_text')), actions: React.createElement("div", { className: "ModerationBanner_buttonContainer" },
                React.createElement(Button, { "data-testid": "false_post_banner_continue_button", mode: "primary", size: "m", onClick: onClose }, lang.use('me_channel_post_false_information_continue_button')),
                React.createElement(Button, { "data-testid": "false_post_banner_details_button", mode: "tertiary", size: "m", onClick: handleOpenFalseInformationDetailsPage }, lang.use('me_channel_post_false_information_details_button'))) })));
};
export const ChannelModerationModals = ({ channelId, activeModal, onClose, }) => {
    const channel = useChannel(channelId, true);
    return channel.kind === 'Channel' ? (React.createElement(ModerationModals, { activeModal: activeModal, channel: channel, onClose: onClose })) : null;
};
/**
 * Возвращает массив с маппингом ключей переводов для конкретного кода
 * `warningNotification`.
 */
function getModerationBannerLangKeys(code) {
    switch (code) {
        case 1:
            return [
                'me_channel_false_information_title',
                'me_channel_moderation_banner_description_vaccination',
                'me_channel_vaccination_info_link',
                'me_channel_moderation_banner_post_link_text',
            ];
        case 3:
            return [
                'me_channel_false_information_covid_title',
                'me_channel_moderation_banner_description_covid',
                'me_channel_covid_info_link',
                'me_channel_moderation_banner_covid_link_name',
            ];
        case 4:
            return [
                'me_channel_false_information_title',
                'me_channel_moderation_banner_description_hiv',
                'me_channel_hiv_info_link',
                'me_channel_moderation_banner_post_link_text',
            ];
        case 5:
        default:
            return [
                'me_channel_controversial_banner_title',
                'me_channel_controversial_banner_description',
                'me_channel_notification_info_link',
                'me_channel_moderation_banner_post_link_text',
            ];
    }
}
//# sourceMappingURL=ChannelModerationModals.js.map