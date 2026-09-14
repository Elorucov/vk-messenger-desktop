import '../../ui/AttachMoneyRequest/AttachMoneyRequest.css';
import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { Icon20RoubleOutline, Icon24ArrowUturnLeftOutline, } from '@vkontakte/icons';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { getAttachText } from '../../ui/AttachText/AttachText';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { Link } from '../../ui/Link/Link';
import cx from 'classnames';
export const AttachMoneyRequest = ({ moneyRequest, isThemed, moneyRequest: { currencySign, totalAmount, transferredAmount, userCount }, isInBubble, isOut, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const attachText = getAttachText(moneyRequest, lang);
    const isGroupRequest = totalAmount !== undefined &&
        transferredAmount !== undefined &&
        userCount !== undefined;
    const isGroupRequestFinished = isGroupRequest && totalAmount === transferredAmount;
    const isAnySum = totalAmount === 0;
    const image = useMemo(() => {
        if (isGroupRequest) {
            let progress = transferredAmount / totalAmount;
            // не допускаем крайних значений для наглядности факта незавершенности сбора или наличия средств
            progress = progress >= 0.94 ? 0.93 : progress <= 0.03 ? 0.04 : progress;
            const fullStrokeLength = 639;
            const strokeLength = isGroupRequestFinished
                ? fullStrokeLength
                : fullStrokeLength * progress;
            return (React.createElement("div", { className: cx('AttachMoneyRequest__image', {
                    'AttachMoneyRequest__image--transparent': isOut && isThemed && isInBubble,
                }) },
                React.createElement("div", { className: "AttachMoneyRequest__currencyIcon" },
                    React.createElement(Icon20RoubleOutline, null)),
                !isAnySum && (React.createElement("svg", { height: "36", width: "36", viewBox: "-5 -5 210 210" },
                    React.createElement("path", { d: "M100,0 a100,100 0 0 1 0,200 a100,100 0 0 1 0,-200", className: "AttachMoneyRequest__progressbarBack" }),
                    transferredAmount !== 0 && (React.createElement("path", { d: "M100,0 a100,100 0 0 1 0,200 a100,100 0 0 1 0,-200", className: "AttachMoneyRequest__progressbarProgress", strokeDasharray: `${strokeLength} ${fullStrokeLength - strokeLength}` }))))));
        }
        return React.createElement(Icon24ArrowUturnLeftOutline, { className: "AttachMoneyRequest__icon" });
    }, [
        isAnySum,
        isGroupRequest,
        isGroupRequestFinished,
        isInBubble,
        isOut,
        isThemed,
        totalAmount,
        transferredAmount,
    ]);
    const title = useMemo(() => {
        if (isGroupRequest) {
            const transferredAmountString = transferredAmount.toLocaleString(lang.locale);
            if (isAnySum) {
                return lang.use('me_group_money_request_collected', {
                    values: {
                        amount: transferredAmountString,
                        currency: currencySign,
                    },
                });
            }
            return lang.use('me_group_money_request_title', {
                values: {
                    amount: transferredAmountString,
                    totalAmount: totalAmount.toLocaleString(lang.locale),
                    currency: currencySign,
                },
            });
        }
        return lang.use('me_money_transfer_title', {
            values: {
                amount: moneyRequest.amount.toLocaleString(lang.locale),
                currency: moneyRequest.currencySign,
            },
        });
    }, [
        isGroupRequest,
        lang,
        moneyRequest.amount,
        moneyRequest.currencySign,
        transferredAmount,
        isAnySum,
        totalAmount,
        currencySign,
    ]);
    const subtitle = useMemo(() => {
        if (isGroupRequest) {
            return [
                attachText,
                userCount === 0
                    ? lang.use('me_group_money_request_no_dotations')
                    : lang.use('me_group_money_request_people', {
                        num: userCount,
                    }),
            ];
        }
        return [
            attachText,
            lang.use('me_money_transfer_from', {
                values: {
                    user: Peer.name(Peer.safeGet(peers, moneyRequest.fromId), 'gen'),
                },
            }),
        ];
    }, [attachText, isGroupRequest, lang, moneyRequest.fromId, peers, userCount]);
    return (React.createElement(Link, { className: "AttachMoneyRequest", to: {
            kind: 'AttachProxyRoute',
            attach: moneyRequest,
        } },
        React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, title: title, subtitle: subtitle, image: image, imageShape: isGroupRequest ? 'round' : 'square' })));
};
//# sourceMappingURL=AttachMoneyRequest.js.map