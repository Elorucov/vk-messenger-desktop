import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
export const handler = (draft, action) => {
    const { groupId, requestCompletedUICallback } = action;
    const group_id = Peer.toRealId(groupId);
    switch (action.type) {
        case 'LoadCommunityTemplates': {
            if (draft.locks.getCommunityTemplates) {
                return [];
            }
            draft.locks.getCommunityTemplates = true;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.getTemplates', {
                            group_id,
                            extended: 0,
                            sort: 'create_time',
                        });
                        return {
                            type: 'LoadCommunityTemplates_RequestCompleted',
                            response: {
                                ...response,
                                items: response.items.reverse(),
                            },
                            groupId,
                            hasFailed: !response?.items,
                            requestCompletedUICallback,
                        };
                    }
                    catch {
                        return {
                            type: 'LoadCommunityTemplates_RequestCompleted',
                            response: null,
                            groupId,
                            hasFailed: true,
                            requestCompletedUICallback,
                        };
                    }
                },
            ];
        }
        case 'LoadCommunityTemplates_RequestCompleted': {
            draft.locks.getCommunityTemplates = false;
            const { hasFailed, response } = action;
            requestCompletedUICallback(hasFailed);
            if (hasFailed || !response?.items) {
                return [];
            }
            draft.communityTemplates = response.items;
            return [];
        }
        case 'DeleteCommunityTemplate': {
            const { templateId } = action;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.deleteTemplate', {
                            group_id,
                            template_id: templateId,
                        });
                        return {
                            type: 'DeleteCommunityTemplate_RequestCompleted',
                            response,
                            groupId,
                            templateId,
                            hasFailed: !response,
                            requestCompletedUICallback,
                        };
                    }
                    catch {
                        return {
                            type: 'DeleteCommunityTemplate_RequestCompleted',
                            response: null,
                            groupId,
                            templateId,
                            hasFailed: true,
                            requestCompletedUICallback,
                        };
                    }
                },
            ];
        }
        case 'DeleteCommunityTemplate_RequestCompleted': {
            const { templateId, hasFailed } = action;
            requestCompletedUICallback(hasFailed);
            if (hasFailed) {
                return [];
            }
            if (draft.communityTemplates) {
                draft.communityTemplates = draft.communityTemplates.filter((template) => template.id !== templateId);
            }
            return [];
        }
        case 'EditCommunityTemplate': {
            const { templateId, name, text } = action;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.editTemplate', {
                            group_id,
                            template_id: templateId,
                            name,
                            text,
                        });
                        return {
                            type: 'EditCommunityTemplate_RequestCompleted',
                            response,
                            groupId,
                            templateId,
                            name,
                            text,
                            hasFailed: !response,
                            requestCompletedUICallback,
                        };
                    }
                    catch {
                        return {
                            type: 'EditCommunityTemplate_RequestCompleted',
                            response: null,
                            groupId,
                            templateId,
                            name,
                            text,
                            hasFailed: true,
                            requestCompletedUICallback,
                        };
                    }
                },
            ];
        }
        case 'EditCommunityTemplate_RequestCompleted': {
            const { hasFailed, templateId, name, text } = action;
            requestCompletedUICallback(hasFailed);
            if (hasFailed) {
                return [];
            }
            if (draft.communityTemplates) {
                draft.communityTemplates = draft.communityTemplates.map((template) => {
                    if (template.id === templateId) {
                        return { ...template, name, text };
                    }
                    return template;
                });
            }
            return [];
        }
        case 'AddCommunityTemplate': {
            const { name, text } = action;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.addTemplate', {
                            group_id,
                            name,
                            text,
                        });
                        return {
                            type: 'AddCommunityTemplate_RequestCompleted',
                            response,
                            groupId,
                            name,
                            text,
                            hasFailed: !response?.template_id,
                            requestCompletedUICallback,
                        };
                    }
                    catch {
                        return {
                            type: 'AddCommunityTemplate_RequestCompleted',
                            response: null,
                            groupId,
                            name,
                            text,
                            hasFailed: true,
                            requestCompletedUICallback,
                        };
                    }
                },
            ];
        }
        case 'AddCommunityTemplate_RequestCompleted': {
            const { hasFailed, groupId, name, text, response } = action;
            requestCompletedUICallback(hasFailed);
            if (hasFailed || !response?.template_id) {
                return [];
            }
            if (draft.communityTemplates) {
                draft.communityTemplates.unshift({
                    id: response.template_id,
                    name,
                    text,
                    creation_time: Date.now(),
                    creator_id: groupId,
                    usages_all_time: 0,
                    usages_week: 0,
                });
            }
            else {
                draft.communityTemplates = [
                    {
                        id: response.template_id,
                        name,
                        text,
                        creation_time: Date.now(),
                        creator_id: groupId,
                        usages_all_time: 0,
                        usages_week: 0,
                    },
                ];
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=CommunityTemplates.js.map