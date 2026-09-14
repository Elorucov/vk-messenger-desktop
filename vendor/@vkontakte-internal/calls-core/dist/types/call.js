// Call UI modes
export var UIMode;
(function (UIMode) {
    UIMode["DEFAULT"] = "default";
    UIMode["COLLAPSED"] = "collapsed";
    UIMode["FULLSCREEN"] = "fullscreen";
})(UIMode || (UIMode = {}));
// Application mode types
export var Mode;
(function (Mode) {
    Mode[Mode["READY"] = 0] = "READY";
    Mode[Mode["CALL"] = 1] = "CALL";
    Mode[Mode["INCOMING"] = 2] = "INCOMING";
    Mode[Mode["JOIN"] = 3] = "JOIN";
    Mode[Mode["ERROR"] = 4] = "ERROR";
    Mode[Mode["FEEDBACK"] = 5] = "FEEDBACK";
    Mode[Mode["START"] = 6] = "START";
    Mode[Mode["CALL_BY"] = 7] = "CALL_BY";
    Mode[Mode["CREATE_CALL"] = 8] = "CREATE_CALL";
    Mode[Mode["BLOCK"] = 9] = "BLOCK";
})(Mode || (Mode = {}));
export var ECallViewMode;
(function (ECallViewMode) {
    /** режим пир-2пир */
    ECallViewMode[ECallViewMode["P2P"] = 0] = "P2P";
    /** свернутое окно звонка */
    ECallViewMode[ECallViewMode["Collapsed"] = 1] = "Collapsed";
    /** режим оратора */
    ECallViewMode[ECallViewMode["Orator"] = 2] = "Orator";
    /** режим грида */
    ECallViewMode[ECallViewMode["Grid"] = 3] = "Grid";
})(ECallViewMode || (ECallViewMode = {}));
//# sourceMappingURL=call.js.map