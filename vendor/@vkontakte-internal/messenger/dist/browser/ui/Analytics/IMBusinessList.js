import { useStatsOnMount } from '../../hooks/useStatsOnMount';
/**
 * Логгирование открытия папки Бизнесс
 */
export const IMBusinessListStats = ({ children, }) => {
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            screen: 'im_business_list',
            subtype: 'go',
        },
    });
    return children;
};
//# sourceMappingURL=IMBusinessList.js.map