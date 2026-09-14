import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '@vkontakte-internal/vkcom-kit';
import { setVoiceRoomNotification } from '../model';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
export const AccessiblyButton = ({ children }) => {
    const dispatch = useTypedDispatch();
    return (_jsx(Button, { mode: "link", appearance: "accent-invariable", onClick: () => dispatch(setVoiceRoomNotification(null)), children: children }));
};
//# sourceMappingURL=AccessiblyButton.js.map