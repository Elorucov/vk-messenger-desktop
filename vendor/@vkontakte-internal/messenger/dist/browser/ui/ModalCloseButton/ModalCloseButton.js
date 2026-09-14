import { Icon24Cancel } from '@vkontakte/icons';
import cx from 'classnames';
import '../../ui/ModalCloseButton/ModalCloseButton.css';
import React, { useContext } from 'react';
import { ModalConfigContext } from '../../ui/ModalConfigProvider/ModalConfigProvider';
import { useColorScheme } from '@vkontakte/vkui';
export const ModalCloseButton = (props) => {
    const { closeLabel, mode, onClose } = props;
    const { isFullScreen } = useContext(ModalConfigContext);
    const isDarkTheme = useColorScheme() === 'dark';
    return (React.createElement("button", { className: cx('ModalCloseButton', !isFullScreen && 'ModalCloseButton--outside', isDarkTheme && 'ModalCloseButton--dark', mode === 'modalHeader' && 'ModalCloseButton--modalHeaderMode', mode === 'modalPanel' && 'ModalCloseButton--modalPanelMode'), "aria-label": closeLabel, onClick: onClose },
        React.createElement(Icon24Cancel, null)));
};
//# sourceMappingURL=ModalCloseButton.js.map