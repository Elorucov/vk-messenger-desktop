import '../../ui/AttachChannelStub/AttachChannelStubDoc.css';
import React from 'react';
import { Footnote, Headline, Skeleton } from '@vkontakte/vkui';
import { formatFileSize } from '../../../core/utils/misc';
export const AttachChannelStubDoc = ({ attach, }) => {
    const meta = attach.ext && attach.size
        ? `${attach.ext.toUpperCase()} ᐧ ${formatFileSize(attach.size)}`
        : null;
    return (
    // Намеренно используем className AttachmentCell, чтобы не дублировать в AttachChannelStubDoc
    // размеры и логику невелирования отступов контейнера аттачей для выравнивания по тексту
    React.createElement("div", { className: "AttachChannelStubDoc AttachmentCell" },
        React.createElement(Skeleton, { width: 40, height: 40 }),
        React.createElement("div", { className: "AttachmentCell__infoBlockContainer" },
            React.createElement("div", { className: "AttachmentCell__infoBlock" },
                React.createElement(Headline, { level: "1", weight: "3", className: "AttachChannelStubDoc__headline", useAccentWeight: true }, attach.title),
                React.createElement(Footnote, { className: "AttachChannelStubDoc__footnote" }, meta)))));
};
//# sourceMappingURL=AttachChannelStubDoc.js.map