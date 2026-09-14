export function fromApiConversationsBar(apiConversationsBar) {
    return {
        name: apiConversationsBar.name,
        icon: apiConversationsBar.icon,
        text: apiConversationsBar.text,
        canHide: Boolean(apiConversationsBar.can_hide),
        ...(apiConversationsBar.title && { title: apiConversationsBar.title }),
        ...(apiConversationsBar.icon && { icon: apiConversationsBar.icon }),
        buttons: (apiConversationsBar.buttons || []).map((button) => {
            return {
                layout: button.layout,
                text: button.text,
                type: button.type,
                link: button.link,
                hideOnAction: Boolean(button.hide_on_action),
            };
        }),
    };
}
//# sourceMappingURL=ConversationsBarConverter.js.map