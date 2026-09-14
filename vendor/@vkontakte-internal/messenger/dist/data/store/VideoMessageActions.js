import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'VideoMessageShapesGetById': {
            const { shapeId } = action;
            if (draft.locks.getVideoMessageShapesById.has(shapeId)) {
                return [];
            }
            if (draft.videoMessageShapes?.has(shapeId)) {
                return [];
            }
            draft.locks.getVideoMessageShapesById.add(shapeId);
            return [
                async function getVideoMessageShapeById({ api, storage }) {
                    // Если случилась такая ситуация, что запустился запрос VideomessageShapesGetById
                    // значит в Storage точно не актуальная версия videomessage-shapes
                    const storageShapes = storage.get('videomessage-shapes');
                    if (storageShapes) {
                        storageShapes.expiresAt = 0;
                    }
                    try {
                        const response = await api.fetch('messages.getVideoMessageShapesByIds', {
                            ids: shapeId.toString(),
                        });
                        return {
                            type: 'VideoMessageShapesGetById__RequestCompleted',
                            shapeId,
                            response,
                            hasFailed: !Boolean(response),
                        };
                    }
                    catch {
                        return {
                            type: 'VideoMessageShapesGetById__RequestCompleted',
                            shapeId,
                            response: null,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'VideoMessageShapesGetById__RequestCompleted': {
            const { response, shapeId } = action;
            draft.locks.getVideoMessageShapesById.delete(shapeId);
            if (!response) {
                return [];
            }
            const newShapes = response.shapes.reduce((result, value) => {
                result.set(value.id, value.raw_path);
                return result;
            }, new Map());
            draft.videoMessageShapes = new Map([
                ...(draft.videoMessageShapes ?? []),
                ...newShapes,
            ]);
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=VideoMessageActions.js.map