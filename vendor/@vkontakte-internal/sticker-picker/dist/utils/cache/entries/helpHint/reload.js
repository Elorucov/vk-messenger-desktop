import { AtomNameByHelpHintId, HelpHintAtomNames, } from '../../../../model/helpHint/helpHint';
export async function reloadHelpHint() {
    // имена всех атомов для хелп хинтов
    let atomNamesForClear = HelpHintAtomNames.slice();
    let helpHints = null;
    try {
        helpHints = await this.options.api.account.getHelpHints({ categories: 'vmoji_promo' });
    }
    catch { }
    if (!helpHints?.items) {
        this.clearAllHelpHint();
        return true;
    }
    // бегаем по хелп хинтам и обновляем хранилища, если пришли данные
    helpHints.items.forEach((item) => {
        const id = item.id;
        const atomName = AtomNameByHelpHintId[id];
        if (atomName in this) {
            this[atomName]?.set(item, { notify: true });
            atomNamesForClear = atomNamesForClear.filter((name) => name !== atomName);
        }
    });
    // если по хинту не пришли данные, то очищаем его хранилище
    atomNamesForClear.forEach((atomName) => {
        this[atomName].delete();
    });
    return true;
}
//# sourceMappingURL=reload.js.map