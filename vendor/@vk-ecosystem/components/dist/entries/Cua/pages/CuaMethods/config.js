import { jsx } from 'react/jsx-runtime';
import { Icon28SmartphoneOutline, Icon28PhoneOutline, Icon28MailOutline, Icon28KeyOutline } from '@vkontakte/icons';
import { RasterIcon28LogoMaxCircleColor } from '@vkontakte-internal/icons-private';
import { cuaConfirmationMethods } from '../../constants/testIds.js';
var config = {
  max: {
    icon: jsx(RasterIcon28LogoMaxCircleColor, {}),
    title: 'vkconnect_sak_cua_methods_cell_max_title',
    description: 'vkconnect_sak_cua_methods_cell_max_description'
  },
  push: {
    icon: jsx(Icon28SmartphoneOutline, {}),
    title: 'vkconnect_sak_cua_methods_cell_push_title',
    description: 'vkconnect_sak_cua_methods_cell_push_description'
  },
  phone: {
    icon: jsx(Icon28PhoneOutline, {}),
    title: 'vkconnect_sak_cua_methods_cell_phone_title',
    description: 'vkconnect_sak_cua_methods_cell_phone_description',
    dataTestId: cuaConfirmationMethods.phoneCell
  },
  email: {
    icon: jsx(Icon28MailOutline, {}),
    title: 'vkconnect_sak_cua_methods_cell_email_title',
    description: 'vkconnect_sak_cua_methods_cell_email_description'
  },
  password: {
    icon: jsx(Icon28KeyOutline, {}),
    title: 'vkconnect_sak_cua_methods_cell_password_title',
    description: 'vkconnect_sak_cua_methods_cell_password_description',
    dataTestId: cuaConfirmationMethods.passwordCell
  }
};
export { config };
