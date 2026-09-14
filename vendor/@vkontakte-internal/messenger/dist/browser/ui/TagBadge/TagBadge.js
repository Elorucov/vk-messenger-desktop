import React from 'react';
import { Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { ContentBadge, getColorClass, Link, } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { BaseAdaptiveItemsLineItem, } from '../../ui/AdaptiveItemsLine';
import * as Tag from '../../../core/model/Tag';
import { hexToRgba } from '../../../core/utils/misc';
import './TagBadge.css';
import cx from 'classnames';
export function TagBadge({ className, item }) {
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    if (typeof item.adId === 'number') {
        const { adId, hasAdAccess, isEasyPromotedMarket, isMailRuAd } = item;
        const handleClickAdTagAlert = () => snackbar({
            before: (React.createElement(Icon24ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
            message: lang.use('me_convo_user_info_ad_tag_no_access_message'),
        });
        const adsOfficeUrl = Tag.toAdUrl(adId, isMailRuAd);
        let value;
        if (isEasyPromotedMarket) {
            value = lang.use('me_convo_user_info_ad_tag_easy_promoted_market');
        }
        else {
            const prefix = isMailRuAd
                ? lang.use('me_convo_user_info_ad_mail_ru_tag_text_prefix')
                : lang.use('me_convo_user_info_ad_tag_text_prefix');
            value = `${prefix} ${adId}`;
        }
        let content = (React.createElement(BaseAdaptiveItemsLineItem, { item: value, className: "TagBadge__text" }));
        if (hasAdAccess) {
            content = (React.createElement(Link, { className: "TagBadge__link", href: adsOfficeUrl, rel: "noreferrer", target: "_blank", noUnderline: true }, content));
        }
        return (React.createElement(ContentBadge, { className: cx('TagBadge__ad', className), mode: "secondary", onClick: !hasAdAccess ? handleClickAdTagAlert : undefined, size: "s", style: {
                backgroundColor: 'rgba(229, 235, 241, 0.1)',
                color: 'var(--steel_gray_A540, #55677d)',
            } }, content));
    }
    return (React.createElement(ContentBadge, { className: className, mode: "secondary", size: "s", style: {
            backgroundColor: hexToRgba(item.color, 0.1),
            color: `#${item.color}`,
        } },
        React.createElement(BaseAdaptiveItemsLineItem, { item: item.name })));
}
//# sourceMappingURL=TagBadge.js.map