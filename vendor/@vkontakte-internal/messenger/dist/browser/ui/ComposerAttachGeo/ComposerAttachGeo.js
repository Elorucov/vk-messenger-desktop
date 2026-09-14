import { useBrowserEnv } from '../../hooks/misc';
import { getStaticMapUrl, getPlaceTitle } from '../../ui/AttachGeo/AttachGeo';
import '../../ui/ComposerAttachGeo/ComposerAttachGeo.css';
import React from 'react';
export const ComposerAttachGeo = ({ geo, }) => {
    const { lang } = useBrowserEnv();
    const mapUrl = getStaticMapUrl(geo.coordinates, {
        // Волшебная константа, чтобы логотип яндекса был не слишком большим.
        width: 150,
        // Волшебная константа, чтобы логотип яндекса был не слишком большим.
        height: 150,
        locale: lang.locale,
        zoom: 12,
        point: 'vkbkm',
    });
    const title = geo.place ? getPlaceTitle(geo.place) : '';
    const image = (React.createElement("img", { className: "ComposerAttachGeo__mapImage", src: mapUrl, alt: title }));
    return React.createElement("div", { className: "ComposerAttachGeo" }, image);
};
//# sourceMappingURL=ComposerAttachGeo.js.map