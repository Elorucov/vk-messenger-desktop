import './SpaceJoinButton.css';
import React, { useCallback } from 'react';
import cx from 'classnames';
import { Button } from '@vkontakte/vkui';
import { Icon24Add } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
export const SpaceJoinButton = ({ space, variant, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const isMember = space.viewerData.isMember;
    const handleClick = useCallback(() => {
        isMember
            ? dispatch({
                type: 'UserLeftSpace',
                spaceId: space.id,
            })
            : dispatch({
                type: 'UserJoinedSpace',
                spaceId: space.id,
            });
    }, [dispatch, space.id, isMember]);
    const buttonText = isMember
        ? lang.use('me_spaces_join_button_leave_text')
        : lang.use('me_spaces_join_button_join_text');
    return (React.createElement("div", { className: "SpaceJoinButton" },
        !space.viewerData.isMember && (React.createElement("div", { className: cx('SpaceJoinButton__caption', `SpaceJoinButton__caption--${variant}`) }, lang.use('me_spaces_join_button_description', {
            values: {
                title: space.name,
            },
        }))),
        React.createElement(Button, { stretched: true, onClick: handleClick, loading: space.viewerData.isChangingMembership, size: "l", before: React.createElement(Icon24Add, null) }, buttonText)));
};
//# sourceMappingURL=SpaceJoinButton.js.map