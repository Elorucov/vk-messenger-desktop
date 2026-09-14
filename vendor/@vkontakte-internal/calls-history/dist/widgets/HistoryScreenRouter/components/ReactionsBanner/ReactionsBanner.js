import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Flex":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { ECallsBannerType, getCDNLink, getHostName } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { Button, Flex, Banner, Image } from '@vkontakte-internal/vkcom-kit';
import { localStorage } from '@vkontakte/vkjs';
import { useEffect, useState } from 'react';
import styles from './ReactionsBanner.module.css';
const LAST_SHOWN_BANNER_KEY = 'vk_calls_last_shown_banner';
const createBannerCollection = (getLang) => [
    {
        type: ECallsBannerType.ASR,
        pic1x: getCDNLink('calls-banner-asr-c-1x.png', 7),
        pic2x: getCDNLink('calls-banner-asr-c-2x.png', 7),
        langTitle: getLang('calls_banner_asr_title'),
        langDesc1stRow: getLang('calls_banner_asr_desc'),
        link: `https://${getHostName()}/@vk-kak-vkluchit-avtomaticheskie-subtitry-i-rasshifrovku-v-zvonk`,
    },
    {
        type: ECallsBannerType.Vmoji,
        pic1x: getCDNLink('calls-banner-vmoji-c-1x.png', 6),
        pic2x: getCDNLink('calls-banner-vmoji-c-2x.png', 6),
        langTitle: getLang('calls_banner_vmoji_title'),
        langDesc1stRow: getLang('calls_banner_vmoji_desc_1'),
        langDesc2ndRow: getLang('calls_banner_vmoji_desc_2'),
        link: `https://${getHostName()}/@vk-kak-vmoji-mozhet-pomoch-vam-v-vk-zvonkah`,
    },
    {
        type: ECallsBannerType.SessionRooms,
        pic1x: getCDNLink('session-rooms-c-1x.png', 4),
        pic2x: getCDNLink('session-rooms-c-2x.png', 4),
        langTitle: getLang('calls_split_participants_in_halls'),
        langDesc1stRow: getLang('calls_organize_work_in_groups'),
        langDesc2ndRow: getLang('calls_for_finding_joint_solutions'),
        link: `https://${getHostName()}/@vk-kak-sozdavat-zaly-v-zvonkah-na-neogranichennoe-kolichestvo-u`,
    },
    {
        type: ECallsBannerType.Reactions,
        pic1x: getCDNLink('reactions-c-1x.png'),
        pic2x: getCDNLink('reactions-c-2x.png'),
        langTitle: getLang('calls_call_reactions'),
        langDesc1stRow: getLang('calls_express_your_feelings'),
        langDesc2ndRow: getLang('calls_support_speakers'),
        link: `https://${getHostName()}/@vk-kak-otpravlyat-reakcii-v-zvonkah`,
    },
    {
        type: ECallsBannerType.WatchTogether,
        pic1x: getCDNLink('watch-together-c-1x.png'),
        pic2x: getCDNLink('watch-together-c-2x.png'),
        langTitle: getLang('calls_watch_movies_together'),
        langDesc1stRow: getLang('calls_discuss_movies'),
        langDesc2ndRow: getLang('calls_and_series_in_call'),
        link: `https://${getHostName()}/@vk-sovmestniy-prosmotr`,
    },
];
const getNextBanner = (banners) => {
    const lastBanner = localStorage.getItem(LAST_SHOWN_BANNER_KEY);
    const index = banners.findIndex((banner) => banner.type.toString() === lastBanner);
    const nextIndex = (index + 1) % banners.length;
    return banners[nextIndex];
};
export function useBanner(banners) {
    const [banner] = useState(() => getNextBanner(banners));
    useEffect(() => {
        localStorage.setItem(LAST_SHOWN_BANNER_KEY, banner.type.toString());
    }, [banner]);
    return banner;
}
/**
 * @upd уже стал дефолтным баннером, в котором не только реакции, но и все
 * остальное, нейминг по историческим причинам сохранился
 *
 * баннер на странице `/calls` с преложением использовать реакции в звонках */
export const ReactionsBanner = () => {
    const langs = useLangs();
    const [banners] = useState(() => createBannerCollection(langs.getLang.bind(langs)));
    const banner = useBanner(banners);
    const learnMore = langs.getLang('calls_learn_more');
    return (_jsx(Banner, { mode: "image", noPadding: true, imageTheme: "light", actions: _jsx(Button, { mode: "secondary", href: banner.link, target: "_blank", size: "m", "aria-label": `${banner.langTitle}. ${banner.langDesc1stRow} ${banner.langDesc2ndRow}, ${learnMore}`, children: learnMore }), title: banner.langTitle, subtitle: _jsxs(_Fragment, { children: [banner.langDesc1stRow, banner.langDesc2ndRow && (_jsxs(_Fragment, { children: [_jsx("br", {}), banner.langDesc2ndRow] }))] }), background: _jsx(Flex, { justify: "end", className: styles.image, children: _jsx(Image, { heightSize: "100%", widthSize: "auto", alt: "Some alt", src: banner.pic1x, srcSet: `${banner.pic2x} 2x`, noBorder: true }) }) }));
};
//# sourceMappingURL=ReactionsBanner.js.map