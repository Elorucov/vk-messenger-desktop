import { useSelector } from 'react-redux';
/** стрим текущего пользователя */
export const useCurrentUserStream = () => {
    const userStream = useSelector((state) => state.localDevice.stream);
    const mediaSettings = useSelector((state) => state.localDevice.mediaSettings);
    const isVideoEnabled = !!mediaSettings?.isVideoEnabled;
    return {
        userStream,
        isVideoEnabled,
    };
};
//# sourceMappingURL=useCurrentUserStream.js.map