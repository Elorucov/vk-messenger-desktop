import '../../ui/AttachGeo/AttachGeo.css';
import React, { useEffect } from 'react';
import { Link } from '../../ui/Link/Link';
import cx from 'classnames';
import { useBrowserEnv, useFeatureFlags, usePixelDensity, } from '../../hooks/misc';
const MAP_MAX_SIZE = {
    width: 650,
    height: 450,
};
const MAP_ASPECT_RATIO = 9 / 16;
const MAP_WIDTH = 300;
export const AttachGeo = ({ geo, isInBubble, onWidthChange, }) => {
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const isDense = usePixelDensity();
    const { lang } = useBrowserEnv();
    const width = MAP_WIDTH * (isDense ? 2 : 1);
    const height = Math.floor(width * MAP_ASPECT_RATIO);
    useEffect(() => {
        if (vkm_new_bubbles_width_calc) {
            return;
        }
        onWidthChange?.(MAP_WIDTH);
    }, [onWidthChange, vkm_new_bubbles_width_calc]);
    const mapUrl = getStaticMapUrl(geo.coordinates, {
        width,
        height,
        locale: lang.locale,
        zoom: 12,
        point: 'vkbkm',
    });
    const title = geo.place ? getPlaceTitle(geo.place) : '';
    const image = vkm_new_bubbles_width_calc ? (React.createElement("img", { className: "AttachGeo__mapImage", src: mapUrl, alt: title })) : (React.createElement("img", { className: "AttachGeo__mapImage", src: mapUrl, alt: title, width: width, height: height }));
    const props = {
        title,
        className: cx('AttachGeo', { 'AttachGeo--inBubble': isInBubble }),
    };
    const route = {
        kind: 'AttachProxyRoute',
        attach: geo,
    };
    return (React.createElement(Link, { to: route, ...props }, image));
};
export function getStaticMapUrl({ latitude, longitude }, { width, height, zoom, locale, point, }) {
    let yaLang = 'en_US';
    if (['ru', 'br', 'kz'].includes(locale)) {
        yaLang = 'ru_RU';
    }
    else if (locale === 'ua') {
        yaLang = 'uk_UA';
    }
    if (width > MAP_MAX_SIZE.width) {
        height = Math.round((MAP_MAX_SIZE.width / width) * height);
        width = MAP_MAX_SIZE.width;
    }
    if (height > MAP_MAX_SIZE.height) {
        width = Math.round((MAP_MAX_SIZE.height / height) * width);
        height = MAP_MAX_SIZE.height;
    }
    const url = new URL('https://static-maps.yandex.ru/1.x/');
    url.search = new URLSearchParams({
        ll: `${longitude},${latitude}`,
        size: `${width},${height}`,
        z: `${zoom}`,
        lang: yaLang,
        l: 'map',
        pt: `${longitude},${latitude},${point}`,
    }).toString();
    return url.toString();
}
export function getPlaceTitle(place) {
    if (place.title) {
        return place.title;
    }
    return [place.country, place.city, place.address].filter(Boolean).join(', ');
}
//# sourceMappingURL=AttachGeo.js.map