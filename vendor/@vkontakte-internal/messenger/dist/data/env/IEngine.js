export var IEngine;
(function (IEngine) {
    // @TODO вернуть const enum после починки сборки сторибука
    let MarkedType;
    (function (MarkedType) {
        MarkedType[MarkedType["Mention"] = 1] = "Mention";
        MarkedType[MarkedType["ExpiringMessage"] = 2] = "ExpiringMessage";
    })(MarkedType = IEngine.MarkedType || (IEngine.MarkedType = {}));
    /**
     * Названия этих флагов взяты из PHP кода для упрощения поиска
     * и выяснения деталей.
     *
     * @TODO: вернуть const enum после починки сборки сторибука
     */
    let ChatUpdateType;
    (function (ChatUpdateType) {
        ChatUpdateType[ChatUpdateType["CopyFlagChanged"] = 0] = "CopyFlagChanged";
        ChatUpdateType[ChatUpdateType["TitleChanged"] = 1] = "TitleChanged";
        ChatUpdateType[ChatUpdateType["AvatarChanged"] = 2] = "AvatarChanged";
        ChatUpdateType[ChatUpdateType["AdminGrated"] = 3] = "AdminGrated";
        ChatUpdateType[ChatUpdateType["FlagsChanged"] = 4] = "FlagsChanged";
        ChatUpdateType[ChatUpdateType["Pinned"] = 5] = "Pinned";
        ChatUpdateType[ChatUpdateType["UserJoined"] = 6] = "UserJoined";
        ChatUpdateType[ChatUpdateType["UserLeft"] = 7] = "UserLeft";
        ChatUpdateType[ChatUpdateType["UserKicked"] = 8] = "UserKicked";
        ChatUpdateType[ChatUpdateType["AdminKicked"] = 9] = "AdminKicked";
        ChatUpdateType[ChatUpdateType["BannerChanged"] = 10] = "BannerChanged";
        ChatUpdateType[ChatUpdateType["KeyboardChanged"] = 11] = "KeyboardChanged";
        ChatUpdateType[ChatUpdateType["MessageRequestChanged"] = 12] = "MessageRequestChanged";
        ChatUpdateType[ChatUpdateType["ContactConverted"] = 13] = "ContactConverted";
        ChatUpdateType[ChatUpdateType["BusinessNotifyDataChanged"] = 14] = "BusinessNotifyDataChanged";
        ChatUpdateType[ChatUpdateType["MessageRequestCanceled"] = 15] = "MessageRequestCanceled";
        ChatUpdateType[ChatUpdateType["MessageRequestRejected"] = 16] = "MessageRequestRejected";
        ChatUpdateType[ChatUpdateType["MessageRequestAccepted"] = 17] = "MessageRequestAccepted";
        ChatUpdateType[ChatUpdateType["ContactJoined"] = 18] = "ContactJoined";
        ChatUpdateType[ChatUpdateType["CallInProgressChanged"] = 19] = "CallInProgressChanged";
        ChatUpdateType[ChatUpdateType["DonSubscribed"] = 20] = "DonSubscribed";
        ChatUpdateType[ChatUpdateType["DonUnsubscribed"] = 21] = "DonUnsubscribed";
        ChatUpdateType[ChatUpdateType["IsNewChange"] = 22] = "IsNewChange";
        ChatUpdateType[ChatUpdateType["StyleChanged"] = 23] = "StyleChanged";
        ChatUpdateType[ChatUpdateType["DescriptionChanged"] = 24] = "DescriptionChanged";
        ChatUpdateType[ChatUpdateType["ShortPollReactionsChanged"] = 25] = "ShortPollReactionsChanged";
        ChatUpdateType[ChatUpdateType["IncognitoJoined"] = 26] = "IncognitoJoined";
        ChatUpdateType[ChatUpdateType["ConvertIncognito"] = 27] = "ConvertIncognito";
        ChatUpdateType[ChatUpdateType["IncognitoLeft"] = 28] = "IncognitoLeft";
        ChatUpdateType[ChatUpdateType["PostponedMessagesCountChanged"] = 29] = "PostponedMessagesCountChanged";
        ChatUpdateType[ChatUpdateType["PostponedMessagesError"] = 30] = "PostponedMessagesError";
        ChatUpdateType[ChatUpdateType["UserMigratedToMax"] = 32] = "UserMigratedToMax";
        ChatUpdateType[ChatUpdateType["OwnerGranted"] = 33] = "OwnerGranted";
        ChatUpdateType[ChatUpdateType["MembersChanged"] = 35] = "MembersChanged";
    })(ChatUpdateType = IEngine.ChatUpdateType || (IEngine.ChatUpdateType = {}));
    let MRStatus;
    (function (MRStatus) {
        MRStatus[MRStatus["Deleted"] = 0] = "Deleted";
        MRStatus[MRStatus["Accepted"] = 1] = "Accepted";
        MRStatus[MRStatus["Rejected"] = 2] = "Rejected";
        MRStatus[MRStatus["New"] = 3] = "New";
    })(MRStatus = IEngine.MRStatus || (IEngine.MRStatus = {}));
    function isIncompleteUpdate(update) {
        /**
         * Тут мы используем небольшой трюк, чтобы всегда поддерживать
         * актуальную границу проверки на длину кортежа.
         * Тип будет представлять из себя числовой литерал равный длине кортежа,
         * таким образом при изменении длины возникнет ошибка компиляции.
         */
        switch (update[0]) {
            case 10004: {
                const expectedLength = 12;
                /**
                 * Если мы получаем больше элементов - это не страшно и нас не сломает.
                 * Но если мы получаем меньше - то это звучит как неполный апдейт.
                 */
                return update.length < expectedLength;
            }
            case 10005: {
                const expectedLength = 11;
                return update.length < expectedLength;
            }
            case 10018: {
                const expectedLength = 11;
                return update.length < expectedLength;
            }
            default:
                return false;
        }
    }
    IEngine.isIncompleteUpdate = isIncompleteUpdate;
})(IEngine || (IEngine = {}));
//# sourceMappingURL=IEngine.js.map