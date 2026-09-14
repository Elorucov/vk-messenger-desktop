import '../../ui/SpaceSectionsList/SpaceSectionsList.css';
import React, { useMemo } from 'react';
import * as Space from '../../../core/model/Space';
import { SpaceSection } from '../../ui/SpaceSection/SpaceSection';
import { SpaceRoom } from '../../ui/SpaceRoom/SpaceRoom';
export const SpaceSectionsList = ({ space, openedRoomId, }) => {
    const rooms = useMemo(() => Array.from(space.rooms.values()).reduce((acc, room) => {
        if (!room.sectionId) {
            return acc;
        }
        if (!acc[room.sectionId]) {
            acc[room.sectionId] = [];
        }
        acc[room.sectionId]?.push(room);
        return acc;
    }, {}), [space.rooms]);
    const topLevelRooms = Array.from(space.rooms.values()).filter((room) => !room.sectionId);
    return (React.createElement("div", { className: "SpaceSectionsList" },
        topLevelRooms.map((room) => (React.createElement(SpaceRoom, { room: room, key: room.id, spaceId: space.id, isSelected: openedRoomId === room.id }))),
        Array.from(space.sections.values(), (section) => (React.createElement(SpaceSection, { title: section.name, sectionId: section.id, spaceId: space.id, key: section.id, isAdmin: Space.isAdmin(space) }, rooms[section.id]?.map((room) => (React.createElement(SpaceRoom, { room: room, key: room.id, spaceId: space.id, isSelected: openedRoomId === room.id }))))))));
};
//# sourceMappingURL=SpaceSectionsList.js.map