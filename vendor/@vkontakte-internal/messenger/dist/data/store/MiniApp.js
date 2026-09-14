import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'MiniAppConfiguration': {
            const { webviewUrl } = action;
            draft.miniAppConfiguration = { webviewUrl };
            return [];
        }
        case 'MiniAppConfiguration_Reset': {
            draft.miniAppConfiguration = undefined;
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=MiniApp.js.map