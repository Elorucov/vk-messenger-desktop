var Status;
(function (Status) {
    Status["ERROR"] = "error";
    Status["SUCCESS"] = "success";
    Status["PENDING"] = "pending";
})(Status || (Status = {}));
export function wrapSuspense(promise) {
    let status = Status.PENDING;
    let response;
    const suspender = promise
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .then((data) => {
        response = data;
        status = Status.SUCCESS;
    })
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .catch((error) => {
        response = error;
        status = Status.ERROR;
    });
    const read = () => {
        switch (status) {
            case Status.SUCCESS:
                return response;
            case Status.PENDING:
                throw suspender;
            case Status.ERROR:
                throw response;
        }
    };
    return { read };
}
//# sourceMappingURL=wrapSuspense.js.map