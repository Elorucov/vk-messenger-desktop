import { useEffect, useRef } from 'react';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
export const useMovieStream = (stream) => {
    const videoRef = useRef(null);
    const stopCurrentStream = () => {
        if (!videoRef.current) {
            return;
        }
        const prevStrem = videoRef.current?.srcObject;
        if (prevStrem) {
            prevStrem.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };
    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        stopCurrentStream();
        videoRef.current.srcObject = stream || null;
        videoRef.current.play().catch((error) => {
            debugMessage(DebugMessageType.ERROR, { error, stream });
        });
    }, [stream]);
    return {
        videoRef,
    };
};
//# sourceMappingURL=useMovieStream.js.map