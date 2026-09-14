import React from 'react';
import cx from 'classnames';
import '../../ui/ConvoHistoryHeaderContent/ConvoHistoryHeaderContent.css';
import * as Viewer from '../../../core/model/Viewer';
import { ConvoCard } from '../../ui/ConvoCard/ConvoCard';
import { useViewer } from '../../hooks/misc';
export const ConvoHistoryHeaderContent = ({ convo, peer, className, }) => {
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    if (!isEdu || !convo.convoCard) {
        return null;
    }
    return (React.createElement("div", { className: cx('ConvoHistoryHeaderContent', className) },
        React.createElement(ConvoCard, { card: convo.convoCard, peer: peer })));
};
//# sourceMappingURL=ConvoHistoryHeaderContent.js.map