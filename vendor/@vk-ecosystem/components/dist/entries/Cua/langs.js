import { getLangNumericByRule, REPLACE_TOKEN } from '../../shared/helpers/langNumericUtils.js';
var getCuaLangs = function getCuaLangs(key) {
  switch (key) {
    /**
     * Общее
     */
    case 'vkconnect_sak_cua_change_method':
      return 'Подтвердить другим способом';
    case 'vkconnect_sak_cua_code_retry':
      return 'Отправить код еще раз';
    case 'vkconnect_sak_cua_nav_to_set_phone':
      return 'Подтвердить по номеру телефона';
    /**
     * Экран выбора фактора
     */
    case 'vkconnect_sak_cua_methods_title_desktop':
      return 'Выберите способ подтверждения';
    case 'vkconnect_sak_cua_methods_title_mobile':
      return 'Способы подтверждения';
    case 'vkconnect_sak_cua_methods_description':
      return "\u0414\u043B\u044F \u0437\u0430\u0449\u0438\u0442\u044B \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0443\u0431\u0435\u0434\u0438\u0442\u044C\u0441\u044F, \u0447\u0442\u043E\xA0\u0441\u043E\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0432\u0430\u0436\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u044B\u0442\u0430\u0435\u0442\u0435\u0441\u044C \u0438\u043C\u0435\u043D\u043D\u043E \u0432\u044B";
    case 'vkconnect_sak_cua_methods_cell_push_title':
      return "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0430\xA0\u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E";
    case 'vkconnect_sak_cua_methods_cell_push_description':
      return "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C push-\u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0430\xA0\u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u043D\u043E\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E";
    case 'vkconnect_sak_cua_methods_cell_email_title':
      return 'Электронная почта';
    case 'vkconnect_sak_cua_methods_cell_email_description':
      return 'Получить код на почту {value}';
    case 'vkconnect_sak_cua_methods_cell_max_title':
      return 'Приложение MAX';
    case 'vkconnect_sak_cua_methods_cell_max_description':
      return "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0432\u0445\u043E\u0434 \u0438\u043B\u0438\xA0\u0432\u0430\u0436\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0432\xA0\u0447\u0430\u0442\u0435 \u043C\u0435\u0441\u0441\u0435\u043D\u0434\u0436\u0435\u0440\u0430";
    case 'vkconnect_sak_cua_methods_cell_phone_title':
      return 'Номер телефона';
    case 'vkconnect_sak_cua_methods_cell_phone_description':
      return "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C SMS \u0438\u043B\u0438\xA0\u0437\u0432\u043E\u043D\u043E\u043A-\u0441\u0431\u0440\u043E\u0441 \u043D\u0430\xA0\u043D\u043E\u043C\u0435\u0440 {value}";
    case 'vkconnect_sak_cua_methods_cell_password_title':
      return 'Пароль';
    case 'vkconnect_sak_cua_methods_cell_password_description':
      return "\u0412\u0432\u0435\u0441\u0442\u0438 \u043F\u0430\u0440\u043E\u043B\u044C \u043E\u0442\xA0\u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430";
    case 'vkconnect_sak_cua_methods_cell_messenger_title':
      return 'Код из мессенджера';
    case 'vkconnect_sak_cua_methods_cell_messenger_description':
      return "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043A\u043E\u0434 \u043D\u0430\xA0\u043D\u043E\u043C\u0435\u0440 {value}";
    /**
     * Экран call_reset
     */
    case 'vkconnect_sak_cua_code_call_title':
      return "\u0412\u0430\u043C \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u0442 \u0437\u0432\u043E\u043D\u043E\u043A-\u0441\u0431\u0440\u043E\u0441 \u0434\u043B\u044F\xA0\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F";
    case 'vkconnect_sak_cua_code_call_description':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 <b>\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 4\xA0\u0446\u0438\u0444\u0440\u044B \u043D\u043E\u043C\u0435\u0440\u0430</b>, \u0441\xA0\u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E\xA0\u043F\u043E\u0441\u0442\u0443\u043F\u0438\u0442 \u0437\u0432\u043E\u043D\u043E\u043A-\u0441\u0431\u0440\u043E\u0441";
    case 'vkconnect_sak_cua_code_call_timer':
      return 'Звонок поступит в течение {timer}';
    case 'vkconnect_sak_cua_code_retry_send':
      return 'Запросить повторно';
    case 'vkconnect_sak_cua_code_retry_send_call_reset':
      return 'Запросить повторный звонок-сброс';
    /**
     * Экран sms
     */
    case 'vkconnect_sak_cua_code_sms_title':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u0438\u0437\xA0SMS \u0434\u043B\u044F\xA0\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F ";
    case 'vkconnect_sak_cua_code_sms_or_max_title':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u0438\u0437\xA0SMS \u0438\u043B\u0438\xA0\u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0432\xA0MAX";
    case 'vkconnect_sak_cua_code_sms_description':
      return "SMS-\u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043D\u0430\xA0\u043D\u043E\u043C\u0435\u0440";
    case 'vkconnect_sak_cua_code_sms_or_max_description':
      return "\u041A\u043E\u0434 \u043F\u0440\u0438\u0434\u0451\u0442 \u043D\u0430\xA0\u043D\u043E\u043C\u0435\u0440";
    case 'vkconnect_sak_cua_phone_aria_label':
      return 'начинающийся на {begin} и заканчивающийся на {end}';
    case 'vkconnect_sak_cua_code_sms_timer':
      return 'SMS придёт в течение {timer}';
    case 'vkconnect_sak_cua_code_sms_or_max_timer':
      return 'Сообщение придёт в течение {timer}';
    /**
     * Экран max
     */
    case 'vkconnect_sak_cua_code_max_title':
      return 'Подтвердите действие в мессенджере MAX';
    case 'vkconnect_sak_cua_code_max_qr_info':
      return "\u041E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 QR-\u043A\u043E\u0434 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u0438\xA0\u043F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u0432\xA0MAX";
    case 'vkconnect_sak_cua_code_max_messenger_info':
      return 'В чате «Коды подтверждения» нажмите «Подтвердить»';
    case 'vkconnect_sak_cua_code_max_description':
      return "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u0434\u0451\u0442 \u0432\xA0\u0447\u0430\u0442\xA0\xAB\u041A\u043E\u0434\u044B \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F\xBB \u043D\u0430\xA0\u043D\u043E\u043C\u0435\u0440";
    case 'vkconnect_sak_cua_code_max_button':
      return 'Перейти в MAX';
    /**
     * Экран мессенджера
     */
    case 'vkconnect_sak_cua_code_messenger_title':
      return 'Введите код из {messengerName}';
    case 'vkconnect_sak_cua_code_messenger_description':
      return "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441 \u043A\u043E\u0434\u043E\u043C \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0432\xA0{primary}{messengerName}{/primary} \u043D\u0430\xA0\u043D\u043E\u043C\u0435\u0440 {primary}{phone}{/primary}";
    case 'vkconnect_sak_cua_code_messenger_fail_title':
      return 'Не удалось отправить код';
    case 'vkconnect_sak_cua_code_messenger_fail_subtitle':
      return "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u0432\u0430\u0448 \u043C\u0435\u0441\u0441\u0435\u043D\u0434\u0436\u0435\u0440 \u043D\u0435\xA0\u0430\u043A\u0442\u0438\u0432\u0435\u043D. \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u0438\u043C \u0441\u043F\u043E\u0441\u043E\u0431\u043E\u043C";
    /**
     * Экран push
     */
    case 'vkconnect_sak_cua_code_push_title':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u0438\u0437\xA0\u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0434\u043B\u044F\xA0\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F";
    case 'vkconnect_sak_cua_code_push_description':
      return "Push-\u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043D\u0430\xA0\u0432\u0430\u0448\u0435\xA0\u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E";
    case 'vkconnect_sak_cua_code_push_timer':
      return 'Код придёт в течение {timer}';
    case 'vkconnect_sak_cua_code_push_description_aria_label':
      return 'Пуш-уведомление отправлено на ваше устройство';
    /**
     * Экран email
     */
    case 'vkconnect_sak_cua_code_email_title':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u0438\u0437\xA0\u043F\u0438\u0441\u044C\u043C\u0430 \u0434\u043B\u044F\xA0\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F";
    case 'vkconnect_sak_cua_code_email_description':
      return 'Письмо отправлено на почту {email}';
    case 'vkconnect_sak_cua_code_email_timer':
      return 'Письмо с кодом придёт в течение {timer}';
    case 'vkconnect_sak_cua_email_aria_label':
      return 'начинающуюся на {begin} и заканчивающийся на {end}';
    /**
     * Экран password
     */
    case 'vkconnect_sak_cua_password_title':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C \u0434\u043B\u044F\xA0\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F";
    case 'vkconnect_sak_cua_password_description_email':
      return "\u041F\u0430\u0440\u043E\u043B\u044C \u043E\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 VK\xA0ID\xA0\u0441\xA0\u043F\u043E\u0447\u0442\u043E\u0439 {email}";
    case 'vkconnect_sak_cua_password_description_login':
      return "\u041F\u0430\u0440\u043E\u043B\u044C \u043E\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 VK\xA0ID \u0441\xA0\u043B\u043E\u0433\u0438\u043D\u043E\u043C {login}";
    case 'vkconnect_sak_cua_password_description_phone':
      return "\u041F\u0430\u0440\u043E\u043B\u044C \u043E\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 VK\xA0ID \u0441\xA0\u043D\u043E\u043C\u0435\u0440\u043E\u043C {phone}";
    case 'vkconnect_sak_cua_password_next_btn':
      return 'Продолжить';
    case 'vkconnect_sak_cua_password_restore':
      return 'Забыли пароль?';
    case 'vkconnect_sak_cua_password_view_aria_label':
      return 'Показать пароль';
    case 'vkconnect_sak_cua_password_hide_aria_label':
      return 'Скрыть пароль';
    /**
     * Экран привязки номера телефона
     */
    case 'vkconnect_sak_cua_set_phone_title':
      return "\u041F\u0440\u0438\u0432\u044F\u0436\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u0434\u043B\u044F\xA0\u0437\u0430\u0449\u0438\u0442\u044B \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430";
    case 'vkconnect_sak_cua_set_phone_description':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 <b>\u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430</b>, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C \u043A\xA0\u0441\u0432\u043E\u0435\u043C\u0443 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0443";
    case 'vkconnect_sak_cua_set_phone_next_btn':
      return 'Продолжить';
    /**
     * Экран привязки номера почты
     */
    case 'vkconnect_sak_cua_set_email_title':
      return "\u041F\u0440\u0438\u0432\u044F\u0436\u0438\u0442\u0435 \u043F\u043E\u0447\u0442\u0443 \u0434\u043B\u044F\xA0\u0437\u0430\u0449\u0438\u0442\u044B\xA0\u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430";
    case 'vkconnect_sak_cua_set_email_description':
      return "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u043E\u0447\u0442\u0443, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E\u0442\xA0\u0441\u0435\u0440\u0432\u0438\u0441\u043E\u0432 VK \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0434\u043E\u0441\u0442\u0443\u043F \u043A\xA0\u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0443 \u043F\u0440\u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u0438";
    case 'vkconnect_sak_cua_set_email_input_placeholder':
      return 'Введите почту';
    case 'vkconnect_sak_cua_set_email_next_btn':
      return 'Продолжить';
    /**
     * Экран привязки пароля
     */
    case 'vkconnect_sak_cua_set_password_title':
      return 'Придумайте новый пароль';
    case 'vkconnect_sak_cua_set_password_description':
      return 'Или используйте пароль, предложенный устройством';
    case 'vkconnect_sak_cua_set_password_input_placeholder':
      return 'Введите новый пароль';
    case 'vkconnect_sak_cua_generate_password_title':
      return 'Сгенерировать пароль';
    case 'vkconnect_sak_cua_set_password_input_description':
      return 'Минимум 8 символов — заглавные и строчные буквы, цифры и спецсимволы (! “ # $ % ‘ () *)';
    case 'vkconnect_sak_cua_set_password_confirm_input_placeholder':
      return 'Повторите новый пароль';
    case 'vkconnect_sak_cua_set_password_checkbox_label':
      return 'Выйти на всех устройствах, кроме текущего';
    case 'vkconnect_sak_cua_set_password_next_btn':
      return 'Продолжить';
    case 'vkconnect_sak_cua_set_password_weak_password_title':
      return 'Слабый пароль';
    case 'vkconnect_sak_cua_set_password_fair_password_title':
      return 'Неплохой пароль';
    case 'vkconnect_sak_cua_set_password_secure_password_title':
      return 'Надёжный пароль';
    case 'vkconnect_sak_cua_set_password_different_passwords_error':
      return 'Пароли не совпадают';
    /**
     * Экран отображения ошибок
     */
    case 'vkconnect_sak_cua_error_incorrect_code':
      return 'Неверный код';
    case 'vkconnect_sak_cua_error_incorrect_password':
      return 'Неверный пароль';
    case 'vkconnect_sak_cua_error_default_btn_text':
      return 'Закрыть';
    case 'vkconnect_sak_cua_error_internal_header':
      return 'Ошибка';
    case 'vkconnect_sak_cua_error_internal_text':
      return 'Что-то пошло не так.';
    case 'vkconnect_sak_cua_error_flood_header':
      return 'Лимит запросов исчерпан';
    case 'vkconnect_sak_cua_error_flood_text':
      return 'Вы запросили или ввели код слишком много раз подряд. Попробуйте снова позже.';
    case 'vkconnect_sak_cua_error_password_flood_header':
      return 'Исчерпан лимит попыток ввода пароля';
    case 'vkconnect_sak_cua_error_password_flood_text':
      return 'Вы ввели неверный пароль слишком много раз подряд. Повторите попытку позже.';
    case 'vkconnect_sak_cua_error_try_resend_header':
      return 'Лимит запросов исчерпан';
    case 'vkconnect_sak_cua_error_try_resend_text':
      return 'Вы запросили или ввели код слишком много раз подряд. Попробуйте снова позже.';
    case 'vkconnect_sak_cua_error_password_minimum_length':
      return 'Пароль должен быть не короче 6 символов';
    case 'vkconnect_sak_cua_error_password_bad_passwword':
      return 'Указан неверный пароль';
    case 'vkconnect_sak_cua_error_password_compromised_password':
      return 'Ваш пароль был скомпрометирован';
    case 'vkconnect_sak_cua_error_password_numeric_password':
      return 'Пароль слишком простой';
    case 'vkconnect_sak_cua_error_password_long_password':
      return 'Пароль должен быть не более 1024 символов';
    case 'vkconnect_sak_cua_error_password_not_herdening':
      return 'Этот пароль небезопасен';
    case 'vkconnect_sak_cua_error_password_used_in_another_profile':
      return 'Этот пароль не может быть использован';
    case 'vkconnect_sak_cua_error_password_security_header':
      return 'Ошибка доступа';
    case 'vkconnect_sak_cua_error_password_security_text':
      return 'Доступ запрещен';
    case 'vkconnect_sak_cua_error_password_db_fail_header':
      return 'Произошла ошибка';
    case 'vkconnect_sak_cua_error_password_db_fail_text':
      return 'Повторите операцию позже';
    case 'vkconnect_sak_cua_error_password_alreadey_set_header':
      return 'Этот пароль найден в открытом доступе';
    case 'vkconnect_sak_cua_error_password_alreadey_set_text':
      return 'Такой пароль небезопасен — его могут использовать злоумышленники. Установите другой.';
    case 'vkconnect_sak_cua_error_password_alreadey_set_btn_text':
      return 'Понятно';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_user_header':
      return 'Невозможно изменить номер телефона';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_user_text':
      return 'Обратитесь в поддержку, чтобы изменить номер, привязанный к вашему аккаунту';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_user_btn_use_phone':
      return 'Использовать другой номер';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_user_btn_support':
      return 'Написать в поддержку';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_header':
      return 'Номер заблокирован';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_text':
      return 'Невозможно изменить номер. Обратитесь в поддержку, чтобы изменить номер, привязанный к вашему аккаунту';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_btn_use_phone':
      return 'Использовать другой номер';
    case 'vkconnect_sak_cua_error_phone_validate_release_restristed_btn_support':
      return 'Написать в поддержку';
    case 'vkconnect_sak_cua_error_phone_otp_enabled_header':
      return 'Номер уже используется в другом аккаунте с 2FA';
    case 'vkconnect_sak_cua_error_phone_otp_enabled_text':
      return 'Чтобы привязать номер, перейдите в аккаунт, где этот номер уже используется, и отключите двухфакторную аутентификацию';
    case 'vkconnect_sak_cua_error_phone_otp_enabled_btn_use_phone':
      return 'Указать другой номер';
    case 'vkconnect_sak_cua_error_phone_otp_enabled_btn_support':
      return 'Как освободить этот номер';
    case 'vkconnect_sak_cua_error_phone_validate_incorrect_phone_header':
      return 'Номер не найден';
    case 'vkconnect_sak_cua_error_phone_validate_incorrect_phone_text':
      return 'Этот номер не существует или указан неправильно. \nУбедитесь, что ввели его без ошибок, и попробуйте снова.';
    case 'vkconnect_sak_cua_error_phone_validate_incorrect_phone_text_btn_use_phone':
      return 'Повторить попытку';
    case 'vkconnect_sak_cua_error_phone_validate_current_phone_activated_header':
      return 'К VK ID уже привязан номер';
    case 'vkconnect_sak_cua_error_phone_validate_current_phone_activated_text':
      return 'К вашему аккаунту VK ID уже привязан номер';
    case 'vkconnect_sak_cua_error_phone_validate_user_already_activated_today_header':
      return 'Вы уже привязали номер';
    case 'vkconnect_sak_cua_error_phone_validate_user_already_activated_today_text':
      return 'Исчерпан дневной лимит на привязку номеров.\nПопробуйте снова завтра.';
    case 'vkconnect_sak_cua_error_phone_validate_used_last_bind_header':
      return 'Ошибка';
    case 'vkconnect_sak_cua_error_phone_validate_used_last_bind_text':
      return 'Номер {phone} уже недавно привязывался к другому аккаунту ВКонтакте. Страницу можно привязать к другому номеру или попробовать использовать этот номер позже.';
    case 'vkconnect_sak_cua_error_phone_validate_already_used_today_header':
      return 'Вы уже привязали номер';
    case 'vkconnect_sak_cua_error_phone_validate_already_used_today_text':
      return 'Исчерпан дневной лимит на привязку номеров.\nПопробуйте снова завтра.';
    case 'vkconnect_sak_cua_error_phone_validate_banned_header':
      return 'Аккаунт или номер заблокированы';
    case 'vkconnect_sak_cua_error_phone_validate_banned_text':
      return 'Дождитесь разблокировки и попробуйте снова';
    case 'vkconnect_sak_cua_error_phone_validate_unknown_error_header':
      return 'Возникла ошибка';
    case 'vkconnect_sak_cua_error_phone_validate_unknown_error_text':
      return 'Не удалось привязать номер из-за системной ошибки';
    case 'vkconnect_sak_cua_error_phone_validate_already_phone_owner_header':
      return 'Номер уже привязан';
    case 'vkconnect_sak_cua_error_phone_validate_already_phone_owner_text':
      return 'Этот номер уже привязан к вашему аккаунту VK ID';
    case 'vkconnect_sak_cua_error_phone_validate_occupied_header':
      return 'Номер занят';
    case 'vkconnect_sak_cua_error_phone_validate_occupied_text':
      return 'Этот номер уже используется в другом аккаунте VK ID. \nУкажите другой.';
    case 'vkconnect_sak_cua_error_phone_validate_occupied_btn_use_phone':
      return 'Указать другой номер';
    /**
     * Экран загрузки mobile_id
     */
    case 'vkconnect_sak_cua_number_verification':
      return 'Верификация номера...';
    case 'vkconnect_sak_cua_number_verification_wait':
      return "\u041F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043D\u0435\u043C\u043D\u043E\u0433\u043E, \n \u043D\u0435 \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044F \u044D\u0442\u043E \u043E\u043A\u043D\u043E";
    default:
      return '';
  }
};
var langNumericStrings = {
  vkconnect_sak_cua_code_timer_label_seconds: [REPLACE_TOKEN + " \u0441\u0435\u043A\u0443\u043D\u0434\u044B", REPLACE_TOKEN + " \u0441\u0435\u043A\u0443\u043D\u0434"],
  vkconnect_sak_cua_code_call_timer_label_minutes: ["\u0417\u0432\u043E\u043D\u043E\u043A \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442\u044B", "\u0417\u0432\u043E\u043D\u043E\u043A \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442"],
  vkconnect_sak_cua_code_sms_timer_label_minutes: ["SMS \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442\u044B", "SMS \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442"],
  vkconnect_sak_cua_code_push_timer_label_minutes: ["\u041A\u043E\u0434 \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442\u044B", "\u041A\u043E\u0434 \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442"],
  vkconnect_sak_cua_code_email_timer_label_minutes: ["\u041F\u0438\u0441\u044C\u043C\u043E \u0441 \u043A\u043E\u0434\u043E\u043C \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442\u044B", "\u041F\u0438\u0441\u044C\u043C\u043E \u0441 \u043A\u043E\u0434\u043E\u043C \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 " + REPLACE_TOKEN + " \u043C\u0438\u043D\u0443\u0442"]
};
var getCuaLangsNumeric = function getCuaLangsNumeric(number, key) {
  var _langNumericStrings$k;
  var strings = (_langNumericStrings$k = langNumericStrings[key]) != null ? _langNumericStrings$k : [];
  switch (key) {
    case 'vkconnect_sak_cua_code_timer_label_seconds':
    case 'vkconnect_sak_cua_code_call_timer_label_minutes':
    case 'vkconnect_sak_cua_code_sms_timer_label_minutes':
    case 'vkconnect_sak_cua_code_push_timer_label_minutes':
    case 'vkconnect_sak_cua_code_email_timer_label_minutes':
      return getLangNumericByRule(number, strings);
    default:
      return number.toString();
  }
};
export { getCuaLangs, getCuaLangsNumeric };
