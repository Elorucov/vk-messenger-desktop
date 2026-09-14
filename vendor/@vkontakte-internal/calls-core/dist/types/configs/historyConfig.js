export class HistoryConfig {
    constructor(defaultConfig) {
        /**
         * Указывает что мы находимся в сферум окружении
         */
        this.sferum = false;
        /**
         * Отображать настройку комментирования трансляций в Сферум при планировании звонка
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_broadcast_planning_comments_setting_sferum}
         */
        this.enableBroadcastCommentsSetting = false;
        /**
         * Надо ли пропускать автоматический запуск модального окна скачивания/открытия десктоп приложения звонков
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_skip_desktop_app_modal}
         */
        this.enableSkipDesktopAppModal = false;
        /**
         * Указывать для добавляемого, будут ли доступны предыдущие 250 сообщений в чате
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_chat_history_toggle}
         */
        this.enableChatHistoryToggle = false;
        /**
         * Sferum: Указывать для добавляемого, будут ли доступны предыдущие 250 сообщений в чате
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_chat_history_toggle_edu}
         */
        this.enableChatHistoryToggleEdu = false;
        /**
         * Включает отображение элементов функционала короткой ссылки в окружениях за исключением Сферума
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_short_credentials}
         */
        this.enableShortCredentials = false;
        /**
         * Включает отображение элементов функционала короткой ссылки в Сферуме
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_short_credentials_sferum}
         */
        this.enableShortCredentialsSferum = false;
        /**
         * Включает отобржаение QR-кода ссылки на звонок в окружениях за исключеним Сферума
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_join_link_qr_code}
         */
        this.enableQRCode = false;
        /**
         * Включает отобржаение QR-кода ссылки на звонок в Сферуме
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_join_link_qr_code_sferum}
         */
        this.enableQRCodeSferum = false;
        /**
         * Включает новую очистку истории звонков на вебе, в т.ч. в сферуме
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_new_history_deletion}
         */
        this.enableNewHistoryDeletion = false;
        /**
         * Включает историю записей трансляций для vkcom
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_broadcast_records_history}
         */
        this.enableBroadcastRecordsHistory = false;
        /**
         * Включает записи звонков для vkcom
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_enable_calls_records}
         */
        this.enableCallsRecords = false;
        /**
         * Включает показ UserStack в истории груповых звонков
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.history_group_user_stack_preview}
         */
        this.enableHistoryGroupUserStackPreview = false;
        /**
         * Набор аватарок для анонимов
         */
        this.anonymPhotoBaseUrls = [];
        if (defaultConfig) {
            this.merge(defaultConfig);
        }
    }
    merge(newConfig) {
        Object.assign(this, newConfig);
    }
}
//# sourceMappingURL=historyConfig.js.map