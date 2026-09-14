import '../../ui/Templates/Templates.css';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import { Button, Placeholder, Header, Spinner, getColorClass, } from '@vkontakte-internal/vkcom-kit';
import { Icon24AddOutline, Icon28ErrorCircleOutline, Icon56ArticleOutline, } from '@vkontakte/icons';
import { templateRegex, useBrowserEnv, useCommunityTemplates, useDispatch, usePeer, usePeers, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { SaveTemplateModal } from '../../ui/Templates/SaveTemplateModal';
import { useModal } from '../../hooks/useModal';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { TemplateItem } from '../../ui/Templates/TemplateItem';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
export const Templates = ({ className, owner, peerId, onTemplateInsert, viewer, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const { isMobileLayout } = useLayoutData();
    const snackbar = useSnackbar();
    const peer = usePeer(peerId);
    const peers = usePeers();
    const saveTemplateModal = useModal();
    const templates = useCommunityTemplates();
    const [editTemplateId, setEditTemplateId] = useState();
    const onEditTemplate = (templateId) => {
        setEditTemplateId(templateId);
        saveTemplateModal.open();
    };
    const requestCompletedUICallback = useCallback((hasFailed) => {
        hasFailed &&
            snackbar({
                before: (React.createElement(Icon28ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
                message: lang.use('me_templates_request_error_snackbar_text'),
            });
    }, [snackbar, lang]);
    const deleteTemplate = useCallback((templateToDelete) => {
        dispatch({
            type: 'DeleteCommunityTemplate',
            groupId: owner.id,
            templateId: templateToDelete.id,
            requestCompletedUICallback,
        });
    }, [dispatch, owner.id, requestCompletedUICallback]);
    const replaceTemplates = useCallback((key) => {
        switch (key) {
            case '{user name}':
                return Peer.firstName(peer);
            case '{user surname}':
                return Peer.isUserPeerId(peerId)
                    ? Peer.safeGet(peers, peerId).lastName
                    : '';
            case '{admin name}':
                return Peer.firstName(viewer);
            case '{admin surname}':
                return viewer.lastName;
            case '{community}':
                return Peer.name(owner);
            case '{goodbye}':
                return lang.use('me_templates_goodbye');
            case '{greeting}': {
                const time = new Date().getHours();
                let greeting = lang.use('me_templates_greeting_good_night');
                if (time >= 3 && time < 12) {
                    greeting = lang.use('me_templates_greeting_good_morning');
                }
                else if (time >= 12 && time < 17) {
                    greeting = lang.use('me_templates_greeting_good_afternoon');
                }
                else if (time >= 17 && time <= 23) {
                    greeting = lang.use('me_templates_greeting_good_evening');
                }
                return greeting;
            }
            default:
                return '';
        }
    }, [lang, owner, peer, peerId, peers, viewer]);
    const prepareTemplate = useCallback((template) => {
        return template.replace(templateRegex, (match) => {
            const replacement = replaceTemplates(match);
            return replacement !== undefined ? replacement : match;
        });
    }, [replaceTemplates]);
    const insertTemplate = useCallback((template) => {
        onTemplateInsert(prepareTemplate(template.text));
    }, [onTemplateInsert, prepareTemplate]);
    useEffect(() => {
        dispatch({
            type: 'LoadCommunityTemplates',
            groupId: owner.id,
            requestCompletedUICallback,
        });
    }, [dispatch, owner.id, requestCompletedUICallback]);
    return (React.createElement("div", { className: cx('MEAppThemeStylesContrastDisable', 'Templates', !!templates?.length && 'Templates--nonEmpty', isMobileLayout && 'Templates--mobile', className), role: "menu" },
        !templates?.length &&
            (templates === undefined ? (React.createElement(Placeholder, { icon: React.createElement(Spinner, { size: "xl" }) })) : (React.createElement(Placeholder, { icon: React.createElement(Icon56ArticleOutline, null), header: lang.use('me_templates_empty_list_placeholder_title'), action: React.createElement(Button, { size: "m", onClick: saveTemplateModal.open }, lang.use('me_templates_empty_list_placeholder_action')), noPadding: true }, lang.use('me_templates_empty_list_placeholder_description')))),
        !!templates?.length && (React.createElement("div", { className: "Templates__container" },
            React.createElement(Header, { after: React.createElement(Button, { onClick: saveTemplateModal.open, mode: "link", size: "s", className: "Templates__addButton" },
                    React.createElement(Icon24AddOutline, { className: "Templates__icon--accent" })), className: "Templates__header" }, lang.use('me_templates_list_header')),
            React.createElement(ScrollbarProvider, { role: "presentation", scrollableProps: {
                    role: 'presentation',
                }, contentProps: {
                    role: 'presentation',
                }, style: { maxHeight: isMobileLayout ? '174px' : '219px' }, overflowX: "hidden", forceVisible: "y" }, templates.map((template) => (React.createElement(TemplateItem, { template: template, key: template.id, onDelete: deleteTemplate, onInsert: insertTemplate, onEdit: onEditTemplate })))))),
        saveTemplateModal.isActive && (React.createElement(SaveTemplateModal, { onClose: () => {
                saveTemplateModal.close();
                setEditTemplateId(undefined);
            }, ownerId: owner.id, templateId: editTemplateId }))));
};
//# sourceMappingURL=Templates.js.map