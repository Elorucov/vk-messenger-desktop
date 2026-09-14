import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { useLangPack } from '@vkontakte-internal/langs';
import { Icon12CheckCircleFill } from '@vkontakte/icons';
import { TextTooltip, Caption, Avatar } from '@vkontakte-internal/vkcom-kit';
import { $userPeer } from '../../../../model/peer/user';
import styles from './PeerInfo.module.css';
export function PeerInfo({ pack, ...props }) {
    const { translate } = useLangPack();
    const userPeer = useStore($userPeer);
    if (!pack || !userPeer) {
        return null;
    }
    const { isStyle } = pack;
    const { first_name_gen, photo_50 } = userPeer;
    return (_jsx(TextTooltip, { className: styles.tooltip, text: _jsx(Caption, { className: styles.text, level: "1", children: translate(isStyle ? 'stickers_picker_peer_has_style' : 'stickers_picker_peer_has_pack', {
                name: first_name_gen,
            }) }), offsetByMainAxis: 8, offsetByCrossAxis: 30, placement: "bottom-end", usePortal: true, children: _jsx(Avatar, { src: photo_50, size: 20, ...props, children: _jsx(Avatar.Badge, { children: _jsx(Icon12CheckCircleFill, { className: styles.icon }) }) }) }));
}
//# sourceMappingURL=PeerInfo.js.map