import React, { useEffect } from 'react';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { ConvoListCard } from '../../ui/ConvoListCard/ConvoListCard';
import { IconIllustrationComments120h } from '@vkontakte-internal/icons-private';
import '../../ui/EduIntegrationBanner/EduIntegrationBanner.css';
import { useEduIntegrationBanner } from '../../hooks/useEduIntegrationBanner';
import * as Viewer from '../../../core/model/Viewer';
/**
 * Список подписчиков на канал
 */
export const EduIntegrationBanner = ({ variant = 'normal', banner, }) => {
    const { lang, stats } = useBrowserEnv();
    const { profileType } = useViewer();
    const { isVisible } = useEduIntegrationBanner({ banner });
    const isEdu = Viewer.isEdu(profileType);
    useEffect(() => {
        if (!isVisible || !isEdu) {
            return;
        }
        stats.logEvent({
            type: 'type_view',
            screen: 'im',
            type_view: {
                item: {
                    type: 'banner',
                },
                position: 0,
                start_view: '',
                end_view: '',
                type: 'type_im_conversations_banner_view',
                type_im_conversations_banner_view: {
                    banner_name: 'edu_joining_ejd_chats',
                },
            },
        });
    }, [stats, isVisible, isEdu]);
    if (!isVisible || !isEdu) {
        return null;
    }
    /**
     * По новой логике вывода баннера подключения к ЭЖД, выводится только большой баннер, и без кнопки перехода в мини-апп
     * @see https://jira.mvk.com/browse/ME-70549
     */
    if (variant === 'large') {
        return (React.createElement(ConvoListCard, { image: React.createElement(IconIllustrationComments120h, null) },
            React.createElement("div", { className: "EduIntegrationBanner EduIntegrationBanner--large" },
                React.createElement("div", { className: "EduIntegrationBanner__caption" }, lang.use('me_edu_integration_banner_caption_new')),
                React.createElement("div", { className: "EduIntegrationBanner__description" }, lang.use('me_edu_integration_banner_description_new')))));
    }
    return null;
};
//# sourceMappingURL=EduIntegrationBanner.js.map