import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ApiNamespace } from '../ApiNamespace';
let VideoApi = class VideoApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        this.get = this.makeMethod('get');
        // TODO: change to correct types after https://jira.mvk.com/browse/VKVIDEO-30100 was merged
        this.getVideoForEdit = this.makeMethod('getVideoForEdit');
        this.getByIds = this.makeMethod('getByIds');
        this.getCatalogBlockItems = this.makeMethod('getCatalogBlockItems');
        this.search = this.makeMethod('search');
        this.edit = this.makeMethod('edit');
        this.save = this.makeMethod('save');
        this.delete = this.makeMethod('delete');
        this.add = this.makeMethod('add');
        this.getVideoDiscover = this.makeMethod('getVideoDiscover');
        this.getAlbums = this.makeMethod('getAlbums');
        this.getAlbumById = this.makeMethod('getAlbumById');
        this.getFromAlbum = this.makeMethod('getFromAlbum');
        this.getAlbumsByVideo = this.makeMethod('getAlbumsByVideo');
        this.addToAlbum = this.makeMethod('addToAlbum');
        this.addVideosToPlaylist = this.makeMethod('addVideosToPlaylist');
        this.getRelatedAudios = this.makeMethod('getRelatedAudios');
        this.deleteVideosFromPlaylist = this.makeMethod('deleteVideosFromPlaylist');
        this.addAlbum = this.makeMethod('addAlbum');
        this.editAlbum = this.makeMethod('editAlbum');
        this.deleteAlbum = this.makeMethod('deleteAlbum');
        this.removeFromAlbum = this.makeMethod('removeFromAlbum');
        this.reorderVideos = this.makeMethod('reorderVideos');
        this.getGroupsForUploading = this.makeMethod('getGroupsForUploading');
        this.encodeProgress = this.makeMethod('encodeProgress');
        this.getPrivacyDictionary = this.makeMethod('getPrivacyDictionary');
        this.reportComment = this.makeMethod('reportComment');
        this.getPlaylistUpdateInfo = this.makeMethod('getPlaylistUpdateInfo');
        this.getPlaylistThumbUploadUrl = this.makeMethod('getPlaylistThumbUploadUrl');
        this.savePlaylistThumb = this.makeMethod('savePlaylistThumb');
        this.savePlaylistAdditionalThumb = this.makeMethod('savePlaylistAdditionalThumb');
        this.getGroupSettings = this.makeMethod('getGroupSettings');
        this.publish = this.makeMethod('publish');
        this.reorderAlbums = this.makeMethod('reorderAlbums');
        this.restore = this.makeMethod('restore');
        this.stopStreaming = this.makeMethod('stopStreaming');
        this.getLiveStats = this.makeMethod('getLiveStats');
        this.getComments = this.makeMethod('getComments');
        this.feedVideosForYouBlockItems = this.makeMethod('feedVideosForYouBlockItems');
        this.getComment = this.makeMethod('getComment');
        this.agreeDisclaimer = this.makeMethod('agreeDisclaimer');
        /** TODO: [api-schema-typescript >= 1.5235.97] Add correct typings
         *  https://jira.mvk.com/browse/VKVIDEO-11643 / @v.koleneko
         */
        this.saveGroupSettings = this.makeMethod('saveGroupSettings');
        this.pinComment = this.makeMethod('pinComment');
        this.unpinComment = this.makeMethod('unpinComment');
        this.deleteComment = this.makeMethod('deleteComment');
        this.restoreComment = this.makeMethod('restoreComment');
        this.editComment = this.makeMethod('editComment');
        this.createComment = this.makeMethod('createComment');
        this.deleteThread = this.makeMethod('deleteThread');
        this.restoreThread = this.makeMethod('restoreThread');
        this.getStatsToken = this.makeMethod('getStatsToken', true);
        this.getPlayerConfig = this.makeMethod('getPlayerConfig', true);
        this.saveUploadedThumb = this.makeMethod('saveUploadedThumb');
        this.subscribeChooseRelevantAuthors = this.makeMethod('subscribeChooseRelevantAuthors');
        this.subscribeGetRelevantAuthors = this.makeMethod('subscribeGetRelevantAuthors');
        this.getThumbUploadUrl = this.makeMethod('getThumbUploadUrl');
        this.viewSegments = this.makeMethod('viewSegments');
        this.subscribeToAlbum = this.makeMethod('subscribeToAlbum');
        this.unsubscribeFromAlbum = this.makeMethod('unsubscribeFromAlbum');
        this.moderAction = this.makeMethod('moderAction');
        this.updateMovieInfo = this.makeMethod('updateMovieInfo');
        this.getMovieInfo = this.makeMethod('getMovieInfo');
        this.getMovieInfoDropdownData = this.makeMethod('getMovieInfoDropdownData');
        this.getModerationLog = this.makeMethod('getModerationLog');
        this.getCountriesForGeoBlockSection = this.makeMethod('getCountriesForGeoBlockSection');
        this.geoBlockSection = this.makeMethod('geoBlockSection');
        this.unblockSection = this.makeMethod('unblockSection');
        this.getGeoBlockSectionInfo = this.makeMethod('getGeoBlockSectionInfo');
        this.removeViewingHistoryRecords = this.makeMethod('removeViewingHistoryRecords');
        this.clearViewingHistoryRecords = this.makeMethod('clearViewingHistoryRecords');
        this.getExternalVideoHash = this.makeMethod('getExternalVideoHash');
        this.liveSubscribe = this.makeMethod('liveSubscribe');
        this.liveUnsubscribe = this.makeMethod('liveUnsubscribe');
        this.liveHeartbeat = this.makeMethod('liveHeartbeat');
        this.liveStopHeartbeat = this.makeMethod('liveStopHeartbeat');
        this.getLiveStatus = this.makeMethod('getLiveStatus');
        this.longPolling = this.makeMethod('getLongPollServer');
        this.bulkEdit = this.makeMethod('bulkEdit');
        this.bulkOperationRedo = this.makeMethod('bulkEditRedo');
        this.bulkEditCancel = this.makeMethod('bulkEditCancel');
        this.bulkEditGetTasks = this.makeMethod('bulkEditGetTasks');
        this.notInterested = this.makeMethod('notInterested');
        this.notRecommendOwner = this.makeMethod('notRecommendOwner');
        this.checkLink = this.makeMethod('checkActionLink');
    }
    get namespace() {
        return 'video';
    }
};
VideoApi = __decorate([
    scope.global()
], VideoApi);
export { VideoApi };
//# sourceMappingURL=VideoApi.js.map