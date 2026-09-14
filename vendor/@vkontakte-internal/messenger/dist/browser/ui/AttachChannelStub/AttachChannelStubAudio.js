import '../../ui/AttachChannelStub/AttachChannelStubAudio.css';
import React from 'react';
import cx from 'classnames';
import { Footnote, Headline, Skeleton, Subhead } from '@vkontakte/vkui';
export const AttachChannelStubAudio = ({ attach, isPrimary, className, }) => {
    return (React.createElement("div", { 
        // Намеренно используем className AttachAudio, чтобы не дублировать здесь
        // размеры и логику невелирования отступов контейнера аттачей для выравнивания по тексту
        className: cx('AttachChannelStubAudio AttachAudio', className, {
            'AttachAudio--primary MEAppThemeStylesContrastDisable': isPrimary,
        }) },
        React.createElement("div", { className: "AttachAudio__album" },
            React.createElement(Skeleton, { className: "AttachChannelStubAudio__skeleton", width: "100%", height: "100%" })),
        React.createElement("div", { className: "AttachAudio__info" },
            React.createElement(Headline, { level: isPrimary ? '1' : '2', weight: isPrimary ? '2' : '3', className: "AttachAudio__title", Component: "div", useAccentWeight: true },
                React.createElement("span", { className: "AttachAudio__titleText" }, attach.title)),
            isPrimary ? (React.createElement(Subhead, { className: "AttachAudio__artist" }, attach.artist)) : (React.createElement(Footnote, { className: "AttachAudio__artist" }, attach.artist)))));
};
//# sourceMappingURL=AttachChannelStubAudio.js.map