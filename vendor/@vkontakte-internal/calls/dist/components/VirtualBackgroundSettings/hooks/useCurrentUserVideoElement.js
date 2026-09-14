import { useEffect, useRef } from 'react';
import { getMediaStreamDimensions } from '../utils';
/**
 * 1. хук получает стрим пользователя и подключает к `$video` элементу
 * 2. забирает размеры стрима и выставляет соответсвующие теги
 */
export const useCurrentUserVideoElement = ({ userStream }) => {
    const $video = useRef(null);
    useEffect(() => {
        if (userStream && $video.current) {
            const { height, width } = getMediaStreamDimensions(userStream);
            $video.current.height = height;
            $video.current.width = width;
            $video.current.srcObject = userStream;
        }
    }, [userStream]);
    return {
        $video,
    };
};
//# sourceMappingURL=useCurrentUserVideoElement.js.map