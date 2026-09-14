import { CallsAppId, ClientStatsPlatform } from '../platform';
import { isLocationCallsStandalone } from '../../helpers';
export class Config {
    constructor(defaultConfig) {
        /**
         * Позволяет анонимам выводить аватары (не будет вставляться у них заглушка)
         * @default true
         */
        this.anonymPhoto = true;
        /**
         * Включает на пользователя принудительную серверную топологию
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_bad_network_p2p}
         */
        this.badNetworkP2P = true;
        /**
         * Выводит попапы предупреждения для браузеров, есть возможно заблокировать звонки для этих же браузеров
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.browser_warnings}
         */
        this.browserWarnings = [];
        /**
         * По appId позволяет скрыть некоторые или все баннеры-онбординги
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.call_disable_banners_by_app_id/}
         */
        this.disabledBanners = [];
        /**
         * Включает "постоянное" логирование в SDK.
         * Все логи будут сохраняться в localStorage и потом их можно будет через специальный метод выгрузить. Но в консоле не будет никаких логов
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_logging}
         */
        this.debugPersistentLog = false;
        /**
         * Включает консоль логирование в SDK
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_enable_console_debug_logs}
         */
        this.debugConsoleLog = false;
        /**
         * Включает логирование субтитров, работает если включена ручка debugConsoleLog
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_subtitles_logging}
         */
        this.debugSubtitlesLog = false;
        /**
         * Включает поддержку отправки логов при негативной оценки,
         * также это включает логирование в localstorage в sdk
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_upload_logs}
         */
        this.enableUploadDebugLogs = false;
        /**
         * Включить захвата аудио во время трансляции экрана.
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_audio_share_capability}
         *
         * @default false
         */
        this.enableAudioShare = false;
        /**
         * Запускает звонки на бендере (тестовый сервер звонков)
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_domain_bender}
         */
        this.enableDomainBender = false;
        /**
         * Включает отложенное включение медиа девайсов при присоединении к звонку по ссылке
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_join_call_delayed_media}
         */
        this.enableJoinCallDelayedMedia = false;
        /**
         * Разрешить вход в звонок одним пользователем с разных устройств одновременно
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_multiple_devices}
         */
        this.enableMultipleDevices = false;
        /**
         * Использовать новые правила allMute для админа
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enabled_new_mute_rules}
         */
        this.enableNewMuteRules = false;
        /**
         * Включает загрузку участников частями
         * UPD: Разработка была заморожена и тоггл выключен для всех
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_participant_list_chunk}
         */
        this.enableParticipantListChunk = false;
        /**
         * Включает логирование для скриншары
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_screen_share_not_visible_stat}
         */
        this.enableScreenShareNotVisibleStat = false;
        /**
         * Позволяет пропустить экран подключения к native и сразу запустить в вебе
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.calls_store_user_settings}
         */
        this.enableSkipJoinScreenFeature = false;
        /**
         * Добавляет возможность выводить видео в 1080p, появляется настройка в ui
         * @default false
         */
        this.fullHD = false;
        /**
         * Указывает что мы находимся в мессенджер окружении
         */
        this.vkme = false;
        /**
         * Указывает что мы находимся в сферум окружении
         */
        this.sferum = false;
        /**
         * Количество входящих видео-треков.
         * @default 30
         */
        this.videoSlotsCount = 30;
        /**
         * Отображение overlay рамок в списке доступных фонов в настройках виртуального фона
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_effects_overlay_items}
         */
        this.enableOverlayEffectItems = false;
        /**
         * Включает субтитры в звонках
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_subtitles_sferum}
         */
        this.enableSubtitlesSferum = false;
        /**
         * Пропускает экран подключения звонка к native приложениям
         */
        this.skipJoinScreen = false;
        /**
         * Определяет, какой режим будет для автоматического режима шумоподавления
         * подробнее описано в конфдате или в задач https://jira.mvk.com/browse/CALL-18094
         * @default 1
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.call_noise_reduction_auto_mode}
         */
        this.noiseReductionMode = 1;
        /**
         * Включает фичу выбора автоматического режима шумоподавления
         * подробнее описано в конфдате или в задач https://jira.mvk.com/browse/CALL-18094
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_noise_reduction_mode}
         */
        this.enableNoiseReductionMode = false;
        /**
         * Показывает счетчик зрителей при включении трансляции в звонке.
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_spectators_counter_vkcom}
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_spectators_counter_sferum}
         */
        this.enableSpectatorsCountVk = false;
        this.enableSpectatorsCountSferum = false;
        /**
         * Включает простой поддержку простого PiP'а. Который работает на PiP Api, а не Document PiP
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_simple_pip}
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_simple_pip_safari}
         */
        this.enableSimplePiPVk = false;
        this.enableSimplePiPSferum = false;
        /**
         * Включает автоматический переход в PiP при переходе в другую вкладку
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_auto_pip}
         */
        this.enableSimpleAutoPiP = false;
        /**
         * Идентификатор пользователя, приходит с бэка
         */
        this.deviceId = '';
        /**
         * Пагинация получения участников чата в списке добавления в звонок
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_chat_members_pagination}
         */
        this.enableChatMembersPagination = false;
        /**
         * Для кейсов когда нужно указать свою платформу
         */
        this.customClientStatsPlatform = null;
        /**
         * Включает возможность добавлять контакты в звонок и вручную раскрывать контакт.
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_debug_calls_to_contacts}
         */
        this.debugCallsToContacts = false;
        /**
         * App Id текущего клиента, использующего web calls.
         * Использутеся для сбора статистики по стартам звонка.
         */
        /**
         * Для кейсов когда нужно указать свой appId
         */
        this.customAppId = null;
        /**
         * Включение механизма добавления контактов в групповыен чаты
         * Общая ручка с бэком
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.calls_adding_contacts_to_chats}
         */
        this.enableAddingContactsToChats = false;
        /**
         * Включает таймер в сессионных залах
         * @default false
         *
         * * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_room_timer}
         */
        this.enableRoomTimer = false;
        /**
         * Включает модалку уведомления о завершении времени работы в сессионных залах для неадмина
         * @default false
         *
         * * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_room_nonadmin_timer_finished_warning}
         */
        this.enableRoomTimerFinishedWarning = false;
        /**
         * Опция перемещения всех участников в другую комнату вместо удаления всех из комнаты и пермещения в главный зал с кнопкой "удалить".
         * @default false
         *
         * * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_room_redesign_move_option}
         */
        this.enableRoomRedesignMoveOption = false;
        /**
         * Отображать сообщения администратора в сессионных залах при свернутом (или при PiP) звонке
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_room_admin_message_call_collapsed}
         */
        this.enableRoomAdminMessageCollapsed = false;
        /**
         * Включение использования 2 версии протокола Vmoji
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_vmoji_v2}
         */
        this.enableVmojiV2 = false;
        /**
         * Включает использование внутреннего мини-приложения для досок в ВК
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_mini_app_sharing}
         */
        this.enableMiniAppSharing = false;
        /**
         * Включает звонковые фичи в пространствах. Используется для разработки, пока нет дизайна
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_enable_call_features_in_spaces}
         */
        this.enableCallFeaturesInSpaces = false;
        /**
         * Выключает возможность войти в обычный звонок по ссылке с хэшом от voice room
         * @default false
         * @see https://jira.mvk.com/browse/CALL-20730
         * @deprecated Выпилить вместе с пространствами
         */
        this.enableCheckIsCallVoiceRoomHash = false;
        /**
         * Включение возможности отображать чат внутри окна звонка
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_in_call_chat}
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_sferum_in_call_chat}
         */
        this.enableInCallChatVk = false;
        this.enableInCallChatSferum = false;
        /**
         * Включение возможности отображать чат внутри окна звонка не только для групповых чатов
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_in_call_chat_for_private}
         */
        this.enableCallChatForPrivate = false;
        /**
         * Включает отображение нового экрана оценки звонка
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_disabled.web_calls_show_feedback_new_screen}
         */
        this.showFeedbackRedesignScreen = false;
        /**
         * Включает обновлённый вид для элементов массового выключение микрофонов и камер
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_redesign_of_mute_actions}
         */
        this.enableNewViewOfMuteActions = false;
        /**
         * Включает обновлённый вид для элементов массового выключение микрофонов и камер в Сферум
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_redesign_of_mute_actions_sferum}
         */
        this.enableNewViewOfMuteActionsSferum = false;
        /**
         * Отображать настройку комментирования трансляций в Сферум при планировании звонка
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_broadcast_planning_comments_setting_sferum}
         */
        this.enableBroadcastCommentsSetting = false;
        /**
         * Отображать таб выбора плейлистов в окне совместного просмотра в обычных звонках
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_watch_together_albums}
         */
        this.enableWatchTogetherAlbums = false;
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
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_whiteboard_in_new_tab_sferum}
         */
        this.enableWhiteboardInNewTabSferum = false;
        /**
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_client_noise_reduction_mode}
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_sferum_client_noise_reduction_mode}
         */
        this.enableClientNoiseReductionModeVk = false;
        this.enableClientNoiseReductionModeSferum = false;
        /**
         * URL для открытия доски в новой вкладке
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.sferum_whiteboard_minapp_url}
         */
        this.sferumWhiteboardMinappUrl = 'https://web.vk.me/?modal=services\u0026modal=miniapp51895239';
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
         * Редизайн мини вью
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_mini_view_redesign}
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_sferum_mini_view_redesign}
         */
        this.enableMiniViewRedesignVk = false;
        this.enableMiniViewRedesignSferum = false;
        /**
         * Включает новую очистку истории звонков на вебе, в т.ч. в сферуме
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_new_history_deletion}
         */
        this.enableNewHistoryDeletion = false;
        /**
         * Включает использование ParticipantsService
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.participants_service}
         */
        this.enableParticipantsService = false;
        /**
         * Включает историю записей трансляций для vkcom
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_broadcast_records_history}
         */
        this.enableBroadcastRecordsHistory = false;
        /**
         * Добавляет отображение настройки сервисности чата
         * @default false
         */
        this.enableChatSettings = false;
        /**
         * включает деградацию фпс для видео с камеры при низком фпс с включенными вирт фонами
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_enable_video_effects_fps_degradation}
         */
        this.enableVideoEffectsFpsDegradation = false;
        /**
         * Включение поддержки simulcast
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_simulcast}
         * {@link https://pmcmanager.mvk.com/Confdata/key/part_enabled.web_calls_simulcast_sferum}
         */
        this.enableSimulcastVk = false;
        this.enableSimulcastSferum = false;
        /**
         * Качество видео по умолчанию - высокое
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_video_resolution_hd}
         */
        this.enableHDVideo = false;
        /**
         * Включает записи звонков для vkcom
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_enable_calls_records}
         */
        this.enableCallsRecords = false;
        /**
         * Включение поддержки webtransport в sdk
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_webtransport}
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_webtransport_sferum}
         */
        this.enableWebtransportVk = false;
        this.enableWebtransportSferum = false;
        /**
         * Включение поддержки webtransport в MVK
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_webtransport_ff}
         */
        this.enableWebtransportMVK = false;
        /**
         * Включение поддержки webtransport (Firefox) в sdk
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_webtransport_ff}
         */
        this.enableWebtransportFF = false;
        /**
         * Включает отправку быстрошары по RTP
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_enable_consumer_fast_screen_share}
         */
        this.enableConsumerFastScreenShare = false;
        /**
         * Включает реагирование на смену настроек быстрошары по RTP
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_enable_consumer_fast_screen_share_quality_on_demand}
         */
        this.enableConsumerFastScreenShareQualityOnDemand = false;
        /**
         * Включение возможности запроса ключевого кадра из декодера скриншары
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_enable_stream_builder_key_frame_request}
         */
        this.enableStreamBuilderKeyFrameRequest = false;
        /**
         * Включение возможности переключиться на LibVPXDecoder с WebCodecsDecoder при декодировании скриншары
         * @default false
         *
         * {@link https://pmcmanager.mvk.com/Confdata/key/ok_call_section.enabled.web_calls_enable_stream_builder_auto_switch_to_libvpx}
         */
        this.enableStreamBuilderAutoSwitchToLibVPX = false;
        if (defaultConfig) {
            this.merge(defaultConfig);
        }
    }
    merge(newConfig) {
        Object.assign(this, newConfig);
    }
    get enableSpectatorsCount() {
        return this.sferum ? this.enableSpectatorsCountSferum : this.enableSpectatorsCountVk;
    }
    get enableSimplePiP() {
        return this.sferum ? this.enableSimplePiPSferum : this.enableSimplePiPVk;
    }
    /**
     * Идентификатор платформы, используемый при логировании
     * периодических и событийных метрик звонка
     */
    get clientStatsPlatform() {
        if (this.customClientStatsPlatform) {
            return this.customClientStatsPlatform;
        }
        if (this.vkme && this.sferum) {
            return ClientStatsPlatform.VK_WEB_MESSENGER_SFERUM;
        }
        if (this.vkme && !this.sferum) {
            return ClientStatsPlatform.VK_WEB_MESSENGER;
        }
        return ClientStatsPlatform.VK_WEB2;
    }
    get appId() {
        if (this.customAppId) {
            return this.customAppId;
        }
        if (this.vkme && this.sferum) {
            return CallsAppId.WEB_MESSENGER_SFERUM;
        }
        if (this.vkme && !this.sferum) {
            return CallsAppId.WEB_MESSENGER;
        }
        if (isLocationCallsStandalone()) {
            return CallsAppId.WEB_STANDALONE;
        }
        return CallsAppId.WEB;
    }
    get enableInCallChat() {
        return this.sferum ? this.enableInCallChatSferum : this.enableInCallChatVk;
    }
    get enableClientNoiseReductionMode() {
        return this.sferum ? this.enableClientNoiseReductionModeSferum : this.enableClientNoiseReductionModeVk;
    }
    get enableMiniViewRedesign() {
        return this.sferum ? this.enableMiniViewRedesignSferum : this.enableMiniViewRedesignVk;
    }
    get enableSimulcast() {
        return this.sferum ? this.enableSimulcastSferum : this.enableSimulcastVk;
    }
    get enableWebtransport() {
        if (this.clientStatsPlatform === ClientStatsPlatform.VK_MVK) {
            return this.enableWebtransportMVK;
        }
        return this.sferum ? this.enableWebtransportSferum : this.enableWebtransportVk;
    }
}
//# sourceMappingURL=callConfig.js.map