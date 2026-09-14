import { useMemo } from 'react';
import { predefinedBackgrounds as staticPredefinedBackgrounds } from '../constants';
import { getPreviewPhotoSizeUrl, getMaxPhotoSizeUrl } from '../utils';
import { isInTimePeriod } from '../../../helpers/date';
import { useConfig } from '../../../services/config';
import { EVideoEffectType } from '../../../constants';
export const useBackgroundsList = ({ photos }) => {
    const { enableOverlayEffectItems, temporaryVirtualBackgrounds = [] } = useConfig();
    const predefinedBackgrounds = useMemo(() => {
        const isShowTime = (item) => isInTimePeriod({
            timestampEnd: item?.timestamp_end_showing,
            timestampStart: item?.timestamp_start_showing,
        });
        const convert = (item) => ({
            id: -item.id,
            type: EVideoEffectType.BACKGROUND,
            originalUrl: item.url_original,
            previewUrl: item.url_preview,
            isPredefined: true,
        });
        const [start, end, restMap] = temporaryVirtualBackgrounds.reduce((acc, item) => {
            if (isShowTime(item)) {
                let group;
                switch (item.position) {
                    case 'start':
                        group = acc[0];
                        break;
                    case 'end':
                        group = acc[1];
                        break;
                    default:
                        if (acc[2][item.position]) {
                            group = acc[2][item.position];
                        }
                        else {
                            group = [[], []];
                            acc[2][item.position] = group;
                        }
                        break;
                }
                group[item.is_before ? 0 : 1].push(convert(item));
            }
            return acc;
        }, [[[], []], [[], []], {}]);
        const result = start.flat();
        staticPredefinedBackgrounds.forEach((background) => {
            const staticBackground = background.getMappedParams();
            const additionalItems = restMap[staticBackground.id];
            let items = [staticBackground];
            if (typeof additionalItems !== 'undefined') {
                const [before, after] = additionalItems;
                items = [...before, staticBackground, ...after];
                delete restMap[staticBackground.id];
            }
            Array.prototype.push.apply(result, items);
        });
        return result
            .concat(Object.keys(restMap).reduce((acc, id) => acc.concat(restMap[id].flat()), []))
            .concat(end.flat());
    }, [temporaryVirtualBackgrounds]);
    const backgroundList = useMemo(() => {
        return photos
            .map((background) => ({
            id: background.id,
            type: EVideoEffectType.BACKGROUND,
            originalUrl: getMaxPhotoSizeUrl(background),
            previewUrl: getPreviewPhotoSizeUrl(background),
            isPredefined: false,
        }))
            .concat(predefinedBackgrounds)
            .filter(({ type }) => !(!enableOverlayEffectItems && type === EVideoEffectType.OVERLAY));
    }, [photos, predefinedBackgrounds]);
    return {
        backgroundList,
    };
};
//# sourceMappingURL=useBackgroundsList.js.map