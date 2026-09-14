import { insertSpaces } from '../store/State';
import { exhaustivenessCheck, sleep } from '../../core/utils/misc';
import * as Space from '../../core/model/Space';
import * as Peer from '../../core/model/Peer';
import { IApi } from '../env/IApi';
import { fromApiNotificationSettings } from '../converter/SpaceConverter';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'SpaceEngineBatchReceived': {
            switch (action.variant.kind) {
                case 'FromSpaceEngine': {
                    return handleFromSpaceEngine(draft, action.variant);
                }
                case 'FromSpaceEngineWithMissingData': {
                    return handleFromSpaceEngineWithMissingData(draft, action.variant, featureFlags);
                }
                case 'FromSpaceEngineApiHistory': {
                    return handleFromSpaceEngineApiHistory(draft, action.variant, featureFlags);
                }
                default:
                    return exhaustivenessCheck(action.variant);
            }
        }
        default:
            return exhaustivenessCheck(action.type);
    }
};
function handleFromSpaceEngine(draft, variant) {
    const { next } = variant;
    if (next.kind === 'Failure') {
        draft.spaceConn.status = 'resyncing';
        const { ts } = draft.spaceConn;
        const reconnectAttempts = draft.spaceConn.reconnectAttempts++;
        return [
            async function resyncSpaces({ api, spaceEngine, logger }) {
                if (!spaceEngine) {
                    return {
                        type: 'Noop',
                    };
                }
                // Не будем спамить АПИ, подождем чуть-чуть для ресинка.
                // Иначе в случае постоянных разрывов лп мы будем перезапрашивать
                // gLPH как бешеные.
                const timeout = Math.min(2 ** reconnectAttempts * 500, 10 * 1000);
                await sleep(timeout);
                let res;
                // Хотя количество ретраев у этого вызова бесконечное, он
                // все равно может сфейлится при аборте.
                // Такой аборт случается при рефреше страницы в браузере
                // и спамит ошибкам в Сентри.
                // Поэтому схендлим этот кейс, чтобы их избежать.
                try {
                    res = await api.fetch('spaces.getLongPollHistory', {
                        lp_version: spaceEngine.version,
                        ts,
                        // Тут лимит взят просто из головы.
                        // Пытаемся запрашивать не слишком мало и не слишком много.
                        limit: 1000,
                        extended: 1,
                    }, { retries: Infinity, timeout: 30 * 1000 });
                }
                catch (err) {
                    if (err instanceof IApi.RequestError) {
                        logger.error('[SPACE RESYNC]', err);
                    }
                    return {
                        type: 'Noop',
                    };
                }
                spaceEngine.connect({
                    ...res.credentials,
                    // Будем загружать историю в несколько заходов,
                    // поэтому заменим тут ts на пришедший.
                    ts: res.new_ts,
                });
                return {
                    type: 'SpaceEngineBatchReceived',
                    variant: {
                        kind: 'FromSpaceEngineApiHistory',
                        ts: res.new_ts,
                        // К сожалению, АПИ не может сгенерировать нам достаточно подходящие типы,
                        // поэтому тут мы вынуждены кастить
                        spacesGLPHResponse: res,
                    },
                };
            },
        ];
    }
    const missing = collectMissingData(draft, next);
    if (missing.spaceIds.size > 0 || missing.spaceSettingsIds.size > 0) {
        return [
            async function fetchSpacesMissingData({ api }) {
                try {
                    const [spacesGetByIdResponse, spacesGetSettingsResponse] = await api.fetchMany([
                        missing.spaceIds.size > 0 && {
                            method: 'spaces.getById',
                            params: {
                                space_ids: Array.from(missing.spaceIds).join(','),
                                extended: 1,
                            },
                        },
                        missing.spaceSettingsIds.size > 0 && {
                            method: 'spaces.getSpaceSettings',
                            params: {
                                space_ids: Array.from(missing.spaceSettingsIds).join(','),
                            },
                        },
                    ], { retries: Infinity });
                    return {
                        type: 'SpaceEngineBatchReceived',
                        variant: {
                            kind: 'FromSpaceEngineWithMissingData',
                            next,
                            spacesGetByIdResponse,
                            spacesGetSettingsResponse,
                        },
                    };
                }
                catch {
                    return {
                        type: 'Noop',
                    };
                }
            },
        ];
    }
    draft.spaceConn.reconnectAttempts = 0;
    return handleUpdates(draft, next);
}
function handleFromSpaceEngineWithMissingData(draft, variant, featureFlags) {
    const { next, spacesGetByIdResponse, spacesGetSettingsResponse } = variant;
    if (spacesGetByIdResponse) {
        insertSpaces(draft, spacesGetByIdResponse.items, {
            apiConvos: spacesGetByIdResponse.conversations || [],
            apiUsers: spacesGetByIdResponse.profiles || [],
            apiGroups: spacesGetByIdResponse.groups || [],
            apiSpaceCalls: spacesGetByIdResponse.calls || [],
            apiSpaceTribunes: spacesGetByIdResponse.tribunes || [],
        }, featureFlags);
    }
    if (spacesGetSettingsResponse) {
        for (const item of spacesGetSettingsResponse.items) {
            const spaceId = Space.resolveId(item.space_id);
            const space = draft.spaces.get(spaceId);
            if (space) {
                space.viewerData.notificationSettings = fromApiNotificationSettings(item.notification_settings);
            }
        }
    }
    return handleUpdates(draft, next);
}
function handleFromSpaceEngineApiHistory(draft, variant, featureFlags) {
    const { spacesGLPHResponse } = variant;
    insertSpaces(draft, spacesGLPHResponse.spaces || [], {
        apiConvos: spacesGLPHResponse.conversations || [],
        apiUsers: spacesGLPHResponse.profiles || [],
        apiGroups: spacesGLPHResponse.groups || [],
        apiSpaceCalls: spacesGLPHResponse.calls || [],
        apiSpaceTribunes: spacesGLPHResponse.tribunes || [],
    }, featureFlags);
    return handleUpdates(draft, {
        kind: 'Batch',
        ts: spacesGLPHResponse.new_ts,
        // К сожалению, АПИ не может сгенерировать нам достаточно подходящие типы,
        // поэтому тут мы вынуждены кастить
        updates: spacesGLPHResponse.history,
    });
}
/**
 * Проверка кэша на наличие всех необходимых данных.
 */
