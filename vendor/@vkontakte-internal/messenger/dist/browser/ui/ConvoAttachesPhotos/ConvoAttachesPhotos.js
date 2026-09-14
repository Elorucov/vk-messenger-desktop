import '../../ui/ConvoAttachesPhotos/ConvoAttachesPhotos.css';
import React, { Fragment, useCallback, useId, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import * as Attach from '../../../core/model/Attach';
import { Link } from '../../ui/Link/Link';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Icon20DeleteOutline, Icon20MessageArrowRightOutline, Icon24MoreHorizontal, } from '@vkontakte/icons';
import { useBrowserEnv, useOwner } from '../../hooks/misc';
import { exhaustivenessCheck, isSameMonth } from '../../../core/utils/misc';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import cx from 'classnames';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useNow } from '../../hooks/useNow';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ConvoAttachesPhotos = ({ photos, goToMessage, withDateSeparator, }) => {
    const now = useNow();
    const { api, lang } = useBrowserEnv();
    const [width, setWidth] = useState(0);
    const measuredElRef = useRef(null);
    const [deletedPhotosIds, setDeletedPhotosIds] = useState([]);
    useLayoutEffect(() => {
        if (!window.IntersectionObserver) {
            return;
        }
        /* Не реагируем на рендер, если уже измерили ширину,
         * на изменение отреагирует запущенный ранее обзервер */
        if (width !== 0) {
            return;
        }
        if (!measuredElRef.current) {
            return;
        }
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width);
            }
        });
        resizeObserver.observe(measuredElRef.current);
        return () => {
            resizeObserver.disconnect();
        };
        // Нет зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const doAction = useCallback((type, photo) => {
        switch (type) {
            case 'set_as_avatar':
                // api
                //   .fetch('photos.setPhotoAsOwnerPhoto', {
                //     photo: `${photo.attach.ownerId}_${photo.attach.id}`,
                //   })
                //   .then(() => {})
                /** TODO: Код выше работает, но его надо закрыть модалкой или редактором для аватарки */
                break;
            case 'delete':
                api
                    .fetch('photos.delete', {
                    photo_id: photo.attach.id,
                    owner_id: photo.attach.ownerId,
                })
                    .then(() => {
                    setDeletedPhotosIds((deletedPhotosIds) => [
                        ...deletedPhotosIds,
                        photo.attach.id,
                    ]);
                });
                break;
            case 'restore':
                api
                    .fetch('photos.restore', {
                    photo_id: photo.attach.id,
                    owner_id: photo.attach.ownerId,
                })
                    .then(() => {
                    setDeletedPhotosIds((deletedPhotosIds) => deletedPhotosIds.filter((id) => id !== photo.attach.id));
                });
                break;
            case 'go_to_message':
                goToMessage(photo.cmid);
                break;
            case 'copy_link':
            case 'download':
            case 'tag_item':
            case 'tag_service':
                break;
            default: {
                exhaustivenessCheck(type);
            }
        }
    }, [goToMessage, api]);
    if (!withDateSeparator) {
        return (React.createElement("ul", { className: "ConvoAttachesPhotos" }, photos.map((photo, i) => {
            const isFirst = i === 0;
            const photoSource = width !== 0 ? getPhotoSource(photo.attach, width) : undefined;
            return (React.createElement(ConvoAttachesPhotoItem, { key: `${photo.cmid}-${photo.attach.id}-${i}`, isDeleted: deletedPhotosIds.includes(photo.attach.id), photo: photo, photoSource: photoSource || undefined, measuredElRef: isFirst ? measuredElRef : undefined, onActionClick: doAction }));
        })));
    }
    const photosSeparatedByMonth = photos.reduce((acc, photo, i) => {
        const isFirst = i === 0;
        const prev = photos[i - 1];
        const splitDate = isFirst || (prev && !isSameMonth(prev.date * 1000, photo.date * 1000));
        if (splitDate) {
            acc.push([]);
        }
        acc[acc.length - 1]?.push(photo);
        return acc;
    }, []);
    return (React.createElement(React.Fragment, null, photosSeparatedByMonth.map((photos, photosIndex) => {
        const date = photos[0]?.date || 0;
        return (React.createElement(Fragment, { key: photosIndex },
            React.createElement("div", { className: "ConvoAttachesPhotos__dateSeparator" }, lang.use('me_month_year_date', {
                now,
                date: date * 1000,
                genMonths: false,
            })),
            React.createElement("ul", { className: "ConvoAttachesPhotos--separated" }, photos.map((photo, i) => {
                const isFirst = photosIndex === 0 && i === 0;
                const photoSource = width !== 0 ? getPhotoSource(photo.attach, width) : undefined;
                return (React.createElement(ConvoAttachesPhotoItem, { key: `${photo.cmid}-${photo.attach.id}-${i}`, isDeleted: deletedPhotosIds.includes(photo.attach.id), photo: photo, photoSource: photoSource || undefined, measuredElRef: isFirst ? measuredElRef : undefined, onActionClick: doAction }));
            }))));
    })));
};
const ConvoAttachesPhotoItem = ({ photo, measuredElRef, photoSource, isDeleted, onActionClick }) => {
    const { isMobileLayout } = useLayoutData();
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const convoAttachPhotoActionsId = useId();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const $linkRef = useRef(null);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        React.createElement(ActionsMenuAction, { key: "action_go_to_message", onClick: () => onActionClick('go_to_message', photo), title: lang.use('me_attach_action_go_to_message'), leftIcon: React.createElement(Icon20MessageArrowRightOutline, null), type: "secondary" }),
        photo.attach.ownerId === owner.id && (React.createElement(ActionsMenuAction, { key: "action_delete", onClick: () => onActionClick('delete', photo), title: lang.use('me_attach_action_delete_photo'), leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger" })))), [lang, photo, owner.id, onActionClick]);
    const additionalLinkPayload = {
        kind: 'message',
        peerId: photo.authorId,
        cmid: photo.cmid,
    };
    return (React.createElement("li", { className: "ConvoAttachesPhotos__item", ref: measuredElRef },
        photoSource && !isDeleted && (React.createElement(React.Fragment, null,
            React.createElement(Link, { ref: $linkRef, to: {
                    kind: 'AttachMediaProxyRoute',
                    attach: photo.attach,
                    source: additionalLinkPayload,
                }, key: photo.attach.id, className: "ConvoAttachesPhotos__link" },
                React.createElement("img", { ...photoSource, alt: "", className: "ConvoAttachPhoto__img" })),
            fastActionsTrigger.button && (React.createElement(Dropdown, { enableFocusTrap: true, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                    wrapper: cx('ConvoAttachPhoto__dropdown', {
                        'DropdownReforged--opened': fastActionsTrigger.button === 'tap',
                    }),
                }, content: React.createElement(ActionsMenu, { id: convoAttachPhotoActionsId, className: "ConvoActionsMenu" }, actionsList), align: "right", position: "bottom", ...(isMobileLayout ? { adaptation: 'horizontal' } : {}), hideOnClick: true, adaptive: true }, (isOpened) => (React.createElement("button", { className: "ConvoAttachPhoto__action", "aria-haspopup": "menu", "aria-controls": convoAttachPhotoActionsId, "aria-expanded": isOpened, "aria-label": lang.use('me_actions_more') },
                fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "ConvoAttachPhoto__actionTapArea" })),
                React.createElement(Icon24MoreHorizontal, null))))),
            fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: $linkRef, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, allowNativeContextMenu: true, content: React.createElement(ActionsMenu, { className: "ConvoActionsMenu" }, actionsList) })))),
        photoSource && isDeleted && (React.createElement("div", { className: "ConvoAttachesPhotos__restore" },
            React.createElement("div", { className: "ConvoAttachesPhoto__restore-button", onClick: () => onActionClick('restore', photo) }, lang.use('me_attach_action_restore'))))));
};
function getPhotoSource(photo, photoSize) {
    const base = Attach.preview(photo, photoSize, photoSize, false);
    const dense = Attach.preview(photo, photoSize * 2, photoSize * 2, false);
    if (!base && !dense) {
        return null;
    }
    if (!base || !dense) {
        return {
            src: base ? base.url : dense ? dense.url : '',
        };
    }
    return {
        srcSet: `${base.url}, ${dense.url} 2x`,
        src: dense.url,
    };
}
//# sourceMappingURL=ConvoAttachesPhotos.js.map