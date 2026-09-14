export async function hideHelpHint(id) {
    this.clearHelpHintById(id);
    try {
        const result = await this.options.api.account.hideHelpHint({ hint_id: id });
        return Boolean(result);
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=hide.js.map