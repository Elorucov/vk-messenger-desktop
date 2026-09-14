import { jsx } from 'react/jsx-runtime';
import vkQr from '@vkontakte/vk-qr';
import styles from './QRCode.module.css.js';
import { QR_SIZE, QR_SIZE_PADDING, QR_ECC_LEVEL } from './constants.js';
var QRCode = function QRCode(_ref) {
  var url = _ref.url,
    logo = _ref.logo;
  var qrSvg = vkQr.createQR(url, {
    qrSize: QR_SIZE - QR_SIZE_PADDING * 2,
    ecc: QR_ECC_LEVEL.HIGH,
    isShowLogo: true,
    logoData: logo
  });
  return jsx("div", {
    className: styles.container,
    children: jsx("div", {
      className: styles.qr,
      dangerouslySetInnerHTML: {
        __html: qrSvg
      }
    })
  });
};
export { QRCode };
