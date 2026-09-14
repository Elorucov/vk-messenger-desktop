import './AssetImg.css';
import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { ReImage } from '../../ui/ReImage/ReImage';
import { Skeleton } from '@vkontakte-internal/vkcom-kit';
import { useApiFetch } from '../../hooks/useApiFetch';
const assetsMap = new Map();
export const AssetImg = ({ fileName, height, width, className }) => {
    const apiFetch = useApiFetch();
    const [isLoaded, setLoaded] = useState(false);
    const [imgUrl, setImgUrl] = useState(() => assetsMap.get(fileName));
    useEffect(() => {
        const cachedImgUrl = assetsMap.get(fileName);
        if (!cachedImgUrl) {
            apiFetch('assets.get', { asset_ids: fileName }, { retries: 3 }).then((urls) => {
                const asset = urls[0];
                if (asset) {
                    assetsMap.set(fileName, asset.url);
                    setImgUrl(asset.url);
                }
            });
        }
    }, [apiFetch, fileName]);
    return (React.createElement("div", { className: "AssetImg" },
        !isLoaded && (React.createElement("div", { className: cx('AssetImg__skeleton', className) },
            React.createElement(Skeleton, { height: height, width: width }))),
        React.createElement(ReImage, { height: height, width: width, className: className, image: { baseUrl: imgUrl }, alt: "", onLoad: () => setLoaded(true) })));
};
//# sourceMappingURL=AssetImg.js.map