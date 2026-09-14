import { useEffect } from 'react';
import * as Viewer from '../../core/model/Viewer';
import { useViewer } from './misc';
import { useRouter } from '../ui/Router/Router';
/** Добавляем для учебных учеток параметр sferum=true */
export const useAddSferumUrlParamForEdu = () => {
    const { profileType } = useViewer();
    const { screenRoute, replace, navigate } = useRouter();
    useEffect(() => {
        if (screenRoute.kind !== 'ChannelRoute') {
            return;
        }
        if (Viewer.isEdu(profileType) && !screenRoute.sferum) {
            replace({
                ...screenRoute,
                sferum: true,
            });
        }
    }, [profileType, navigate, replace, screenRoute]);
};
//# sourceMappingURL=useAddSferumUrlParamForEdu.js.map