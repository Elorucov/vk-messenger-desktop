import '../../ui/AttachMarket/AttachMarket.css';
import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { getAttachText } from '../../ui/AttachText/AttachText';
import { Icon24ArrowDownOutline, Icon24ArrowUpOutline, Icon24MoneyTransferOutline, } from '@vkontakte/icons';
import { Link } from '../../ui/Link/Link';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import '../../ui/AttachMoneyTransfer/AttachMoneyTransfer.css';
import { useBrowserEnv, usePeers, useViewer } from '../../hooks/misc';
export const AttachMoneyTransfer = ({ moneyTransfer, isInBubble, isOut, }) => {
    const peers = usePeers();
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const attachText = getAttachText(moneyTransfer, lang);
    const isOutcoming = viewer.id === moneyTransfer.fromId;
    const isIncoming = viewer.id === moneyTransfer.toId;
    const image = useMemo(() => {
        if (isOutcoming) {
            return (React.createElement(Icon24ArrowUpOutline, { className: "AttachMoneyTransfer__icon--outcoming" }));
        }
        else if (isIncoming) {
            return (React.createElement(Icon24ArrowDownOutline, { className: "AttachMoneyTransfer__icon--incoming" }));
        }
        return (React.createElement(Icon24MoneyTransferOutline, { className: "AttachMoneyTransfer__icon--another" }));
    }, [isIncoming, isOutcoming]);
    const title = useMemo(() => {
        const transferText = lang.use('me_money_transfer_title', {
            values: {
                amount: moneyTransfer.amount.toLocaleString(lang.locale),
                currency: moneyTransfer.currencySign,
            },
        });
        if (isOutcoming) {
            return `-${transferText}`;
        }
        else if (isIncoming) {
            return (React.createElement("div", { className: "AttachMoneyTransfer__title--incoming" },
                "+",
                transferText));
        }
        return transferText;
    }, [
        isIncoming,
        isOutcoming,
        lang,
        moneyTransfer.amount,
        moneyTransfer.currencySign,
    ]);
    const subtitle = useMemo(() => {
        if (isIncoming || (!isIncoming && !isOutcoming)) {
            const sender = Peer.safeGet(peers, moneyTransfer.fromId);
            return [
                attachText,
                lang.use('me_money_transfer_from', {
                    values: { user: Peer.name(sender, 'gen') },
                }),
            ];
        }
        return attachText;
    }, [attachText, isIncoming, isOutcoming, lang, moneyTransfer.fromId, peers]);
    return (React.createElement(Link, { className: "AttachMoneyTransfer", to: {
            kind: 'AttachProxyRoute',
            attach: moneyTransfer,
        } },
        React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, title: title, subtitle: subtitle, image: image })));
};
//# sourceMappingURL=AttachMoneyTransfer.js.map