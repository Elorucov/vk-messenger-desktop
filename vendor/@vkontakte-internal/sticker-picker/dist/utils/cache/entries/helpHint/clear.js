import { AtomNameByHelpHintId, HelpHintAtomNames, } from '../../../../model/helpHint/helpHint';
export function clearHelpHintById(id) {
    this[AtomNameByHelpHintId[id]]?.delete();
}
export function clearAllHelpHint() {
    HelpHintAtomNames.forEach((atomName) => this[atomName].delete());
}
//# sourceMappingURL=clear.js.map