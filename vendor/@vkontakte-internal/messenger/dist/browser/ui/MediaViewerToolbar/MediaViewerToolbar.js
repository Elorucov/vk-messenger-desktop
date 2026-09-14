import React, { useCallback, useMemo } from 'react';
import { useBrowserEnv, useFeatureFlags, useOwner, usePeers, useVideoConvos, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import * as VideoConvo from '../../../core/model/VideoConvo';
import { useMediaOwners } from '../../hooks/useMediaOwners';
import { ExternalLink } from '../../ui/Link/Link';
import { Icon16Verified, Icon20DownloadOutline, Icon20MagnifierMinusOutline, Icon20MagnifierPlusOutline, Icon20More, Icon20PicturePlusOutline, Icon20ReportOutline, Icon20MessagesOutline, Icon20RotateLeft, Icon20ShareOutline, } from '@vkontakte/icons';
import { isSameYear } from '../../../core/utils/misc';
import { Spinner } from '@vkontakte/vkui';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useRouter } from '../../ui/Router/Router';
import { IRouter } from '../../../data/env/IRouter';
import { useNow } from '../../hooks/useNow';
import './MediaViewerToolbar.css';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { downloadImage } from '../../utils/files';
import { useSavePhotoToAlbum } from '../../hooks/useSavePhotoToAlbum';
import { useModal } from '../../hooks/useModal';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ReportAttachModal } from '../../ui/ReportModal/ReportModal';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { getVideoAuthorLink } from '../../utils/attach';
import cx from 'classnames';
export function MediaViewerToolbar({ mediaItems, index, withCounter = true, canShare, canSave, mediaViewerPhotoRef, mediaViewerVideoRef, }) {
    const now = useNow();
    const { lang, vkDomain, share } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { modal } = useRouter();
    const owner = useOwner();
    const { isMobileLayout } = useLayoutData();
    const videoConvos = useVideoConvos();
    const reportModal = useModal();
    const { getMediaOwner } = useMediaOwners({ media: mediaItems });
    const currentIndex = index ?? 0;
    const currentMedia = mediaItems[currentIndex];
    const currentMediaOwner = getMediaOwner(currentMedia?.ownerId);
    const shareSource = useMemo(() => {
        //Не может быть такого, мы сейчас в модалке
        if (!modal) {
            return null;
        }
        //Другого пока в этом просмторощике нет
        if ((modal.kind !== 'PhotoModal' && modal.kind !== 'VideoModal') ||
            !modal.source) {
            return null;
        }
        //Только места откуда точно можно пошарить
        if (modal.source.kind !== IRouter.RouteSourceKind.Message &&
            modal.source.kind !== IRouter.RouteSourceKind.Post &&
            modal.source.kind !== IRouter.RouteSourceKind.Comment) {
            return null;
        }
        return modal.source;
    }, [modal]);
    const currentMediaUploadDate = !!currentMedia?.uploadDate &&
        lang.use(isSameYear(now, currentMedia.uploadDate)
            ? 'global_short_date'
            : 'global_date', {
            now,
            date: currentMedia.uploadDate,
        });
    let publicVideo = null;
    if (currentMedia?.kind === 'Video' &&
        !currentMedia.isFromMessage &&
        currentMedia.platform === undefined &&
        currentMedia.type !== 'short_video') {
        publicVideo = currentMedia;
    }
    const isCurrentMediaPhoto = currentMedia?.kind === 'Photo';
    const isCurrentMediaVideo = currentMedia?.kind === 'Video';
    const originalImage = currentMedia?.kind === 'Photo'
        ? currentMedia.originalImage ||
            Attach.preview(currentMedia, Infinity, Infinity)?.url
        : undefined;
    const isShareableMedia = featureFlags.vkm_media_share &&
        canShare &&
        share &&
        shareSource &&
        currentMedia;
    const { savePhotoToAlbum, isLoading: isPhotoSaving, isSaved, } = useSavePhotoToAlbum({
        photo: isCurrentMediaPhoto ? currentMedia : undefined,
    });
    const handleSavePhoto = useCallback(() => {
        if (currentMedia?.kind !== 'Photo') {
            return;
        }
        savePhotoToAlbum();
    }, [currentMedia, savePhotoToAlbum]);
    /**
     * Можем сохранять в альбом не свои фотки
     */
    const canSaveToAlbum = featureFlags.vkm_photo_save_to_album &&
        canSave &&
        isCurrentMediaPhoto &&
        currentMedia.ownerId !== owner.id;
    const canReport = featureFlags.vkm_media_viewer_report &&
        currentMedia &&
        currentMedia.ownerId !== owner.id;
    const moreActions = useMemo(() => {
        const actions = [];
        if (canSaveToAlbum) {
            actions.push(React.createElement(ActionsMenuAction, { key: "save-to-album", leftIcon: isPhotoSaving ? React.createElement(Spinner, { size: "s" }) : React.createElement(Icon20PicturePlusOutline, null), title: isSaved
                    ? lang.use('me_photo_save_to_album_done')
                    : lang.use('me_photo_save_to_album'), disabled: isPhotoSaving || isSaved, onClick: handleSavePhoto }));
        }
        if (originalImage && canSave) {
            actions.push(React.createElement(ActionsMenuAction, { key: "download", leftIcon: React.createElement(Icon20DownloadOutline, null), title: lang.use('me_photo_download_original'), onClick: () => {
                    downloadImage(originalImage);
                } }));
        }
        if (canReport) {
            actions.push(React.createElement(ActionsMenuAction, { key: "report", leftIcon: React.createElement(Icon20ReportOutline, null), title: lang.use('me_media_viewer_report'), type: "danger", onClick: reportModal.open }));
        }
        return actions;
    }, [
        canSaveToAlbum,
        originalImage,
        canSave,
        canReport,
        isPhotoSaving,
        isSaved,
        lang,
        handleSavePhoto,
        reportModal.open,
    ]);
    const isChatBtnShown = Boolean(!isMobileLayout &&
        isCurrentMediaVideo &&
        mediaViewerVideoRef &&
        VideoConvo.canShowPlayer(videoConvos, currentMedia));
    return (React.createElement("div", { className: "MediaViewerToolbar" },
        React.createElement("div", { className: "MediaViewerToolbar__author" }, publicVideo ? (React.createElement(React.Fragment, null,
            publicVideo.mainArtists ? (React.createElement("div", { className: "MediaViewerToolbar__authorName MediaViewerToolbar__authorName--extended" }, publicVideo.mainArtists.map((artist, index, array) => {
                return (React.createElement(ExternalLink, { href: `https://${vkDomain}/artist/${artist.domain}`, className: "MediaViewerToolbar__authorName--link" },
                    React.createElement("span", null, artist.name),
                    index < array.length - 1 && React.createElement("span", null, ",\u00A0")));
            }))) : (React.createElement(PublicVideoAuthor, { publicVideo: publicVideo })),
            React.createElement("div", { className: "MediaViewerToolbar__uploadAt" }, currentMediaUploadDate))) : (React.createElement(React.Fragment, null,
            React.createElement(BasicAvatar, { className: "MediaViewerToolbar__avatar", size: 32, content: currentMediaOwner.name, picture: currentMediaOwner.photo }),
            currentMediaOwner.name && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: cx('MediaViewerToolbar__authorName', {
                        'MediaViewerToolbar__authorName--cropped': withCounter,
                    }) }, currentMediaOwner.name),
                React.createElement("div", { className: "MediaViewerToolbar__uploadAt" }, currentMediaUploadDate)))))),
        withCounter && !publicVideo && (React.createElement("div", { className: "MediaViewerToolbar__count" }, mediaItems.length > 1 &&
            lang.use('me_n_from_c', {
                values: {
                    num: (currentIndex + 1).toString(),
                    count: mediaItems.length.toString(),
                },
            }))),
        React.createElement("div", { className: "MediaViewerToolbar__actions" },
            isCurrentMediaPhoto && (React.createElement(PhotoTools, { mediaViewerPhotoRef: mediaViewerPhotoRef })),
            isChatBtnShown && (React.createElement(MediaViewerToolbarAction, { label: lang.use('me_video_chat'), icon: React.createElement(Icon20MessagesOutline, null), onClick: () => {
                    mediaViewerVideoRef?.current?.toggleChat();
                } })),
            currentMedia && isShareableMedia && (React.createElement(React.Fragment, null,
                isCurrentMediaPhoto && (React.createElement("div", { className: "MediaViewerToolbar__actionDivider" })),
                React.createElement(MediaViewerToolbarAction, { label: lang.use('me_media_share'), icon: React.createElement(Icon20ShareOutline, null), onClick: () => {
                        share.shareAttach(currentMedia, shareSource);
                    } }))),
            moreActions.length > 0 && (React.createElement(Dropdown, { adaptive: true, content: React.createElement(ActionsMenu, null, moreActions), adaptation: "vertical", hideOnClick: true, openType: "hover" },
                React.createElement(MediaViewerToolbarAction, { label: lang.use('me_actions_more'), icon: React.createElement(Icon20More, null), hasTooltip: false })))),
        reportModal.isActive && currentMedia && (React.createElement(ReportAttachModal, { attach: currentMedia, onClose: reportModal.close }))));
}
const MediaViewerToolbarAction = ({ label, icon, hasTooltip = true, onClick, }) => {
    return (React.createElement(Tooltip, { align: "center", content: label, delay: 500, disabled: !hasTooltip },
        React.createElement("button", { className: "MediaViewerToolbar__action", type: "button", "aria-label": label, onClick: onClick }, icon)));
};
const PhotoTools = ({ mediaViewerPhotoRef }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(React.Fragment, null,
        React.createElement(MediaViewerToolbarAction, { label: lang.use('me_photo_zoomout_title'), icon: React.createElement(Icon20MagnifierMinusOutline, null), onClick: () => {
                mediaViewerPhotoRef.current?.photoScaler.zoomOut();
            } }),
        React.createElement(MediaViewerToolbarAction, { label: lang.use('me_photo_zoomin_title'), icon: React.createElement(Icon20MagnifierPlusOutline, null), onClick: () => {
                mediaViewerPhotoRef.current?.photoScaler.zoomIn();
            } }),
        React.createElement(MediaViewerToolbarAction, { label: lang.use('me_photo_rotate_left_title'), icon: React.createElement(Icon20RotateLeft, null), onClick: () => {
                mediaViewerPhotoRef.current?.rotateLeft();
            } })));
};
const PublicVideoAuthor = ({ publicVideo }) => {
    const { vkDomain } = useBrowserEnv();
    const peers = usePeers();
    const publicVideoAuthor = Peer.safeGet(peers, Peer.resolveId(publicVideo.ownerId));
    const link = getVideoAuthorLink(vkDomain, publicVideo.type, publicVideoAuthor);
    return (React.createElement(ExternalLink, { href: link, className: "MediaViewerToolbar__authorName MediaViewerToolbar__authorName--extended" },
        React.createElement("span", { className: "MediaViewerToolbar__publicAuthor" },
            React.createElement("span", { className: "MediaViewerToolbar__publicName" }, Peer.name(publicVideoAuthor)),
            'isVerified' in publicVideoAuthor && publicVideoAuthor.isVerified && (React.createElement(Icon16Verified, { className: "MediaViewerToolbar__verified" })))));
};
//# sourceMappingURL=MediaViewerToolbar.js.map