function collectMissingData(draft, next) {
    const spaceIds = new Set();
    const spaceSettingsIds = new Set();
    // ВНИМАНИЕ!
    // Если добавляете сюда новый "массив", то обязательно обновите оптимизацию внизу функции,
    // если это имеет смысл.
    for (const update of next.updates) {
        switch (update[0]) {
            case 80001: {
                switch (update[1]) {
                    case 1: {
                        const [, , rawSpaceId] = update;
                        spaceIds.add(Space.resolveId(rawSpaceId));
                        break;
                    }
                    case 2: {
                        break;
                    }
                    case 3: {
                        const [, , rawSpaceId] = update;
                        const spaceId = Space.resolveId(rawSpaceId);
                        if (draft.spaces.has(spaceId)) {
                            spaceIds.add(spaceId);
                        }
                        break;
                    }
                    default:
                        const _typeguard = update[1];
                }
                break;
            }
            case 80002: {
                switch (update[1]) {
                    case 1: {
                        const [, , rawSpaceId] = update;
                        spaceIds.add(Space.resolveId(rawSpaceId));
                        break;
                    }
                    case 2: {
                        break;
                    }
                    case 3: {
                        const [, , rawSpaceId, rawSectionId] = update;
                        const spaceId = Space.resolveId(rawSpaceId);
                        const space = draft.spaces.get(spaceId);
                        if (!space) {
                            break;
                        }
                        if (space.kind === 'Incomplete') {
                            break;
                        }
                        if (!space.sections.has(Space.resolveSectionId(rawSectionId))) {
                            spaceIds.add(spaceId);
                        }
                        break;
                    }
                    default:
                        const _typeguard = update[1];
                }
                break;
            }
            case 80003: {
                switch (update[1]) {
                    case 1: {
                        const [, , rawSpaceId] = update;
                        spaceIds.add(Space.resolveId(rawSpaceId));
                        break;
                    }
                    case 2: {
                        break;
                    }
                    case 3: {
                        const [, , rawSpaceId, rawRoomId] = update;
                        const spaceId = Space.resolveId(rawSpaceId);
                        const space = draft.spaces.get(spaceId);
                        if (!space) {
                            break;
                        }
                        if (space.kind === 'Incomplete') {
                            break;
                        }
                        if (!space.rooms.has(Space.resolveRoomId(rawRoomId))) {
                            spaceIds.add(spaceId);
                        }
                        break;
                    }
                    default:
                        const _typeguard = update[1];
                }
                break;
            }
            case 80004: {
                const [, , rawSpaceId, rawPeerId] = update;
                const spaceId = Space.resolveId(rawSpaceId);
                const peerId = Peer.resolveId(rawPeerId);
                if (peerId !== draft.viewer.id) {
                    break;
                }
                const space = draft.spaces.get(spaceId);
                switch (update[1]) {
                    case 1: {
                        if (!space?.viewerData.isMember) {
                            spaceIds.add(spaceId);
                        }
                        break;
                    }
                    case 2: {
                        if (space?.viewerData.isMember) {
                            spaceIds.add(spaceId);
                        }
                        break;
                    }
                    default:
                        const _typeguard = update[1];
                }
                break;
            }
            case 80006: {
                const [, , rawSpaceId] = update;
                const spaceId = Space.resolveId(rawSpaceId);
                if (draft.spaces.has(spaceId)) {
                    spaceSettingsIds.add(spaceId);
                }
                break;
            }
            default:
                const _typeguard = update;
        }
    }
    // Оптимизация.
    // Если мы уже перезапрашиваем пространство целиком,
    // то нам нет смысла перезапрашивать отдельыне его части.
    for (const spaceId of spaceIds) {
        spaceSettingsIds.delete(spaceId);
    }
    return { spaceIds, spaceSettingsIds };
}
function handleUpdates(draft, next) {
    draft.spaceConn.status = 'running';
    draft.spaceConn.ts = next.ts;
    const fx = next.updates.flatMap((update) => {
        switch (update[0]) {
            case 80001: {
                return update80001(draft, update);
            }
            case 80002: {
                return update80002(draft, update);
            }
            case 80003: {
                return update80003(draft, update);
            }
            case 80004: {
                return update80004(draft, update);
            }
            case 80006: {
                return update80006(draft, update);
            }
            default:
                const _typeguard = update;
                return [];
        }
    });
    return [
        async function pollSpaceEngine({ spaceEngine }) {
            if (!spaceEngine) {
                return {
                    type: 'Noop',
                };
            }
            return {
                type: 'SpaceEngineBatchReceived',
                variant: {
                    kind: 'FromSpaceEngine',
                    next: await spaceEngine.poll(),
                },
            };
        },
        ...fx,
    ];
}
function update80001(draft, update) {
    const [, , rawSpaceId] = update;
    const spaceId = Space.resolveId(rawSpaceId);
    switch (update[1]) {
        case 1:
        case 3: {
            return [];
        }
        case 2: {
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            if (space.kind === 'Incomplete') {
                return [];
            }
            for (const room of space.rooms.values()) {
                draft.convos.delete(room.relatedEntity.peerId);
            }
            draft.spaces.delete(spaceId);
            return [];
        }
        default:
            const _typeguard = update[1];
            return [];
    }
}
function update80002(draft, update) {
    const [, , rawSpaceId, rawSectionid] = update;
    const spaceId = Space.resolveId(rawSpaceId);
    const sectionId = Space.resolveSectionId(rawSectionid);
    switch (update[1]) {
        case 1:
        case 3: {
            return [];
        }
        case 2: {
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            if (space.kind === 'Incomplete') {
                return [];
            }
            space.sections.delete(sectionId);
            return [];
        }
        default:
            const _typeguard = update[1];
            return [];
    }
}
function update80003(draft, update) {
    const [, , rawSpaceId, rawRoomId] = update;
    const spaceId = Space.resolveId(rawSpaceId);
    const roomId = Space.resolveRoomId(rawRoomId);
    switch (update[1]) {
        case 1:
        case 3: {
            return [];
        }
        case 2: {
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            if (space.kind === 'Incomplete') {
                return [];
            }
            const room = space.rooms.get(roomId);
            if (!room) {
                return [];
            }
            draft.convos.delete(room.relatedEntity.peerId);
            space.rooms.delete(roomId);
            return [];
        }
        default:
            const _typeguard = update[1];
            return [];
    }
}
function update80004(draft, update) {
    const [, , rawSpaceId, rawPeerId, newCount] = update;
    const spaceId = Space.resolveId(rawSpaceId);
    const peerId = Peer.resolveId(rawPeerId);
    const space = draft.spaces.get(spaceId);
    if (!space) {
        return [];
    }
    switch (update[1]) {
        case 1: {
            Space.addMember(space, peerId, newCount);
            break;
        }
        case 2: {
            Space.removeMember(space, peerId, newCount);
            break;
        }
        default:
            const _typeguard = update[1];
    }
    space.membersCount = newCount;
    return [];
}
function update80006(_draft, _update) {
    return [];
}
//# sourceMappingURL=SpaceEngineBatchReceived.js.map