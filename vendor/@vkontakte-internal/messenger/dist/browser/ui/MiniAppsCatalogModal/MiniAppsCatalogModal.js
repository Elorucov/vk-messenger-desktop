import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/MiniAppsCatalogModal/MiniAppsCatalogModal.css';
import React, { useCallback, useEffect, useState } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { resolveMiniAppId } from '../../../core/model/Attach';
export const MiniAppsCatalogModal = () => {
    const { api, lang, router } = useBrowserEnv();
    const [miniAppsCatalog, updateMiniAppsCatalog] = useState([]);
    const back = useCallback(() => router.pop(), [router]);
    useEffect(() => {
        api
            .fetch('messages.getEducationMiniAppsList', {})
            .then((res) => {
            updateMiniAppsCatalog(res.apps);
        })
            .catch(() => back());
    }, [api, back]);
    return (React.createElement(ModalInterface, { onClose: back, closeLabel: lang.use('me_close'), backLabel: lang.use('me_back'), contextClass: "MEConfig", title: lang.use('me_miniapps_catalog') },
        React.createElement("div", { className: "MiniAppsCatalogModal" }, miniAppsCatalog.map((item) => (React.createElement("div", { className: "MiniAppsCatalogModal__item", key: item.app_id, onClick: () => {
                router.push({
                    kind: 'MiniAppModal',
                    miniAppId: resolveMiniAppId(item.app_id),
                });
            }, title: item.title },
            React.createElement("div", { className: "MiniAppsCatalogModal__image", style: {
                    backgroundImage: `url(${item.image_link})`,
                } }),
            React.createElement("div", { className: "MiniAppsCatalogModal__text" }, item.title)))))));
};
//# sourceMappingURL=MiniAppsCatalogModal.js.map