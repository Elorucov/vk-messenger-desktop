import '../../ui/SferumConvoOffboardingBanner/SferumConvoOffboardingBanner.css';
import React, { useEffect } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { ConvoListBanner } from '../../ui/ConvoListBanner/ConvoListBanner';
import { useBrowserEnv } from '../../hooks/misc';
import { AssetImg } from '../../ui/AssetImg/AssetImg';
export const SferumConvoOffboardingBanner = ({ className }) => {
    const { lang, sferumOffboardingProcess, stats } = useBrowserEnv();
    const showBanner = () => {
        sferumOffboardingProcess?.logEvent({
            kind: 'click',
            screen: 'chats',
        });
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_im_conversations_banner_item',
                type_im_conversations_banner_item: {
                    event_type: 'click',
                    banner_name: 'sferum_to_max_simple',
                },
            },
        });
    };
    useEffect(() => {
        if (sferumOffboardingProcess?.state.chats) {
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
                        banner_name: 'sferum_to_max_simple',
                    },
                },
            });
        }
    }, [sferumOffboardingProcess?.state.chats, stats]);
    if (!sferumOffboardingProcess?.state.chats) {
        return;
    }
    return (React.createElement(ConvoListBanner, { icon: React.createElement(AssetImg, { className: "SferumConvoOffboardingBanner__icon", width: 56, height: 56, fileName: "static/png/drawable-xxhdpi/logo_max_x_sferum_80.png" }), title: lang.use('me_sferum_offboarding_convo_list_title'), subtitle: lang.use('me_sferum_offboarding_convo_list_subtitle'), onClick: showBanner, className: cx('SferumConvoOffboardingBanner', className) }));
};
//# sourceMappingURL=SferumConvoOffboardingBanner.js.map