export function fromApiOrganization(item) {
    return {
        userRole: {
            id: item.role.name,
            title: item.role.title,
        },
        name: item.organization_name,
    };
}
export function fromApiOrganizationGroup(item) {
    return {
        organization: {
            name: item.title,
            id: item.organization_id,
        },
        peerIds: item.peers,
    };
}
//# sourceMappingURL=OrganizationConverter.js.map