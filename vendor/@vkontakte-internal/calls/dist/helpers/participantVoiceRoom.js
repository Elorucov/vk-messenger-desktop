import { isAdmin, isCreator, } from '@vkontakte-internal/calls-core';
let prevActiveVoiceRoomParticipants = [];
export function getActiveVoiceRoomDevices({ devices, participants, localDevice, externalId, restrictedConversation, participantIdsByMyRoomId, }) {
    const me = [];
    const creators = [];
    const adminsWithVideo = [];
    const adminsWithAnimoji = [];
    const otherAdmins = [];
    const video = [];
    const animoji = [];
    const others = [];
    if (externalId && !restrictedConversation) {
        me.push({
            ...localDevice,
            externalId,
        });
    }
    for (const roomParticipant of participantIdsByMyRoomId) {
        const device = devices[roomParticipant.idString];
        if (device) {
            const participant = participants[device.externalId.id];
            switch (true) {
                case !device.status: {
                    // do nothing
                    break;
                }
                case isCreator(participant): {
                    creators.push(device);
                    break;
                }
                case isAdmin(participant): {
                    switch (true) {
                        case !!device.mediaSettings.isVideoEnabled: {
                            adminsWithVideo.push(device);
                            break;
                        }
                        case !!device.mediaSettings.isAnimojiEnabled: {
                            adminsWithAnimoji.push(device);
                            break;
                        }
                        default: {
                            otherAdmins.push(device);
                        }
                    }
                    break;
                }
                case !!device.mediaSettings.isVideoEnabled: {
                    video.push(device);
                    break;
                }
                case !!device.mediaSettings.isAnimojiEnabled: {
                    animoji.push(device);
                    break;
                }
                default: {
                    others.push(device);
                }
            }
        }
    }
    const newActiveParticipants = [
        ...me,
        ...creators,
        ...adminsWithVideo,
        ...adminsWithAnimoji,
        ...otherAdmins,
        ...video,
        ...animoji,
        ...others,
    ];
    if (newActiveParticipants.length !== prevActiveVoiceRoomParticipants.length) {
        prevActiveVoiceRoomParticipants = newActiveParticipants;
    }
    else {
        for (let i = 0; i < newActiveParticipants.length; i++) {
            if (newActiveParticipants[i] !== prevActiveVoiceRoomParticipants[i]) {
                prevActiveVoiceRoomParticipants = newActiveParticipants;
                break;
            }
        }
    }
    return {
        activeDevices: prevActiveVoiceRoomParticipants,
    };
}
//# sourceMappingURL=participantVoiceRoom.js.map