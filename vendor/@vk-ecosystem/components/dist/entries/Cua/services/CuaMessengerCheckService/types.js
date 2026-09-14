var MessengerStatuses;
(function (MessengerStatuses) {
  /**
   * Код отправлен
   */
  MessengerStatuses[MessengerStatuses["OK"] = 1] = "OK";
  /**
   * Не удалось отправить код в мессенджер
   */
  MessengerStatuses[MessengerStatuses["ERROR"] = 3] = "ERROR";
  /**
   * Ожидаем отправку кода в мессенджер
   */
  MessengerStatuses[MessengerStatuses["WAIT"] = 19] = "WAIT";
})(MessengerStatuses || (MessengerStatuses = {}));
export { MessengerStatuses };
